import { describe, expect, test } from 'bun:test';
import { maintainerGuide, trackName, trackOf, trackSegments, userGuide } from './tracks';

describe('tracks (ADR-0048)', () => {
  test('the segments are the folder and URL names, User guide first', () => {
    expect(trackSegments).toEqual(['user-guide', 'maintainer-guide']);
  });

  test('each track has the name readers see', () => {
    expect(trackName(userGuide)).toBe('User guide');
    expect(trackName(maintainerGuide)).toBe('Maintainer guide');
  });

  test('a segment resolves to its track', () => {
    expect(trackOf('user-guide')).toBe(userGuide);
    expect(trackOf('maintainer-guide')).toBe(maintainerGuide);
  });

  test('the earlier names, the wrong case and anything else are not tracks', () => {
    for (const segment of ['use', 'maintain', 'User-Guide', 'user-guide/', 'guide', '', undefined]) {
      expect(trackOf(segment)).toBeUndefined();
    }
  });
});
