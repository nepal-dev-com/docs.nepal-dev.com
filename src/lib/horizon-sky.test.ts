import { describe, expect, test } from 'bun:test';
import {
  cloudBands,
  cloudPeriod,
  horizonStars,
  observatory,
  planet,
  ridgeY,
  starDisc,
  twinklingCount,
} from './horizon-sky';

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

describe('the ridge', () => {
  test('is the top of the planet at the centre', () => {
    expect(ridgeY(planet.cx)).toBe(planet.cy - planet.r);
  });

  test('falls away on both sides, the same either way', () => {
    expect(ridgeY(300)).toBeGreaterThan(ridgeY(600));
    expect(ridgeY(300)).toBeCloseTo(ridgeY(900), 6);
  });

  test('carries the observatory, tilted with the curve', () => {
    const { x, y, angle } = observatory();
    expect(y).toBeCloseTo(ridgeY(x), 6);
    expect(x).toBeLessThan(planet.cx);
    // Left of the top, the ground rises toward the centre, so the building leans that way.
    expect(angle).toBeLessThan(0);
    expect(angle).toBeGreaterThan(-15);
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

  test("never cross the star's disc", () => {
    const top = starDisc.cy - starDisc.r;
    for (const band of cloudBands()) {
      for (const puff of band.puffs) {
        expect(puff.cy + puff.ry).toBeLessThan(top);
      }
    }
  });

  test('stay above the horizon', () => {
    for (const band of cloudBands()) {
      for (const puff of band.puffs) {
        expect(puff.cy + puff.ry).toBeLessThan(planet.cy - planet.r);
      }
    }
  });
});
