import { expect, test } from 'bun:test';
import { renderToStaticMarkup } from 'react-dom/server';
import { Diagram } from './diagram';
import { presentHref } from './diagram-frame';

// Runs from the repository root, where diagrams/docs/site-pages.html is committed (903 × 1024).
const src = '/diagrams/docs/site-pages.html';

test('a sandboxed, lazy frame sized from the viewBox, with the caption and full-screen link', () => {
  const html = renderToStaticMarkup(<Diagram src={src} title="Site pages" />);
  expect(html).toContain(`<iframe src="${src}?frame=1&amp;theme=dark" title="Site pages" sandbox="allow-scripts allow-downloads" loading="lazy" allow="fullscreen"`);
  expect(html).not.toContain('allow-same-origin');
  expect(html).toContain(`--diagram-ratio:${1024 / 903}`);
  expect(html).toContain(`<a href="${src}?theme=dark">Open full screen`);
  expect(html).toContain('<span>Site pages</span>');
  expect(html).not.toContain('data-wide');
});

test('a wide diagram is marked so its frame keeps a minimum width', () => {
  const html = renderToStaticMarkup(<Diagram src="/diagrams/docs/package-version-lifecycle.html" title="Lifecycle" />);
  expect(html).toContain('data-wide=""');
});

test('does not render the Mermaid it holds', () => {
  const html = renderToStaticMarkup(
    <Diagram src={src} title="Site pages">
      <pre>flowchart LR</pre>
    </Diagram>,
  );
  expect(html).not.toContain('flowchart');
});

test('fails on a src outside /diagrams/', () => {
  expect(() => renderToStaticMarkup(<Diagram src="https://evil.example/a.html" title="x" />)).toThrow(/outside \/diagrams\//);
});

test('fails on a diagram that is not committed', () => {
  expect(() => renderToStaticMarkup(<Diagram src="/diagrams/docs/missing.html" title="x" />)).toThrow(/no Archify diagram/);
});

test('fails without a title', () => {
  expect(() => renderToStaticMarkup(<Diagram src={src} title="  " />)).toThrow(/title is required/);
});

test("a frame that cannot go fullscreen sends the reader to the diagram's own Present stage", () => {
  expect(presentHref(src, 'light')).toBe(`${src}?theme=light&present=1`);
});
