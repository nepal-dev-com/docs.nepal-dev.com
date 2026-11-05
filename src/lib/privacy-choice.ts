/** The reader's analytics choice and the consent Google Analytics starts from (ADR-0041). */

export type Consent = 'granted' | 'denied';

export interface Choice {
  analytics: Consent;
  /** When the reader chose, as an ISO date. */
  at: string;
}

export const storageKey = 'ndv-privacy-choice';

/** Twelve months, counted as 365 days so the inline script and this module agree to the millisecond. */
export const lapseMs = 365 * 24 * 60 * 60 * 1000;

/** Dispatched on `window` by the footer's Privacy choices button to reopen the banner. */
export const reopenEvent = 'ndv:privacy-choices';

/** ADR-0041 decision 4: the ID is written into an inline script, so nothing but a GA4 ID gets through. */
export function parseMeasurementId(value: string | undefined): string | undefined {
  if (value === undefined || value === '') {
    return undefined;
  }
  if (!/^G-[A-Z0-9]{4,20}$/.test(value)) {
    throw new Error(`NEXT_PUBLIC_GA_MEASUREMENT_ID must be a GA4 measurement ID, G- followed by capital letters and digits: ${value}`);
  }
  return value;
}

export const measurementId = parseMeasurementId(process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID);

export function parseChoice(raw: string | null, now: Date): Choice | undefined {
  if (!raw) {
    return undefined;
  }
  let value: unknown;
  try {
    value = JSON.parse(raw);
  } catch {
    return undefined;
  }
  if (typeof value !== 'object' || value === null) {
    return undefined;
  }
  const { analytics, at } = value as Record<string, unknown>;
  if ((analytics !== 'granted' && analytics !== 'denied') || typeof at !== 'string') {
    return undefined;
  }
  const age = now.getTime() - Date.parse(at);
  if (!(age >= 0 && age < lapseMs)) {
    return undefined;
  }
  return { analytics, at };
}

/** ADR-0041 decisions 6 and 8: Global Privacy Control declines without asking. */
export function shouldAsk(choice: Choice | undefined, globalPrivacyControl: boolean): boolean {
  return !choice && !globalPrivacyControl;
}

/** Only a stored allow grants. It outranks Global Privacy Control, since the reader gave it from the footer (decision 8). */
export function startingConsent(choice: Choice | undefined): Consent {
  return choice?.analytics === 'granted' ? 'granted' : 'denied';
}

/**
 * The inline script that runs before gtag.js (ADR-0041 decisions 4 and 5). gtag.js replays the queue in order, so the
 * consent default always precedes the first hit. It repeats `parseChoice` and `startingConsent` in plain ES5, and the
 * tests hold the two to the same answers.
 */
export function consentScript(id: string): string {
  const key = JSON.stringify(storageKey);
  return [
    'window.dataLayer=window.dataLayer||[];',
    'function gtag(){window.dataLayer.push(arguments);}',
    'window.gtag=gtag;',
    "var analytics='denied';",
    `try{var c=JSON.parse(localStorage.getItem(${key}));`,
    "var age=c&&typeof c.at==='string'?Date.now()-Date.parse(c.at):NaN;",
    `if(c&&c.analytics==='granted'&&age>=0&&age<${lapseMs})analytics='granted';}catch(e){}`,
    "gtag('consent','default',{analytics_storage:analytics,ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied'});",
    "gtag('set','ads_data_redaction',true);",
    "gtag('js',new Date());",
    `gtag('config',${JSON.stringify(id)},{allow_google_signals:false,allow_ad_personalization_signals:false});`,
  ].join('');
}

/**
 * The `document.cookie` assignments that remove GA's cookies (decision 6). GA sets them on the highest domain it can,
 * which the page cannot read back, so each parent domain is tried.
 */
export function expiredCookies(cookie: string, hostname: string): string[] {
  const names = cookie
    .split(';')
    .map((part) => part.trim().split('=')[0])
    .filter((name) => /^_ga(_[A-Za-z0-9]+)?$/.test(name));
  const parts = hostname.split('.');
  const isAddress = /^[\d.]+$/.test(hostname) || hostname.includes(':');
  const domains = isAddress ? [] : parts.slice(0, -1).map((_, i) => parts.slice(i).join('.'));
  return names.flatMap((name) => [
    `${name}=; Max-Age=0; Path=/`,
    ...domains.map((domain) => `${name}=; Max-Age=0; Path=/; Domain=${domain}`),
  ]);
}

/** ADR-0041 decision 2: Vercel keeps no query string. */
export function withoutQuery(value: string): string {
  try {
    const url = new URL(value);
    url.search = '';
    return url.toString();
  } catch {
    return value;
  }
}

const dateFormat = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

export function choiceLine(choice: Choice | undefined): string | undefined {
  if (!choice) {
    return undefined;
  }
  const verb = choice.analytics === 'granted' ? 'allowed' : 'declined';
  return `You ${verb} analytics on ${dateFormat.format(new Date(choice.at))}.`;
}
