'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BookOpen, Wrench } from 'lucide-react';
import { cn } from '@/lib/cn';

export interface TrackSwitchEntry {
  slug: string;
  title: string;
  url: string;
  useUrl?: string;
  maintainUrl?: string;
}

const tracks = [
  { key: 'use', label: 'Use', icon: BookOpen },
  { key: 'maintain', label: 'Maintain', icon: Wrench },
] as const;

/**
 * The package's name and its Use | Maintain switch, at the top of a package's sidebar (ADR-0013).
 */
export function TrackSwitch({ entries, docsRoute }: { entries: TrackSwitchEntry[]; docsRoute: string }) {
  const pathname = usePathname();
  const [slug, track] = pathname.startsWith(`${docsRoute}/`)
    ? pathname.slice(docsRoute.length + 1).split('/')
    : [];
  const entry = entries.find((item) => item.slug === slug);
  if (!entry) {
    return null;
  }

  const urls = { use: entry.useUrl, maintain: entry.maintainUrl };
  const available = tracks.filter((item) => urls[item.key]);

  return (
    <div className="flex flex-col gap-2">
      <Link href={entry.url} className="font-mono text-sm font-medium hover:text-fd-primary">
        {entry.title}
      </Link>
      {available.length > 1 && (
        <nav aria-label="Track" className="grid grid-cols-2 gap-1 rounded-lg border bg-fd-secondary/50 p-1">
          {available.map(({ key, label, icon: Icon }) => {
            const active = track === key;
            return (
              <Link
                key={key}
                href={urls[key] as string}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'flex items-center justify-center gap-1.5 rounded-md px-2 py-1.5 text-sm transition-colors',
                  active
                    ? 'bg-fd-background text-fd-foreground shadow-sm'
                    : 'text-fd-muted-foreground hover:text-fd-foreground',
                )}
              >
                <Icon className="size-3.5" aria-hidden />
                {label}
              </Link>
            );
          })}
        </nav>
      )}
    </div>
  );
}
