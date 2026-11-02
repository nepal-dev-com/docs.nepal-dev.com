import type * as PageTree from 'fumadocs-core/page-tree';
import { assertKnownPaths } from './catalog-routes';
import { searchRule, siteUrl, type SearchRule } from './seo';
import { getMeta, source } from './source';
import {
  compareLines,
  isOverviewItem,
  lineInfo,
  pageVersion,
  type LineInfo,
  type PageVersion,
  type TrackName,
} from './catalog-plugin';
import { ecosystems, type Ecosystem, type Repository } from './catalog-schema';

export interface CatalogLine extends LineInfo {
  url: string;
}

export interface CatalogEntry {
  slug: string;
  title: string;
  description?: string;
  kind: 'package' | 'project';
  ecosystem?: Ecosystem;
  repository?: string;
  /** A project's repositories, primary first (ADR-0024). */
  repositories?: Repository[];
  registry?: string;
  featured: boolean;
  url: string;
  useUrl?: string;
  maintainUrl?: string;
  demoUrl?: string;
  lines: CatalogLine[];
  latest?: CatalogLine;
  dev?: CatalogLine;
}

type Page = ReturnType<typeof source.getPages>[number];

// The *Overview* item heads every track's sidebar; a track's own first page is the one after it (ADR-0025).
function firstUrl(node: PageTree.Folder): string | undefined {
  if (node.index) {
    return node.index.url;
  }
  for (const child of node.children) {
    if (child.type === 'page' && !isOverviewItem(child)) {
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

function overviewUrl(entry: PageTree.Folder): string | undefined {
  const find = (nodes: PageTree.Node[]): string | undefined => {
    for (const node of nodes) {
      if (node.type === 'page' && isOverviewItem(node)) {
        return node.url;
      }
      const url = node.type === 'folder' ? find(node.children) : undefined;
      if (url) {
        return url;
      }
    }
    return undefined;
  };
  return entry.index?.url ?? find(entry.children) ?? firstUrl(entry);
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
  if (!slug || slug.includes('/')) {
    return undefined;
  }
  const meta = getMeta(`${slug}/meta.json`);
  const catalog = meta?.catalog;
  const url = overviewUrl(folder);
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
      const folder = folderName(child);
      const info = folder ? lineInfo(folder, getMeta(`${slug}/use/${folder}/meta.json`)) : undefined;
      const lineUrl = firstUrl(child);
      if (!info || !lineUrl) {
        return [];
      }
      return [{ ...info, url: lineUrl }];
    })
    .sort((a, b) => compareLines(a, b, getMeta(`${slug}/use/meta.json`)?.pages));

  const latest = lines.find((line) => line.channel === 'latest');
  const dev = lines.find((line) => line.channel === 'dev');
  const current = latest ?? dev;
  const demoUrl = current ? source.getPage([slug, 'use', current.segment, 'demo'])?.url : undefined;

  return {
    slug,
    title: meta.title ?? slug,
    description: meta.description,
    kind: catalog.kind,
    ecosystem: catalog.ecosystem,
    repository: catalog.repository,
    repositories: catalog.repositories,
    registry: catalog.registry,
    featured: catalog.featured,
    url,
    useUrl: current?.url ?? (use ? firstUrl(use) : undefined),
    maintainUrl: maintain ? firstUrl(maintain) : undefined,
    demoUrl,
    lines,
    latest,
    dev,
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

/** ADR-0034 decision 5: a page the proxy did not know would be a real page gone. */
export function checkKnownPaths(): void {
  const landings = getCatalog().flatMap((entry) => [
    ...(entry.useUrl ? [`/${entry.slug}/use`] : []),
    ...entry.lines.map((line) => `/${entry.slug}/use/${line.segment}`),
  ]);
  assertKnownPaths([...source.getPages().map((page) => page.url), ...landings]);
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
  return { entry, track, version: pageVersion(page.path, getMeta) };
}

/**
 * The same page in another line, or that line's first page when it has no such page.
 */
export function pageInLine(page: Page, line: CatalogLine): string {
  const slugs = [...page.slugs];
  slugs[2] = line.segment;
  return source.getPage(slugs)?.url ?? line.url;
}

/** What search engines are told about a page (ADR-0035 decision 3). */
export function pageSearchRule(page: Page): SearchRule {
  const version = pageVersion(page.path, getMeta);
  const latest = version?.channel === 'legacy' ? getEntry(version.slug)?.latest : undefined;
  let latestCounterpart: string | undefined;
  if (latest) {
    const slugs = [...page.slugs];
    slugs[2] = latest.segment;
    latestCounterpart = source.getPage(slugs)?.url;
  }
  return searchRule({ url: page.url, path: page.path, channel: version?.channel, latestCounterpart }, siteUrl);
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
    (node): node is PageTree.Item => node?.type === 'page' && !isOverviewItem(node),
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
 * A real page from each track of one package, for the home page's "Two sides of every planet".
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
    const current = entry.latest ?? entry.dev;
    const useFolder = use && current ? childFolder(use, current.folder) : use;
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
 * The page the home page's "Read it anywhere" uses as its example: a package's first Use page when
 * there is one, otherwise this site's own overview.
 */
export function getExamplePage(): Page | undefined {
  const entry = getCatalog().find((item) => item.useUrl);
  const slugs = (url: string) => url.split('/').filter(Boolean);
  return (entry?.useUrl && source.getPage(slugs(entry.useUrl))) || source.getPage(['docs']) || source.getPages()[0];
}
