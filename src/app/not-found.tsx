import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import '@/app/(home)/home.css';
import { getCatalog } from '@/lib/catalog';
import { appName, gitConfig } from '@/lib/shared';
import { HomeHeader } from '@/components/home/home-header';
import { SearchButton } from '@/components/home/search-button';
import { HorizonFooter } from '@/components/horizon-footer';

export const metadata: Metadata = {
  title: `Page not found — ${appName}`,
};

/**
 * Every unknown path, and every `notFound()`, gets this page (ADR-0017 decision 11). It shows no
 * part of the requested path.
 */
export default function NotFound() {
  const entries = getCatalog();
  const githubUrl = `https://github.com/${gitConfig.user}/${gitConfig.repo}`;

  return (
    <div className="home">
      <HomeHeader
        appName={appName}
        githubUrl={githubUrl}
        hasPackages={entries.some((entry) => entry.kind === 'package')}
        hasProjects={entries.some((entry) => entry.kind === 'project')}
        anchorBase="/"
      />
      <main className="lost wrap" aria-labelledby="lost-heading">
        <svg viewBox="0 0 420 200" className="lost-drawing" aria-hidden>
          <ellipse
            cx="190"
            cy="110"
            rx="150"
            ry="52"
            fill="none"
            stroke="var(--home-line-2)"
            strokeDasharray="560 60"
            transform="rotate(-8 190 110)"
          />
          <circle cx="190" cy="110" r="10" fill="var(--home-star)" />
          <path d="M318 74C350 56 372 44 398 30" fill="none" stroke="var(--home-faint)" strokeDasharray="2 5" />
          <circle cx="398" cy="30" r="9" fill="var(--home-accent)" />
          <path d="M398 21a9 9 0 0 1 0 18a4 9 0 0 0 0-18Z" fill="#000" opacity="0.28" />
        </svg>
        <h1 id="lost-heading">This page drifted out of orbit.</h1>
        <p>It may have moved to another version or been renamed. Search for it, or start again from the system.</p>
        <SearchButton />
        <Link className="lost-back" href="/">
          Back to the system
          <ArrowRight aria-hidden />
        </Link>
      </main>
      <HorizonFooter entries={entries} githubUrl={githubUrl} />
    </div>
  );
}
