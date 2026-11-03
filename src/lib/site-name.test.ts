import { describe, expect, test } from 'bun:test';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { appName, community, gitConfig, homeLine, maker } from './shared';

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

  // This test reads its own file, so the names are never written whole here (ADR-0038).
  test('the old names are gone from the code, the pages, the ADRs and the living documents', () => {
    const olds = [
      ['Puncoz', 'Docs'].join(' '),
      ['Puncoz', 'Verse'].join(' '),
      ['docs', 'puncoz', 'com'].join('.'),
      ['puncoz-official', 'docs'].join('/'),
    ];
    const named = (text: string) => olds.some((old) => text.includes(old));
    const skip = new Set(['node_modules', '.next', '.source', '.git', '.archify', '.claude']);
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

  // The repository keeps this name as an identifier, but a reader sees the site's (ADR-0038 decision 8).
  test('no page calls the site by its repository name', () => {
    const found: string[] = [];
    const walk = (dir: string) => {
      for (const name of readdirSync(dir)) {
        const path = join(dir, name);
        if (statSync(path).isDirectory()) {
          walk(path);
        } else if (readFileSync(path, 'utf8').includes('puncoz-packages-docs')) {
          found.push(relative(root, path));
        }
      }
    };
    walk(join(root, 'content'));
    expect(found).toEqual([]);
  });

  test("the GitHub link is the repository's new home (ADR-0038 decision 7)", () => {
    expect(gitConfig).toEqual({ user: 'nepal-dev-com', repo: 'docs.nepal-dev.com', branch: 'main' });
    const meta = JSON.parse(read('content/docs/meta.json')) as { catalog: { repository: string } };
    expect(meta.catalog.repository).toBe('https://github.com/nepal-dev-com/docs.nepal-dev.com');
  });

  describe('the reworded ADRs (ADR-0038)', () => {
    const adrFolder = 'content/docs/maintain/adr';
    const adrs = readdirSync(join(root, adrFolder))
      .filter((name) => /^ADR-\d{4}-/.test(name))
      .sort();
    const numbers = (matches: (text: string) => boolean) =>
      adrs.filter((name) => matches(read(join(adrFolder, name)))).map((name) => name.slice(4, 8));

    test('each of the eleven says it was reworded, and no other does', () => {
      expect(numbers((text) => text.includes('**Reworded by:** [ADR-0038]'))).toEqual([
        '0001', '0014', '0015', '0017', '0027', '0028', '0029', '0032', '0033', '0035', '0036',
      ]);
    });

    test("the maker's name is left only where an ADR describes the footer's credit", () => {
      expect(numbers((text) => text.includes('Puncoz Nepal'))).toEqual(['0016', '0033', '0036']);
    });

    test('ADR-0028 has its new title and file name', () => {
      expect(read(join(adrFolder, 'ADR-0028-the-site-gets-its-first-verse-name.mdx'))).toContain(
        'title: "ADR-0028 — The site gets its first Verse name"',
      );
    });
  });
});
