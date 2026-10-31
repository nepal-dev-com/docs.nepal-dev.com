import { defineDocs } from 'fumadocs-mdx/macro';
import { catalogMetaSchema } from './catalog-schema';
import { devLine, lineInfo } from './catalog-plugin';

// Meta files only, so the proxy never bundles compiled pages. Not `defineCollections({ type:
// 'meta' })`: in fumadocs-mdx 15.4.10 its generated call passes `meta` where the runtime reads
// `entries`, so it always fails; a docs collection whose page pattern matches nothing works.
const metaOnly = defineDocs({
  dir: 'content',
  docs: { files: ['.no-pages/*.mdx'] },
  meta: { schema: catalogMetaSchema },
});

export interface LineRoutes {
  latest?: string;
  dev: boolean;
  segments: Set<string>;
}

function buildRoutes() {
  const catalogued = new Set<string>();
  const lines = new Map<string, LineRoutes>();
  for (const entry of metaOnly.meta) {
    const parts = entry.info.path.split('/');
    if (parts.length === 2 && entry.catalog) {
      catalogued.add(parts[0]);
    }
    if (parts.length !== 4 || parts[1] !== 'use') {
      continue;
    }
    const info = lineInfo(parts[2], entry);
    if (!info) {
      continue;
    }
    const routes = lines.get(parts[0]) ?? { dev: false, segments: new Set<string>() };
    routes.segments.add(info.segment);
    if (info.channel === 'latest') {
      routes.latest = info.segment;
    }
    if (info.channel === 'dev') {
      routes.dev = true;
    }
    lines.set(parts[0], routes);
  }
  return { catalogued, lines };
}

const routes = buildRoutes();

/**
 * Whether a path belongs to a package or project, so the proxy leaves the site's own routes alone.
 */
export function isEntryPath(pathname: string): boolean {
  return routes.catalogued.has((pathname.split('/')[1] ?? '').replace(/\.md$/, ''));
}

/**
 * Where a request for a package's Use line should go instead, or undefined to leave it alone:
 * `use/latest/…` goes to the line marked latest (or `dev` before the first release), and a line
 * that no longer exists goes to the same path in that line (ADR-0013 decision 5, ADR-0015).
 */
export function resolveLineRedirect(pathname: string): string | undefined {
  const markdown = pathname.endsWith('.md');
  const path = markdown ? pathname.slice(0, -3) : pathname;
  const [, slug, track, line, ...rest] = path.split('/');
  if (track !== 'use' || !line) {
    return undefined;
  }
  const forSlug = routes.lines.get(slug);
  const target = forSlug?.latest ?? (forSlug?.dev ? devLine : undefined);
  if (!forSlug || !target || (line !== 'latest' && forSlug.segments.has(line))) {
    return undefined;
  }
  const url = ['', slug, 'use', target, ...rest].join('/');
  return markdown ? `${url}.md` : url;
}
