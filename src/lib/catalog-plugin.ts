import type { LoaderPlugin } from 'fumadocs-core/source';
import type * as PageTree from 'fumadocs-core/page-tree';
import type { CatalogMeta, Channel } from './catalog-schema';

export const trackNames = ['use', 'maintain'] as const;
export type TrackName = (typeof trackNames)[number];

export const devLine = 'dev';

// Top-level names the site's own routes use, or will (ADR-0015 decision 2).
export const reservedSlugs = new Set([
  'api',
  'auth',
  'callback',
  'sign-in',
  'sign-out',
  'og',
  'apple-icon',
  'search',
  'static',
  'assets',
  'public',
  'diagrams',
  '_next',
]);
const slugPattern = /^[a-z0-9][a-z0-9-]*$/;

export const channelLabel: Record<Channel, string> = {
  latest: 'Latest',
  dev: 'In development',
  legacy: 'Older version',
};

const channelRank: Record<Channel, number> = { latest: 0, dev: 1, legacy: 2 };

/**
 * A line's URL segment: its name made URL-safe (ADR-0015 decision 4).
 */
export function lineSegment(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9._-]/g, '');
}

export interface LineInfo {
  folder: string;
  name: string;
  segment: string;
  version: string;
  channel: Channel;
}

/**
 * A page's slugs with its line's URL segment in place of the folder (ADR-0015 decision 4).
 */
export function lineSlugs(path: string, slugs: string[], getMeta: (path: string) => CatalogMeta | undefined): string[] {
  const [slug, track, folder, ...rest] = path.split('/');
  if (track !== 'use' || !folder || rest.length === 0) {
    return slugs;
  }
  const info = lineInfo(folder, getMeta(`${slug}/use/${folder}/meta.json`));
  return info ? [...slugs.slice(0, 2), info.segment, ...slugs.slice(3)] : slugs;
}

/**
 * The version line a Use folder holds, or undefined when its `meta.json` doesn't make it one.
 */
export function lineInfo(folder: string, meta: CatalogMeta | undefined): LineInfo | undefined {
  if (!meta?.version || !meta.channel) {
    return undefined;
  }
  const name = meta.channel === 'dev' ? devLine : (meta.name ?? folder);
  const segment = meta.channel === 'dev' ? devLine : lineSegment(name);
  return { folder, name, segment, version: meta.version, channel: meta.channel };
}

/**
 * Version-menu order: latest, dev, then older lines in `use/meta.json`'s `pages` order, or newest
 * version first when it doesn't list them.
 */
export function compareLines(
  a: Pick<LineInfo, 'folder' | 'version' | 'channel'>,
  b: Pick<LineInfo, 'folder' | 'version' | 'channel'>,
  order: string[] = [],
): number {
  const byChannel = channelRank[a.channel] - channelRank[b.channel];
  if (byChannel !== 0) {
    return byChannel;
  }
  const ia = order.indexOf(a.folder);
  const ib = order.indexOf(b.folder);
  if (ia !== -1 && ib !== -1) {
    return ia - ib;
  }
  return b.version.localeCompare(a.version, 'en', { numeric: true });
}

interface MetaFile {
  path: string;
  data: CatalogMeta;
}

function readMeta(storage: { read(path: string): unknown }, path: string): CatalogMeta | undefined {
  const file = storage.read(path) as { format?: string; data?: CatalogMeta } | undefined;
  return file?.format === 'meta' ? file.data : undefined;
}

/**
 * The build checks of ADR-0013 decision 9 and ADR-0015 decisions 2 and 5. Returns one message per
 * problem.
 */
