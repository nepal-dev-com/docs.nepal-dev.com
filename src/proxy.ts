import { NextRequest, NextResponse } from 'next/server';
import { isMarkdownPreferred, rewritePath } from 'fumadocs-core/negotiation';
import { docsContentRoute } from '@/lib/shared';
import { isEntryPath, isKnownPath, resolveLineRedirect } from '@/lib/catalog-routes';
import { isSiteRoute } from '@/lib/known-paths';

const { rewrite: rewriteDocs } = rewritePath('{/*path}', `${docsContentRoute}{/*path}/content.md`);
const { rewrite: rewriteSuffix } = rewritePath('{/*path}.md', `${docsContentRoute}{/*path}/content.md`);

function answerEntryPath(request: NextRequest): NextResponse | undefined {
  const { pathname } = request.nextUrl;
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

  return undefined;
}

export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  // Pages share the root with the site's own routes (ADR-0015).
  if (isSiteRoute(pathname)) {
    return NextResponse.next();
  }

  const answer = isEntryPath(pathname) ? answerEntryPath(request) : undefined;
  if (answer) {
    return answer;
  }

  if (isKnownPath(pathname)) {
    return NextResponse.next();
  }

  // A page learns this too late: its fallback shell has already gone out with a 200 (ADR-0034).
  return NextResponse.rewrite(new URL('/_not-found', request.nextUrl), { status: 404 });
}
