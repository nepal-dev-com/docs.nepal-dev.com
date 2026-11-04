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

/** The star's glow. It fades out by its own edge, so that edge must stay inside the scene or the top cuts it off. */
export const starGlow = { cx: starDisc.cx, cy: starDisc.cy + 22, rx: 460, ry: 150 } as const;

/** Directly above the star, the flag's moon over its sun (ADR-0037 decision 6). */
export const moon = { cx: 690, cy: 54, r: 15 } as const;

export const summit = { x: 600, y: 96 } as const;

/** The pole stands on the summit and the cloth flies at its top, at nearly the logo's size for its mountain. */
export const flagPole = { x: 600, top: 14, foot: 100, width: 4 } as const;
export const flagScale = 1.65;
export const flagTop = flagPole.top + 8;

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

// Seeded peaks past both edges of the world, with a knee on each flank so a ridge never reads as a sawtooth.
function peaks(seed: number, top: number, floor: number, step: number): Point[] {
  const next = seededRandom(seed);
  const result: Point[] = [];
  for (let x = worldView.x - 2 * step, up = true; x <= worldView.x + worldView.width + 2 * step; x += step, up = !up) {
    const y = up ? top + next() * 26 : floor + next() * 22;
    const point = { x: round(x + (next() - 0.5) * step * 0.5), y: round(y) };
    const last = result.at(-1);
    if (last) {
      const along = 0.35 + next() * 0.3;
      result.push({
        x: round(last.x + (point.x - last.x) * along),
        y: round(last.y + (point.y - last.y) * along + (next() - 0.5) * (floor - top) * 0.45),
      });
    }
    result.push(point);
  }
  return result;
}

/** The hazy range at the back. */
export const farRange = () => peaks(29, 168, 200, 66);
/** The range the clouds wade through. */
export const midRange = () => peaks(61, 204, 240, 84);

// The near range is measured in the logo's own units, its summit at (697, 0) and its foot at y=556, so it
// keeps the logo's shape: that foot lands on the planet's edge at this scale.
const logoScale = 0.36;
const fromLogo = (list: number[][]): Point[] =>
  list.map(([x, y]) => ({ x: round(summit.x + (x - 697) * logoScale), y: round(summit.y + y * logoScale) }));

/** The near range, from the logo's silhouette; its foothills sink below the planet's edge (ADR-0037 decision 1). */
export const nearRange: Point[] = [
  ...points([[-1240, 400], [120, 304], [240, 296], [330, 280]]),
  ...fromLogo([
    [85, 461], [178, 350], [245, 350], [382, 189], [395, 191], [486, 253], [560, 155], [595, 136], [605, 125], [697, 0],
    [806, 147], [842, 164], [909, 253], [1003, 189], [1013, 190], [1148, 334], [1207, 353], [1217, 359], [1311, 461],
  ]),
  ...points([[870, 280], [960, 296], [1080, 304], [2440, 400]]),
];

/** The snow in the logo, back to front: both shoulders, the summit, then the two peaks standing before it. */
export const snow: Point[][] = [
  [[389, 213], [469, 270], [424, 262], [402, 242], [398, 270], [327, 347], [343, 302], [260, 352]],
  [[1006, 213], [1133, 349], [1033, 267], [1010, 237], [1009, 271], [1057, 351], [1004, 299], [977, 329], [952, 309], [923, 269]],
  [
    [696, 35], [779, 146], [731, 112], [704, 67], [715, 126], [752, 182], [717, 162], [718, 261], [731, 281], [715, 263],
    [677, 181], [633, 227], [653, 141], [614, 180], [579, 195], [525, 237], [575, 170], [611, 151],
  ],
  [[543, 254], [561, 273], [557, 300], [557, 345], [527, 396], [520, 398], [520, 327], [452, 387], [447, 389], [457, 359], [333, 427], [395, 365], [437, 345], [469, 310], [507, 286]],
  [
    [865, 293], [864, 316], [875, 357], [842, 428], [834, 434], [840, 397], [775, 440], [804, 383], [668, 502], [675, 472],
    [628, 484], [532, 534], [625, 463], [710, 432], [786, 352], [831, 327],
  ],
].map(fromLogo);

/** The grey side of the same snow, where it turns from the ground's light. */
export const snowShade: Point[][] = [
  [[391, 214], [469, 270], [424, 262], [402, 242], [399, 265]],
  [[1007, 214], [1133, 349], [1023, 257], [1009, 238]],
  [[696, 35], [779, 146], [731, 112], [704, 67], [715, 126], [752, 182], [717, 162], [716, 231], [699, 162], [685, 139], [699, 100]],
  [[561, 273], [573, 287], [604, 300], [647, 350], [659, 398], [636, 362], [586, 330], [557, 362], [557, 300]],
  [[865, 293], [969, 378], [1122, 513], [948, 394], [964, 437], [896, 372], [842, 428], [875, 357], [864, 316]],
].map(fromLogo);

/**
 * The logo's red, here the star's light on the faces turned toward it (ADR-0037 decision 4). Drawn before
 * the snow, which covers its upper edge and the foot of the summit's face.
 */
export const alpenglow: Point[][] = [
  [
    [701, 60], [731, 112], [779, 146], [795, 166], [829, 180], [937, 324], [965, 347], [1008, 361], [1129, 517], [1122, 513],
    [969, 378], [865, 293], [831, 327], [786, 352], [731, 281], [712, 261], [712, 162], [745, 180], [712, 126],
  ],
  [[1006, 232], [1033, 267], [1130, 348], [1145, 357], [1186, 366], [1204, 375], [1263, 441], [1186, 391], [1138, 387], [1062, 317], [1063, 358], [1055, 351], [1005, 271]],
  [[401, 240], [423, 259], [471, 270], [447, 305], [420, 331], [380, 291], [396, 268]],
].map(fromLogo);

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

/** Where the observatory stands: the flat top of the range's left knee, which a 320px screen still shows. */
export function observatory() {
  const x = 426;
  const slope = rangeY(nearRange, x + 8) - rangeY(nearRange, x - 8);
  const angle = (Math.atan2(slope, 16) * 180) / Math.PI;
  return { x, y: rangeY(nearRange, x), angle: round(Math.max(-8, Math.min(8, angle))) };
}

export interface LightSpot extends Point {
  /** Which way its trace turns on the way down, and how far. */
  turn: number;
}

/**
 * The fixed spots on the rock, all in view on the narrowest phone (ADR-0037 decision 7). The first ten are
 * the nodes in the logo, the rest fill the bare rock between them.
 */
export const lightSpots: LightSpot[] = [
  { x: 568, y: 174, turn: -14 },
  { x: 587, y: 190, turn: 16 },
  { x: 425, y: 241, turn: -18 },
  { x: 460, y: 237, turn: -20 },
  { x: 512, y: 246, turn: -18 },
  { x: 561, y: 249, turn: -16 },
  { x: 476, y: 284, turn: -6 },
  { x: 713, y: 273, turn: 10 },
  { x: 756, y: 262, turn: 14 },
  { x: 740, y: 240, turn: 18 },
  { x: 668, y: 282, turn: -8 },
  { x: 623, y: 284, turn: 6 },
  { x: 536, y: 268, turn: -10 },
  { x: 493, y: 262, turn: -12 },
  { x: 439, y: 264, turn: -12 },
  { x: 795, y: 266, turn: 12 },
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
