import { describe, expect, test } from 'bun:test';
import { readFileSync } from 'node:fs';
import type * as PageTree from 'fumadocs-core/page-tree';
import { countPages, folderBody, pageBody } from './sidebar-ladder';

const page = (url: string): PageTree.Item => ({ type: 'page', name: url, url });
const folder = (children: PageTree.Node[], index?: PageTree.Item): PageTree.Folder => ({
  type: 'folder',
  name: 'f',
  children,
  index,
});

describe('countPages', () => {
  test('pages, sub-folder indexes and their pages; separators do not count', () => {
    const tree = folder([
      page('/a'),
      { type: 'separator', name: 'Group' },
      folder([page('/b/one'), page('/b/two')], page('/b')),
      folder([page('/c/one')]),
    ]);
    expect(countPages(tree)).toBe(5);
  });

  test('an empty folder has none', () => {
    expect(countPages(folder([]))).toBe(0);
  });
});

describe('pageBody (ADR-0027)', () => {
  test('a landmark at the top level, a satellite in an orbit', () => {
    expect(pageBody(false)).toBe('landmark');
    expect(pageBody(true)).toBe('satellite');
  });
});

describe('folderBody (ADR-0027)', () => {
  test('a folder holding only its index is an orbit link', () => {
    expect(folderBody(folder([], page('/erd')))).toBe('orbit-link');
  });

  test('a folder with pages is an orbit, with or without an index', () => {
    expect(folderBody(folder([page('/a/one')], page('/a')))).toBe('orbit');
    expect(folderBody(folder([page('/a/one')]))).toBe('orbit');
  });

  test('an empty folder without an index stays an orbit, since it has nothing to link to', () => {
    expect(folderBody(folder([]))).toBe('orbit');
  });

  test('a folder holding only a separator is still an orbit link', () => {
    expect(folderBody(folder([{ type: 'separator', name: 'x' }], page('/x')))).toBe('orbit-link');
  });
});

describe("this site's Maintain belts (ADR-0027 decision 5)", () => {
  const meta = JSON.parse(readFileSync(new URL('../../content/docs/maintain/meta.json', import.meta.url), 'utf8')) as {
    pages: string[];
  };
  const belts = meta.pages.filter((item) => /^---.+---$/.test(item));

  test('four belts, in order', () => {
    expect(belts).toEqual(['---Decisions---', '---Design---', '---Security---', '---Templates---']);
  });

  test('every folder sits under its belt', () => {
    const under = (belt: string) => {
      const start = meta.pages.indexOf(belt) + 1;
      const next = meta.pages.findIndex((item, i) => i >= start && item.startsWith('---'));
      return meta.pages.slice(start, next === -1 ? undefined : next);
    };
    expect(under('---Decisions---')).toEqual(['adr']);
    expect(under('---Design---')).toEqual(['architecture', 'app-flow', 'prd', 'api', 'dfd', 'sequence', 'state', 'erd']);
    expect(under('---Security---')).toEqual(['rbac', 'security']);
    expect(under('---Templates---')).toEqual(['_templates']);
  });

  test('the landmarks come before the first belt', () => {
    expect(meta.pages.slice(0, meta.pages.indexOf(belts[0]))).toEqual(['index']);
  });
});
