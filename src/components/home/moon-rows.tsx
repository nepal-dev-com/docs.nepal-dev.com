import Link from 'next/link';
import type { CatalogEntry } from '@/lib/catalog';
import { MoonPhase } from '@/components/planet';

function MoonRow({ entry }: { entry: CatalogEntry }) {
  const released = entry.lines.filter((line) => line.channel !== 'dev').reverse();
  const moons = [...released, ...(entry.dev ? [entry.dev] : [])];

  return (
    <div className="moon-row">
      <h3>
        <Link href={entry.url}>{entry.title}</Link>
      </h3>
      <ol className="moon-track" aria-label={`${entry.title} version lines, oldest first`}>
        {moons.map((line) => (
          <li key={line.segment} data-channel={line.channel}>
            <Link href={line.url}>
              <MoonPhase channel={line.channel} />
              <b>{line.name}</b>
              <small>
                {line.version}
                {line.channel === 'latest' ? ' · latest' : line.channel === 'dev' ? ' · in development' : ''}
              </small>
            </Link>
          </li>
        ))}
      </ol>
    </div>
  );
}

/**
 * Every version line as a moon, oldest first, for each entry with two or more lines
 * (ADR-0017 decision 6).
 */
export function MoonRows({ entries }: { entries: CatalogEntry[] }) {
  return (
    <>
      <div className="section-head">
        <h2 id="moons-heading">Every moon, released or not</h2>
        <p>
          Each version line is a moon with its own pages. Older and unreleased moons say so on every page, and links to{' '}
          <code>latest</code> never go stale.
        </p>
      </div>
      <div className="moon-list">
        {entries.map((entry) => (
          <MoonRow key={entry.slug} entry={entry} />
        ))}
      </div>
      <div className="moon-legend" aria-hidden>
        <span>
          <MoonPhase channel="latest" />
          Full: the latest release
        </span>
        <span>
          <MoonPhase channel="legacy" />
          Crescent: an older release
        </span>
        <span>
          <MoonPhase channel="dev" />
          New moon: in development
        </span>
      </div>
    </>
  );
}
