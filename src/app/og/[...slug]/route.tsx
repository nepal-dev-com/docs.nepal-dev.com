import { ImageResponse } from 'next/og';
import { notFound } from 'next/navigation';
import type { ReactElement } from 'react';
import { HomeShareImage, PageShareImage } from '@/components/share-image';
import { getCatalog, getPageContext } from '@/lib/catalog';
import { heroRings } from '@/lib/hero-sky';
import { kindName, ringOf } from '@/lib/rings';
import { shareImageSize, siteUrl } from '@/lib/seo';
import { shareFonts } from '@/lib/share-fonts';
import { getPageImageUrl } from '@/lib/shared';
import { source } from '@/lib/source';

const domain = siteUrl?.host;

async function respond(image: ReactElement) {
  return new ImageResponse(image, { ...shareImageSize, fonts: await shareFonts() });
}

function trackName(track: 'use' | 'maintain' | undefined) {
  if (!track) {
    return undefined;
  }
  return track === 'use' ? 'Use' : 'Maintain';
}

export async function GET(_req: Request, { params }: RouteContext<'/og/[...slug]'>) {
  const { slug } = await params;
  const pageSlugs = slug.slice(0, -1);

  // `/og/image.png`: the home page has no entry in `source`.
  if (pageSlugs.length === 0) {
    const entries = getCatalog();
    return respond(
      <HomeShareImage
        domain={domain}
        rings={heroRings(entries)}
        planets={entries.map((entry) => ({ slug: entry.slug, ring: ringOf(entry), kind: entry.kind }))}
      />,
    );
  }

  const page = source.getPage(pageSlugs);
  if (!page) {
    notFound();
  }

  const context = getPageContext(page);
  const ring = context && ringOf(context.entry);
  const overview = page.slugs.length === 1;
  return respond(
    <PageShareImage
      url={page.url}
      title={page.data.title}
      description={page.data.description ?? ''}
      domain={domain}
      entry={
        context && ring
          ? {
              label: overview ? kindName[ring] : context.entry.title,
              ring,
              kind: context.entry.kind,
              track: trackName(context.track),
              line: context.version && { name: context.version.line, channel: context.version.channel },
            }
          : undefined
      }
    />,
  );
}

export function generateStaticParams() {
  return [
    { slug: ['image.png'] },
    ...source.getPages().map((page) => ({
      lang: page.locale,
      slug: getPageImageUrl(page).segments,
    })),
  ];
}
