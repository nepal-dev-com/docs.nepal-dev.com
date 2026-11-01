import { describe, expect, test } from 'bun:test';
import { readdirSync } from 'node:fs';
import { GET, generateStaticParams } from './route';
import { readDiagram } from '@/lib/diagram-files';

const call = (project: string, file: string) =>
  GET(new Request(`http://localhost/diagrams/${project}/${file}`), {
    params: Promise.resolve({ project, file }),
  } as Parameters<typeof GET>[1]);

describe('generateStaticParams', () => {
  test('lists every committed diagram and nothing else', () => {
    const html = readdirSync('diagrams/docs').filter((file) => file.endsWith('.html')).sort();
    const params = generateStaticParams();
    expect(params.filter((p) => p.project === 'docs').map((p) => p.file).sort()).toEqual(html);
    expect(params.every((p) => p.file.endsWith('.html'))).toBeTrue();
  });
});

describe('GET', () => {
  test('serves the diagram with the site shell as HTML', async () => {
    const response = await call('docs', 'site-pages.html');
    expect(response.status).toBe(200);
    expect(response.headers.get('Content-Type')).toBe('text/html; charset=utf-8');
    const body = await response.text();
    expect(body).toContain('id="site-shell-style"');
    expect(body).toContain('data-reader-fit=');
  });

  test.each([
    ['docs', 'missing.html'],
    ['docs', 'site-pages.json'],
    ['docs', '..%2Fpackage.json'],
    ['..', 'package.json'],
    ['Docs', 'site-pages.html'],
  ])('refuses %s/%s', async (project, file) => {
    expect(readDiagram(project, file)).toBeUndefined();
    await expect(call(project, file)).rejects.toThrow();
  });
});
