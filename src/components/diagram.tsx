import { embedSrcProblem } from '@/lib/diagrams';
import { readDiagramSize } from '@/lib/diagram-files';
import { DiagramFrame } from './diagram-frame';

/**
 * A Mermaid diagram's Archify view (ADR-0022 decision 2). The Mermaid fence it holds is for the
 * page's Markdown only, so it is not rendered here.
 */
export function Diagram({ src, title }: { src: string; title: string; children?: unknown }) {
  const problem = embedSrcProblem(src);
  if (problem) {
    throw new Error(`<Diagram>: ${problem} (ADR-0022)`);
  }
  if (typeof title !== 'string' || !title.trim()) {
    throw new Error(`<Diagram src="${src}">: a title is required (ADR-0022)`);
  }
  const size = readDiagramSize(src);
  if (!size) {
    throw new Error(`<Diagram src="${src}">: no Archify diagram at diagrams${src.slice('/diagrams'.length)} (ADR-0022)`);
  }
  return <DiagramFrame src={src} title={title} ratio={size.height / size.width} wide={size.wide} />;
}
