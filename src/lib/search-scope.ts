/**
 * One string per page saying where it sits: `<slug>:maintain`, `<slug>:use` or
 * `<slug>:use:<line>`. Stored in the record's `tag`, which is the index's one facet, so the home
 * search can filter by package, track and line without changing index settings (ADR-0014).
 */
export function scopeTag(slug: string, track?: string, line?: string): string {
  return [slug, track, line].filter(Boolean).join(':');
}

export function parseScope(url: string, docsRoute: string): { slug?: string; track?: string; line?: string } {
  if (!url.startsWith(`${docsRoute}/`)) {
    return {};
  }
  const [slug, track, line] = url.slice(docsRoute.length + 1).split(/[/#]/);
  return { slug, track, line };
}
