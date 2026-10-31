import { NextRequest, NextResponse } from 'next/server';
import { isMarkdownPreferred, rewritePath } from 'fumadocs-core/negotiation';
import { docsContentRoute } from '@/lib/shared';
import { isEntryPath, resolveLineRedirect } from '@/lib/catalog-routes';

const { rewrite: rewriteDocs } = rewritePath('{/*path}', `${docsContentRoute}{/*path}/content.md`);
const { rewrite: rewriteSuffix } = rewritePath('{/*path}.md', `${docsContentRoute}{/*path}/content.md`);

export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  // Pages share the root with the site's own routes (ADR-0015); only entry paths are touched.
  if (!isEntryPath(pathname)) {
    return NextResponse.next();
  }

  const redirect = resolveLineRedirect(pathname);
  if (redirect) {
    // Temporary: `latest` moves to a new line on every release.
    return NextResponse.redirect(new URL(redirect, request.nextUrl), 307);
  }

  const result = rewriteSuffix(pathname);
  if (result) {
    return NextResponse.rewrite(new URL(result, request.nextUrl));
  }

  if (isMarkdownPreferred(request)) {
    const result = rewriteDocs(pathname);

    if (result) {
      return NextResponse.rewrite(new URL(result, request.nextUrl), {
        // this URL has two representations, selected by `Accept`
        headers: { Vary: 'Accept' },
      });
    }
  }

  return NextResponse.next();
}
