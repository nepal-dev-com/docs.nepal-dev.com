'use client';
import type { ReactNode } from 'react';
import Link from 'next/link';
import { ArrowUp } from 'lucide-react';
import { useSearchContext } from 'fumadocs-ui/contexts/search';
import { verseFragment } from '@/lib/verse-view';
import { zoomOut } from '@/lib/zoom';

const reducedMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

export function FooterSearch() {
  const { setOpenSearch } = useSearchContext();
  return (
    <button type="button" onClick={() => setOpenSearch(true)}>
      Search <kbd>⌘K</kbd>
    </button>
  );
}

export function BackToTop({ label }: { label: string }) {
  return (
    <button
      type="button"
      onClick={() => scrollTo({ top: 0, behavior: reducedMotion() ? 'auto' : 'smooth' })}
    >
      {label}
      <ArrowUp aria-hidden />
    </button>
  );
}

/** A way into the Verse view from the end of any page (ADR-0033 decision 4). */
export function VerseLink({ children }: { children: ReactNode }) {
  return (
    <Link
      href={`/${verseFragment}`}
      transitionTypes={[zoomOut]}
      onNavigate={(event) => {
        if (location.pathname !== '/') {
          return;
        }
        // Already home: the view is in the hero, out of sight from the footer. Like the hero's own
        // button this keeps Next.js' history state and adds no entry; replaceState fires no
        // hashchange, so the system is told by hand.
        event.preventDefault();
        scrollTo({ top: 0, behavior: reducedMotion() ? 'auto' : 'smooth' });
        history.replaceState(history.state, '', verseFragment);
        dispatchEvent(new HashChangeEvent('hashchange'));
      }}
    >
      {children}
    </Link>
  );
}
