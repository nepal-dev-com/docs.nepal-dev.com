/** What `scripts/sync-content.ts` needs before it replaces the live search index (ADR-0042 decision 7). */
export const publishVariables = ['SITE_URL', 'NEXT_PUBLIC_ALGOLIA_APP_ID', 'ALGOLIA_WRITE_KEY'] as const;

export type PublishVariable = (typeof publishVariables)[number];

export function missingPublishVariables(env: Record<string, string | undefined>): string[] {
  return publishVariables.filter((name) => !env[name]?.trim());
}

/** The error a publish stops with, naming each missing variable and never a value. */
export function publishRefusal(env: Record<string, string | undefined>): string | undefined {
  const missing = missingPublishVariables(env);
  if (missing.length === 0) {
    return undefined;
  }
  return `Publishing needs ${missing.join(', ')}: set them in the environment (content/docs/maintain/security/secrets.mdx).`;
}

/** The checked values, or the refusal as an error before anything is published. */
export function readPublishEnv(env: Record<string, string | undefined>): Record<PublishVariable, string> {
  const refusal = publishRefusal(env);
  if (refusal) {
    throw new Error(refusal);
  }
  // Unreachable fallbacks: publishRefusal has already rejected an unset value.
  return {
    SITE_URL: env.SITE_URL ?? '',
    NEXT_PUBLIC_ALGOLIA_APP_ID: env.NEXT_PUBLIC_ALGOLIA_APP_ID ?? '',
    ALGOLIA_WRITE_KEY: env.ALGOLIA_WRITE_KEY ?? '',
  };
}
