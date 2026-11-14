import { liteClient } from 'algoliasearch/lite';

export const searchIndexName = 'document';

const unset = 'unset';

/**
 * The application ID and search-only key for the search client. Off Vercel, a build without them
 * (CI, a fresh clone) gets a placeholder pair, so it completes with a search that finds nothing.
 * On Vercel they are passed as they are, so a missing one still fails the build (ADR-0047).
 */
export function searchCredentials(appId: string | undefined, searchKey: string | undefined, onVercel: boolean): [string, string] {
  if (onVercel || (appId && searchKey)) {
    return [appId ?? '', searchKey ?? ''];
  }
  return [unset, unset];
}

// Each variable is read by its full name: Next.js inlines only a literal `process.env.NEXT_PUBLIC_*`.
// The search-only key is public by design: it reads public records and nothing else (AGENTS.md §9).
export const searchClient = liteClient(
  ...searchCredentials(process.env.NEXT_PUBLIC_ALGOLIA_APP_ID, process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_KEY, Boolean(process.env.VERCEL)),
);
