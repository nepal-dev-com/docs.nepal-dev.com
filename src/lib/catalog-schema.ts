import { metaSchema } from 'fumadocs-core/source/schema';

export const ecosystems = ['npm', 'composer', 'pypi', 'go', 'cargo', 'other'] as const;
export const channels = ['latest', 'dev', 'legacy'] as const;

export type Ecosystem = (typeof ecosystems)[number];
export type Channel = (typeof channels)[number];

export interface Repository {
  id: string;
  name: string;
  url?: string;
  primary: boolean;
}

export interface CatalogField {
  kind: 'package' | 'project';
  ecosystem?: Ecosystem;
  visibility: 'public';
  repository?: string;
  /** A project's repositories, primary first (ADR-0024). */
  repositories?: Repository[];
  registry?: string;
  featured: boolean;
}

const repositoryId = /^[a-z0-9][a-z0-9-]*$/;
// A repository folder named like these would be read as a line or an ADR constellation.
export const reservedRepositoryIds = new Set(['dev', 'latest', 'adr']);

type BaseMeta = ReturnType<typeof metaSchema.parse>;

export type CatalogMeta = BaseMeta & {
  catalog?: CatalogField;
  name?: string;
  version?: string;
  channel?: Channel;
};

interface Issue {
  message: string;
  path?: PropertyKey[];
}

type Result = { value: CatalogMeta; issues?: undefined } | { issues: Issue[] };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isHttpsUrl(value: unknown): value is string {
  if (typeof value !== 'string') {
    return false;
  }
  try {
    return new URL(value).protocol === 'https:';
  } catch {
    return false;
  }
}

export function validateCatalog(value: unknown, issues: Issue[]): CatalogField | undefined {
  if (!isRecord(value)) {
    issues.push({ message: '`catalog` must be an object', path: ['catalog'] });
    return undefined;
  }

  const { kind, ecosystem, visibility, repository, repositories, registry, featured } = value;
  const at = (key: string) => ['catalog', key];

  if (kind !== 'package' && kind !== 'project') {
    issues.push({ message: '`catalog.kind` must be "package" or "project"', path: at('kind') });
  }
  if (kind === 'package' && !ecosystems.includes(ecosystem as Ecosystem)) {
    issues.push({
      message: `\`catalog.ecosystem\` is required for a package and must be one of: ${ecosystems.join(', ')}`,
      path: at('ecosystem'),
    });
  }
  if (kind === 'project' && ecosystem !== undefined && !ecosystems.includes(ecosystem as Ecosystem)) {
    issues.push({ message: `\`catalog.ecosystem\` must be one of: ${ecosystems.join(', ')}`, path: at('ecosystem') });
  }
  // Only public entries exist until the private-documentation ADR; failing here keeps private
  // content out of every published surface (ADR-0013, invariant 1).
  if (visibility !== 'public') {
    issues.push({
      message: '`catalog.visibility` must be "public": private documentation is not supported yet (ADR-0013)',
      path: at('visibility'),
    });
  }
  if (repository !== undefined && !isHttpsUrl(repository)) {
    issues.push({ message: '`catalog.repository` must be an https URL', path: at('repository') });
  }
  if (registry !== undefined && !isHttpsUrl(registry)) {
    issues.push({ message: '`catalog.registry` must be an https URL', path: at('registry') });
  }
  const repositoryList =
    repositories === undefined ? undefined : validateRepositories(repositories, kind, repository, issues);
  if (featured !== undefined && typeof featured !== 'boolean') {
    issues.push({ message: '`catalog.featured` must be true or false', path: at('featured') });
  }

  return {
    kind: kind as CatalogField['kind'],
    ecosystem: ecosystem as Ecosystem | undefined,
    visibility: 'public',
    repository: repository as string | undefined,
    repositories: repositoryList,
    registry: registry as string | undefined,
    featured: featured === true,
  };
}