export function checkCatalogue(files: string[], read: (path: string) => CatalogMeta | undefined): string[] {
  const problems: string[] = [];

  for (const file of files) {
    if (!file.includes('/') && file !== 'meta.json') {
      problems.push(`content/${file}: pages belong in a package or project folder`);
    }
  }

  const topFolders = new Set(files.filter((file) => file.includes('/')).map((file) => file.split('/')[0]));
  const metas: MetaFile[] = files
    .filter((file) => file.endsWith('meta.json'))
    .flatMap((path) => {
      const data = read(path);
      return data ? [{ path, data }] : [];
    });

  for (const slug of topFolders) {
    if (!slugPattern.test(slug)) {
      problems.push(`content/${slug}: a folder name is lowercase letters, digits and hyphens`);
      continue;
    }
    if (reservedSlugs.has(slug)) {
      problems.push(`content/${slug}: "${slug}" is reserved for the site's own routes`);
      continue;
    }
    const root = read(`${slug}/meta.json`);
    if (!root?.catalog) {
      problems.push(`content/${slug}/meta.json: a root folder needs a \`catalog\` entry`);
      continue;
    }

    const lineMetas = metas.filter((meta) => {
      const parts = meta.path.split('/');
      return parts.length === 4 && parts[0] === slug && parts[1] === 'use';
    });
    const declared = lineMetas.filter(
      (line) => line.data.version !== undefined || line.data.channel !== undefined || line.data.name !== undefined,
    );
    const lines: LineInfo[] = [];

    for (const line of declared) {
      const at = `content/${line.path}`;
      const folder = line.path.split('/')[2];
      if (line.data.version === undefined) {
        problems.push(`${at}: a version line needs \`version\``);
      }
      if (line.data.channel === undefined) {
        problems.push(`${at}: a version line needs \`channel\``);
      }
      if (line.data.channel === 'dev' && folder !== devLine) {
        problems.push(`${at}: only \`use/dev/\` has \`channel: "dev"\``);
      }
      if (folder === devLine && line.data.channel !== undefined && line.data.channel !== 'dev') {
        problems.push(`${at}: \`use/dev/\` is the work-in-progress line and has \`channel: "dev"\``);
      }
      const info = lineInfo(folder, line.data);
      if (!info) {
        continue;
      }
      if (info.channel !== 'dev') {
        if (info.segment === '' || info.segment === devLine || info.segment === 'latest' || info.segment.endsWith('.md')) {
          problems.push(`${at}: the name "${info.name}" gives the URL segment "${info.segment}", which can't be used`);
        }
      }
      const clash = lines.find((other) => other.segment === info.segment);
      if (clash) {
        problems.push(`${at}: "${info.name}" and "${clash.name}" both give the URL segment "${info.segment}"`);
      }
      lines.push(info);
    }

    if (lines.length > 0) {
      for (const file of files) {
        const parts = file.split('/');
        if (parts.length === 3 && parts[0] === slug && parts[1] === 'use' && file.endsWith('.mdx')) {
          problems.push(`content/${file}: a versioned package's \`use/\` holds only version lines`);
        }
      }
    }

    if (root.catalog.kind === 'project') {
      for (const line of declared) {
        if (line.data.channel === 'legacy') {
          problems.push(
            `content/${line.path}: a project keeps only \`dev\` and one released line; older lines are for packages (ADR-0024)`,
          );
        }
      }
    }
    for (const repository of root.catalog.repositories ?? []) {
      if (lines.some((line) => line.segment === repository.id)) {
        problems.push(`content/${slug}/meta.json: the repository id "${repository.id}" is also a line's URL segment (ADR-0024)`);
      }
    }

    const count = (channel: Channel) => lines.filter((line) => line.channel === channel).length;
    if (count('latest') > 1) {
      problems.push(`content/${slug}: more than one line has \`channel: "latest"\``);
    }
    if (count('legacy') > 0 && count('latest') === 0) {
      problems.push(`content/${slug}: released lines exist but none has \`channel: "latest"\``);
    }
  }

  return problems;
}

/** ADR-0035 decision 8: every page has a written description. */
export function checkDescriptions(files: string[], description: (path: string) => string | undefined): string[] {
  return files
    .filter((file) => file.endsWith('.mdx') && !description(file)?.trim())
    .map((file) => `content/${file}: needs a frontmatter \`description\``);
}

