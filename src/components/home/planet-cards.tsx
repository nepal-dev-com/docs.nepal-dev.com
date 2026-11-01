import type { CSSProperties } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import type { CatalogEntry } from '@/lib/catalog';
import { kindName, ringOf } from '@/lib/rings';
import { PlanetMark, PlanetSystem } from '@/components/planet';

/** The card's kind line: the kind, and a project's number of repositories (ADR-0024). */
export function kindLine(entry: CatalogEntry): string {
  const kind = kindName[ringOf(entry)];
  return entry.repositories ? `${kind} · ${entry.repositories.length} repositories` : kind;
}

function PlanetCard({ entry, id }: { entry: CatalogEntry; id?: string }) {
  const ring = ringOf(entry);
  const older = entry.lines.filter((line) => line.channel === 'legacy');

  return (
    <article className="planet" id={id} style={{ '--eco': `var(--home-${ring})` } as CSSProperties}>
      <div className="planet-sky">
        <PlanetSystem ring={ring} kind={entry.kind} lines={entry.lines} width={330} height={168} />
      </div>
      <div className="planet-facts">
        <h3>
          <Link href={entry.url}>{entry.title}</Link>
        </h3>
        <p className="planet-kind">
          <PlanetMark ring={ring} kind={entry.kind} />
          {kindLine(entry)}
        </p>
        {entry.description && <p className="planet-desc">{entry.description}</p>}
        {entry.lines.length > 0 && (
          <dl className="fact-sheet">
            <dt>Latest</dt>
            <dd>{entry.latest ? entry.latest.version : 'unreleased'}</dd>
            {entry.dev && (
              <>
                <dt>In development</dt>
                <dd className="dim">{entry.dev.version}</dd>
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
        <div className="planet-links">
          {entry.useUrl && (
            <Link href={entry.useUrl} data-primary="">
              Use
              <ArrowRight aria-hidden />
            </Link>
          )}
          {entry.maintainUrl && <Link href={entry.maintainUrl}>Maintain</Link>}
          {entry.demoUrl && <Link href={entry.demoUrl}>Demo</Link>}
        </div>
      </div>
    </article>
  );
}

/**
 * One card per public package and project, in catalogue order, with no heading on screen
 * (ADR-0017 decision 3). The header's anchors land on the first card of each kind.
 */
export function PlanetCards({ entries }: { entries: CatalogEntry[] }) {
  if (entries.length === 0) {
    return <p className="planets-empty">No packages or projects yet.</p>;
  }
  const firstPackage = entries.find((entry) => entry.kind === 'package');
  const firstProject = entries.find((entry) => entry.kind === 'project');

  return (
    <div className="planet-grid">
      {entries.map((entry) => (
        <PlanetCard
          key={entry.slug}
          entry={entry}
          id={entry === firstPackage ? 'packages' : entry === firstProject ? 'projects' : undefined}
        />
      ))}
    </div>
  );
}
