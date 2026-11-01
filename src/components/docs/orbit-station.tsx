'use client';
import { createContext, use, type CSSProperties, type ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import type * as PageTree from 'fumadocs-core/page-tree';
import {
  SidebarFolder,
  SidebarFolderContent,
  SidebarFolderLink,
  SidebarFolderTrigger,
  SidebarItem,
  useFolderDepth,
} from 'fumadocs-ui/components/sidebar/base';
import { useTreeContext, useTreePath } from 'fumadocs-ui/contexts/tree';
import { arcRow, arcSlot } from '@/lib/trajectory';
import { isAdrFolder } from '@/lib/adr-status';
import { AdrConstellation } from '@/components/docs/adr-constellation';

// The children of the station a node sits in; undefined at the top level.
const StationNodes = createContext<PageTree.Node[] | undefined>(undefined);

function samePage(url: string, pathname: string) {
  const trim = (value: string) => (value.length > 1 ? value.replace(/\/$/, '') : value);
  return trim(url) === trim(pathname);
}

function countPages(folder: PageTree.Folder): number {
  return folder.children.reduce((sum, node) => {
    if (node.type === 'page') {
      return sum + 1;
    }
    if (node.type === 'folder') {
      return sum + (node.index ? 1 : 0) + countPages(node);
    }
    return sum;
  }, 0);
}

/**
 * The node's piece of its arc. Inside a station every node but a separator bears the arc; at the
 * top level only pages do, because stations sit between them as cards.
 */
function useArc(node: PageTree.Node) {
  const station = use(StationNodes);
  const { root } = useTreeContext();
  const slot = station
    ? arcSlot(station, node, (item) => item.type !== 'separator')
    : arcSlot(root.children, node, (item) => item.type === 'page');
  return arcRow(slot.index, slot.count);
}

function ArcPiece({ d }: { d: string }) {
  if (!d) {
    return null;
  }
  return (
    <svg className="orbit-arc" viewBox="0 0 24 100" preserveAspectRatio="none" aria-hidden>
      <path d={d} vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

function StationGlyph() {
  return (
    <svg viewBox="-10 -10 20 20" className="station-glyph" aria-hidden>
      <ellipse rx="8.5" ry="3.6" transform="rotate(-18)" className="station-glyph-orbit" />
      <circle r="2.6" className="station-glyph-core" />
      <circle cx="7.4" cy="-2.4" r="2" className="station-glyph-planet" />
    </svg>
  );
}

/** A page as a moon on its station's arc; the current page is the planet (ADR-0018 decision 2). */
export function OrbitItem({ item }: { item: PageTree.Item }) {
  const pathname = usePathname();
  const depth = useFolderDepth();
  const arc = useArc(item);
  const active = samePage(item.url, pathname);
  const onArc = depth <= 2;

  return (
    <SidebarItem
      href={item.url}
      external={item.external}
      active={active}
      icon={item.icon}
      aria-current={active ? 'page' : undefined}
      className="orbit-item"
      data-on-arc={onArc ? '' : undefined}
      style={{ '--dot-x': `${onArc ? arc.x : 6}px` } as CSSProperties}
    >
      {onArc && <ArcPiece d={arc.d} />}
      <span className="orbit-dot" aria-hidden />
      <span className="orbit-name">{item.name}</span>
    </SidebarItem>
  );
}

/**
 * A folder as an orbit station: a card at the first level, a smaller station without a card at
 * the second, a plain group below that.
 */
export function OrbitStation({ item, children }: { item: PageTree.Folder; children: ReactNode }) {
  const pathname = usePathname();
  const path = useTreePath();
  const level = useFolderDepth() + 1;
  const arc = useArc(item);
  const holdsCurrent = path.includes(item);
  const count = countPages(item);
  const nested = level === 2;
  // A folder of ADRs with sub-folders keeps the plain station, so none of its pages are hidden.
  const constellation =
    isAdrFolder(item.$ref?.folder) && !item.children.some((node) => node.type === 'folder');

  const label = (
    <>
      {level <= 2 && <StationGlyph />}
      <span className="station-name">{item.name}</span>
      <span className="station-count" aria-label={`${count} ${count === 1 ? 'page' : 'pages'}`}>
        {count}
      </span>
    </>
  );

  return (
    <SidebarFolder
      collapsible={item.collapsible}
      active={holdsCurrent}
      defaultOpen={item.defaultOpen}
      className="station"
      data-level={Math.min(level, 3)}
      data-current={holdsCurrent ? '' : undefined}
      data-constellation={constellation ? '' : undefined}
    >
      {/* A nested station lets its parent's arc run past it, so the arc stays one line. */}
      {nested && <ArcPiece d={arc.d} />}
      {item.index ? (
        <SidebarFolderLink
          href={item.index.url}
          external={item.index.external}
          active={samePage(item.index.url, pathname)}
          aria-current={samePage(item.index.url, pathname) ? 'page' : undefined}
          className="station-head"
        >
          {label}
        </SidebarFolderLink>
      ) : (
        <SidebarFolderTrigger className="station-head">{label}</SidebarFolderTrigger>
      )}
      <SidebarFolderContent className="station-body">
        {constellation ? (
          <AdrConstellation folder={item} />
        ) : (
          <div className="station-moons">
            <StationNodes value={item.children}>{children}</StationNodes>
          </div>
        )}
      </SidebarFolderContent>
    </SidebarFolder>
  );
}

export function OrbitSeparator({ item }: { item: PageTree.Separator }) {
  return (
    <p className="orbit-separator">
      {item.icon}
      {item.name}
    </p>
  );
}
