'use client';
import Link from 'next/link';
import { zoomOut } from '@/lib/zoom';
import { usePathname } from 'next/navigation';
import type { Ring } from '@/lib/rings';
import { PlanetMark } from '@/components/planet';
import { currentSide } from '@/lib/overview-sidebar';
import { twelveRays } from '@/lib/flag';

export interface TrackSwitchEntry {
  slug: string;
  title: string;
  url: string;
  ring: Ring;
  kind: 'package' | 'project';
  kindLabel: string;
  useUrl?: string;
  maintainUrl?: string;
}

// The two sides of every planet are the flag's own sun and moon (ADR-0037 decision 13).
function Sun() {
  return (
    <svg viewBox="0 0 24 24" className="side-sun" aria-hidden>
      <path fill="currentColor" d={twelveRays(12, 12, 5.6, 10.6)} />
    </svg>
  );
}

function Moon() {
  return (
    <svg viewBox="0 0 24 24" className="side-moon" aria-hidden>
      <path fill="currentColor" d="M2.5 10.5a9.5 9.5 0 0 0 19 0a11 9.6 0 0 1-19 0Z" />
      <path fill="currentColor" d="M7.8 9.6a4.2 4.2 0 0 1 8.4 0Z" />
    </svg>
  );
}

const sides = [
  { key: 'use', label: 'Use, the day side', icon: Sun },
  { key: 'maintain', label: 'Maintain, the night side', icon: Moon },
] as const;

/**
 * The planet row at the top of a package's sidebar: its chip, then a sun for Use and a moon for
 * Maintain (ADR-0013, ADR-0018 decision 1).
 */
export function TrackSwitch({ entries, docsRoute }: { entries: TrackSwitchEntry[]; docsRoute: string }) {
  const pathname = usePathname();
  const [slug, track] = pathname.startsWith(`${docsRoute}/`)
    ? pathname.slice(docsRoute.length + 1).split('/')
    : [];
  const entry = entries.find((item) => item.slug === slug);
  if (!entry) {
    return null;
  }

  const current = currentSide(track, entry);
  const urls = { use: entry.useUrl, maintain: entry.maintainUrl };
  const available = sides.filter((item) => urls[item.key]);

  return (
    <div className="planet-banner" data-ring={entry.ring}>
      <Link href={entry.url} className="planet-chip" transitionTypes={[zoomOut]}>
        <PlanetMark ring={entry.ring} kind={entry.kind} />
        <span>
          <b>{entry.title}</b>
          <small>{entry.kindLabel}</small>
        </span>
      </Link>
      {available.length > 1 && (
        <nav aria-label="Track" className="planet-sides">
          {available.map(({ key, label, icon: Icon }) => (
            <Link
              key={key}
              href={urls[key] as string}
              aria-label={label}
              aria-current={current === key ? 'page' : undefined}
            >
              <Icon />
              <span className="planet-side-tip" aria-hidden>
                {label}
              </span>
            </Link>
          ))}
        </nav>
      )}
    </div>
  );
}
