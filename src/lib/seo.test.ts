import { describe, expect, test } from 'bun:test';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { Level } from './scale-strip';
import {
  breadcrumbJsonLd,
  homeJsonLd,
  pageJsonLd,
  pageMetadata,
  pageTitle,
  parseSiteUrl,
  robotsRules,
  searchRule,
  serializeJsonLd,
  shareColors,
  shortenDescription,
  sitemapEntries,
  skySeed,
  titleSize,
} from './seo';

const site = new URL('https://docs.puncoz.com');

describe('parseSiteUrl (ADR-0035 decision 1)', () => {
  test('reads an https origin', () => {
    expect(parseSiteUrl('https://docs.puncoz.com')?.origin).toBe('https://docs.puncoz.com');
    expect(parseSiteUrl('https://docs.puncoz.com/')?.origin).toBe('https://docs.puncoz.com');
  });

  test('unset or empty means no public address', () => {
    expect(parseSiteUrl(undefined)).toBeUndefined();
    expect(parseSiteUrl('')).toBeUndefined();
  });

  test('refuses anything but an https origin, naming the variable', () => {
    for (const value of ['docs.puncoz.com', 'http://docs.puncoz.com', 'https://docs.puncoz.com/docs', 'https://docs.puncoz.com?x=1']) {
      expect(() => parseSiteUrl(value)).toThrow('SITE_URL');
    }
  });
});

describe('searchRule (ADR-0035 decision 3)', () => {
  const place = (extra: object) => ({ url: '/lodestar/use/v3.2/install', path: 'lodestar/use/v3/install.mdx', ...extra });

  test('the home page, an overview and a page with no lines are their own canonical', () => {
    expect(searchRule({ url: '/', path: '' }, site)).toEqual({ index: true, canonical: '/', inSitemap: true });
    expect(searchRule({ url: '/docs', path: 'docs/index.mdx' }, site).canonical).toBe('/docs');
    expect(searchRule({ url: '/acme/use/start', path: 'acme/use/start.mdx' }, site).inSitemap).toBe(true);
  });

  test('the latest line and Maintain are indexed', () => {
    expect(searchRule(place({ channel: 'latest' }), site)).toEqual({ index: true, canonical: '/lodestar/use/v3.2/install', inSitemap: true });
    expect(searchRule({ url: '/docs/maintain/adr', path: 'docs/maintain/adr/index.mdx' }, site).index).toBe(true);
  });

  test('an older page points at the same page in latest, and leaves the sitemap', () => {
    const rule = searchRule(place({ url: '/lodestar/use/2.x-lts/install', channel: 'legacy', latestCounterpart: '/lodestar/use/v3.2/install' }), site);
    expect(rule).toEqual({ index: true, canonical: '/lodestar/use/v3.2/install', inSitemap: false });
  });

  test('an older page with no counterpart stays findable', () => {
    const rule = searchRule(place({ url: '/lodestar/use/2.x-lts/old', channel: 'legacy' }), site);
    expect(rule).toEqual({ index: true, canonical: '/lodestar/use/2.x-lts/old', inSitemap: true });
  });

  test('dev and templates are noindex, with no canonical', () => {
    expect(searchRule(place({ url: '/lodestar/use/dev/install', channel: 'dev' }), site)).toEqual({ index: false, inSitemap: false });
    expect(searchRule({ url: '/docs/maintain/_templates/adr', path: 'docs/maintain/_templates/adr.mdx' }, site)).toEqual({ index: false, inSitemap: false });
  });

  test('a folder only named like a template is an ordinary page', () => {
    expect(searchRule({ url: '/x/maintain/my_templates/a', path: 'x/maintain/my_templates/a.mdx' }, site).index).toBe(true);
  });

  test('with no address nothing is indexed (decision 2)', () => {
    expect(searchRule({ url: '/', path: '' }, undefined)).toEqual({ index: false, inSitemap: false });
    expect(searchRule(place({ channel: 'latest' }), undefined)).toEqual({ index: false, inSitemap: false });
  });
});

describe('pageTitle (ADR-0035 decision 7)', () => {
  const lodestar = { title: 'lodestar', overview: false };

  test('names the page, the entry and the site', () => {
    expect(pageTitle({ title: 'Install', entry: lodestar.title })).toBe('Install — lodestar — Puncoz Verse');
  });

  test('an overview names the entry and the site', () => {
    expect(pageTitle({ title: 'Anything', entry: 'lodestar', overview: true })).toBe('lodestar — Puncoz Verse');
  });

  test('an older line and dev say which, and latest does not', () => {
    expect(pageTitle({ title: 'Install', entry: 'lodestar', line: { name: '2.x LTS', channel: 'legacy' } })).toBe('Install — lodestar 2.x LTS — Puncoz Verse');
    expect(pageTitle({ title: 'Install', entry: 'lodestar', line: { name: 'dev', channel: 'dev' } })).toBe('Install — lodestar dev — Puncoz Verse');
    expect(pageTitle({ title: 'Install', entry: 'lodestar', line: { name: 'v3.2', channel: 'latest' } })).toBe('Install — lodestar — Puncoz Verse');
  });

  test('a page with no entry names only itself and the site', () => {
    expect(pageTitle({ title: 'Install' })).toBe('Install — Puncoz Verse');
  });
});

