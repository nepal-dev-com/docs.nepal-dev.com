import { metaSchema } from 'fumadocs-core/source/schema';

export const ecosystems = ['npm', 'composer', 'pypi', 'go', 'cargo', 'other'] as const;
export const channels = ['latest', 'next', 'legacy'] as const;

export type Ecosystem = (typeof ecosystems)[number];
export type Channel = (typeof channels)[number];

export interface CatalogField {
  kind: 'package' | 'project';
  ecosystem?: Ecosystem;
  visibility: 'public';
  repository?: string;
  registry?: string;
  featured: boolean;
}

type BaseMeta = ReturnType<typeof metaSchema.parse>;

export type CatalogMeta = BaseMeta & {
  catalog?: CatalogField;
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

  const { kind, ecosystem, visibility, repository, registry, featured } = value;
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
  if (featured !== undefined && typeof featured !== 'boolean') {
    issues.push({ message: '`catalog.featured` must be true or false', path: at('featured') });
  }

  return {
    kind: kind as CatalogField['kind'],
    ecosystem: ecosystem as Ecosystem | undefined,
    visibility: 'public',
    repository: repository as string | undefined,
    registry: registry as string | undefined,
    featured: featured === true,
  };
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
