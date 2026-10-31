'use client';
import { useEffect, useId, useMemo, useRef, useState, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { Search, X } from 'lucide-react';
import type { CatalogEntry } from '@/lib/catalog';
import { searchClient, searchIndexName } from '@/lib/algolia';
import { parseScope, scopeTag } from '@/lib/search-scope';
import { chipLabel, chipWords, isEcosystemChip, terms, useHomeSearch, type Chip } from './search-state';
import { ringOf } from './orbit-map';

interface Result {
  title: string;
  url: string;
  entry?: CatalogEntry;
  tag: { text: string; kind: 'line' | 'next' | 'maintain' | 'plain' };
}

type Status = 'idle' | 'loading' | 'ready' | 'error';

const maxResults = 7;

function tagFor(url: string, entries: CatalogEntry[], docsRoute: string): Result['tag'] {
  const { slug, track, line } = parseScope(url, docsRoute);
  const entry = entries.find((item) => item.slug === slug);
  if (!entry) {
    return { text: slug === 'documentation' ? 'Documentation' : 'Site', kind: 'plain' };
  }
  if (track === 'maintain') {
    return { text: 'maintain', kind: 'maintain' };
  }
  const found = entry.lines.find((item) => item.name === line);
  if (found?.channel === 'next') {
    return { text: `next ${found.version}`, kind: 'next' };
  }
  if (found) {
    return { text: `${found.name} · ${found.version}`, kind: 'line' };
  }
  return { text: track ?? entry.kind, kind: 'plain' };
}

/**
 * The Algolia filter for the chips: an OR over the scope tags they allow, or null when they
 * allow nothing (for example `maintain` with `next`).
 */
export function chipFilter(chips: Chip[], entries: CatalogEntry[]): string | undefined | null {
  if (chips.length === 0) {
    return undefined;
  }
  const kinds: Chip[] = chips.filter((chip) => isEcosystemChip(chip) || chip === 'project');
  const wantsMaintain = chips.includes('maintain');
  const wantsNext = chips.includes('next');
  if (wantsMaintain && wantsNext) {
    return null;
  }

  const tags = entries
    .filter((entry) => kinds.length === 0 || kinds.includes(ringOf(entry) as Chip))
    .flatMap((entry) => {
      if (wantsNext) {
        return entry.next ? [scopeTag(entry.slug, 'use', entry.next.name)] : [];
      }
      if (wantsMaintain) {
        return [scopeTag(entry.slug, 'maintain')];
      }
      return [
        scopeTag(entry.slug),
        scopeTag(entry.slug, 'use'),
        scopeTag(entry.slug, 'maintain'),
        ...entry.lines.map((line) => scopeTag(entry.slug, 'use', line.name)),
      ];
    });

  return tags.length > 0 ? tags.map((tag) => `tag:"${tag}"`).join(' OR ') : null;
}

function highlight(text: string, words: string[]): ReactNode {
  const word = words.find((item) => text.toLowerCase().includes(item));
  if (!word) {
    return text;
  }
  const start = text.toLowerCase().indexOf(word);
  return (
    <>
      {text.slice(0, start)}
      <mark>{text.slice(start, start + word.length)}</mark>
      {text.slice(start + word.length)}
    </>
  );
}

const demoQueries = ['install', 'getting started', 'releasing', 'configuration'];

export function HeroSearch({ docsRoute, suggestions }: { docsRoute: string; suggestions: string[] }) {
  const { entries, chips, text, setText, setDemoText, addChip, removeChip, active, matches } = useHomeSearch();
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const listId = useId();
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(0);
  const [status, setStatus] = useState<Status>('idle');
  const [hits, setHits] = useState<Result[]>([]);
  const [placeholder, setPlaceholder] = useState('Search packages, projects and pages');
  const [demo, setDemo] = useState(true);

  const filter = useMemo(() => chipFilter(chips, entries), [chips, entries]);
  const matching = entries.filter(matches);

  const starters: Result[] = useMemo(
    () =>
      entries
        .filter((entry) => entry.useUrl)
        .slice(0, maxResults)
        .map((entry) => ({
          title: entry.latest || entry.next ? 'Start here' : 'Overview',
          url: entry.useUrl as string,
          entry,
          tag: tagFor(entry.useUrl as string, entries, docsRoute),
        })),
    [entries, docsRoute],
  );

  useEffect(() => {
    if (!active) {
      setStatus('idle');
      setHits([]);
      return;
    }
    if (filter === null) {
      setStatus('ready');
      setHits([]);
      return;
    }
    setStatus('loading');
    let cancelled = false;
    const timer = setTimeout(async () => {
      try {
        const response = await searchClient.searchForHits<{ title: string; url: string }>({
          requests: [{ indexName: searchIndexName, query: text, hitsPerPage: 30, filters: filter }],
        });
        if (cancelled) {
          return;
        }
        const seen = new Set<string>();
        const results: Result[] = [];
        for (const hit of response.results[0]?.hits ?? []) {
          if (seen.has(hit.url) || results.length >= maxResults) {
            continue;
          }
          seen.add(hit.url);
          const { slug } = parseScope(hit.url, docsRoute);
          results.push({
            title: hit.title,
            url: hit.url,
            entry: entries.find((entry) => entry.slug === slug),
            tag: tagFor(hit.url, entries, docsRoute),
          });
        }
        setHits(results);
        setStatus('ready');
      } catch {
        if (!cancelled) {
          setHits([]);
          setStatus('error');
        }
      }
    }, 150);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [active, text, filter, entries, docsRoute]);

  // The idle demonstration types real queries until the reader takes the field.
  useEffect(() => {
    if (!demo || matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }
    const queries = [...entries.slice(0, 3).map((entry) => `${entry.title} ${demoQueries[0]}`), ...demoQueries.slice(1)];
    let query = 0;
    let length = 0;
    let deleting = false;
    let timer: ReturnType<typeof setTimeout>;
    const tick = () => {
      const current = queries[query % queries.length];
      const shown = current.slice(0, length);
      setPlaceholder(shown);
      setDemoText(shown);
      if (!deleting && length < current.length) {
        length += 1;
        timer = setTimeout(tick, 75);
      } else if (!deleting) {
        deleting = true;
        timer = setTimeout(tick, 1600);
      } else if (length > 0) {
        length -= 1;
        timer = setTimeout(tick, 28);
      } else {
        deleting = false;
        query += 1;
        timer = setTimeout(tick, 400);
      }
    };
    timer = setTimeout(tick, 1000);
    return () => {
      clearTimeout(timer);
      setDemoText('');
      setPlaceholder('Search packages, projects and pages');
    };
  }, [demo, entries, setDemoText]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const typing = /^(input|textarea|select)$/i.test((event.target as HTMLElement | null)?.tagName ?? '');
      const command = (event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k';
      if (command || (event.key === '/' && !typing)) {
        // Marks the event handled, so the site-wide search dialog stays closed on this page.
        event.preventDefault();
        inputRef.current?.focus();
        inputRef.current?.scrollIntoView({ block: 'center', behavior: 'smooth' });
      }
    };
    const onClick = (event: MouseEvent) => {
      if (!boxRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    addEventListener('keydown', onKey, { capture: true });
    document.addEventListener('click', onClick);
    return () => {
      removeEventListener('keydown', onKey, { capture: true });
      document.removeEventListener('click', onClick);
    };
  }, []);

  const shown = active ? hits : starters;
  const words = terms(text);

  function onInput(value: string) {
    const match = value.match(/(^|\s)([a-z]+)\s$/i);
    const chip = match ? chipWords[match[2].toLowerCase()] : undefined;
    if (match && chip) {
      addChip(chip);
      value = value.slice(0, (match.index ?? 0) + match[1].length);
    }
    setText(value);
    setSelected(0);
    setOpen(true);
  }

  function go(result: Result | undefined) {
    if (result) {
      router.push(result.url);
    }
  }

  let body: ReactNode;
  if (status === 'error') {
    body = <p className="results-note">Page search is unavailable right now. The catalogue below still filters.</p>;
  } else if (active && status === 'ready' && shown.length === 0) {
    body = <p className="results-note">No page matches. Try a package name, or remove a filter.</p>;
  } else if (!active && shown.length === 0) {
    body = <p className="results-note">Nothing is documented yet. Type to search this site&apos;s own pages.</p>;
  } else {
    body = (
      <>
        <p className="results-group">{active ? 'Pages' : 'Start with a package'}</p>
        {shown.map((result, index) => (
          <div
            key={result.url}
            id={`${listId}-${index}`}
            role="option"
            aria-selected={index === selected}
            className="result"
            onMouseEnter={() => setSelected(index)}
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => go(result)}
          >
            <span className={`dot ${result.entry ? `dot-${ringOf(result.entry)}` : 'dot-site'}`} aria-hidden />
            <span>
              <span className="result-title">{highlight(result.title, words)}</span>
              {result.entry && <span className="result-package"> · {highlight(result.entry.title, words)}</span>}
            </span>
            <span className={`tag ${result.tag.kind === 'next' ? 'next' : ''} ${result.tag.kind === 'maintain' ? 'accent' : ''}`}>
              {result.tag.text}
            </span>
          </div>
        ))}
      </>
    );
  }

  return (
    <div className={open ? 'hero-search open' : 'hero-search'} ref={boxRef}>
      <div className="bar" onClick={() => inputRef.current?.focus()}>
        <Search className="bar-icon" aria-hidden />
        {chips.map((chip) => (
          <span key={chip} className="chip">
            {chip !== 'maintain' && chip !== 'next' && <span className={`dot dot-${chip}`} aria-hidden />}
            {chipLabel(chip)}
            <button
              type="button"
              aria-label={`Remove filter ${chipLabel(chip)}`}
              onClick={(event) => {
                event.stopPropagation();
                removeChip(chip);
                inputRef.current?.focus();
              }}
            >
              <X aria-hidden />
            </button>
          </span>
        ))}
        <input
          ref={inputRef}
          type="search"
          role="combobox"
          autoComplete="off"
          spellCheck={false}
          value={text}
          placeholder={placeholder}
          aria-label="Search all documentation. Type npm, composer, pypi, go, projects, maintain or next and a space to filter."
          aria-expanded={open}
          aria-controls={listId}
          aria-activedescendant={open && shown.length > 0 ? `${listId}-${selected}` : undefined}
          onFocus={() => {
            setDemo(false);
            setOpen(true);
          }}
          onChange={(event) => onInput(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Backspace' && text === '' && chips.length > 0) {
              removeChip(chips[chips.length - 1]);
            } else if (event.key === 'ArrowDown') {
              event.preventDefault();
              setSelected((index) => Math.min(index + 1, Math.max(shown.length - 1, 0)));
            } else if (event.key === 'ArrowUp') {
              event.preventDefault();
              setSelected((index) => Math.max(index - 1, 0));
            } else if (event.key === 'Enter') {
              event.preventDefault();
              go(shown[selected]);
            } else if (event.key === 'Escape') {
              setOpen(false);
              inputRef.current?.blur();
            }
          }}
        />
        <span className="keys" aria-hidden>
          <kbd>⌘</kbd>
          <kbd>K</kbd>
        </span>
      </div>

      <div className="results" id={listId} role="listbox" aria-label="Search results" aria-busy={status === 'loading'}>
        {body}
        <div className="results-foot">
          <span>↑↓ move</span>
          <span>↵ open</span>
          <span>esc close</span>
          <a href="#browse" onClick={() => setOpen(false)}>
            {matching.length} in the catalogue ↓
          </a>
        </div>
      </div>

      {suggestions.length > 0 && (
        <div className="try">
          <span>Try</span>
          {suggestions.map((word) => (
            <button
              key={word}
              type="button"
              onClick={() => {
                const chip = chipWords[word];
                if (chip) {
                  addChip(chip);
                } else {
                  setText(word);
                }
                setOpen(true);
                inputRef.current?.focus();
              }}
            >
              {word}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
