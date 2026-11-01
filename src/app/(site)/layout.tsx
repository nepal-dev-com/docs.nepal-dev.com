import type { CSSProperties } from 'react';
import { DocsLayout } from 'fumadocs-ui/layouts/notebook';
import { getMeta, source } from '@/lib/source';
import { getCatalog } from '@/lib/catalog';
import { kindName, ringOf } from '@/lib/rings';
import { appName, docsRoute, gitConfig } from '@/lib/shared';
import { TrackSwitch } from '@/components/docs/track-switch';
import { DocsHeader } from '@/components/docs/docs-header';
import { MoonPhase } from '@/components/planet';
import { HorizonFooter } from '@/components/horizon-footer';

export default function Layout({ children }: LayoutProps<'/'>) {
  const catalog = getCatalog();
  const githubUrl = `https://github.com/${gitConfig.user}/${gitConfig.repo}`;
  const entries = catalog.map((entry) => ({
    slug: entry.slug,
    title: entry.title,
    url: entry.url,
    ring: ringOf(entry),
    kind: entry.kind,
    kindLabel: kindName[ringOf(entry)],
    useUrl: entry.useUrl,
    maintainUrl: entry.maintainUrl,
  }));

  return (
    <DocsLayout
      tree={source.getPageTree()}
      nav={{
        mode: 'top',
        component: (
          <DocsHeader
            appName={appName}
            githubUrl={githubUrl}
            hasPackages={catalog.some((entry) => entry.kind === 'package')}
            hasProjects={catalog.some((entry) => entry.kind === 'project')}
          />
        ),
      }}
      // The shared header replaces Fumadocs' own, so the layout needs its height (ADR-0015).
      containerProps={{ style: { '--fd-header-height': '60px' } as CSSProperties }}
      // Only version lines get a switcher, each with its moon (ADR-0013, ADR-0017 decision 10).
      tabs={{
        transform: (tab, node) => {
          if (node.root !== 'line') {
            return null;
          }
          const channel = node.$ref ? getMeta(`${node.$ref.folder}/meta.json`)?.channel : undefined;
          return channel ? { ...tab, icon: <MoonPhase channel={channel} /> } : tab;
        },
      }}
      tabMode="sidebar"
      sidebar={{ banner: <TrackSwitch entries={entries} docsRoute={docsRoute} /> }}
    >
      {children}
      <HorizonFooter entries={catalog} githubUrl={githubUrl} compact />
    </DocsLayout>
  );
}
