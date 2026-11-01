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
import { getEntry, getPageContext, pageInLine } from '@/lib/catalog';
import { VersionNotice } from '@/components/docs/version-notice';
import { PackageHero } from '@/components/docs/package-hero';
import { ReadingTimeProvider, TrajectoryPopover, TrajectoryTOC } from '@/components/docs/trajectory-toc';
import { TOCProvider } from 'fumadocs-ui/layouts/notebook/page/slots/toc';
import { readingMinutes } from '@/lib/reading-time';

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

  return (
    <ReadingTimeProvider minutes={readingMinutes(page.data.structuredData)}>
      <DocsPage
        toc={page.data.toc}
        full={page.data.full}
        // "On this page" is a trajectory with a probe (ADR-0018 decision 3).
        slots={{ toc: { provider: TOCProvider, main: TrajectoryTOC, popover: TrajectoryPopover } }}
      >
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
    </ReadingTimeProvider>
  );
}

export async function generateStaticParams() {
  return source.generateParams();
}

export async function generateMetadata(props: PageProps<'/[...slug]'>): Promise<Metadata> {
  const params = await props.params;
  const page = source.getPage(params.slug);
  if (!page) {
    return {};
  }

  return {
    title: page.data.title,
    description: page.data.description,
    openGraph: {
      images: getPageImageUrl(page).url,
    },
  };
}
