'use client';
import { useEffect, useState } from 'react';
import { MarkdownCopyButton, ViewOptionsPopover } from 'fumadocs-ui/layouts/notebook/page';

/**
 * Fumadocs' own page actions, live, for the example page rather than the home page
 * (ADR-0016 decision 7).
 */
export function AssistantActions({ pageUrl, markdownUrl, githubUrl }: { pageUrl: string; markdownUrl: string; githubUrl: string }) {
  // The prompt sent to an assistant needs the full address, which is known only in the browser.
  const [absolute, setAbsolute] = useState(pageUrl);

  useEffect(() => {
    setAbsolute(new URL(pageUrl, location.origin).href);
  }, [pageUrl]);

  return (
    <div className="assist-actions">
      <MarkdownCopyButton markdownUrl={markdownUrl} />
      <ViewOptionsPopover markdownUrl={markdownUrl} githubUrl={githubUrl} pageUrl={absolute} />
    </div>
  );
}
