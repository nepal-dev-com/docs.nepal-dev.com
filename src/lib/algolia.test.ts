import { describe, expect, test } from 'bun:test';
import { liteClient } from 'algoliasearch/lite';
import { searchCredentials } from './algolia';

describe('the search client without its variables (ADR-0047)', () => {
  test('both values are passed through when set', () => {
    expect(searchCredentials('APP', 'KEY', false)).toEqual(['APP', 'KEY']);
    expect(searchCredentials('APP', 'KEY', true)).toEqual(['APP', 'KEY']);
  });

  test('off Vercel, a build without them gets a pair the client accepts', () => {
    for (const [appId, key] of [
      [undefined, undefined],
      ['', ''],
      ['APP', undefined],
      [undefined, 'KEY'],
    ] as const) {
      const pair = searchCredentials(appId, key, false);
      expect(pair).toEqual(['unset', 'unset']);
      expect(() => liteClient(...pair)).not.toThrow();
    }
  });

  test('on Vercel, a missing value still fails the build', () => {
    expect(() => liteClient(...searchCredentials(undefined, 'KEY', true))).toThrow('`appId` is missing.');
    expect(() => liteClient(...searchCredentials('APP', undefined, true))).toThrow('`apiKey` is missing.');
    expect(() => liteClient(...searchCredentials('', '', true))).toThrow();
  });
});
