import { source } from '@/lib/source';
import { DocsLayout } from 'fumadocs-ui/layouts/docs';
import { baseOptions } from '@/lib/layout.shared';
import { getCatalog } from '@/lib/catalog';
import { docsRoute } from '@/lib/shared';
import { TrackSwitch } from '@/components/docs/track-switch';

export default function Layout({ children }: LayoutProps<'/docs'>) {
  const entries = getCatalog().map(({ slug, title, url, useUrl, maintainUrl }) => ({
    slug,
    title,
    url,
    useUrl,
    maintainUrl,
  }));

  return (
    <DocsLayout
      tree={source.getPageTree()}
      {...baseOptions()}
      // Only version lines get a switcher; the home page replaces the site-wide one (ADR-0013).
      tabs={{ transform: (tab, node) => (node.root === 'line' ? tab : null) }}
      sidebar={{ banner: <TrackSwitch entries={entries} docsRoute={docsRoute} /> }}
    >
      {children}
    </DocsLayout>
  );
}
