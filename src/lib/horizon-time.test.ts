import { describe, expect, test } from 'bun:test';
import { sceneScale } from './horizon-sky';
import {
  bodyPlace,
  bodyRadius,
  brightness,
  crossedBodies,
  dayParts,
  glowSize,
  horizonVars,
  minuteOfDay,
  moonAge,
  moonLit,
  moonShadePath,
  redStrength,
  skyArc,
  synodicMonth,
  type Body,
} from './horizon-time';

const at = (hours: number, minutes = 0) => hours * 60 + minutes;
const everyMinute = Array.from({ length: 1440 }, (_, minute) => minute);
const bodies: Body[] = ['sun', 'moon'];

describe('where the sun and the moon stand (ADR-0040 decisions 3 and 4)', () => {
  test('the sun crosses from 6:00 to 18:00, highest at noon', () => {
    expect(bodyPlace('sun', at(6))).toMatchObject({ x: skyArc.left.x, y: skyArc.left.y });
    expect(bodyPlace('sun', at(12))).toMatchObject({ x: skyArc.top.x, y: skyArc.top.y });
    expect(bodyPlace('sun', at(16, 30)).x).toBe(750);
  });

  test('the moon crosses from 18:00 to 6:00, highest at midnight', () => {
    expect(bodyPlace('moon', at(18))).toMatchObject({ x: skyArc.left.x, y: skyArc.left.y });
    expect(bodyPlace('moon', at(0))).toMatchObject({ x: skyArc.top.x, y: skyArc.top.y });
  });

  test('rises as it goes up and falls as it comes down, left to right', () => {
    for (const body of bodies) {
      const start = body === 'sun' ? at(6) : at(18);
      const places = [0, 180, 360, 540].map((offset) => bodyPlace(body, (start + offset) % 1440));
      for (let index = 1; index < places.length; index++) {
        expect(places[index].x).toBeGreaterThan(places[index - 1].x);
      }
      expect(places[1].y).toBeLessThan(places[0].y);
      expect(places[3].y).toBeGreaterThan(places[2].y);
    }
  });

  test('the sun rests low on the right until midnight, then low on the left until 6:00', () => {
    for (const minute of [at(18, 1), at(21), at(23, 59)]) {
      expect(bodyPlace('sun', minute)).toMatchObject({ x: skyArc.right.x, y: skyArc.right.y, progress: null });
    }
    for (const minute of [at(0), at(3), at(5, 59)]) {
      expect(bodyPlace('sun', minute)).toMatchObject({ x: skyArc.left.x, y: skyArc.left.y, progress: null });
    }
  });

  test('the moon rests low on the right until noon, then low on the left until 18:00', () => {
    expect(bodyPlace('moon', at(9))).toMatchObject({ x: skyArc.right.x, progress: null });
    expect(bodyPlace('moon', at(15))).toMatchObject({ x: skyArc.left.x, progress: null });
  });

  test('jumps only once a day, at its crossing, and moves smoothly every other minute', () => {
    for (const body of bodies) {
      const jumps = everyMinute.filter((minute) => {
        const [a, b] = [bodyPlace(body, minute), bodyPlace(body, (minute + 1) % 1440)];
        return Math.hypot(a.x - b.x, a.y - b.y) > 2;
      });
      expect(jumps).toEqual([body === 'sun' ? at(23, 59) : at(11, 59)]);
    }
  });

  test('stays whole on the narrowest phone at every minute (ADR-0037 decision 11)', () => {
    const half = 320 / 2 / sceneScale(320);
    for (const body of bodies) {
      for (const minute of everyMinute) {
        const { x, y } = bodyPlace(body, minute);
        expect(Math.abs(x - 600) + bodyRadius[body]).toBeLessThan(half);
        expect(y - bodyRadius[body]).toBeGreaterThan(0);
      }
    }
  });

  test('reads the local hour and minute off the clock', () => {
    expect(minuteOfDay(new Date(2026, 10, 4, 16, 30, 40))).toBe(at(16, 30));
  });
});

