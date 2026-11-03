/**
 * Geometry for "On this page" (ADR-0018 decision 3) and the sidebar's station arcs (decision 2).
 * Pure functions, so they can be tested without a browser.
 */

export interface Point {
  x: number;
  y: number;
}

export interface Segment {
  from: Point;
  c1: Point;
  c2: Point;
  to: Point;
  length: number;
}

export interface Trajectory {
  d: string;
  segments: Segment[];
  // Path length from the start to each dot.
  offsets: number[];
  total: number;
}

export function depthOffset(depth: number): number {
  if (depth <= 2) {
    return 6;
  }
  if (depth === 3) {
    return 18;
  }
  return 26;
}

// How far a segment between two headings of the same depth bows outward, in px.
const BOW = 4;

function cubicAt(segment: Omit<Segment, 'length'>, t: number): Point {
  const u = 1 - t;
  const a = u * u * u;
  const b = 3 * u * u * t;
  const c = 3 * u * t * t;
  const d = t * t * t;
  return {
    x: a * segment.from.x + b * segment.c1.x + c * segment.c2.x + d * segment.to.x,
    y: a * segment.from.y + b * segment.c1.y + c * segment.c2.y + d * segment.to.y,
  };
}

function cubicLength(segment: Omit<Segment, 'length'>): number {
  let length = 0;
  let previous = segment.from;
  for (let step = 1; step <= 24; step++) {
    const point = cubicAt(segment, step / 24);
    length += Math.hypot(point.x - previous.x, point.y - previous.y);
    previous = point;
  }
  return length;
}

function round(value: number): number {
  return Math.round(value * 100) / 100;
}

/**
 * One curved path through the dots: a shallow outward arc between dots at the same offset, an
 * S-curve where the offset changes, so the path is never a ruled line.
 */
export function buildTrajectory(points: Point[]): Trajectory {
  if (points.length === 0) {
    return { d: '', segments: [], offsets: [], total: 0 };
  }

  const segments: Segment[] = [];
  const offsets = [0];
  let total = 0;
  let d = `M${round(points[0].x)} ${round(points[0].y)}`;

  for (let index = 1; index < points.length; index++) {
    const from = points[index - 1];
    const to = points[index];
    const height = to.y - from.y;
    const shape =
      from.x === to.x
        ? {
            from,
            c1: { x: from.x - BOW, y: from.y + height * 0.25 },
            c2: { x: to.x - BOW, y: to.y - height * 0.25 },
            to,
          }
        : {
            from,
            c1: { x: from.x, y: from.y + height * 0.5 },
            c2: { x: to.x, y: to.y - height * 0.5 },
            to,
          };
    const length = cubicLength(shape);
    segments.push({ ...shape, length });
    total += length;
    offsets.push(total);
    d += ` C${round(shape.c1.x)} ${round(shape.c1.y)} ${round(shape.c2.x)} ${round(shape.c2.y)} ${round(to.x)} ${round(to.y)}`;
  }

  return { d, segments, offsets, total };
}

/**
 * Where the probe rides: `section` is the heading the reader is in (-1 before the first),
 * `fraction` how far they are towards the next one.
 */
export function probeAt(
  trajectory: Trajectory,
  points: Point[],
  section: number,
  fraction: number,
): { point: Point; length: number } | undefined {
  if (points.length === 0) {
    return undefined;
  }
  if (section < 0) {
    return { point: points[0], length: 0 };
  }
  if (section >= trajectory.segments.length) {
    return { point: points[points.length - 1], length: trajectory.total };
  }
  const t = Math.min(1, Math.max(0, fraction));
  const segment = trajectory.segments[section];
  return {
    point: cubicAt(segment, t),
    length: trajectory.offsets[section] + segment.length * t,
  };
}

export const WORDS_PER_MINUTE = 220;

/** What the header shows; `undefined` hides it (a page under a minute). */
export function timeLeft(minutes: number, progress: number | undefined): string | undefined {
  if (minutes < 1) {
    return undefined;
  }
  if (progress === undefined) {
    return `${Math.ceil(minutes)} min read`;
  }
  if (progress >= 0.98) {
    return 'End of page';
  }
  return `${Math.max(1, Math.ceil(minutes * (1 - Math.max(0, progress))))} min left`;
}

export interface ArcRow {
  // The dot's x, in px.
  x: number;
  // The row's piece of the arc, in a `0 0 24 100` viewBox stretched to the row's height.
  d: string;
}

/**
 * Row `index` of `count` on one arc that bows outward, for the sidebar's stations. The first
 * row's piece starts at its dot and the last row's ends at its dot.
 */
export function arcRow(index: number, count: number, base = 14): ArcRow {
  const bow = Math.min(6, 1.5 + count);
  const x = (s: number) => base - bow * Math.sin((Math.PI * (s + 0.5)) / count);
  const slope = (s: number) => (-bow * Math.PI * Math.cos((Math.PI * (s + 0.5)) / count)) / count;

  const top = { s: index - 0.5, y: 0 };
  const middle = { s: index, y: 50 };
  const bottom = { s: index + 0.5, y: 100 };
  const piece = (a: typeof top, b: typeof top) =>
    `M${round(x(a.s))} ${a.y} C${round(x(a.s) + slope(a.s) / 6)} ${round(a.y + 50 / 3)} ${round(x(b.s) - slope(b.s) / 6)} ${round(b.y - 50 / 3)} ${round(x(b.s))} ${b.y}`;

  const parts: string[] = [];
  if (index > 0) {
    parts.push(piece(top, middle));
  }
  if (index < count - 1) {
    parts.push(piece(middle, bottom));
  }
  return { x: round(x(index)), d: parts.join(' ') };
}

/**
 * A node's place on its arc: its index and the length of the run of arc-bearing nodes it belongs
 * to. Nodes that don't bear the arc (`bears` false) break the run.
 */
export function arcSlot<T>(nodes: T[], node: T, bears: (node: T) => boolean): { index: number; count: number } {
  const at = nodes.indexOf(node);
  if (at === -1 || !bears(node)) {
    return { index: 0, count: 1 };
  }
  let start = at;
  while (start > 0 && bears(nodes[start - 1])) {
    start--;
  }
  let end = at;
  while (end < nodes.length - 1 && bears(nodes[end + 1])) {
    end++;
  }
  return { index: at - start, count: end - start + 1 };
}
