'use client';
import { Menu } from 'lucide-react';
import { useSearchContext } from 'fumadocs-ui/contexts/search';
import { SidebarTrigger } from 'fumadocs-ui/layouts/notebook/slots/sidebar';
import { SiteHeader } from '@/components/site-header';

export function DocsHeader({
  appName,
  githubUrl,
  hasPackages,
  hasProjects,
}: {
  appName: string;
  githubUrl: string;
  hasPackages: boolean;
  hasProjects: boolean;
}) {
  const { setOpenSearch } = useSearchContext();

  return (
    <SiteHeader
      docs
      appName={appName}
      githubUrl={githubUrl}
      links={[
        ...(hasPackages ? [{ label: 'Packages', href: '/#packages' }] : []),
        ...(hasProjects ? [{ label: 'Projects', href: '/#projects' }] : []),
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
