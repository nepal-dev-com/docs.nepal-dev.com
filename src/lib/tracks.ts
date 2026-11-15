export const userGuide = 'user-guide';
export const maintainerGuide = 'maintainer-guide';

/** The two tracks of every entry, by folder and URL segment, in sidebar order (ADR-0048). */
export const trackSegments = [userGuide, maintainerGuide] as const;
export type Track = (typeof trackSegments)[number];

const names: Record<Track, string> = {
  [userGuide]: 'User guide',
  [maintainerGuide]: 'Maintainer guide',
};

export function trackOf(segment: string | undefined): Track | undefined {
  return trackSegments.find((track) => track === segment);
}

export function trackName(track: Track): string {
  return names[track];
}
