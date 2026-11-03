import type { CSSProperties, ReactNode } from 'react';
import Link from 'next/link';
import type { CatalogEntry } from '@/lib/catalog';
import { ringOf } from '@/lib/rings';
import { community, maker } from '@/lib/shared';
import { BrandMark } from '@/components/brand-mark';
import { PlanetMark, ringColor } from '@/components/planet';
import { BackToTop, FooterSearch, VerseLink } from '@/components/footer-actions';
import { HorizonAwake } from '@/components/horizon-awake';
import { NepalFlagCloth } from '@/components/nepal-flag';
import {
  alpenglow,
  cloudBands,
  cloudPeriod,
  farRange,
  flagPole,
  horizonStars,
  lightSpots,
  lightsFor,
  midRange,
  moon,
  nearRange,
  observatory,
  planet,
  polygonPath,
  rangePath,
  sceneHeight,
  sceneWidth,
  snow,
  starDisc,
  traceFor,
  worldView,
} from '@/lib/horizon-sky';

const view = `0 0 ${sceneWidth} ${sceneHeight}`;
const world = `${worldView.x} 0 ${worldView.width} ${sceneHeight}`;
const stars = horizonStars();
const clouds = cloudBands();
const site = observatory();

// Each layer is its own SVG, so a looping layer moves alone and the blurs are never redrawn
// (ADR-0030 decision 3).
function Layer({ className, children }: { className: string; children: ReactNode }) {
  return (
    <svg className={className} viewBox={view} preserveAspectRatio="xMidYMax slice">
      {children}
    </svg>
  );
}

// Scaled by the scene's height, not its width, so the summit and flag are never cropped (ADR-0037 decision 11).
function World({ className, children }: { className: string; children: ReactNode }) {
  return (
    <svg className={`horizon-world ${className}`} viewBox={world}>
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

/** The scene: the range on the planet's edge, at dusk or at dawn (ADR-0030 decision 2, ADR-0037). */
export function HorizonScene({ entries }: { entries: CatalogEntry[] }) {
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
      <ShootingStar id="a" cycle={14} delay={-4} />
      <ShootingStar id="b" cycle={23} delay={-15} />
      <World className="horizon-sun">
        <defs>
          <radialGradient id="horizon-glow">
            <stop offset="0" stopColor="var(--home-star)" stopOpacity="var(--sun-glow)" />
            <stop offset="0.45" stopColor="var(--horizon-warm)" stopOpacity="0.16" />
            <stop offset="1" stopColor="var(--home-star)" stopOpacity="0" />
          </radialGradient>
        </defs>
        <path
          className="horizon-moon"
          d={`M${moon.cx + 8} ${moon.cy - moon.r + 1} a${moon.r} ${moon.r} 0 1 0 14 22 a12 12 0 1 1 -14 -22 Z`}
        />
        <g className="horizon-rise">
          <ellipse className="horizon-glow" cx={starDisc.cx} cy={starDisc.cy + 22} rx="460" ry="180" fill="url(#horizon-glow)" />
          <circle className="horizon-star-disc" cx={starDisc.cx} cy={starDisc.cy} r={starDisc.r} />
        </g>
      </World>
      <World className="horizon-far">
        <path d={rangePath(farRange())} />
      </World>
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
      <World className="horizon-mid">
        <path d={rangePath(midRange())} />
      </World>
      <World className="horizon-near">
        <path className="horizon-rock" d={rangePath(nearRange)} />
        {alpenglow.map((face) => (
          <path key={polygonPath(face)} className="horizon-alpenglow" d={polygonPath(face)} />
        ))}
        {snow.map((patch) => (
          <path key={polygonPath(patch)} className="horizon-snow" d={polygonPath(patch)} />
        ))}
        <g className="horizon-observatory" transform={`translate(${site.x} ${site.y.toFixed(2)}) rotate(${site.angle}) scale(0.72)`}>
          <rect x="-14" y="-13" width="28" height="17" />
          <rect x="13" y="-6" width="10" height="10" />
          <path d="M-13 -13 A13 13 0 0 1 13 -13 Z" />
          <line className="horizon-scope" x1="0" y1="-15" x2="13" y2="-30" />
          <rect className="horizon-slit" x="-1.6" y="-26" width="3.2" height="12" transform="rotate(38 0 -13)" />
          <path className="horizon-dome-lit" d="M0 -26 A13 13 0 0 1 13 -13" />
          <rect className="horizon-window" x="-9" y="-8" width="3" height="3.5" />
        </g>
        {lightsFor(entries).map(({ entry, spot }) => {
          const { x, y } = lightSpots[spot];
          return (
            <g
              key={entry.slug}
              className="horizon-light"
              data-spot={spot}
              style={{ '--light': ringColor(ringOf(entry)) } as CSSProperties}
            >
              <path className="horizon-trace" d={traceFor(lightSpots[spot])} />
              <circle className="horizon-light-halo" cx={x} cy={y} r="10" />
              <circle className="horizon-light-core" cx={x} cy={y} r="3.4" />
            </g>
          );
        })}
        <rect className="horizon-pole" x={flagPole.x - 1.2} y={flagPole.top} width="2.4" height={flagPole.foot - flagPole.top} rx="1" />
        <g transform={`translate(${flagPole.x + 1.2} ${flagPole.top + 1})`}>
          <g className="horizon-flag">
            <g className="horizon-flag-cloth h-loop">
              <NepalFlagCloth />
            </g>
          </g>
        </g>
      </World>
      <World className="horizon-ground">
        <circle cx={planet.cx} cy={planet.cy} r={planet.r} className="horizon-ground-fill" />
      </World>
    </div>
  );
}

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
    <small className="horizon-credit">
      <BrandMark />
      <span>
        Part of{' '}
        <a href={community.url} rel="noreferrer noopener">
          {community.name}
        </a>
        . Made with ❤️ by{' '}
        <a href={maker.url} rel="noreferrer noopener">
          {maker.name}
        </a>
        .
      </span>
    </small>
  );
}

/** The Horizon footer, the same on every page (ADR-0017 decision 8, ADR-0018 decision 4, ADR-0030). */
export function HorizonFooter({
  entries,
  githubUrl,
  backLabel = 'Back to orbit',
}: {
  entries: CatalogEntry[];
  githubUrl: string;
  backLabel?: string;
}) {
  const spots = new Map(lightsFor(entries).map(({ entry, spot }) => [entry.slug, spot]));
  return (
    <footer className="horizon">
      <HorizonAwake />
      <HorizonClosing />
      <HorizonScene entries={entries} />
      <div className="horizon-surface">
        {entries.length > 0 && (
          <nav className="horizon-planets" aria-label="Packages and projects">
            {entries.map((entry) => (
              <Link key={entry.slug} href={entry.url} data-spot={spots.get(entry.slug)}>
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
