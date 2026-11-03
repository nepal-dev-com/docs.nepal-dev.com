export interface VerseMarkColors {
  orbit: string;
  star: string;
  planet: string;
  /** Behind the planet, so the orbit it sits on breaks around it. */
  ground: string;
}

export const verseMarkColors = {
  tokens: { orbit: 'currentColor', star: 'var(--home-star)', planet: 'var(--home-accent)', ground: 'var(--home-bg)' },
  dark: { orbit: '#e9ecf2', star: '#ffe2a8', planet: '#3ddbb6', ground: '#0a0c10' },
} satisfies Record<string, VerseMarkColors>;

interface VerseMarkProps {
  className?: string;
  title?: string;
  colors?: VerseMarkColors;
  size?: number;
}

/**
 * The Verse mark (ADR-0029 decision 2): the one system seen from outside, a star inside two
 * orbits with a teal planet. No ring, so it never reads as a project.
 */
export function VerseMark({ className, title, colors = verseMarkColors.tokens, size }: VerseMarkProps) {
  const label = title ? { role: 'img' } : { 'aria-hidden': true };
  return (
    <svg className={className} viewBox="-12 -12 24 24" width={size} height={size} {...label}>
      {title && <title>{title}</title>}
      <g transform="rotate(-18)" fill="none" stroke={colors.orbit} strokeWidth="1.3">
        <ellipse rx="10.8" ry="4.7" />
        <ellipse rx="6.4" ry="2.8" opacity="0.7" />
      </g>
      <circle r="2.7" fill={colors.star} />
      <circle cx="-5" cy="3.1" r="2" fill={colors.planet} stroke={colors.ground} strokeWidth="1.2" />
    </svg>
  );
}
