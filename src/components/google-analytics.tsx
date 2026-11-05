import Script from 'next/script';
import { consentScript } from '@/lib/privacy-choice';

/** GA4 with Consent Mode v2, loaded directly: no Tag Manager, no `@next/third-parties` (ADR-0041 decision 4). */
export function GoogleAnalytics({ id }: { id: string | undefined }) {
  if (!id) {
    return null;
  }
  return (
    <>
      <Script id="ga-consent" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: consentScript(id) }} />
      <Script id="ga-library" strategy="afterInteractive" src={`https://www.googletagmanager.com/gtag/js?id=${id}`} />
    </>
  );
}
