import { expect, test } from 'bun:test';
import { renderToStaticMarkup } from 'react-dom/server';
import type { CatalogEntry } from '@/lib/catalog';
import type { Level } from '@/lib/scale-strip';
import { ScaleStrip } from './scale-strip';

const entry = { slug: 'lodestar', title: 'lodestar', kind: 'package', ecosystem: 'npm', lines: [] } as unknown as CatalogEntry;

const levels: Level[] = [
  { kind: 'verse', name: 'Verse', url: '/#verse' },
  { kind: 'system', name: 'System', url: '/' },
  { kind: 'planet', name: 'lodestar', url: '/lodestar' },
  { kind: 'side', name: 'Use', track: 'use', line: { name: 'v0.1', channel: 'latest' }, url: '/lodestar/use/v0.1/install' },
  { kind: 'orbit', name: 'Guides', url: '/lodestar/use/v0.1/guides' },
  { kind: 'orbit', name: 'Recipes' },
  { kind: 'page', name: 'Forms', current: true },
];

test('the strip is a navigation landmark named Scale', () => {
  const html = renderToStaticMarkup(<ScaleStrip levels={levels} entry={entry} />);
  expect(html).toContain('<nav aria-label="Scale" class="scale-strip not-prose"');
  expect(html.match(/<li /g)).toHaveLength(7);
});

test('each level above the page links to its place; the page is plain text marked current', () => {
  const html = renderToStaticMarkup(<ScaleStrip levels={levels} entry={entry} />);
  for (const href of ['/#verse', '/', '/lodestar', '/lodestar/use/v0.1/install', '/lodestar/use/v0.1/guides']) {
    expect(html).toContain(`href="${href}"`);
  }
  expect(html).toContain('aria-current="page"');
  expect(html).toMatch(/aria-current="page"><svg[^>]*class="[^"]*scale-sep[^"]*"[^>]*>.*?<span class="scale-here"><span>Forms<\/span>/);
});

test('a folder without an index is plain text', () => {
  const html = renderToStaticMarkup(<ScaleStrip levels={levels} entry={entry} />);
  expect(html).toContain('<span class="scale-here"><svg');
  expect(html).toMatch(/scale-here"><svg[^>]*>.*?<\/svg><span>Recipes<\/span>/);
});

test('the parent level is marked for the phone strip', () => {
  const html = renderToStaticMarkup(<ScaleStrip levels={levels} entry={entry} />);
  expect(html.match(/data-parent=""/g)).toHaveLength(1);
  expect(html).toMatch(/data-kind="orbit" data-parent="">/);
});

test('the side shows its moon and line name, the planet its mark in the ecosystem colour', () => {
  const html = renderToStaticMarkup(<ScaleStrip levels={levels} entry={entry} />);
  expect(html).toContain('<span class="scale-line"><svg');
  expect(html).toContain('v0.1</span>');
  expect(html).toContain('--eco:var(--home-npm)');
});
