import type { CSSProperties, ReactNode } from 'react';
import Link from 'next/link';
import type { CatalogEntry } from '@/lib/catalog';
import { ringOf } from '@/lib/rings';
import { owner } from '@/lib/shared';
import { PlanetMark } from '@/components/planet';
import { BackToTop, FooterSearch, VerseLink } from '@/components/footer-actions';
import { HorizonAwake } from '@/components/horizon-awake';
import {
  cloudBands,
  cloudPeriod,
  horizonStars,
  observatory,
  planet,
  ridgeY,
  sceneHeight,
  sceneWidth,
  starDisc,
} from '@/lib/horizon-sky';

const view = `0 0 ${sceneWidth} ${sceneHeight}`;
const stars = horizonStars();
const clouds = cloudBands();
const site = observatory();

// Two ribbons that rise off the rim, swelling in the middle and fading at both ends.
function auroraPath(from: number, to: number, height: (x: number) => number) {
  const top: string[] = [];
  const bottom: string[] = [];
  for (let x = from; x <= to; x += 20) {
    const fade = Math.sin((Math.PI * (x - from)) / (to - from));
    top.push(`${x},${(ridgeY(x) - height(x) * fade).toFixed(1)}`);
    bottom.unshift(`${x},${(ridgeY(x) + 4).toFixed(1)}`);
  }
  return `M${top.join(' L')} L${bottom.join(' L')} Z`;
}

const auroras = [
  auroraPath(180, 760, (x) => 34 + 18 * Math.sin(x / 80)),
  auroraPath(520, 1040, (x) => 26 + 14 * Math.sin(x / 64 + 1)),
];

// Each layer is its own SVG on the same viewBox, so a looping layer moves alone and the blurs
// are never redrawn (ADR-0030 decision 3).
function Layer({ className, children }: { className: string; children: ReactNode }) {
  return (
    <svg className={className} viewBox={view} preserveAspectRatio="xMidYMax slice">
      {children}
    </svg>
  );
}

function ShootingStar({ id, cycle, delay }: { id: string; cycle: number; delay: number }) {
  return (
    <svg
      className={`horizon-shooting h-loop horizon-shooting-${id}`}
      style={{ '--cycle': `${cycle}s`, '--delay': `${delay}s` } as CSSProperties}
      viewBox="0 0 160 60"
    >
      <defs>
        {/* It falls down and to the left, so the head is the lower-left end and the tail trails behind. */}
        <linearGradient id={`horizon-tail-${id}`} x1="150" y1="6" x2="10" y2="52" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="var(--home-ink)" stopOpacity="0" />
          <stop offset="1" stopColor="var(--home-ink)" stopOpacity="0.9" />
        </linearGradient>
      </defs>
      <line x1="10" y1="52" x2="150" y2="6" stroke={`url(#horizon-tail-${id})`} strokeWidth="1.4" strokeLinecap="round" />
      <circle cx="10" cy="52" r="1.6" fill="var(--home-ink)" />
    </svg>
  );
}

