import { defineDocs } from 'fumadocs-mdx/macro';
import { catalogMetaSchema } from './catalog-schema';
import { devLine, lineInfo } from './catalog-plugin';
import { knownPathProblems, knownPaths } from './known-paths';

// `async` still compiles a lazy chunk per page, which the proxy never loads; emptied, they carry no page text.
function emptyBody() {
  return (tree: { children: unknown[] }) => {
    tree.children = [];
  };
}

// The proxy needs only the pages' paths and the meta files, never a page's content (ADR-0034).
const pathsOnly = defineDocs({
  dir: 'content',
  docs: { async: true, mdxOptions: { remarkPlugins: [emptyBody] } },
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
  for (const entry of pathsOnly.meta) {
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
const known = knownPaths(
  pathsOnly.docs.map((doc) => doc.info.path),
  pathsOnly.getMeta,
);

/** Whether a path has a page behind it (ADR-0034 decision 3). */
export function isKnownPath(pathname: string): boolean {
  return known.has(pathname);
}

/** Fails the build when the proxy's list and the site's pages differ (ADR-0034 decision 5). */
export function assertKnownPaths(expected: string[]): void {
  const problems = knownPathProblems(expected, known);
  if (problems.length > 0) {
    throw new Error(`Known paths check failed (ADR-0034):\n- ${problems.join('\n- ')}`);
  }
}

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
