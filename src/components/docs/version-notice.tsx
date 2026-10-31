import Link from 'next/link';
import { Callout } from 'fumadocs-ui/components/callout';
import type { PageVersion } from '@/lib/catalog-plugin';

interface VersionNoticeProps {
  version: PageVersion;
  latest?: { version: string; url: string };
}

/**
 * States the version a page documents (invariant 3), with a banner on unreleased and older lines.
 */
export function VersionNotice({ version, latest }: VersionNoticeProps) {
  const toLatest = latest && (
    <Link href={latest.url} className="font-medium underline underline-offset-4">
      Read this page for {latest.version}, the latest release
    </Link>
  );

  if (version.channel === 'next') {
    return (
      <Callout type="warn" title="Unreleased">
        This page documents {version.title} <code>{version.version}</code>, which isn&apos;t released yet.
        {toLatest && <> {toLatest}.</>}
      </Callout>
    );
  }

  if (version.channel === 'legacy') {
    return (
      <Callout type="info" title="Older version">
        This page documents {version.title} <code>{version.version}</code>.{toLatest && <> {toLatest}.</>}
      </Callout>
    );
  }

  return (
    <p className="text-sm text-fd-muted-foreground">
      Documents {version.title} <code>{version.version}</code>
    </p>
  );
}
