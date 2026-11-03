import { starField } from './sky';

/** The scene's drawing space: stars and clouds on a 1200 × 330 view (ADR-0030, ADR-0037). */
export const sceneWidth = 1200;
export const sceneHeight = 330;

/**
 * The world: the star, the moon, the ranges and the ground. It scales with the scene's height alone and
 * runs far past the screen on both sides, so its top is never cropped (ADR-0037 decision 11).
 */
export const worldView = { x: -1200, width: 3600 } as const;

/** The scene's scale at a screen width, matching `.horizon-scene` in `site.css`. */
export function sceneScale(width: number): number {
  return Math.min(360, Math.max(230, width * 0.28)) / sceneHeight;
}

/** The planet under the range, curved gently enough to reach past the widest screen. */
export const planet = { cx: 600, cy: 24296, r: 24000 } as const;

/** The star, risen: right of the summit, so everything lit is lit from the right (ADR-0037 decision 3). */
export const starDisc = { cx: 690, cy: 128, r: 24 } as const;

/** Directly above the star, the flag's moon over its sun (ADR-0037 decision 6). */
export const moon = { cx: 690, cy: 54, r: 15 } as const;

export const summit = { x: 600, y: 92 } as const;

/** The pole stands on the summit; the cloth, 41 tall at this scale, flies at its top. */
export const flagPole = { x: 600, top: 28, foot: 96 } as const;

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
  const field = starField({ seed: 3, count: 60, width: sceneWidth, height: 190, clear: 0, even: true });
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

export interface Point {
  x: number;
  y: number;
}

const points = (list: number[][]): Point[] => list.map(([x, y]) => ({ x, y }));

const seededRandom = (seed: number) => {
  let state = seed;
  return () => (state = (state * 16807) % 2147483647) / 2147483647;
};

// Sawtooth peaks with seeded heights, past both edges of the world.
function peaks(seed: number, top: number, floor: number, step: number): Point[] {
  const next = seededRandom(seed);
  const result: Point[] = [];
  for (let x = worldView.x - 2 * step, up = true; x <= worldView.x + worldView.width + 2 * step; x += step, up = !up) {
    const y = up ? top + next() * 26 : floor + next() * 22;
    result.push({ x: round(x + (next() - 0.5) * step * 0.5), y: round(y) });
  }
  return result;
}

/** The hazy range at the back. */
export const farRange = () => peaks(29, 168, 200, 66);
/** The range the clouds wade through. */
export const midRange = () => peaks(61, 204, 240, 84);

/** The near range, drawn from the logo's silhouette: a summit between two shoulders (ADR-0037 decision 1). */
export const nearRange: Point[] = points([
  [-1240, 306], [120, 288], [240, 276], [330, 262], [382, 232], [408, 232], [425, 246], [455, 196], [492, 158], [520, 174],
  [548, 134], [574, 116], [600, 92], [628, 124], [650, 140], [676, 178], [706, 206], [742, 162], [770, 146],
  [800, 186], [838, 216], [880, 240], [960, 262], [1060, 282], [2440, 306],
]);

/** The snow on the summit and the two shoulders. */
export const snow: Point[][] = [
  points([[600, 92], [628, 124], [638, 152], [622, 146], [612, 176], [600, 148], [590, 168], [578, 146], [562, 160], [574, 116]]),
  points([[492, 158], [520, 174], [508, 184], [498, 174], [486, 194], [476, 178], [455, 196]]),
  points([[770, 146], [800, 186], [788, 190], [780, 176], [768, 196], [756, 178], [742, 162]]),
];

/** The logo's red, here the star's light on the faces turned toward it (ADR-0037 decision 4). */
export const alpenglow: Point[][] = [
  points([[612, 106], [628, 124], [650, 140], [676, 178], [706, 206], [766, 268], [712, 244], [662, 210], [634, 186], [624, 160]]),
  points([[784, 164], [800, 186], [838, 216], [858, 240], [826, 226], [796, 206], [786, 180]]),
];

