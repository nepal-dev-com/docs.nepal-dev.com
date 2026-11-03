import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { diagramSize, embedSrcProblem, type DiagramSize } from './diagrams';

const segment = /^[a-z0-9][a-z0-9-]*$/;

function diagramsDir(): string {
  return join(process.cwd(), 'diagrams');
}

/** Every committed Archify HTML file, as route params. */
export function listDiagrams(): { project: string; file: string }[] {
  const root = diagramsDir();
  if (!existsSync(root)) {
    return [];
  }
  return readdirSync(root, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && segment.test(entry.name))
    .flatMap((project) =>
      readdirSync(join(root, project.name))
        .filter((file) => embedSrcProblem(`/diagrams/${project.name}/${file}`) === undefined)
        .map((file) => ({ project: project.name, file })),
    );
}

/** The Archify HTML at `/diagrams/<project>/<file>`, or undefined when there is none. */
export function readDiagram(project: string, file: string): string | undefined {
  if (embedSrcProblem(`/diagrams/${project}/${file}`)) {
    return undefined;
  }
  const path = join(diagramsDir(), project, file);
  return existsSync(path) ? readFileSync(path, 'utf8') : undefined;
}

/** The diagram's size for a `<Diagram src>`, or undefined when its file is missing or unreadable. */
export function readDiagramSize(src: string): DiagramSize | undefined {
  const [, , project, file] = src.split('/');
  const html = project && file ? readDiagram(project, file) : undefined;
  return html === undefined ? undefined : diagramSize(html);
}
