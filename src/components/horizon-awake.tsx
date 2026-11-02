'use client';
import { useEffect, useRef } from 'react';

/** Lets the Horizon's loops run only while the footer is on screen (ADR-0030 decision 3). */
export function HorizonAwake() {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const footer = ref.current?.closest<HTMLElement>('.horizon');
    if (!footer) {
      return;
    }
    const observer = new IntersectionObserver(([entry]) => {
      footer.toggleAttribute('data-awake', entry.isIntersecting);
    });
    observer.observe(footer);
    return () => {
      observer.disconnect();
      footer.removeAttribute('data-awake');
    };
  }, []);

  return <span ref={ref} hidden />;
}
