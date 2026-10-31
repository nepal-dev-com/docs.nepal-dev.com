'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useHomeSearch } from './search-state';

export function HomeHeader({ appName, githubUrl }: { appName: string; githubUrl: string }) {
  const [scrolled, setScrolled] = useState(false);
  const { entries, addChip, clear } = useHomeSearch();
  const hasProjects = entries.some((entry) => entry.kind === 'project');

  useEffect(() => {
    const onScroll = () => setScrolled(scrollY > 8);
    onScroll();
    addEventListener('scroll', onScroll, { passive: true });
    return () => removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header className={scrolled ? 'home-header scrolled' : 'home-header'}>
      <div className="wrap">
        <Link href="/" className="brand">
          <span className="mark" aria-hidden />
          {appName}
        </Link>
        <nav aria-label="Site">
          <a href="#browse" onClick={clear}>
            Packages
          </a>
          {hasProjects && (
            <a
              href="#browse"
              onClick={() => {
                clear();
                addChip('project');
              }}
            >
              Projects
            </a>
          )}
          <a href="/llms.txt">llms.txt</a>
        </nav>
        <span className="spacer" />
        <a className="ghost" href={githubUrl} rel="noreferrer noopener">
          <svg viewBox="0 0 24 24" aria-hidden>
            <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.4 5.4 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65S8.93 17.38 9 18v4" />
            <path d="M9 18c-4.51 2-5-2-7-2" />
          </svg>
          GitHub
        </a>
      </div>
    </header>
  );
}