export function catalogPlugin(): LoaderPlugin {
  return {
    name: 'puncoz:catalog',
    transformStorage({ storage }) {
      const problems = checkCatalogue(storage.getFiles(), (path) => readMeta(storage, path));
      if (problems.length > 0) {
        throw new Error(`Catalogue check failed (ADR-0013, ADR-0015):\n- ${problems.join('\n- ')}`);
      }
      const undescribed = checkDescriptions(storage.getFiles(), (path) => {
        const file = storage.read(path) as { data?: { description?: string } } | undefined;
        return file?.data?.description;
      });
      if (undescribed.length > 0) {
        throw new Error(`Description check failed (ADR-0035):\n- ${undescribed.join('\n- ')}`);
      }
    },
    transformPageTree: {
      folder(node, folderPath) {
        const parts = folderPath.split('/');
        const slug = parts[0];
        if (!readMeta(this.storage, `${slug}/meta.json`)?.catalog) {
          return node;
        }

        if (parts.length === 1) {
          node.root = true;
          return node;
        }

        if (parts.length === 2 && (trackNames as readonly string[]).includes(parts[1])) {
          // Typed roots: the sidebar shows only the current track and line, and Fumadocs groups
          // same-typed roots into one switcher that keeps the reader on the same page.
          node.root = 'track';
          if (parts[1] === 'use') {
            sortLines(node, (path) => readMeta(this.storage, path), readMeta(this.storage, `${folderPath}/meta.json`));
          }
          return node;
        }

        if (parts.length === 3 && parts[1] === 'use') {
          const info = lineInfo(parts[2], readMeta(this.storage, `${folderPath}/meta.json`));
          if (info) {
            node.root = 'line';
            node.name = info.name;
            node.description = `${info.version} · ${channelLabel[info.channel]}`;
            return node;
          }
        }

        const name = repositoryName(folderPath, (path) => readMeta(this.storage, path));
        if (name) {
          node.name = name;
        }
        return node;
      },
      root(node) {
        return overviewInTracks(node);
      },
    },
  };
}

const overviewMark = '#overview:';

/** An *Overview* item that `overviewInTracks` put first in a track or line (ADR-0025). */
export function isOverviewItem(node: PageTree.Node | undefined): boolean {
  return node?.type === 'page' && (node.$id?.includes(overviewMark) ?? false);
}

function trackRank(node: PageTree.Node): number {
  const track = node.type === 'folder' && node.root === 'track' ? node.$ref?.folder.split('/').pop() : undefined;
  return track === 'use' ? 0 : track === 'maintain' ? 1 : 2;
}

/**
 * Moves each entry's overview into its tracks: an *Overview* item first in every Use line (or an
 * unversioned Use) and in Maintain, with Use first, so Fumadocs resolves the overview into its
 * default track and shows that track's sidebar (ADR-0025).
 */
export function overviewInTracks(root: PageTree.Root): PageTree.Root {
  for (const entry of root.children) {
    if (entry.type !== 'folder' || entry.root !== true) {
      continue;
    }
    // A `meta.json` that lists "index" in `pages` makes the overview a child page, not the index.
    const file = `${entry.$ref?.folder}/index.mdx`;
    const isOverview = (node: PageTree.Node) => node === entry.index || (node.type === 'page' && node.$ref === file);
    const overview = entry.index ?? entry.children.find((node): node is PageTree.Item => isOverview(node));
    if (!overview) {
      continue;
    }
    delete entry.index;
    entry.children = entry.children.filter((node) => !isOverview(node)).sort((a, b) => trackRank(a) - trackRank(b));

    for (const track of entry.children) {
      if (track.type !== 'folder' || track.root !== 'track') {
        continue;
      }
      const lines = track.children.filter(
        (child): child is PageTree.Folder => child.type === 'folder' && child.root === 'line',
      );
      for (const folder of lines.length > 0 ? lines : [track]) {
        const item: PageTree.Item = {
          ...overview,
          name: 'Overview',
          $id: `${overview.$id ?? overview.url}${overviewMark}${folder.$id ?? folder.$ref?.folder ?? ''}`,
        };
        folder.children = [item, ...folder.children];
      }
    }
  }
  return root;
}

