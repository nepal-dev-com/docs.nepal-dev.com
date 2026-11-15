import { describe, expect, test } from 'bun:test';
import type * as PageTree from 'fumadocs-core/page-tree';
import { currentSide, folderUrls, lineLink } from './overview-sidebar';

const both = { userGuideUrl: '/lodestar/user-guide/v0.1/install', maintainerGuideUrl: '/lodestar/maintainer-guide/releasing' };

describe('currentSide (ADR-0025)', () => {
  test('the track in the URL', () => {
    expect(currentSide('user-guide', both)).toBe('user-guide');
    expect(currentSide('maintainer-guide', both)).toBe('maintainer-guide');
  });

  test('on the overview, the User guide when the entry has it, else the Maintainer guide', () => {
    expect(currentSide(undefined, both)).toBe('user-guide');
    expect(currentSide(undefined, { maintainerGuideUrl: '/docs/maintainer-guide' })).toBe('maintainer-guide');
  });

  test('an entry with no track, or an unknown segment, has no current side', () => {
    expect(currentSide(undefined, {})).toBeUndefined();
    expect(currentSide('elsewhere', both)).toBeUndefined();
    expect(currentSide('use', both)).toBeUndefined();
    expect(currentSide('maintain', both)).toBeUndefined();
  });
});

describe('lineLink (ADR-0025)', () => {
  const overviews = new Set(['/lodestar', '/docs']);

  test('the first page after the overview', () => {
    expect(lineLink(['/lodestar', '/lodestar/user-guide/dev/install'], overviews, '/lodestar')).toBe(
      '/lodestar/user-guide/dev/install',
    );
  });

  test("a line's index comes first when it has one", () => {
    expect(lineLink(['/lodestar/user-guide/v0.1', '/lodestar'], overviews, '/lodestar')).toBe('/lodestar/user-guide/v0.1');
  });

  test('the fallback when the line holds only the overview', () => {
    expect(lineLink(new Set(['/lodestar']), overviews, '/lodestar')).toBe('/lodestar');
  });
});

describe('folderUrls', () => {
  const page = (url: string, external = false): PageTree.Item => ({ type: 'page', name: url, url, external });

  test('index first, then pages depth first, without external links', () => {
    const line: PageTree.Folder = {
      type: 'folder',
      name: 'v0.1',
      index: page('/lodestar/user-guide/v0.1'),
      children: [
        page('/lodestar'),
        { type: 'folder', name: 'Guides', children: [page('/lodestar/user-guide/v0.1/guides/theming')] },
        page('https://example.com', true),
        page('/lodestar/user-guide/v0.1/install'),
      ],
    };
    expect(folderUrls(line)).toEqual([
      '/lodestar/user-guide/v0.1',
      '/lodestar',
      '/lodestar/user-guide/v0.1/guides/theming',
      '/lodestar/user-guide/v0.1/install',
    ]);
  });

  test('with lineLink, a line starting with the overview links to its own first page', () => {
    const line: PageTree.Folder = {
      type: 'folder',
      name: 'dev',
      children: [page('/lodestar'), page('/lodestar/user-guide/dev/install')],
    };
    expect(lineLink(folderUrls(line), new Set(['/lodestar']), '/lodestar')).toBe('/lodestar/user-guide/dev/install');
  });
});
