import { expect, test } from 'bun:test';
import { renderToStaticMarkup } from 'react-dom/server';
import { HeaderSky, Sky } from './sky';
import { headerSky, pageSky } from '@/lib/sky';

test('the page sky draws every star, hidden from assistive tech, with no script', () => {
  const html = renderToStaticMarkup(<Sky />);
  expect(html).toContain('class="verse-sky" aria-hidden="true"');
  expect(html.match(/<circle/g)).toHaveLength(pageSky.length);
  expect(html).not.toContain('<script');
});

test('stars take their colours from the tokens, so both themes follow', () => {
  const html = renderToStaticMarkup(<Sky />);
  expect(html).toContain('fill="var(--home-faint)"');
  expect(html).toContain('fill="var(--home-ink)"');
  expect(html).not.toMatch(/fill="#/);
});

test('the header sky is its own band', () => {
  const html = renderToStaticMarkup(<HeaderSky />);
  expect(html).toContain('class="header-sky" aria-hidden="true"');
  expect(html.match(/<circle/g)).toHaveLength(headerSky.length);
});
