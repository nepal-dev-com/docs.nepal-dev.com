'use client';
import Link from 'next/link';
import { useEffect, useState, type ReactNode } from 'react';
import { Search } from 'lucide-react';
import { ThemeSwitch } from 'fumadocs-ui/layouts/shared/slots/theme-switch';
import { cn } from '@/lib/cn';

export interface SiteLink {
  label: string;
  href: string;
  onClick?: () => void;
}

interface SiteHeaderProps {
  appName: string;
  githubUrl: string;
  links: SiteLink[];
  onSearch: () => void;
  menu?: ReactNode;
  docs?: boolean;
}

/**
 * The header on every page: wordmark, links, search, GitHub and the theme switch (ADR-0015).
 */
export function SiteHeader({ appName, githubUrl, links, onSearch, menu, docs = false }: SiteHeaderProps) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(scrollY > 8);
    onScroll();
    addEventListener('scroll', onScroll, { passive: true });
    return () => removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header className={cn('site-header', scrolled && 'scrolled')} data-docs={docs ? '' : undefined}>
      <div className="site-header-row">
        <Link href="/" className="site-brand">
          <span className="site-mark" aria-hidden />
          {appName}
        </Link>
        <nav aria-label="Site" className="site-nav">
          {links.map((link) => (
            <Link key={link.label} href={link.href} onClick={link.onClick}>
              {link.label}
            </Link>
          ))}
        </nav>
        <span className="site-spacer" />
        <button type="button" className="site-search" onClick={onSearch} aria-label="Search the documentation">
          <Search aria-hidden />
          <span className="site-search-label">Search</span>
          <kbd>⌘K</kbd>
        </button>
        <a className="site-ghost" href={githubUrl} rel="noreferrer noopener" aria-label="GitHub">
          <svg viewBox="0 0 24 24" aria-hidden>
            <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.4 5.4 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65S8.93 17.38 9 18v4" />
            <path d="M9 18c-4.51 2-5-2-7-2" />
          </svg>
          <span className="site-ghost-label">GitHub</span>
        </a>
        <ThemeSwitch mode="light-dark" />
        {menu}
      </div>
    </header>
  );
}
