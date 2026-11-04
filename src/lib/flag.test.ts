import { expect, test } from 'bun:test';
import { eightRays, flagCloth, flagFolds, flagFoldsDeep, flagMoonCentre, flagSize, flagSunCentre, twelveRays } from './flag';

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
