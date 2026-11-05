'use client';
import { useEffect, useRef, useState } from 'react';
import {
  type Choice,
  type Consent,
  choiceLine,
  expiredCookies,
  parseChoice,
  reopenEvent,
  shouldAsk,
  storageKey,
} from '@/lib/privacy-choice';

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
  interface Navigator {
    globalPrivacyControl?: boolean;
  }
}

function readChoice(): Choice | undefined {
  try {
    return parseChoice(localStorage.getItem(storageKey), new Date());
  } catch {
    return undefined;
  }
}

function saveChoice(choice: Choice) {
  try {
    localStorage.setItem(storageKey, JSON.stringify(choice));
  } catch {
    // Storage is blocked: the answer holds for this page only (ADR-0041 decision 7).
  }
}

/** The banner that asks about Google Analytics cookies (ADR-0041 decisions 5 to 8). */
export function PrivacyBanner() {
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState<Choice>();
  const firstButton = useRef<HTMLButtonElement>(null);
  const reopened = useRef(false);

  useEffect(() => {
    if (shouldAsk(readChoice(), navigator.globalPrivacyControl === true)) {
      setOpen(true);
    }
    const reopen = () => {
      reopened.current = true;
      setCurrent(readChoice());
      setOpen(true);
    };
    addEventListener(reopenEvent, reopen);
    return () => removeEventListener(reopenEvent, reopen);
  }, []);

  useEffect(() => {
    // Only a reader who asked for the banner gets focus moved to it; a first visit's banner never takes it.
    if (open && reopened.current) {
      firstButton.current?.focus();
      reopened.current = false;
    }
  }, [open]);

  if (!open) {
    return null;
  }

  const choose = (analytics: Consent) => {
    saveChoice({ analytics, at: new Date().toISOString() });
    window.gtag?.('consent', 'update', { analytics_storage: analytics });
    if (analytics === 'denied') {
      for (const cookie of expiredCookies(document.cookie, location.hostname)) {
        document.cookie = cookie;
      }
    }
    setOpen(false);
  };

  const line = choiceLine(current);
  return (
    <section className="privacy-banner" aria-labelledby="privacy-banner-title">
      <h2 id="privacy-banner-title">Privacy choices</h2>
      {line && <p className="privacy-banner-current">{line}</p>}
      <p>
        Allow Google Analytics cookies? They help us see which pages are read. Vercel counts visits without cookies
        either way.
      </p>
      <div className="privacy-banner-actions">
        <button ref={firstButton} type="button" onClick={() => choose('granted')}>
          Allow
        </button>
        <button type="button" onClick={() => choose('denied')}>
          Decline
        </button>
      </div>
    </section>
  );
}

/** Reopens the banner from the footer (ADR-0041 decision 9). Hidden until scripts run, since it does nothing without them. */
export function PrivacyChoicesButton() {
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);
  return (
    <button type="button" hidden={!ready} onClick={() => dispatchEvent(new Event(reopenEvent))}>
      Privacy choices
    </button>
  );
}
