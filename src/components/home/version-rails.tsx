'use client';
import type { CatalogEntry } from '@/lib/catalog';
import { Reveal } from './reveal';

function Rail({ entry }: { entry: CatalogEntry }) {
  const released = entry.lines.filter((line) => line.channel !== 'dev').reverse();
  const dev = entry.dev;
  const points = [...released, ...(dev ? [dev] : [])];
  const step = 1000 / points.length;
  const x = (index: number) => step / 2 + index * step;
  const lastReleased = released.length > 0 ? x(released.length - 1) : x(0);
  const label = points.map((line) => `${line.channel === 'dev' ? 'dev ' : ''}${line.version}`).join(', ');

  return (
    <Reveal className="rail">
      <span className="rail-name">{entry.title}</span>
      <svg viewBox="0 0 1000 56" preserveAspectRatio="none" role="img" aria-label={`${entry.title}: ${label}`}>
        {released.length > 1 && (
          <>
            <line className="rail-base" x1={x(0)} y1="20" x2={lastReleased} y2="20" />
            <line className="rail-grow" x1={x(0)} y1="20" x2={lastReleased} y2="20" />
          </>
        )}
        {dev && released.length > 0 && (
          <line className="rail-dev" x1={lastReleased} y1="20" x2={x(points.length - 1)} y2="20" />
        )}
        {points.map((line, index) => {
          const latest = line.channel === 'latest';
          const unreleased = line.channel === 'dev';
          return (
            <g key={line.segment}>
              <circle
                cx={x(index)}
                cy="20"
                r={latest ? 7 : 5}
                className={latest ? 'node latest' : unreleased ? 'node dev' : 'node'}
              />
              <text x={x(index)} y="48" textAnchor="middle" className={latest ? 'strong' : undefined}>
                {unreleased ? `dev · ${line.version}` : `${line.name} · ${line.version}${latest ? ' latest' : ''}`}
              </text>
            </g>
          );
        })}
      </svg>
    </Reveal>
  );
}

export function VersionRails({ entries }: { entries: CatalogEntry[] }) {
  return (
    <div className="rails">
      {entries.map((entry) => (
        <Rail key={entry.slug} entry={entry} />
      ))}
    </div>
  );
}
