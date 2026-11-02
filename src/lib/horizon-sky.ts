import { starField } from './sky';

/** The Horizon scene's drawing space: an SVG viewBox of 1200 × 260 (ADR-0030). */
export const sceneWidth = 1200;
export const sceneHeight = 260;

/** The planet whose curved edge is the horizon. */
export const planet = { cx: 600, cy: 2260, r: 2040 } as const;

/** The star, risen: it sits on the ridge with its lower part below the curve. */
export const starDisc = { cx: 600, cy: 214, r: 22 } as const;

export const twinklingCount = 14;

export interface HorizonStar {
  x: number;
  y: number;
  r: number;
  o: number;
  twinkle?: { duration: number; delay: number };
}

/** The height of the planet's curve at `x`. */
export function ridgeY(x: number): number {
  return planet.cy - Math.sqrt(planet.r ** 2 - (x - planet.cx) ** 2);
}

const round = (value: number) => Math.round(value * 100) / 100;

/** The scene's sixty stars, seeded as before; every fourth one twinkles, out of step with the rest. */
export function horizonStars(): HorizonStar[] {
  const field = starField({ seed: 3, count: 60, width: sceneWidth, height: 170, clear: 0, even: true });
  return field.map((star, index) => {
    const base = { x: star.x, y: star.y, r: star.r, o: star.o };
    if (index % 4 !== 0 || index / 4 >= twinklingCount) {
      return base;
    }
    return {
      ...base,
      twinkle: { duration: round(3 + ((index * 37) % 41) / 10), delay: -round(((index * 53) % 70) / 10) },
    };
  });
}

/** Where the observatory stands: on the ridge left of the star, leaning with the curve. */
export function observatory() {
  const x = 418;
  const slope = (x - planet.cx) / Math.sqrt(planet.r ** 2 - (x - planet.cx) ** 2);
  return { x, y: ridgeY(x), angle: round((Math.atan(slope) * 180) / Math.PI) };
}

export interface Puff {
  cx: number;
  cy: number;
  rx: number;
  ry: number;
}

export interface CloudBand {
  puffs: Puff[];
  /** Seconds for one full loop sideways. */
  duration: number;
}

/** A band is drawn twice across a 2400-wide strip, so sliding it by one period loops seamlessly. */
export const cloudPeriod = sceneWidth;

const bands = [
  { seed: 71, y: 112, count: 3, rx: [80, 140], ry: [6, 10], duration: 200 },
  { seed: 113, y: 150, count: 3, rx: [60, 110], ry: [5, 8], duration: 140 },
  // The nearest band passes in front of the star's glow, kept thin so it never reaches the disc.
  { seed: 197, y: 180, count: 2, rx: [50, 90], ry: [3, 5], duration: 90 },
];

/** The three lit cloud bands, farthest first (ADR-0030 decision 2). */
export function cloudBands(): CloudBand[] {
  return bands.map(({ seed, y, count, rx, ry, duration }) => {
    let state = seed;
    const next = () => (state = (state * 16807) % 2147483647) / 2147483647;
    // Kept clear of the period's ends, so no puff is cut where the loop restarts.
    const margin = rx[1] * 1.2;
    const span = cloudPeriod - 2 * margin;
    // Each cloud is a long base with two or three smaller lumps on top, so its outline is uneven.
    const puffs = Array.from({ length: count }, (_, index) => {
      const base = {
        cx: round(margin + ((index + 0.2 + next() * 0.6) * span) / count),
        cy: round(y + (next() - 0.5) * 6),
        rx: round(rx[0] + next() * (rx[1] - rx[0])),
        ry: round(ry[0] + next() * (ry[1] - ry[0])),
      };
      const lumps = Array.from({ length: 2 + Math.floor(next() * 2) }, () => ({
        cx: round(base.cx + (next() - 0.5) * base.rx * 1.1),
        cy: round(base.cy - base.ry * (0.35 + next() * 0.45)),
        rx: round(base.rx * (0.22 + next() * 0.28)),
        ry: round(base.ry * (0.8 + next() * 0.4)),
      }));
      return [base, ...lumps];
    }).flat();
    return { puffs: [...puffs, ...puffs.map((puff) => ({ ...puff, cx: round(puff.cx + cloudPeriod) }))], duration };
  });
}
