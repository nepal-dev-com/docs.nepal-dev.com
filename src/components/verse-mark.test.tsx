import { expect, test } from 'bun:test';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { renderToStaticMarkup } from 'react-dom/server';
import { VerseMark, verseMarkColors } from './verse-mark';

test('the mark: a star inside two orbits with one teal planet (ADR-0029 decision 2)', () => {
  const html = renderToStaticMarkup(<VerseMark />);
  expect(html.match(/<ellipse/g)).toHaveLength(2);
  expect(html).toContain('fill="var(--home-star)"');
  expect(html).toContain('fill="var(--home-accent)"');
  expect(html.match(/<circle/g)).toHaveLength(2);
});

test('it is decoration beside the wordmark unless it has a title', () => {
  const html = renderToStaticMarkup(<VerseMark />);
  expect(html).toContain('aria-hidden="true"');
  expect(html).not.toContain('<title>');
});

test('with a title it is an image with that name', () => {
  const html = renderToStaticMarkup(<VerseMark title="Puncoz Verse" />);
  expect(html).toContain('role="img"');
  expect(html).toContain('<title>Puncoz Verse</title>');
  expect(html).not.toContain('aria-hidden');
});

test('it takes fixed colours where CSS variables do not work, such as Open Graph images', () => {
  const html = renderToStaticMarkup(<VerseMark colors={verseMarkColors.dark} />);
  expect(html).not.toContain('var(');
  expect(html).toContain(`fill="${verseMarkColors.dark.star}"`);
  expect(html).toContain(`fill="${verseMarkColors.dark.planet}"`);
});

test('the site icon is the same drawing in the dark theme colours', () => {
  const icon = readFileSync(join(import.meta.dir, '../app/icon.svg'), 'utf8');
  expect(icon.match(/<ellipse/g)).toHaveLength(2);
  expect(icon).toContain(verseMarkColors.dark.star);
  expect(icon).toContain(verseMarkColors.dark.planet);
  expect(icon).toContain(verseMarkColors.dark.orbit);
});
