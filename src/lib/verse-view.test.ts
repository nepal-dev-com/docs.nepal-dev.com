import { expect, test } from 'bun:test';
import { easeZoom, farPlanets, systemScale, verseFragment } from './verse-view';

test('the Verse view opens from #verse (ADR-0029 decision 5)', () => {
  expect(verseFragment).toBe('#verse');
});

test('the zoom eases toward its target and settles in about 1.2 seconds', () => {
  let zoom = 0;
  for (let time = 0; time < 0.4; time += 1 / 60) {
    zoom = easeZoom(zoom, 1, 1 / 60, false);
  }
  expect(zoom).toBeGreaterThan(0.6);
  expect(zoom).toBeLessThan(0.95);
  for (let time = 0.4; time < 1.2; time += 1 / 60) {
    zoom = easeZoom(zoom, 1, 1 / 60, false);
  }
  expect(zoom).toBeGreaterThan(0.99);
});

test('it eases back in the same way', () => {
  expect(easeZoom(1, 0, 1 / 60, false)).toBeLessThan(1);
  expect(easeZoom(1, 0, 1 / 60, false)).toBeGreaterThan(0.9);
});

test('with reduced motion it changes at once', () => {
  expect(easeZoom(0, 1, 1 / 60, true)).toBe(1);
  expect(easeZoom(1, 0, 1 / 60, true)).toBe(0);
});

test('the system shrinks to about two fifths in the Verse view', () => {
  expect(systemScale(0)).toBe(1);
  expect(systemScale(1)).toBeCloseTo(0.4);
  expect(systemScale(0.5)).toBeCloseTo(0.7);
});

test('the far planets sit beyond the system, inside the canvas', () => {
  const planets = farPlanets(['harbor-ops', 'fieldnote', 'tessera'], { cx: 600, cy: 300, reach: 280, width: 1000, height: 600 });
  expect(planets.map((planet) => planet.name)).toEqual(['harbor-ops', 'fieldnote', 'tessera']);
  for (const planet of planets) {
    expect(Math.hypot(planet.x - 600, (planet.y - 300) / 0.36)).toBeGreaterThan(200);
    expect(planet.x).toBeGreaterThan(0);
    expect(planet.x).toBeLessThan(1000 - 80);
    expect(planet.y).toBeGreaterThan(0);
    expect(planet.y).toBeLessThan(600);
  }
});

test('on a narrow canvas the far planets pull in to stay on screen', () => {
  const planets = farPlanets(['harbor-ops', 'fieldnote', 'tessera'], { cx: 195, cy: 160, reach: 260, width: 390, height: 320 });
  for (const planet of planets) {
    expect(planet.x).toBeGreaterThan(0);
    expect(planet.x).toBeLessThan(390 - 80);
  }
});

test('no private names, no far planets', () => {
  expect(farPlanets([], { cx: 600, cy: 300, reach: 280, width: 1000, height: 600 })).toEqual([]);
});
