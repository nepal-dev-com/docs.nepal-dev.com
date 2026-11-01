import { expect, test } from 'bun:test';
import { renderToStaticMarkup } from 'react-dom/server';
import { HtmlEmbed } from './html-embed';

// Runs from the repository root, where public/diagrams/docs/site-pages.html is published.
const src = '/diagrams/docs/site-pages.html';

test('a sandboxed, lazy frame with the full-screen link and caption', () => {
  const html = renderToStaticMarkup(<HtmlEmbed src={src} title="Site pages" />);
  expect(html).toContain(`<iframe src="${src}" title="Site pages" sandbox="allow-scripts allow-downloads" loading="lazy">`);
  expect(html).not.toContain('allow-same-origin');
  expect(html).toContain(`<a href="${src}">Open full screen`);
  expect(html).toContain('<span>Site pages</span>');
});

test('fails on a src outside /diagrams/', () => {
  expect(() => renderToStaticMarkup(<HtmlEmbed src="https://evil.example/a.html" title="x" />)).toThrow(/outside \/diagrams\//);
});

test('fails on a file that is not published', () => {
  expect(() => renderToStaticMarkup(<HtmlEmbed src="/diagrams/docs/missing.html" title="x" />)).toThrow(/no file in public/);
});

test('fails without a title', () => {
  expect(() => renderToStaticMarkup(<HtmlEmbed src={src} title="  " />)).toThrow(/title is required/);
});
