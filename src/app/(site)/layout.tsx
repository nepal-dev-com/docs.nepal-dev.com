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
import { OrbitItem, OrbitSeparator, OrbitStation, StationGroup } from '@/components/docs/orbit-station';
import { AdrStatusProvider } from '@/components/docs/adr-constellation';
import { adrStatus, isAdrFolder, type AdrStatus } from '@/lib/adr-status';
import { folderUrls, lineLink } from '@/lib/overview-sidebar';

// Statuses for the sidebar's ADR constellations, read from each ADR's status line (ADR-0019).
function adrStatuses(): Record<string, AdrStatus> {
  const statuses: Record<string, AdrStatus> = {};
  for (const page of source.getPages()) {
    const folder = page.path.split('/').slice(0, -1).join('/');
    if (isAdrFolder(folder) && !page.path.endsWith('/index.mdx')) {
      statuses[page.url] = adrStatus(page.data.structuredData);
    }
  }
  return statuses;
}

export default function Layout({ children }: LayoutProps<'/'>) {
  const catalog = getCatalog();
  const githubUrl = `https://github.com/${gitConfig.user}/${gitConfig.repo}`;
  const overviews = new Set(catalog.map((entry) => entry.url));
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
    <AdrStatusProvider statuses={adrStatuses()}>
      {/* The sidebar's top-level stations are one group (ADR-0023). */}
      <StationGroup>
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
              const url = lineLink(folderUrls(node), overviews, tab.url);
              return channel ? { ...tab, url, icon: <MoonPhase channel={channel} /> } : { ...tab, url };
            },
          }}
          tabMode="sidebar"
          sidebar={{
            banner: <TrackSwitch entries={entries} docsRoute={docsRoute} />,
            components: { Folder: OrbitStation, Item: OrbitItem, Separator: OrbitSeparator },
          }}
        >
          {children}
          <HorizonFooter entries={catalog} githubUrl={githubUrl} backLabel="Back to top" />
        </DocsLayout>
      </StationGroup>
    </AdrStatusProvider>
  );
}
