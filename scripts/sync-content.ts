import * as fs from 'node:fs/promises';
import { type DocumentRecord, sync } from 'fumadocs-core/search/algolia';
import { algoliasearch } from 'algoliasearch';
import { readPublishEnv } from '../src/lib/publish-env.ts';

// Checked before anything is read, so a missing key never half-publishes and SITE_URL never goes noindex silently (ADR-0035, ADR-0042).
const env = readPublishEnv(process.env);

// Next.js writes it under `route-cache` when built with an adapter, like on Vercel
const [file] = await Array.fromAsync(fs.glob('.next/server/{app,route-cache/*/*/$}/static.json.body'));
const records = JSON.parse(await fs.readFile(file, 'utf-8')) as DocumentRecord[];

const client = algoliasearch(env.NEXT_PUBLIC_ALGOLIA_APP_ID, env.ALGOLIA_WRITE_KEY);

await sync(client, {
  indexName: 'document',
  documents: records,
});

console.log(`search updated: ${records.length} records`);
