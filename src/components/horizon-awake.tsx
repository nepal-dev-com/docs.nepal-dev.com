'use client';
import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

/** The summit in view, with enough of it showing to see the flag go up (ADR-0037 decision 5). */
const arrival = 0.4;

/**
 * Lets the Horizon's loops run only while the footer is on screen (ADR-0030 decision 3), and raises the
 * flag once per page view when the reader arrives. It lowers the flag only while it is out of sight: a
 * page whose summit shows at load keeps it raised, and without scripts it never moves.
 */
export function HorizonAwake() {
  const ref = useRef<HTMLSpanElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    const footer = ref.current?.closest<HTMLElement>('.horizon');
    const scene = footer?.querySelector('.horizon-scene');
    if (!footer || !scene) {
      return;
    }
    const awake = new IntersectionObserver(([entry]) => {
      footer.toggleAttribute('data-awake', entry.isIntersecting);
    });
    awake.observe(footer);

    footer.removeAttribute('data-summit');
    footer.removeAttribute('data-lowered');
    let first = true;
    const summit = new IntersectionObserver(
      ([entry]) => {
        if (entry.intersectionRatio >= arrival) {
          footer.toggleAttribute('data-summit', !first);
          summit.disconnect();
        } else if (first) {
          footer.toggleAttribute('data-lowered', true);
        }
        first = false;
      },
      { threshold: [0, arrival] },
    );
    summit.observe(scene);

    return () => {
      awake.disconnect();
      summit.disconnect();
      footer.removeAttribute('data-awake');
    };
  }, [pathname]);

  return <span ref={ref} hidden />;
}
