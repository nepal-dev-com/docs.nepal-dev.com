import type { LoaderPlugin } from 'fumadocs-core/source';
import type * as PageTree from 'fumadocs-core/page-tree';
import type { CatalogMeta, Channel } from './catalog-schema';

// Root folders of this project's own decisions; listed in no catalogue (ADR-0013 decision 1).
export const uncataloguedFolders = new Set(['documentation']);

export const trackNames = ['use', 'maintain'] as const;
export type TrackName = (typeof trackNames)[number];

export const channelLabel: Record<Channel, string> = {
  latest: 'Latest',
  next: 'Unreleased',
  legacy: 'Older version',
};

const channelRank: Record<Channel, number> = { latest: 0, next: 1, legacy: 2 };

export function compareLines(
  a: { name: string; channel: Channel },
  b: { name: string; channel: Channel },
): number {
  const byChannel = channelRank[a.channel] - channelRank[b.channel];
  if (byChannel !== 0) {
    return byChannel;
  }
  return b.name.localeCompare(a.name, 'en', { numeric: true });
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
 * The build checks of ADR-0013 decision 9. Returns one message per problem.
 */
export function checkCatalogue(files: string[], read: (path: string) => CatalogMeta | undefined): string[] {
  const problems: string[] = [];
  const topFolders = new Set(files.filter((file) => file.includes('/')).map((file) => file.split('/')[0]));
  const metas: MetaFile[] = files
    .filter((file) => file.endsWith('meta.json'))
    .flatMap((path) => {
      const data = read(path);
      return data ? [{ path, data }] : [];
    });

  for (const slug of topFolders) {
    if (uncataloguedFolders.has(slug)) {
      continue;
    }
    const root = read(`${slug}/meta.json`);
    if (!root?.catalog) {
      problems.push(`content/docs/${slug}/meta.json: a root folder needs a \`catalog\` entry`);
      continue;
    }

    const lines = metas.filter((meta) => {
      const parts = meta.path.split('/');
      return parts.length === 4 && parts[0] === slug && parts[1] === 'use';
    });
    const versioned = lines.filter((line) => line.data.version !== undefined || line.data.channel !== undefined);

    for (const line of versioned) {
      if (line.data.version === undefined) {
        problems.push(`content/docs/${line.path}: a version line needs \`version\``);
      }
      if (line.data.channel === undefined) {
        problems.push(`content/docs/${line.path}: a version line needs \`channel\``);
      }
    }

    const count = (channel: Channel) => versioned.filter((line) => line.data.channel === channel).length;
    if (count('latest') > 1) {
      problems.push(`content/docs/${slug}: more than one line has \`channel: "latest"\``);
    }
    if (count('next') > 1) {
      problems.push(`content/docs/${slug}: more than one line has \`channel: "next"\``);
    }
    if (count('legacy') > 0 && count('latest') === 0) {
      problems.push(`content/docs/${slug}: released lines exist but none has \`channel: "latest"\``);
    }
  }

  return problems;
}

export function catalogPlugin(): LoaderPlugin {
  return {
    name: 'puncoz:catalog',
    transformStorage({ storage }) {
      const problems = checkCatalogue(storage.getFiles(), (path) => readMeta(storage, path));
      if (problems.length > 0) {
        throw new Error(`Catalogue check failed (ADR-0013):\n- ${problems.join('\n- ')}`);
      }
    },
    transformPageTree: {
      folder(node, folderPath) {
        const parts = folderPath.split('/');
        const slug = parts[0];
        if (uncataloguedFolders.has(slug) || !readMeta(this.storage, `${slug}/meta.json`)?.catalog) {
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
            sortLines(node, (path) => readMeta(this.storage, path));
          }
          return node;
        }

        if (parts.length === 3 && parts[1] === 'use') {
          const meta = readMeta(this.storage, `${folderPath}/meta.json`);
          if (meta?.channel && meta.version) {
            node.root = 'line';
            node.description = `${meta.version} · ${channelLabel[meta.channel]}`;
          }
        }
        return node;
      },
    },
  };
}

function sortLines(node: PageTree.Folder, read: (path: string) => CatalogMeta | undefined) {
  const channelOf = (child: PageTree.Node) => {
    if (child.type !== 'folder' || !child.$ref) {
      return undefined;
    }
    return read(`${child.$ref.folder}/meta.json`)?.channel;
  };

  node.children = [...node.children].sort((a, b) => {
    const ca = channelOf(a);
    const cb = channelOf(b);
    if (!ca || !cb || a.type !== 'folder' || b.type !== 'folder') {
      return 0;
    }
    const nameOf = (folder: PageTree.Folder) => folder.$ref?.folder.split('/').pop() ?? '';
    return compareLines({ name: nameOf(a), channel: ca }, { name: nameOf(b), channel: cb });
  });
}

export interface PageVersion {
  slug: string;
  title: string;
  line: string;
  version: string;
  channel: Channel;
}

/**
 * The version line a page belongs to, read from its line folder's `meta.json`.
 */
export function pageVersion(
  slugs: string[],
  getMeta: (path: string) => CatalogMeta | undefined,
): PageVersion | undefined {
  const [slug, track, line] = slugs;
  if (track !== 'use' || !line) {
    return undefined;
  }
  const root = getMeta(`${slug}/meta.json`);
  const meta = getMeta(`${slug}/use/${line}/meta.json`);
  if (!root?.catalog || !meta?.version || !meta.channel) {
    return undefined;
  }
  return { slug, title: root.title ?? slug, line, version: meta.version, channel: meta.channel };
}

export function describeVersion(version: PageVersion): string {
  const label = channelLabel[version.channel].toLowerCase();
  return `${version.title} ${version.version} (${version.line}, ${label})`;
}
