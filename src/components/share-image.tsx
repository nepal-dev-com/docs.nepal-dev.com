import type { ReactNode } from 'react';
import { VerseMark, verseMarkColors } from '@/components/verse-mark';
import type { Channel } from '@/lib/catalog-schema';
import type { Ring } from '@/lib/rings';
import { shareColors, shareImageSize, shortenDescription, skySeed, titleSize } from '@/lib/seo';
import { appName } from '@/lib/shared';
import { starField } from '@/lib/sky';

const { width, height } = shareImageSize;
const display = 'Bricolage Grotesque';
// The text column ends here, and the sky starts: stars are never behind text (ADR-0029).
const skyStart = 800;
export const textColumnEnd = skyStart - 24;

function Stars({ seed }: { seed: number }) {
  const stars = starField({ seed, count: 150, width, height, clear: 0, even: true }).filter((star) => star.x > skyStart);
  return (
    <>
      {stars.map((star, index) => (
        <circle key={index} cx={star.x} cy={star.y} r={star.r * 1.4} fill={shareColors.ink} opacity={star.o} />
      ))}
    </>
  );
}

function Glow({ cx, cy, r }: { cx: number; cy: number; r: number }) {
  return (
    <>
      <defs>
        <radialGradient id="share-glow">
          <stop offset="0" stopColor={shareColors.star} stopOpacity="0.32" />
          <stop offset="1" stopColor={shareColors.star} stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx={cx} cy={cy} r={r} fill="url(#share-glow)" />
    </>
  );
}

function Planet({ x, y, r, ring, kind }: { x: number; y: number; r: number; ring: Ring; kind: 'package' | 'project' }) {
  const color = shareColors.rings[ring];
  if (kind === 'project') {
    return (
      <g transform={`translate(${x} ${y})`}>
        <ellipse rx={r * 2} ry={r * 0.62} transform="rotate(-18)" fill="none" stroke={color} strokeWidth={r * 0.24} />
        <circle r={r} fill={shareColors.ground} stroke={color} strokeWidth={r * 0.32} />
      </g>
    );
  }
  return <circle cx={x} cy={y} r={r} fill={color} />;
}

function Scene({ children }: { children: ReactNode }) {
  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      style={{ position: 'absolute', top: 0, left: 0 }}
    >
      {children}
    </svg>
  );
}

function Frame({ scene, domain, children }: { scene: ReactNode; domain?: string; children: ReactNode }) {
  return (
    <div
      style={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        width,
        height,
        padding: 64,
        backgroundColor: shareColors.ground,
        color: shareColors.ink,
        fontFamily: 'Onest',
      }}
    >
      <Scene>{scene}</Scene>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <VerseMark colors={verseMarkColors.dark} size={52} />
        <span style={{ fontFamily: display, fontWeight: 700, fontSize: 30 }}>{appName}</span>
      </div>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          flexGrow: 1,
          width: textColumnEnd - 64,
        }}
      >
        {children}
      </div>
      <div style={{ display: 'flex', height: 34, fontSize: 26, color: shareColors.muted }}>{domain}</div>
    </div>
  );
}

function MoonMark({ channel }: { channel: Channel }) {
  return (
    <svg viewBox="-8 -8 16 16" width={26} height={26}>
      {channel === 'latest' && <circle r="6" fill={shareColors.accent} />}
      {channel === 'legacy' && (
        <>
          <circle r="6" fill={shareColors.ground} stroke={shareColors.line} />
          <path d="M0-6a6 6 0 0 1 0 12a2.7 6 0 0 0 0-12Z" fill={shareColors.muted} />
        </>
      )}
      {channel === 'dev' && (
        <circle r="6" fill={shareColors.ground} stroke={shareColors.muted} strokeWidth="1.2" strokeDasharray="2 1.6" />
      )}
    </svg>
  );
}

function PlanetMark({ ring, kind }: { ring: Ring; kind: 'package' | 'project' }) {
  return (
    <svg viewBox="-12 -12 24 24" width={40} height={40}>
      <Planet x={0} y={0} r={kind === 'project' ? 5.2 : 6.4} ring={ring} kind={kind} />
    </svg>
  );
}

