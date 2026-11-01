'use client';
import { Search } from 'lucide-react';
import { useSearchContext } from 'fumadocs-ui/contexts/search';

/**
 * Looks like the hero's search field and opens the site's Fumadocs search dialog (ADR-0016).
 */
export function SearchButton() {
  const { setOpenSearch } = useSearchContext();

  return (
    <button type="button" className="hero-search bar" onClick={() => setOpenSearch(true)}>
      <Search className="bar-icon" aria-hidden />
      <span className="bar-placeholder">Search packages, projects and pages</span>
      <kbd>⌘K</kbd>
    </button>
  );
}
