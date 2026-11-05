import { describe, expect, test } from 'bun:test';
import { missingPublishVariables, publishRefusal, publishVariables, readPublishEnv } from './publish-env';

const complete = {
  SITE_URL: 'https://docs.example.test',
  NEXT_PUBLIC_ALGOLIA_APP_ID: 'APPID0000',
  ALGOLIA_WRITE_KEY: 'invented-write-key-0000',
};

describe('missingPublishVariables (ADR-0042 decision 7)', () => {
  test('nothing is missing when every variable is set', () => {
    expect(missingPublishVariables(complete)).toEqual([]);
  });

  test('names each missing variable', () => {
    for (const name of publishVariables) {
      const env = { ...complete, [name]: undefined };
      expect(missingPublishVariables(env)).toEqual([name]);
    }
  });

  test('treats empty and blank values as missing', () => {
    expect(missingPublishVariables({ ...complete, SITE_URL: '', ALGOLIA_WRITE_KEY: '  ' })).toEqual([
      'SITE_URL',
      'ALGOLIA_WRITE_KEY',
    ]);
  });

  test('names all three in an empty environment', () => {
    expect(missingPublishVariables({})).toEqual(['SITE_URL', 'NEXT_PUBLIC_ALGOLIA_APP_ID', 'ALGOLIA_WRITE_KEY']);
  });
});

describe('publishRefusal', () => {
  test('is nothing when the environment is complete', () => {
    expect(publishRefusal(complete)).toBeUndefined();
  });

  test('names the missing variables and never prints a value', () => {
    const message = publishRefusal({ ...complete, NEXT_PUBLIC_ALGOLIA_APP_ID: undefined, SITE_URL: '' });
    expect(message).toContain('SITE_URL');
    expect(message).toContain('NEXT_PUBLIC_ALGOLIA_APP_ID');
    expect(message).not.toContain('ALGOLIA_WRITE_KEY');
    expect(message).not.toContain(complete.ALGOLIA_WRITE_KEY);
  });
});

describe('readPublishEnv', () => {
  test('returns the three values when all are set', () => {
    expect(readPublishEnv({ ...complete, OTHER: 'ignored' })).toEqual(complete);
  });

  test('throws the refusal when one is missing', () => {
    expect(() => readPublishEnv({ ...complete, ALGOLIA_WRITE_KEY: '' })).toThrow('ALGOLIA_WRITE_KEY');
  });
});

describe('scripts/sync-content.ts refuses before reading anything (ADR-0042 decision 7)', () => {
  const root = `${import.meta.dir}/../..`;
  const sync = (env: Record<string, string>) =>
    Bun.spawnSync(['node', 'scripts/sync-content.ts'], { cwd: root, env: { PATH: process.env.PATH ?? '', ...env } });

  test('names every missing variable and exits non-zero', () => {
    const result = sync({ SITE_URL: 'https://docs.example.test' });
    const stderr = result.stderr.toString();
    expect(result.exitCode).not.toBe(0);
    expect(stderr).toContain('NEXT_PUBLIC_ALGOLIA_APP_ID');
    expect(stderr).toContain('ALGOLIA_WRITE_KEY');
    expect(stderr).not.toContain('static.json');
  });

  test('never prints a value it was given', () => {
    const stderr = sync({ ALGOLIA_WRITE_KEY: complete.ALGOLIA_WRITE_KEY }).stderr.toString();
    expect(stderr).toContain('SITE_URL');
    expect(stderr).not.toContain(complete.ALGOLIA_WRITE_KEY);
  });
});
