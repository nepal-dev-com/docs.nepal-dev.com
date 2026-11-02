import type { CatalogEntry } from './catalog';
import { ringName, ringOf, ringOrder, type Ring } from './rings';
import { tilt } from './verse-view';

// The orbits the hero's subline names, drawn whether or not anything is in them (ADR-0032 decision 1).
const alwaysRings: Ring[] = ['npm', 'composer', 'pypi', 'go', 'project'];

/** The hero's orbits: the five always, and Cargo and Other when an entry is in them. */
export function heroRings(entries: CatalogEntry[]): Ring[] {
  const present = new Set(entries.map(ringOf));
  return ringOrder.filter((ring) => alwaysRings.includes(ring) || present.has(ring));
}

const count = (n: number, word: string) => `${n} ${word}${n === 1 ? '' : 's'}`;

function list(names: string[]): string {
  return names.length < 2 ? names.join('') : `${names.slice(0, -1).join(', ')} and ${names.at(-1)}`;
}

export interface SystemFacts {
  waiting: Ring[];
  /** The telemetry line, in the system's own words. */
  line: string;
  /** The same facts in a plain sentence, for screen readers (the Places, Not Controls rule). */
  sentence: string;
}

/** The hero's telemetry line (ADR-0032 decision 6). */
export function systemFacts(entries: CatalogEntry[]): SystemFacts {
  const present = new Set(entries.map(ringOf));
  const waiting = heroRings(entries).filter((ring) => !present.has(ring));
  const moons = entries.reduce((sum, entry) => sum + entry.lines.length, 0);
  const line = `${count(entries.length, 'planet')} · ${count(waiting.length, 'orbit')} waiting · ${count(moons, 'moon')}`;
  if (entries.length === 0) {
    return { waiting, line, sentence: 'Nothing is documented yet.' };
  }
  const packages = entries.filter((entry) => entry.kind === 'package').length;
  const projects = entries.length - packages;
  const documented = [packages && count(packages, 'package'), projects && count(projects, 'project')].filter(Boolean);
  const parts = [`${documented.join(' and ')} documented`];
  if (waiting.length > 0) {
    const names = waiting.map((ring) => (ring === 'project' ? 'projects' : ringName[ring]));
    parts.push(`${list(names)} ${names.length === 1 ? 'has' : 'have'} none yet`);
  }
  parts.push(moons === 0 ? 'no versions documented yet' : `${count(moons, 'version')} documented`);
  return { waiting, line, sentence: `${parts.join('; ')}.` };
}

const seeded = (seed: number) => {
  let state = seed;
  return () => (state = (state * 16807) % 2147483647) / 2147483647;
};

/** Seconds between comets. */
export const cometGap = [20, 30] as const;
/** Seconds a comet is in view. */
export const cometSeconds = 2.5;
const cometTail = 90;

/** When the first `n` comets start, in seconds of sky time. */
export function cometStarts(seed: number, n: number): number[] {
  const next = seeded(seed * 7919 + 13);
  const starts: number[] = [];
  let at = 0;
  for (let index = 0; index < n; index++) {
    at += cometGap[0] + next() * (cometGap[1] - cometGap[0]);
    starts.push(at);
  }
  return starts;
}

export interface CometArea {
  width: number;
  cx: number;
  cy: number;
  /** Nothing of the comet goes left of this, so it never crosses the hero's text. */
  boundary: number;
  /** Nor above this. */
  top: number;
}

interface Point {
  x: number;
  y: number;
}