export interface PageShare {
  url: string;
  title: string;
  description: string;
  domain?: string;
  entry?: {
    /** The entry's name, or what it is on its own overview, whose title already names it. */
    label: string;
    ring: Ring;
    kind: 'package' | 'project';
    track?: string;
    line?: { name: string; channel: Channel };
  };
}

/** A page's share image (ADR-0035 decision 11). */
export function PageShareImage({ url, title, description, domain, entry }: PageShare) {
  const cx = 1010;
  const cy = 318;
  const scene = (
    <>
      <Stars seed={skySeed(url)} />
      <Glow cx={cx} cy={cy} r={170} />
      <ellipse
        cx={cx}
        cy={cy}
        rx={250}
        ry={96}
        transform={`rotate(-18 ${cx} ${cy})`}
        fill="none"
        stroke={shareColors.line}
        strokeWidth={2}
      />
      <circle cx={cx} cy={cy} r={30} fill={shareColors.star} />
      {entry && <Planet x={cx - 196} y={cy + 118} r={20} ring={entry.ring} kind={entry.kind} />}
    </>
  );
  return (
    <Frame scene={scene} domain={domain}>
      {entry && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 28, fontWeight: 600, color: shareColors.muted }}>
          <PlanetMark ring={entry.ring} kind={entry.kind} />
          <span>{entry.label}</span>
          {entry.track && <span>· {entry.track}</span>}
          {entry.line && <span>·</span>}
          {entry.line && <MoonMark channel={entry.line.channel} />}
          {entry.line && <span>{entry.line.name}</span>}
        </div>
      )}
      <div
        style={{
          display: 'flex',
          marginTop: 22,
          fontFamily: display,
          fontWeight: 700,
          fontSize: titleSize(title),
          lineHeight: 1.08,
          letterSpacing: '-0.02em',
        }}
      >
        {title}
      </div>
      <div style={{ display: 'flex', marginTop: 24, fontSize: 30, lineHeight: 1.38, color: shareColors.muted }}>
        {shortenDescription(description)}
      </div>
    </Frame>
  );
}

/** The system's centre: far enough right that its outer orbit clears the text and runs off the edge. */
export const homeCentre = 1050;
const homeOrbits = { inner: 84, outer: 260 };

/** The orbits share one span, so a sixth or seventh ring packs them closer rather than reaching the text. */
export function homeOrbitRadii(count: number): number[] {
  const step = (homeOrbits.outer - homeOrbits.inner) / Math.max(1, count - 1);
  return Array.from({ length: count }, (_, index) => homeOrbits.inner + index * step);
}

export interface HomeShare {
  domain?: string;
  rings: Ring[];
  planets: { slug: string; ring: Ring; kind: 'package' | 'project' }[];
}

/** The home page's share image: the system, still (ADR-0035 decision 11). */
export function HomeShareImage({ domain, rings, planets }: HomeShare) {
  const cx = homeCentre;
  const cy = 320;
  const tilt = 0.36;
  const radii = homeOrbitRadii(rings.length);
  const scene = (
    <>
      <Stars seed={skySeed('/')} />
      <Glow cx={cx} cy={cy} r={190} />
      {rings.map((ring, index) => (
        <ellipse
          key={ring}
          cx={cx}
          cy={cy}
          rx={radii[index]}
          ry={radii[index] * tilt}
          fill="none"
          stroke={shareColors.line}
          strokeWidth={2}
        />
      ))}
      <circle cx={cx} cy={cy} r={24} fill={shareColors.star} />
      {planets.map((planet) => {
        const radius = radii[rings.indexOf(planet.ring)];
        const angle = (skySeed(planet.slug) % 628) / 100;
        return (
          <Planet
            key={planet.slug}
            x={cx + radius * Math.cos(angle)}
            y={cy + radius * tilt * Math.sin(angle)}
            r={13}
            ring={planet.ring}
            kind={planet.kind}
          />
        );
      })}
    </>
  );
  return (
    <Frame scene={scene} domain={domain}>
      <div
        style={{
          display: 'flex',
          fontFamily: display,
          fontWeight: 700,
          fontSize: 70,
          lineHeight: 1.06,
          letterSpacing: '-0.02em',
        }}
      >
        Every package and project, documented to the version.
      </div>
    </Frame>
  );
}
