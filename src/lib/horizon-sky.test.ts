import { describe, expect, test } from 'bun:test';
import {
  alpenglow,
  cloudBands,
  cloudPeriod,
  farRange,
  flagPole,
  flagScale,
  flagTop,
  horizonStars,
  lightSpots,
  lightsFor,
  midRange,
  nearRange,
  observatory,
  planet,
  rangeY,
  ridgeY,
  sceneScale,
  snow,
  snowShade,
  bodyGlow,
  bodyHome,
  summit,
  traceFor,
  twinklingCount,
  worldView,
  type Point,
} from './horizon-sky';
import { flagSize, flagWave } from './flag';
import { bodyRadius, skyArc } from './horizon-time';

describe('the scene stars (ADR-0030 decision 2)', () => {
  test('are the same on every build', () => {
    expect(horizonStars()).toEqual(horizonStars());
  });

  test('keep the sixty stars, fourteen of them twinkling', () => {
    const stars = horizonStars();
    expect(stars).toHaveLength(60);
    expect(stars.filter((star) => star.twinkle)).toHaveLength(twinklingCount);
    expect(twinklingCount).toBe(14);
  });

  test('each twinkle takes 3 to 7 seconds and they start out of step', () => {
    const twinkling = horizonStars().filter((star) => star.twinkle);
    for (const star of twinkling) {
      expect(star.twinkle!.duration).toBeGreaterThanOrEqual(3);
      expect(star.twinkle!.duration).toBeLessThanOrEqual(7);
      expect(star.twinkle!.delay).toBeLessThanOrEqual(0);
    }
    expect(new Set(twinkling.map((star) => star.twinkle!.delay)).size).toBeGreaterThan(7);
  });

  test('stay in the sky, above the horizon', () => {
    for (const star of horizonStars()) {
      expect(star.y).toBeLessThan(ridgeY(star.x));
    }
  });
});

describe('the ground (ADR-0037 decision 1)', () => {
  test('is the top of the planet at the centre', () => {
    expect(ridgeY(planet.cx)).toBe(planet.cy - planet.r);
  });

  test('falls away on both sides, the same either way', () => {
    expect(ridgeY(300)).toBeGreaterThan(ridgeY(600));
    expect(ridgeY(300)).toBeCloseTo(ridgeY(900), 6);
  });
});

const inside = (points: Point[], x: number, y: number) => {
  let hit = false;
  for (let a = 0, b = points.length - 1; a < points.length; b = a++) {
    const [pa, pb] = [points[a], points[b]];
    if (pa.y > y !== pb.y > y && x < ((pb.x - pa.x) * (y - pa.y)) / (pb.y - pa.y) + pa.x) {
      hit = !hit;
    }
  }
  return hit;
};

describe('the range (ADR-0037 decision 1)', () => {
  test('is the same on every build', () => {
    expect(farRange()).toEqual(farRange());
    expect(midRange()).toEqual(midRange());
  });

  test('has its summit at the centre, the highest point of all three ranges', () => {
    const tops = [...farRange(), ...midRange(), ...nearRange].map((point) => point.y);
    expect(summit.x).toBe(planet.cx);
    expect(Math.min(...tops)).toBe(summit.y);
  });

  test('runs past both edges of the widest screen the world is drawn for', () => {
    for (const range of [farRange(), midRange(), nearRange]) {
      expect(range[0].x).toBeLessThanOrEqual(worldView.x);
      expect(range.at(-1)!.x).toBeGreaterThanOrEqual(worldView.x + worldView.width);
    }
  });

  test('leaves the place the sun or moon stands without scripts clear of the far and middle ranges', () => {
    for (const range of [farRange(), midRange()]) {
      expect(rangeY(range, bodyHome.x)).toBeGreaterThan(bodyHome.y + bodyHome.clear);
    }
  });

  test('lights only the side facing the star (ADR-0037 decision 4)', () => {
    for (const face of alpenglow) {
      const top = face.reduce((high, point) => (point.y < high.y ? point : high));
      const right = face.filter((point) => point.x > top.x).length;
      expect(right).toBeGreaterThan(face.length / 2);
    }
  });

  test('carries the observatory on its left shoulder, nearly upright (ADR-0037 decision 9)', () => {
    const { x, y, angle } = observatory();
    expect(x).toBeLessThan(summit.x);
    expect(y).toBeCloseTo(rangeY(nearRange, x), 6);
    expect(Math.abs(angle)).toBeLessThanOrEqual(8);
  });

  test('flies the flag from the summit, inside the scene', () => {
    expect(flagPole.x).toBe(summit.x);
    expect(flagPole.foot).toBeGreaterThanOrEqual(summit.y);
    expect(flagPole.top).toBeGreaterThan(0);
    expect(flagTop).toBeGreaterThan(flagPole.top);
  });

  test('lets the cloth fly clear of the summit (ADR-0037 decision 5)', () => {
    expect(flagTop + (flagSize.height + flagWave.lift) * flagScale).toBeLessThan(summit.y);
  });

  test('keeps the logo\'s five peaks: both shoulders, the summit and two before it', () => {
    expect(snow).toHaveLength(5);
    expect(snowShade).toHaveLength(5);
    for (const patch of [...snow, ...snowShade, ...alpenglow]) {
      for (const point of patch) {
        expect(point.y).toBeGreaterThanOrEqual(summit.y);
        expect(point.y).toBeGreaterThanOrEqual(rangeY(nearRange, point.x) - 0.5);
        expect(point.y).toBeLessThan(ridgeY(point.x));
      }
    }
  });

  test('sinks its foothills into the planet, so no strip of rock runs along the ground to the screen edge', () => {
    for (const x of [worldView.x, -600, -300, 0, 120, 1080, 1500, 1800, worldView.x + worldView.width]) {
      expect(rangeY(nearRange, x)).toBeGreaterThan(ridgeY(x));
    }
  });

  test('fades the glow out before the top of the scene from the place it stands without scripts', () => {
    expect(bodyHome.y + bodyGlow.below - bodyGlow.ry).toBeGreaterThanOrEqual(0);
  });

  test('leaves that place clear of the near range too', () => {
    expect(rangeY(nearRange, bodyHome.x)).toBeGreaterThan(bodyHome.y + bodyHome.clear);
  });
});

