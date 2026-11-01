import { SiteHeader } from '@/components/site-header';

// No search button here: the hero's is this page's search (ADR-0016 decision 2).
export function HomeHeader({
  appName,
  githubUrl,
  hasPackages,
  hasProjects,
  anchorBase = '',
}: {
  appName: string;
  githubUrl: string;
  hasPackages: boolean;
  hasProjects: boolean;
  // `/` on pages other than the home page, so the anchors lead back to its cards.
  anchorBase?: string;
}) {
  return (
    <SiteHeader
      appName={appName}
      githubUrl={githubUrl}
      links={[
        ...(hasPackages ? [{ label: 'Packages', href: `${anchorBase}#packages` }] : []),
        ...(hasProjects ? [{ label: 'Projects', href: `${anchorBase}#projects` }] : []),
        { label: 'llms.txt', href: '/llms.txt' },
      ]}
    />
  );
}
