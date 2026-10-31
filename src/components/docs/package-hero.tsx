import Link from 'next/link';
import { ArrowUpRight, BookOpen, Wrench } from 'lucide-react';
import type { CatalogEntry } from '@/lib/catalog';

const kindName: Record<string, string> = {
  npm: 'npm package',
  composer: 'Composer package',
  pypi: 'PyPI package',
  go: 'Go module',
  cargo: 'Cargo crate',
  other: 'Package',
  project: 'Project',
};

/**
 * The band above a package or project overview: what it is, its versions and where to go next
 * (ADR-0015 decision 7).
 */
export function PackageHero({ entry }: { entry: CatalogEntry }) {
  const eco = entry.kind === 'project' ? 'project' : (entry.ecosystem ?? 'other');
  const released = entry.lines.filter((line) => line.channel !== 'dev').reverse();
  const rail = [...released, ...(entry.dev ? [entry.dev] : [])];

  return (
    <section className="pkg-hero not-prose" data-eco={eco} aria-label={`${entry.title} at a glance`}>
      <p className="pkg-kind">
        <span className="pkg-dot" aria-hidden />
        {kindName[eco]}
      </p>
      <p className="pkg-name">{entry.title}</p>
      {entry.description && <p className="pkg-desc">{entry.description}</p>}
      {(entry.latest || entry.dev) && (
        <div className="pkg-versions">
          {entry.latest && (
            <span className="pkg-tag" data-latest="">
              {entry.latest.name} · {entry.latest.version} · latest
            </span>
          )}
          {entry.dev && (
            <span className="pkg-tag" data-dev="">
              dev · {entry.dev.version}
            </span>
          )}
        </div>
      )}
      {rail.length > 1 && (
        <ol className="pkg-rail" aria-label="Documented versions, oldest first">
          {rail.map((line) => (
            <li
              key={line.segment}
              data-latest={line.channel === 'latest' ? '' : undefined}
              data-dev={line.channel === 'dev' ? '' : undefined}
            >
              <span className="pkg-node" aria-hidden />
              {line.name}
            </li>
          ))}
        </ol>
      )}
      <nav className="pkg-links" aria-label={`${entry.title} links`}>
        {entry.useUrl && (
          <Link href={entry.useUrl} data-primary="">
            <BookOpen aria-hidden />
            Use
          </Link>
        )}
        {entry.maintainUrl && (
          <Link href={entry.maintainUrl}>
            <Wrench aria-hidden />
            Maintain
          </Link>
        )}
        {entry.registry && (
          <a href={entry.registry} rel="noreferrer noopener">
            Registry
            <ArrowUpRight aria-hidden />
          </a>
        )}
        {entry.repository && (
          <a href={entry.repository} rel="noreferrer noopener">
            Repository
            <ArrowUpRight aria-hidden />
          </a>
        )}
      </nav>
    </section>
  );
}
