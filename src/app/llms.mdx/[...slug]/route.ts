import { docsLlms, source } from '@/lib/source';
import { getPageMarkdownUrl } from '@/lib/shared';
import { notFound } from 'next/navigation';

export async function GET(_req: Request, { params }: RouteContext<'/llms.mdx/[...slug]'>) {
  const { slug } = await params;
  const page = source.getPage(slug.slice(0, -1));
  if (!page) notFound();

  return new Response(await docsLlms.page(page), {
    headers: {
      'Content-Type': 'text/markdown',
      // Here rather than next.config.mjs: `/<page>.md` reaches this route through the proxy's rewrite (ADR-0035).
      'X-Robots-Tag': 'noindex',
    },
  });
}

export function generateStaticParams() {
  return source.getPages().map((page) => ({
    lang: page.locale,
    slug: getPageMarkdownUrl(page).segments,
  }));
}
