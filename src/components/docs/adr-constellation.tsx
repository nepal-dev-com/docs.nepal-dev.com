'use client';
import { createContext, use, useState, type ReactNode } from 'react';
import Link from 'next/link';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { usePathname } from 'next/navigation';
import type * as PageTree from 'fumadocs-core/page-tree';
import { MoonPhase } from '@/components/planet';
import { adrNumber, adrShortTitle, type AdrStatus } from '@/lib/adr-status';

const Statuses = createContext<Record<string, AdrStatus>>({});

/** Every ADR's status by page URL, read on the server at build time (ADR-0019 decision 8). */
export function AdrStatusProvider({ statuses, children }: { statuses: Record<string, AdrStatus>; children: ReactNode }) {
  return <Statuses value={statuses}>{children}</Statuses>;
}

const statusLabel: Record<AdrStatus, string> = {
  approved: 'Approved',
  proposed: 'Proposed',
  superseded: 'Superseded',
  rejected: 'Rejected',
  unknown: 'No status',
};

function StatusMoon({ status }: { status: AdrStatus }) {
  if (status === 'approved') {
    return <MoonPhase channel="latest" />;
  }
  if (status === 'proposed') {
    return <MoonPhase channel="dev" />;
  }
  if (status === 'superseded') {
    return <MoonPhase channel="legacy" />;
  }
  return (
    <svg viewBox="-8 -8 16 16" className="moon-phase" aria-hidden>
      <circle r="5.4" fill="none" stroke="var(--home-faint)" strokeWidth="1" opacity="0.7" />
    </svg>
  );
}

function trim(url: string) {
  return url.length > 1 ? url.replace(/\/$/, '') : url;
}

interface Moon {
  url: string;
  title: string;
  number: number;
  status: AdrStatus;
}

/**
 * An ADR folder's pages as a grid of moons, phased by status, with a readout, previous and next,
 * the register link and a legend (ADR-0019).
 */
export function AdrConstellation({ folder }: { folder: PageTree.Folder }) {
  const pathname = trim(usePathname());
  const statuses = use(Statuses);
  const [pointed, setPointed] = useState<number>();

  const moons: Moon[] = folder.children
    .filter((node): node is PageTree.Item => node.type === 'page')
    .map((page, index) => {
      const title = typeof page.name === 'string' ? page.name : String(index + 1);
      return {
        url: page.url,
        title,
        number: adrNumber(title, index + 1),
        status: statuses[trim(page.url)] ?? 'unknown',
      };
    });

  if (moons.length === 0) {
    return <p className="constellation-empty">No decisions in this constellation yet.</p>;
  }

  const current = moons.findIndex((moon) => trim(moon.url) === pathname);
  const shown = pointed ?? (current >= 0 ? current : undefined);
  const proposed = moons.filter((moon) => moon.status === 'proposed').length;
  const previous = current > 0 ? moons[current - 1] : undefined;
  const next = current >= 0 && current < moons.length - 1 ? moons[current + 1] : undefined;
  const noun = moons.length === 1 ? 'decision' : 'decisions';

  return (
    <div className="constellation">
      <ol className="constellation-grid" onPointerLeave={() => setPointed(undefined)}>
        {moons.map((moon, index) => (
          <li key={moon.url}>
            <Link
              href={moon.url}
              aria-label={`${moon.title}, ${statusLabel[moon.status]}`}
              aria-current={index === current ? 'page' : undefined}
              data-status={moon.status}
              onPointerEnter={(event) => {
                if (event.pointerType === 'mouse') {
                  setPointed(index);
                }
              }}
              onFocus={() => setPointed(index)}
              onBlur={() => setPointed(undefined)}
            >
              {index === current ? <span className="constellation-planet" /> : <StatusMoon status={moon.status} />}
            </Link>
          </li>
        ))}
      </ol>

      <p className="constellation-readout" aria-hidden>
        {shown === undefined ? (
          <span className="constellation-summary">
            {moons.length} {noun}
            {proposed > 0 && ` · ${proposed} proposed`}
          </span>
        ) : (
          <>
            <b>{moons[shown].number}</b>
            <span>{adrShortTitle(moons[shown].title)}</span>
          </>
        )}
      </p>

      {(previous || next) && (
        <nav className="constellation-steps" aria-label="Neighbouring decisions">
          {previous ? (
            <Link href={previous.url} aria-label={`Previous: ${previous.title}`}>
              <ArrowLeft aria-hidden />
              {previous.number}
            </Link>
          ) : (
            <span />
          )}
          {next && (
            <Link href={next.url} aria-label={`Next: ${next.title}`}>
              {next.number}
              <ArrowRight aria-hidden />
            </Link>
          )}
        </nav>
      )}

      {folder.index && (
        <Link href={folder.index.url} className="constellation-all">
          All {moons.length} {noun}
          <ArrowRight aria-hidden />
        </Link>
      )}

      <p className="constellation-legend" aria-hidden>
        <span>
          <MoonPhase channel="latest" />
          approved
        </span>
        <span>
          <MoonPhase channel="dev" />
          proposed
        </span>
        <span>
          <MoonPhase channel="legacy" />
          superseded
        </span>
      </p>
    </div>
  );
}