describe('how bright it is (ADR-0040 decision 4)', () => {
  test('is full while it crosses and dim while it rests, the moon paler than the sun', () => {
    expect(brightness('sun', at(12))).toBe(1);
    expect(brightness('moon', at(0))).toBe(1);
    expect(brightness('sun', at(2))).toBeLessThan(1);
    expect(brightness('moon', at(15))).toBeLessThan(brightness('sun', at(2)));
  });

  test('never steps as a crossing starts or ends', () => {
    for (const body of bodies) {
      for (const minute of everyMinute) {
        const next = (minute + 1) % 1440;
        expect(Math.abs(brightness(body, minute) - brightness(body, next))).toBeLessThan(0.02);
      }
    }
  });

  test('keeps its glow inside the scene at every minute, so its top is never cut off', () => {
    for (const body of bodies) {
      for (const minute of everyMinute) {
        const { y } = bodyPlace(body, minute);
        expect(y + 22 - 150 * glowSize(body, minute)).toBeGreaterThanOrEqual(-0.01);
        expect(glowSize(body, minute)).toBeGreaterThan(0);
      }
    }
  });

  test('has a smaller glow while it rests than when it is low in a crossing', () => {
    expect(glowSize('sun', at(2))).toBeLessThan(glowSize('sun', at(17)));
  });
});

describe('the parts of the day (ADR-0040 decision 7)', () => {
  test('are one whole at every minute', () => {
    for (const minute of everyMinute) {
      const { dawn, day, dusk, night } = dayParts(minute);
      expect(dawn + day + dusk + night).toBeCloseTo(1, 2);
    }
  });

  test('are pure at the heart of each part', () => {
    expect(dayParts(at(6)).dawn).toBe(1);
    expect(dayParts(at(12)).day).toBe(1);
    expect(dayParts(at(18)).dusk).toBe(1);
    expect(dayParts(at(0)).night).toBe(1);
  });

  test('blend across each edge, never stepping', () => {
    expect(dayParts(at(7)).dawn).toBeCloseTo(0.5, 2);
    expect(dayParts(at(7)).day).toBeCloseTo(0.5, 2);
    for (const minute of everyMinute) {
      const [a, b] = [dayParts(minute), dayParts((minute + 1) % 1440)];
      expect(Math.abs(a.night - b.night)).toBeLessThan(0.05);
      expect(Math.abs(a.day - b.day)).toBeLessThan(0.05);
    }
  });
});

describe('the red faces (ADR-0040 decision 8)', () => {
  test('never fall below 20%, so the logo stays recognisable', () => {
    for (const body of bodies) {
      for (const minute of everyMinute) {
        expect(redStrength(body, minute)).toBeGreaterThanOrEqual(0.2);
      }
    }
  });

  test('are full with the sun low on the right, about 60% at noon and faint on the left', () => {
    expect(redStrength('sun', at(18))).toBe(1);
    expect(redStrength('sun', at(12))).toBeCloseTo(0.6, 2);
    expect(redStrength('sun', at(6))).toBeCloseTo(0.2, 2);
    expect(redStrength('sun', at(3))).toBeCloseTo(0.2, 2);
  });

  test('reach at most 55% under the moon', () => {
    for (const minute of everyMinute) {
      expect(redStrength('moon', minute)).toBeLessThanOrEqual(0.55);
    }
    expect(redStrength('moon', at(6))).toBeCloseTo(0.55, 2);
  });

  test('settle after a crossing instead of stepping down', () => {
    for (const body of bodies) {
      for (const minute of everyMinute) {
        expect(Math.abs(redStrength(body, minute) - redStrength(body, (minute + 1) % 1440))).toBeLessThan(0.02);
      }
    }
  });
});

describe("the moon's phase (ADR-0040 decision 6)", () => {
  // New moons of 2026, UTC, from a table computed with Meeus's algorithm.
  const newMoons = [
    '2026-01-18T19:53Z',
    '2026-03-19T01:25Z',
    '2026-05-16T20:03Z',
    '2026-07-14T09:45Z',
    '2026-08-12T17:38Z',
    '2026-10-10T15:51Z',
    '2026-12-09T00:53Z',
  ];

  test('is within about half a day of each published new moon', () => {
    for (const moment of newMoons) {
      const age = moonAge(new Date(moment));
      const offBy = Math.min(age, 1 - age) * synodicMonth;
      expect(offBy).toBeLessThan(0.65);
    }
  });

  test('is full about half a month after a new moon', () => {
    const later = new Date(new Date(newMoons[4]).getTime() + (synodicMonth / 2) * 86400000);
    expect(Math.abs(moonAge(later) - 0.5)).toBeLessThan(0.03);
  });

  test('stays between 0 and 1, before the reference date too', () => {
    for (const moment of ['1990-05-01T00:00Z', '2000-01-06T18:14Z', '2099-12-31T23:59Z']) {
      const age = moonAge(new Date(moment));
      expect(age).toBeGreaterThanOrEqual(0);
      expect(age).toBeLessThan(1);
    }
  });

  test('the same instant gives the same phase in every timezone', () => {
    expect(moonAge(new Date('2026-11-04T23:30:00+05:45'))).toBe(moonAge(new Date('2026-11-04T17:45:00Z')));
  });
});

