'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { Ring } from '@/lib/rings';
import { PlanetMark } from '@/components/planet';

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

function Sun() {
  return (
    <svg viewBox="0 0 24 24" className="side-sun" aria-hidden>
      <circle cx="12" cy="12" r="4.2" fill="currentColor" />
      <path
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        d="M12 2.5v2.3M12 19.2v2.3M2.5 12h2.3M19.2 12h2.3M5.3 5.3l1.6 1.6M17.1 17.1l1.6 1.6M5.3 18.7l1.6-1.6M17.1 6.9l1.6-1.6"
      />
    </svg>
  );
}

function Moon() {
  return (
    <svg viewBox="0 0 24 24" className="side-moon" aria-hidden>
      <path fill="currentColor" d="M20 14.6A8.5 8.5 0 1 1 9.4 4a7 7 0 0 0 10.6 10.6Z" />
    </svg>
  );
}

const sides = [
  { key: 'use', label: 'Use', icon: Sun },
  { key: 'maintain', label: 'Maintain', icon: Moon },
] as const;

/**
 * The planet chip and its day side (Use) | night side (Maintain) switch, at the top of a
 * package's sidebar (ADR-0013, ADR-0017 decision 10).
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

  const urls = { use: entry.useUrl, maintain: entry.maintainUrl };
  const available = sides.filter((item) => urls[item.key]);

  return (
    <div className="planet-banner">
      <Link href={entry.url} className="planet-chip">
        <PlanetMark ring={entry.ring} kind={entry.kind} />
        <span>
          <b>{entry.title}</b>
          <small>{entry.kindLabel}</small>
        </span>
      </Link>
      {available.length > 1 && (
        <nav aria-label="Track" className="planet-sides">
          {available.map(({ key, label, icon: Icon }) => (
            <Link key={key} href={urls[key] as string} aria-current={track === key ? 'page' : undefined}>
              <Icon />
              {label}
            </Link>
          ))}
        </nav>
      )}
    </div>
  );
}
