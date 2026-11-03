import type { Code, Parent, Root, RootContent } from 'mdast';
import type { MdxJsxFlowElement } from 'mdast-util-mdx-jsx';
import type { VFile } from 'vfile';
import { embedSrcProblem } from './diagrams';

/** Templates show the shape bare; a copy is wrapped before it builds (ADR-0022 decision 4). */
const exempt = /(^|[\\/])content[\\/]docs[\\/]maintain[\\/]_templates[\\/]/;

type Node = Root | RootContent;

function isDiagram(node: Node): node is MdxJsxFlowElement {
  return node.type === 'mdxJsxFlowElement' && node.name === 'Diagram';
}

function isMermaid(node: Node): node is Code {
  return node.type === 'code' && node.lang === 'mermaid';
}

function stringAttribute(node: MdxJsxFlowElement, name: string): string | undefined {
  const attribute = node.attributes.find((a) => a.type === 'mdxJsxAttribute' && a.name === name);
  return typeof attribute?.value === 'string' ? attribute.value : undefined;
}

/** Why a `<Diagram>` breaks the shape of ADR-0022 decision 1, or undefined. */
export function diagramProblem(node: MdxJsxFlowElement): string | undefined {
  const src = stringAttribute(node, 'src');
  if (src === undefined) {
    return '<Diagram> needs src="/diagrams/<project-slug>/<slug>.html", written as a plain string';
  }
  const srcProblem = embedSrcProblem(src);
  if (srcProblem) {
    return `<Diagram>: ${srcProblem}`;
  }
  const title = stringAttribute(node, 'title');
  if (!title?.trim()) {
    return `<Diagram src="${src}"> needs a title, written as a plain string`;
  }
  const [only, ...rest] = node.children;
  if (!only || rest.length > 0 || !isMermaid(only)) {
    return `<Diagram src="${src}"> must hold exactly one \`\`\`mermaid fence and nothing else`;
  }
  return undefined;
}

/**
 * Every Mermaid diagram is a `<Diagram>` holding exactly one Mermaid fence, so the page shows its
 * Archify view and Markdown its Mermaid (ADR-0022 decisions 1 and 4).
 */
export function remarkDiagrams() {
  return (tree: Root, file: VFile) => {
    const templates = exempt.test(file.path ?? '');
    const visit = (node: Node, insideDiagram: boolean) => {
      if (node.type === 'mdxJsxFlowElement' && node.name === 'HtmlEmbed') {
        file.fail('<HtmlEmbed> is no longer available; write a <Diagram> around the Mermaid fence (ADR-0022)', node);
      }
      if (isDiagram(node)) {
        const problem = diagramProblem(node);
        if (problem) {
          file.fail(`${problem} (ADR-0022)`, node);
        }
      }
      if (isMermaid(node) && !insideDiagram && !templates) {
        file.fail(
          'A ```mermaid fence must sit inside <Diagram src="/diagrams/<project-slug>/<slug>.html" title="…"> (ADR-0022)',
          node,
        );
      }
      if ('children' in node) {
        for (const child of (node as Parent).children) {
          visit(child, insideDiagram || isDiagram(node));
        }
      }
    };
    visit(tree, false);
  };
}

/** Markdown keeps a `<Diagram>`'s Mermaid fence and drops the tag (ADR-0022 decision 3). */
export function markdownFilter(node: { type: string; name?: string | null }): boolean | 'children-only' {
  return node.type === 'mdxJsxFlowElement' && node.name === 'Diagram' ? 'children-only' : true;
}
