import type { CatalogEntry } from '@/lib/catalog';

export type Ring = NonNullable<CatalogEntry['ecosystem']> | 'project';

/** The order the hero draws its orbits in, inside out. */
export const ringOrder: Ring[] = ['npm', 'composer', 'pypi', 'go', 'cargo', 'other', 'project'];

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

export const kindName: Record<Ring, string> = {
  npm: 'npm package',
  composer: 'Composer package',
  pypi: 'PyPI package',
  go: 'Go module',
  cargo: 'Cargo crate',
  other: 'Package',
  project: 'Project',
};
