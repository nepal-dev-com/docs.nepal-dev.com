import { describe, expect, test } from 'bun:test';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { renderToStaticMarkup } from 'react-dom/server';
import type { CatalogEntry } from '@/lib/catalog';
import { privateProjects } from '@/components/home/private-projects';
import { eightRays, flagMoon, flagMoonCentre, flagSize, flagWave } from '@/lib/flag';
import { bodyHome, fallbackMoonAge, lightSpots, moonDisc, snowShade } from '@/lib/horizon-sky';
import { horizonVars, moonShadePath } from '@/lib/horizon-time';
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
      'horizon-world horizon-bodies',
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

  test('lights the sunward faces', () => {
    expect(count(/class="horizon-alpenglow"/g)).toBe(3);
  });

  test('shades the snow, as the logo does', () => {
    expect(count(/class="horizon-snow-shade"/g)).toBe(snowShade.length);
  });

  test('flies the flag: the pole fixed, the cloth raised by itself, in its own colours', () => {
    expect(html).toContain('class="horizon-pole"');
    expect(html).toContain('class="horizon-flag"');
    expect(html).toContain('fill="#D2193B"');
    expect(html).toContain('stroke="#1F468D"');
    expect(html).toContain(flagMoon);
    expect(html).toContain(eightRays(flagMoonCentre.cx, flagMoonCentre.cy, flagMoonCentre.inner, flagMoonCentre.outer));
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
    expect(count(/class="[^"]*\bh-loop\b/g)).toBe(14 + 2 + 3 + flagWave.strips * 2);
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

describe('the sun and the moon (ADR-0040)', () => {
  const css = readFileSync(join(import.meta.dir, '../app/site.css'), 'utf8');
  const ruleOf = (selector: string) => css.match(new RegExp(`(?:^|\\n)\\s*${selector} \\{[^}]*\\}`))?.[0] ?? '';

  test('both are in the page, and the theme chooses in CSS, so a theme switch needs no script (decision 1)', () => {
    expect(html).toContain('horizon-body-sun');
    expect(html).toContain('horizon-body-moon');
    expect(ruleOf('\\.horizon-body-moon')).toContain('display: none');
    expect(ruleOf('\\.dark \\.horizon-body-moon')).toContain('display: inline');
    expect(ruleOf('\\.dark \\.horizon-body-sun')).toContain('display: none');
  });

  test('each rises with the scroll, inside the place the hour gives it (decision 5)', () => {
    expect(count(/class="horizon-rise"/g)).toBe(2);
    const rise = css.match(/\.horizon-rise \{[^}]*\}/)?.[0] ?? '';
    expect(rise).toContain('animation-timeline: --horizon');
    const keyframes = css.match(/@keyframes horizon-rise \{[\s\S]*?\n\}/)?.[0] ?? '';
    expect(keyframes).toContain('translateY(100px)');
  });

  test('stands where a star would without scripts, because the static page holds no hour (decision 10)', () => {
    const rule = ruleOf('\\.horizon');
    expect(rule).toContain(`--sun-x: ${bodyHome.x}px`);
    expect(rule).toContain(`--sun-y: ${bodyHome.y}px`);
    expect(rule).toContain(`--moon-x: ${bodyHome.x}px`);
    expect(rule).toContain(`--moon-y: ${bodyHome.y}px`);
    expect(html).not.toMatch(/--sun-x|--dusk:/);
  });

  test('sets every property the hour can change a default, so nothing is unset without scripts', () => {
    const rule = ruleOf('\\.horizon');
    for (const name of Object.keys(horizonVars(new Date(2026, 10, 4, 12)))) {
      expect(rule).toContain(`${name}:`);
    }
  });

  test('draws the moon a fixed crescent until the date is known (decision 10)', () => {
    expect(html).toContain(moonShadePath(fallbackMoonAge, moonDisc));
  });

  test('uses gradients for its softness, never a blur that would be redrawn as it moves (decision 6)', () => {
    const bodies = html.slice(html.indexOf('horizon-bodies'), html.indexOf('horizon-far'));
    expect(bodies).not.toContain('feGaussianBlur');
    expect(bodies).not.toContain('filter');
    expect(bodies).toContain('radialGradient');
  });

  test('lights the sky with one layer per part of the day, moved by opacity alone (decision 7)', () => {
    for (const part of ['dawn', 'day', 'dusk', 'night']) {
      expect(html).toContain(`data-part="${part}"`);
      const rule = ruleOf(`\\.horizon-sky-part\\[data-part='${part}'\\]`);
      expect(rule).toContain(`opacity: var(--${part})`);
    }
  });

  test('never relights the flag or the lights of the entries (decision 7)', () => {
    expect(ruleOf('\\.horizon-flag')).not.toContain('--cool');
    expect(ruleOf('\\.horizon-light')).not.toContain('--cool');
    expect(ruleOf('\\.horizon-light')).not.toContain('--warm');
  });

  test('multiplies the red by the hour around the scroll fade, which stays (decision 8)', () => {
    expect(count(/class="horizon-red"/g)).toBe(1);
    expect(ruleOf('\\.horizon-red')).toContain('opacity: var(--red)');
    expect(css).toMatch(/\.horizon-near \.horizon-alpenglow \{\s*animation: horizon-glow-face/);
  });

  test("the moon's halo and glow follow how much of it is lit, so a new moon is no eclipse (decision 6)", () => {
    expect(count(/class="horizon-moon-halo"/g)).toBe(1);
    expect(css).toMatch(/\.horizon-body-moon \.horizon-body-glow,\s*\.horizon-moon-halo \{\s*opacity: calc\([^)]*var\(--moon-lit\)/);
  });

  test('fades at a crossing only when motion is allowed (decision 9)', () => {
    const fade = css.match(/@media \(prefers-reduced-motion: no-preference\) \{\s*\.horizon-body \{[^}]*\}/)?.[0] ?? '';
    expect(fade).toContain('transition: opacity');
    expect(css).toMatch(/\.horizon\[data-crossing~='sun'\] \.horizon-body-sun,\s*\.horizon\[data-crossing~='moon'\] \.horizon-body-moon \{\s*opacity: 0/);
  });

  test('sends the hour to nothing: the client side only reads the clock and sets properties (ADR-0040 security)', () => {
    const awake = readFileSync(join(import.meta.dir, 'horizon-awake.tsx'), 'utf8');
    expect(awake).not.toMatch(/fetch\(|sendBeacon|localStorage|geolocation|document\.cookie/);
    expect(awake).toContain('horizonVars(');
  });
});

describe('the flag (ADR-0037 decision 5)', () => {
  const css = readFileSync(join(import.meta.dir, '../app/site.css'), 'utf8');

  test('waves strip by strip, each moved by transforms alone and put to sleep with the other loops', () => {
    expect(count(/class="horizon-flag-lift h-loop"/g)).toBe(flagWave.strips);
    expect(count(/class="horizon-flag-tilt h-loop"/g)).toBe(flagWave.strips);
    for (const name of ['horizon-flag-lift', 'horizon-flag-tilt']) {
      const keyframes = css.match(new RegExp(`@keyframes ${name} \\{[\\s\\S]*?\\n\\}`))?.[0] ?? '';
      expect(keyframes).toContain('transform:');
      expect(keyframes).not.toMatch(/\n\s+(?!transform)[a-z-]+:/);
    }
  });

  test('is raised from a fixed point at the foot of its cloth, which the moving strips cannot shift', () => {
    const rule = css.match(/^\.horizon-flag \{[^}]*\}/m)?.[0] ?? '';
    expect(rule).toContain(`transform-origin: 0 ${flagSize.height}px`);
    expect(rule).not.toContain('fill-box');
  });

  test('swings at half the period the strips were worked out for', () => {
    const rules = css.match(/\.horizon-flag-(?:lift|tilt) \{[^}]*\}/g) ?? [];
    expect(rules).toHaveLength(2);
    for (const rule of rules) {
      expect(rule).toContain(`${flagWave.period / 2}s`);
    }
  });

  test('stands in a layer of its own, so its loop never repaints the rock (ADR-0030 decision 3)', () => {
    const near = html.slice(html.indexOf('horizon-near'), html.indexOf('horizon-flag-layer'));
    expect(html).toContain('horizon-flag-layer');
    expect(near).not.toContain('horizon-pole');
    expect(near).not.toContain('horizon-flag-lift');
  });

  test('is raised by default, so without scripts it never stands part-way', () => {
    expect(css).toMatch(/\.horizon\[data-lowered\]:not\(\[data-summit\]\) \.horizon-flag/);
    expect(css.match(/^\.horizon-flag \{[^}]*\}/m)?.[0]).not.toContain('translate');
  });

  test('is not tied to the scroll', () => {
    const rule = css.match(/\.horizon-flag[^{]*\{[^}]*\}/g)?.join('') ?? '';
    expect(rule).not.toContain('animation-timeline');
  });
});

describe("the Horizon in the notebook layout's grid", () => {
  const css = readFileSync(join(import.meta.dir, '../app/site.css'), 'utf8');
  const rule = css.match(/#nd-notebook-layout > \.horizon \{[^}]*\}/)?.[0] ?? '';

  test('spans the outer tracks, so its sky reaches both edges of the window', () => {
    expect(rule).toContain('grid-column: 1 / -1');
  });

  test('adds no min-content to those tracks, which would narrow the page on a phone', () => {
    expect(rule).toContain('contain: inline-size');
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

  test('says the site is part of nepal-dev.com, and who made it, with a heart', () => {
    expect(credit.replace(/<svg[\s\S]*?<\/svg>/, '').replace(/<[^>]+>/g, '').trim()).toBe(
      'Part of nepal-dev.com. Made with ❤️ by Puncoz Nepal.',
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

describe('Privacy choices in the link row (ADR-0041 decision 9)', () => {
  const footer = (privacyChoices: boolean) =>
    renderToStaticMarkup(<HorizonFooter entries={[]} githubUrl="https://example.test" privacyChoices={privacyChoices} />);

  test('stands before Back to orbit, hidden until scripts run', () => {
    const html = footer(true);
    expect(html).toMatch(/<button type="button" hidden="">Privacy choices<\/button><button type="button">Back to orbit/);
  });

  test('is absent when the site has no Google Analytics ID', () => {
    expect(footer(false)).not.toContain('Privacy choices');
  });
});
