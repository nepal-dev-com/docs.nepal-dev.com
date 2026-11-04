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
import { flagSize, flagWaveStrips } from '@/lib/flag';
import { moonShadePath } from '@/lib/horizon-time';
import {
  alpenglow,
  bodyGlow,
  cloudBands,
  cloudPeriod,
  fallbackMoonAge,
  farRange,
  flagPole,
  flagScale,
  flagTop,
  horizonStars,
  lightSpots,
  lightsFor,
  midRange,
  moonDisc,
  nearRange,
  observatory,
  planet,
  polygonPath,
  rangePath,
  sceneHeight,
  sceneWidth,
  snow,
  snowShade,
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

const strips = flagWaveStrips();

// One cloth, seen through a row of moving slits. Each slit runs a hair into the next, so no seam shows.
function WavingCloth() {
  return (
    <>
      <defs>
        <g id="horizon-cloth">
          <NepalFlagCloth />
        </g>
        {strips.map((strip, index) => (
          <clipPath key={index} id={`horizon-strip-${index}`}>
            <rect x={strip.x} y="-4" width={strip.width + 0.2} height={flagSize.height + 8} />
          </clipPath>
        ))}
      </defs>
      {strips.map((strip, index) => (
        <g
          key={index}
          className="horizon-flag-lift h-loop"
          style={{ '--lift': `${strip.lift}px`, '--lift-at': `${strip.liftAt}s` } as CSSProperties}
        >
          <g
            className="horizon-flag-tilt h-loop"
            style={{ '--tilt': `${strip.tilt}deg`, '--tilt-at': `${strip.tiltAt}s`, transformOrigin: `${strip.x}px 0` } as CSSProperties}
          >
            <use href="#horizon-cloth" clipPath={`url(#horizon-strip-${index})`} />
          </g>
        </g>
      ))}
    </>
  );
}

const skyParts = ['dawn', 'day', 'dusk', 'night'] as const;

// The moon's seas, on a disc of radius 20. Soft by being faint, never by a blur (ADR-0040 decision 6).
const seas = [
  [-7, -8, 6, 5],
  [3, -10, 4.5, 3.5],
  [-9, 2, 5, 6],
  [5, 0, 6, 4.5],
  [1, 9, 4, 3],
  [-3, -2, 3, 2.5],
  [10, -5, 2.5, 2],
] as const;

// Place by the hour, then light by the hour, then the rise with the scroll: each its own transform (ADR-0040).
function SunAndMoon() {
  return (
    <>
      <defs>
        <radialGradient id="horizon-sun-glow">
          <stop offset="0" stopColor="var(--sun-edge)" stopOpacity="var(--sun-glow)" />
          <stop offset="0.45" stopColor="var(--sun-edge)" stopOpacity="0.16" />
          <stop offset="1" stopColor="var(--sun-edge)" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="horizon-sun-halo">
          <stop offset="0.3" stopColor="var(--sun-core)" stopOpacity="0.55" />
          <stop offset="0.55" stopColor="var(--sun-edge)" stopOpacity="0.2" />
          <stop offset="1" stopColor="var(--sun-edge)" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="horizon-sun-disc">
          <stop offset="0" stopColor="var(--sun-core)" />
          <stop offset="0.68" stopColor="var(--sun-core)" />
          <stop offset="1" stopColor="var(--sun-core)" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="horizon-moon-glow">
          <stop offset="0" stopColor="#b9c9e6" stopOpacity="0.28" />
          <stop offset="0.45" stopColor="#8fa6cf" stopOpacity="0.08" />
          <stop offset="1" stopColor="#8fa6cf" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="horizon-moon-halo">
          <stop offset="0.5" stopColor="#dbe4f2" stopOpacity="0.28" />
          <stop offset="1" stopColor="#dbe4f2" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="horizon-moon-disc" cx="0.42" cy="0.4" r="0.62">
          <stop offset="0" stopColor="#f6f6f0" />
          <stop offset="0.7" stopColor="#e3e5e2" />
          <stop offset="1" stopColor="#b6bcc6" />
        </radialGradient>
      </defs>
      <g className="horizon-body horizon-body-sun">
        <g className="horizon-body-light">
          <g className="horizon-rise">
            <g className="horizon-body-glow">
              <ellipse className="horizon-glow" cx="0" cy={bodyGlow.below} rx={bodyGlow.rx} ry={bodyGlow.ry} fill="url(#horizon-sun-glow)" />
            </g>
            <circle r="58" fill="url(#horizon-sun-halo)" />
            <circle r="29" fill="url(#horizon-sun-disc)" />
          </g>
        </g>
      </g>
      <g className="horizon-body horizon-body-moon">
        <g className="horizon-body-light">
          <g className="horizon-rise">
            <g className="horizon-body-glow">
              <ellipse className="horizon-glow" cx="0" cy={bodyGlow.below} rx={bodyGlow.rx} ry={bodyGlow.ry} fill="url(#horizon-moon-glow)" />
            </g>
            <circle className="horizon-moon-halo" r={moonDisc * 2} fill="url(#horizon-moon-halo)" />
            <circle r={moonDisc} fill="url(#horizon-moon-disc)" />
            <g className="horizon-moon-seas">
              {seas.map(([cx, cy, rx, ry]) => (
                <ellipse key={`${cx} ${cy}`} cx={cx} cy={cy} rx={rx} ry={ry} />
              ))}
            </g>
            <path className="horizon-moon-shade" d={moonShadePath(fallbackMoonAge, moonDisc)} />
          </g>
        </g>
      </g>
    </>
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

/** The scene: the range on the planet's edge, lit by the reader's hour (ADR-0030 decision 2, ADR-0037, ADR-0040). */
export function HorizonScene({ entries }: { entries: CatalogEntry[] }) {
  return (
    <div className="horizon-scene" aria-hidden>
      {skyParts.map((part) => (
        <div key={part} className="horizon-sky-part" data-part={part} />
      ))}
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
      <World className="horizon-bodies">
        <SunAndMoon />
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
        <g className="horizon-red">
          {alpenglow.map((face) => (
            <path key={polygonPath(face)} className="horizon-alpenglow" d={polygonPath(face)} />
          ))}
        </g>
        {snow.map((patch) => (
          <path key={polygonPath(patch)} className="horizon-snow" d={polygonPath(patch)} />
        ))}
        {snowShade.map((patch) => (
          <path key={polygonPath(patch)} className="horizon-snow-shade" d={polygonPath(patch)} />
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
      </World>
      <World className="horizon-flag-layer">
        <rect
          className="horizon-pole"
          x={flagPole.x - flagPole.width / 2}
          y={flagPole.top}
          width={flagPole.width}
          height={flagPole.foot - flagPole.top}
          rx={flagPole.width / 2}
        />
        <g transform={`translate(${flagPole.x + flagPole.width / 2} ${flagTop}) scale(${flagScale})`}>
          <g className="horizon-flag">
            <WavingCloth />
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
