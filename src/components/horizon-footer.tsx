import Link from 'next/link';
import type { CatalogEntry } from '@/lib/catalog';
import { ringOf } from '@/lib/rings';
import { owner } from '@/lib/shared';
import { PlanetMark } from '@/components/planet';
import { BackToTop, FooterSearch } from '@/components/footer-actions';

// Seeded, so the sky is the same on every build and needs no client code.
function stars(count: number, seed: number) {
  let state = seed;
  const next = () => (state = (state * 16807) % 2147483647) / 2147483647;
  return Array.from({ length: count }, () => ({
    x: Math.round(next() * 1200),
    y: Math.round(next() * 170),
    r: Math.round((0.4 + next()) * 100) / 100,
    o: Math.round((0.2 + next() * 0.5) * 100) / 100,
  }));
}

const sky = stars(60, 3);

function Scene() {
  return (
    <div className="horizon-scene" aria-hidden>
      <svg viewBox="0 0 1200 260" preserveAspectRatio="xMidYMax slice">
        <defs>
          <radialGradient id="horizon-glow" cx="50%" cy="100%" r="60%">
            <stop offset="0" stopColor="var(--home-star)" stopOpacity="0.55" />
            <stop offset="0.35" stopColor="var(--home-star)" stopOpacity="0.14" />
            <stop offset="1" stopColor="var(--home-star)" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="horizon-ground" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="var(--home-panel)" />
            <stop offset="0.12" stopColor="var(--home-bg-2)" />
          </linearGradient>
          <filter id="horizon-rim" x="-10%" y="-50%" width="120%" height="200%">
            <feGaussianBlur stdDeviation="3" />
          </filter>
        </defs>
        <ellipse cx="600" cy="230" rx="520" ry="200" fill="url(#horizon-glow)" />
        <circle cx="600" cy="214" r="22" fill="var(--home-star)" />
        {sky.map((star, index) => (
          <circle key={index} cx={star.x} cy={star.y} r={star.r} fill="var(--home-faint)" opacity={star.o} />
        ))}
        <circle cx="600" cy="2260" r="2040" fill="url(#horizon-ground)" />
        <circle
          cx="600"
          cy="2260"
          r="2040"
          fill="none"
          stroke="var(--home-accent)"
          strokeWidth="6"
          opacity="0.35"
          filter="url(#horizon-rim)"
        />
        <circle cx="600" cy="2260" r="2040" fill="none" stroke="var(--home-accent)" strokeWidth="1.2" opacity="0.8" />
      </svg>
    </div>
  );
}

/**
 * The Horizon footer (ADR-0017 decision 8). Docs pages leave out the closing line and the scene,
 * so reading pages stay calm.
 */
export function HorizonFooter({
  entries,
  githubUrl,
  compact = false,
}: {
  entries: CatalogEntry[];
  githubUrl: string;
  compact?: boolean;
}) {
  return (
    <footer className="horizon" data-compact={compact ? '' : undefined}>
      {!compact && (
        <>
          <p className="horizon-closing">
            Everything here orbits one maker:{' '}
            <a href={owner.url} rel="noreferrer noopener">
              {owner.name}
            </a>
            .
          </p>
          <Scene />
        </>
      )}
      <div className="horizon-surface">
        {entries.length > 0 && (
          <nav className="horizon-planets" aria-label="Packages and projects">
            {entries.map((entry) => (
              <Link key={entry.slug} href={entry.url}>
                <PlanetMark ring={ringOf(entry)} kind={entry.kind} />
                {entry.title}
              </Link>
            ))}
          </nav>
        )}
        <nav className="horizon-links" aria-label="Footer">
          <FooterSearch />
          <a href="/llms.txt">llms.txt</a>
          <a href="/llms-full.txt">llms-full.txt</a>
          <a href={githubUrl} rel="noreferrer noopener">
            GitHub
          </a>
          <BackToTop label={compact ? 'Back to top' : 'Back to orbit'} />
        </nav>
        <small>
          Packages and projects by{' '}
          <a href={owner.url} rel="noreferrer noopener">
            {owner.name}
          </a>
        </small>
      </div>
    </footer>
  );
}
