import { describe, expect, test } from 'bun:test';
import type { CatalogEntry } from './catalog';
import {
  cometGap,
  cometPath,
  cometStarts,
  corona,
  heroRings,
  lean,
  mixHex,
  orbitDistance,
  spinUp,
  spinUpSeconds,
  systemFacts,
  trailArc,
  trailLength,
} from './hero-sky';

const line = (channel: 'latest' | 'legacy' | 'dev', version: string) =>
  ({ folder: version, name: version, segment: version, version, channel, url: `/x/use/${version}` }) as CatalogEntry['lines'][number];

const entry = (slug: string, kind: 'package' | 'project', ecosystem?: CatalogEntry['ecosystem'], lines: CatalogEntry['lines'] = []) =>
  ({ slug, title: slug, kind, ecosystem, featured: false, url: `/${slug}`, lines }) as CatalogEntry;

const docs = entry('docs', 'project');
const lodestar = entry('lodestar', 'package', 'npm', [line('latest', 'v0.2'), line('legacy', 'v0.1'), line('dev', 'dev')]);
const crate = entry('tidy', 'package', 'cargo');

describe('heroRings (ADR-0032 decision 1)', () => {
  test('always draws the five orbits the subline names, in ring order', () => {
    expect(heroRings([])).toEqual(['npm', 'composer', 'pypi', 'go', 'project']);
    expect(heroRings([docs])).toEqual(['npm', 'composer', 'pypi', 'go', 'project']);
  });

  test('adds Cargo and Other only when an entry is in them', () => {
    expect(heroRings([docs, crate])).toEqual(['npm', 'composer', 'pypi', 'go', 'cargo', 'project']);
    expect(heroRings([entry('misc', 'package')])).toEqual(['npm', 'composer', 'pypi', 'go', 'other', 'project']);
  });
});

describe('systemFacts (ADR-0032 decision 6)', () => {
  test('counts the planets, the empty orbits and the moons', () => {
    const facts = systemFacts([docs]);
    expect(facts.line).toBe('1 planet · 4 orbits waiting · 0 moons');
    expect(facts.waiting).toEqual(['npm', 'composer', 'pypi', 'go']);
  });

  test('counts every version line as a moon, dev included, with plurals', () => {
    expect(systemFacts([docs, lodestar]).line).toBe('2 planets · 3 orbits waiting · 3 moons');
    expect(systemFacts([entry('one', 'package', 'go', [line('latest', 'v1')])]).line).toBe(
      '1 planet · 4 orbits waiting · 1 moon',
    );
  });

  test('says the same thing in a plain sentence', () => {
    expect(systemFacts([docs]).sentence).toBe(
      '1 project documented; npm, Composer, PyPI and Go have none yet; no versions documented yet.',
    );
    expect(systemFacts([docs, lodestar]).sentence).toBe(
      '1 package and 1 project documented; Composer, PyPI and Go have none yet; 3 versions documented.',
    );
  });

  test('with nothing documented, every orbit waits', () => {
    const facts = systemFacts([]);
    expect(facts.line).toBe('0 planets · 5 orbits waiting · 0 moons');
    expect(facts.sentence).toBe('Nothing is documented yet.');
  });

  test('with every orbit taken, nothing waits', () => {
    const all = (['npm', 'composer', 'pypi', 'go'] as const).map((eco) => entry(eco, 'package', eco));
    const facts = systemFacts([...all, docs]);
    expect(facts.line).toBe('5 planets · 0 orbits waiting · 0 moons');
    expect(facts.sentence).toBe('4 packages and 1 project documented; no versions documented yet.');
  });
});

describe('the comet (ADR-0032 decision 7)', () => {
  test('comes every 20 to 30 seconds, the same on every visit', () => {
    const starts = cometStarts(3, 12);
    expect(starts).toEqual(cometStarts(3, 12));
    expect(starts[0]).toBeGreaterThanOrEqual(cometGap[0]);
    starts.slice(1).forEach((start, index) => {
      const gap = start - starts[index];
      expect(gap).toBeGreaterThanOrEqual(cometGap[0]);
      expect(gap).toBeLessThanOrEqual(cometGap[1]);
    });
    expect(new Set(starts.slice(1).map((start, index) => Math.round(start - starts[index]))).size).toBeGreaterThan(2);
  });

  // Below the site header, which the hero's canvas runs under.
  const desktop = { width: 1412, cx: 988, cy: 420, boundary: 1412 * 0.52, top: 72 };
  const phone = { width: 390, cx: 195, cy: 160, boundary: 0, top: 72 };

  for (const [name, area] of [['desktop', desktop], ['phone', phone]] as const) {
    test(`never crosses the text column, head or tail (${name})`, () => {
      for (let index = 0; index < 20; index++) {
        for (let step = 0; step <= 20; step++) {
          const { head, tail } = cometPath(area, index, step / 20);
          expect(Math.min(head.x, tail.x)).toBeGreaterThanOrEqual(area.boundary);
          expect(Math.max(head.y, tail.y)).toBeLessThan(area.cy - 20);
          expect(Math.min(head.y, tail.y)).toBeGreaterThanOrEqual(area.top);
        }
      }
    });
  }

  test('points its tail away from the star', () => {
    for (let index = 0; index < 10; index++) {
      for (const progress of [0.1, 0.5, 0.9]) {
        const { head, tail } = cometPath(desktop, index, progress);
        const away = { x: head.x - desktop.cx, y: head.y - desktop.cy };
        const along = { x: tail.x - head.x, y: tail.y - head.y };
        expect(away.x * along.x + away.y * along.y).toBeGreaterThan(0);
      }
    }
  });

  test('crosses from right to left and fades in and out', () => {
    const first = cometPath(desktop, 0, 0);
    const last = cometPath(desktop, 0, 1);
    expect(first.head.x).toBeGreaterThan(last.head.x);
    expect(first.alpha).toBe(0);
    expect(last.alpha).toBe(0);
    expect(cometPath(desktop, 0, 0.5).alpha).toBe(1);
  });
});

