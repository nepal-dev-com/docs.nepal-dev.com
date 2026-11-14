import { describe, expect, test } from 'bun:test';
import type * as PageTree from 'fumadocs-core/page-tree';
import { isOverviewItem, overviewInTracks, withoutOverviewItems } from './catalog-plugin';

const page = (path: string, url: string, name = url): PageTree.Item => ({
  type: 'page',
  name,
  url,
  $id: path,
  $ref: path,
});

const folder = (
  path: string,
  children: PageTree.Node[],
  extra: Partial<PageTree.Folder> = {},
): PageTree.Folder => ({
  type: 'folder',
  name: path.split('/').pop(),
  children,
  $id: path,
  $ref: { folder: path },
  ...extra,
});

// Built as the catalogue plugin's folder hook leaves it: the Maintainer guide sorts before the User guide by path.
function versioned(): PageTree.Root {
  return {
    type: 'root',
    name: 'Docs',
    children: [
      folder(
        'lodestar',
        [
          folder('lodestar/maintainer-guide', [page('lodestar/maintainer-guide/releasing.mdx', '/lodestar/maintainer-guide/releasing')], {
            root: 'track',
          }),
          folder(
            'lodestar/user-guide',
            [
              folder('lodestar/user-guide/v0.1', [page('lodestar/user-guide/v0.1/install.mdx', '/lodestar/user-guide/v0.1/install')], {
                root: 'line',
              }),
              folder('lodestar/user-guide/dev', [page('lodestar/user-guide/dev/install.mdx', '/lodestar/user-guide/dev/install')], {
                root: 'line',
              }),
            ],
            { root: 'track' },
          ),
        ],
        { root: true, index: page('lodestar/index.mdx', '/lodestar', 'lodestar') },
      ),
    ],
  };
}

function maintainOnly(): PageTree.Root {
  return {
    type: 'root',
    name: 'Docs',
    children: [
      folder(
        'docs',
        [
          folder('docs/maintainer-guide', [folder('docs/maintainer-guide/adr', [page('docs/maintainer-guide/adr/a.mdx', '/docs/maintainer-guide/adr/a')])], {
            root: 'track',
            index: page('docs/maintainer-guide/index.mdx', '/docs/maintainer-guide'),
          }),
        ],
        { root: true, index: page('docs/index.mdx', '/docs', 'Nepal Dev Verse Docs') },
      ),
    ],
  };
}

const child = (node: PageTree.Node, i: number) => (node as PageTree.Folder).children[i];

