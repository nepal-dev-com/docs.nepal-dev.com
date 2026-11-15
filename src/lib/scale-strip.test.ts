import { describe, expect, test } from 'bun:test';
import type * as PageTree from 'fumadocs-core/page-tree';
import type { CatalogEntry } from './catalog';
import { parentLevel, scaleLevels, zoomIn, zoomOut, type Level } from './scale-strip';

const page = (path: string, url: string, name: string, extra: Partial<PageTree.Item> = {}): PageTree.Item => ({
  type: 'page',
  name,
  url,
  $id: path,
  $ref: path,
  ...extra,
});

const folder = (
  path: string,
  name: string,
  children: PageTree.Node[],
  extra: Partial<PageTree.Folder> = {},
): PageTree.Folder => ({
  type: 'folder',
  name,
  children,
  $id: path,
  $ref: { folder: path },
  ...extra,
});

const overview = (folderPath: string) =>
  page('lodestar/index.mdx', '/lodestar', 'Overview', { $id: `lodestar/index.mdx#overview:${folderPath}` });

// The tree as the catalogue plugin leaves it (ADR-0015, ADR-0025): Overview first in each line and track.
const tree: PageTree.Root = {
  type: 'root',
  name: 'Nepal Dev Verse',
  children: [
    folder(
      'lodestar',
      'lodestar',
      [
        folder(
          'lodestar/user-guide',
          'User guide',
          [
            folder(
              'lodestar/user-guide/v0.1',
              'v0.1',
              [
                overview('lodestar/user-guide/v0.1'),
                page('lodestar/user-guide/v0.1/install.mdx', '/lodestar/user-guide/v0.1/install', 'Install'),
                folder(
                  'lodestar/user-guide/v0.1/guides',
                  'Guides',
                  [
                    page('lodestar/user-guide/v0.1/guides/theming.mdx', '/lodestar/user-guide/v0.1/guides/theming', 'Theming'),
                    folder('lodestar/user-guide/v0.1/guides/recipes', 'Recipes', [
                      page(
                        'lodestar/user-guide/v0.1/guides/recipes/forms.mdx',
                        '/lodestar/user-guide/v0.1/guides/recipes/forms',
                        'Forms',
                      ),
                    ]),
                  ],
                  { index: page('lodestar/user-guide/v0.1/guides/index.mdx', '/lodestar/user-guide/v0.1/guides', 'Guides') },
                ),
              ],
              { root: 'line' },
            ),
          ],
          { root: 'track' },
        ),
        folder(
          'lodestar/maintainer-guide',
          'Maintainer guide',
          [
            overview('lodestar/maintainer-guide'),
            page('lodestar/maintainer-guide/index.mdx', '/lodestar/maintainer-guide', 'Maintainer guide'),
            folder('lodestar/maintainer-guide/release', 'Release', [
              page('lodestar/maintainer-guide/release/checklist.mdx', '/lodestar/maintainer-guide/release/checklist', 'Checklist'),
            ]),
          ],
          { root: 'track' },
        ),
      ],
      { root: true },
    ),
  ],
};

const entry = {
  slug: 'lodestar',
  title: 'lodestar',
  kind: 'package',
  ecosystem: 'npm',
  featured: false,
  url: '/lodestar',
  userGuideUrl: '/lodestar/user-guide/v0.1/install',
  maintainerGuideUrl: '/lodestar/maintainer-guide',
  lines: [{ folder: 'v0.1', name: 'v0.1', segment: 'v0.1', version: '0.1.4', channel: 'latest', url: '/lodestar/user-guide/v0.1/install' }],
} as CatalogEntry;

const top = (levels: Level[]) => levels.slice(0, 3).map((level) => [level.kind, level.name, level.url]);

describe('scaleLevels (ADR-0029 decision 4)', () => {
  test('every strip starts at the Verse, then the system, then the planet', () => {
    const levels = scaleLevels({ tree, url: '/lodestar/user-guide/v0.1/install', title: 'Install', entry });
    expect(top(levels)).toEqual([
      ['verse', 'Verse', '/#verse'],
      ['system', 'System', '/'],
      ['planet', 'lodestar', '/lodestar'],
    ]);
  });

  test('an overview stops at its planet, which is the current level', () => {
    const levels = scaleLevels({ tree, url: '/lodestar', title: 'lodestar', entry });
    expect(levels.map((level) => level.kind)).toEqual(['verse', 'system', 'planet']);
    expect(levels[2].current).toBe(true);
    expect(levels[2].url).toBeUndefined();
  });

  test('a User guide page names its side and moon, then each orbit, then the page', () => {
    const levels = scaleLevels({ tree, url: '/lodestar/user-guide/v0.1/guides/recipes/forms', title: 'Forms', entry });
    expect(levels.slice(3)).toEqual([
      { kind: 'side', name: 'User guide', track: 'user-guide', line: { name: 'v0.1', channel: 'latest' }, url: '/lodestar/user-guide/v0.1/install' },
      { kind: 'orbit', name: 'Guides', url: '/lodestar/user-guide/v0.1/guides' },
      { kind: 'orbit', name: 'Recipes' },
      { kind: 'page', name: 'Forms', current: true },
    ]);
  });

  test("a folder's own index makes that orbit the current level", () => {
    const levels = scaleLevels({ tree, url: '/lodestar/user-guide/v0.1/guides', title: 'Guides', entry });
    expect(levels.at(-1)).toEqual({ kind: 'orbit', name: 'Guides', current: true });
    expect(levels).toHaveLength(5);
  });

  test('a Maintainer guide page names its side with no version line; a folder without an index is plain', () => {
    const levels = scaleLevels({ tree, url: '/lodestar/maintainer-guide/release/checklist', title: 'Checklist', entry });
    expect(levels.slice(3)).toEqual([
      { kind: 'side', name: 'Maintainer guide', track: 'maintainer-guide', url: '/lodestar/maintainer-guide' },
      { kind: 'orbit', name: 'Release' },
      { kind: 'page', name: 'Checklist', current: true },
    ]);
  });

  test('a page outside any catalogued entry shows the Verse, the system and the page', () => {
    const levels = scaleLevels({ tree, url: '/elsewhere', title: 'Elsewhere', entry: undefined });
    expect(levels.map((level) => [level.kind, level.name])).toEqual([
      ['verse', 'Verse'],
      ['system', 'System'],
      ['page', 'Elsewhere'],
    ]);
  });

  test('a page the tree does not hold still ends on the page after its planet', () => {
    const levels = scaleLevels({ tree, url: '/lodestar/user-guide/v0.1/missing', title: 'Missing', entry });
    expect(levels.map((level) => level.kind)).toEqual(['verse', 'system', 'planet', 'page']);
  });
});

describe('the phone strip and the zoom', () => {
  test('the parent level is the nearest level above the page that has a link', () => {
    const levels = scaleLevels({ tree, url: '/lodestar/user-guide/v0.1/guides/recipes/forms', title: 'Forms', entry });
    expect(parentLevel(levels)).toMatchObject({ kind: 'orbit', name: 'Guides' });
  });

  test("an overview's parent is the system", () => {
    expect(parentLevel(scaleLevels({ tree, url: '/lodestar', title: 'lodestar', entry }))).toMatchObject({
      kind: 'system',
    });
  });

  test('going up zooms out and going down zooms in', () => {
    expect(zoomOut).toBe('zoom-out');
    expect(zoomIn).toBe('zoom-in');
  });
});
