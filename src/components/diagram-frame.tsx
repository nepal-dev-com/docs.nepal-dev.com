'use client';
import { useEffect, useRef, useState, useSyncExternalStore, type CSSProperties } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { useTheme } from 'fumadocs-ui/provider/base';
import { isPresentRequest, reportedHeight } from '@/lib/diagrams';

const subscribe = () => () => {};

/** The diagram's own page in its Present stage, for a frame that cannot go fullscreen. */
export function presentHref(src: string, theme: 'light' | 'dark'): string {
  return `${src}?theme=${theme}&present=1`;
}

interface DiagramFrameProps {
  src: string;
  title: string;
  /** The diagram's height over its width, from its `viewBox`. */
  ratio: number;
  wide: boolean;
}

/** The sandboxed frame: the site's theme in, the diagram's height out (ADR-0022 decision 6). */
export function DiagramFrame({ src, title, ratio, wide }: DiagramFrameProps) {
  const frame = useRef<HTMLIFrameElement>(null);
  const [height, setHeight] = useState<number>();
  const { resolvedTheme } = useTheme();
  const hydrated = useSyncExternalStore(subscribe, () => true, () => false);
  // Dark is the site's default theme, so the server renders the dark frame.
  const theme: 'light' | 'dark' = hydrated && resolvedTheme === 'light' ? 'light' : 'dark';
  const themeRef = useRef(theme);
  useEffect(() => {
    themeRef.current = theme;
  }, [theme]);

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      // Only this frame's own window, and only a bounded number (ADR-0022, security).
      if (!frame.current || event.source !== frame.current.contentWindow) {
        return;
      }
      if (isPresentRequest(event.data)) {
        window.location.assign(presentHref(src, themeRef.current));
        return;
      }
      const next = reportedHeight(event.data);
      if (next !== undefined) {
        setHeight(next);
      }
    };
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, [src]);

  const style = {
    '--diagram-ratio': ratio,
    ...(height === undefined ? {} : { height: `${height}px` }),
  } as CSSProperties;

  return (
    <figure className="diagram not-prose" data-wide={wide ? '' : undefined}>
      {/* No allow-same-origin: the diagram's script runs in an opaque origin (ADR-0011). */}
      {/* A new frame per theme: a lazy frame does not always follow a changed src. */}
      <iframe
        key={theme}
        ref={frame}
        src={`${src}?frame=1&theme=${theme}`}
        title={title}
        sandbox="allow-scripts allow-downloads"
        loading="lazy"
        allow="fullscreen"
        style={style}
      />
      <figcaption>
        <span>{title}</span>
        <a href={`${src}?theme=${theme}`}>
          Open full screen
          <ArrowUpRight aria-hidden />
        </a>
      </figcaption>
    </figure>
  );
}
