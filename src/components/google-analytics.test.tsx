import { describe, expect, test } from 'bun:test';
import { isValidElement, type ReactElement } from 'react';
import { consentScript } from '@/lib/privacy-choice';
import { GoogleAnalytics } from './google-analytics';

describe('GoogleAnalytics (ADR-0041 decision 4)', () => {
  test('renders nothing without an ID', () => {
    expect(GoogleAnalytics({ id: undefined })).toBeNull();
  });

  test('queues the consent script, then loads gtag.js for that ID', () => {
    const fragment = GoogleAnalytics({ id: 'G-AB12CD34EF' });
    expect(isValidElement(fragment)).toBe(true);
    const [init, library] = (fragment as ReactElement<{ children: ReactElement<Record<string, unknown>>[] }>).props.children;
    expect(init.props.id).toBe('ga-consent');
    expect(init.props.strategy).toBe('afterInteractive');
    expect(init.props.dangerouslySetInnerHTML).toEqual({ __html: consentScript('G-AB12CD34EF') });
    expect(library.props.id).toBe('ga-library');
    expect(library.props.strategy).toBe('afterInteractive');
    expect(library.props.src).toBe('https://www.googletagmanager.com/gtag/js?id=G-AB12CD34EF');
  });
});
