import type { CatalogEntry } from '@/lib/catalog';
import { owner } from '@/lib/shared';
import { OrbitMap } from './orbit-map';
import { SearchButton } from './search-button';

function Legend() {
  return (
    <div className="legend" aria-hidden>
      <span>
        <svg viewBox="-7 -7 14 14">
          <circle r="4.5" fill="var(--home-npm)" />
        </svg>
        package
      </span>
      <span>
        <svg viewBox="-7 -7 14 14">
          <ellipse rx="6.8" ry="2.4" transform="rotate(-18)" fill="none" stroke="var(--home-project)" strokeWidth="1.2" />
          <circle r="3.6" fill="var(--home-bg)" stroke="var(--home-project)" strokeWidth="1.4" />
        </svg>
        project
      </span>
      <span>
        <svg viewBox="-7 -7 14 14">
          <circle r="2.6" fill="var(--home-muted)" />
        </svg>
        moon = version
      </span>
      <span>
        <svg viewBox="-7 -7 14 14">
          <circle r="5" fill="none" stroke="var(--home-muted)" strokeDasharray="2 2" />
        </svg>
        dashed = unreleased
      </span>
    </div>
  );
}

export function Hero({
  entries,
  title,
  subtitle,
}: {
  entries: CatalogEntry[];
  title: { lead: string; rest: string };
  subtitle: string;
}) {
  return (
    <section className="hero" aria-labelledby="hero-heading">
      <OrbitMap entries={entries} star={owner.name} />
      <div className="wrap hero-content">
        <h1 id="hero-heading">
          {title.lead} <em>{title.rest}</em>
        </h1>
        <p className="hero-sub">{subtitle}</p>
        <SearchButton />
        <noscript>
          <style>{'.hero-search{display:none}'}</style>
          <a className="noscript-link" href="#planets">
            See every package and project
          </a>
        </noscript>
        <Legend />
      </div>
    </section>
  );
}
