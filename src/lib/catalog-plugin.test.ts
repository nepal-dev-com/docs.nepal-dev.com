import { describe, expect, test } from 'bun:test';
import type { CatalogMeta } from './catalog-schema';
import { checkCatalogue, compareLines, lineInfo, lineSegment, repositoryName } from './catalog-plugin';

const pkg: CatalogMeta = { title: 'lodestar', catalog: { kind: 'package', ecosystem: 'npm', visibility: 'public', featured: false } };

function check(metas: Record<string, CatalogMeta>, pages: string[] = []) {
  const files = [...Object.keys(metas), ...pages];
  return checkCatalogue(files, (path) => metas[path]);
}

describe('lineSegment', () => {
  test('a name made URL-safe', () => {
    expect(lineSegment('v1.0')).toBe('v1.0');
    expect(lineSegment(' 2024 LTS ')).toBe('2024-lts');
    expect(lineSegment('Ünïcode!')).toBe('ncode');
  });
});

describe('lineInfo', () => {
  test('a released line takes its name, else its folder', () => {
    expect(lineInfo('v1', { version: '1.0.0', channel: 'latest', name: 'v1.0' })).toEqual({
      folder: 'v1',
      name: 'v1.0',
      segment: 'v1.0',
      version: '1.0.0',
      channel: 'latest',
    });
    expect(lineInfo('v1', { version: '1.0.0', channel: 'legacy' })?.segment).toBe('v1');
  });

  test('the dev line is always dev', () => {
    expect(lineInfo('dev', { version: '2.0.0-dev', channel: 'dev', name: 'next' })?.segment).toBe('dev');
  });

  test('without version or channel: not a line', () => {
    expect(lineInfo('v1', { version: '1.0.0' })).toBeUndefined();
    expect(lineInfo('v1', { channel: 'latest' })).toBeUndefined();
    expect(lineInfo('v1', undefined)).toBeUndefined();
  });
});

describe('compareLines', () => {
  const line = (folder: string, version: string, channel: 'latest' | 'dev' | 'legacy') => ({ folder, version, channel });

  test('latest, then dev, then older lines newest first', () => {
    const lines = [line('v1', '1.0.0', 'legacy'), line('dev', '3.0.0-dev', 'dev'), line('v10', '10.0.0', 'legacy'), line('v11', '11.0.0', 'latest')];
    expect(lines.sort((a, b) => compareLines(a, b)).map((l) => l.folder)).toEqual(['v11', 'dev', 'v10', 'v1']);
  });

  test('older lines in the pages order when given', () => {
    const lines = [line('v10', '10.0.0', 'legacy'), line('v1', '1.0.0', 'legacy')];
    expect(lines.sort((a, b) => compareLines(a, b, ['v1', 'v10'])).map((l) => l.folder)).toEqual(['v1', 'v10']);
  });
});

describe('checkCatalogue', () => {
  test('a well-formed versioned package passes', () => {
    expect(
      check(
        {
          'lodestar/meta.json': pkg,
          'lodestar/use/meta.json': { title: 'Use' },
          'lodestar/use/dev/meta.json': { version: '2.0.0-dev', channel: 'dev' },
          'lodestar/use/v1/meta.json': { version: '1.4.0', channel: 'latest', name: 'v1.4' },
        },
        ['lodestar/index.mdx', 'lodestar/use/v1/index.mdx'],
      ),
    ).toEqual([]);
  });

  test('a page directly in content/', () => {
    expect(check({}, ['stray.mdx'])).toEqual(['content/stray.mdx: pages belong in a package or project folder']);
  });

  test('a folder without a catalog, a bad name, a reserved slug', () => {
    expect(check({ 'lodestar/meta.json': { title: 'x' } })).toEqual([
      'content/lodestar/meta.json: a root folder needs a `catalog` entry',
    ]);
    expect(check({ 'Lode_Star/meta.json': pkg })[0]).toContain('lowercase letters, digits and hyphens');
    expect(check({ 'diagrams/meta.json': pkg })[0]).toContain('reserved');
    expect(check({ 'og/meta.json': pkg })[0]).toContain('reserved');
  });

  test('a line without version or channel, or dev in the wrong folder', () => {
    const problems = check({
      'lodestar/meta.json': pkg,
      'lodestar/use/v1/meta.json': { name: 'v1' },
      'lodestar/use/v2/meta.json': { version: '2.0.0-dev', channel: 'dev' },
      'lodestar/use/dev/meta.json': { version: '3.0.0', channel: 'latest' },
    });
    expect(problems).toContain('content/lodestar/use/v1/meta.json: a version line needs `version`');
    expect(problems).toContain('content/lodestar/use/v1/meta.json: a version line needs `channel`');
    expect(problems).toContain('content/lodestar/use/v2/meta.json: only `use/dev/` has `channel: "dev"`');
    expect(problems.some((p) => p.includes('use/dev/meta.json') && p.includes('work-in-progress'))).toBe(true);
  });

  test('unusable or clashing segments', () => {
    const problems = check({
      'lodestar/meta.json': pkg,
      'lodestar/use/a/meta.json': { version: '1.0.0', channel: 'latest', name: 'latest' },
      'lodestar/use/b/meta.json': { version: '0.9.0', channel: 'legacy', name: 'V 1' },
      'lodestar/use/c/meta.json': { version: '0.8.0', channel: 'legacy', name: 'v 1' },
    });
    expect(problems.some((p) => p.includes('"latest"') && p.includes("can't be used"))).toBe(true);
    expect(problems.some((p) => p.includes('both give the URL segment "v-1"'))).toBe(true);
  });

  test('pages beside lines, two latest lines, legacy without latest', () => {
    expect(
      check(
        {
          'lodestar/meta.json': pkg,
          'lodestar/use/a/meta.json': { version: '2.0.0', channel: 'latest' },
          'lodestar/use/b/meta.json': { version: '1.0.0', channel: 'latest' },
        },
        ['lodestar/use/intro.mdx'],
      ),
    ).toEqual([
      "content/lodestar/use/intro.mdx: a versioned package's `use/` holds only version lines",
      'content/lodestar: more than one line has `channel: "latest"`',
    ]);
    expect(
      check({ 'lodestar/meta.json': pkg, 'lodestar/use/a/meta.json': { version: '1.0.0', channel: 'legacy' } }),
    ).toEqual(['content/lodestar: released lines exist but none has `channel: "latest"`']);
  });
});

