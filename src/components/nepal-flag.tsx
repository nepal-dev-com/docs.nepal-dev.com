import {
  eightRays,
  flagCloth,
  flagFolds,
  flagFoldsDeep,
  flagMoon,
  flagMoonCentre,
  flagSunCentre,
  twelveRays,
} from '@/lib/flag';

/** A flag's colours are not the theme's: it reads the same on every page (ADR-0036 decision 7). */
export const flagColors = {
  red: '#D2193B',
  fold: '#C31938',
  foldDeep: '#A6142E',
  blue: '#1F468D',
  white: '#F9FBFB',
} as const;

const moon = flagMoonCentre;
const sun = flagSunCentre;

/** The cloth alone, its top left corner at the pole. `plain` leaves out the emblems and folds, for 16px. */
export function NepalFlagCloth({ plain = false }: { plain?: boolean }) {
  return (
    <>
      <path d={flagCloth} fill={flagColors.red} />
      {!plain && (
        <>
          {flagFolds.map((fold) => (
            <path key={fold} d={fold} fill={flagColors.fold} />
          ))}
          {flagFoldsDeep.map((fold) => (
            <path key={fold} d={fold} fill={flagColors.foldDeep} />
          ))}
        </>
      )}
      {/* The border goes on last, so it covers the ends of the folds. */}
      <path d={flagCloth} fill="none" stroke={flagColors.blue} strokeWidth="1.6" strokeLinejoin="round" />
      {!plain && (
        <>
          <path d={flagMoon} fill={flagColors.white} />
          <path d={eightRays(moon.cx, moon.cy, moon.inner, moon.outer)} fill={flagColors.white} />
          <path d={twelveRays(sun.cx, sun.cy, sun.inner, sun.outer)} fill={flagColors.white} />
        </>
      )}
    </>
  );
}