describe('how much of the moon is lit (ADR-0040 decision 6)', () => {
  test('is nothing at new, half at each half moon and all at full', () => {
    expect(moonLit(0)).toBeCloseTo(0, 3);
    expect(moonLit(0.25)).toBeCloseTo(0.5, 3);
    expect(moonLit(0.5)).toBeCloseTo(1, 3);
    expect(moonLit(0.75)).toBeCloseTo(0.5, 3);
  });

  test('is given to the footer, so a dark moon carries no bright halo', () => {
    expect(horizonVars(new Date('2026-11-24T14:53:00Z'))['--moon-lit']).toMatch(/^(0\.9\d*|1)$/);
    expect(Number(horizonVars(new Date('2026-11-09T07:02:00Z'))['--moon-lit'])).toBeLessThan(0.05);
  });
});

describe("the moon's shadow (ADR-0040 decision 6)", () => {
  const arcs = (path: string) =>
    [...path.matchAll(/A([\d.]+) ([\d.]+) 0 0 ([01]) (-?[\d.]+) (-?[\d.]+)/g)].map((m) => ({
      rx: Number(m[1]),
      sweep: Number(m[3]),
    }));

  test('covers the whole disc at a new moon', () => {
    const [limb, terminator] = arcs(moonShadePath(0, 20));
    expect(limb.rx).toBe(20);
    expect(terminator.rx).toBe(20);
    expect(limb.sweep).toBe(terminator.sweep);
  });

  test('closes to nothing at a full moon', () => {
    const [limb, terminator] = arcs(moonShadePath(0.5, 20));
    expect(terminator.rx).toBe(20);
    expect(limb.sweep).not.toBe(terminator.sweep);
  });

  test('is a straight line across the middle at each half moon', () => {
    expect(arcs(moonShadePath(0.25, 20))[1].rx).toBe(0);
    expect(arcs(moonShadePath(0.75, 20))[1].rx).toBe(0);
  });

  test('lies on the left while the moon waxes and on the right while it wanes, as seen from the Himalaya', () => {
    expect(moonShadePath(0.1, 20)).toStartWith('M0 -20 A20 20 0 0 0 0 20');
    expect(moonShadePath(0.9, 20)).toStartWith('M0 -20 A20 20 0 0 1 0 20');
  });
});

describe('what the footer is given (ADR-0040 decision 11)', () => {
  const vars = horizonVars(new Date(2026, 10, 4, 16, 30));

  test('carries the hour for both bodies, because the theme chooses between them in CSS', () => {
    expect(vars['--sun-x']).toBe('750px');
    expect(vars['--moon-x']).toBe(`${skyArc.left.x}px`);
    for (const name of ['--sun-bright', '--moon-bright', '--sun-glow-size', '--moon-glow-size', '--red-sun', '--red-moon']) {
      expect(vars[name]).toMatch(/^[\d.]+$/);
    }
  });

  test('carries the parts of the day, and the warm and cool light they make', () => {
    const dusk = horizonVars(new Date(2026, 10, 4, 18));
    expect(dusk['--dusk']).toBe('1');
    expect(dusk['--warm']).toBe('1');
    expect(dusk['--cool']).toBe('0');
    const night = horizonVars(new Date(2026, 10, 4, 1));
    expect(night['--night']).toBe('1');
    expect(night['--cool']).toBe('1');
    expect(night['--warm']).toBe('0');
  });

  test('names only the body that jumped, so the other one never blinks', () => {
    const on = (hours: number, minutes = 0) => horizonVars(new Date(2026, 10, 4, hours, minutes));
    expect(crossedBodies(on(23, 59), on(0))).toEqual(['sun']);
    expect(crossedBodies(on(11, 59), on(12))).toEqual(['moon']);
    expect(crossedBodies(on(16, 30), on(16, 31))).toEqual([]);
  });

  test('names both when a tab comes back after hours away', () => {
    expect(crossedBodies(horizonVars(new Date(2026, 10, 4, 7)), horizonVars(new Date(2026, 10, 4, 17)))).toEqual(['sun', 'moon']);
  });

  test('holds no time and no location that could leave the page, only how to draw it', () => {
    expect(Object.keys(vars).every((name) => name.startsWith('--'))).toBe(true);
  });
});
