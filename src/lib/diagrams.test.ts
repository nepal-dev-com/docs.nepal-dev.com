import { afterEach, beforeEach, describe, expect, test } from 'bun:test';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { checkDiagrams, embedSrcProblem } from './diagrams';
import { diagramsPlugin } from './diagrams-plugin';

describe('embedSrcProblem', () => {
  test('allows /diagrams/<project-slug>/<slug>.html', () => {
    expect(embedSrcProblem('/diagrams/example-cli/request-flow.html')).toBeUndefined();
  });

  test.each([
    'https://evil.example/diagrams/a/b.html',
    '//evil.example/diagrams/a/b.html',
    '/og/docs/image.png',
    '/diagrams/docs/a.svg',
    '/diagrams/../og/a.html',
    '/diagrams/docs/nested/a.html',
    '/diagrams/Docs/a.html',
    '/diagrams/docs/.html',
  ])('refuses %s', (src) => {
    expect(embedSrcProblem(src)).toBeString();
  });
});

describe('checkDiagrams', () => {
  test('a diagram with its source, and unrelated files: no problem', () => {
    expect(checkDiagrams(['diagrams/docs/a.html', 'favicon.ico'], ['docs/a.json'])).toEqual([]);
  });

  test('an Archify receipt anywhere under public/', () => {
    expect(checkDiagrams(['diagrams/docs/a.delivery.json'], [])).toHaveLength(1);
    expect(checkDiagrams(['x/home.delivery.pending.json'], [])).toHaveLength(1);
  });

  test('a diagram without its source', () => {
    expect(checkDiagrams(['diagrams/docs/a.html'], ['docs/b.json'])).toEqual([
      'public/diagrams/docs/a.html: no Archify source at diagrams/docs/a.json',
    ]);
  });

  test('any other file under public/diagrams/', () => {
    expect(checkDiagrams(['diagrams/docs/a.png', 'diagrams/a.html'], [])).toHaveLength(2);
  });
});

describe('diagramsPlugin', () => {
  const cwd = process.cwd();
  let root = '';
  const write = (path: string) => {
    mkdirSync(join(root, path, '..'), { recursive: true });
    writeFileSync(join(root, path), '');
  };
  const run = () => (diagramsPlugin().transformStorage as (context: unknown) => void)({});

  beforeEach(() => {
    root = mkdtempSync(join(tmpdir(), 'diagrams-'));
    process.chdir(root);
  });

  afterEach(() => {
    process.chdir(cwd);
    rmSync(root, { recursive: true, force: true });
  });

  test('passes with no public/ or diagrams/ folder', () => {
    expect(run).not.toThrow();
  });

  test('passes with each diagram beside its source', () => {
    write('public/diagrams/docs/a.html');
    write('diagrams/docs/a.json');
    expect(run).not.toThrow();
  });

  test('fails the build on a receipt or a missing source', () => {
    write('public/diagrams/docs/a.html');
    write('public/diagrams/docs/a.delivery.json');
    expect(run).toThrow(/a\.delivery\.json[\s\S]*no Archify source/);
  });
});
