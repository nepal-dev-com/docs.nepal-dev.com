'use client';
import { useSyncExternalStore } from 'react';
import { useTheme } from 'fumadocs-ui/provider/base';

const subscribe = () => () => {};

/**
 * A small orrery: in light the sun stands in front of the planet and lights its whole face; in
 * dark it moves behind and the planet shows a crescent (ADR-0017 decision 9). The drawing
 * follows the `dark` class, which next-themes sets before paint, so only the words wait for
 * hydration.
 */
export function ThemeSwitch() {
  const { resolvedTheme, setTheme } = useTheme();
  const hydrated = useSyncExternalStore(subscribe, () => true, () => false);
  // Dark is the site's default theme, so the server renders the dark words.
  const dark = !hydrated || resolvedTheme !== 'light';
  const label = dark ? 'Switch to day side (light theme)' : 'Switch to night side (dark theme)';

  return (
    <button type="button" className="site-theme" aria-label={label} onClick={() => setTheme(dark ? 'light' : 'dark')}>
      <svg viewBox="-16 -16 32 32" aria-hidden>
        <defs>
          <mask id="site-theme-shadow" maskUnits="userSpaceOnUse" x="-10" y="-10" width="20" height="20">
            <rect x="-10" y="-10" width="20" height="20" fill="#fff" />
            <circle className="site-theme-shade" r="6.9" fill="#000" />
          </mask>
        </defs>
        <ellipse className="site-theme-orbit" rx="13" ry="5" transform="rotate(-18)" />
        <g className="site-theme-sun">
          <circle r="2.4" />
          <path d="M0-4.4v-1.4M0 4.4v1.4M-4.4 0h-1.4M4.4 0h1.4M-3.1-3.1l-1-1M3.1 3.1l1 1M-3.1 3.1l-1 1M3.1-3.1l1-1" />
        </g>
        <circle className="site-theme-night" r="6.6" />
        <circle className="site-theme-day" r="6.6" mask="url(#site-theme-shadow)" />
      </svg>
      <span className="site-theme-tip" aria-hidden>
        {dark ? 'Night side · switch to day' : 'Day side · switch to night'}
      </span>
    </button>
  );
}
