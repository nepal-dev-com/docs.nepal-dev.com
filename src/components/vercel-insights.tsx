'use client';
import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { withoutQuery } from '@/lib/privacy-choice';

/** Vercel Web Analytics and Speed Insights, cookieless, with no query string kept (ADR-0041 decisions 2 and 3). */
export function VercelInsights() {
  return (
    <>
      <Analytics beforeSend={(event) => ({ ...event, url: withoutQuery(event.url) })} />
      <SpeedInsights beforeSend={(event) => ({ ...event, url: withoutQuery(event.url) })} />
    </>
  );
}
