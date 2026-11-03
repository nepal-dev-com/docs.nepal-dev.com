import { expect, test } from 'bun:test';
import { flagCloth, flagSize, twelveRays } from './flag';

test('the flag is two pennants, taller than wide, flying from the pole at x=0 (ADR-0036 decision 7)', () => {
  expect(flagSize.height).toBeGreaterThan(flagSize.width);
  expect(flagCloth).toStartWith('M0 0');
  expect(flagCloth.match(/L|H|V/g)?.length).toBeGreaterThanOrEqual(4);
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
