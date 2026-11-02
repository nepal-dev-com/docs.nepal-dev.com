import { source } from '@/lib/source';
import {
  DocsBody,
  DocsDescription,
  DocsPage,
  DocsTitle,
  MarkdownCopyButton,
  ViewOptionsPopover,
} from 'fumadocs-ui/layouts/notebook/page';
import { notFound, redirect } from 'next/navigation';
import { getMDXComponents } from '@/components/mdx';
import { withProfileChips } from '@/components/profile-link';
import type { Metadata } from 'next';
import { createRelativeLink } from 'fumadocs-ui/mdx';
import { getPageImageUrl, getPageMarkdownUrl, gitConfig } from '@/lib/shared';
import { checkKnownPaths, getEntry, getPageContext, pageInLine, pageSearchRule } from '@/lib/catalog';
import { pageJsonLd, pageMetadata, pageTitle, siteUrl } from '@/lib/seo';
import { JsonLd } from '@/components/json-ld';
import { VersionNotice } from '@/components/docs/version-notice';
import { PackageHero } from '@/components/docs/package-hero';
import { ReadingTimeProvider, TrajectoryPopover, TrajectoryTOC } from '@/components/docs/trajectory-toc';
import { TOCProvider } from 'fumadocs-ui/layouts/notebook/page/slots/toc';
import { readingMinutes } from '@/lib/reading-time';
import { scaleLevels } from '@/lib/scale-strip';
import { ScaleStrip } from '@/components/docs/scale-strip';
import { ZoomPage } from '@/components/zoom-page';

// Every part of a docs page comes from its slug, so there is no shared shell worth streaming
// behind a skeleton; blocking keeps each page whole in its static HTML, readable without scripts.
export const instant = false;

/**
 * `/<slug>/use` and a line's own address have no page of their own: they open the first page
 * (ADR-0015 decision 1).
 */
function landingFor(slugs: string[]): string | undefined {
  const [slug, track, segment, ...rest] = slugs;
  const entry = getEntry(slug);
  if (!entry || track !== 'use' || rest.length > 0) {
    return undefined;
  }
  if (!segment) {
    return entry.useUrl;
  }
  return entry.lines.find((line) => line.segment === segment)?.url;
}

export default async function Page(props: PageProps<'/[...slug]'>) {
  const params = await props.params;
  const page = source.getPage(params.slug);
  if (!page) {
    const landing = landingFor(params.slug);
    if (landing) {
      redirect(landing);
    }
    notFound();
  }

  const MDX = page.data.body;
  const markdownUrl = getPageMarkdownUrl(page).url;
  const context = getPageContext(page);
  const latest = context?.entry.latest;
  const version = context?.version;
  const overview = context && page.slugs.length === 1;
  const levels = scaleLevels({ tree: source.getPageTree(), url: page.url, title: page.data.title, entry: context?.entry });
  const rule = pageSearchRule(page);
  const repository = context?.entry.repository ?? context?.entry.repositories?.find((item) => item.primary)?.url;

  return (
    <ReadingTimeProvider minutes={readingMinutes(page.data.structuredData)}>
      {/* A page that points at another, or stays out of search, describes nothing (ADR-0035 decision 10). */}
      {siteUrl && rule.canonical === page.url && (
        <JsonLd
          data={pageJsonLd(
            {
              headline: page.data.title,
              description: page.data.description ?? '',
              url: page.url,
              imageUrl: getPageImageUrl(page).url,
              levels,
              modified: page.data.lastModified,
              software:
                overview && repository
                  ? { name: context.entry.title, repository, version: latest?.version }
                  : undefined,
            },
            siteUrl,
          )}
        />
      )}
      <ZoomPage>
        <DocsPage
          toc={page.data.toc}
          full={page.data.full}
          // The scale strip replaces Fumadocs' breadcrumb (ADR-0029 decision 4).
          breadcrumb={{ enabled: false }}
          // "On this page" is a trajectory with a probe (ADR-0018 decision 3).
          slots={{ toc: { provider: TOCProvider, main: TrajectoryTOC, popover: TrajectoryPopover } }}
        >
          <ScaleStrip levels={levels} entry={context?.entry} />
          {overview && <PackageHero entry={context.entry} />}
          <DocsTitle>{page.data.title}</DocsTitle>
          <DocsDescription className="mb-0">{page.data.description}</DocsDescription>
          {version && (
            <VersionNotice
              version={version}
              latest={
                latest && latest.segment !== version.segment
                  ? { version: latest.version, url: pageInLine(page, latest) }
                  : undefined
              }
            />
          )}
          <div className="flex flex-row gap-2 items-center border-b pb-6">
            <MarkdownCopyButton markdownUrl={markdownUrl} />
            <ViewOptionsPopover
              markdownUrl={markdownUrl}
              githubUrl={`https://github.com/${gitConfig.user}/${gitConfig.repo}/blob/${gitConfig.branch}/content/${page.path}`}
            />
          </div>
          <DocsBody>
            <MDX
              components={getMDXComponents({
                // Relative file paths resolve to page URLs; GitHub profile links become chips (ADR-0020).
                a: withProfileChips(createRelativeLink(source, page)),
              })}
            />
          </DocsBody>
        </DocsPage>
      </ZoomPage>
    </ReadingTimeProvider>
  );
}

export async function generateStaticParams() {
  checkKnownPaths();
  return source.generateParams();
}

export async function generateMetadata(props: PageProps<'/[...slug]'>): Promise<Metadata> {
  const params = await props.params;
  const page = source.getPage(params.slug);
  if (!page) {
    return {};
  }

  const context = getPageContext(page);
  const overview = context && page.slugs.length === 1;
  const version = context?.version;
  const title = pageTitle({
    title: page.data.title,
    entry: context?.entry.title,
    overview,
    line: version && { name: version.line, channel: version.channel },
  });
  return pageMetadata({
    title,
    description: page.data.description ?? '',
    url: page.url,
    rule: pageSearchRule(page),
    type: overview ? 'website' : 'article',
    imageUrl: getPageImageUrl(page).url,
    imageAlt: title,
    markdownUrl: `${page.url}.md`,
    modified: page.data.lastModified,
  });
}