describe('the scene at every width (ADR-0037 decision 11)', () => {
  // The world scales with the scene's height alone, so nothing is ever cropped from the top.
  const widths = [320, 390, 860, 1412, 1920, 2560];

  test('keeps the flag and the place the sun or moon stands without scripts on screen', () => {
    for (const width of widths) {
      const scale = sceneScale(width);
      const half = width / 2 / scale;
      expect(flagPole.x + flagSize.width * flagScale - planet.cx).toBeLessThan(half);
      expect(Math.abs(bodyHome.x + bodyHome.clear - planet.cx)).toBeLessThan(half);
    }
  });

  test('stays big enough to read on a phone and fills the widest screen', () => {
    expect(sceneScale(320)).toBeGreaterThan(0.6);
    for (const width of widths) {
      expect(worldView.width * sceneScale(width)).toBeGreaterThanOrEqual(width);
    }
  });
});

const entry = (slug: string, ring = 'npm', kind: 'package' | 'project' = 'package') => ({ slug, ring, kind }) as never;

describe('the lights (ADR-0037 decision 7)', () => {
  test('every spot stands on rock, clear of the snow and the red', () => {
    for (const spot of lightSpots) {
      expect(inside(nearRange, spot.x, spot.y)).toBe(true);
      for (const patch of [...alpenglow, ...snow, ...snowShade]) {
        expect(inside(patch, spot.x, spot.y)).toBe(false);
      }
      expect(spot.y).toBeLessThan(ridgeY(spot.x) - 4);
    }
  });

  test('no two spots touch', () => {
    lightSpots.forEach((a, index) => {
      for (const b of lightSpots.slice(index + 1)) {
        expect(Math.hypot(a.x - b.x, a.y - b.y)).toBeGreaterThan(22);
      }
    });
  });

  test('every spot can be seen on the narrowest phone', () => {
    const half = 320 / 2 / sceneScale(320);
    for (const spot of lightSpots) {
      expect(Math.abs(spot.x - planet.cx)).toBeLessThan(half);
    }
  });

  test('an entry keeps its spot from build to build, whatever order it comes in', () => {
    const a = lightsFor([entry('lodestar'), entry('docs'), entry('tidy')]);
    const b = lightsFor([entry('tidy'), entry('lodestar'), entry('docs')]);
    expect(a).toEqual(b);
  });

  test('two entries never share a spot', () => {
    const many = Array.from({ length: lightSpots.length }, (_, index) => entry(`package-${index}`));
    expect(new Set(lightsFor(many).map((light) => light.spot)).size).toBe(lightSpots.length);
  });

  test('past the number of spots, the rest are left to the planet row', () => {
    const many = Array.from({ length: lightSpots.length + 5 }, (_, index) => entry(`package-${index}`));
    expect(lightsFor(many)).toHaveLength(lightSpots.length);
  });

  test('no entries, no lights', () => {
    expect(lightsFor([])).toEqual([]);
  });

  test('a trace runs from its light down into the ground', () => {
    const [spot] = lightSpots;
    const points = [...traceFor(spot).matchAll(/(-?[\d.]+) (-?[\d.]+)/g)].map((m) => Number(m[2]));
    expect(points[0]).toBe(spot.y);
    expect(points.at(-1)).toBeGreaterThan(ridgeY(spot.x));
  });
});

describe('the lit clouds', () => {
  test('are three bands, each repeating once across the strip so its loop is seamless', () => {
    const bands = cloudBands();
    expect(bands).toHaveLength(3);
    for (const band of bands) {
      const first = band.puffs.filter((puff) => puff.cx < cloudPeriod);
      const second = band.puffs.filter((puff) => puff.cx >= cloudPeriod);
      expect(second).toHaveLength(first.length);
      second.forEach((puff, index) => {
        expect(puff.cx - first[index].cx).toBeCloseTo(cloudPeriod, 6);
        expect({ ...puff, cx: 0 }).toEqual({ ...first[index], cx: 0 });
      });
    }
  });

  test('keep every puff inside its period, so none is cut where the loop restarts', () => {
    for (const band of cloudBands()) {
      for (const puff of band.puffs.filter((item) => item.cx < cloudPeriod)) {
        expect(puff.cx - puff.rx).toBeGreaterThanOrEqual(0);
        expect(puff.cx + puff.rx).toBeLessThanOrEqual(cloudPeriod);
      }
    }
  });

  test('loop over 90, 140 and 200 seconds', () => {
    expect(cloudBands().map((band) => band.duration)).toEqual([200, 140, 90]);
  });

  test('float below the sun or moon wherever it rests, between the ranges (ADR-0037 decision 2)', () => {
    const bottom = skyArc.left.y + bodyRadius.sun;
    for (const band of cloudBands()) {
      for (const puff of band.puffs) {
        expect(puff.cy - puff.ry).toBeGreaterThan(bottom);
      }
    }
  });

  test('stay above the ground', () => {
    for (const band of cloudBands()) {
      for (const puff of band.puffs) {
        expect(puff.cy + puff.ry).toBeLessThan(planet.cy - planet.r);
      }
    }
  });
});
