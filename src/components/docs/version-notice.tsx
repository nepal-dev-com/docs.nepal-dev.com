import Link from 'next/link';
import type { PageVersion } from '@/lib/catalog-plugin';
import { MoonPhase } from '@/components/planet';

interface VersionNoticeProps {
  version: PageVersion;
  latest?: { version: string; url: string };
}

/**
 * States the version a page documents (invariant 3), with its line's moon: a notice on the `dev`
 * line and older lines (ADR-0017 decision 10).
 */
export function VersionNotice({ version, latest }: VersionNoticeProps) {
  const toLatest = latest && (
    <Link href={latest.url}>Read this page for {latest.version}, the latest release</Link>
  );

  if (version.channel === 'latest') {
    return (
      <p className="version-line">
        <MoonPhase channel="latest" />
        <span>
          Documents {version.title} <code>{version.version}</code>
        </span>
      </p>
    );
  }

  return (
    <div className="version-notice not-prose" role="note">
      <MoonPhase channel={version.channel} />
      <p>
        <b>{version.channel === 'dev' ? 'In development.' : 'Older version.'}</b>{' '}
        {version.channel === 'dev' ? (
          <>
            This page documents {version.title} <code>{version.version}</code>, work in progress on the default
            branch.
          </>
        ) : (
          <>
            This page documents {version.title} <code>{version.version}</code>.
          </>
        )}
        {toLatest && <> {toLatest}.</>}
      </p>
    </div>
  );
}
