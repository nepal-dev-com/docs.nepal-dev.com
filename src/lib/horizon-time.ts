/**
 * The Horizon's hour (ADR-0040): where the sun and the moon stand, how the scene is lit and how much of the
 * moon shows, all from a `Date`. It runs in the browser, because a prerendered page can't know the reader's
 * hour, and imports nothing so that little reaches the client.
 */
export type Body = 'sun' | 'moon';

/** One arc for both, wide enough to keep each whole on a 320px screen (ADR-0037 decision 11). */
export const skyArc = {
  left: { x: 400, y: 150 },
  top: { x: 600, y: 44 },
  right: { x: 800, y: 150 },
} as const;

export const moonDisc = 20;
export const bodyRadius: Record<Body, number> = { sun: 24, moon: moonDisc };

/** The glow's ellipse, centred this far below the body. Its size at each hour keeps its top inside the scene. */
export const bodyGlow = { below: 22, rx: 460, ry: 150 } as const;

/** A waxing crescent, for a page with no script to read the date. */
export const fallbackMoonAge = 0.1;

const minutesPerDay = 1440;
const crossing = 720;
const crossingStart: Record<Body, number> = { sun: 360, moon: 1080 };
const restingBright: Record<Body, number> = { sun: 0.72, moon: 0.45 };

const round = (value: number) => Math.round(value * 1000) / 1000;
const clamp = (value: number) => Math.min(1, Math.max(0, value));

export const minuteOfDay = (date: Date) => date.getHours() * 60 + date.getMinutes();

const minutesSinceStart = (body: Body, minute: number) =>
  (minute - crossingStart[body] + minutesPerDay) % minutesPerDay;

export interface BodyPlace {
  x: number;
  y: number;
  /** How far across the arc, 0 to 1, or null while it rests. */
  progress: number | null;
}

export function bodyPlace(body: Body, minute: number): BodyPlace {
  const since = minutesSinceStart(body, minute);
  if (since <= crossing) {
    const progress = since / crossing;
    const { left, top, right } = skyArc;
    return {
      x: round(left.x + (right.x - left.x) * progress),
      y: round(left.y - (left.y - top.y) * Math.sin(Math.PI * progress)),
      progress,
    };
  }
  // It sets on the right and rises on the left, so it crosses behind the world halfway through its rest.
  const { x, y } = since < crossing + crossing / 2 ? skyArc.right : skyArc.left;
  return { x, y, progress: null };
}

// How awake it is: climbing to full over a crossing's first hour, settling over the first hour of its rest.
function awakeness(body: Body, minute: number): number {
  const since = minutesSinceStart(body, minute);
  return since <= crossing ? clamp(since / 60) : clamp(1 - (since - crossing) / 60);
}

export function brightness(body: Body, minute: number): number {
  const rest = restingBright[body];
  return round(rest + (1 - rest) * awakeness(body, minute));
}

export function glowSize(body: Body, minute: number): number {
  const { y } = bodyPlace(body, minute);
  const fits = Math.min(1, (y + bodyGlow.below) / bodyGlow.ry);
  return Math.floor((0.6 + 0.4 * awakeness(body, minute)) * fits * 1000) / 1000;
}

export interface DayParts {
  dawn: number;
  day: number;
  dusk: number;
  night: number;
}

const rising = (minute: number, centre: number) => clamp((minute - (centre - 30)) / 60);

/** Fixed hours, the same in every season and place, because no location is known (ADR-0040 decision 7). */
export function dayParts(minute: number): DayParts {
  const [dawnStarts, dayStarts, duskStarts, nightStarts] = [300, 420, 1020, 1140].map((centre) => rising(minute, centre));
  const dawn = dawnStarts * (1 - dayStarts);
  const day = dayStarts * (1 - duskStarts);
  const dusk = duskStarts * (1 - nightStarts);
  return { dawn: round(dawn), day: round(day), dusk: round(dusk), night: round(1 - dawn - day - dusk) };
}

const redFloor = 0.2;
const moonRedCeiling = 0.55;

/** Strongest with the light low on the faces' own side, and never gone, so the logo's mountain stays itself. */
export function redStrength(body: Body, minute: number): number {
  const ceiling = body === 'sun' ? 1 : moonRedCeiling;
  const since = minutesSinceStart(body, minute);
  if (since <= crossing) {
    return round(Math.max(redFloor, (redFloor + (1 - redFloor) * (since / crossing)) * ceiling));
  }
  return round(redFloor + (ceiling - redFloor) * clamp(1 - (since - crossing) / 60));
}

export const synodicMonth = 29.530588853;
// A mean new moon (Meeus), not a true one: a true one is itself up to about half a day off the mean month.
const meanNewMoon = Date.UTC(2000, 0, 6, 14, 20);
const millisecondsPerDay = 86400000;

/** The moon's age as a share of its month, 0 new and 0.5 full. From the mean month, so about half a day out at worst. */
export function moonAge(date: Date): number {
  const months = (date.getTime() - meanNewMoon) / millisecondsPerDay / synodicMonth;
  return months - Math.floor(months);
}

/** The lit share of the disc, 0 at new and 1 at full. */
export const moonLit = (age: number) => round((1 - Math.cos(2 * Math.PI * age)) / 2);

/** The dark part of a disc at the origin, as seen from the Himalaya: waxing is lit on the right. */
export function moonShadePath(age: number, radius: number): string {
  const waxing = age < 0.5;
  const lean = Math.cos(2 * Math.PI * age);
  const reach = round(Math.abs(lean) * radius);
  const limbSweep = waxing ? 0 : 1;
  const edgeSweep = waxing === lean >= 0 ? 0 : 1;
  return `M0 ${-radius} A${radius} ${radius} 0 0 ${limbSweep} 0 ${radius} A${reach} ${radius} 0 0 ${edgeSweep} 0 ${-radius} Z`;
}

/** A minute's move is under a unit, so only a rest's change of side, or hours away in a hidden tab, passes this. */
const jump = 100;

export function crossedBodies(from: Record<string, string>, to: Record<string, string>): Body[] {
  return (['sun', 'moon'] as const).filter(
    (body) => Math.abs(parseFloat(from[`--${body}-x`]) - parseFloat(to[`--${body}-x`])) > jump,
  );
}

/** What `HorizonAwake` sets on the footer. The theme picks a body in CSS, so both are always given. */
export function horizonVars(date: Date): Record<string, string> {
  const minute = minuteOfDay(date);
  const [sun, moon] = [bodyPlace('sun', minute), bodyPlace('moon', minute)];
  const { dawn, day, dusk, night } = dayParts(minute);
  const values: Record<string, string | number> = {
    '--sun-x': `${sun.x}px`,
    '--sun-y': `${sun.y}px`,
    '--moon-x': `${moon.x}px`,
    '--moon-y': `${moon.y}px`,
    '--sun-bright': brightness('sun', minute),
    '--moon-bright': brightness('moon', minute),
    '--sun-glow-size': glowSize('sun', minute),
    '--moon-glow-size': glowSize('moon', minute),
    '--moon-lit': moonLit(moonAge(date)),
    '--sun-high': sun.progress === null ? 0 : round(Math.sin(Math.PI * sun.progress)),
    '--red-sun': redStrength('sun', minute),
    '--red-moon': redStrength('moon', minute),
    '--dawn': dawn,
    '--day': day,
    '--dusk': dusk,
    '--night': night,
    '--warm': round(dawn + dusk),
    '--cool': night,
  };
  return Object.fromEntries(Object.entries(values).map(([name, value]) => [name, String(value)]));
}
