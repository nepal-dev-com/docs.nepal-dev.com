import { describe, expect, test } from 'bun:test';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { renderToStaticMarkup } from 'react-dom/server';
import { HorizonClosing, HorizonCredit, HorizonScene } from './horizon-footer';

const html = renderToStaticMarkup(<HorizonScene />);
const count = (pattern: RegExp) => html.match(pattern)?.length ?? 0;

describe('the Horizon scene (ADR-0030 decision 2)', () => {
  test('is decoration only: hidden from assistive tech, with nothing to focus', () => {
    expect(html).toStartWith('<div class="horizon-scene" aria-hidden="true">');
    expect(html).not.toContain('<a ');
    expect(html).not.toContain('<button');
  });

  test('draws its layers back to front', () => {
    const order = [
      'horizon-stars',
      'horizon-aurora',
      'horizon-shooting',
      'horizon-sun',
      'horizon-clouds',
      'horizon-ground',
      'horizon-rim-glow',
    ].map((name) => html.indexOf(`class="${name}`));
    expect(order.every((index) => index >= 0)).toBe(true);
    expect([...order].sort((a, b) => a - b)).toEqual(order);
  });

  test('keeps sixty stars, fourteen of them twinkling', () => {
    expect(count(/<circle class="horizon-twinkle/g)).toBe(14);
    expect(count(/<circle[^>]*data-star/g)).toBe(60);
  });

  test('has two shooting stars on different cycles, so they never fall into a beat', () => {
    expect(count(/class="horizon-shooting /g)).toBe(2);
    expect(html).toContain('--cycle:14s');
    expect(html).toContain('--cycle:23s');
  });

  test('has three cloud bands, each with its own loop', () => {
    expect(count(/class="horizon-cloud-band/g)).toBe(3);
    for (const seconds of [90, 140, 200]) {
      expect(html).toContain(`--drift:${seconds}s`);
    }
  });

  test("takes the clouds' body and underside from the theme, so each theme can keep them visible", () => {
    expect(count(/stop-color="var\(--cloud-top\)"/g)).toBe(3 * 2);
    expect(count(/stop-color="var\(--cloud-under\)"/g)).toBe(3);
  });

  test('puts the observatory on the ridge, with its slit and window', () => {
    expect(html).toContain('class="horizon-observatory"');
    expect(html).toContain('class="horizon-slit"');
    expect(html).toContain('class="horizon-window"');
  });

  test('marks every looping layer, so it can be paused when off screen', () => {
    expect(count(/class="[^"]*\bh-loop\b/g)).toBe(14 + 1 + 2 + 3 + 1);
  });
});

describe('the docs sidebar setting behind the Horizon (ADR-0031)', () => {
  const css = readFileSync(join(import.meta.dir, '../app/site.css'), 'utf8');
  const keyframes = css.match(/@keyframes horizon-set\s*\{[\s\S]*?\n\}/)?.[0] ?? '';

  test('drops 24px as the footer rises', () => {
    expect(keyframes).toContain('translate: 0 24px');
  });

  test('never dims, so its faint text keeps its contrast in the light theme', () => {
    expect(keyframes).not.toContain('opacity');
  });
});

describe('the closing line (ADR-0033)', () => {
  const closing = renderToStaticMarkup(<HorizonClosing />);
  const text = closing.replace(/<[^>]+>/g, '');

  test('says where the reader is, a sentence to a line', () => {
    expect(text.replace('&#x27;', "'")).toBe("You've reached the horizon. The Verse goes on.");
    expect(closing.match(/<span>/g)).toHaveLength(2);
  });

  test('has one link, The Verse, to the Verse view', () => {
    expect(closing.match(/<a /g)).toHaveLength(1);
    expect(closing).toMatch(/<a href="\/#verse"[^>]*>The Verse<\/a>/);
  });

  test("no longer names the maker: the credit does, with the maker's link", () => {
    expect(text).not.toContain('Puncoz Nepal');
    const credit = renderToStaticMarkup(<HorizonCredit />);
    expect(credit).toContain('Packages and projects by');
    expect(credit).toContain('href="https://puncoz.com"');
    expect(credit).toContain('>Puncoz Nepal</a>');
  });
});

test('each sentence of the closing line is a block, so the balancing cannot break across them', () => {
  const css = readFileSync(join(import.meta.dir, '../app/site.css'), 'utf8');
  expect(css).toMatch(/\.horizon-closing span\s*\{\s*display: block;/);
});

// Next.js leaves the scroll position alone when a hash has no target, so arriving from far down
// another page would open the Verse view out of sight.
test('the home page has the Verse view\'s hash target, at the very top', () => {
  const page = readFileSync(join(import.meta.dir, '../app/(home)/page.tsx'), 'utf8');
  const css = readFileSync(join(import.meta.dir, '../app/(home)/home.css'), 'utf8');
  expect(page).toContain('<span id={verseFragment.slice(1)} className="verse-target" />');
  expect(css).toMatch(/\.verse-target\s*\{\s*position: absolute;\s*top: 0;/);
});
