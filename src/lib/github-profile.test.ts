import { describe, expect, test } from 'bun:test';
import { avatarUrl, profileUrl, profileUser } from './github-profile';

describe('profileUser', () => {
  test('a profile link written [@user](https://github.com/user)', () => {
    expect(profileUser('https://github.com/puncoz', '@puncoz')).toBe('puncoz');
  });

  test('case differs between text and address', () => {
    expect(profileUser('https://github.com/Mira-K', '@mira-k')).toBe('Mira-K');
  });

  test('the longest username, 39 characters', () => {
    const name = 'a'.repeat(39);
    expect(profileUser(`https://github.com/${name}`, `@${name}`)).toBe(name);
  });

  test.each([
    ['https://github.com/puncoz', '@someone-else', 'text and address name different users'],
    ['https://github.com/puncoz', 'puncoz', 'text without @'],
    ['https://github.com/puncoz', 'Puncoz on GitHub', 'other text'],
    ['http://github.com/puncoz', '@puncoz', 'not https'],
    ['https://github.com/puncoz/', '@puncoz', 'a trailing slash'],
    ['https://github.com/puncoz/docs', '@puncoz', 'a repository, not a profile'],
    ['https://github.com/puncoz?tab=repositories', '@puncoz', 'a query'],
    ['https://github.com.evil.example/puncoz', '@puncoz', 'another host'],
    ['https://gist.github.com/puncoz', '@puncoz', 'a subdomain'],
    [`https://github.com/${'a'.repeat(40)}`, `@${'a'.repeat(40)}`, '40 characters'],
    ['https://github.com/-puncoz', '@-puncoz', 'a leading hyphen'],
    ['https://github.com/puncoz-', '@puncoz-', 'a trailing hyphen'],
    ['https://github.com/pun--coz', '@pun--coz', 'a doubled hyphen'],
    ['https://github.com/pun_coz', '@pun_coz', 'an underscore'],
  ])('%s, %s: not a profile link (%s)', (href, text) => {
    expect(profileUser(href, text)).toBeUndefined();
  });

  test('a link without text or address', () => {
    expect(profileUser(undefined, '@puncoz')).toBeUndefined();
    expect(profileUser('https://github.com/puncoz', undefined)).toBeUndefined();
    expect(profileUser('https://github.com/puncoz', ['@', 'puncoz'])).toBeUndefined();
  });
});

test('profile and avatar URLs', () => {
  expect(profileUrl('puncoz')).toBe('https://github.com/puncoz');
  expect(avatarUrl('puncoz')).toBe('https://github.com/puncoz.png?size=40');
});
