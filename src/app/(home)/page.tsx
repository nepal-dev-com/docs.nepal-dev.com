import type { Metadata } from 'next';
import Link from 'next/link';
import { FileText, Lock, TerminalSquare } from 'lucide-react';
import { getCatalog, getMarkdownExample, getTracksPreview } from '@/lib/catalog';
import { docsLlms } from '@/lib/source';
import { appName, docsRoute, gitConfig } from '@/lib/shared';
import { HomeSearchProvider } from '@/components/home/search-state';
import { HomeHeader } from '@/components/home/home-header';
import { Hero } from '@/components/home/hero';
import { Catalogue } from '@/components/home/catalogue';
import { TracksPreview } from '@/components/home/tracks-preview';
import { VersionRails } from '@/components/home/version-rails';
import { Terminal } from '@/components/home/terminal';
import { Reveal } from '@/components/home/reveal';

export const metadata: Metadata = {
  title: `${appName} — every package and project, documented to the version`,
  description: 'Guides, APIs and release notes for npm, Composer, PyPI and Go packages, read from each package’s own source.',
};

export default async function HomePage() {
  const entries = getCatalog();
  const tracks = getTracksPreview();
  const rails = entries.filter((entry) => entry.featured && entry.lines.length >= 2).slice(0, 3);
  const markdownExample = getMarkdownExample();
  const llmsPreview = (await docsLlms.index()).split('\n').slice(0, 6).join('\n');

  const ecosystemsPresent = new Set(entries.map((entry) => (entry.kind === 'project' ? 'projects' : entry.ecosystem)));
  const suggestions =
    entries.length === 0
      ? []
      : [
          ...(['npm', 'composer', 'pypi', 'go'] as const).filter((word) => ecosystemsPresent.has(word)).slice(0, 2),
          ...(entries.some((entry) => entry.dev) ? ['dev'] : []),
          ...(entries.some((entry) => entry.maintainUrl) ? ['maintain'] : []),
          entries[0].slug,
        ];

  return (
    <HomeSearchProvider entries={entries}>
      <HomeHeader appName={appName} githubUrl={`https://github.com/${gitConfig.user}/${gitConfig.repo}`} />
      <main>
        <Hero
          title={{ lead: 'Every package and project,', rest: 'documented to the version.' }}
          subtitle="Guides, APIs and release notes for npm, Composer, PyPI and Go packages, read from each package's own source."
          docsRoute={docsRoute}
          suggestions={suggestions}
        />

        <section className="section wrap" id="browse" aria-labelledby="browse-heading">
          <Catalogue />
        </section>

        {tracks && (
          <section className="section wrap" aria-labelledby="tracks-heading">
            <TracksPreview title={tracks.entry.title} use={tracks.use} maintain={tracks.maintain} />
          </section>
        )}

        {rails.length > 0 && (
          <section className="section wrap" aria-labelledby="versions-heading">
            <div className="section-head">
              <h2 id="versions-heading">Every version, released or not</h2>
              <p>
                Each major version keeps its own pages. Unreleased and older versions say so on every page, and links
                to <code>latest</code> never go stale.
              </p>
            </div>
            <VersionRails entries={rails} />
            <div className="rail-legend">
              <span>
                <svg width="22" height="8" aria-hidden>
                  <line x1="0" y1="4" x2="22" y2="4" className="legend-released" />
                </svg>
                Released
              </span>
              <span>
                <svg width="22" height="8" aria-hidden>
                  <line x1="0" y1="4" x2="22" y2="4" className="legend-next" />
                </svg>
                Unreleased
              </span>
              <span>
                <svg width="12" height="12" aria-hidden>
                  <circle cx="6" cy="6" r="5" className="legend-latest" />
                </svg>
                Latest
              </span>
            </div>
          </section>
        )}

        <section className="section wrap" id="anywhere" aria-labelledby="anywhere-heading">
          <div className="section-head">
            <h2 id="anywhere-heading">Read it anywhere</h2>
            <p>
              Every page is also plain Markdown, so your editor, your terminal and your AI assistant can read the same
              docs you do.
            </p>
          </div>
          <div className="anywhere">
            <Terminal output={llmsPreview} />
            <Reveal className="cards">
              {markdownExample && (
                <Link className="card-row" href={`${markdownExample}.md`}>
                  <span className="card-icon">
                    <FileText aria-hidden />
                  </span>
                  <span>
                    <span className="card-title">Add .md to any page</span>
                    <span className="card-text">
                      <code>{markdownExample}.md</code> returns the page as Markdown, with the version it documents.
                    </span>
                  </span>
                </Link>
              )}
              <a className="card-row" href="/llms.txt">
                <span className="card-icon">
                  <TerminalSquare aria-hidden />
                </span>
                <span>
                  <span className="card-title">llms.txt and llms-full.txt</span>
                  <span className="card-text">One index of every page for AI tools, and one file with all of them.</span>
                </span>
              </a>
              <div className="card-row">
                <span className="card-icon">
                  <Lock aria-hidden />
                </span>
                <span>
                  <span className="card-title">Private stays private</span>
                  <span className="card-text">
                    Private project docs will need sign-in, and never reach search, Markdown or <code>llms.txt</code>.
                  </span>
                </span>
              </div>
            </Reveal>
          </div>
        </section>
      </main>
      <footer className="home-footer">
        <div className="wrap">
          <span>Packages and projects by Puncoz Nepal</span>
          <nav aria-label="Footer">
            <a href="#browse">Browse</a>
            <a href="/llms.txt">llms.txt</a>
            <a href={`https://github.com/${gitConfig.user}/${gitConfig.repo}`} rel="noreferrer noopener">
              GitHub
            </a>
          </nav>
        </div>
      </footer>
    </HomeSearchProvider>
  );
}
