import { llms, loader } from 'fumadocs-core/source';
import { lucideIconsPlugin } from 'fumadocs-core/source/lucide-icons';
import { appName, docsRoute } from './shared';
import { defineDocs } from 'fumadocs-mdx/macro';
import { pageSchema } from 'fumadocs-core/source/schema';
import { catalogMetaSchema, type CatalogMeta } from './catalog-schema';
import { diagramsPlugin } from './diagrams-plugin';
import { markdownFilter, remarkDiagrams } from './remark-diagrams';
import { applyMdxPreset } from 'fumadocs-mdx/config';
import {
  catalogPlugin,
  channelLabel,
  describeVersion,
  lineSlugs,
  pageVersion,
  withoutOverviewItems,
} from './catalog-plugin';

const docs = defineDocs({
  dir: 'content',
  docs: {
    schema: pageSchema,
    // From `git log`, for the sitemap and `article:modified_time` (ADR-0035 decision 5).
    lastModified: true,
    // ADR-0022: the shape check runs before Fumadocs' own plugins; Markdown keeps a diagram's Mermaid.
    mdxOptions: applyMdxPreset({ remarkPlugins: (plugins) => [remarkDiagrams, ...plugins] }),
    postprocess: {
      includeProcessedMarkdown: { filterElement: markdownFilter },
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
  plugins: [lucideIconsPlugin(), catalogPlugin(), diagramsPlugin()],
  // A line's URL segment is its configured name, not its folder name (ADR-0015 decision 4).
  slugs(file, next) {
    return lineSlugs(file.path, next(), docs.getMeta);
  },
});

// llms.txt lists the tree as written: each overview under its entry, once (ADR-0025 decision 5).
const llmsSource: typeof source = { ...source, getPageTree: () => withoutOverviewItems(source.getPageTree()) };

export const docsLlms = llms(llmsSource, {
  renderName(node, ctx) {
    // The tree's root is unnamed, so Fumadocs would head the index "Docs" (ADR-0028).
    if (node.type === 'root') {
      return appName;
    }
    const meta = node.type === 'folder' ? source.getNodeMeta(node, ctx.lang) : undefined;
    const data = meta?.data as CatalogMeta | undefined;
    if (node.type === 'page') {
      return source.getNodePage(node, ctx.lang)?.data.title ?? String(node.name);
    }
    const name = typeof node.name === 'string' ? node.name : '';
    if (data?.version && data.channel) {
      // The catalogue plugin has already set a line's name (ADR-0015 decision 4); its title may differ.
      return `${name} — ${data.version}, ${channelLabel[data.channel].toLowerCase()}`;
    }
    return data?.title ?? name;
  },
  renderDescription(node, ctx) {
    if (node.type === 'page') {
      return source.getNodePage(node, ctx.lang)?.data.description ?? '';
    }
    // Line folders carry their version in the name; the tree's own description would repeat it.
    return (source.getNodeMeta(node, ctx.lang)?.data as CatalogMeta | undefined)?.description ?? '';
  },
  renderPage: async (page) => {
    const version = pageVersion(page.path, getMeta);
    const header = version ? `\n\n> Documents ${describeVersion(version)}.` : '';
    return `# ${page.data.title} (${page.url})${header}

${await page.data.getText('processed')}`;
  },
});
