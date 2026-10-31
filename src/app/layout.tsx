import { RootProvider } from 'fumadocs-ui/provider/next';
import { Bricolage_Grotesque, JetBrains_Mono, Onest } from 'next/font/google';
import './global.css';
import './site.css';
import SearchDialog from '@/components/search';
import { cn } from '@/lib/cn';

// Fetched at build time and served from the site; one type system on every page (ADR-0015).
const display = Bricolage_Grotesque({ subsets: ['latin'], variable: '--font-home-display', axes: ['opsz'] });
const text = Onest({ subsets: ['latin'], variable: '--font-home-text' });
const data = JetBrains_Mono({ subsets: ['latin'], variable: '--font-home-data' });

export default function Layout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="en" className={cn(display.variable, text.variable, data.variable)} suppressHydrationWarning>
      <body className="flex flex-col min-h-screen">
        <RootProvider search={{ SearchDialog }} theme={{ defaultTheme: 'dark' }}>
          {children}
        </RootProvider>
      </body>
    </html>
  );
}
