import { afterEach, beforeEach, describe, expect, test } from 'bun:test';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { checkDiagrams, diagramSize, diagramSrcs, embedSrcProblem, isPresentRequest, reportedHeight } from './diagrams';
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

describe('diagramSrcs', () => {
  test('finds each <Diagram src>', () => {
    const mdx = '<Diagram src="/diagrams/docs/a.html" title="A">\n\n```mermaid\nflowchart LR\n```\n\n</Diagram>\n\n<Diagram title="B" src="/diagrams/docs/b.html">';
    expect(diagramSrcs(mdx)).toEqual(['/diagrams/docs/a.html', '/diagrams/docs/b.html']);
  });

  test('skips examples in fenced and inline code', () => {
    const mdx = [
      '````mdx',
      '<Diagram src="/diagrams/example-cli/request-flow.html" title="Request flow">',
      '```mermaid',
      'flowchart LR',
      '```',
      '</Diagram>',
      '````',
      'Write `<Diagram src="/diagrams/x/y.html">` around it.',
    ].join('\n');
    expect(diagramSrcs(mdx)).toEqual([]);
  });
});

describe('checkDiagrams', () => {
  const ok = { diagrams: ['docs/a.json', 'docs/a.html'], publicFiles: ['favicon.ico'], used: ['/diagrams/docs/a.html'] };

  test('a used diagram beside its source: no problem', () => {
    expect(checkDiagrams(ok)).toEqual([]);
  });

  test('an Archify receipt in diagrams/ or public/', () => {
    expect(checkDiagrams({ ...ok, diagrams: [...ok.diagrams, 'docs/a.delivery.json'] })).toEqual([
      'diagrams/docs/a.delivery.json: an Archify receipt; never commit it',
    ]);
    expect(checkDiagrams({ ...ok, publicFiles: ['x/home.delivery.pending.json'] })).toHaveLength(1);
  });

  test('anything left in public/diagrams/', () => {
    expect(checkDiagrams({ ...ok, publicFiles: ['diagrams/docs/a.html'] })).toEqual([
      'public/diagrams/docs/a.html: diagrams live in diagrams/<project-slug>/, not public/',
    ]);
  });

  test('an HTML without its source, and a source without its HTML', () => {
    expect(checkDiagrams({ ...ok, diagrams: ['docs/a.html'] })).toEqual([
      'diagrams/docs/a.html: no Archify source at diagrams/docs/a.json',
    ]);
    expect(checkDiagrams({ ...ok, diagrams: ['docs/a.json'] })).toContain(
      'diagrams/docs/a.json: no Archify HTML at diagrams/docs/a.html',
    );
  });

  test('a diagram no page uses', () => {
    expect(checkDiagrams({ ...ok, used: [] })).toEqual(['diagrams/docs/a.html: no page uses it in a <Diagram>']);
  });

  test('a <Diagram src> with no file, or a bad src', () => {
    expect(checkDiagrams({ ...ok, used: [...ok.used, '/diagrams/docs/b.html'] })).toEqual([
      '<Diagram src="/diagrams/docs/b.html">: no file at diagrams/docs/b.html',
    ]);
    expect(checkDiagrams({ ...ok, used: [...ok.used, '/public/a.html'] })).toHaveLength(1);
  });

  test('any other file in diagrams/', () => {
    expect(checkDiagrams({ ...ok, diagrams: [...ok.diagrams, 'docs/a.png', 'a.html'] })).toHaveLength(2);
  });
});

