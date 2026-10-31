'use client';
import Link from 'next/link';
import { BookOpen, Play, Wrench } from 'lucide-react';
import type { CatalogEntry } from '@/lib/catalog';
import { useHomeSearch } from './search-state';
import { ringOf } from './orbit-map';

const ecosystemName: Record<string, string> = {
  npm: 'npm package',
  composer: 'Composer package',
  pypi: 'PyPI package',
  go: 'Go module',
  cargo: 'Cargo crate',
  other: 'Package',
  project: 'Project',
};

function Versions({ entry }: { entry: CatalogEntry }) {
  return (
    <div className="versions">
      {entry.latest ? (
        <span className="tag">v{entry.latest.version}</span>
      ) : entry.next ? (
        <span className="tag">unreleased</span>
      ) : (
        <span className="tag">{entry.kind}</span>
      )}
      {entry.next && <span className="tag next">next {entry.next.version}</span>}
    </div>
  );
}

export function Catalogue() {
  const { entries, active, matches, clear } = useHomeSearch();
  const shown = entries.filter(matches);
  const count = active
    ? `${shown.length} of ${entries.length} match`
    : `${entries.length} ${entries.length === 1 ? 'package or project' : 'packages and projects'}`;

  return (
    <>
      <div className="section-head">
        <h2 id="browse-heading">Browse everything</h2>
        {entries.length > 0 && (
          <div className="count" aria-live="polite">
            <span>{count}</span>
            {active && (
              <button type="button" onClick={clear}>
                Clear search
              </button>
            )}
          </div>
        )}
      </div>
      <div className="catalogue">
        {entries.length === 0 && <p className="catalogue-empty">No packages or projects yet.</p>}
        {entries.length > 0 && shown.length === 0 && (
          <p className="catalogue-empty">Nothing matches. Clear the search to see everything.</p>
        )}
        {shown.map((entry) => (
          <div key={entry.slug} className="item">
            <span className={`dot dot-${ringOf(entry)}`} aria-hidden />
            <div>
              <h3>
                <Link href={entry.url}>{entry.title}</Link>
                <span className="sr-only">, {ecosystemName[ringOf(entry)]}</span>
              </h3>
              {entry.description && <p>{entry.description}</p>}
              <div className="links">
                {entry.useUrl && (
                  <Link href={entry.useUrl}>
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
                {entry.demoUrl && (
                  <Link href={entry.demoUrl}>
                    <Play aria-hidden />
                    Demo
                  </Link>
                )}
              </div>
            </div>
            <Versions entry={entry} />
          </div>
        ))}
      </div>
    </>
  );
}
