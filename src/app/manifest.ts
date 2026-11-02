import type { MetadataRoute } from 'next';
import { shareColors } from '@/lib/seo';
import { appName } from '@/lib/shared';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: appName,
    short_name: appName,
    description: 'Every package and project, documented to the version.',
    start_url: '/',
    display: 'browser',
    background_color: shareColors.ground,
    theme_color: shareColors.ground,
    icons: [
      { src: '/icon.svg', type: 'image/svg+xml', sizes: 'any' },
      { src: '/apple-icon', type: 'image/png', sizes: '180x180' },
    ],
  };
}
