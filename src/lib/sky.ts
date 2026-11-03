export interface Star {
  x: number;
  y: number;
  r: number;
  o: number;
  bright: boolean;
}

export interface FieldOptions {
  seed: number;
  count: number;
  width: number;
  height: number;
  /** Half the width of the band around the centre that stays empty. */
  clear: number;
  /** Spread evenly instead of thickening toward the edges. */
  even?: boolean;
}

export const starSizes = [0.6, 1, 1.6] as const;

const round = (value: number, places: number) => Math.round(value * 10 ** places) / 10 ** places;

/**
 * A seeded, still star field (ADR-0029 decision 3): the same on every build, drawn on the server.
 */
export function starField({ seed, count, width, height, clear, even = false }: FieldOptions): Star[] {
  let state = seed % 2147483647 || 1;
  const next = () => (state = (state * 16807) % 2147483647) / 2147483647;
  const half = width / 2;
  return Array.from({ length: count }, () => {
    const side = next() < 0.5 ? -1 : 1;
    // The square root puts more stars at the outer edge than next to the content.
    const reach = next();
    const distance = clear + (half - clear) * (even ? reach : Math.sqrt(reach));
    const size = next();
    const r = size < 0.65 ? starSizes[0] : size < 0.92 ? starSizes[1] : starSizes[2];
    return {
      x: round(half + side * distance, 1),
      y: round(next() * height, 1),
      r,
      o: round(0.25 + next() * 0.35, 2),
      bright: r > starSizes[0] && next() < 0.5,
    };
  });
}

export const skyWidth = 2560;
export const skyHeight = 1600;
export const headerSkyHeight = 60;

/** Half the home page's column; docs pages clear a wider band in CSS. */
export const pageSky = starField({ seed: 29, count: 220, width: skyWidth, height: skyHeight, clear: 600 });

export const headerSky = starField({
  seed: 2029,
  count: 70,
  width: skyWidth,
  height: headerSkyHeight,
  clear: 0,
  even: true,
});
