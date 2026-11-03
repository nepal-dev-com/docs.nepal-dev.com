import { describe, expect, test } from 'bun:test';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { appName, community, homeLine, maker } from './shared';

const root = join(import.meta.dir, '..', '..');
const read = (path: string) => readFileSync(join(root, path), 'utf8');

describe('the site name (ADR-0036)', () => {
  test('the site is Nepal Dev Verse', () => {
    expect(appName).toBe('Nepal Dev Verse');
  });

  test('it says whose work it is, in the words of ADR-0036 decision 3', () => {
    expect(`${homeLine.lead} ${homeLine.rest}`).toBe(
      'Every package and project by Nepalese developers all over the world, documented to the version.',
    );
  });

  test('the star and the metadata name the community, and the maker keeps a link of their own', () => {
    expect(community).toEqual({ name: 'nepal-dev.com', url: 'https://nepal-dev.com' });
    expect(maker).toEqual({ name: 'Puncoz Nepal', url: 'https://puncoz.com' });
  });

  test("this site's own project is Nepal Dev Verse Docs, still at /docs", () => {
    const meta = JSON.parse(read('content/docs/meta.json')) as { title: string };
    expect(meta.title).toBe('Nepal Dev Verse Docs');
    expect(read('content/docs/index.mdx')).toMatch(/^---\ntitle: Nepal Dev Verse Docs\n/);
  });

  test('the llms.txt index is headed with the site name', () => {
    expect(read('src/lib/source.ts')).toContain("node.type === 'root'");
  });

  // Approved ADRs keep the names they were written with (ADR-0036 decision 12).
  test('the old names are gone from the code, the pages and the living documents', () => {
    const olds = [['Puncoz', 'Docs'], ['Puncoz', 'Verse'], ['docs', 'puncoz', 'com']].map((words, index) =>
      words.join(index === 2 ? '.' : ' '),
    );
    // A list of ADRs quotes ADR-0028's title as it was approved.
    const withoutAdrRows = (text: string) => text.split('\n').filter((line) => !line.includes('/ADR-0028-')).join('\n');
    const named = (text: string) => olds.some((old) => withoutAdrRows(text).includes(old));
    const skip = new Set(['node_modules', '.next', '.source', '.git', '.archify', '.claude', 'adr']);
    const found: string[] = [];
    const walk = (dir: string) => {
      for (const name of readdirSync(dir)) {
        const path = join(dir, name);
        if (skip.has(name)) {
          continue;
        }
        if (statSync(path).isDirectory()) {
          walk(path);
        } else if (/\.(tsx?|mdx?|json|html|css)$/.test(name) && named(readFileSync(path, 'utf8'))) {
          found.push(relative(root, path));
        }
      }
    };
    for (const dir of ['src', 'content', 'diagrams']) {
      walk(join(root, dir));
    }
    for (const file of ['PRODUCT.md', 'DESIGN.md', 'AGENTS.md', 'README.md', 'PROJECT_AGENTS.md', '.impeccable/design.json']) {
      if (named(read(file))) {
        found.push(file);
      }
    }
    expect(found).toEqual([]);
  });
});
