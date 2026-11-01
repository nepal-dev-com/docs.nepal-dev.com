import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { LoaderPlugin } from 'fumadocs-core/source';
import { checkDiagrams, diagramSrcs } from './diagrams';

export function listFiles(dir: string): string[] {
  if (!existsSync(dir)) {
    return [];
  }
  return readdirSync(dir, { recursive: true, withFileTypes: true })
    .filter((entry) => entry.isFile())
    .map((entry) => join(entry.parentPath, entry.name).slice(dir.length + 1).split('\\').join('/'));
}

/**
 * Fails the build on a diagram without its source, a diagram no page uses, a `<Diagram>` without
 * its file, or an Archify receipt (ADR-0022 decision 5).
 */
export function diagramsPlugin(): LoaderPlugin {
  return {
    name: 'puncoz:diagrams',
    transformStorage() {
      const root = process.cwd();
      const content = join(root, 'content');
      const used = listFiles(content)
        .filter((file) => file.endsWith('.mdx'))
        .flatMap((file) => diagramSrcs(readFileSync(join(content, file), 'utf8')));
      const problems = checkDiagrams({
        diagrams: listFiles(join(root, 'diagrams')),
        publicFiles: listFiles(join(root, 'public')),
        used,
      });
      if (problems.length > 0) {
        throw new Error(`Diagram check failed (ADR-0022):\n- ${problems.join('\n- ')}`);
      }
    },
  };
}