describe('diagramSize', () => {
  test('reads the main svg: width-first', () => {
    const html =
      '<svg viewBox="0 0 24 24"></svg><svg viewBox="0 0 903 1024" data-reader-fit="width-first" role="img" aria-labelledby="archify-diagram-title archify-diagram-description">';
    expect(diagramSize(html)).toEqual({ width: 903, height: 1024, wide: false });
  });

  test('a small diagram without a fit', () => {
    expect(diagramSize('<svg viewBox="0 0 850 528" role="img" aria-labelledby="archify-diagram-title">')).toEqual({
      width: 850,
      height: 528,
      wide: true,
    });
  });

  test('a wide diagram: 1.55 times as wide as tall or more', () => {
    expect(diagramSize('<svg viewBox="0 0 538 358" aria-labelledby="archify-diagram-title">')?.wide).toBeFalse();
    expect(diagramSize('<svg viewBox="0 0 538 218" aria-labelledby="archify-diagram-title">')?.wide).toBeTrue();
    expect(diagramSize('<svg viewBox="0 0 1277 236" data-reader-fit="intrinsic-height" aria-labelledby="archify-diagram-title">')).toEqual({
      width: 1277,
      height: 236,
      wide: true,
    });
  });

  test('no diagram svg, or an empty viewBox', () => {
    expect(diagramSize('<svg viewBox="0 0 10 10"></svg>')).toBeUndefined();
    expect(diagramSize('<svg viewBox="0 0 0 10" aria-labelledby="archify-diagram-title">')).toBeUndefined();
  });
});

describe('reportedHeight', () => {
  test('takes a height report within bounds', () => {
    expect(reportedHeight({ type: 'archify-height', height: 640.2 })).toBe(641);
    expect(reportedHeight({ type: 'archify-height', height: 120 })).toBe(120);
    expect(reportedHeight({ type: 'archify-height', height: 4000 })).toBe(4000);
  });

  test.each([
    null,
    'archify-height',
    { type: 'other', height: 500 },
    { type: 'archify-height' },
    { type: 'archify-height', height: '500' },
    { type: 'archify-height', height: Number.NaN },
    { type: 'archify-height', height: Number.POSITIVE_INFINITY },
    { type: 'archify-height', height: 119 },
    { type: 'archify-height', height: 4001 },
  ])('ignores %p', (data) => {
    expect(reportedHeight(data)).toBeUndefined();
  });
});

describe('diagramsPlugin', () => {
  const cwd = process.cwd();
  let root = '';
  const write = (path: string, text = '') => {
    mkdirSync(join(root, path, '..'), { recursive: true });
    writeFileSync(join(root, path), text);
  };
  const run = () => (diagramsPlugin().transformStorage as (context: unknown) => void)({});
  const page = '<Diagram src="/diagrams/docs/a.html" title="A">\n\n```mermaid\nflowchart LR\n```\n\n</Diagram>\n';

  beforeEach(() => {
    root = mkdtempSync(join(tmpdir(), 'diagrams-'));
    process.chdir(root);
  });

  afterEach(() => {
    process.chdir(cwd);
    rmSync(root, { recursive: true, force: true });
  });

  test('passes with no content/, diagrams/ or public/ folder', () => {
    expect(run).not.toThrow();
  });

  test('passes with each diagram beside its source, used by a page', () => {
    write('content/docs/a.mdx', page);
    write('diagrams/docs/a.html');
    write('diagrams/docs/a.json');
    expect(run).not.toThrow();
  });

  test('fails the build on a receipt, an unused diagram or a missing file', () => {
    write('diagrams/docs/a.html');
    write('diagrams/docs/a.json');
    write('diagrams/docs/a.delivery.json');
    write('content/docs/b.mdx', page.replace('a.html', 'b.html'));
    expect(run).toThrow(/a\.delivery\.json[\s\S]*no page uses it[\s\S]*no file at diagrams\/docs\/b\.html/);
  });
});

describe('isPresentRequest', () => {
  test("accepts the frame's Present request", () => {
    expect(isPresentRequest({ type: 'archify-present' })).toBeTrue();
  });

  test('ignores anything else', () => {
    for (const data of [null, undefined, 'archify-present', { type: 'archify-height', height: 300 }, { kind: 'archify-present' }]) {
      expect(isPresentRequest(data)).toBeFalse();
    }
  });
});
