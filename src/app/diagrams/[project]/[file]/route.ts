import { notFound } from 'next/navigation';
import { listDiagrams, readDiagram } from '@/lib/diagram-files';
import { withShell } from '@/lib/diagram-shell';

/** An Archify diagram from `diagrams/`, with the site shell, prerendered (ADR-0022 decision 5). */
export async function GET(_req: Request, { params }: RouteContext<'/diagrams/[project]/[file]'>) {
  const { project, file } = await params;
  const html = readDiagram(project, file);
  if (html === undefined) {
    notFound();
  }
  return new Response(withShell(html), {
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  });
}

export function generateStaticParams() {
  return listDiagrams();
}
