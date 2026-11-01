import type * as PageTree from 'fumadocs-core/page-tree';

export type Side = 'use' | 'maintain';

/**
 * The planet row's current side: the track in the URL, or on the overview (no track) the default
 * track, Use when the entry has it (ADR-0025 decision 1).
 */
export function currentSide(
  track: string | undefined,
  entry: { useUrl?: string; maintainUrl?: string },
): Side | undefined {
  if (track === 'use' || track === 'maintain') {
    return track;
  }
  if (track !== undefined) {
    return undefined;
  }
  if (entry.useUrl) {
    return 'use';
  }
  return entry.maintainUrl ? 'maintain' : undefined;
}

/**
 * A line's link in the moon picker: its first page after the *Overview* item, which every line
 * starts with (ADR-0025). Fumadocs would otherwise link every line to the overview.
 */
export function lineLink(urls: Iterable<string>, overviews: ReadonlySet<string>, fallback: string): string {
  for (const url of urls) {
    if (!overviews.has(url)) {
      return url;
    }
  }
  return fallback;
}

/** A folder's page URLs in sidebar order: its index, then its pages depth first. */
export function folderUrls(node: PageTree.Folder): string[] {
  const urls = node.index ? [node.index.url] : [];
  for (const child of node.children) {
    if (child.type === 'page' && !child.external) {
      urls.push(child.url);
    } else if (child.type === 'folder') {
      urls.push(...folderUrls(child));
    }
  }
  return urls;
}