describe('planet trails (ADR-0032 decision 3)', () => {
  test('run a sixth of a turn behind the planet and end at it', () => {
    const { from, to } = trailArc(1.2);
    expect(to).toBe(1.2);
    expect(trailLength).toBeCloseTo(Math.PI / 3, 10);
    expect(to - from).toBeCloseTo(trailLength, 10);
    expect(from).toBeLessThan(to);
  });
});

describe('the arrival (ADR-0032 decision 5)', () => {
  test('starts a third of a turn behind, the star small and dark', () => {
    const start = spinUp(0);
    expect(start.offset).toBeCloseTo((-Math.PI * 2) / 3, 10);
    expect(start.star).toBeCloseTo(0.4, 10);
    expect(start.corona).toBe(0);
    expect(start.orbits).toBe(0);
  });

  test('settles exactly in place after 1.2 seconds', () => {
    expect(spinUpSeconds).toBe(1.2);
    expect(spinUp(1.2)).toEqual({ offset: 0, star: 1, corona: 1, orbits: 1 });
    expect(spinUp(5)).toEqual({ offset: 0, star: 1, corona: 1, orbits: 1 });
  });

  test('eases out: most of the way there by half time', () => {
    const half = spinUp(0.6);
    expect(half.offset).toBeGreaterThan((-Math.PI * 2) / 3 / 4);
    expect(half.offset).toBeLessThan(0);
    expect(half.star).toBe(1);
  });
});

describe('the living star (ADR-0032 decision 2)', () => {
  test('breathes 15% either way over about six seconds', () => {
    expect(corona(0).breath).toBeCloseTo(1, 10);
    expect(corona(1.5).breath).toBeCloseTo(1.15, 10);
    expect(corona(4.5).breath).toBeCloseTo(0.85, 10);
    expect(corona(6).breath).toBeCloseTo(1, 10);
  });

  test('turns its rays once every two minutes', () => {
    expect(corona(0).rays).toBe(0);
    expect(corona(30).rays).toBeCloseTo(Math.PI / 2, 10);
  });
});

describe('pointer depth (ADR-0032 decision 4)', () => {
  test('rests at the drawn tilt with no pointer', () => {
    expect(lean(0, 0)).toEqual({ tilt: 0.36, dx: 0, dy: 0, nebulaX: 0, nebulaY: 0 });
  });

  test('leans up to 0.05 of tilt and 8px, the nebula 12px the other way', () => {
    expect(lean(1, 1)).toEqual({ tilt: 0.41, dx: 8, dy: 8, nebulaX: -12, nebulaY: -12 });
    expect(lean(-1, -1)).toEqual({ tilt: 0.31, dx: -8, dy: -8, nebulaX: 12, nebulaY: 12 });
  });

  test('never leans further, however far the pointer goes', () => {
    expect(lean(4, -9)).toEqual(lean(1, -1));
  });
});

describe('empty orbits (ADR-0032 decision 1)', () => {
  test('a point on the orbit is on it; 10px out along an axis is about 10px away', () => {
    const orbit = { cx: 500, cy: 300, rx: 200, ry: 72 };
    expect(orbitDistance(700, 300, orbit)).toBeCloseTo(0, 6);
    expect(orbitDistance(500, 228, orbit)).toBeCloseTo(0, 6);
    expect(orbitDistance(710, 300, orbit)).toBeCloseTo(10, 0);
    expect(orbitDistance(500, 218, orbit)).toBeCloseTo(10, 0);
  });

  test('the star itself is far from every orbit', () => {
    expect(orbitDistance(500, 300, { cx: 500, cy: 300, rx: 200, ry: 72 })).toBeGreaterThan(8);
  });

  test("are drawn in the line colour mixed with 35% of the ecosystem's", () => {
    expect(mixHex('#000000', '#ffffff', 0.35)).toBe('#595959');
    expect(mixHex('#c4cbd8', '#d4382b', 0)).toBe('#c4cbd8');
    expect(mixHex('rgb(1 2 3)', '#ffffff', 0.35)).toBe('rgb(1 2 3)');
  });
});
