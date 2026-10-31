import { Bricolage_Grotesque, JetBrains_Mono, Onest } from 'next/font/google';
import { cn } from '@/lib/cn';
import './home.css';

// ADR-0014 decision 5: fetched at build time and served from the site.
const display = Bricolage_Grotesque({ subsets: ['latin'], variable: '--font-home-display', axes: ['opsz'] });
const text = Onest({ subsets: ['latin'], variable: '--font-home-text' });
const data = JetBrains_Mono({ subsets: ['latin'], variable: '--font-home-data' });

export default function Layout({ children }: LayoutProps<'/'>) {
  return <div className={cn('home', display.variable, text.variable, data.variable)}>{children}</div>;
}
