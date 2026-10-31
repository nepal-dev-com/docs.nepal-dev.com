'use client';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { BookOpen, ChevronDown, Wrench } from 'lucide-react';
import type { TrackPreview } from '@/lib/catalog';

const tracks = [
  { key: 'use', label: 'Use', icon: BookOpen, points: ['Install and get started', 'Guides and the API for the version you run', 'A live demo where the package has one'] },
  { key: 'maintain', label: 'Maintain', icon: Wrench, points: ['Architecture and local setup', 'Tests and the release process', 'How to contribute, and the decisions behind the code'] },
] as const;

type TrackKey = (typeof tracks)[number]['key'];

export function TracksPreview({ title, use, maintain }: { title: string; use: TrackPreview; maintain: TrackPreview }) {
  const [track, setTrack] = useState<TrackKey>('use');
  const [shown, setShown] = useState<TrackKey>('use');
  const [fading, setFading] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const preview = shown === 'use' ? use : maintain;
  const current = tracks.find((item) => item.key === track) ?? tracks[0];

  useEffect(() => () => clearTimeout(timer.current), []);

  function choose(next: TrackKey) {
    setTrack(next);
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setShown(next);
      return;
    }
    setFading(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      setShown(next);
      setFading(false);
    }, 240);
  }

  return (
    <div className="tracks">
      <div>
        <div className="section-head flush">
          <h2 id="tracks-heading">Two tracks, one place</h2>
        </div>
        <p className="lede">
          Every package and project has a Use track for the people building with it, and a Maintain track for the
          people who look after it.
        </p>
        <div className={track === 'maintain' ? 'segmented right' : 'segmented'} role="tablist" aria-label="Track">
          {tracks.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={track === key}
              aria-controls="tracks-window"
              onClick={() => choose(key)}
            >
              <Icon aria-hidden />
              {label}
            </button>
          ))}
          <span className="knob" aria-hidden />
        </div>
        <ul className="points">
          {current.points.map((point) => (
            <li key={point}>{point}</li>
          ))}
        </ul>
      </div>
      <div className="window" id="tracks-window" role="tabpanel">
        <div className="chrome">
          <i />
          <i />
          <i />
          <span>{preview.url}</span>
        </div>
        <div className={fading ? 'doc fading' : 'doc'}>
          <div className="doc-side">
            <span className="doc-version">
              {title} · {preview.label}
              <ChevronDown aria-hidden />
            </span>
            {preview.pages.map((page) => (
              <Link key={page.url} href={page.url} className={page.url === preview.url ? 'on' : undefined}>
                {page.title}
              </Link>
            ))}
          </div>
          <div className="doc-body">
            <p className="doc-title">{preview.current.title}</p>
            {preview.current.description && <p>{preview.current.description}</p>}
            <Link href={preview.url} className="doc-open">
              Open this page
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
