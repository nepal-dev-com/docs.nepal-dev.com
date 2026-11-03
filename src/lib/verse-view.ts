/** The home page opened at this fragment shows the Verse view (ADR-0029 decision 5). */
export const verseFragment = '#verse';

/** The system's orbits are ellipses this much flatter than wide, as drawn on the home page. */
export const tilt = 0.36;

// About 1.2 seconds to settle, with the site's exponential ease-out feel.
const rate = 4.5;

export function easeZoom(zoom: number, target: number, delta: number, reduce: boolean): number {
  if (reduce) {
    return target;
  }
  const next = zoom + (target - zoom) * (1 - Math.exp(-delta * rate));
  return Math.abs(target - next) < 0.001 ? target : next;
}

export function systemScale(zoom: number): number {
  return 1 - 0.6 * zoom;
}

interface FarPlanetsArea {
  cx: number;
  cy: number;
  /** How far from the star the far planets sit, before they are pulled in to fit. */
  reach: number;
  width: number;
  height: number;
}

// Up-right, right and below the star, so they never reach the hero's text on the left.
const angles = [-0.95, 0.3, 1.6];
// Room for a label to the right of each planet.
const labelRoom = 88;

/** Where the private planets sit beyond the belt: dim, far, and always on the canvas. */
export function farPlanets(names: string[], { cx, cy, reach, width, height }: FarPlanetsArea) {
  return names.slice(0, angles.length).map((name, index) => {
    const angle = angles[index];
    const cos = Math.cos(angle);
    const room = cos > 0 ? (width - labelRoom - cx) / cos : (cx - 8) / -cos;
    const radius = Math.max(0, Math.min(reach, room));
    const y = cy + Math.sin(angle) * radius * tilt;
    return { name, x: cx + cos * radius, y: Math.min(height - 12, Math.max(12, y)) };
  });
}