/** The scene: a dusk sky over the planet's curved edge (ADR-0030 decision 2). */
export function HorizonScene() {
  return (
    <div className="horizon-scene" aria-hidden>
      <Layer className="horizon-stars">
        {stars.map((star, index) => (
          <circle
            key={index}
            className={star.twinkle ? 'horizon-twinkle h-loop' : undefined}
            data-star=""
            cx={star.x}
            cy={star.y}
            r={star.r}
            opacity={star.o}
            style={
              star.twinkle
                ? ({ '--twinkle': `${star.twinkle.duration}s`, '--delay': `${star.twinkle.delay}s` } as CSSProperties)
                : undefined
            }
          />
        ))}
      </Layer>
      <Layer className="horizon-aurora h-loop">
        <defs>
          <linearGradient id="horizon-aurora-fill" x1="0" y1="140" x2="0" y2="232" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="var(--home-accent)" stopOpacity="0" />
            <stop offset="0.7" stopColor="var(--home-accent)" stopOpacity="0.55" />
            <stop offset="1" stopColor="var(--home-accent)" stopOpacity="0.8" />
          </linearGradient>
          <filter id="horizon-aurora-blur" x="-10%" y="-40%" width="120%" height="180%">
            <feGaussianBlur stdDeviation="7" />
          </filter>
        </defs>
        <g fill="url(#horizon-aurora-fill)" filter="url(#horizon-aurora-blur)">
          {auroras.map((d) => (
            <path key={d} d={d} />
          ))}
        </g>
      </Layer>
      <ShootingStar id="a" cycle={14} delay={-4} />
      <ShootingStar id="b" cycle={23} delay={-15} />
      <Layer className="horizon-sun">
        <defs>
          <radialGradient id="horizon-glow" cx="50%" cy="100%" r="60%">
            <stop offset="0" stopColor="var(--home-star)" stopOpacity="0.55" />
            <stop offset="0.35" stopColor="var(--home-star)" stopOpacity="0.14" />
            <stop offset="1" stopColor="var(--home-star)" stopOpacity="0" />
          </radialGradient>
        </defs>
        <g className="horizon-rise">
          <ellipse className="horizon-glow" cx="600" cy="230" rx="520" ry="200" fill="url(#horizon-glow)" />
          <circle cx={starDisc.cx} cy={starDisc.cy} r={starDisc.r} fill="var(--home-star)" />
        </g>
      </Layer>
      <div className="horizon-clouds">
        {clouds.map((band, index) => (
          <svg
            key={index}
            className="horizon-cloud-band h-loop"
            style={{ '--drift': `${band.duration}s` } as CSSProperties}
            viewBox={`0 0 ${cloudPeriod * 2} ${sceneHeight}`}
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id={`horizon-cloud-${index}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="var(--cloud-top)" stopOpacity="0.35" />
                <stop offset="0.5" stopColor="var(--cloud-top)" stopOpacity="0.5" />
                <stop offset="1" stopColor="var(--cloud-under)" stopOpacity="0.6" />
              </linearGradient>
              <filter id={`horizon-cloud-soft-${index}`} x="-20%" y="-60%" width="140%" height="220%">
                <feGaussianBlur stdDeviation="2.4" />
              </filter>
            </defs>
            <g fill={`url(#horizon-cloud-${index})`} filter={`url(#horizon-cloud-soft-${index})`}>
              {band.puffs.map((puff, item) => (
                <ellipse key={item} cx={puff.cx} cy={puff.cy} rx={puff.rx} ry={puff.ry} />
              ))}
            </g>
          </svg>
        ))}
      </div>
      <Layer className="horizon-ground">
        <defs>
          <linearGradient id="horizon-ground-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="var(--home-panel)" />
            <stop offset="0.12" stopColor="var(--home-bg-2)" />
          </linearGradient>
        </defs>
        <circle cx={planet.cx} cy={planet.cy} r={planet.r} fill="url(#horizon-ground-fill)" />
        <circle cx={planet.cx} cy={planet.cy} r={planet.r} fill="none" stroke="var(--home-accent)" strokeWidth="1.2" opacity="0.8" />
        <g className="horizon-observatory" transform={`translate(${site.x} ${site.y.toFixed(2)}) rotate(${site.angle})`}>
          <rect x="-14" y="-13" width="28" height="17" />
          <rect x="13" y="-6" width="10" height="10" />
          <path d="M-13 -13 A13 13 0 0 1 13 -13 Z" />
          <line className="horizon-scope" x1="0" y1="-15" x2="13" y2="-30" />
          <rect className="horizon-slit" x="-1.6" y="-26" width="3.2" height="12" transform="rotate(38 0 -13)" />
          <path className="horizon-dome-lit" d="M0 -26 A13 13 0 0 1 13 -13" />
          <rect className="horizon-window" x="-9" y="-8" width="3" height="3.5" />
        </g>
      </Layer>
      <Layer className="horizon-rim-glow h-loop">
        <defs>
          <filter id="horizon-rim" x="-10%" y="-50%" width="120%" height="200%">
            <feGaussianBlur stdDeviation="3" />
          </filter>
        </defs>
        <circle
          cx={planet.cx}
          cy={planet.cy}
          r={planet.r}
          fill="none"
          stroke="var(--home-accent)"
          strokeWidth="6"
          opacity="0.45"
          filter="url(#horizon-rim)"
        />
      </Layer>
    </div>
  );
}

/** The Horizon footer, the same on every page (ADR-0017 decision 8, ADR-0018 decision 4, ADR-0030). */
/** The footer's closing line, a sentence to a line (ADR-0033). */
export function HorizonClosing() {
  return (
    <p className="horizon-closing">
      <span>You&apos;ve reached the horizon.</span>{' '}
      <span>
        <VerseLink>The Verse</VerseLink> goes on.
      </span>
    </p>
  );
}

export function HorizonCredit() {
  return (
    <small>
      Packages and projects by{' '}
      <a href={owner.url} rel="noreferrer noopener">
        {owner.name}
      </a>
    </small>
  );
}

export function HorizonFooter({
  entries,
  githubUrl,
  backLabel = 'Back to orbit',
}: {
  entries: CatalogEntry[];
  githubUrl: string;
  backLabel?: string;
}) {
  return (
    <footer className="horizon">
      <HorizonAwake />
      <HorizonClosing />
      <HorizonScene />
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
          <BackToTop label={backLabel} />
        </nav>
        <HorizonCredit />
      </div>
    </footer>
  );
}
