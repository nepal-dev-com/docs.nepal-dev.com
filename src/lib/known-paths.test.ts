import { describe, expect, test } from 'bun:test';
import { existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import type { CatalogMeta } from './catalog-schema';
import { lineSlugs } from './catalog-plugin';
import { knownPathProblems, knownPaths, isSiteRoute, siteRoutes } from './known-paths';

const metas: Record<string, CatalogMeta> = {
  'lodestar/use/dev/meta.json': { version: '4.0.0-dev', channel: 'dev' },
  'lodestar/use/v3/meta.json': { name: 'v3.2', version: '3.2.0', channel: 'latest' },
  'lodestar/use/lts-2/meta.json': { name: '2.x LTS', version: '2.9.1', channel: 'legacy' },
};
const getMeta = (path: string) => metas[path];

const files = [
  'docs/index.mdx',
  'docs/maintain/index.mdx',
  'docs/maintain/adr/ADR-0001-x.mdx',
  'lodestar/index.mdx',
  'lodestar/use/dev/install.mdx',
  'lodestar/use/v3/index.mdx',
  'lodestar/use/v3/guides/start.mdx',
  'lodestar/use/lts-2/install.mdx',
  'lodestar/maintain/releasing.mdx',
  'acme/use/getting-started.mdx',
  'acme/use/frontend/setup.mdx',
];
const known = knownPaths(files, getMeta);

describe('knownPaths (ADR-0034 decisions 3 and 5)', () => {
  test('holds every page at its URL', () => {
    for (const path of [
      '/docs',
      '/docs/maintain',
      '/docs/maintain/adr/ADR-0001-x',
      '/lodestar',
      '/lodestar/maintain/releasing',
      '/acme/use/getting-started',
      '/acme/use/frontend/setup',
    ]) {
      expect(known.has(path)).toBe(true);
    }
  });

  test('uses a line\'s URL segment, not its folder, as source.ts does', () => {
    expect(known.has('/lodestar/use/v3.2')).toBe(true);
    expect(known.has('/lodestar/use/v3.2/guides/start')).toBe(true);
    expect(known.has('/lodestar/use/2.x-lts/install')).toBe(true);
    expect(known.has('/lodestar/use/dev/install')).toBe(true);
    expect(known.has('/lodestar/use/v3/guides/start')).toBe(false);
    expect(known.has('/lodestar/use/lts-2/install')).toBe(false);
  });

  test('holds the landings that redirect to a first page', () => {
    expect(known.has('/lodestar/use')).toBe(true);
    expect(known.has('/lodestar/use/dev')).toBe(true);
    expect(known.has('/lodestar/use/2.x-lts')).toBe(true);
    expect(known.has('/acme/use')).toBe(true);
  });

  test('has no landing for a track or folder without one', () => {
    expect(known.has('/docs/use')).toBe(false);
    expect(known.has('/lodestar/maintain')).toBe(false);
    expect(known.has('/acme/use/frontend')).toBe(false);
  });

  test('refuses unknown paths at each depth, the wrong case and trailing slashes', () => {
    for (const path of [
      '/no-such-page',
      '/x/y/z',
      '/docs/nothing-here',
      '/docs/maintain/adr/nothing',
      '/lodestar/use/v3.2/nothing',
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
      '/api/search',
      '/diagrams/docs/site-pages.html',
      '/llms-full.txt',
      '/llms.mdx/docs/content.md',
      '/llms.txt',
      '/og/docs/image.png',
      '/static.json',
      '/icon.svg',
    ]) {
      expect(isSiteRoute(path)).toBe(true);
    }
  });

  test('judges everything else, including names that only start like a route', () => {
    for (const path of ['/docs', '/no-such-page', '/ogre', '/api-docs', '/llms.txt.bak', '/favicon.ico', '/_not-found']) {
      expect(isSiteRoute(path)).toBe(false);
    }
  });

  // A new top-level route or public file missing from the list would answer 404 (ADR-0034).
  test('lists exactly the routes in src/app and the files in public/', () => {
    const notRoutes = /^(\(.*\)|layout\.tsx|not-found\..*|.*\.css)$/;
    const app = readdirSync(join(import.meta.dir, '../app')).filter((name) => !notRoutes.test(name));
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
    expect(lineSlugs('lodestar/use/lts-2/install.mdx', ['lodestar', 'use', 'lts-2', 'install'], getMeta)).toEqual([
      'lodestar',
      'use',
      '2.x-lts',
      'install',
    ]);
  });

  test('leaves everything else alone', () => {
    const untouched = [
      ['lodestar/index.mdx', ['lodestar']],
      ['acme/use/frontend/setup.mdx', ['acme', 'use', 'frontend', 'setup']],
      ['lodestar/maintain/v3/notes.mdx', ['lodestar', 'maintain', 'v3', 'notes']],
    ] as const;
    for (const [path, slugs] of untouched) {
      expect(lineSlugs(path, [...slugs], getMeta)).toEqual([...slugs]);
    }
  });
});
