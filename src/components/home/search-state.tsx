'use client';
import { createContext, use, useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { CatalogEntry } from '@/lib/catalog';

export const ecosystemChips = ['npm', 'composer', 'pypi', 'go', 'cargo', 'other'] as const;
export type Chip = (typeof ecosystemChips)[number] | 'project' | 'maintain' | 'dev';

// Words that turn into filter chips when followed by a space (ADR-0014 decision 3).
export const chipWords: Record<string, Chip> = {
  npm: 'npm',
  composer: 'composer',
  php: 'composer',
  pypi: 'pypi',
  python: 'pypi',
  go: 'go',
  cargo: 'cargo',
  rust: 'cargo',
  project: 'project',
  projects: 'project',
  maintain: 'maintain',
  dev: 'dev',
  next: 'dev',
  unreleased: 'dev',
};

export const chipLabel = (chip: Chip) => (chip === 'project' ? 'projects' : chip);

export function isEcosystemChip(chip: Chip): chip is (typeof ecosystemChips)[number] {
  return (ecosystemChips as readonly string[]).includes(chip);
}

export function terms(text: string): string[] {
  return text.toLowerCase().split(/\s+/).filter(Boolean);
}

export function matchesEntry(entry: CatalogEntry, chips: Chip[], text: string): boolean {
  const kinds: Chip[] = chips.filter((chip) => isEcosystemChip(chip) || chip === 'project');
  if (kinds.length > 0) {
    const kind = entry.kind === 'project' ? 'project' : entry.ecosystem;
    if (!kinds.includes(kind as Chip)) {
      return false;
    }
  }
  if (chips.includes('dev') && !entry.dev) {
    return false;
  }
  if (chips.includes('maintain') && !entry.maintainUrl) {
    return false;
  }
  const haystack = [entry.slug, entry.title, entry.description, entry.ecosystem, entry.kind]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
  return terms(text).every((term) => haystack.includes(term));
}

interface SearchState {
  entries: CatalogEntry[];
  chips: Chip[];
  text: string;
  // Text shown by the idle demonstration; it lights the map but never filters the catalogue.
  demoText: string;
  active: boolean;
  setText: (text: string) => void;
  setDemoText: (text: string) => void;
  addChip: (chip: Chip) => void;
  removeChip: (chip: Chip) => void;
  clear: () => void;
  matches: (entry: CatalogEntry) => boolean;
}

const SearchContext = createContext<SearchState | null>(null);

export function HomeSearchProvider({ entries, children }: { entries: CatalogEntry[]; children: ReactNode }) {
  const [chips, setChips] = useState<Chip[]>([]);
  const [text, setText] = useState('');
  const [demoText, setDemoText] = useState('');

  const addChip = useCallback((chip: Chip) => {
    setChips((current) => (current.includes(chip) ? current : [...current, chip]));
  }, []);
  const removeChip = useCallback((chip: Chip) => {
    setChips((current) => current.filter((item) => item !== chip));
  }, []);
  const clear = useCallback(() => {
    setChips([]);
    setText('');
  }, []);

  // Docs pages link here with `?filter=projects` (the header's Projects link).
  useEffect(() => {
    if (new URLSearchParams(location.search).get('filter') === 'projects') {
      addChip('project');
    }
  }, [addChip]);

  const value = useMemo<SearchState>(
    () => ({
      entries,
      chips,
      text,
      demoText,
      active: chips.length > 0 || text.trim() !== '',
      setText,
      setDemoText,
      addChip,
      removeChip,
      clear,
      matches: (entry) => matchesEntry(entry, chips, text),
    }),
    [entries, chips, text, demoText, addChip, removeChip, clear],
  );

  return <SearchContext value={value}>{children}</SearchContext>;
}

export function useHomeSearch(): SearchState {
  const context = use(SearchContext);
  if (!context) {
    throw new Error('useHomeSearch must be used inside <HomeSearchProvider>');
  }
  return context;
}