/** A closed outline of the range, down past the foot of the scene. */
export function rangePath(range: Point[]): string {
  const bottom = sceneHeight + 10;
  const line = range.map((point) => `${point.x} ${point.y}`).join(' L');
  return `M${range[0].x} ${bottom} L${line} L${range.at(-1)!.x} ${bottom} Z`;
}

export const polygonPath = (shape: Point[]) => `M${shape.map((point) => `${point.x} ${point.y}`).join(' L')} Z`;

/** The height of a range at `x`. */
export function rangeY(range: Point[], x: number): number {
  const after = range.findIndex((point) => point.x >= x);
  if (after <= 0) {
    return range[Math.max(after, 0)].y;
  }
  const [a, b] = [range[after - 1], range[after]];
  return a.y + ((b.y - a.y) * (x - a.x)) / (b.x - a.x);
}

/** Where the observatory stands: the left shoulder's flat top, which a 320px screen still shows. */
export function observatory() {
  const x = 395;
  const slope = rangeY(nearRange, x + 8) - rangeY(nearRange, x - 8);
  const angle = (Math.atan2(slope, 16) * 180) / Math.PI;
  return { x, y: rangeY(nearRange, x), angle: round(Math.max(-8, Math.min(8, angle))) };
}

export interface LightSpot extends Point {
  /** Which way its trace turns on the way down, and how far. */
  turn: number;
}

/** The fixed spots on the rock, all in view on the narrowest phone (ADR-0037 decision 7). */
export const lightSpots: LightSpot[] = [
  { x: 548, y: 214, turn: -22 },
  { x: 590, y: 196, turn: 18 },
  { x: 508, y: 232, turn: -18 },
  { x: 640, y: 248, turn: -16 },
  { x: 746, y: 218, turn: 20 },
  { x: 470, y: 240, turn: -20 },
  { x: 580, y: 256, turn: 14 },
  { x: 790, y: 246, turn: 16 },
  { x: 432, y: 268, turn: -14 },
  { x: 520, y: 272, turn: -12 },
  { x: 690, y: 282, turn: -10 },
  { x: 762, y: 278, turn: -8 },
  { x: 625, y: 284, turn: 8 },
  { x: 816, y: 276, turn: 8 },
  { x: 476, y: 282, turn: 8 },
  { x: 556, y: 286, turn: 6 },
];

/** A light's trace, as in the logo: down from the light, a turn, then straight into the ground. */
export function traceFor(spot: LightSpot): string {
  const corner = { x: spot.x + spot.turn, y: spot.y + Math.abs(spot.turn) };
  return `M${spot.x} ${spot.y} L${corner.x} ${corner.y} L${corner.x} ${sceneHeight + 10}`;
}

// FNV-1a: a slug always lands on the same spot, whatever else is in the catalogue.
function hash(text: string): number {
  let value = 2166136261;
  for (const char of text) {
    value = Math.imul(value ^ char.charCodeAt(0), 16777619);
  }
  return value >>> 0;
}

export interface HorizonLight<Entry> {
  entry: Entry;
  spot: number;
}

/** One light per entry, in slug order so a collision settles the same way on every build. */
export function lightsFor<Entry extends { slug: string }>(entries: Entry[]): HorizonLight<Entry>[] {
  const taken = new Set<number>();
  const lights: HorizonLight<Entry>[] = [];
  for (const entry of [...entries].sort((a, b) => a.slug.localeCompare(b.slug))) {
    if (taken.size === lightSpots.length) {
      break;
    }
    let spot = hash(entry.slug) % lightSpots.length;
    while (taken.has(spot)) {
      spot = (spot + 1) % lightSpots.length;
    }
    taken.add(spot);
    lights.push({ entry, spot });
  }
  return lights;
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
  { seed: 71, y: 206, count: 4, rx: [80, 150], ry: [6, 10], duration: 200 },
  { seed: 113, y: 232, count: 4, rx: [70, 130], ry: [6, 9], duration: 140 },
  { seed: 197, y: 256, count: 3, rx: [60, 110], ry: [4, 7], duration: 90 },
];

/** The three lit cloud bands, farthest first (ADR-0030 decision 2). */
export function cloudBands(): CloudBand[] {
  return bands.map(({ seed, y, count, rx, ry, duration }) => {
    const next = seededRandom(seed);
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
