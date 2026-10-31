import { liteClient } from 'algoliasearch/lite';

export const searchIndexName = 'document';

// The search-only key is public by design: it reads public records and nothing else (AGENTS.md §9).
export const searchClient = liteClient(
  process.env.NEXT_PUBLIC_ALGOLIA_APP_ID!,
  process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_KEY!,
);
