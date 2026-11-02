import type { Metadata, MetadataRoute } from 'next';
import type { Channel } from './catalog-schema';
import type { Ring } from './rings';
import type { Level } from './scale-strip';
import { appName, owner } from './shared';

/** ADR-0035 decision 1: an https origin, or undefined when the site has no public address. */
export function parseSiteUrl(value: string | undefined): URL | undefined {
  if (!value) {
    return undefined;
  }
  const refuse = () => new Error(`SITE_URL must be an https origin with no path, such as https://example.com: ${value}`);
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw refuse();
  }
  if (url.protocol !== 'https:' || url.pathname !== '/' || url.search || url.hash) {
    throw refuse();
  }
  return url;
}

export const siteUrl = parseSiteUrl(process.env.SITE_URL);

export interface PagePlace {
  url: string;
  /** The file, relative to `content/`; empty for the home page. */
  path: string;
  channel?: Channel;
  /** The same page in the latest line, when this one is in an older line. */
  latestCounterpart?: string;
}

export interface SearchRule {
  index: boolean;
  canonical?: string;
  inSitemap: boolean;
}

const notIndexed: SearchRule = { index: false, inSitemap: false };

/** What search engines are told about a page, from where it sits (ADR-0035 decisions 2 and 3). */
export function searchRule(place: PagePlace, site: URL | undefined): SearchRule {
  if (!site || place.channel === 'dev' || place.path.split('/').includes('_templates')) {
    return notIndexed;
  }
  if (place.channel === 'legacy' && place.latestCounterpart) {
    return { index: true, canonical: place.latestCounterpart, inSitemap: false };
  }
  return { index: true, canonical: place.url, inSitemap: true };
}

interface TitleInput {
  title: string;
  entry?: string;
  overview?: boolean;
  line?: { name: string; channel: Channel };
}

/** ADR-0035 decision 7. */
export function pageTitle({ title, entry, overview, line }: TitleInput): string {
  if (!entry) {
    return `${title} — ${appName}`;
  }
  if (overview) {
    return `${entry} — ${appName}`;
  }
  const named = line && line.channel !== 'latest' ? `${entry} ${line.name}` : entry;
  return `${title} — ${named} — ${appName}`;
}

export const shareImageSize = { width: 1200, height: 630 };

interface MetadataInput {
  title: string;
  description: string;
  url: string;
  rule: SearchRule;
  type: 'website' | 'article';
  imageUrl: string;
  imageAlt: string;
  markdownUrl?: string;
  modified?: Date;
}

/** Everything a page's head carries (ADR-0035 decision 9). */
export function pageMetadata(input: MetadataInput): Metadata {
  const { title, description, url, rule, type, imageUrl, imageAlt, markdownUrl, modified } = input;
  const images = [{ url: imageUrl, ...shareImageSize, type: 'image/png', alt: imageAlt }];
  const shared = {
    title,
    description,
    url: rule.canonical ?? url,
    siteName: appName,
    // The site's own pages are written in British English.
    locale: 'en_GB',
    images,
  };
  return {
    title,
    description,
    alternates: {
      ...(rule.canonical ? { canonical: rule.canonical } : {}),
      ...(markdownUrl ? { types: { 'text/markdown': markdownUrl } } : {}),
    },
    robots: rule.index ? { index: true, follow: true, 'max-image-preview': 'large' } : { index: false, follow: true },
    openGraph:
      type === 'article'
        ? {
            ...shared,
            type,
            authors: [owner.url],
            ...(modified ? { modifiedTime: modified.toISOString() } : {}),
          }
        : { ...shared, type },
    twitter: { card: 'summary_large_image', title, description, images: [imageUrl] },
  };
}

/** ADR-0035 decisions 2 and 4: the site offers itself to tools through `llms.txt`, so no crawler is turned away. */
export function robotsRules(site: URL | undefined): MetadataRoute.Robots {
  if (!site) {
    return { rules: { userAgent: '*', disallow: '/' } };
  }
  return { rules: { userAgent: '*', allow: '/' }, sitemap: new URL('/sitemap.xml', site).href };
}

