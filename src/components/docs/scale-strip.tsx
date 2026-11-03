import type { CSSProperties } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, Moon, Sun } from 'lucide-react';
import type { CatalogEntry } from '@/lib/catalog';
import { ringOf } from '@/lib/rings';
import { parentLevel, type Level } from '@/lib/scale-strip';
import { zoomOut } from '@/lib/zoom';
import { MoonPhase, PlanetMark } from '@/components/planet';
import { VerseMark } from '@/components/verse-mark';

function LevelMark({ level, entry }: { level: Level; entry?: CatalogEntry }) {
  switch (level.kind) {
    case 'verse':
      return <VerseMark className="scale-mark" />;
    case 'system':
      return (
        <svg className="scale-mark" viewBox="-8 -8 16 16" aria-hidden>
          <circle r="3.4" fill="var(--home-star)" />
        </svg>
      );
    case 'planet':
      return entry ? <PlanetMark ring={ringOf(entry)} kind={entry.kind} /> : null;
    case 'side':
      return level.track === 'use' ? <Sun className="scale-mark" aria-hidden /> : <Moon className="scale-mark" aria-hidden />;
    case 'orbit':
      return (
        <svg className="scale-mark" viewBox="-8 -8 16 16" aria-hidden>
          <circle r="5.2" fill="none" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      );
    default:
      return null;
  }
}

function LevelLabel({ level, entry }: { level: Level; entry?: CatalogEntry }) {
  return (
    <>
      <LevelMark level={level} entry={entry} />
      <span>{level.name}</span>
      {level.line && (
        <span className="scale-line">
          <MoonPhase channel={level.line.channel} />
          {level.line.name}
        </span>
      )}
    </>
  );
}

/**
 * The scale strip above every docs page: each level of the ladder from the Verse down to the page,
 * with its mark; going up a level zooms out (ADR-0029 decisions 4 and 6). On phones only the
 * parent level and the page show.
 */
export function ScaleStrip({ levels, entry }: { levels: Level[]; entry?: CatalogEntry }) {
  const parent = parentLevel(levels);
  const ring = entry ? ringOf(entry) : undefined;
  return (
    <nav
      aria-label="Scale"
      className="scale-strip not-prose"
      style={ring ? ({ '--eco': `var(--home-${ring})` } as CSSProperties) : undefined}
    >
      <ol>
        {levels.map((level, index) => (
          <li
            key={`${level.kind}-${index}`}
            data-kind={level.kind}
            data-parent={level === parent ? '' : undefined}
            aria-current={level.current ? 'page' : undefined}
          >
            {index > 0 && <ChevronRight className="scale-sep" aria-hidden />}
            {level.url && !level.current ? (
              <Link href={level.url} transitionTypes={[zoomOut]}>
                <ChevronLeft className="scale-back" aria-hidden />
                <LevelLabel level={level} entry={entry} />
              </Link>
            ) : (
              <span className="scale-here">
                <LevelLabel level={level} entry={entry} />
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