describe('pageMetadata (ADR-0035 decision 9)', () => {
  const input = {
    title: 'Install — lodestar — Puncoz Verse',
    description: 'Add lodestar to a project.',
    url: '/lodestar/use/v3.2/install',
    rule: { index: true, canonical: '/lodestar/use/v3.2/install', inSitemap: true },
    type: 'article' as const,
    imageUrl: '/og/lodestar/use/v3.2/install/image.png',
    imageAlt: 'Install',
    markdownUrl: '/lodestar/use/v3.2/install.md',
    modified: new Date('2026-11-01T00:00:00Z'),
  };
  const meta = pageMetadata(input);

  test('carries the canonical link and the Markdown alternate', () => {
    expect(meta.alternates).toEqual({ canonical: input.url, types: { 'text/markdown': input.markdownUrl } });
  });

  test('an indexed page allows a large image preview', () => {
    expect(meta.robots).toEqual({ index: true, follow: true, 'max-image-preview': 'large' });
  });

  test('a noindex page has no canonical and is still followed', () => {
    const hidden = pageMetadata({ ...input, rule: { index: false, inSitemap: false } });
    expect(hidden.robots).toEqual({ index: false, follow: true });
    expect(hidden.alternates?.canonical).toBeUndefined();
  });

  test('Open Graph holds the words, the image and the date', () => {
    expect(meta.openGraph).toMatchObject({
      title: input.title,
      description: input.description,
      url: input.url,
      siteName: 'Puncoz Verse',
      type: 'article',
      modifiedTime: '2026-11-01T00:00:00.000Z',
      images: [{ url: input.imageUrl, width: 1200, height: 630, type: 'image/png', alt: 'Install' }],
    });
  });

  test('an older page shares the address of the page it points at', () => {
    const older = pageMetadata({ ...input, url: '/lodestar/use/2.x-lts/install' });
    expect(older.openGraph?.url).toBe(input.url);
  });

  test('a website has no article fields', () => {
    const home = pageMetadata({ ...input, type: 'website', modified: undefined });
    expect(home.openGraph).toMatchObject({ type: 'website' });
    expect(home.openGraph).not.toHaveProperty('modifiedTime');
  });

  test('has a large Twitter card with no handle, and no keywords', () => {
    expect(meta.twitter).toMatchObject({ card: 'summary_large_image', title: input.title, images: [input.imageUrl] });
    expect(meta.twitter).not.toHaveProperty('site');
    expect(meta).not.toHaveProperty('keywords');
  });
});

describe('robotsRules (ADR-0035 decisions 2 and 4)', () => {
  test('allows everyone and names the sitemap', () => {
    expect(robotsRules(site)).toEqual({
      rules: { userAgent: '*', allow: '/' },
      sitemap: 'https://docs.puncoz.com/sitemap.xml',
    });
  });

  test('with no address it disallows everything and names no sitemap', () => {
    expect(robotsRules(undefined)).toEqual({ rules: { userAgent: '*', disallow: '/' } });
  });
});

describe('sitemapEntries (ADR-0035 decision 5)', () => {
  const when = new Date('2026-11-01T00:00:00Z');
  const pages = [
    { url: '/docs', rule: { index: true, canonical: '/docs', inSitemap: true }, modified: when },
    { url: '/x/use/dev/a', rule: { index: false, inSitemap: false } },
    { url: '/x/use/2.x/a', rule: { index: true, canonical: '/x/use/3.x/a', inSitemap: false } },
    { url: '/x/use/3.x/a', rule: { index: true, canonical: '/x/use/3.x/a', inSitemap: true } },
  ];

  test('lists the home page and the marked pages, absolute, with lastmod only when known', () => {
    expect(sitemapEntries(pages, site)).toEqual([
      { url: 'https://docs.puncoz.com/' },
      { url: 'https://docs.puncoz.com/docs', lastModified: when },
      { url: 'https://docs.puncoz.com/x/use/3.x/a' },
    ]);
  });

  test('is empty with no address', () => {
    expect(sitemapEntries(pages, undefined)).toEqual([]);
  });
});

