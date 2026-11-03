import { NepalFlagCloth, flagColors } from '@/components/nepal-flag';

export { flagColors };

interface BrandMarkColors {
  rock: string;
  snow: string;
  trace: string;
}

/** The rock is the only part that follows the theme. `global.css` holds the same two values. */
export const brandMarkColors = {
  tokens: { rock: 'var(--brand-rock)', snow: '#F9FBFB', trace: '#3DDBB6' },
  light: { rock: '#162B3F', snow: '#F9FBFB', trace: '#3DDBB6' },
  dark: { rock: '#3B7A9E', snow: '#F9FBFB', trace: '#3DDBB6' },
} satisfies Record<string, BrandMarkColors>;

interface BrandMarkProps {
  className?: string;
  colors?: BrandMarkColors;
  size?: number;
  small?: boolean;
}

/**
 * The site's mark (ADR-0036 decision 7): the summit and the flag, redrawn from the nepal-dev.com logo in
 * `assets/nepal-dev-logo.svg`, whose detail and wordmark don't survive at this size or on a dark ground.
 */
export function BrandMark({ className, colors = brandMarkColors.tokens, size, small = false }: BrandMarkProps) {
  return (
    <svg className={className ? `brand-mark ${className}` : 'brand-mark'} viewBox="0 0 32 32" width={size} height={size} aria-hidden>
      <rect x="14.7" y="1" width="1" height="11" rx="0.4" fill={colors.rock} />
      <g transform={small ? 'translate(15.7 1.3) scale(0.3 0.25)' : 'translate(15.7 1.3) scale(0.24)'}>
        <NepalFlagCloth plain={small} />
      </g>
      <path d="M.6 29.6 6.4 20.4 9.4 15.4 12 18 15.2 11 19.8 17 24 13.8 31.4 29.6Z" fill={colors.rock} stroke={colors.rock} strokeWidth="0.5" strokeLinejoin="round" />
      <path d="M17.1 13.5 19.8 17 25 25.2 28 29.6H24.4L18.3 20.6 16.9 18Z" fill={flagColors.red} />
      <path d="M15.2 11 18 14.7 16.9 14.3 16.3 16.7 15 15 13.8 16.9 13.4 15 12.2 16Z" fill={colors.snow} />
      <path d="M24 13.8 26 18 24.8 17.3 24 19.2 23 17.5 21.9 18.4 21.3 15.9Z" fill={colors.snow} />
      {!small && (
        <>
          <path d="M9.4 15.4 11.2 17.2 10 17 9.3 18.6 8.6 17.2 7.6 18.2Z" fill={colors.snow} />
          <path d="M5.4 27.3H9.6L13.2 23.4H16.2" fill="none" stroke={colors.trace} strokeWidth="0.8" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="16.8" cy="23.4" r="1" fill={colors.trace} />
        </>
      )}
    </svg>
  );
}
