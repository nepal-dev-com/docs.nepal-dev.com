import { describe, expect, test } from 'bun:test';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { renderToStaticMarkup } from 'react-dom/server';
import type { CatalogEntry } from '@/lib/catalog';
import { privateProjects } from '@/components/home/private-projects';
import { lightSpots } from '@/lib/horizon-sky';
import { HorizonClosing, HorizonCredit, HorizonFooter, HorizonScene } from './horizon-footer';

const entry = (slug: string, ecosystem: string, kind: 'package' | 'project' = 'package') =>
  ({ slug, ecosystem, kind, title: slug, url: `/${slug}`, lines: [] }) as unknown as CatalogEntry;
const html = renderToStaticMarkup(<HorizonScene entries={[entry('docs', 'npm', 'project'), entry('lodestar', 'npm')]} />);
const count = (pattern: RegExp) => html.match(pattern)?.length ?? 0;

describe('the Horizon scene (ADR-0030 decision 2, ADR-0037)', () => {
  test('is decoration only: hidden from assistive tech, with nothing to focus', () => {
    expect(html).toStartWith('<div class="horizon-scene" aria-hidden="true">');
    expect(html).not.toContain('<a ');
    expect(html).not.toContain('<button');
  });

  test('draws its layers back to front', () => {
    const order = [
      'horizon-stars',
      'horizon-shooting',
      'horizon-world horizon-sun',
      'horizon-world horizon-far',
      'horizon-clouds',
      'horizon-world horizon-mid',
      'horizon-world horizon-near',
      'horizon-world horizon-ground',
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

  test('has no aurora and no rim glow any more (ADR-0037 decision 8)', () => {
    expect(html).not.toContain('aurora');
    expect(html).not.toContain('rim');
  });

  test('stands the moon above the star, and lights the sunward faces', () => {
    expect(count(/class="horizon-moon"/g)).toBe(1);
    expect(count(/class="horizon-alpenglow"/g)).toBe(2);
  });

  test('flies the flag: the pole fixed, the cloth raised by itself, in its own colours', () => {
    expect(html).toContain('class="horizon-pole"');
    expect(html).toContain('class="horizon-flag"');
    expect(html).toContain('class="horizon-flag-cloth h-loop"');
    expect(html).toContain('fill="#D2193B"');
  });

  test('draws a light for each entry, in its ecosystem colour, marked with its spot', () => {
    expect(count(/class="horizon-light"/g)).toBe(2);
    expect(count(/data-spot="\d+"/g)).toBe(2);
    expect(html).toContain('--light:var(--home-npm)');
    expect(html).toContain('--light:var(--home-project)');
  });

  test('stands bare with no entries', () => {
    expect(renderToStaticMarkup(<HorizonScene entries={[]} />)).not.toContain('horizon-light');
  });

  test('never draws an invented private project (ADR-0037 decision 7)', () => {
    for (const project of privateProjects) {
      expect(html).not.toContain(project.slug);
    }
  });

  test('puts the observatory on the ridge, with its slit and window', () => {
    expect(html).toContain('class="horizon-observatory"');
    expect(html).toContain('class="horizon-slit"');
    expect(html).toContain('class="horizon-window"');
  });

  test('marks every looping layer, so it can be paused when off screen', () => {
    expect(count(/class="[^"]*\bh-loop\b/g)).toBe(14 + 2 + 3 + 1);
  });
});

describe('the planet row and the lights (ADR-0037 decision 7)', () => {
  const footer = renderToStaticMarkup(
    <HorizonFooter entries={[entry('docs', 'npm', 'project')]} githubUrl="https://example.test" />,
  );
  const css = readFileSync(join(import.meta.dir, '../app/site.css'), 'utf8');

  test("a link carries its light's spot, so hovering it can brighten the light with CSS alone", () => {
    const spot = /<g class="horizon-light" data-spot="(\d+)"/.exec(footer)?.[1];
    expect(spot).toBeDefined();
    expect(footer).toMatch(new RegExp(`<a[^>]*data-spot="${spot}"[^>]*href="/docs"|<a[^>]*href="/docs"[^>]*data-spot="${spot}"`));
  });

  test('every spot has its rule', () => {
    for (let index = 0; index < lightSpots.length; index++) {
      expect(css).toContain(`a[data-spot='${index}']`);
    }
  });
});

describe('the flag (ADR-0037 decision 5)', () => {
  const css = readFileSync(join(import.meta.dir, '../app/site.css'), 'utf8');

  test('is raised by default, so without scripts it never stands part-way', () => {
    expect(css).toMatch(/\.horizon\[data-lowered\]:not\(\[data-summit\]\) \.horizon-flag/);
    expect(css.match(/^\.horizon-flag \{[^}]*\}/m)?.[0]).not.toContain('translate');
  });

  test('is not tied to the scroll', () => {
    const rule = css.match(/\.horizon-flag[^{]*\{[^}]*\}/g)?.join('') ?? '';
    expect(rule).not.toContain('animation-timeline');
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

  test('leaves the names to the credit', () => {
    expect(text).not.toContain('Puncoz Nepal');
    expect(text).not.toContain('nepal-dev.com');
  });
});

describe('the credit (ADR-0036 decision 9)', () => {
  const credit = renderToStaticMarkup(<HorizonCredit />);

  test('says the site is part of nepal-dev.com, and who made it with love', () => {
    expect(credit.replace(/<svg[\s\S]*?<\/svg>/, '').replace(/<[^>]+>/g, '').trim()).toBe(
      'Part of nepal-dev.com. Made with love by Puncoz Nepal.',
    );
  });

  test('links both names, each to its own site', () => {
    expect(credit).toMatch(/<a href="https:\/\/nepal-dev\.com"[^>]*>nepal-dev\.com<\/a>/);
    expect(credit).toMatch(/<a href="https:\/\/puncoz\.com"[^>]*>Puncoz Nepal<\/a>/);
    expect(credit.match(/rel="noreferrer noopener"/g)).toHaveLength(2);
  });

  test('carries the mark', () => {
    expect(credit).toContain('brand-mark');
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
