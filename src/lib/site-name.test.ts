import { describe, expect, test } from 'bun:test';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { appName } from './shared';

const root = join(import.meta.dir, '..', '..');
const read = (path: string) => readFileSync(join(root, path), 'utf8');

describe('the site name (ADR-0028)', () => {
  test('the site is Puncoz Verse', () => {
    expect(appName).toBe('Puncoz Verse');
  });

  test("this site's own project is Puncoz Verse Docs, still at /docs", () => {
    const meta = JSON.parse(read('content/docs/meta.json')) as { title: string };
    expect(meta.title).toBe('Puncoz Verse Docs');
    expect(read('content/docs/index.mdx')).toMatch(/^---\ntitle: Puncoz Verse Docs\n/);
  });

  test('the llms.txt index is headed with the site name', () => {
    expect(read('src/lib/source.ts')).toContain("node.type === 'root'");
  });

  // Approved ADRs keep the name they were written with (ADR-0028 decision 3).
  test('the old name is gone from the code, the pages and the living documents', () => {
    const old = ['Puncoz', 'Docs'].join(' ');
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
        } else if (/\.(tsx?|mdx?|json|html|css)$/.test(name) && readFileSync(path, 'utf8').includes(old)) {
          found.push(relative(root, path));
        }
      }
    };
    for (const dir of ['src', 'content', 'diagrams']) {
      walk(join(root, dir));
    }
    for (const file of ['PRODUCT.md', 'DESIGN.md', 'AGENTS.md', 'README.md', 'PROJECT_AGENTS.md', '.impeccable/design.json']) {
      if (read(file).includes(old)) {
        found.push(file);
      }
    }
    expect(found).toEqual([]);
  });
});
