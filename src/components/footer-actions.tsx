'use client';
import { ArrowUp } from 'lucide-react';
import { useSearchContext } from 'fumadocs-ui/contexts/search';

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
      onClick={() =>
        scrollTo({ top: 0, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' })
      }
    >
      {label}
      <ArrowUp aria-hidden />
    </button>
  );
}
