import { expect, test } from 'bun:test';
import { pageSky, headerSky, starField, starSizes } from './sky';

const field = { seed: 7, count: 120, width: 2560, height: 1600, clear: 600 };

test('the same seed draws the same sky', () => {
  expect(starField(field)).toEqual(starField(field));
});

test('another seed draws another sky', () => {
  expect(starField({ ...field, seed: 8 })).not.toEqual(starField(field));
});

test('it draws as many stars as asked, inside the field', () => {
  const stars = starField(field);
  expect(stars).toHaveLength(120);
  for (const star of stars) {
    expect(star.x).toBeGreaterThanOrEqual(0);
    expect(star.x).toBeLessThanOrEqual(2560);
    expect(star.y).toBeGreaterThanOrEqual(0);
    expect(star.y).toBeLessThanOrEqual(1600);
  }
});

test('no star falls in the cleared band around the content (ADR-0029 decision 3)', () => {
  for (const star of starField(field)) {
    expect(Math.abs(star.x - 1280)).toBeGreaterThanOrEqual(600);
  }
});

test('stars thicken toward the edges', () => {
  const stars = starField({ ...field, count: 2000 });
  const outer = stars.filter((star) => Math.abs(star.x - 1280) > 960).length;
  const inner = stars.filter((star) => Math.abs(star.x - 1280) <= 960).length;
  expect(outer).toBeGreaterThan(inner);
});

test('three sizes of star, mostly small, at low opacity', () => {
  const stars = starField({ ...field, count: 2000 });
  expect(starSizes).toEqual([0.6, 1, 1.6]);
  for (const star of stars) {
    expect(starSizes as readonly number[]).toContain(star.r);
    expect(star.o).toBeGreaterThanOrEqual(0.25);
    expect(star.o).toBeLessThanOrEqual(0.6);
  }
  const small = stars.filter((star) => star.r === 0.6).length;
  const large = stars.filter((star) => star.r === 1.6).length;
  expect(small).toBeGreaterThan(large * 3);
});

test('only the larger stars are bright', () => {
  for (const star of starField({ ...field, count: 500 })) {
    if (star.bright) {
      expect(star.r).toBeGreaterThan(0.6);
    }
  }
});

test('a field with no cleared band spreads across the whole width', () => {
  const stars = starField({ seed: 3, count: 400, width: 2560, height: 60, clear: 0 });
  expect(stars.some((star) => Math.abs(star.x - 1280) < 200)).toBe(true);
  expect(stars.every((star) => star.y >= 0 && star.y <= 60)).toBe(true);
});

test('an even field spreads its stars evenly, for the header band', () => {
  const stars = starField({ seed: 3, count: 2000, width: 2560, height: 60, clear: 0, even: true });
  const middle = stars.filter((star) => Math.abs(star.x - 1280) < 640).length;
  expect(middle).toBeGreaterThan(850);
  expect(middle).toBeLessThan(1150);
});

test('most of the header sky falls inside a wide header', () => {
  const inside = headerSky.filter((star) => Math.abs(star.x - 1280) < 776).length;
  expect(inside).toBeGreaterThan(headerSky.length / 2);
});

test('the page sky and the header sky are fixed fields', () => {
  expect(pageSky.length).toBeGreaterThan(80);
  expect(pageSky.length).toBeLessThan(400);
  expect(headerSky.length).toBeGreaterThan(10);
  expect(headerSky.length).toBeLessThan(100);
});
