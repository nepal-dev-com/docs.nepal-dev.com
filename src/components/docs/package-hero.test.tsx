import { describe, expect, test } from 'bun:test';
import { renderToStaticMarkup } from 'react-dom/server';
import type { CatalogEntry } from '@/lib/catalog';
import { kindLine } from '@/components/home/planet-cards';
import { PackageHero } from './package-hero';

// Invented values (ADR-0008): acme and its repositories are not real.
const acme: CatalogEntry = {
  slug: 'acme',
  title: 'acme',
  description: 'Bookings for small studios.',
  kind: 'project',
  featured: false,
  url: '/acme',
  useUrl: '/acme/use',
  lines: [],
  repositories: [
    { id: 'frontend', name: 'Frontend', url: 'https://github.com/example/acme-web', primary: true },
    { id: 'backend', name: 'Backend', url: 'https://github.com/example/acme-server', primary: false },
    { id: 'api', name: 'API', primary: false },
  ],
};

describe('PackageHero with repositories (ADR-0024)', () => {
  const html = renderToStaticMarkup(<PackageHero entry={acme} />);

  test('links each repository by name, primary first', () => {
    const frontend = html.indexOf('href="https://github.com/example/acme-web"');
    const backend = html.indexOf('href="https://github.com/example/acme-server"');
    expect(frontend).toBeGreaterThan(-1);
    expect(backend).toBeGreaterThan(frontend);
    expect(html).toContain('rel="noreferrer noopener"');
    expect(html).not.toContain('>Repository<');
  });

  test('names a repository without a URL, unlinked', () => {
    expect(html).toContain('<span class="pkg-link-plain">API</span>');
  });

  test('lists the repositories in the facts, without a version for an unversioned project', () => {
    expect(html).toContain('<dt>Repositories</dt><dd>Frontend, Backend, API</dd>');
    expect(html).not.toContain('<dt>Latest</dt>');
  });

  test('a one-repository entry keeps its single Repository link', () => {
    const single = renderToStaticMarkup(
      <PackageHero entry={{ ...acme, repositories: undefined, repository: 'https://github.com/example/acme' }} />,
    );
    expect(single).toContain('href="https://github.com/example/acme"');
    expect(single).not.toContain('Repositories');
  });
});

describe('kindLine', () => {
  test("adds a project's number of repositories", () => {
    expect(kindLine(acme)).toBe('Project · 3 repositories');
    expect(kindLine({ ...acme, repositories: undefined })).toBe('Project');
  });
});
