import { describe, expect, test } from 'bun:test';
import { groupAfter, stationFollows, stationOnPageChange } from './station-group';

// A small model of one group of sibling stations, run through the same functions the sidebar uses.
function group(ids: string[], current?: string) {
  let openId: string | null = null;
  const open = new Map(ids.map((id) => [id, false]));
  const settle = () => {
    for (const id of ids) {
      if (stationFollows(id, openId, open.get(id) ?? false) === 'close') {
        open.set(id, false);
      }
    }
  };
  const toggle = (id: string, next: boolean) => {
    open.set(id, next);
    openId = groupAfter(openId, { type: next ? 'opened' : 'closed', id });
    settle();
  };
  const pageChange = (holder?: string) => {
    for (const id of ids) {
      const action = stationOnPageChange(id === holder);
      open.set(id, action === 'open');
      if (action === 'open') {
        openId = groupAfter(openId, { type: 'opened', id });
      }
    }
    settle();
  };
  pageChange(current);
  return {
    open: () => ids.filter((id) => open.get(id)),
    toggle,
    pageChange,
  };
}

describe('one open station (ADR-0023)', () => {
  test('the current page opens its station and closes the rest', () => {
    expect(group(['start', 'reference', 'guides'], 'start').open()).toEqual(['start']);
  });

  test('opening a station closes the open one beside it', () => {
    const g = group(['start', 'reference', 'guides'], 'start');
    g.toggle('guides', true);
    expect(g.open()).toEqual(['guides']);
    g.toggle('reference', true);
    expect(g.open()).toEqual(['reference']);
  });

  test('closing the open station leaves every station closed', () => {
    const g = group(['start', 'reference', 'guides'], 'start');
    g.toggle('start', false);
    expect(g.open()).toEqual([]);
    g.toggle('guides', true);
    expect(g.open()).toEqual(['guides']);
  });

  test('a page change opens the new page’s station, not the one opened by hand', () => {
    const g = group(['start', 'reference', 'guides'], 'start');
    g.toggle('guides', true);
    g.pageChange('start');
    expect(g.open()).toEqual(['start']);
    g.pageChange('reference');
    expect(g.open()).toEqual(['reference']);
  });

  test('a page outside every station of a group closes them all', () => {
    const g = group(['start', 'reference'], 'start');
    g.pageChange(undefined);
    expect(g.open()).toEqual([]);
  });

  test('a nested group follows the same rule inside its parent', () => {
    const parent = group(['start', 'guides'], 'guides');
    const nested = group(['recipes', 'theming'], 'recipes');
    nested.toggle('theming', true);
    expect(nested.open()).toEqual(['theming']);
    expect(parent.open()).toEqual(['guides']);
    nested.pageChange('recipes');
    expect(nested.open()).toEqual(['recipes']);
  });
});

describe('groupAfter', () => {
  test('a station that closes releases the group only when it held it', () => {
    expect(groupAfter('a', { type: 'closed', id: 'a' })).toBeNull();
    expect(groupAfter('a', { type: 'closed', id: 'b' })).toBe('a');
    expect(groupAfter(null, { type: 'opened', id: 'b' })).toBe('b');
  });
});

describe('stationFollows', () => {
  test('an open station closes when another holds the group', () => {
    expect(stationFollows('a', 'b', true)).toBe('close');
    expect(stationFollows('a', 'a', true)).toBe('stay');
    expect(stationFollows('a', null, true)).toBe('stay');
    expect(stationFollows('a', 'b', false)).toBe('stay');
  });
});
