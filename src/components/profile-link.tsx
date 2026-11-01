import type { ComponentProps, FC } from 'react';
import { avatarUrl, profileUrl, profileUser } from '@/lib/github-profile';

/** A GitHub profile link as a chip: the avatar, loaded live from GitHub, and `@user` (ADR-0020). */
export function ProfileChip({ user }: { user: string }) {
  return (
    <a
      href={profileUrl(user)}
      className="profile-chip not-prose"
      target="_blank"
      rel="noreferrer noopener"
      title={`@${user} on GitHub`}
    >
      <span className="profile-chip-avatar" aria-hidden>
        {user[0].toUpperCase()}
        {/* eslint-disable-next-line @next/next/no-img-element -- loaded live from GitHub, not optimised (ADR-0020) */}
        <img
          src={avatarUrl(user)}
          width={20}
          height={20}
          alt=""
          loading="lazy"
          decoding="async"
          referrerPolicy="no-referrer"
        />
      </span>
      <span className="profile-chip-name">@{user}</span>
    </a>
  );
}

/** The page's link component, with profile links shown as chips and every other link unchanged. */
export function withProfileChips(Link: FC<ComponentProps<'a'>>): FC<ComponentProps<'a'>> {
  return function ProfileAwareLink(props) {
    const user = profileUser(props.href, props.children);
    if (user) {
      return <ProfileChip user={user} />;
    }
    return <Link {...props} />;
  };
}
