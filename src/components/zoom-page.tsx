import { ViewTransition, type ReactNode } from 'react';
import { zoomIn, zoomOut } from '@/lib/zoom';

const directions = { [zoomIn]: zoomIn, [zoomOut]: zoomOut, default: 'none' };

/**
 * A page that settles in from slightly smaller when the reader goes down the scale ladder and
 * from slightly larger when they go up (ADR-0029 decision 6). It goes in each page, not a layout:
 * layouts persist, so they never enter or exit.
 */
export function ZoomPage({ children }: { children: ReactNode }) {
  return (
    <ViewTransition enter={directions} exit={directions} default="none">
      {children}
    </ViewTransition>
  );
}

/** A planet drawing that morphs between its home page card and its overview's planet header. */
export function PlanetMorph({ slug, children }: { slug: string; children: ReactNode }) {
  return (
    <ViewTransition name={`planet-${slug}`} share="morph" default="none">
      {children}
    </ViewTransition>
  );
}
