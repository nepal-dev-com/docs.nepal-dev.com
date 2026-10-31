'use client';
import { SiteHeader } from '@/components/site-header';
import { useHomeSearch } from './search-state';

export function HomeHeader({ appName, githubUrl }: { appName: string; githubUrl: string }) {
  const { entries, addChip, clear } = useHomeSearch();
  const hasProjects = entries.some((entry) => entry.kind === 'project');

  return (
    <SiteHeader
      appName={appName}
      githubUrl={githubUrl}
      links={[
        { label: 'Packages', href: '#browse', onClick: clear },
        ...(hasProjects
          ? [
              {
                label: 'Projects',
                href: '#browse',
                onClick: () => {
                  clear();
                  addChip('project');
                },
              },
            ]
          : []),
        { label: 'llms.txt', href: '/llms.txt' },
      ]}
      // The hero's field is this page's search; the header points at it rather than opening a second one.
      onSearch={() => {
        const input = document.querySelector<HTMLInputElement>('.hero-search input');
        input?.scrollIntoView({ block: 'center', behavior: 'smooth' });
        input?.focus({ preventScroll: true });
      }}
    />
  );
}
