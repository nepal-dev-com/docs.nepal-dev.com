import { existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import type { LoaderPlugin } from 'fumadocs-core/source';
import { checkDiagrams } from './diagrams';

function listFiles(dir: string): string[] {
  if (!existsSync(dir)) {
    return [];
  }
  return readdirSync(dir, { recursive: true, withFileTypes: true })
    .filter((entry) => entry.isFile())
    .map((entry) => join(entry.parentPath, entry.name).slice(dir.length + 1).split('\\').join('/'));
}

/** Fails the build on a published diagram without its source, or an Archify receipt (ADR-0011). */
export function diagramsPlugin(): LoaderPlugin {
  return {
    name: 'puncoz:diagrams',
    transformStorage() {
      const root = process.cwd();
      const problems = checkDiagrams(listFiles(join(root, 'public')), listFiles(join(root, 'diagrams')));
      if (problems.length > 0) {
        throw new Error(`Diagram check failed (ADR-0011):\n- ${problems.join('\n- ')}`);
      }
    },
  };
}
