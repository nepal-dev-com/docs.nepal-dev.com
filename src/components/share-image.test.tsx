import { describe, expect, test } from 'bun:test';
import { renderToStaticMarkup } from 'react-dom/server';
import { HomeShareImage, homeCentre, homeOrbitRadii, PageShareImage, textColumnEnd } from './share-image';

const cxOf = (markup: string, tag: string) => [...markup.matchAll(new RegExp(`<${tag} cx="([\\d.]+)"`, 'g'))].map((m) => Number(m[1]));

describe('the home share image (ADR-0035 decision 11)', () => {
  test('its orbits stay clear of the text however many rings there are', () => {
    for (const count of [5, 6, 7]) {
      const radii = homeOrbitRadii(count);
      expect(radii).toHaveLength(count);
      expect(homeCentre - radii[radii.length - 1]).toBeGreaterThan(textColumnEnd);
      expect(radii[1]).toBeGreaterThan(radii[0]);
    }
  });

  test('draws one orbit per ring and a planet for each entry', () => {
    const ellipses = (markup: string) => markup.match(/<ellipse/g)?.length ?? 0;
    const empty = renderToStaticMarkup(<HomeShareImage rings={['npm']} planets={[]} />);
    const twoRings = renderToStaticMarkup(<HomeShareImage rings={['npm', 'project']} planets={[]} />);
    const ringed = renderToStaticMarkup(
      <HomeShareImage rings={['npm', 'project']} planets={[{ slug: 'docs', ring: 'project', kind: 'project' }]} />,
    );
    expect(ellipses(twoRings) - ellipses(empty)).toBe(1);
    expect(ellipses(ringed) - ellipses(twoRings)).toBe(1);
    expect(ringed).toContain('Every package and project, documented to the version.');
  });
});

describe('a page share image (ADR-0035 decision 11)', () => {
  const page = { url: '/lodestar/use/dev/install', title: 'Install', description: 'Add lodestar to a project.' };
  const entry = { label: 'lodestar', ring: 'npm', kind: 'package', track: 'Use', line: { name: 'dev', channel: 'dev' } } as const;

  test('says the entry, the track and the line above the title', () => {
    const markup = renderToStaticMarkup(<PageShareImage {...page} entry={entry} domain="docs.example.test" />);
    for (const text of ['lodestar', '· Use', 'dev', 'Install', 'Add lodestar to a project.', 'docs.example.test']) {
      expect(markup).toContain(text);
    }
  });

  test('shows no address when the site has none, and no entry row outside an entry', () => {
    const markup = renderToStaticMarkup(<PageShareImage {...page} />);
    expect(markup).not.toContain('example.test');
    expect(markup).not.toContain('· Use');
  });

  test('never puts a star behind the text', () => {
    const markup = renderToStaticMarkup(<PageShareImage {...page} />);
    const stars = cxOf(markup, 'circle');
    expect(stars.length).toBeGreaterThan(10);
    expect(Math.min(...stars)).toBeGreaterThan(textColumnEnd);
  });
});
