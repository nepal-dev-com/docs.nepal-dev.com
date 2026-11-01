'use client';
import { useCallback, useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { Reveal } from './reveal';

export interface TerminalTab {
  id: string;
  label: string;
  // Placed between `curl -s` and the URL, such as a header flag.
  flags: string;
  path: string;
  output: string;
}

const commandFor = (tab: TerminalTab, origin: string) =>
  `curl -s ${tab.flags ? `${tab.flags} ` : ''}${origin}${tab.path} | head -6`;

/**
 * Real `curl` commands against this site, one per tab, each with its route's real first lines,
 * taken at build time (ADR-0016 decision 7). A tab types its command the first time it is shown.
 */
export function Terminal({ tabs }: { tabs: TerminalTab[] }) {
  const [origin, setOrigin] = useState('');
  const [current, setCurrent] = useState(0);
  const [typed, setTyped] = useState<string | null>(null);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const played = useRef(new Set<string>());
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const tab = tabs[current];

  useEffect(() => {
    setOrigin(location.origin);
    const pending = timers.current;
    return () => pending.forEach(clearTimeout);
  }, []);

  const play = useCallback(
    (index: number) => {
      const target = tabs[index];
      timers.current.forEach(clearTimeout);
      timers.current = [];
      setTyped(null);
      if (played.current.has(target.id) || matchMedia('(prefers-reduced-motion: reduce)').matches) {
        return;
      }
      played.current.add(target.id);
      const full = commandFor(target, location.origin);
      for (let index = 0; index <= full.length; index += 1) {
        timers.current.push(setTimeout(() => setTyped(full.slice(0, index)), 200 + index * 22));
      }
      timers.current.push(setTimeout(() => setTyped(null), 200 + full.length * 22 + 320));
    },
    [tabs],
  );

  const onReveal = useCallback(() => play(0), [play]);

  function select(index: number) {
    if (index === current) {
      return;
    }
    setCurrent(index);
    play(index);
  }

  function onKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    const step = event.key === 'ArrowRight' ? 1 : event.key === 'ArrowLeft' ? -1 : 0;
    if (step === 0) {
      return;
    }
    event.preventDefault();
    const next = (current + step + tabs.length) % tabs.length;
    select(next);
    tabRefs.current[next]?.focus();
  }

  const typing = typed !== null;

  return (
    <Reveal className="window" onReveal={onReveal}>
      <div className="chrome">
        <i />
        <i />
        <i />
        <div className="term-tabs" role="tablist" aria-label="Ways to read a page outside the site">
          {tabs.map((item, index) => (
            <button
              key={item.id}
              ref={(element) => {
                tabRefs.current[index] = element;
              }}
              type="button"
              role="tab"
              id={`term-tab-${item.id}`}
              aria-selected={index === current}
              aria-controls="term-panel"
              tabIndex={index === current ? 0 : -1}
              onClick={() => select(index)}
              onKeyDown={onKeyDown}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>
      <pre className="terminal" id="term-panel" role="tabpanel" aria-labelledby={`term-tab-${tab.id}`}>
        <span className="prompt">$ </span>
        <span className="command">{typing ? typed : commandFor(tab, origin)}</span>
        {'\n'}
        {!typing && tab.output}
        {!typing && (
          <>
            {'\n'}
            <span className="prompt">$ </span>
          </>
        )}
        <span className="cursor" aria-hidden />
      </pre>
    </Reveal>
  );
}
