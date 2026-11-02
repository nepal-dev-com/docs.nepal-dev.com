import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { getCatalog, getExamplePage, getTracksPreview } from '@/lib/catalog';
import { docsLlms } from '@/lib/source';
import { appName, getPageMarkdownUrl, gitConfig } from '@/lib/shared';
import { verseFragment } from '@/lib/verse-view';
import { HomeHeader } from '@/components/home/home-header';
import { Hero } from '@/components/home/hero';
import { PlanetCards } from '@/components/home/planet-cards';
import { PrivateProjects } from '@/components/home/beyond-the-belt';
import { TwoSides } from '@/components/home/two-sides';
import { MoonRows } from '@/components/home/moon-rows';
import { HorizonFooter } from '@/components/horizon-footer';
import { Terminal, type TerminalTab } from '@/components/home/terminal';
import { AssistantActions } from '@/components/home/assistant-actions';
import { Reveal } from '@/components/home/reveal';
import { ZoomPage } from '@/components/zoom-page';

export const metadata: Metadata = {
  title: `${appName} — every package and project, documented to the version`,
  description: 'Guides, APIs and release notes for npm, Composer, PyPI and Go packages, read from each package’s own source.',
};

const head = (text: string) => text.split('\n').slice(0, 6).join('\n');

async function terminalTabs(example: ReturnType<typeof getExamplePage>): Promise<TerminalTab[]> {
  const llmsTab: TerminalTab = {
    id: 'llms',
    label: 'llms.txt',
    flags: '',
    path: '/llms.txt',
    output: head(await docsLlms.index()),
  };
  if (!example) {
    return [llmsTab];
  }
  // `.md` and `Accept: text/markdown` reach the same route, so they print the same lines.
  const markdown = head(await docsLlms.page(example));
  return [
    { id: 'md', label: 'page.md', flags: '', path: `${example.url}.md`, output: markdown },
    llmsTab,
    { id: 'accept', label: 'Accept', flags: '-H "Accept: text/markdown"', path: example.url, output: markdown },
  ];
}

export default async function HomePage() {
  const entries = getCatalog();
  const tracks = getTracksPreview();
  const moons = entries.filter((entry) => entry.lines.length >= 2);
  const example = getExamplePage();
  const tabs = await terminalTabs(example);
  const githubUrl = `https://github.com/${gitConfig.user}/${gitConfig.repo}`;

  return (
    <>
      {/* Next.js keeps the old scroll position for a hash with no target; this one is at the very top (ADR-0033). */}
      <span id={verseFragment.slice(1)} className="verse-target" />
      <HomeHeader
        appName={appName}
        githubUrl={githubUrl}
        hasPackages={entries.some((entry) => entry.kind === 'package')}
        hasProjects={entries.some((entry) => entry.kind === 'project')}
      />
      <ZoomPage>
        <main>
          <Hero
            entries={entries}
            title={{ lead: 'Every package and project,', rest: 'documented to the version.' }}
            subtitle="Guides, APIs and release notes for npm, Composer, PyPI and Go packages, read from each package's own source."
          />

          <section className="planets wrap" id="planets" aria-labelledby="planets-heading">
            <h2 id="planets-heading" className="sr-only">
              Packages and projects
            </h2>
            <PlanetCards entries={entries} />
            <PrivateProjects />
          </section>

          {tracks && (
            <section className="section wrap" aria-labelledby="sides-heading">
              <TwoSides entry={tracks.entry} use={tracks.use} maintain={tracks.maintain} />
            </section>
          )}

          {moons.length > 0 && (
            <section className="section wrap" aria-labelledby="moons-heading">
              <MoonRows entries={moons} />
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
              <div className="anywhere-term">
                <Terminal tabs={tabs} />
                <p className="anywhere-full">
                  Everything in one file: <a href="/llms-full.txt">/llms-full.txt</a>
                </p>
              </div>
              {example && (
                <Reveal className="assist">
                  <h3>Hand any page to your assistant</h3>
                  <p>
                    Every page has these two buttons. Copy it as Markdown, or open it in ChatGPT, Claude, Cursor or
                    Scira with the page already attached. Try them on <b>{example.data.title}</b>.
                  </p>
                  <AssistantActions
                    pageUrl={example.url}
                    markdownUrl={getPageMarkdownUrl(example).url}
                    githubUrl={`${githubUrl}/blob/${gitConfig.branch}/content/${example.path}`}
                  />
                  <Link className="assist-link" href={example.url}>
                    See it on a page
                    <ArrowRight aria-hidden />
                  </Link>
                </Reveal>
              )}
            </div>
          </section>
        </main>
      </ZoomPage>
      <HorizonFooter entries={entries} githubUrl={githubUrl} />
    </>
  );
}
