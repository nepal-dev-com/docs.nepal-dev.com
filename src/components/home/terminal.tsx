'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Reveal } from './reveal';

/**
 * Types a real `curl` of this site's llms.txt once, when it scrolls into view.
 */
export function Terminal({ output }: { output: string }) {
  const [origin, setOrigin] = useState('');
  const [typed, setTyped] = useState<string | null>(null);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const command = `curl -s ${origin}/llms.txt | head -6`;

  useEffect(() => {
    setOrigin(location.origin);
    return () => timers.current.forEach(clearTimeout);
  }, []);

  const play = useCallback(() => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }
    const full = `curl -s ${location.origin}/llms.txt | head -6`;
    for (let index = 0; index <= full.length; index += 1) {
      timers.current.push(setTimeout(() => setTyped(full.slice(0, index)), 300 + index * 28));
    }
    timers.current.push(setTimeout(() => setTyped(null), 300 + full.length * 28 + 380));
  }, []);

  const typing = typed !== null;

  return (
    <Reveal className="window" onReveal={play}>
      <div className="chrome">
        <i />
        <i />
        <i />
        <span>terminal</span>
      </div>
      <pre className="terminal" aria-label="Terminal example: fetching llms.txt">
        <span className="prompt">$ </span>
        <span className="command">{typing ? typed : command}</span>
        {'\n'}
        {!typing && output}
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
