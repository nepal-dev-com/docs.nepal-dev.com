import { describe, expect, test } from 'bun:test';
import { catalogMetaSchema } from './catalog-schema';

const validate = (value: unknown) => catalogMetaSchema['~standard'].validate(value);
const messages = (value: unknown) => {
  const result = validate(value);
  return result.issues ? result.issues.map((issue) => issue.message) : [];
};
const catalog = { kind: 'package', ecosystem: 'npm', visibility: 'public' };

describe('catalogMetaSchema', () => {
  test('a public package entry is accepted', () => {
    const result = validate({ title: 'lodestar', root: true, catalog: { ...catalog, repository: 'https://github.com/example/lodestar' } });
    expect(result.issues).toBeUndefined();
    expect(result.issues ? undefined : result.value.catalog).toMatchObject({ kind: 'package', visibility: 'public', featured: false });
  });

  test('a private entry is refused, so the build fails before publishing it', () => {
    expect(messages({ title: 'x', catalog: { ...catalog, visibility: 'private' } })[0]).toContain('must be "public"');
    expect(messages({ title: 'x', catalog: { kind: 'project' } })[0]).toContain('must be "public"');
  });

  test('a package needs a known ecosystem', () => {
    expect(messages({ title: 'x', catalog: { ...catalog, ecosystem: undefined } })[0]).toContain('required for a package');
    expect(messages({ title: 'x', catalog: { ...catalog, ecosystem: 'maven' } })[0]).toContain('must be one of');
  });

  test('links must be https', () => {
    expect(messages({ title: 'x', catalog: { ...catalog, repository: 'http://example.com' } })).toEqual([
      '`catalog.repository` must be an https URL',
    ]);
    expect(messages({ title: 'x', catalog: { ...catalog, registry: 'not a url' } })).toEqual([
      '`catalog.registry` must be an https URL',
    ]);
  });

  test('line fields: version, name and channel', () => {
    expect(validate({ version: '1.2.0', channel: 'latest', name: 'v1.2' }).issues).toBeUndefined();
    expect(messages({ version: ' ' })[0]).toContain('`version`');
    expect(messages({ name: '' })[0]).toContain('`name`');
    expect(messages({ channel: 'beta' })[0]).toContain('`channel`');
  });

  test('not an object', () => {
    expect(validate('lodestar').issues).toBeDefined();
    expect(messages({ catalog: 'yes' })).toContain('`catalog` must be an object');
  });
});

describe('catalog.repositories (ADR-0024)', () => {
  const project = { kind: 'project', visibility: 'public' };
  const repos = [
    { id: 'frontend', name: 'Frontend', url: 'https://github.com/example/acme-web', primary: true },
    { id: 'backend', name: 'Backend', url: 'https://github.com/example/acme-server' },
    { id: 'api' },
  ];

  test('a project with several repositories is accepted, primary first', () => {
    const result = validate({ title: 'acme', catalog: { ...project, repositories: [repos[1], repos[0], repos[2]] } });
    expect(result.issues).toBeUndefined();
    const value = result.issues ? undefined : result.value.catalog?.repositories;
    expect(value?.map((repo) => repo.id)).toEqual(['frontend', 'backend', 'api']);
    expect(value?.[2]).toEqual({ id: 'api', name: 'api', url: undefined, primary: false });
  });

  test('two or more, on a project only, never with repository', () => {
    expect(messages({ title: 'x', catalog: { ...project, repositories: [repos[0]] } })[0]).toContain('two or more');
    expect(messages({ title: 'x', catalog: { ...catalog, repositories: repos } })[0]).toContain('only on a project');
    expect(messages({ title: 'x', catalog: { ...project, repository: 'https://github.com/example/acme', repositories: repos } })[0]).toContain(
      'not both',
    );
    expect(messages({ title: 'x', catalog: { ...project, repositories: 'frontend' } })[0]).toContain('a list');
  });

  test('exactly one primary', () => {
    const none = repos.map(({ primary: _primary, ...repo }) => repo);
    expect(messages({ title: 'x', catalog: { ...project, repositories: none } })[0]).toContain('exactly one');
    const two = repos.map((repo) => ({ ...repo, primary: true }));
    expect(messages({ title: 'x', catalog: { ...project, repositories: two } })[0]).toContain('exactly one');
  });

  test('ids: lowercase, unique and not reserved', () => {
    const withId = (id: unknown) => ({ title: 'x', catalog: { ...project, repositories: [repos[0], { id }] } });
    expect(messages(withId('Backend'))[0]).toContain('lowercase');
    expect(messages(withId('frontend'))[0]).toContain('more than once');
    for (const id of ['dev', 'latest', 'adr']) {
      expect(messages(withId(id))[0]).toContain('reserved');
    }
    expect(messages(withId(undefined))[0]).toContain('lowercase');
  });

  test('names and links', () => {
    const withRepo = (repo: Record<string, unknown>) => ({ title: 'x', catalog: { ...project, repositories: [repos[0], { id: 'api', ...repo }] } });
    expect(messages(withRepo({ url: 'http://example.com' }))[0]).toContain('https');
    expect(messages(withRepo({ name: ' ' }))[0]).toContain('].name` must be');
    expect(messages(withRepo({ primary: 'yes' }))[0]).toContain('].primary` must be');
  });
});
