import type { MetadataRoute } from 'next';
import { pageSearchRule } from '@/lib/catalog';
import { sitemapEntries, siteUrl } from '@/lib/seo';
import { source } from '@/lib/source';

export default function sitemap(): MetadataRoute.Sitemap {
  const pages = source.getPages().map((page) => ({
    url: page.url,
    rule: pageSearchRule(page),
    modified: page.data.lastModified,
  }));
  return sitemapEntries(pages, siteUrl);
}
