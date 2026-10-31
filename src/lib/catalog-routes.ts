import { defineDocs } from 'fumadocs-mdx/macro';
import { catalogMetaSchema } from './catalog-schema';
import { uncataloguedFolders } from './catalog-plugin';

// Meta files only, so the proxy never bundles compiled pages. Not `defineCollections({ type:
// 'meta' })`: in fumadocs-mdx 15.4.10 its generated call passes `meta` where the runtime reads
// `entries`, so it always fails; a docs collection whose page pattern matches nothing works.
const metaOnly = defineDocs({
  dir: 'content/docs',
  docs: { files: ['.no-pages/*.mdx'] },
  meta: { schema: catalogMetaSchema },
});

export interface LineRoutes {
  latest?: string;
  lines: Set<string>;
}

function buildRoutes(): Map<string, LineRoutes> {
  const routes = new Map<string, LineRoutes>();
  for (const entry of metaOnly.meta) {
    const parts = entry.info.path.split('/');
    if (parts.length !== 4 || parts[1] !== 'use' || uncataloguedFolders.has(parts[0])) {
      continue;
    }
    if (!entry.version || !entry.channel) {
      continue;
    }
    const routesForSlug = routes.get(parts[0]) ?? { lines: new Set<string>() };
    routesForSlug.lines.add(parts[2]);
    if (entry.channel === 'latest') {
      routesForSlug.latest = parts[2];
    }
    routes.set(parts[0], routesForSlug);
  }
  return routes;
}

export const lineRoutes = buildRoutes();

const linePattern = /^(?:v\d+|next|latest)$/;

/**
 * Where a request for a package's Use line should go instead, or undefined to leave it alone:
 * `use/latest/…` goes to the line marked latest, and a line that no longer exists (renamed on
 * release, or removed) goes to the same path in latest (ADR-0013 decision 5).
 */
export function resolveLineRedirect(pathname: string, docsRoute: string): string | undefined {
  const markdown = pathname.endsWith('.md');
  const path = markdown ? pathname.slice(0, -3) : pathname;
  if (!path.startsWith(`${docsRoute}/`)) {
    return undefined;
  }
  const [slug, track, line, ...rest] = path.slice(docsRoute.length + 1).split('/');
  if (track !== 'use' || !line || !linePattern.test(line)) {
    return undefined;
  }
  const routes = lineRoutes.get(slug);
  if (!routes?.latest || (line !== 'latest' && routes.lines.has(line))) {
    return undefined;
  }
  const target = [docsRoute, slug, 'use', routes.latest, ...rest].join('/');
  return markdown ? `${target}.md` : target;
}
