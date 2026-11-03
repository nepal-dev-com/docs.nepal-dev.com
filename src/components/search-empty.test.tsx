import { expect, test } from 'bun:test';
import { renderToStaticMarkup } from 'react-dom/server';
import { SearchEmpty } from './search-empty';

test('a search with no results says so in the Verse and offers a next step (ADR-0029 decision 8)', () => {
  const html = renderToStaticMarkup(<SearchEmpty />);
  expect(html).toContain('Nothing in orbit matches. Try another word.');
  expect(html).not.toContain('No results found');
});

test('the message is announced as a status, like the dialog it replaces', () => {
  expect(renderToStaticMarkup(<SearchEmpty />)).toContain('role="status"');
});