function validateRepositories(value: unknown, kind: unknown, repository: unknown, issues: Issue[]): Repository[] | undefined {
  const at = (...keys: PropertyKey[]) => ['catalog', 'repositories', ...keys];
  if (!Array.isArray(value)) {
    issues.push({ message: '`catalog.repositories` must be a list of repositories', path: at() });
    return undefined;
  }
  if (kind !== 'project') {
    issues.push({ message: '`catalog.repositories` is only on a project; a package is one repository (ADR-0024)', path: at() });
  }
  if (repository !== undefined) {
    issues.push({ message: 'set `catalog.repository` or `catalog.repositories`, not both (ADR-0024)', path: at() });
  }
  if (value.length < 2) {
    issues.push({ message: '`catalog.repositories` lists two or more; one repository is `catalog.repository` (ADR-0024)', path: at() });
  }

  const list: Repository[] = [];
  const seen = new Set<string>();
  value.forEach((item, index) => {
    const entry = isRecord(item) ? item : {};
    const { id, name, url, primary } = entry;
    if (typeof id !== 'string' || !repositoryId.test(id)) {
      issues.push({ message: `\`catalog.repositories[${index}].id\` is lowercase letters, digits and hyphens`, path: at(index, 'id') });
      return;
    }
    if (reservedRepositoryIds.has(id)) {
      issues.push({ message: `the repository id "${id}" is reserved: ${[...reservedRepositoryIds].join(', ')} (ADR-0024)`, path: at(index, 'id') });
    }
    if (seen.has(id)) {
      issues.push({ message: `the repository id "${id}" is listed more than once`, path: at(index, 'id') });
    }
    seen.add(id);
    if (name !== undefined && (typeof name !== 'string' || name.trim() === '')) {
      issues.push({ message: `\`catalog.repositories[${index}].name\` must be the name readers see`, path: at(index, 'name') });
    }
    if (url !== undefined && !isHttpsUrl(url)) {
      issues.push({ message: `\`catalog.repositories[${index}].url\` must be an https URL`, path: at(index, 'url') });
    }
    if (primary !== undefined && typeof primary !== 'boolean') {
      issues.push({ message: `\`catalog.repositories[${index}].primary\` must be true or false`, path: at(index, 'primary') });
    }
    list.push({
      id,
      name: typeof name === 'string' && name.trim() !== '' ? name : id,
      url: typeof url === 'string' ? url : undefined,
      primary: primary === true,
    });
  });

  if (list.length === value.length && list.filter((repo) => repo.primary).length !== 1) {
    issues.push({ message: 'exactly one of `catalog.repositories` has `primary: true` (ADR-0024)', path: at() });
  }
  return [...list].sort((a, b) => Number(b.primary) - Number(a.primary));
}

function validate(value: unknown): Result {
  const base = metaSchema.safeParse(value);
  const issues: Issue[] = base.success
    ? []
    : base.error.issues.map((issue) => ({ message: issue.message, path: issue.path }));
  const input = isRecord(value) ? value : {};

  const catalog = input.catalog === undefined ? undefined : validateCatalog(input.catalog, issues);

  if (input.version !== undefined && (typeof input.version !== 'string' || input.version.trim() === '')) {
    issues.push({ message: '`version` must be the exact version the line documents, such as "3.2.0"', path: ['version'] });
  }
  if (input.name !== undefined && (typeof input.name !== 'string' || input.name.trim() === '')) {
    issues.push({ message: '`name` must be the line\'s name as readers see it, such as "v1.0"', path: ['name'] });
  }
  if (input.channel !== undefined && !channels.includes(input.channel as Channel)) {
    issues.push({ message: `\`channel\` must be one of: ${channels.join(', ')}`, path: ['channel'] });
  }

  if (issues.length > 0 || !base.success) {
    return { issues };
  }

  return {
    value: {
      ...base.data,
      catalog,
      name: input.name as string | undefined,
      version: input.version as string | undefined,
      channel: input.channel as Channel | undefined,
    },
  };
}

// A Standard Schema (https://standardschema.dev) wrapping Fumadocs' metaSchema, so the catalogue
// fields need no schema library beyond what Fumadocs already ships.
export const catalogMetaSchema = {
  '~standard': {
    version: 1 as const,
    vendor: 'puncoz-docs',
    validate,
    types: undefined as unknown as { input: unknown; output: CatalogMeta },
  },
};