describe('overviewInTracks (ADR-0025)', () => {
  test('the entry folder loses its index and lists the User guide before the Maintainer guide', () => {
    const [entry] = overviewInTracks(versioned()).children as PageTree.Folder[];
    expect(entry.index).toBeUndefined();
    expect(entry.children.map((node) => (node as PageTree.Folder).$ref?.folder)).toEqual([
      'lodestar/user-guide',
      'lodestar/maintainer-guide',
    ]);
  });

  test('every line and the Maintainer guide start with an Overview item for the overview page', () => {
    const [entry] = overviewInTracks(versioned()).children as PageTree.Folder[];
    const [use, maintain] = entry.children;
    for (const track of [child(use, 0), child(use, 1), maintain]) {
      const first = child(track, 0);
      expect(isOverviewItem(first)).toBe(true);
      expect(first).toMatchObject({ type: 'page', name: 'Overview', url: '/lodestar', $ref: 'lodestar/index.mdx' });
    }
    expect(isOverviewItem(child(child(use, 0), 1))).toBe(false);
  });

  test('the User guide itself gets no item when it has lines', () => {
    const [entry] = overviewInTracks(versioned()).children as PageTree.Folder[];
    const use = entry.children[0] as PageTree.Folder;
    expect(use.children.some(isOverviewItem)).toBe(false);
  });

  test('each Overview item has its own id', () => {
    const [entry] = overviewInTracks(versioned()).children as PageTree.Folder[];
    const [use, maintain] = entry.children;
    const ids = [child(child(use, 0), 0), child(child(use, 1), 0), child(maintain, 0)].map((node) => node.$id);
    expect(new Set(ids).size).toBe(3);
  });

  test('an unversioned User guide gets the item itself', () => {
    const tree: PageTree.Root = {
      type: 'root',
      name: 'Docs',
      children: [
        folder('acme', [folder('acme/user-guide', [page('acme/user-guide/start.mdx', '/acme/user-guide/start')], { root: 'track' })], {
          root: true,
          index: page('acme/index.mdx', '/acme'),
        }),
      ],
    };
    const [entry] = overviewInTracks(tree).children as PageTree.Folder[];
    const use = entry.children[0] as PageTree.Folder;
    expect(isOverviewItem(use.children[0])).toBe(true);
    expect(use.children[1]).toMatchObject({ url: '/acme/user-guide/start' });
  });

  test('a Maintainer-guide-only entry starts the Maintainer guide with the item, before its pages and stations', () => {
    const [entry] = overviewInTracks(maintainOnly()).children as PageTree.Folder[];
    const maintain = entry.children[0] as PageTree.Folder;
    expect(isOverviewItem(maintain.children[0])).toBe(true);
    expect(maintain.index?.url).toBe('/docs/maintainer-guide');
    expect(maintain.children[1]).toMatchObject({ type: 'folder', $ref: { folder: 'docs/maintainer-guide/adr' } });
  });

  test('an overview listed in `pages` (a child page, not the index) moves the same way', () => {
    const tree: PageTree.Root = {
      type: 'root',
      name: 'Docs',
      children: [
        folder(
          'docs',
          [
            page('docs/index.mdx', '/docs', 'Nepal Dev Verse Docs'),
            folder('docs/maintainer-guide', [page('docs/maintainer-guide/a.mdx', '/docs/maintainer-guide/a')], { root: 'track' }),
          ],
          { root: true },
        ),
      ],
    };
    const [entry] = overviewInTracks(tree).children as PageTree.Folder[];
    expect(entry.children).toHaveLength(1);
    const maintain = entry.children[0] as PageTree.Folder;
    expect(isOverviewItem(maintain.children[0])).toBe(true);
    expect(maintain.children[0]).toMatchObject({ url: '/docs', name: 'Overview' });
    expect(withoutOverviewItems(tree).children[0]).toMatchObject({ index: { url: '/docs' } });
  });

  test('an entry without an overview page is left alone', () => {
    const tree: PageTree.Root = {
      type: 'root',
      name: 'Docs',
      children: [folder('bare', [folder('bare/maintainer-guide', [page('bare/maintainer-guide/a.mdx', '/bare/maintainer-guide/a')], { root: 'track' })], { root: true })],
    };
    const [entry] = overviewInTracks(tree).children as PageTree.Folder[];
    expect((entry.children[0] as PageTree.Folder).children.some(isOverviewItem)).toBe(false);
  });

  test('folders outside the catalogue are left alone', () => {
    const tree: PageTree.Root = {
      type: 'root',
      name: 'Docs',
      children: [folder('loose', [page('loose/a.mdx', '/loose/a')], { index: page('loose/index.mdx', '/loose') })],
    };
    const [loose] = overviewInTracks(tree).children as PageTree.Folder[];
    expect(loose.index?.url).toBe('/loose');
    expect(loose.children).toHaveLength(1);
  });
});

describe('withoutOverviewItems (ADR-0025)', () => {
  test('puts the overview back as the entry index and drops every Overview item', () => {
    const moved = overviewInTracks(versioned());
    const [entry] = withoutOverviewItems(moved).children as PageTree.Folder[];
    expect(entry.index).toMatchObject({ url: '/lodestar', $id: 'lodestar/index.mdx' });
    const all: PageTree.Node[] = [];
    const walk = (nodes: PageTree.Node[]) => {
      for (const node of nodes) {
        all.push(node);
        if (node.type === 'folder') {
          walk(node.children);
        }
      }
    };
    walk(entry.children);
    expect(all.some(isOverviewItem)).toBe(false);
    expect(all.filter((node) => node.type === 'page')).toHaveLength(3);
  });

  test('leaves the moved tree itself unchanged', () => {
    const moved = overviewInTracks(versioned());
    withoutOverviewItems(moved);
    const [entry] = moved.children as PageTree.Folder[];
    expect(entry.index).toBeUndefined();
    expect(isOverviewItem(child(entry.children[1], 0))).toBe(true);
  });
});

describe('isOverviewItem', () => {
  test('an ordinary page or folder is not one', () => {
    expect(isOverviewItem(page('a.mdx', '/a'))).toBe(false);
    expect(isOverviewItem(folder('a', []))).toBe(false);
    expect(isOverviewItem(undefined)).toBe(false);
  });
});
