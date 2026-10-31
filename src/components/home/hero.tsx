'use client';
import { HeroSearch } from './hero-search';
import { OrbitMap, presentRings } from './orbit-map';
import { useHomeSearch } from './search-state';

const ringName: Record<string, string> = {
  npm: 'npm',
  composer: 'Composer',
  pypi: 'PyPI',
  go: 'Go',
  cargo: 'Cargo',
  other: 'Other',
  project: 'Projects',
};

export function Hero({
  title,
  subtitle,
  docsRoute,
  suggestions,
}: {
  title: { lead: string; rest: string };
  subtitle: string;
  docsRoute: string;
  suggestions: string[];
}) {
  const { entries, setText } = useHomeSearch();
  const rings = presentRings(entries);

  return (
    <section className="hero" aria-labelledby="hero-heading">
      <OrbitMap
        onPick={(entry) => {
          setText(entry.title);
          document.querySelector<HTMLInputElement>('.hero-search input')?.focus();
        }}
      />
      <div className="wrap hero-content">
        <h1 id="hero-heading">
          {title.lead} <em>{title.rest}</em>
        </h1>
        <p className="hero-sub">{subtitle}</p>
        <HeroSearch docsRoute={docsRoute} suggestions={suggestions} />
        <noscript>
          <style>{'.hero-search{display:none}'}</style>
          <a className="noscript-link" href={docsRoute}>
            Browse the documentation
          </a>
        </noscript>
        <div className="legend" aria-hidden>
          {rings.map((ring) => (
            <span key={ring}>
              <span className={`dot dot-${ring}`} />
              {ringName[ring]}
            </span>
          ))}
          <span>· moons are versions</span>
        </div>
      </div>
    </section>
  );
}
