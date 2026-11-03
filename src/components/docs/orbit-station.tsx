'use client';
import { createContext, use, useCallback, useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import type * as PageTree from 'fumadocs-core/page-tree';
import {
  SidebarFolder,
  SidebarFolderContent,
  SidebarFolderLink,
  SidebarFolderTrigger,
  SidebarItem,
  useFolder,
  useFolderDepth,
} from 'fumadocs-ui/components/sidebar/base';
import { useTreeContext, useTreePath } from 'fumadocs-ui/contexts/tree';
import { arcRow, arcSlot } from '@/lib/trajectory';
import { isAdrFolder } from '@/lib/adr-status';
import { AdrConstellation } from '@/components/docs/adr-constellation';
import { groupAfter, stationFollows, stationOnPageChange, type GroupEvent } from '@/lib/station-group';
import { countPages, folderBody, pageBody } from '@/lib/sidebar-ladder';

// The children of the station a node sits in; undefined at the top level.
const StationNodes = createContext<PageTree.Node[] | undefined>(undefined);

interface Group {
  openId: string | null;
  dispatch: (event: GroupEvent) => void;
}

// Sibling stations, of which at most one is open (ADR-0023).
const StationGroupContext = createContext<Group | null>(null);

/** A group of sibling stations: the sidebar's top level, or the inside of one station. */
export function StationGroup({ children }: { children: ReactNode }) {
  const [openId, setOpenId] = useState<string | null>(null);
  const dispatch = useCallback((event: GroupEvent) => setOpenId((current) => groupAfter(current, event)), []);
  const value = useMemo(() => ({ openId, dispatch }), [openId, dispatch]);
  return <StationGroupContext value={value}>{children}</StationGroupContext>;
}

/** Keeps one station in step with its group, through Fumadocs' own folder state (ADR-0023). */
function OneOpen({ id, holdsCurrent }: { id: string; holdsCurrent: boolean }) {
  const group = use(StationGroupContext);
  const folder = useFolder();
  const pathname = usePathname();
  const open = folder?.open ?? false;
  const setOpen = folder?.setOpen;
  const dispatch = group?.dispatch;
  const openId = group?.openId ?? null;
  // The last open state seen, so only a real change is reported; it also keeps React's
  // development double run of effects from reporting a station's first state as a click.
  const seen = useRef(open);

  useEffect(() => {
    if (!setOpen || !dispatch) {
      return;
    }
    const action = stationOnPageChange(holdsCurrent);
    setOpen(action === 'open');
    if (action === 'open') {
      dispatch({ type: 'opened', id });
    }
    // Runs on page changes only: a station the reader opens stays open until the next one.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  useEffect(() => {
    if (!dispatch || seen.current === open) {
      return;
    }
    seen.current = open;
    dispatch({ type: open ? 'opened' : 'closed', id });
  }, [open, id, dispatch]);

  useEffect(() => {
    if (setOpen && stationFollows(id, openId, open) === 'close') {
      setOpen(false);
    }
    // Follows the group only; the station's own changes are reported above.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openId]);

  return null;
}

function samePage(url: string, pathname: string) {
  const trim = (value: string) => (value.length > 1 ? value.replace(/\/$/, '') : value);
  return trim(url) === trim(pathname);
}

/**
 * The node's piece of its arc. Inside an orbit every node but a separator bears the arc; the top
 * level has none, since its pages are landmarks (ADR-0027 decision 4).
 */
function useArc(node: PageTree.Node) {
  const station = use(StationNodes);
  const { root } = useTreeContext();
  const slot = station
    ? arcSlot(station, node, (item) => item.type !== 'separator')
    : arcSlot(root.children, node, () => false);
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

// A folder's ring; the planet inside it shows only while the orbit is open (ADR-0027 decision 2).
function OrbitRing() {
  return (
    <svg viewBox="-8 -8 16 16" className="orbit-ring" aria-hidden>
      <circle r="5.2" className="orbit-ring-path" />
      <circle r="2.3" className="orbit-ring-planet" />
    </svg>
  );
}

/**
 * A page on the scale ladder: a landmark at the top level, a satellite on its orbit's arc
 * inside one; the current page is the probe (ADR-0027 decision 1).
 */
export function OrbitItem({ item }: { item: PageTree.Item }) {
  const pathname = usePathname();
  const depth = useFolderDepth();
  const body = pageBody(use(StationNodes) !== undefined);
  const arc = useArc(item);
  const active = samePage(item.url, pathname);
  const onArc = body === 'satellite' && depth <= 2;

  return (
    <SidebarItem
      href={item.url}
      external={item.external}
      active={active}
      icon={item.icon}
      aria-current={active ? 'page' : undefined}
      className="orbit-item"
      data-body={body}
      data-on-arc={onArc ? '' : undefined}
      style={{ '--dot-x': `${onArc ? arc.x : body === 'landmark' ? 13 : 6}px` } as CSSProperties}
    >
      {onArc && <ArcPiece d={arc.d} />}
      <span className="orbit-dot" aria-hidden />
      <span className="orbit-name">{item.name}</span>
    </SidebarItem>
  );
}

/** A folder that holds only its index page: its ring and name, linking to that page (ADR-0027 decision 6). */
function OrbitLink({ item, index }: { item: PageTree.Folder; index: PageTree.Item }) {
  const pathname = usePathname();
  const level = useFolderDepth() + 1;
  const active = samePage(index.url, pathname);
  return (
    <SidebarItem
      href={index.url}
      external={index.external}
      active={active}
      aria-current={active ? 'page' : undefined}
      className="station-head orbit-link"
      data-level={Math.min(level, 3)}
    >
      {level <= 2 && <OrbitRing />}
      <span className="station-name">{item.name}</span>
    </SidebarItem>
  );
}

/**
 * A folder as an orbit: a row with its ring, name and count while closed, the sidebar's one card
 * while open; a nested orbit opens inside its parent's card, never as a card of its own
 * (ADR-0027 decisions 2 and 3).
 */
export function OrbitStation({ item, children }: { item: PageTree.Folder; children: ReactNode }) {
  if (item.index && folderBody(item) === 'orbit-link') {
    return <OrbitLink item={item} index={item.index} />;
  }
  return <Orbit item={item}>{children}</Orbit>;
}

function Orbit({ item, children }: { item: PageTree.Folder; children: ReactNode }) {
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
      {level <= 2 && <OrbitRing />}
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
      {item.collapsible !== false && (
        <OneOpen id={item.$id ?? item.$ref?.folder ?? item.name?.toString() ?? ''} holdsCurrent={holdsCurrent} />
      )}
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
            <StationNodes value={item.children}>
              <StationGroup>{children}</StationGroup>
            </StationNodes>
          </div>
        )}
      </SidebarFolderContent>
    </SidebarFolder>
  );
}

/** A separator as a belt: a group's label on a dotted line (ADR-0027 decision 5). */
export function OrbitSeparator({ item }: { item: PageTree.Separator }) {
  return (
    <p className="orbit-separator">
      {item.icon}
      {item.name}
    </p>
  );
}
