/**
 * Nepal's flag as this site draws it, by hand to the proportions of the flag in the logo: the logo's own
 * is auto-traced, 83 paths for one small shape (ADR-0036 decision 7). The pole stands at x=0.
 */
export const flagSize = { width: 32, height: 41 } as const;

export const flagCloth = 'M0 0 L32 20 H14 L30 41 H0 Z';

/** The crescent in the upper pennant, horns up, and the half-disc it holds. */
export const flagMoon = 'M4.2 10.6 a5.2 5.2 0 0 0 10.4 0 a6.4 5.8 0 0 1 -10.4 0 Z';
export const flagMoonDisc = 'M6.9 9.8 a2.5 2.5 0 0 1 5 0 Z';

export const flagSunCentre = { cx: 9.4, cy: 30, inner: 3.1, outer: 6.1 } as const;

const round = (value: number) => Math.round(value * 100) / 100;

/** A twelve-rayed sun, the flag's, used wherever the site draws its sun (ADR-0037 decision 13). */
export function twelveRays(cx: number, cy: number, inner: number, outer: number): string {
  const points = Array.from({ length: 24 }, (_, index) => {
    const radius = index % 2 === 0 ? outer : inner;
    const angle = (index * Math.PI) / 12 - Math.PI / 2;
    return `${round(cx + radius * Math.cos(angle))} ${round(cy + radius * Math.sin(angle))}`;
  });
  return `M${points.join(' L')} Z`;
}
