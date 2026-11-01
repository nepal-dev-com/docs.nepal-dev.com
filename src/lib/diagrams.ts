/** ADR-0011: where Archify diagrams live and what may be published. Pure functions. */

const embedSrc = /^\/diagrams\/[a-z0-9][a-z0-9-]*\/[a-z0-9][a-z0-9-]*\.html$/;
const publishedDiagram = /^diagrams\/([a-z0-9][a-z0-9-]*)\/([a-z0-9][a-z0-9-]*)\.html$/;

/** Why an `<HtmlEmbed>` `src` is refused, or undefined when it is allowed. */
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

/**
 * Problems with the published diagrams. `publicFiles` are paths under `public/`, `sources` paths
 * under `diagrams/`, both with forward slashes.
 */
export function checkDiagrams(publicFiles: string[], sources: string[]): string[] {
  const problems: string[] = [];
  const sourceSet = new Set(sources);

  for (const file of publicFiles) {
    const name = file.split('/').at(-1) ?? file;
    // Archify's receipts hold absolute local paths (ADR-0011, security considerations).
    if (/\.delivery.*\.json$/.test(name)) {
      problems.push(`public/${file}: an Archify receipt; only the HTML is published`);
      continue;
    }
    if (!file.startsWith('diagrams/')) {
      continue;
    }
    const match = publishedDiagram.exec(file);
    if (!match) {
      problems.push(`public/${file}: only diagrams/<project-slug>/<slug>.html belongs here`);
      continue;
    }
    const source = `${match[1]}/${match[2]}.json`;
    if (!sourceSet.has(source)) {
      problems.push(`public/${file}: no Archify source at diagrams/${source}`);
    }
  }
  return problems;
}
