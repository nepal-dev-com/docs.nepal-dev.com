import type * as PageTree from 'fumadocs-core/page-tree';
import { getMeta, source } from './source';
import { compareLines, pageVersion, uncataloguedFolders, type PageVersion, type TrackName } from './catalog-plugin';
import { ecosystems, type Channel, type Ecosystem } from './catalog-schema';

export interface CatalogLine {
  name: string;
  version: string;
  channel: Channel;
  url: string;
}

export interface CatalogEntry {
  slug: string;
  title: string;
  description?: string;
  kind: 'package' | 'project';
  ecosystem?: Ecosystem;
  repository?: string;
  registry?: string;
  featured: boolean;
  url: string;
  useUrl?: string;
  maintainUrl?: string;
  demoUrl?: string;
  lines: CatalogLine[];
  latest?: CatalogLine;
  next?: CatalogLine;
}

type Page = ReturnType<typeof source.getPages>[number];

function firstUrl(node: PageTree.Folder): string | undefined {
  if (node.index) {
    return node.index.url;
  }
  for (const child of node.children) {
    if (child.type === 'page') {
      return child.url;
    }
    if (child.type === 'folder') {
      const url = firstUrl(child);
      if (url) {
        return url;
      }
    }
  }
  return undefined;
}

function folderName(node: PageTree.Folder): string | undefined {
  return node.$ref?.folder.split('/').pop();
}

function childFolder(node: PageTree.Folder, name: string): PageTree.Folder | undefined {
  return node.children.find(
    (child): child is PageTree.Folder => child.type === 'folder' && folderName(child) === name,
  );
}

function readEntry(folder: PageTree.Folder): CatalogEntry | undefined {
  const slug = folder.$ref?.folder;
  if (!slug || slug.includes('/') || uncataloguedFolders.has(slug)) {
    return undefined;
  }
  const meta = getMeta(`${slug}/meta.json`);
  const catalog = meta?.catalog;
  const url = firstUrl(folder);
  if (!catalog || !url) {
    return undefined;
  }

  const use = childFolder(folder, 'use');
  const maintain = childFolder(folder, 'maintain');

  const lines: CatalogLine[] = (use?.children ?? [])
    .flatMap((child) => {
      if (child.type !== 'folder') {
        return [];
      }
      const name = folderName(child);
      const lineMeta = name ? getMeta(`${slug}/use/${name}/meta.json`) : undefined;
      const lineUrl = firstUrl(child);
      if (!name || !lineMeta?.version || !lineMeta.channel || !lineUrl) {
        return [];
      }
      return [{ name, version: lineMeta.version, channel: lineMeta.channel, url: lineUrl }];
    })
    .sort(compareLines);

  const latest = lines.find((line) => line.channel === 'latest');
  const next = lines.find((line) => line.channel === 'next');
  const current = latest ?? next;
  const demoUrl = current ? source.getPage([slug, 'use', current.name, 'demo'])?.url : undefined;

  return {
    slug,
    title: meta.title ?? slug,
    description: meta.description,
    kind: catalog.kind,
    ecosystem: catalog.ecosystem,
    repository: catalog.repository,
    registry: catalog.registry,
    featured: catalog.featured,
    url,
    useUrl: current?.url ?? (use ? firstUrl(use) : undefined),
    maintainUrl: maintain ? firstUrl(maintain) : undefined,
    demoUrl,
    lines,
    latest,
    next,
  };
}

const ecosystemRank = (entry: CatalogEntry) =>
  entry.kind === 'project' ? ecosystems.length : ecosystems.indexOf(entry.ecosystem ?? 'other');

let cached: CatalogEntry[] | undefined;

/**
 * Every public package and project, from the root folders' `catalog` fields (ADR-0013).
 */
export function getCatalog(): CatalogEntry[] {
  cached ??= source
    .getPageTree()
    .children.flatMap((node) => (node.type === 'folder' ? (readEntry(node) ?? []) : []))
    .sort(
      (a, b) =>
        Number(b.featured) - Number(a.featured) ||
        ecosystemRank(a) - ecosystemRank(b) ||
        a.title.localeCompare(b.title, 'en'),
    );
  return cached;
}

export function getEntry(slug: string | undefined): CatalogEntry | undefined {
  return slug ? getCatalog().find((entry) => entry.slug === slug) : undefined;
}

export interface PageContext {
  entry: CatalogEntry;
  track?: TrackName;
  version?: PageVersion;
}

export function getPageContext(page: Page): PageContext | undefined {
  const entry = getEntry(page.slugs[0]);
  if (!entry) {
    return undefined;
  }
  const track = page.slugs[1] === 'use' || page.slugs[1] === 'maintain' ? page.slugs[1] : undefined;
  return { entry, track, version: pageVersion(page.slugs, getMeta) };
}

/**
 * The same page in another line, or that line's first page when it has no such page.
 */
export function pageInLine(page: Page, line: CatalogLine): string {
  const slugs = [...page.slugs];
  slugs[2] = line.name;
  return source.getPage(slugs)?.url ?? line.url;
}

export interface TrackPreview {
  url: string;
  label: string;
  pages: { title: string; url: string }[];
  current: { title: string; description?: string };
}

function previewOf(folder: PageTree.Folder | undefined, label: string): TrackPreview | undefined {
  if (!folder) {
    return undefined;
  }
  const items = [folder.index, ...folder.children].filter(
    (node): node is PageTree.Item => node?.type === 'page',
  );
  const pages = items.slice(0, 6).map((item) => ({
    title: source.getNodePage(item)?.data.title ?? String(item.name),
    url: item.url,
  }));
  const first = items[0] && source.getNodePage(items[0]);
  if (!first || pages.length === 0) {
    return undefined;
  }
  return {
    url: first.url,
    label,
    pages,
    current: { title: first.data.title, description: first.data.description },
  };
}

/**
 * A real page from each track of one package, for the home page's "Two tracks" preview.
 */
export function getTracksPreview():
  | { entry: CatalogEntry; use: TrackPreview; maintain: TrackPreview }
  | undefined {
  const tree = source.getPageTree();
  for (const entry of getCatalog()) {
    const root = tree.children.find(
      (node): node is PageTree.Folder => node.type === 'folder' && node.$ref?.folder === entry.slug,
    );
    const use = root && childFolder(root, 'use');
    const current = entry.latest ?? entry.next;
    const useFolder = use && current ? childFolder(use, current.name) : use;
    const label = current ? `${current.name} · ${current.version}` : 'Use';
    const usePreview = previewOf(useFolder, label);
    const maintainPreview = previewOf(root && childFolder(root, 'maintain'), 'default branch');
    if (usePreview && maintainPreview) {
      return { entry, use: usePreview, maintain: maintainPreview };
    }
  }
  return undefined;
}

/**
 * A page to show as the per-page Markdown example: a package's first Use page when there is one,
 * otherwise the Documentation project's overview.
 */
export function getMarkdownExample(): string | undefined {
  const entry = getCatalog().find((item) => item.useUrl);
  return entry?.useUrl ?? source.getPage(['documentation'])?.url ?? source.getPages()[0]?.url;
}
