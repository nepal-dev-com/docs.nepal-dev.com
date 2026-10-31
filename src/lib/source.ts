import { llms, loader } from 'fumadocs-core/source';
import { lucideIconsPlugin } from 'fumadocs-core/source/lucide-icons';
import { docsRoute } from './shared';
import { defineDocs } from 'fumadocs-mdx/macro';
import { pageSchema } from 'fumadocs-core/source/schema';
import { catalogMetaSchema, type CatalogMeta } from './catalog-schema';
import { catalogPlugin, channelLabel, describeVersion, pageVersion } from './catalog-plugin';

const docs = defineDocs({
  dir: 'content/docs',
  docs: {
    schema: pageSchema,
    postprocess: {
      includeProcessedMarkdown: true,
    },
  },
  meta: {
    schema: catalogMetaSchema,
  },
});

export function getMeta(path: string): CatalogMeta | undefined {
  return docs.getMeta(path);
}

// See https://fumadocs.dev/docs/headless/source-api for more info
export const source = loader({
  baseUrl: docsRoute,
  source: docs.toFumadocsSource(),
  plugins: [lucideIconsPlugin(), catalogPlugin()],
});

export const docsLlms = llms(source, {
  renderName(node, ctx) {
    const meta = node.type === 'folder' ? source.getNodeMeta(node, ctx.lang) : undefined;
    const data = meta?.data as CatalogMeta | undefined;
    if (node.type === 'page') {
      return source.getNodePage(node, ctx.lang)?.data.title ?? String(node.name);
    }
    const title = data?.title ?? (typeof node.name === 'string' ? node.name : '');
    if (data?.version && data.channel) {
      return `${title} — ${data.version}, ${channelLabel[data.channel].toLowerCase()}`;
    }
    return title;
  },
  renderDescription(node, ctx) {
    if (node.type === 'page') {
      return source.getNodePage(node, ctx.lang)?.data.description ?? '';
    }
    // Line folders carry their version in the name; the tree's own description would repeat it.
    return (source.getNodeMeta(node, ctx.lang)?.data as CatalogMeta | undefined)?.description ?? '';
  },
  renderPage: async (page) => {
    const version = pageVersion(page.slugs, getMeta);
    const header = version ? `\n\n> Documents ${describeVersion(version)}.` : '';
    return `# ${page.data.title} (${page.url})${header}

${await page.data.getText('processed')}`;
  },
});
