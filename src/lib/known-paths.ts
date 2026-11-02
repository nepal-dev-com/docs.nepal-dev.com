import { getSlugs } from 'fumadocs-core/source';
import { lineInfo, lineSlugs } from './catalog-plugin';
import type { CatalogMeta } from './catalog-schema';

/** The top-level routes in `src/app` and files in `public/`, which share the root with pages. */
export const siteRoutes = new Set([
  'api',
  'diagrams',
  'icon.svg',
  'llms-full.txt',
  'llms.mdx',
  'llms.txt',
  'og',
  'static.json',
]);

/** Whether a path is one the proxy leaves alone: not a path `[...slug]` would render (ADR-0034). */
export function isSiteRoute(pathname: string): boolean {
  const first = pathname.split('/')[1] ?? '';
  // `__next*` are the development server's own endpoints.
  return first === '' || first === '_next' || first.startsWith('__next') || siteRoutes.has(first);
}

/**
 * Every path with a page behind it: each page's URL, and each `/<slug>/use` and line root that
 * redirects to a first page (ADR-0015 decision 1).
 */
export function knownPaths(files: string[], getMeta: (path: string) => CatalogMeta | undefined): Set<string> {
  const known = new Set<string>();
  for (const file of files) {
    if (!file.endsWith('.mdx') && !file.endsWith('.md')) {
      continue;
    }
    known.add(`/${lineSlugs(file, getSlugs(file), getMeta).join('/')}`);
    const [slug, track, folder, ...rest] = file.split('/');
    if (track !== 'use') {
      continue;
    }
    known.add(`/${slug}/use`);
    const line = rest.length > 0 ? lineInfo(folder, getMeta(`${slug}/use/${folder}/meta.json`)) : undefined;
    if (line) {
      known.add(`/${slug}/use/${line.segment}`);
    }
  }
  return known;
}

/** Where the proxy's list and the site's own pages differ (ADR-0034 decision 5). */
export function knownPathProblems(expected: string[], known: Set<string>): string[] {
  const pages = new Set(expected);
  return [
    ...expected.filter((path) => !known.has(path)).map((path) => `${path}: is a page, but the proxy would answer 404`),
    ...[...known].filter((path) => !pages.has(path)).map((path) => `${path}: the proxy lets it through, but it is not a page`),
  ];
}
