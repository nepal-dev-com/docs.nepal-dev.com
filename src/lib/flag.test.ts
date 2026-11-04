import { describe, expect, test } from 'bun:test';
import { eightRays, flagWave, flagWaveStrips, flagCloth, flagFolds, flagFoldsDeep, flagMoonCentre, flagSize, flagSunCentre, twelveRays } from './flag';

const coordinates = (path: string) =>
  [...path.matchAll(/(-?[\d.]+) (-?[\d.]+)/g)].map((m) => ({ x: Number(m[1]), y: Number(m[2]) }));

test('the flag is taller than wide and flies from the pole at x=0 (ADR-0036 decision 7)', () => {
  expect(flagSize.height).toBeGreaterThan(flagSize.width);
  expect(flagCloth).toStartWith('M0 0');
  for (const { x, y } of coordinates(flagCloth)) {
    expect(x).toBeGreaterThanOrEqual(0);
    expect(x).toBeLessThanOrEqual(flagSize.width);
    expect(y).toBeLessThanOrEqual(flagSize.height);
  }
});

test('its cloth is two pennants: two tips, with the notch between them drawn back toward the pole', () => {
  const ends = flagCloth.split('C').map((segment) => coordinates(segment).at(-1)!);
  const [upperTip, lowerTip] = [ends[3], ends[7]];
  const notch = ends[5];
  expect(upperTip.y).toBeLessThan(notch.y + 1);
  expect(lowerTip.y).toBeGreaterThan(notch.y);
  expect(notch.x).toBeLessThan(Math.min(upperTip.x, lowerTip.x) / 2);
});

test('the moon stands above the sun, both on the side of the pole, clear of the folds', () => {
  expect(flagMoonCentre.cy).toBeLessThan(flagSunCentre.cy);
  const foldStart = Math.min(...[...flagFolds, ...flagFoldsDeep].flatMap((fold) => coordinates(fold).map(({ x }) => x)));
  expect(flagMoonCentre.cx + flagMoonCentre.outer).toBeLessThan(foldStart);
  expect(flagSunCentre.cx + flagSunCentre.outer).toBeLessThan(foldStart);
});

test('the moon shows eight rays, above its horns', () => {
  const { cx, cy, inner, outer } = flagMoonCentre;
  const points = coordinates(eightRays(cx, cy, inner, outer));
  const tips = points.filter(({ x, y }) => Math.abs(Math.hypot(x - cx, y - cy) - outer) < 0.02);
  expect(tips).toHaveLength(8);
  for (const tip of tips) {
    expect(tip.y).toBeLessThan(cy);
  }
});

test('its sun has twelve rays, and stays inside the radius it is given', () => {
  const path = twelveRays(10, 10, 3, 6);
  const points = [...path.matchAll(/(-?[\d.]+) (-?[\d.]+)/g)].map((m) => [Number(m[1]), Number(m[2])]);
  expect(points).toHaveLength(24);
  for (const [x, y] of points) {
    expect(Math.hypot(x - 10, y - 10)).toBeLessThanOrEqual(6.01);
    expect(Math.hypot(x - 10, y - 10)).toBeGreaterThanOrEqual(2.99);
  }
});

describe('the wave (ADR-0037 decisions 5 and 12)', () => {
  const strips = flagWaveStrips();
  // What the keyframes do: from -value to +value and back, once per period.
  const swing = (value: number, at: number, time: number) =>
    -value * Math.cos((2 * Math.PI * (time - at)) / flagWave.period);
  const edge = (strip: (typeof strips)[number], x: number, time: number) =>
    swing(strip.lift, strip.liftAt, time) + Math.tan((swing(strip.tilt, strip.tiltAt, time) * Math.PI) / 180) * (x - strip.x);
  const times = Array.from({ length: 24 }, (_, index) => (index * flagWave.period) / 24);

  test('its strips cover the whole cloth with its border, side by side', () => {
    expect(strips[0].x).toBeLessThan(-0.8);
    expect(strips.at(-1)!.x + strips.at(-1)!.width).toBeGreaterThan(flagSize.width + 0.8);
    strips.slice(1).forEach((strip, index) => {
      expect(strip.x).toBeCloseTo(strips[index].x + strips[index].width, 6);
    });
  });

  test('no step ever opens between two strips, at any moment', () => {
    for (const time of times) {
      strips.slice(1).forEach((strip, index) => {
        const before = strips[index];
        expect(Math.abs(edge(before, before.x + before.width, time) - edge(strip, strip.x, time))).toBeLessThan(0.04);
      });
    }
  });

  test('stays fixed at the pole and swings most at the tips', () => {
    for (const time of times) {
      expect(Math.abs(edge(strips[0], 0, time))).toBeLessThan(0.05);
    }
    const reach = strips.map((strip) => Math.max(...times.map((time) => Math.abs(edge(strip, strip.x, time)))));
    expect(reach.at(-1)).toBeGreaterThan(flagWave.lift * 0.85);
    expect(Math.max(...reach)).toBeLessThanOrEqual(flagWave.lift * 1.05);
  });

  test('travels from the pole to the tips, so it reads as wind and not as a shiver', () => {
    const late = strips.slice(2);
    const peak = (strip: (typeof strips)[number]) =>
      times.reduce((best, time) => (swing(strip.lift, strip.liftAt, time) > swing(strip.lift, strip.liftAt, best) ? time : best), 0);
    expect(new Set(late.map(peak)).size).toBeGreaterThan(late.length / 2);
  });

  test('starts every strip inside one period, so all of them are mid-swing from the first frame', () => {
    for (const strip of strips) {
      for (const at of [strip.liftAt, strip.tiltAt]) {
        expect(at).toBeLessThanOrEqual(0);
        expect(at).toBeGreaterThanOrEqual(-flagWave.period);
      }
    }
  });
});
