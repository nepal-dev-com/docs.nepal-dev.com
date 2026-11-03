/** ADR-0020: which links are GitHub profile links, and where their avatar comes from. Pure. */

// GitHub's rule: 1 to 39 letters, digits or single hyphens, not starting or ending with one.
const username = /^[a-z0-9](?:[a-z0-9]|-(?=[a-z0-9])){0,38}$/i;
const profileHref = /^https:\/\/github\.com\/([^/?#]+)$/;

/**
 * The username when a link is written `[@user](https://github.com/user)`, the same user in the
 * text and the address; otherwise undefined.
 */
export function profileUser(href: unknown, text: unknown): string | undefined {
  if (typeof href !== 'string' || typeof text !== 'string') {
    return undefined;
  }
  const match = profileHref.exec(href);
  if (!match || !username.test(match[1])) {
    return undefined;
  }
  return text.toLowerCase() === `@${match[1].toLowerCase()}` ? match[1] : undefined;
}

export function profileUrl(user: string): string {
  return `https://github.com/${user}`;
}

export function avatarUrl(user: string): string {
  return `https://github.com/${user}.png?size=40`;
}
