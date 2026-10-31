'use client';
import { Menu } from 'lucide-react';
import { useSearchContext } from 'fumadocs-ui/contexts/search';
import { SidebarTrigger } from 'fumadocs-ui/layouts/notebook/slots/sidebar';
import { SiteHeader } from '@/components/site-header';

export function DocsHeader({ appName, githubUrl, hasProjects }: { appName: string; githubUrl: string; hasProjects: boolean }) {
  const { setOpenSearch } = useSearchContext();

  return (
    <SiteHeader
      docs
      appName={appName}
      githubUrl={githubUrl}
      links={[
        { label: 'Packages', href: '/#browse' },
        ...(hasProjects ? [{ label: 'Projects', href: '/?filter=projects#browse' }] : []),
        { label: 'llms.txt', href: '/llms.txt' },
      ]}
      onSearch={() => setOpenSearch(true)}
      menu={
        <SidebarTrigger className="site-menu" aria-label="Open the sidebar">
          <Menu aria-hidden />
        </SidebarTrigger>
      }
    />
  );
}
