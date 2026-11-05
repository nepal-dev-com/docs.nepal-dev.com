import type { Metadata, Viewport } from 'next';
import { RootProvider } from 'fumadocs-ui/provider/next';
import { Bricolage_Grotesque, JetBrains_Mono, Onest } from 'next/font/google';
import './global.css';
import './site.css';
import { GoogleAnalytics } from '@/components/google-analytics';
import { PrivacyBanner } from '@/components/privacy-choices';
import SearchDialog from '@/components/search';
import { Sky } from '@/components/sky';
import { VercelInsights } from '@/components/vercel-insights';
import { cn } from '@/lib/cn';
import { measurementId } from '@/lib/privacy-choice';
import { siteUrl } from '@/lib/seo';
import { appName, community } from '@/lib/shared';

// Fetched at build time and served from the site; one type system on every page (ADR-0015).
const display = Bricolage_Grotesque({ subsets: ['latin'], variable: '--font-home-display', axes: ['opsz'] });
const text = Onest({ subsets: ['latin'], variable: '--font-home-text' });
const data = JetBrains_Mono({ subsets: ['latin'], variable: '--font-home-data' });

// ADR-0035 decision 9. Without an address every page is noindex, and Next.js falls back to localhost.
export const metadata: Metadata = {
  ...(siteUrl ? { metadataBase: siteUrl } : {}),
  applicationName: appName,
  authors: [{ name: community.name, url: community.url }],
  creator: community.name,
  publisher: community.name,
};

// Vercel sets VERCEL at build; elsewhere the insight scripts would answer 404 (ADR-0041 decision 2).
const onVercel = Boolean(process.env.VERCEL);

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: dark)', color: '#0a0c10' },
    { media: '(prefers-color-scheme: light)', color: '#f6f7f9' },
  ],
};

export default function Layout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="en" className={cn(display.variable, text.variable, data.variable)} suppressHydrationWarning>
      <body className="flex flex-col min-h-screen">
        <Sky />
        <RootProvider search={{ SearchDialog }} theme={{ defaultTheme: 'dark' }}>
          {children}
        </RootProvider>
        {measurementId && <PrivacyBanner />}
        <GoogleAnalytics id={measurementId} />
        {onVercel && <VercelInsights />}
      </body>
    </html>
  );
}
