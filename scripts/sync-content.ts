import * as fs from 'node:fs/promises';
import { type DocumentRecord, sync } from 'fumadocs-core/search/algolia';
import { algoliasearch } from 'algoliasearch';

// Without an address every page is noindex; a publish must not lose its indexing silently (ADR-0035).
if (!process.env.SITE_URL) {
  throw new Error('SITE_URL is required to publish: set it to the site\'s https address.');
}

// Next.js writes it under `route-cache` when built with an adapter, like on Vercel
const [file] = await Array.fromAsync(fs.glob('.next/server/{app,route-cache/*/*/$}/static.json.body'));
const records = JSON.parse(await fs.readFile(file, 'utf-8')) as DocumentRecord[];

const client = algoliasearch(
  process.env.NEXT_PUBLIC_ALGOLIA_APP_ID!,
  process.env.ALGOLIA_WRITE_KEY!,
);

await sync(client, {
  indexName: 'document',
  documents: records,
});

console.log(`search updated: ${records.length} records`);
