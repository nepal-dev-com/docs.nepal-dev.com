import { expect, test } from 'bun:test';
import { renderToStaticMarkup } from 'react-dom/server';
import { PlanetCards } from './planet-cards';

test('with nothing documented, the home page names the empty Verse and says what will appear (ADR-0029 decision 8)', () => {
  const html = renderToStaticMarkup(<PlanetCards entries={[]} />);
  expect(html).toContain('No planets in the Verse yet.');
  expect(html).toContain('Packages and projects appear here once they are documented.');
  expect(html).not.toContain('No packages or projects yet.');
});