/**
 * The tree as written, without the *Overview* items: each entry's overview back as its folder's
 * index, for readers of the whole tree such as `llms.txt` (ADR-0025 decision 5).
 */
export function withoutOverviewItems(root: PageTree.Root): PageTree.Root {
  const strip = (nodes: PageTree.Node[]): PageTree.Node[] =>
    nodes
      .filter((node) => !isOverviewItem(node))
      .map((node) => (node.type === 'folder' ? { ...node, children: strip(node.children) } : node));

  const findOverview = (nodes: PageTree.Node[]): PageTree.Item | undefined => {
    for (const node of nodes) {
      if (node.type === 'page' && isOverviewItem(node)) {
        return node;
      }
      if (node.type === 'folder') {
        const found = findOverview(node.children);
        if (found) {
          return found;
        }
      }
    }
    return undefined;
  };

  return {
    ...root,
    children: root.children.map((node) => {
      if (node.type !== 'folder' || node.root !== true || node.index) {
        return node;
      }
      const overview = findOverview(node.children);
      const children = strip(node.children);
      if (!overview) {
        return { ...node, children };
      }
      return { ...node, index: { ...overview, $id: overview.$id?.split(overviewMark)[0] }, children };
    }),
  };
}

/**
 * The repository's name for a repository folder without its own title: `<slug>/<track>/<id>`, or
 * `<slug>/use/<line>/<id>` in a project with lines (ADR-0024 decision 2).
 */
export function repositoryName(folderPath: string, read: (path: string) => CatalogMeta | undefined): string | undefined {
  const parts = folderPath.split('/');
  const [slug, track] = parts;
  const repositories = read(`${slug}/meta.json`)?.catalog?.repositories;
  if (!repositories || !(trackNames as readonly string[]).includes(track)) {
    return undefined;
  }
  const inLine = parts.length === 4 && track === 'use' && lineInfo(parts[2], read(`${slug}/use/${parts[2]}/meta.json`));
  if (parts.length !== 3 && !inLine) {
    return undefined;
  }
  const repository = repositories.find((repo) => repo.id === parts[parts.length - 1]);
  if (!repository || read(`${folderPath}/meta.json`)?.title) {
    return undefined;
  }
  return repository.name;
}

function sortLines(
  node: PageTree.Folder,
  read: (path: string) => CatalogMeta | undefined,
  useMeta: CatalogMeta | undefined,
) {
  const infoOf = (child: PageTree.Node) => {
    if (child.type !== 'folder' || !child.$ref) {
      return undefined;
    }
    return lineInfo(child.$ref.folder.split('/').pop() ?? '', read(`${child.$ref.folder}/meta.json`));
  };
  const order = useMeta?.pages ?? [];

  node.children = [...node.children].sort((a, b) => {
    const la = infoOf(a);
    const lb = infoOf(b);
    if (!la || !lb) {
      return 0;
    }
    return compareLines(la, lb, order);
  });
}

export interface PageVersion {
  slug: string;
  title: string;
  line: string;
  segment: string;
  version: string;
  channel: Channel;
}

/**
 * The version line a page belongs to, from its file path (`<slug>/use/<folder>/…`) and that
 * folder's `meta.json`.
 */
export function pageVersion(
  path: string,
  getMeta: (path: string) => CatalogMeta | undefined,
): PageVersion | undefined {
  const [slug, track, folder, ...rest] = path.split('/');
  if (track !== 'use' || !folder || rest.length === 0) {
    return undefined;
  }
  const root = getMeta(`${slug}/meta.json`);
  const info = lineInfo(folder, getMeta(`${slug}/use/${folder}/meta.json`));
  if (!root?.catalog || !info) {
    return undefined;
  }
  return {
    slug,
    title: root.title ?? slug,
    line: info.name,
    segment: info.segment,
    version: info.version,
    channel: info.channel,
  };
}

export function describeVersion(version: PageVersion): string {
  const label = channelLabel[version.channel].toLowerCase();
  return `${version.title} ${version.version} (${version.line}, ${label})`;
}
