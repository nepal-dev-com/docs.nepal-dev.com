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