/** ADR-0035 decision 5. */
export function sitemapEntries(
  pages: { url: string; rule: SearchRule; modified?: Date }[],
  site: URL | undefined,
): MetadataRoute.Sitemap {
  if (!site) {
    return [];
  }
  return [
    { url: new URL('/', site).href },
    ...pages
      .filter((page) => page.rule.inSitemap)
      .map((page) => ({
        url: new URL(page.url, site).href,
        ...(page.modified ? { lastModified: page.modified } : {}),
      })),
  ];
}

const context = 'https://schema.org';

const person = {
  '@type': 'Person',
  name: owner.name,
  url: owner.url,
  sameAs: ['https://github.com/puncoz'],
};

/** ADR-0035 decision 10. No SearchAction: search is a dialog, with no results address to name. */
export function homeJsonLd(description: string, site: URL) {
  return {
    '@context': context,
    '@graph': [
      { '@type': 'WebSite', name: appName, url: new URL('/', site).href, description, inLanguage: 'en', author: person },
      person,
    ],
  };
}

/** Plain names, not the scale strip's space words (the Places, Not Controls rule). */
export function breadcrumbJsonLd(levels: Level[], url: string, site: URL) {
  const crumbs = levels
    .filter((level) => level.kind !== 'verse' && level.kind !== 'system')
    .map((level) => ({ name: level.name, url: level.current ? url : level.url }))
    .filter((level): level is { name: string; url: string } => Boolean(level.url));
  return {
    '@type': 'BreadcrumbList',
    itemListElement: crumbs.map((crumb, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: crumb.name,
      item: new URL(crumb.url, site).href,
    })),
  };
}

interface PageJsonLdInput {
  headline: string;
  description: string;
  url: string;
  imageUrl: string;
  levels: Level[];
  modified?: Date;
  /** On an overview with a repository. */
  software?: { name: string; repository: string; version?: string };
}

export function pageJsonLd(input: PageJsonLdInput, site: URL) {
  const { headline, description, url, imageUrl, levels, modified, software } = input;
  const address = new URL(url, site).href;
  const graph: { '@type': string }[] = [
    {
      '@type': 'TechArticle',
      headline,
      description,
      url: address,
      inLanguage: 'en',
      image: new URL(imageUrl, site).href,
      author: person,
      isPartOf: { '@type': 'WebSite', name: appName, url: new URL('/', site).href },
      ...(modified ? { dateModified: modified.toISOString() } : {}),
    } as { '@type': string },
    breadcrumbJsonLd(levels, url, site),
  ];
  if (software) {
    graph.push({
      '@type': 'SoftwareSourceCode',
      name: software.name,
      description,
      url: address,
      codeRepository: software.repository,
      author: person,
      ...(software.version ? { version: software.version } : {}),
    } as { '@type': string });
  }
  return { '@context': context, '@graph': graph };
}

/** For a `<script>`: an unescaped `<` could close it (Next.js's JSON-LD guide). */
export function serializeJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, '\\u003c');
}

// An image can't read CSS variables, so these copy the dark theme's tokens; a test compares them.
export const shareColors: {
  ground: string;
  ink: string;
  muted: string;
  line: string;
  star: string;
  accent: string;
  rings: Record<Ring, string>;
} = {
  ground: '#0a0c10',
  ink: '#e9ecf2',
  muted: '#9ba4b6',
  line: '#323a4c',
  star: '#ffe2a8',
  accent: '#3ddbb6',
  rings: {
    npm: '#ff6f61',
    composer: '#a394ff',
    pypi: '#ffd166',
    go: '#56cdf2',
    cargo: '#f0a86a',
    other: '#9ba4b6',
    project: '#e9ecf2',
  },
};

/** A long title is set smaller rather than cut (ADR-0035 decision 11). */
export function titleSize(title: string): number {
  if (title.length <= 26) {
    return 84;
  }
  if (title.length <= 50) {
    return 66;
  }
  if (title.length <= 90) {
    return 52;
  }
  return 42;
}

const descriptionLimit = 150;

export function shortenDescription(description: string): string {
  if (description.length <= descriptionLimit) {
    return description;
  }
  const cut = description.lastIndexOf(' ', descriptionLimit);
  return `${description.slice(0, cut > 0 ? cut : descriptionLimit)}…`;
}

/** Each image's sky is its own, and the same on every build. */
export function skySeed(url: string): number {
  let hash = 7;
  for (const char of url) {
    hash = (hash * 31 + char.charCodeAt(0)) % 2147483647;
  }
  return hash || 1;
}
