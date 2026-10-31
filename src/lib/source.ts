import { llms, loader } from 'fumadocs-core/source';
import { lucideIconsPlugin } from 'fumadocs-core/source/lucide-icons';
import { docsRoute } from './shared';
import { defineDocs } from 'fumadocs-mdx/macro';
import { pageSchema } from 'fumadocs-core/source/schema';
import { catalogMetaSchema, type CatalogMeta } from './catalog-schema';
import { catalogPlugin, channelLabel, describeVersion, lineInfo, pageVersion } from './catalog-plugin';

const docs = defineDocs({
  dir: 'content',
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
  // A line's URL segment is its configured name, not its folder name (ADR-0015 decision 4).
  slugs(file, next) {
    const [slug, track, folder, ...rest] = file.path.split('/');
    if (track !== 'use' || !folder || rest.length === 0) {
      return undefined;
    }
    const info = lineInfo(folder, docs.getMeta(`${slug}/use/${folder}/meta.json`));
    if (!info) {
      return undefined;
    }
    const slugs = next();
    return [...slugs.slice(0, 2), info.segment, ...slugs.slice(3)];
  },
});

export const docsLlms = llms(source, {
  renderName(node, ctx) {
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
