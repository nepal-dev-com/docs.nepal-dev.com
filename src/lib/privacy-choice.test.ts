import { describe, expect, test } from 'bun:test';
import {
  type Choice,
  choiceLine,
  consentScript,
  expiredCookies,
  lapseMs,
  parseChoice,
  parseMeasurementId,
  shouldAsk,
  startingConsent,
  storageKey,
  withoutQuery,
} from './privacy-choice';

const now = new Date('2026-11-04T12:00:00Z');
const stored = (analytics: string, at: string) => JSON.stringify({ analytics, at });

describe('parseMeasurementId (ADR-0041 decision 4)', () => {
  test('reads a GA4 measurement ID', () => {
    expect(parseMeasurementId('G-AB12CD34EF')).toBe('G-AB12CD34EF');
  });

  test('is off when unset or empty', () => {
    expect(parseMeasurementId(undefined)).toBeUndefined();
    expect(parseMeasurementId('')).toBeUndefined();
  });

  test('refuses anything else, naming the variable', () => {
    for (const value of [' ', 'UA-12345-1', 'G-', 'g-ab12cd34', "G-AB12'); alert(1); ('", 'G-AB12</script>', 'AW-123456']) {
      expect(() => parseMeasurementId(value)).toThrow('NEXT_PUBLIC_GA_MEASUREMENT_ID');
    }
  });
});

describe('parseChoice (ADR-0041 decision 7)', () => {
  test('reads an allow or a decline under 12 months old', () => {
    expect(parseChoice(stored('granted', '2026-06-01T09:00:00Z'), now)).toEqual({
      analytics: 'granted',
      at: '2026-06-01T09:00:00Z',
    });
    expect(parseChoice(stored('denied', '2026-11-04T11:00:00Z'), now)?.analytics).toBe('denied');
  });

  test('lapses after 12 months', () => {
    const old = new Date(now.getTime() - lapseMs - 1000).toISOString();
    expect(parseChoice(stored('granted', old), now)).toBeUndefined();
  });

  test('treats anything malformed as no choice', () => {
    for (const raw of [null, '', 'granted', '{', '[]', 'null', stored('yes', '2026-11-01T00:00:00Z'), stored('granted', 'soon'), JSON.stringify({ analytics: 'granted' })]) {
      expect(parseChoice(raw, now)).toBeUndefined();
    }
  });

  test('treats a date in the future as no choice', () => {
    expect(parseChoice(stored('granted', '2027-01-01T00:00:00Z'), now)).toBeUndefined();
  });
});

describe('who is asked and what starts granted (ADR-0041 decisions 5, 6, 8)', () => {
  const allowed: Choice = { analytics: 'granted', at: '2026-11-01T00:00:00Z' };
  const declined: Choice = { analytics: 'denied', at: '2026-11-01T00:00:00Z' };

  test('asks only with no choice and no Global Privacy Control', () => {
    expect(shouldAsk(undefined, false)).toBe(true);
    expect(shouldAsk(undefined, true)).toBe(false);
    expect(shouldAsk(allowed, false)).toBe(false);
    expect(shouldAsk(declined, false)).toBe(false);
  });

  test('starts granted only with a stored allow', () => {
    expect(startingConsent(undefined)).toBe('denied');
    expect(startingConsent(declined)).toBe('denied');
    expect(startingConsent(allowed)).toBe('granted');
  });
});

