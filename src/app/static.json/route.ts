import { source } from '@/lib/source';
import { toDocuments } from 'fumadocs-core/search/algolia';
import { getPageContext } from '@/lib/catalog';
import { scopeTag } from '@/lib/search-scope';

export const revalidate = false;

function describe(page: ReturnType<typeof source.getPages>[number]) {
  const context = getPageContext(page);
  if (!context) {
    return { tag: page.slugs[0] === 'documentation' ? 'documentation' : 'site', extra: undefined };
  }
  const { entry, track, version } = context;
  return {
    tag: scopeTag(entry.slug, track, version?.line),
    // ADR-0013 decision 8; public metadata about public pages only.
    extra: {
      package: entry.slug,
      kind: entry.kind,
      ecosystem: entry.ecosystem,
      track,
      line: version?.line,
      channel: version?.channel,
    },
  };
}

export async function GET() {
  const pages = new Map(source.getPages().map((page) => [page.url, describe(page)]));
  const records = await toDocuments(source, { tag: (page) => pages.get(page.url)?.tag ?? 'site' });

  return Response.json(
    records.map((record) => {
      const extra = pages.get(record.url)?.extra;
      return extra ? { ...record, extra_data: extra } : record;
    }),
  );
}
