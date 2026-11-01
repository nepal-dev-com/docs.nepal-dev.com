import { expect, test } from 'bun:test';
import type { ComponentProps } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { ProfileChip, withProfileChips } from './profile-link';

function PlainLink(props: ComponentProps<'a'>) {
  return <a data-plain {...props} />;
}
const SiteLink = withProfileChips(PlainLink);

test('the chip: avatar from GitHub without a referrer, over the initial, and @user', () => {
  const html = renderToStaticMarkup(<ProfileChip user="mira-k" />);
  expect(html).toContain('href="https://github.com/mira-k"');
  expect(html).toContain('target="_blank" rel="noreferrer noopener"');
  expect(html).toContain('title="@mira-k on GitHub"');
  expect(html).toContain('<span class="profile-chip-avatar" aria-hidden="true">M<img');
  expect(html).toContain('src="https://github.com/mira-k.png?size=40"');
  expect(html).toContain('alt=""');
  expect(html).toContain('loading="lazy"');
  expect(html).toContain('referrerPolicy="no-referrer"');
  expect(html).toContain('<span class="profile-chip-name">@mira-k</span>');
});

test('a profile link becomes a chip', () => {
  const html = renderToStaticMarkup(<SiteLink href="https://github.com/mira-k">@mira-k</SiteLink>);
  expect(html).toContain('class="profile-chip not-prose"');
  expect(html).not.toContain('data-plain');
});

test('every other link goes to the site link unchanged', () => {
  const repo = renderToStaticMarkup(<SiteLink href="https://github.com/mira-k/lodestar">@mira-k</SiteLink>);
  expect(repo).toBe('<a data-plain="true" href="https://github.com/mira-k/lodestar">@mira-k</a>');
  const page = renderToStaticMarkup(<SiteLink href="./adr/index.mdx">Decisions</SiteLink>);
  expect(page).toBe('<a data-plain="true" href="./adr/index.mdx">Decisions</a>');
});