describe('consentScript (ADR-0041 decisions 4 and 5)', () => {
  type Call = unknown[];
  const run = (raw: string | null, options: { gpc?: boolean; storageThrows?: boolean } = {}) => {
    const dataLayer: Call[] = [];
    const window: Record<string, unknown> = { dataLayer };
    const localStorage = {
      getItem(key: string) {
        if (options.storageThrows) {
          throw new Error('blocked');
        }
        return key === storageKey ? raw : null;
      },
    };
    const navigator = { globalPrivacyControl: options.gpc ?? false };
    new Function('window', 'localStorage', 'navigator', 'Date', `with (window) { ${consentScript('G-AB12CD34EF')} }`)(
      window,
      localStorage,
      navigator,
      class extends Date {
        constructor(value?: number | string) {
          super(value ?? now.getTime());
        }
        static now() {
          return now.getTime();
        }
      },
    );
    return dataLayer.map((args) => Array.from(args as unknown as ArrayLike<unknown>));
  };
  const consentOf = (calls: Call[]) => (calls[0][2] as Record<string, string>).analytics_storage;

  test('queues the consent default before anything else, and config last', () => {
    const calls = run(null);
    expect(calls.map((call) => call[0])).toEqual(['consent', 'set', 'js', 'config']);
    expect(calls[0].slice(0, 2)).toEqual(['consent', 'default']);
    expect(calls[0][2]).toEqual({
      analytics_storage: 'denied',
      ad_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied',
    });
    expect(calls[1]).toEqual(['set', 'ads_data_redaction', true]);
    expect(calls[3]).toEqual([
      'config',
      'G-AB12CD34EF',
      { allow_google_signals: false, allow_ad_personalization_signals: false },
    ]);
  });

  test('pushes real arguments objects, which gtag.js requires', () => {
    const dataLayer: unknown[] = [];
    new Function('window', 'localStorage', 'navigator', `with (window) { ${consentScript('G-AB12CD34EF')} }`)(
      { dataLayer },
      { getItem: () => null },
      {},
    );
    expect(Object.prototype.toString.call(dataLayer[0])).toBe('[object Arguments]');
  });

  test('matches parseChoice and startingConsent for every stored value, with or without GPC', () => {
    const lapsed = new Date(now.getTime() - lapseMs - 1000).toISOString();
    const cases: [string | null, boolean][] = [
      [null, false],
      [null, true],
      [stored('granted', '2026-10-01T00:00:00Z'), false],
      [stored('granted', '2026-10-01T00:00:00Z'), true],
      [stored('denied', '2026-10-01T00:00:00Z'), false],
      [stored('granted', lapsed), false],
      [stored('granted', '2027-01-01T00:00:00Z'), false],
      [stored('granted', 'soon'), false],
      ['{', false],
    ];
    for (const [raw, gpc] of cases) {
      expect(consentOf(run(raw, { gpc }))).toBe(startingConsent(parseChoice(raw, now)));
    }
  });

  test('stays denied when storage is blocked', () => {
    expect(consentOf(run(stored('granted', '2026-10-01T00:00:00Z'), { storageThrows: true }))).toBe('denied');
  });
});

describe('expiredCookies (ADR-0041 decision 6)', () => {
  test('expires every GA cookie on the host and each parent domain', () => {
    const cookies = expiredCookies('_ga=GA1.1.1; theme=dark; _ga_AB12CD34EF=GS1.1; _gid=x', 'docs.nepal-dev.com');
    for (const name of ['_ga', '_ga_AB12CD34EF']) {
      expect(cookies).toContain(`${name}=; Max-Age=0; Path=/`);
      expect(cookies).toContain(`${name}=; Max-Age=0; Path=/; Domain=docs.nepal-dev.com`);
      expect(cookies).toContain(`${name}=; Max-Age=0; Path=/; Domain=nepal-dev.com`);
    }
    expect(cookies.join()).not.toContain('Domain=com');
    expect(cookies.join()).not.toContain('theme');
    expect(cookies.join()).not.toContain('_gid');
  });

  test('expires nothing when no GA cookie is set', () => {
    expect(expiredCookies('', 'localhost')).toEqual([]);
    expect(expiredCookies('theme=dark', 'localhost')).toEqual([]);
  });
});

describe('withoutQuery (ADR-0041 decision 2)', () => {
  test('drops the query string and keeps the path and fragment', () => {
    expect(withoutQuery('https://docs.nepal-dev.com/atlas/use?q=install&utm=x#verse')).toBe('https://docs.nepal-dev.com/atlas/use#verse');
    expect(withoutQuery('https://docs.nepal-dev.com/')).toBe('https://docs.nepal-dev.com/');
  });

  test('leaves a value that is not a URL as it is', () => {
    expect(withoutQuery('not a url')).toBe('not a url');
  });
});

describe('choiceLine (ADR-0041 decision 9)', () => {
  test('says the current choice and its date', () => {
    expect(choiceLine({ analytics: 'granted', at: '2026-11-04T12:00:00Z' })).toBe('You allowed analytics on 4 Nov 2026.');
    expect(choiceLine({ analytics: 'denied', at: '2026-03-15T12:00:00Z' })).toBe('You declined analytics on 15 Mar 2026.');
  });

  test('says nothing without a choice', () => {
    expect(choiceLine(undefined)).toBeUndefined();
  });
});
