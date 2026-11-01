import type { Channel } from '@/lib/catalog-schema';
import type { Ring } from '@/lib/rings';
import { cn } from '@/lib/cn';

/**
 * The marks every page shares (ADR-0017 decision 1): a solid planet is a package, a ringed
 * planet a project, and each version line a moon — full for the latest release, a crescent for
 * an older one, a dashed new moon for `dev`.
 */

export const ringColor = (ring: Ring) => `var(--home-${ring})`;

const round = (value: number) => Math.round(value * 10) / 10;

export function MoonPhase({ channel, className }: { channel: Channel; className?: string }) {
  return (
    <svg viewBox="-8 -8 16 16" className={cn('moon-phase', className)} aria-hidden>
      {channel === 'latest' && <circle r="6" fill="var(--home-accent)" />}
      {channel === 'legacy' && (
        <>
          <circle r="6" fill="var(--home-night)" stroke="var(--home-line-2)" />
          <path d="M0-6a6 6 0 0 1 0 12a2.7 6 0 0 0 0-12Z" fill="var(--home-muted)" />
        </>
      )}
      {channel === 'dev' && (
        <circle r="6" fill="var(--home-bg)" stroke="var(--home-muted)" strokeWidth="1.2" strokeDasharray="2 1.6" />
      )}
    </svg>
  );
}

export function PlanetMark({
  ring,
  kind,
  className,
}: {
  ring: Ring;
  kind: 'package' | 'project';
  className?: string;
}) {
  const color = ringColor(ring);
  return (
    <svg viewBox="-12 -12 24 24" className={cn('planet-mark', className)} aria-hidden>
      {kind === 'project' ? (
        <>
          <ellipse rx="11" ry="3.4" transform="rotate(-18)" fill="none" stroke={color} strokeWidth="1.4" />
          <circle r="5.4" fill="var(--home-bg)" stroke={color} strokeWidth="1.8" />
        </>
      ) : (
        <>
          <circle r="6.4" fill={color} />
          <path d="M0-6.4a6.4 6.4 0 0 0 0 12.8a2.9 6.4 0 0 1 0-12.8Z" fill="#000" opacity="0.24" />
        </>
      )}
    </svg>
  );
}

export interface SystemLine {
  segment: string;
  name: string;
  channel: Channel;
}

/**
 * A planet with one tilted orbit per version line and its moon on it, each labelled with the
 * line's name. Positions are computed here, so the drawing is the same on the server and in
 * every browser.
 */
export function PlanetSystem({
  ring,
  kind,
  lines,
  width,
  height,
  scale = 1,
  className,
}: {
  ring: Ring;
  kind: 'package' | 'project';
  lines: SystemLine[];
  width: number;
  height: number;
  scale?: number;
  className?: string;
}) {
  const color = ringColor(ring);
  const cx = width / 2;
  const cy = height * 0.54;
  const tilt = (-12 * Math.PI) / 180;
  const shown = lines.slice(0, 5);
  const radius = (kind === 'project' ? 15 : 17) * scale;

  const orbits = shown.map((line, index) => {
    const rx = (44 + index * 20) * scale;
    const ry = rx * 0.34;
    const angle = -0.7 + (index * Math.PI * 2) / Math.max(shown.length, 1) + index * 0.35;
    const px = Math.cos(angle) * rx;
    const py = Math.sin(angle) * ry;
    const mx = cx + px * Math.cos(tilt) - py * Math.sin(tilt);
    const my = cy + px * Math.sin(tilt) + py * Math.cos(tilt);
    const moon = 4.2 * scale;
    const toLeft = mx > width - 46 * scale;
    return { line, rx: round(rx), ry: round(ry), mx: round(mx), my: round(my), moon: round(moon), toLeft };
  });

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="xMidYMid meet"
      className={cn('planet-system', className)}
      aria-hidden
    >
      {orbits.map(({ line, rx, ry }) => (
        <ellipse
          key={`orbit-${line.segment}`}
          cx={cx}
          cy={round(cy)}
          rx={rx}
          ry={ry}
          transform={`rotate(-12 ${cx} ${round(cy)})`}
          fill="none"
          stroke={line.channel === 'dev' ? 'var(--home-muted)' : 'var(--home-line-2)'}
          strokeDasharray={line.channel === 'dev' ? '3 4' : undefined}
        />
      ))}
      {kind === 'project' ? (
        <g>
          <ellipse
            cx={cx}
            cy={round(cy)}
            rx={round(radius * 2)}
            ry={round(radius * 0.62)}
            transform={`rotate(-18 ${cx} ${round(cy)})`}
            fill="none"
            stroke={color}
            strokeWidth="1.6"
          />
          <circle cx={cx} cy={round(cy)} r={round(radius)} fill="var(--home-bg-2)" stroke={color} strokeWidth="2" />
        </g>
      ) : (
        <g>
          <circle cx={cx} cy={round(cy)} r={round(radius)} fill={color} />
          <path
            d={`M${cx} ${round(cy - radius)}a${round(radius)} ${round(radius)} 0 0 0 0 ${round(radius * 2)}a${round(radius * 0.45)} ${round(radius)} 0 0 1 0-${round(radius * 2)}Z`}
            fill="#000"
            opacity="0.22"
          />
        </g>
      )}
      <g className="planet-moons">
        {orbits.map(({ line, mx, my, moon, toLeft }) => (
          <g key={`moon-${line.segment}`}>
            {line.channel === 'latest' && <circle cx={mx} cy={my} r={moon} fill="var(--home-accent)" />}
            {line.channel === 'legacy' && <circle cx={mx} cy={my} r={moon} fill="var(--home-muted)" opacity="0.7" />}
            {line.channel === 'dev' && (
              <circle
                cx={mx}
                cy={my}
                r={moon}
                fill="var(--home-bg-2)"
                stroke="var(--home-muted)"
                strokeWidth="1.2"
                strokeDasharray="2 1.6"
              />
            )}
            <text
              x={round(toLeft ? mx - moon - 5 : mx + moon + 5)}
              y={round(my + 3.6 * scale)}
              textAnchor={toLeft ? 'end' : 'start'}
              fontSize={round(10.5 * scale)}
              className="planet-label"
            >
              {line.name}
            </text>
          </g>
        ))}
      </g>
    </svg>
  );
}
