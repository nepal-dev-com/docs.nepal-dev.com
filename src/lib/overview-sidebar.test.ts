import { describe, expect, test } from 'bun:test';
import type * as PageTree from 'fumadocs-core/page-tree';
import { currentSide, folderUrls, lineLink } from './overview-sidebar';

const both = { useUrl: '/lodestar/use/v0.1/install', maintainUrl: '/lodestar/maintain/releasing' };

describe('currentSide (ADR-0025)', () => {
  test('the track in the URL', () => {
    expect(currentSide('use', both)).toBe('use');
    expect(currentSide('maintain', both)).toBe('maintain');
  });

  test('on the overview, Use when the entry has it, else Maintain', () => {
    expect(currentSide(undefined, both)).toBe('use');
    expect(currentSide(undefined, { maintainUrl: '/docs/maintain' })).toBe('maintain');
  });

  test('an entry with no track, or an unknown segment, has no current side', () => {
    expect(currentSide(undefined, {})).toBeUndefined();
    expect(currentSide('elsewhere', both)).toBeUndefined();
  });
});

describe('lineLink (ADR-0025)', () => {
  const overviews = new Set(['/lodestar', '/docs']);

  test('the first page after the overview', () => {
    expect(lineLink(['/lodestar', '/lodestar/use/dev/install'], overviews, '/lodestar')).toBe(
      '/lodestar/use/dev/install',
    );
  });

  test("a line's index comes first when it has one", () => {
    expect(lineLink(['/lodestar/use/v0.1', '/lodestar'], overviews, '/lodestar')).toBe('/lodestar/use/v0.1');
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
      index: page('/lodestar/use/v0.1'),
      children: [
        page('/lodestar'),
        { type: 'folder', name: 'Guides', children: [page('/lodestar/use/v0.1/guides/theming')] },
        page('https://example.com', true),
        page('/lodestar/use/v0.1/install'),
      ],
    };
    expect(folderUrls(line)).toEqual([
      '/lodestar/use/v0.1',
      '/lodestar',
      '/lodestar/use/v0.1/guides/theming',
      '/lodestar/use/v0.1/install',
    ]);
  });

  test('with lineLink, a line starting with the overview links to its own first page', () => {
    const line: PageTree.Folder = {
      type: 'folder',
      name: 'dev',
      children: [page('/lodestar'), page('/lodestar/use/dev/install')],
    };
    expect(lineLink(folderUrls(line), new Set(['/lodestar']), '/lodestar')).toBe('/lodestar/use/dev/install');
  });
});
