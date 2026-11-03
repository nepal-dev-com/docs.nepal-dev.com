import Link from 'next/link';
import type { CatalogEntry, TrackPreview } from '@/lib/catalog';
import { ringOf } from '@/lib/rings';
import { ringColor } from '@/components/planet';

function Side({
  side,
  title,
  text,
  preview,
}: {
  side: 'day' | 'night';
  title: string;
  text: string;
  preview: TrackPreview;
}) {
  return (
    <div className={`side side-${side}`}>
      <h3>
        {side === 'day' ? (
          <svg viewBox="0 0 24 24" aria-hidden>
            <circle cx="12" cy="12" r="4.2" fill="currentColor" />
            <path
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              d="M12 2.5v2.3M12 19.2v2.3M2.5 12h2.3M19.2 12h2.3M5.3 5.3l1.6 1.6M17.1 17.1l1.6 1.6M5.3 18.7l1.6-1.6M17.1 6.9l1.6-1.6"
            />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" aria-hidden>
            <path fill="currentColor" d="M20 14.6A8.5 8.5 0 1 1 9.4 4a7 7 0 0 0 10.6 10.6Z" />
          </svg>
        )}
        {title}
        <span>{preview.label}</span>
      </h3>
      <p>{text}</p>
      <ul>
        {preview.pages.map((page) => (
          <li key={page.url}>
            <Link href={page.url}>{page.title}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

/**
 * Use as a planet's day side and Maintain as its night side, with real pages of one entry
 * (ADR-0017 decision 5).
 */
export function TwoSides({ entry, use, maintain }: { entry: CatalogEntry; use: TrackPreview; maintain: TrackPreview }) {
  return (
    <>
      <div className="section-head">
        <h2 id="sides-heading">Two sides of every planet</h2>
        <p>
          The day side is for the people using it. The night side is for the people looking after it. Same planet,
          same place: here, {entry.title}.
        </p>
      </div>
      <div className="sides">
        <Side side="day" title="Use" text="Install, guides and the API, one set of pages per version." preview={use} />
        <div className="terminator" aria-hidden>
          <svg viewBox="-50 -50 100 100">
            <circle r="34" fill="var(--home-night)" stroke="var(--home-line-2)" />
            <path d="M0-34a34 34 0 0 0 0 68Z" fill={ringColor(ringOf(entry))} />
            <ellipse rx="47" ry="13" transform="rotate(-18)" fill="none" stroke="var(--home-line-2)" />
          </svg>
        </div>
        <Side
          side="night"
          title="Maintain"
          text="Architecture, releasing and the decisions behind the code. Not versioned."
          preview={maintain}
        />
      </div>
    </>
  );
}
