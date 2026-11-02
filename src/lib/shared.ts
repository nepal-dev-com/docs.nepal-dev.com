import { createGetUrl } from 'fumadocs-core/source';

// A working name until the final one is chosen (ADR-0014 open question).
export const appName = 'Puncoz Verse';

export const owner = { name: 'Puncoz Nepal', url: 'https://puncoz.com' };
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