/** Where comet `index` is at `progress` (0 to 1): its head, its tail's end and how visible it is. */
export function cometPath(area: CometArea, index: number, progress: number): { head: Point; tail: Point; alpha: number } {
  const next = seeded(index * 4111 + 97);
  const from = next();
  const drop = next();
  const startY = area.top + 30 + from * (area.cy - area.top - 30) * 0.45;
  const start = { x: area.width + 40, y: startY };
  // It drops a little as it crosses, but always passes well above the star.
  const end = { x: area.boundary + cometTail + 24, y: Math.min(startY + 30 + drop * 40, area.cy - 24) };
  const head = { x: start.x + (end.x - start.x) * progress, y: start.y + (end.y - start.y) * progress };
  // A comet's tail points away from its star.
  const away = { x: head.x - area.cx, y: head.y - area.cy };
  const length = Math.hypot(away.x, away.y) || 1;
  const dir = { x: away.x / length, y: away.y / length };
  const roomX = dir.x < 0 ? (head.x - area.boundary) / (-dir.x * cometTail) : 1;
  const roomY = dir.y < 0 ? (head.y - area.top) / (-dir.y * cometTail) : 1;
  const reach = cometTail * Math.max(0, Math.min(1, roomX, roomY));
  const tail = {
    x: Math.max(area.boundary, head.x + dir.x * reach),
    y: Math.max(area.top, head.y + dir.y * reach),
  };
  const alpha = progress < 0.15 ? progress / 0.15 : progress > 0.75 ? (1 - progress) / 0.25 : 1;
  return { head, tail, alpha: Math.max(0, alpha) };
}

/** A sixth of a turn. */
export const trailLength = Math.PI / 3;

/** A planet's trail, behind it along its orbit (planets turn toward larger angles). */
export function trailArc(angle: number): { from: number; to: number } {
  return { from: angle - trailLength, to: angle };
}

export const spinUpSeconds = 1.2;
const easeOut = (p: number) => (p >= 1 ? 1 : 1 - 2 ** (-10 * p));

/** The arrival, `t` seconds in: how far behind the planets are, and how lit the star and orbits. */
export function spinUp(t: number): { offset: number; star: number; corona: number; orbits: number } {
  if (t >= spinUpSeconds) {
    return { offset: 0, star: 1, corona: 1, orbits: 1 };
  }
  const p = Math.max(0, t) / spinUpSeconds;
  const lit = easeOut(Math.min(1, Math.max(0, t) / 0.6));
  return {
    offset: ((-Math.PI * 2) / 3) * (1 - easeOut(p)),
    star: 0.4 + 0.6 * lit,
    corona: lit,
    orbits: Math.min(1, Math.max(0, t) / 0.4),
  };
}

/** The star's corona at `t` seconds: how much it breathes, and how far its rays have turned. */
export function corona(t: number): { breath: number; rays: number } {
  return {
    breath: 1 + 0.15 * Math.sin((Math.PI * 2 * t) / 6),
    rays: ((Math.PI * 2 * t) / 120) % (Math.PI * 2),
  };
}

const round = (value: number) => Math.round(value * 10000) / 10000;
const clamp = (value: number) => Math.max(-1, Math.min(1, value));

/** How the system leans for a pointer at `nx`, `ny`, each -1 to 1 across the hero. */
export function lean(nx: number, ny: number) {
  const x = clamp(nx);
  const y = clamp(ny);
  return {
    tilt: round(tilt + y * 0.05),
    dx: round(x * 8),
    dy: round(y * 8),
    nebulaX: round(0 - x * 12),
    nebulaY: round(0 - y * 12),
  };
}

/** About how far a point is from an orbit's ellipse, in pixels. */
export function orbitDistance(x: number, y: number, orbit: { cx: number; cy: number; rx: number; ry: number }): number {
  const dx = x - orbit.cx;
  const dy = y - orbit.cy;
  const r = Math.hypot(dx / orbit.rx, dy / orbit.ry);
  if (r === 0) {
    return Math.min(orbit.rx, orbit.ry);
  }
  const slope = Math.hypot(dx / orbit.rx ** 2, dy / orbit.ry ** 2) / r;
  return Math.abs(r - 1) / slope;
}

// Canvas colours are read from the tokens, which are hex; anything else is left as it is.
const hex = /^#([0-9a-f]{6})$/i;

/** `a` with `share` of `b` mixed in, both `#rrggbb`. */
export function mixHex(a: string, b: string, share: number): string {
  const ma = hex.exec(a.trim());
  const mb = hex.exec(b.trim());
  if (!ma || !mb) {
    return a;
  }
  const channels = (m: RegExpExecArray) => [0, 2, 4].map((i) => parseInt(m[1].slice(i, i + 2), 16));
  const [ca, cb] = [channels(ma), channels(mb)];
  return `#${ca.map((value, i) => Math.round(value + (cb[i] - value) * share).toString(16).padStart(2, '0')).join('')}`;
}
