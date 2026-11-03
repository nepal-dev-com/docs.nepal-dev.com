/** ADR-0011 and ADR-0022: where Archify diagrams live and how pages use them. Pure functions. */

const embedSrc = /^\/diagrams\/[a-z0-9][a-z0-9-]*\/[a-z0-9][a-z0-9-]*\.html$/;
const diagramFile = /^([a-z0-9][a-z0-9-]*)\/([a-z0-9][a-z0-9-]*)\.(html|json)$/;
const receipt = /\.delivery.*\.json$/;

/** Why a `<Diagram>` `src` is refused, or undefined when it is allowed. */
export function embedSrcProblem(src: string): string | undefined {
  if (!src.startsWith('/diagrams/')) {
    return `"${src}" is outside /diagrams/`;
  }
  if (!src.endsWith('.html')) {
    return `"${src}" is not an .html file`;
  }
  if (!embedSrc.test(src)) {
    return `"${src}" is not /diagrams/<project-slug>/<slug>.html`;
  }
  return undefined;
}

/** `/diagrams/docs/a.html` → `docs/a.html`, the file's path under `diagrams/`. */
export function diagramPath(src: string): string {
  return src.slice('/diagrams/'.length);
}

/** The MDX source without fenced code and inline code, where a `<Diagram>` is only an example. */
function withoutCode(mdx: string): string {
  const kept: string[] = [];
  let fence: string | undefined;
  for (const line of mdx.split('\n')) {
    const marker = /^\s*(`{3,}|~{3,})/.exec(line)?.[1];
    if (fence) {
      if (marker && marker[0] === fence[0] && marker.length >= fence.length && line.trim() === marker) {
        fence = undefined;
      }
      continue;
    }
    if (marker) {
      fence = marker;
      continue;
    }
    kept.push(line.replace(/`[^`\n]*`/g, ''));
  }
  return kept.join('\n');
}

/** Every `<Diagram src="…">` in a page's MDX source, outside code. */
export function diagramSrcs(mdx: string): string[] {
  return [...withoutCode(mdx).matchAll(/<Diagram\b[^>]*?\bsrc="([^"]*)"/g)].map((match) => match[1]);
}

export interface DiagramFiles {
  /** Paths under `diagrams/`. */
  diagrams: string[];
  /** Paths under `public/`. */
  publicFiles: string[];
  /** Every `src` the pages use. */
  used: string[];
}

/** Problems with the diagram files (ADR-0022 decision 5). All paths use forward slashes. */
export function checkDiagrams({ diagrams, publicFiles, used }: DiagramFiles): string[] {
  const problems: string[] = [];
  const present = new Set(diagrams);
  const usedPaths = new Set(used.map(diagramPath));

  for (const file of publicFiles) {
    const name = file.split('/').at(-1) ?? file;
    // Archify's receipts hold absolute local paths (ADR-0011, security considerations).
    if (receipt.test(name)) {
      problems.push(`public/${file}: an Archify receipt; never commit it`);
    } else if (file.startsWith('diagrams/')) {
      problems.push(`public/${file}: diagrams live in diagrams/<project-slug>/, not public/`);
    }
  }

  for (const file of diagrams) {
    const name = file.split('/').at(-1) ?? file;
    if (receipt.test(name)) {
      problems.push(`diagrams/${file}: an Archify receipt; never commit it`);
      continue;
    }
    const match = diagramFile.exec(file);
    if (!match) {
      problems.push(`diagrams/${file}: only <project-slug>/<slug>.json and .html belong here`);
      continue;
    }
    const [, project, slug, extension] = match;
    if (extension === 'json' && !present.has(`${project}/${slug}.html`)) {
      problems.push(`diagrams/${file}: no Archify HTML at diagrams/${project}/${slug}.html`);
    }
    if (extension === 'html') {
      if (!present.has(`${project}/${slug}.json`)) {
        problems.push(`diagrams/${file}: no Archify source at diagrams/${project}/${slug}.json`);
      }
      if (!usedPaths.has(file)) {
        problems.push(`diagrams/${file}: no page uses it in a <Diagram>`);
      }
    }
  }

  for (const src of new Set(used)) {
    const problem = embedSrcProblem(src);
    if (problem) {
      problems.push(`<Diagram src>: ${problem}`);
    } else if (!present.has(diagramPath(src))) {
      problems.push(`<Diagram src="${src}">: no file at diagrams/${diagramPath(src)}`);
    }
  }
  return problems;
}

/** The diagram's `viewBox` size and Archify's fit, read from its main `svg`. */
export interface DiagramSize {
  width: number;
  height: number;
  /** Archify keeps a wide diagram at a minimum width on phones, scrolling sideways. */
  wide: boolean;
}

// Archify's own threshold for a wide diagram (`WIDE_RATIO` in its viewer).
const WIDE_RATIO = 1.55;

export function diagramSize(html: string): DiagramSize | undefined {
  // The diagram's own svg is labelled by its title; icons and controls are other svgs.
  const tag = /<svg\b[^>]*\baria-labelledby="archify-diagram-title[^>]*>/.exec(html)?.[0];
  const viewBox = tag && /\bviewBox="0 0 ([\d.]+) ([\d.]+)"/.exec(tag);
  if (!tag || !viewBox) {
    return undefined;
  }
  const width = Number(viewBox[1]);
  const height = Number(viewBox[2]);
  if (!(width > 0 && height > 0)) {
    return undefined;
  }
  return { width, height, wide: width / height >= WIDE_RATIO };
}

export const HEIGHT_MIN = 120;
export const HEIGHT_MAX = 4000;

/** The height in a frame's message, or undefined when the message is not a height report. */
export function reportedHeight(data: unknown): number | undefined {
  if (typeof data !== 'object' || data === null) {
    return undefined;
  }
  const { type, height } = data as { type?: unknown; height?: unknown };
  if (type !== 'archify-height' || typeof height !== 'number' || !Number.isFinite(height)) {
    return undefined;
  }
  if (height < HEIGHT_MIN || height > HEIGHT_MAX) {
    return undefined;
  }
  return Math.ceil(height);
}

/** Whether a frame's message asks the page to open the diagram's own Present stage. */
export function isPresentRequest(data: unknown): boolean {
  return typeof data === 'object' && data !== null && (data as { type?: unknown }).type === 'archify-present';
}
