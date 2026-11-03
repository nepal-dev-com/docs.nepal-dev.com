import { expect, test } from 'bun:test';
import { readingMinutes } from './reading-time';

test('counts the words of headings and text at 220 a minute', () => {
  const minutes = readingMinutes({ headings: [{ content: 'Two words' }], contents: [{ content: ' one  two\nthree ' }] });
  expect(minutes).toBeCloseTo(5 / 220, 9);
});

test('an empty page takes no time', () => {
  expect(readingMinutes({ headings: [], contents: [{ content: '   ' }] })).toBe(0);
});
