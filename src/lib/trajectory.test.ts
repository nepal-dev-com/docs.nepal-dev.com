import { describe, expect, test } from 'bun:test';
import { arcRow, arcSlot, buildTrajectory, depthOffset, probeAt, timeLeft } from './trajectory';

describe('depthOffset', () => {
  test('h2 and above sit at 6px, h3 at 18px, deeper at 26px', () => {
    expect([1, 2, 3, 4, 6].map(depthOffset)).toEqual([6, 6, 18, 26, 26]);
  });
});

describe('buildTrajectory', () => {
  test('no headings: an empty path', () => {
    expect(buildTrajectory([])).toEqual({ d: '', segments: [], offsets: [], total: 0 });
  });

  test('one heading: a start point and no segment', () => {
    const one = buildTrajectory([{ x: 6, y: 10 }]);
    expect(one.d).toBe('M6 10');
    expect(one.segments).toHaveLength(0);
  });

  test('headings at the same depth bow outward', () => {
    const [segment] = buildTrajectory([{ x: 6, y: 10 }, { x: 6, y: 40 }]).segments;
    expect(segment.c1.x).toBeLessThan(6);
    expect(segment.c2.x).toBeLessThan(6);
  });

  test('a change of depth is an S-curve', () => {
    const [segment] = buildTrajectory([{ x: 6, y: 10 }, { x: 18, y: 40 }]).segments;
    expect(segment.c1.x).toBe(6);
    expect(segment.c2.x).toBe(18);
  });

  test('offsets run from 0 to the total length', () => {
    const t = buildTrajectory([{ x: 6, y: 10 }, { x: 18, y: 40 }]);
    expect(t.total).toBeGreaterThan(30);
    expect(t.offsets).toEqual([0, t.total]);
  });
});

describe('probeAt', () => {
  const points = [{ x: 6, y: 10 }, { x: 6, y: 40 }, { x: 18, y: 70 }];
  const t = buildTrajectory(points);

  test('no headings: no probe', () => {
    expect(probeAt(buildTrajectory([]), [], 0, 0)).toBeUndefined();
  });

  test('before the first heading: at the start', () => {
    expect(probeAt(t, points, -1, 0)).toEqual({ point: points[0], length: 0 });
  });

  test('glides within a section', () => {
    const probe = probeAt(t, points, 0, 0.5)!;
    expect(probe.length).toBeCloseTo(t.segments[0].length / 2, 9);
    expect(probe.point.y).toBeGreaterThan(10);
    expect(probe.point.y).toBeLessThan(40);
  });

  test('a fraction past 1 stays at the next dot', () => {
    expect(probeAt(t, points, 0, 3)!.length).toBeCloseTo(t.offsets[1], 9);
  });

  test('in the last section: stops at the last dot', () => {
    expect(probeAt(t, points, 2, 0.4)).toEqual({ point: points[2], length: t.total });
  });
});

describe('timeLeft', () => {
  test('counts down', () => {
    expect(timeLeft(4, 0)).toBe('4 min left');
    expect(timeLeft(4, 0.5)).toBe('2 min left');
  });

  test('at the end', () => {
    expect(timeLeft(4, 0.98)).toBe('End of page');
    expect(timeLeft(4, 1)).toBe('End of page');
  });

  test('before hydration: the total, rounded up', () => {
    expect(timeLeft(4.2, undefined)).toBe('5 min read');
  });

  test('under a minute: hidden', () => {
    expect(timeLeft(0.6, 0.3)).toBeUndefined();
  });

  test('never "0 min left"', () => {
    expect(timeLeft(3, 0.97)).toBe('1 min left');
  });
});

describe('arcRow', () => {
  test('bows outward in the middle', () => {
    const [first, middle, last] = [arcRow(0, 3), arcRow(1, 3), arcRow(2, 3)];
    expect(middle.x).toBeLessThan(first.x);
    expect(first.x).toBe(last.x);
  });

  test('starts at the first dot and ends at the last', () => {
    const first = arcRow(0, 3);
    const last = arcRow(2, 3);
    expect(first.d.startsWith(`M${first.x} 50`)).toBe(true);
    expect(last.d.endsWith(`${last.x} 50`)).toBe(true);
  });

  test('a single row has no arc', () => {
    expect(arcRow(0, 1).d).toBe('');
  });
});

describe('arcSlot', () => {
  const page = (id: string) => ({ id, page: true });
  const folder = (id: string) => ({ id, page: false });
  const nodes = [page('a'), page('b'), folder('c'), page('d')];
  const bears = (node: { page: boolean }) => node.page;

  test('place within a run', () => {
    expect(arcSlot(nodes, nodes[1], bears)).toEqual({ index: 1, count: 2 });
  });

  test('a node that breaks the run starts a new one', () => {
    expect(arcSlot(nodes, nodes[3], bears)).toEqual({ index: 0, count: 1 });
  });

  test('a node not on the arc, or not in the list', () => {
    expect(arcSlot(nodes, nodes[2], bears)).toEqual({ index: 0, count: 1 });
    expect(arcSlot(nodes, page('z'), bears)).toEqual({ index: 0, count: 1 });
  });
});
