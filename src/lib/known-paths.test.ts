import { describe, expect, test } from 'bun:test';
import { existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import type { CatalogMeta } from './catalog-schema';
import { lineSlugs } from './catalog-plugin';
import { knownPathProblems, knownPaths, isSiteRoute, siteRoutes } from './known-paths';

const metas: Record<string, CatalogMeta> = {
  'lodestar/user-guide/dev/meta.json': { version: '4.0.0-dev', channel: 'dev' },
  'lodestar/user-guide/v3/meta.json': { name: 'v3.2', version: '3.2.0', channel: 'latest' },
  'lodestar/user-guide/lts-2/meta.json': { name: '2.x LTS', version: '2.9.1', channel: 'legacy' },
};
const getMeta = (path: string) => metas[path];

const files = [
  'docs/index.mdx',
  'docs/maintainer-guide/index.mdx',
  'docs/maintainer-guide/adr/ADR-0001-x.mdx',
  'lodestar/index.mdx',
  'lodestar/user-guide/dev/install.mdx',
  'lodestar/user-guide/v3/index.mdx',
  'lodestar/user-guide/v3/guides/start.mdx',
  'lodestar/user-guide/lts-2/install.mdx',
  'lodestar/maintainer-guide/releasing.mdx',
  'acme/user-guide/getting-started.mdx',
  'acme/user-guide/frontend/setup.mdx',
];
const known = knownPaths(files, getMeta);

describe('knownPaths (ADR-0034 decisions 3 and 5)', () => {
  test('holds every page at its URL', () => {
    for (const path of [
      '/docs',
      '/docs/maintainer-guide',
      '/docs/maintainer-guide/adr/ADR-0001-x',
      '/lodestar',
      '/lodestar/maintainer-guide/releasing',
      '/acme/user-guide/getting-started',
      '/acme/user-guide/frontend/setup',
    ]) {
      expect(known.has(path)).toBe(true);
    }
  });

  test('uses a line\'s URL segment, not its folder, as source.ts does', () => {
    expect(known.has('/lodestar/user-guide/v3.2')).toBe(true);
    expect(known.has('/lodestar/user-guide/v3.2/guides/start')).toBe(true);
    expect(known.has('/lodestar/user-guide/2.x-lts/install')).toBe(true);
    expect(known.has('/lodestar/user-guide/dev/install')).toBe(true);
    expect(known.has('/lodestar/user-guide/v3/guides/start')).toBe(false);
    expect(known.has('/lodestar/user-guide/lts-2/install')).toBe(false);
  });

  test('holds the landings that redirect to a first page', () => {
    expect(known.has('/lodestar/user-guide')).toBe(true);
    expect(known.has('/lodestar/user-guide/dev')).toBe(true);
    expect(known.has('/lodestar/user-guide/2.x-lts')).toBe(true);
    expect(known.has('/acme/user-guide')).toBe(true);
  });

  test('has no landing for a track or folder without one', () => {
    expect(known.has('/docs/user-guide')).toBe(false);
    expect(known.has('/lodestar/maintainer-guide')).toBe(false);
    expect(known.has('/acme/user-guide/frontend')).toBe(false);
  });

  test('the earlier track addresses are unknown, with no redirect (ADR-0048 decision 4)', () => {
    for (const path of [
      '/docs/maintain',
      '/docs/maintain/adr/ADR-0001-x',
      '/lodestar/use',
      '/lodestar/use/v3.2/guides/start',
      '/lodestar/use/latest/install',
      '/lodestar/maintain/releasing',
    ]) {
      expect(known.has(path)).toBe(false);
    }
  });

  test('refuses unknown paths at each depth, the wrong case and trailing slashes', () => {
    for (const path of [
      '/no-such-page',
      '/x/y/z',
      '/docs/nothing-here',
      '/docs/maintainer-guide/adr/nothing',
      '/lodestar/user-guide/v3.2/nothing',
      '/DOCS',
      '/docs/',
      '/docs/Maintain',
    ]) {
      expect(known.has(path)).toBe(false);
    }
  });

  test('skips anything that is not a page', () => {
    expect(knownPaths(['lodestar/meta.json'], getMeta).size).toBe(0);
  });
});

describe('isSiteRoute (ADR-0034 decision 2)', () => {
  test('passes the home page, Next.js and every site route', () => {
    for (const path of [
      '/',
      '/_next/static/chunks/a.js',
      '/_next/image',
      '/__nextjs_original-stack-frames',
      '/diagrams/docs/site-pages.html',
      '/llms-full.txt',
      '/llms.mdx/docs/content.md',
      '/llms.txt',
      '/og/docs/image.png',
      '/static.json',
      '/icon.svg',
      '/robots.txt',
      '/sitemap.xml',
      '/manifest.webmanifest',
      '/apple-icon',
    ]) {
      expect(isSiteRoute(path)).toBe(true);
    }
  });

  test('judges everything else, including names that only start like a route', () => {
    for (const path of ['/docs', '/no-such-page', '/ogre', '/api/search', '/llms.txt.bak', '/favicon.ico', '/_not-found']) {
      expect(isSiteRoute(path)).toBe(false);
    }
  });

  // A new top-level route or public file missing from the list would answer 404 (ADR-0034).
  test('lists exactly the routes in src/app and the files in public/', () => {
    const notRoutes = /^(\(.*\)|layout\.tsx|not-found\..*|.*\.css)$/;
    // Next.js serves these metadata files at a different name.
    const served: Record<string, string> = {
      'robots.ts': 'robots.txt',
      'sitemap.ts': 'sitemap.xml',
      'manifest.ts': 'manifest.webmanifest',
      'apple-icon.tsx': 'apple-icon',
    };
    const app = readdirSync(join(import.meta.dir, '../app'))
      .filter((name) => !notRoutes.test(name))
      .map((name) => served[name] ?? name);
    const publicDir = join(import.meta.dir, '../../public');
    const files = existsSync(publicDir) ? readdirSync(publicDir) : [];
    expect([...siteRoutes].sort()).toEqual([...app, ...files].sort());
  });
});

describe('knownPathProblems (ADR-0034 decision 5)', () => {
  test('is empty when the two lists agree', () => {
    expect(knownPathProblems(['/a', '/b'], new Set(['/b', '/a']))).toEqual([]);
  });

  test('names a page the proxy would wrongly refuse', () => {
    expect(knownPathProblems(['/a', '/b'], new Set(['/a']))).toEqual([
      '/b: is a page, but the proxy would answer 404',
    ]);
  });

  test('names a path the proxy lets through to no page', () => {
    expect(knownPathProblems(['/a'], new Set(['/a', '/ghost']))).toEqual([
      '/ghost: the proxy lets it through, but it is not a page',
    ]);
  });
});

describe('lineSlugs (ADR-0015 decision 4)', () => {
  test('replaces a line folder with its URL segment', () => {
    expect(lineSlugs('lodestar/user-guide/lts-2/install.mdx', ['lodestar', 'user-guide', 'lts-2', 'install'], getMeta)).toEqual([
      'lodestar',
      'user-guide',
      '2.x-lts',
      'install',
    ]);
  });

  test('leaves everything else alone', () => {
    const untouched = [
      ['lodestar/index.mdx', ['lodestar']],
      ['acme/user-guide/frontend/setup.mdx', ['acme', 'user-guide', 'frontend', 'setup']],
      ['lodestar/maintainer-guide/v3/notes.mdx', ['lodestar', 'maintainer-guide', 'v3', 'notes']],
    ] as const;
    for (const [path, slugs] of untouched) {
      expect(lineSlugs(path, [...slugs], getMeta)).toEqual([...slugs]);
    }
  });
});
