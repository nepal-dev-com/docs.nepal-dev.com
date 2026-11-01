export interface PrivateProject {
  slug: string;
  description: string;
  audience: 'client' | 'internal';
  tracks: string;
}

// Invented names, shown by the owner's decision (ADR-0017 decision 4). Only invented entries belong
// here until the private-documentation ADR: never a real client's or project's name (invariant 1).
export const privateProjects: PrivateProject[] = [
  {
    slug: 'harbor-ops',
    description: 'Operations dashboard for a shipping client.',
    audience: 'client',
    tracks: 'Use, Maintain',
  },
  {
    slug: 'fieldnote',
    description: 'Offline survey app for field teams.',
    audience: 'client',
    tracks: 'Use',
  },
  {
    slug: 'tessera',
    description: 'Internal billing and invoicing service.',
    audience: 'internal',
    tracks: 'Maintain',
  },
];
