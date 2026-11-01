import type { CatalogEntry } from '@/lib/catalog';

export type Ring = NonNullable<CatalogEntry['ecosystem']> | 'project';

const ringOrder: Ring[] = ['npm', 'composer', 'pypi', 'go', 'cargo', 'other', 'project'];
// Shown faintly when nothing is documented yet, so the hero keeps its shape (ADR-0017 app flow).
const emptyRings: Ring[] = ['npm', 'composer', 'pypi', 'go', 'project'];

export const ringName: Record<Ring, string> = {
  npm: 'npm',
  composer: 'Composer',
  pypi: 'PyPI',
  go: 'Go',
  cargo: 'Cargo',
  other: 'Other',
  project: 'Projects',
};

export const ringOf = (entry: CatalogEntry): Ring =>
  entry.kind === 'project' ? 'project' : (entry.ecosystem ?? 'other');

export function presentRings(entries: CatalogEntry[]): Ring[] {
  if (entries.length === 0) {
    return emptyRings;
  }
  const present = new Set(entries.map(ringOf));
  return ringOrder.filter((ring) => present.has(ring));
}

export const kindName: Record<Ring, string> = {
  npm: 'npm package',
  composer: 'Composer package',
  pypi: 'PyPI package',
  go: 'Go module',
  cargo: 'Cargo crate',
  other: 'Package',
  project: 'Project',
};
