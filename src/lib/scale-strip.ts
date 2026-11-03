import type * as PageTree from 'fumadocs-core/page-tree';
import type { CatalogEntry } from './catalog';
import { isOverviewItem } from './catalog-plugin';
import type { Channel } from './catalog-schema';

export { zoomIn, zoomOut } from './zoom';

export interface Level {
  kind: 'verse' | 'system' | 'planet' | 'side' | 'orbit' | 'page';
  name: string;
  url?: string;
  current?: true;
  track?: 'use' | 'maintain';
  line?: { name: string; channel: Channel };
}

interface ScaleInput {
  tree: PageTree.Root;
  url: string;
  title: string;
  entry: CatalogEntry | undefined;
}

const lastSegment = (folder: PageTree.Folder) => folder.$ref?.folder.split('/').pop() ?? '';

function firstPage(folder: PageTree.Folder): string | undefined {
  for (const node of [folder.index, ...folder.children]) {
    if (node?.type === 'page' && !isOverviewItem(node)) {
      return node.url;
    }
    if (node?.type === 'folder') {
      const url = firstPage(node);
      if (url) {
        return url;
      }
    }
  }
  return undefined;
}

// The folders from the entry down to the page, so each one becomes a level.
function pathTo(folder: PageTree.Folder, url: string): { folders: PageTree.Folder[]; index: boolean } | undefined {
  if (folder.index?.url === url && !isOverviewItem(folder.index)) {
    return { folders: [folder], index: true };
  }
  for (const node of folder.children) {
    if (node.type === 'page' && node.url === url && !isOverviewItem(node)) {
      return { folders: [folder], index: false };
    }
    if (node.type === 'folder') {
      const found = pathTo(node, url);
      if (found) {
        return { folders: [folder, ...found.folders], index: found.index };
      }
    }
  }
  return undefined;
}

function sideLevel(track: PageTree.Folder, line: PageTree.Folder | undefined, entry: CatalogEntry): Level {
  const name = lastSegment(track) === 'use' ? 'Use' : 'Maintain';
  const level: Level = { kind: 'side', name, track: name === 'Use' ? 'use' : 'maintain' };
  if (line) {
    const info = entry.lines.find((item) => item.folder === lastSegment(line));
    level.line = { name: String(line.name), channel: info?.channel ?? 'latest' };
  }
  const url = firstPage(line ?? track);
  if (url) {
    level.url = url;
  }
  return level;
}

function orbitLevel(folder: PageTree.Folder): Level {
  const level: Level = { kind: 'orbit', name: String(folder.name) };
  if (folder.index && !isOverviewItem(folder.index)) {
    level.url = folder.index.url;
  }
  return level;
}

function asCurrent(level: Level): Level {
  const { url: _url, ...rest } = level;
  return { ...rest, current: true };
}

/**
 * Every level of the scale ladder above a page, for the scale strip: Verse, System, the planet,
 * its side and moon, each orbit, then the page (ADR-0029 decision 4).
 */
export function scaleLevels({ tree, url, title, entry }: ScaleInput): Level[] {
  const levels: Level[] = [
    { kind: 'verse', name: 'Verse', url: '/#verse' },
    { kind: 'system', name: 'System', url: '/' },
  ];
  if (!entry) {
    return [...levels, { kind: 'page', name: title, current: true }];
  }
  const planet: Level = { kind: 'planet', name: entry.title, url: entry.url };
  if (url === entry.url) {
    return [...levels, asCurrent(planet)];
  }
  levels.push(planet);

  const root = tree.children.find(
    (node): node is PageTree.Folder => node.type === 'folder' && node.root === true && lastSegment(node) === entry.slug,
  );
  const found = root && pathTo(root, url);
  if (!found) {
    return [...levels, { kind: 'page', name: title, current: true }];
  }

  const [, ...folders] = found.folders;
  const track = folders.find((folder) => folder.root === 'track');
  const line = folders.find((folder) => folder.root === 'line');
  const orbits = folders.filter((folder) => folder.root !== 'track' && folder.root !== 'line');
  const below: Level[] = [];
  if (track) {
    below.push(sideLevel(track, line, entry));
  }
  below.push(...orbits.map(orbitLevel));

  if (found.index && below.length > 0) {
    below.push(asCurrent(below.pop() as Level));
  } else {
    below.push({ kind: 'page', name: title, current: true });
  }
  return [...levels, ...below];
}

/** The level a phone's strip offers: the nearest one above the page that has a link. */
export function parentLevel(levels: Level[]): Level | undefined {
  return levels.filter((level) => !level.current && level.url).at(-1);
}
