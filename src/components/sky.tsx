import { headerSky, headerSkyHeight, pageSky, skyHeight, skyWidth, type Star } from '@/lib/sky';

function Stars({ stars }: { stars: Star[] }) {
  return stars.map((star, index) => (
    <circle
      key={index}
      cx={star.x}
      cy={star.y}
      r={star.r}
      fill={star.bright ? 'var(--home-ink)' : 'var(--home-faint)'}
      opacity={star.o}
    />
  ));
}

/**
 * The still sky behind every page (ADR-0029 decision 3). It never moves; CSS keeps it away from
 * the content column.
 */
export function Sky() {
  return (
    <div className="verse-sky" aria-hidden>
      <svg width={skyWidth} height={skyHeight} viewBox={`0 0 ${skyWidth} ${skyHeight}`}>
        <Stars stars={pageSky} />
      </svg>
    </div>
  );
}

/** The header's band of the same sky, between its links and its buttons. */
export function HeaderSky() {
  return (
    <div className="header-sky" aria-hidden>
      <svg width={skyWidth} height={headerSkyHeight} viewBox={`0 0 ${skyWidth} ${headerSkyHeight}`}>
        <Stars stars={headerSky} />
      </svg>
    </div>
  );
}