describe('structured data (ADR-0035 decision 10)', () => {
  const graphTypes = (data: { '@graph': { '@type': string }[] }) => data['@graph'].map((node) => node['@type']);

  test('the home page has WebSite and the owner, and no SearchAction', () => {
    const data = homeJsonLd('A description.', site);
    expect(graphTypes(data)).toEqual(['WebSite', 'Person']);
    expect(data['@graph'][1]).toMatchObject({ name: 'Puncoz Nepal', sameAs: ['https://github.com/puncoz'] });
    expect(JSON.stringify(data)).not.toContain('SearchAction');
  });

  const levels: Level[] = [
    { kind: 'verse', name: 'Verse', url: '/#verse' },
    { kind: 'system', name: 'System', url: '/' },
    { kind: 'planet', name: 'lodestar', url: '/lodestar' },
    { kind: 'side', name: 'Use', url: '/lodestar/use/v3.2', track: 'use' },
    { kind: 'orbit', name: 'Guides' },
    { kind: 'page', name: 'Start', current: true },
  ];

  test('breadcrumbs use plain names, not space words, and skip a level with no page', () => {
    const crumbs = breadcrumbJsonLd(levels, '/lodestar/use/v3.2/guides/start', site);
    expect(crumbs.itemListElement).toEqual([
      { '@type': 'ListItem', position: 1, name: 'lodestar', item: 'https://docs.puncoz.com/lodestar' },
      { '@type': 'ListItem', position: 2, name: 'Use', item: 'https://docs.puncoz.com/lodestar/use/v3.2' },
      { '@type': 'ListItem', position: 3, name: 'Start', item: 'https://docs.puncoz.com/lodestar/use/v3.2/guides/start' },
    ]);
  });

  const page = {
    headline: 'Start',
    description: 'A description.',
    url: '/lodestar/use/v3.2/guides/start',
    imageUrl: '/og/x/image.png',
    levels,
    modified: new Date('2026-11-01T00:00:00Z'),
  };

  test('a docs page has TechArticle and BreadcrumbList', () => {
    const data = pageJsonLd(page, site);
    expect(graphTypes(data)).toEqual(['TechArticle', 'BreadcrumbList']);
    expect(data['@graph'][0]).toMatchObject({ dateModified: '2026-11-01T00:00:00.000Z', image: 'https://docs.puncoz.com/og/x/image.png' });
  });

  test('an overview adds SoftwareSourceCode, with its repository and latest version', () => {
    const data = pageJsonLd({ ...page, software: { name: 'lodestar', repository: 'https://github.com/example/lodestar', version: '3.2.0' } }, site);
    expect(graphTypes(data)).toEqual(['TechArticle', 'BreadcrumbList', 'SoftwareSourceCode']);
    expect(data['@graph'][2]).toMatchObject({ codeRepository: 'https://github.com/example/lodestar', version: '3.2.0' });
  });

  test('escapes < so a title cannot close the script', () => {
    const out = serializeJsonLd({ name: '</script><script>alert(1)</script>' });
    expect(out).not.toContain('<');
    expect(JSON.parse(out).name).toBe('</script><script>alert(1)</script>');
  });
});

describe('share image helpers (ADR-0035 decision 11)', () => {
  test('a long title is set smaller, never cut', () => {
    expect(titleSize('Install')).toBeGreaterThan(titleSize('ADR-0034 — The proxy answers unknown paths'));
    expect(titleSize('ADR-0034 — The proxy answers unknown paths')).toBeGreaterThan(titleSize('x'.repeat(95)));
    expect(titleSize('x'.repeat(400))).toBeGreaterThan(0);
  });

  test('a description is shortened at a word boundary', () => {
    expect(shortenDescription('Short and whole.')).toBe('Short and whole.');
    const long = shortenDescription(`${'word '.repeat(60)}end`);
    expect(long.length).toBeLessThanOrEqual(151);
    expect(long.endsWith('word…')).toBe(true);
  });

  test('the sky is seeded from the address, the same every time', () => {
    expect(skySeed('/docs')).toBe(skySeed('/docs'));
    expect(skySeed('/docs')).not.toBe(skySeed('/docs/maintain'));
    expect(skySeed('/docs')).toBeGreaterThan(0);
  });

  // An image can't read CSS variables, so these are copies; this keeps them from drifting.
  test('its colours are the dark theme tokens', () => {
    const css = readFileSync(join(import.meta.dir, '../app/global.css'), 'utf8');
    const dark = css.slice(css.indexOf('.dark {'));
    const token = (name: string) => new RegExp(`--home-${name}: (#[0-9a-f]{6});`).exec(dark)?.[1];
    expect(shareColors).toEqual({
      ground: token('bg')!,
      ink: token('ink')!,
      muted: token('muted')!,
      line: token('line-2')!,
      star: token('star')!,
      accent: token('accent')!,
      rings: {
        npm: token('npm')!,
        composer: token('composer')!,
        pypi: token('pypi')!,
        go: token('go')!,
        cargo: token('cargo')!,
        other: token('other')!,
        project: token('project')!,
      },
    });
  });
});