describe('projects (ADR-0024)', () => {
  const project = (repositories?: { id: string; name: string; primary: boolean }[]): CatalogMeta => ({
    title: 'acme',
    catalog: { kind: 'project', visibility: 'public', featured: false, repositories },
  });
  const repos = [
    { id: 'frontend', name: 'Frontend', primary: true },
    { id: 'backend', name: 'Backend', primary: false },
  ];

  test('dev and one released line, holding the repository folders, pass', () => {
    expect(
      check(
        {
          'acme/meta.json': project(repos),
          'acme/use/dev/meta.json': { version: '2.1.0-dev.1', channel: 'dev' },
          'acme/use/v2/meta.json': { version: '2.0.0', channel: 'latest' },
        },
        ['acme/index.mdx', 'acme/use/dev/frontend/index.mdx', 'acme/use/v2/backend/index.mdx'],
      ),
    ).toEqual([]);
  });

  test('an older line in a project fails; a package keeps its older lines', () => {
    const lines = {
      'acme/use/v2/meta.json': { version: '2.0.0', channel: 'latest' as const },
      'acme/use/v1/meta.json': { version: '1.0.0', channel: 'legacy' as const },
    };
    expect(check({ 'acme/meta.json': project(), ...lines })).toEqual([
      'content/acme/use/v1/meta.json: a project keeps only `dev` and one released line; older lines are for packages (ADR-0024)',
    ]);
    expect(check({ 'acme/meta.json': pkg, ...lines })).toEqual([]);
  });

  test("a repository id can't be a line's URL segment", () => {
    expect(
      check({
        'acme/meta.json': project([repos[0], { id: 'v2', name: 'V2', primary: false }]),
        'acme/use/v2/meta.json': { version: '2.0.0', channel: 'latest' },
      }),
    ).toEqual(['content/acme/meta.json: the repository id "v2" is also a line\'s URL segment (ADR-0024)']);
  });
});

describe('repositoryName', () => {
  const repositories = [
    { id: 'frontend', name: 'Frontend', primary: true },
    { id: 'api', name: 'API', primary: false },
  ];
  const metas: Record<string, CatalogMeta> = {
    'acme/meta.json': { title: 'acme', catalog: { kind: 'project', visibility: 'public', featured: false, repositories } },
    'acme/use/dev/meta.json': { version: '2.1.0-dev.1', channel: 'dev' },
    'acme/maintain/api/meta.json': { title: 'The API' },
  };
  const read = (path: string) => metas[path];

  test("a repository folder takes the repository's name", () => {
    expect(repositoryName('acme/use/frontend', read)).toBe('Frontend');
    expect(repositoryName('acme/maintain/frontend', read)).toBe('Frontend');
    expect(repositoryName('acme/use/dev/frontend', read)).toBe('Frontend');
  });

  test('unless its meta.json sets a title, or it is not a repository folder', () => {
    expect(repositoryName('acme/maintain/api', read)).toBeUndefined();
    expect(repositoryName('acme/maintain/guides', read)).toBeUndefined();
    expect(repositoryName('acme/use/v9/frontend', read)).toBeUndefined();
    expect(repositoryName('acme/maintain/frontend/deep', read)).toBeUndefined();
  });
});
