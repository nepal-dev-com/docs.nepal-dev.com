import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { ArrowUpRight } from 'lucide-react';
import { embedSrcProblem } from '@/lib/diagrams';

/**
 * An Archify diagram from `public/diagrams/`, in a sandboxed frame with a full-screen link and
 * a caption (ADR-0011 decision 3). A bad `src` or a missing file fails the build.
 */
export function HtmlEmbed({ src, title }: { src: string; title: string }) {
  const problem =
    embedSrcProblem(src) ?? (existsSync(join(process.cwd(), 'public', src)) ? undefined : `"${src}" has no file in public/`);
  if (problem) {
    throw new Error(`<HtmlEmbed>: ${problem} (ADR-0011)`);
  }
  if (!title.trim()) {
    throw new Error(`<HtmlEmbed src="${src}">: a title is required (ADR-0011)`);
  }

  return (
    <figure className="html-embed not-prose">
      {/* No allow-same-origin: the diagram's script runs in an opaque origin (ADR-0011). */}
      <iframe src={src} title={title} sandbox="allow-scripts allow-downloads" loading="lazy" />
      <figcaption>
        <a href={src}>
          Open full screen
          <ArrowUpRight aria-hidden />
        </a>
        <span>{title}</span>
      </figcaption>
    </figure>
  );
}
