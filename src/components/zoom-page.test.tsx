import { expect, test } from 'bun:test';
import { renderToStaticMarkup } from 'react-dom/server';
import { PlanetMorph, ZoomPage } from './zoom-page';

test('the zoom wrapper adds no markup of its own, so the page renders as before', () => {
  expect(renderToStaticMarkup(<ZoomPage><main>page</main></ZoomPage>)).toBe('<main>page</main>');
});

test('the morph wrapper adds no markup either', () => {
  expect(renderToStaticMarkup(<PlanetMorph slug="lodestar"><svg /></PlanetMorph>)).toBe('<svg></svg>');
});
