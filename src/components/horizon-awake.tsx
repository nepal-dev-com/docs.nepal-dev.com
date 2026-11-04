'use client';
import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { crossedBodies, horizonVars, moonAge, moonDisc, moonShadePath } from '@/lib/horizon-time';

/** The summit in view, with enough of it showing to see the flag go up (ADR-0037 decision 5). */
const arrival = 0.4;

const minute = 60000;
/** Half of the second a crossing takes: out on one side, then in on the other (ADR-0040 decision 4). */
const halfCrossing = 500;

/**
 * Lets the Horizon's loops run only while the footer is on screen (ADR-0030 decision 3), raises the flag
 * once per page view when the reader arrives, and keeps the sun and moon to the reader's clock (ADR-0040).
 * It lowers the flag only while it is out of sight: a page whose summit shows at load keeps it raised, and
 * without scripts it never moves. The clock is only read here to draw: nothing is sent or stored.
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

    let shown: Record<string, string> | undefined;
    let ticking: ReturnType<typeof setInterval> | undefined;
    let crossing: ReturnType<typeof setTimeout> | undefined;

    const draw = (vars: Record<string, string>, now: Date) => {
      for (const [name, value] of Object.entries(vars)) {
        footer.style.setProperty(name, value);
      }
      footer.querySelector('.horizon-moon-shade')?.setAttribute('d', moonShadePath(moonAge(now), moonDisc));
      shown = vars;
    };

    const keepTime = () => {
      const now = new Date();
      const vars = horizonVars(now);
      const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const crossed = shown && !still ? crossedBodies(shown, vars) : [];
      if (crossed.length > 0 && !crossing) {
        footer.setAttribute('data-crossing', crossed.join(' '));
        crossing = setTimeout(() => {
          draw(vars, now);
          footer.removeAttribute('data-crossing');
          crossing = undefined;
        }, halfCrossing);
        return;
      }
      if (!crossing) {
        draw(vars, now);
      }
    };

    const onVisibility = () => {
      if (!document.hidden) {
        keepTime();
      }
    };

    const awake = new IntersectionObserver(([entry]) => {
      footer.toggleAttribute('data-awake', entry.isIntersecting);
      clearInterval(ticking);
      if (entry.isIntersecting) {
        keepTime();
        ticking = setInterval(keepTime, minute);
      }
    });
    awake.observe(footer);

    keepTime();
    document.addEventListener('visibilitychange', onVisibility);

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
      clearInterval(ticking);
      clearTimeout(crossing);
      document.removeEventListener('visibilitychange', onVisibility);
      footer.removeAttribute('data-awake');
      footer.removeAttribute('data-crossing');
    };
  }, [pathname]);

  return <span ref={ref} hidden />;
}
