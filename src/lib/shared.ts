import { createGetUrl } from 'fumadocs-core/source';

export const appName = 'Nepal Dev Verse';

/** The community the site belongs to: the star, the metadata and the credit (ADR-0036). */
export const community = { name: 'nepal-dev.com', url: 'https://nepal-dev.com' };
/** Who made the site, named only in the footer's credit (ADR-0036 decision 9). */
export const maker = { name: 'Puncoz Nepal', url: 'https://puncoz.com' };

/** The hero's heading, split where its emphasis starts (ADR-0036 decision 3). */
export const homeLine = {
  lead: 'Every package and project by Nepalese developers all over the world,',
  rest: 'documented to the version.',
};
// Packages and projects live at the root, `/<slug>` (ADR-0015 decision 1).
export const docsRoute = '';
export const docsImageRoute = '/og';
export const homeImageUrl = `${docsImageRoute}/image.png`;
export const docsContentRoute = '/llms.mdx';

// The owner's choice, ADR-0014.
export const gitConfig = {
  user: 'puncoz-official',
  repo: 'docs',
  branch: 'main',
};

const getContentUrl = createGetUrl(docsContentRoute);

export function getPageMarkdownUrl(page: { slugs: string[]; locale?: string }) {
  const segments = [...page.slugs, 'content.md'];

  return { segments, url: getContentUrl(segments, page.locale) };
}

const getImageUrl = createGetUrl(docsImageRoute);

export function getPageImageUrl(page: { slugs: string[]; locale?: string }) {
  const segments = [...page.slugs, 'image.png'];

  return { segments, url: getImageUrl(segments, page.locale) };
}
