'use client';
import { useEffect, useRef, useState, type ElementType, type ReactNode } from 'react';

/**
 * Lets its content rise into place once, the first time it scrolls into view. Content stays
 * visible without scripts and under reduced motion (styles in home.css).
 */
export function Reveal({
  as: Tag = 'div',
  className,
  children,
  onReveal,
}: {
  as?: ElementType;
  className?: string;
  children: ReactNode;
  onReveal?: () => void;
}) {
  const ref = useRef<HTMLElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) {
      return;
    }
    const observer = new IntersectionObserver(
      ([item]) => {
        if (item.isIntersecting) {
          setShown(true);
          onReveal?.();
          observer.disconnect();
        }
      },
      { threshold: 0.2 },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [onReveal]);

  return (
    <Tag ref={ref} className={[className, 'reveal', shown ? 'in' : ''].filter(Boolean).join(' ')}>
      {children}
    </Tag>
  );
}
