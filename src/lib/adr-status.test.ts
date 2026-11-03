import { describe, expect, test } from 'bun:test';
import { adrNumber, adrShortTitle, adrStatus, isAdrFolder, type AdrStatus } from './adr-status';

const page = (line: string) => ({ contents: [{ content: 'Intro' }, { content: line }] });

describe('adrStatus', () => {
  test.each([
    ['**Status:** Approved', 'approved'],
    ['**Status:** Proposed', 'proposed'],
    ['**Status:** Superseded by ADR-0020', 'superseded'],
    ['**Status:** Rejected', 'rejected'],
    ['Status: `Proposed` → `Approved`', 'proposed'],
  ] as [string, AdrStatus][])('%s', (line, status) => {
    expect(adrStatus(page(line))).toBe(status);
  });

  test('no status line, or another word: unknown', () => {
    expect(adrStatus(page('Nothing here'))).toBe('unknown');
    expect(adrStatus(page('**Status:** Draft'))).toBe('unknown');
    expect(adrStatus({ contents: [] })).toBe('unknown');
  });
});

describe('adrNumber and adrShortTitle', () => {
  test('from an ADR-NNNN title', () => {
    expect(adrNumber('ADR-0016 — Home search', 3)).toBe(16);
    expect(adrShortTitle('ADR-0016 — Home search is X')).toBe('Home search is X');
  });

  test('without one: the position and the whole title', () => {
    expect(adrNumber('Caching', 3)).toBe(3);
    expect(adrShortTitle('Caching')).toBe('Caching');
  });
});

describe('isAdrFolder', () => {
  test('a folder named adr, in any entry', () => {
    expect(isAdrFolder('docs/maintain/adr')).toBe(true);
    expect(isAdrFolder('lodestar/maintain/adr')).toBe(true);
  });

  test('anything else', () => {
    expect(isAdrFolder('docs/maintain/adrs')).toBe(false);
    expect(isAdrFolder('docs/adr/notes')).toBe(false);
    expect(isAdrFolder(undefined)).toBe(false);
  });
});
