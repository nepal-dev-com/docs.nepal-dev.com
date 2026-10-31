import type { CSSProperties } from 'react';
import { DocsLayout } from 'fumadocs-ui/layouts/notebook';
import { source } from '@/lib/source';
import { getCatalog } from '@/lib/catalog';
import { appName, docsRoute, gitConfig } from '@/lib/shared';
import { TrackSwitch } from '@/components/docs/track-switch';
import { DocsHeader } from '@/components/docs/docs-header';

export default function Layout({ children }: LayoutProps<'/'>) {
  const catalog = getCatalog();
  const entries = catalog.map(({ slug, title, url, useUrl, maintainUrl }) => ({
    slug,
    title,
    url,
    useUrl,
    maintainUrl,
  }));

  return (
    <DocsLayout
      tree={source.getPageTree()}
      nav={{
        mode: 'top',
        component: (
          <DocsHeader
            appName={appName}
            githubUrl={`https://github.com/${gitConfig.user}/${gitConfig.repo}`}
            hasProjects={catalog.some((entry) => entry.kind === 'project')}
          />
        ),
      }}
      // The shared header replaces Fumadocs' own, so the layout needs its height (ADR-0015).
      containerProps={{ style: { '--fd-header-height': '60px' } as CSSProperties }}
      // Only version lines get a switcher; the home page replaces the site-wide one (ADR-0013).
      tabs={{ transform: (tab, node) => (node.root === 'line' ? tab : null) }}
      tabMode="sidebar"
      sidebar={{ banner: <TrackSwitch entries={entries} docsRoute={docsRoute} /> }}
    >
      {children}
    </DocsLayout>
  );
}
