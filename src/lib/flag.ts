/**
 * Nepal's flag as this site draws it, by hand over the outline of the logo's flag: the logo's own is
 * auto-traced, far too heavy for every page's HTML (ADR-0036 decision 7). The cloth flies from the pole at
 * x=0, and its edges carry the logo's wave.
 */
export const flagSize = { width: 34, height: 39 } as const;

export const flagCloth =
  'M0 0 C3.88 0.97 8.54 2.52 12.42 5.04 C15.52 7.18 17.85 9.89 20.95 11.83 C24.83 14.16 29.1 15.71 33.56 16.68 C31.04 18.24 26.77 19.21 22.5 19.21 C19.01 19.21 15.91 18.24 12.8 17.46 C15.91 21.53 19.4 26.58 23.28 30.26 C26.38 33.17 29.88 35.5 32.98 37.44 C29.88 38.61 25.61 38.99 21.73 38.41 C17.85 37.64 13.58 35.5 9.31 35.31 C5.82 35.11 2.72 35.7 0 36.67 Z';

/** The fold across each pennant, as the logo shades it: a soft band, and a deeper one inside it. */
export const flagFolds = [
  'M14.36 6.98 L23.28 13.39 C22.12 15.33 22.5 17.27 23.28 19.4 L14.36 18.04 C15.52 14.74 15.52 10.28 14.36 6.98 Z',
  'M14.36 19.98 L24.06 31.23 C22.89 33.56 23.28 36.28 24.25 38.8 L14.74 36.08 C15.91 30.85 15.13 25.03 14.36 19.98 Z',
] as const;
export const flagFoldsDeep = [
  'M16.68 8.54 L21.92 12.61 C21.15 14.94 21.34 17.27 21.92 19.4 L16.68 18.43 C17.46 14.94 17.85 11.45 16.68 8.54 Z',
  'M16.49 22.5 L21.92 28.91 C20.95 32.4 21.15 35.5 21.92 38.41 L16.68 36.67 C17.65 32.01 17.46 26.97 16.49 22.5 Z',
] as const;

/** The crescent in the upper pennant, horns up. */
export const flagMoon = 'M2.33 10.28 A5.35 5.35 0 0 0 13 10.28 A5.94 5.94 0 0 1 2.33 10.28 Z';

export const flagMoonCentre = { cx: 7.66, cy: 12.2, inner: 2.5, outer: 3.15 } as const;
export const flagSunCentre = { cx: 7.66, cy: 25.03, inner: 3.78, outer: 5.43 } as const;

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

/** The disc the crescent holds: eight rays show above the horns, and its foot is hidden in the crescent. */
export function eightRays(cx: number, cy: number, inner: number, outer: number): string {
  const rim = Array.from({ length: 17 }, (_, index) => {
    const radius = index % 2 === 1 ? outer : inner;
    const angle = Math.PI + (index * Math.PI) / 16;
    return `${round(cx + radius * Math.cos(angle))} ${round(cy + radius * Math.sin(angle))}`;
  });
  const footY = round(cy + inner * 0.9);
  const footX = inner * 0.7;
  return `M${rim.join(' L')} L${round(cx + footX)} ${footY} L${round(cx - footX)} ${footY} Z`;
}
