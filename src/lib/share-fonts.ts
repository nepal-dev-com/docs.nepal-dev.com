import { cacheLife } from 'next/cache';

const faces = [
  { name: 'Bricolage Grotesque', family: 'Bricolage+Grotesque', weight: 700 },
  { name: 'Onest', family: 'Onest', weight: 400 },
  { name: 'Onest', family: 'Onest', weight: 600 },
] as const;

async function fetchFace(family: string, weight: number): Promise<ArrayBuffer> {
  // Google Fonts picks the format from the user agent; an old one gets the `ttf` `next/og` can read.
  const css = await fetch(`https://fonts.googleapis.com/css2?family=${family}:wght@${weight}`, {
    headers: { 'User-Agent': 'Mozilla/4.0' },
  });
  const url = /url\((https:[^)]+\.ttf)\)/.exec(await css.text())?.[1];
  if (!css.ok || !url) {
    throw new Error(`Share image font not found: ${family} ${weight}`);
  }
  const font = await fetch(url);
  if (!font.ok) {
    throw new Error(`Share image font not fetched: ${family} ${weight}`);
  }
  return font.arrayBuffer();
}

/** The site's fonts, fetched once at build; a failure fails the build (ADR-0035 decision 12). */
export async function shareFonts() {
  'use cache';
  cacheLife('max');
  return Promise.all(
    faces.map(async ({ name, family, weight }) => ({
      name,
      weight,
      style: 'normal' as const,
      data: await fetchFace(family, weight),
    })),
  );
}
