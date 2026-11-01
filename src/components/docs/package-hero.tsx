import type { CSSProperties } from 'react';
import Link from 'next/link';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import type { CatalogEntry } from '@/lib/catalog';
import { kindName, ringOf } from '@/lib/rings';
import { PlanetMark, PlanetSystem } from '@/components/planet';

/**
 * The planet header above a package or project overview: what it is, its facts and links, and
 * the planet with its moons (ADR-0017 decision 10).
 */
export function PackageHero({ entry }: { entry: CatalogEntry }) {
  const ring = ringOf(entry);
  const older = entry.lines.filter((line) => line.channel === 'legacy');

  return (
    <section
      className="pkg-hero not-prose"
      style={{ '--eco': `var(--home-${ring})` } as CSSProperties}
      aria-label={`${entry.title} at a glance`}
    >
      <div className="pkg-text">
        <p className="pkg-kind">
          <PlanetMark ring={ring} kind={entry.kind} />
          {kindName[ring]}
        </p>
        <p className="pkg-name">{entry.title}</p>
        {entry.description && <p className="pkg-desc">{entry.description}</p>}
        {(entry.lines.length > 0 || entry.repositories) && (
          <dl className="fact-sheet">
            {entry.lines.length > 0 && (
              <>
                <dt>Latest</dt>
                <dd>{entry.latest ? `${entry.latest.version} · ${entry.latest.name}` : 'unreleased'}</dd>
              </>
            )}
            {entry.dev && (
              <>
                <dt>In development</dt>
                <dd className="dim">{entry.dev.version}</dd>
              </>
            )}
            {entry.repositories && (
              <>
                <dt>Repositories</dt>
                <dd>{entry.repositories.map((repo) => repo.name).join(', ')}</dd>
              </>
            )}
            {older.length > 0 && (
              <>
                <dt>Older</dt>
                <dd className="dim">{older.map((line) => line.name).join(', ')}</dd>
              </>
            )}
          </dl>
        )}
        <nav className="pkg-links" aria-label={`${entry.title} links`}>
          {entry.useUrl && (
            <Link href={entry.useUrl} data-primary="">
              Use
              <ArrowRight aria-hidden />
            </Link>
          )}
          {entry.maintainUrl && <Link href={entry.maintainUrl}>Maintain</Link>}
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
          {entry.repositories?.map((repo) =>
            repo.url ? (
              <a key={repo.id} href={repo.url} rel="noreferrer noopener">
                {repo.name}
                <ArrowUpRight aria-hidden />
              </a>
            ) : (
              <span key={repo.id} className="pkg-link-plain">
                {repo.name}
              </span>
            ),
          )}
        </nav>
      </div>
      <PlanetSystem
        ring={ring}
        kind={entry.kind}
        lines={entry.lines}
        width={300}
        height={210}
        scale={1.3}
        className="pkg-system"
      />
    </section>
  );
}
