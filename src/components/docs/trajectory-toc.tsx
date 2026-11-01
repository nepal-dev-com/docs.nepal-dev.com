'use client';
import {
  createContext,
  use,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from 'react';
import { ArrowUp, ChevronDown } from 'lucide-react';
import type { TOCItemType } from 'fumadocs-core/toc';
import { useTOCItems } from 'fumadocs-ui/components/toc';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from 'fumadocs-ui/components/ui/collapsible';
import type { TOCPopoverProps, TOCProps } from 'fumadocs-ui/layouts/notebook/page/slots/toc';
import { buildTrajectory, depthOffset, probeAt, timeLeft, type Point } from '@/lib/trajectory';

const ReadingTime = createContext(0);

/** Carries the page's reading time, worked out on the server, to both tables of contents. */
export function ReadingTimeProvider({ minutes, children }: { minutes: number; children: ReactNode }) {
  return <ReadingTime value={minutes}>{children}</ReadingTime>;
}

interface Position {
  // The heading the reader is in; -1 before the first.
  section: number;
  fraction: number;
  progress: number;
}

// A heading counts as reached once it passes this far below the top of the window: under the
// 60px header, with room for the heading itself.
const REACHED = 140;

function reducedMotion() {
  return matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function headingOf(item: TOCItemType) {
  return document.getElementById(decodeURIComponent(item.url.slice(1)));
}

function useReadingPosition(items: TOCItemType[]): Position | undefined {
  const [position, setPosition] = useState<Position>();

  useEffect(() => {
    let frame = 0;
    const measure = () => {
      frame = 0;
      const scrollable = Math.max(1, document.documentElement.scrollHeight - innerHeight);
      const progress = Math.min(1, scrollY / scrollable);
      const line = scrollY + REACHED;
      const tops = items.map((item) => {
        const heading = headingOf(item);
        return heading ? heading.getBoundingClientRect().top + scrollY : Number.POSITIVE_INFINITY;
      });

      let section = -1;
      tops.forEach((top, index) => {
        if (top <= line) {
          section = index;
        }
      });
      // Short closing sections never reach the line; the bottom of the page reaches them.
      if (progress >= 0.995 && items.length > 0) {
        section = items.length - 1;
      }

      let fraction = 0;
      if (section >= 0 && section < items.length - 1 && !reducedMotion()) {
        const span = tops[section + 1] - tops[section];
        fraction = span > 0 ? Math.min(1, Math.max(0, (line - tops[section]) / span)) : 0;
      }
      setPosition({ section, fraction, progress });
    };
    const schedule = () => {
      if (!frame) {
        frame = requestAnimationFrame(measure);
      }
    };

    measure();
    addEventListener('scroll', schedule, { passive: true });
    addEventListener('resize', schedule);
    const observer = new ResizeObserver(schedule);
    observer.observe(document.body);
    return () => {
      cancelAnimationFrame(frame);
      removeEventListener('scroll', schedule);
      removeEventListener('resize', schedule);
      observer.disconnect();
    };
  }, [items]);

  return position;
}

function scrollToHeading(item: TOCItemType) {
  const heading = headingOf(item);
  if (!heading) {
    return;
  }
  heading.scrollIntoView({ behavior: reducedMotion() ? 'auto' : 'smooth', block: 'start' });
  history.replaceState(null, '', item.url);
}

function ProbeMark() {
  return (
    <svg viewBox="-6 -6 12 12" aria-hidden>
      <circle r="5" className="trajectory-probe-halo" />
      <circle r="3.4" className="trajectory-probe-body" />
      <path d="M0-3.4a3.4 3.4 0 0 1 0 6.8a1.6 3.4 0 0 0 0-6.8Z" className="trajectory-probe-shade" />
    </svg>
  );
}

function Path({
  items,
  position,
  onPick,
}: {
  items: TOCItemType[];
  position: Position | undefined;
  onPick?: () => void;
}) {
  const listRef = useRef<HTMLOListElement>(null);
  const [points, setPoints] = useState<Point[]>([]);

  useLayoutEffect(() => {
    const list = listRef.current;
    if (!list) {
      return;
    }
    const measure = () => {
      const origin = list.getBoundingClientRect().top;
      const dots = Array.from(list.querySelectorAll<HTMLElement>('[data-dot]'));
      setPoints(
        dots.map((dot, index) => {
          const rect = dot.getBoundingClientRect();
          return { x: depthOffset(items[index]?.depth ?? 2), y: rect.top + rect.height / 2 - origin };
        }),
      );
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(list);
    return () => observer.disconnect();
  }, [items]);

  const trajectory = useMemo(() => buildTrajectory(points), [points]);
  const probe =
    position && points.length === items.length
      ? probeAt(trajectory, points, position.section, position.fraction)
      : undefined;
  const section = position?.section ?? -1;
  const height = points.length > 0 ? points[points.length - 1].y + 8 : 0;

  // Keeps the probe's row in view when the list scrolls inside its column.
  useEffect(() => {
    const list = listRef.current;
    const scroller = list?.closest<HTMLElement>('[data-trajectory-scroll]');
    const row = section >= 0 ? list?.children[section] : undefined;
    if (!scroller || !(row instanceof HTMLElement)) {
      return;
    }
    const top = row.getBoundingClientRect().top - scroller.getBoundingClientRect().top;
    if (top < 24 || top > scroller.clientHeight - 48) {
      scroller.scrollTop += top - scroller.clientHeight / 3;
    }
  }, [section]);

  return (
    <div className="trajectory" data-ready={probe ? '' : undefined}>
      {points.length > 1 && (
        <svg className="trajectory-path" width="28" height={height} aria-hidden>
          <path d={trajectory.d} className="trajectory-ahead" />
          {probe && (
            <path
              d={trajectory.d}
              className="trajectory-read"
              strokeDasharray={`${probe.length} ${trajectory.total + 1}`}
            />
          )}
        </svg>
      )}
      {probe && (
        <span
          className="trajectory-probe"
          style={{ transform: `translate(${probe.point.x}px, ${probe.point.y}px)` }}
          aria-hidden
        >
          <ProbeMark />
        </span>
      )}
      <ol ref={listRef}>
        {items.map((item, index) => {
          const state = index < section ? 'read' : index === section ? 'current' : 'ahead';
          return (
            <li
              key={item.url}
              data-state={state}
              style={{ '--x': `${depthOffset(item.depth)}px` } as CSSProperties}
            >
              <a
                href={item.url}
                aria-current={state === 'current' ? 'location' : undefined}
                onClick={(event) => {
                  event.preventDefault();
                  scrollToHeading(item);
                  onPick?.();
                }}
              >
                <span className="trajectory-dot" data-dot aria-hidden />
                {item.title}
              </a>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

function BackToTop() {
  return (
    <button
      type="button"
      className="trajectory-top"
      onClick={() => scrollTo({ top: 0, behavior: reducedMotion() ? 'auto' : 'smooth' })}
    >
      Back to top
      <ArrowUp aria-hidden />
    </button>
  );
}

/** "On this page" beside the page from Fumadocs' desktop breakpoint up (ADR-0018 decision 3). */
export function TrajectoryTOC({ container }: TOCProps) {
  const items = useTOCItems();
  const minutes = use(ReadingTime);
  const position = useReadingPosition(items);
  const time = timeLeft(minutes, position?.progress);

  if (items.length === 0 && !time) {
    return <div id="nd-toc-placeholder" className="hidden xl:layout:[--fd-toc-width:268px]" />;
  }

  return (
    <div
      id="nd-toc"
      {...container}
      className="sticky top-(--fd-docs-row-3) [grid-area:toc] h-[calc(var(--fd-docs-height)-var(--fd-docs-row-3))] flex flex-col w-(--fd-toc-width) pt-12 pe-4 pb-2 xl:layout:[--fd-toc-width:268px] max-xl:hidden"
    >
      <div className="trajectory-head">
        <h3 id="toc-title">On this page</h3>
        {time && <span>{time}</span>}
      </div>
      {items.length === 0 ? (
        <p className="trajectory-empty">This page has no sections.</p>
      ) : (
        <div className="trajectory-scroll" data-trajectory-scroll>
          <Path items={items} position={position} />
        </div>
      )}
      {position && position.section >= 0 && <BackToTop />}
    </div>
  );
}

function ProgressRing({ progress }: { progress: number }) {
  const angle = progress * Math.PI * 2 - Math.PI / 2;
  const circumference = 2 * Math.PI * 7;
  return (
    <svg viewBox="-10 -10 20 20" className="trajectory-ring" aria-hidden>
      <circle r="7" className="trajectory-ring-track" />
      <circle
        r="7"
        className="trajectory-ring-read"
        strokeDasharray={`${circumference * progress} ${circumference}`}
        transform="rotate(-90)"
      />
      <circle cx={7 * Math.cos(angle)} cy={7 * Math.sin(angle)} r="2.6" className="trajectory-ring-probe" />
    </svg>
  );
}

/** The bar under the header below Fumadocs' desktop breakpoint, opening the same trajectory. */
export function TrajectoryPopover({ container }: TOCPopoverProps) {
  const items = useTOCItems();
  const minutes = use(ReadingTime);
  const position = useReadingPosition(items);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLElement>(null);
  const time = timeLeft(minutes, position?.progress);
  const section = position?.section ?? -1;
  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!open) {
      return;
    }
    const onClick = (event: MouseEvent) => {
      if (event.target instanceof Node && ref.current && !ref.current.contains(event.target)) {
        setOpen(false);
      }
    };
    addEventListener('click', onClick);
    return () => removeEventListener('click', onClick);
  }, [open]);

  if (items.length === 0) {
    return null;
  }

  return (
    <Collapsible
      open={open}
      onOpenChange={setOpen}
      data-toc-popover=""
      {...container}
      className="sticky top-(--fd-docs-row-2) z-10 [grid-area:toc-popover] h-(--fd-toc-popover-height) xl:hidden max-xl:layout:[--fd-toc-popover-height:--spacing(10)]"
    >
      <header ref={ref} className="trajectory-bar" data-open={open ? '' : undefined}>
        <CollapsibleTrigger className="trajectory-bar-trigger" aria-label={open ? 'Close On this page' : 'Open On this page'}>
          <ProgressRing progress={position?.progress ?? 0} />
          <span className="trajectory-bar-title" data-muted={section < 0 ? '' : undefined}>
            {items[Math.max(0, section)]?.title}
          </span>
          {time && <span className="trajectory-bar-time">{time}</span>}
          <ChevronDown aria-hidden className="trajectory-bar-chevron" />
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="trajectory-sheet" data-trajectory-scroll>
            <Path items={items} position={position} onPick={close} />
          </div>
        </CollapsibleContent>
      </header>
    </Collapsible>
  );
}
