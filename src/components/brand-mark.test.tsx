import { expect, test } from 'bun:test';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { renderToStaticMarkup } from 'react-dom/server';
import { flagMoon } from '@/lib/flag';
import { BrandMark, brandMarkColors, flagColors } from './brand-mark';

const channel = (value: number) => {
  const c = value / 255;
  return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
};
const luminance = (hex: string) => {
  const [r, g, b] = [1, 3, 5].map((i) => channel(parseInt(hex.slice(i, i + 2), 16)));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const contrast = (a: string, b: string) => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};

test('the rock stands at least 3:1 against the ground in both themes (ADR-0036 decision 7)', () => {
  expect(contrast(brandMarkColors.dark.rock, '#0a0c10')).toBeGreaterThanOrEqual(3);
  expect(contrast(brandMarkColors.light.rock, '#f6f7f9')).toBeGreaterThanOrEqual(3);
});

test('the rock follows the theme and the flag keeps its own colours', () => {
  const css = readFileSync(join(import.meta.dir, '../app/global.css'), 'utf8');
  expect(css).toContain(`--brand-rock: ${brandMarkColors.light.rock}`);
  expect(css).toContain(`--brand-rock: ${brandMarkColors.dark.rock}`);
  const html = renderToStaticMarkup(<BrandMark />);
  expect(html).toContain('var(--brand-rock)');
  expect(html).toContain(flagColors.red);
  expect(html).toContain(flagColors.blue);
});

test('it is decoration beside the wordmark', () => {
  expect(renderToStaticMarkup(<BrandMark />)).toContain('aria-hidden="true"');
});

test('the small form leaves out the trace and the emblems, so it stays readable at 16px', () => {
  const full = renderToStaticMarkup(<BrandMark colors={brandMarkColors.dark} />);
  const small = renderToStaticMarkup(<BrandMark colors={brandMarkColors.dark} small />);
  expect(full).toContain(brandMarkColors.dark.trace);
  expect(small).not.toContain(brandMarkColors.dark.trace);
  expect(small).not.toContain(flagMoon);
  expect(full).toContain(flagMoon);
});

test('it takes fixed colours where CSS variables do not work, such as share images', () => {
  expect(renderToStaticMarkup(<BrandMark colors={brandMarkColors.dark} />)).not.toContain('var(');
});

test('the site icon is the small form on the dark ground', () => {
  const icon = readFileSync(join(import.meta.dir, '../app/icon.svg'), 'utf8');
  expect(icon).toContain(brandMarkColors.dark.rock);
  expect(icon).toContain(flagColors.red);
  expect(icon).toContain('#0a0c10');
  expect(icon).not.toContain(brandMarkColors.dark.trace);
});
