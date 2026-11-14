'use client';
import Link from 'next/link';
import { zoomOut } from '@/lib/zoom';
import { usePathname } from 'next/navigation';
import type { Ring } from '@/lib/rings';
import { PlanetMark } from '@/components/planet';
import { currentSide } from '@/lib/overview-sidebar';
import { maintainerGuide, trackName, trackSegments, userGuide } from '@/lib/tracks';

export interface TrackSwitchEntry {
  slug: string;
  title: string;
  url: string;
  ring: Ring;
  kind: 'package' | 'project';
  kindLabel: string;
  userGuideUrl?: string;
  maintainerGuideUrl?: string;
}

/**
 * The top of an entry's sidebar: its planet chip, then the guide switch, two named segments with
 * no icon, so nothing there reads as the theme switch (ADR-0048 decision 5).
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
  const urls = { [userGuide]: entry.userGuideUrl, [maintainerGuide]: entry.maintainerGuideUrl };
  const available = trackSegments.filter((item) => urls[item]);

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
        <nav aria-label="Guide" className="planet-sides">
          {available.map((item) => (
            <Link key={item} href={urls[item] as string} aria-current={current === item ? 'page' : undefined}>
              {trackName(item)}
            </Link>
          ))}
        </nav>
      )}
    </div>
  );
}
