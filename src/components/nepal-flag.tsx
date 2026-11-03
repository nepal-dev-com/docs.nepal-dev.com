import { flagCloth, flagMoon, flagMoonDisc, flagSunCentre, twelveRays } from '@/lib/flag';

/** A flag's colours are not the theme's: it reads the same on every page (ADR-0036 decision 7). */
export const flagColors = { red: '#D2193B', blue: '#1F468D', white: '#F9FBFB' } as const;

const { cx, cy, inner, outer } = flagSunCentre;

/** The cloth alone, its top left corner at the pole. `plain` leaves out the emblems, for 16px. */
export function NepalFlagCloth({ plain = false }: { plain?: boolean }) {
  return (
    <>
      <path d={flagCloth} fill={flagColors.red} stroke={flagColors.blue} strokeWidth="2" strokeLinejoin="round" />
      {!plain && (
        <>
          <path d={flagMoon} fill={flagColors.white} />
          <path d={flagMoonDisc} fill={flagColors.white} />
          <path d={twelveRays(cx, cy, inner, outer)} fill={flagColors.white} />
        </>
      )}
    </>
  );
}
