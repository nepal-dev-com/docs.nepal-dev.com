import { describe, expect, mock, test } from 'bun:test';
import { readFileSync } from 'node:fs';
import { framedHidden, HEIGHT_MESSAGE, PRESENT_MESSAGE, shellBodyScript, shellHeadScript, shellStyle, siteTokens, withShell } from './diagram-shell';
import { isPresentRequest, reportedHeight } from './diagrams';

// A committed Archify file: an upgrade that renames what the shell hides fails here (ADR-0022).
const archify = readFileSync('diagrams/docs/site-pages.html', 'utf8');
const css = readFileSync('src/app/global.css', 'utf8');

function block(selector: string): string {
  const start = css.indexOf(`${selector} {`);
  return css.slice(start, css.indexOf('}', start));
}

function token(scope: string, name: string): string | undefined {
  return new RegExp(`--home-${name}:\\s*(#[0-9a-f]+);`, 'i').exec(block(scope))?.[1];
}

describe('siteTokens', () => {
  const names = { bg: 'bg', panel: 'panel', panel2: 'panel-2', line: 'line', line2: 'line-2', ink: 'ink', muted: 'muted', faint: 'faint' };

  test.each(Object.entries(names))('%s matches global.css in light and dark', (key, name) => {
    const light: string = siteTokens.light[key as keyof typeof siteTokens.light];
    const dark: string = siteTokens.dark[key as keyof typeof siteTokens.dark];
    expect(light).toBe(token(':root', name) ?? 'missing');
    expect(dark).toBe(token('.dark', name) ?? 'missing');
  });
});

const reading = 'html[data-site-frame]:not([data-present="true"]):not(#site-shell)';
const hiddenRule = shellStyle.slice(shellStyle.indexOf('html[data-site-frame]'), shellStyle.indexOf(' { display: none !important; }'));

function rule(selector: string): string {
  const start = shellStyle.indexOf(`${selector} {`);
  return start === -1 ? '' : shellStyle.slice(start, shellStyle.indexOf('}', start));
}

describe('shellStyle', () => {
  test('puts the page on the site ground in both themes', () => {
    expect(shellStyle).toContain(`html[data-theme="dark"]:not(#site-shell) { --bg: ${siteTokens.dark.bg};`);
    expect(shellStyle).toContain(`html[data-theme="light"]:not(#site-shell) { --bg: ${siteTokens.light.bg};`);
  });

  test("keeps Archify's kind palette", () => {
    expect(shellStyle).not.toMatch(/--(frontend|backend|database|cloud|security|messagebus|external)-/);
  });

  test('hides, in a frame only, what a committed Archify file has', () => {
    const markup: Record<string, RegExp> = {
      '.header': /<div class="header">/,
      '#reader-rail': /id="reader-rail"/,
      '#rail-reveal': /id="rail-reveal"/,
      '#btn-theme': /id="btn-theme"/,
      '.preset-wrap': /class="preset-wrap"/,
      '.diagram-guide-credit': /class="diagram-guide-credit"/,
    };
    expect([...framedHidden].sort() as string[]).toEqual(Object.keys(markup).sort());
    for (const selector of framedHidden) {
      expect(archify).toMatch(markup[selector]);
      expect(hiddenRule).toMatch(new RegExp(`^html\\[data-site-frame\\][^ ]*:not\\(#site-shell\\) ${selector.replace('.', '\\.')},?$`, 'm'));
    }
  });

  test('keeps the controls the reader uses', () => {
    for (const id of ['btn-motion', 'btn-present', 'btn-export', 'btn-node-finder', 'btn-diagram-guide']) {
      expect(archify).toContain(`id="${id}"`);
      expect(shellStyle).not.toContain(id);
    }
    expect(hiddenRule).not.toContain('.diagram-nav');
    expect(hiddenRule).not.toContain('.toolbar');
  });

  test('keeps the toolbar and its menus above the diagram', () => {
    expect(rule(`${reading} .toolbar`)).toMatch(/position: relative;[^}]*z-index: 100;/);
    // Full width, so a menu hung from its right edge stays inside a phone-width frame.
    expect(rule(`${reading} .toolbar`)).toMatch(/width: auto; max-width: none; margin: 0 0 0\.5rem;/);
  });

  test('holds the dock still, so the frame does not answer its own height', () => {
    expect(rule(`${reading} .diagram-nav`)).toContain('translate: none !important;');
    expect(rule(`${reading} .diagram-container`)).toContain('--archify-nav-reserve: 0px !important;');
  });

  test('lets the export menu take its own height, for the frame to grow to', () => {
    expect(rule(`${reading} .toolbar .export-menu`)).toMatch(/position: absolute;[^}]*max-height: none;/);
    // The body is only as tall as the diagram; clipping there would cut the menu the frame grew for.
    expect(rule(`${reading} body`)).not.toContain('overflow: hidden');
    expect(shellStyle).toContain(`${reading} body { overflow: visible; }`);
  });

  test("steps aside for Archify's Present stage", () => {
    for (const selector of [`${reading}, ${reading} body`, `${reading} body`, `${reading} .container`, `${reading} .toolbar`]) {
      expect(shellStyle).toContain(`${selector} {`);
    }
    expect(shellStyle).not.toMatch(/html\[data-site-frame\]:not\(#site-shell\)(,| body| \.container| \.toolbar| \.diagram-nav)/);
  });
});

describe('withShell', () => {
  test('adds the style and frame marker to the head, the script last in the body', () => {
    const html = withShell(archify);
    const head = html.indexOf('</head>');
    expect(html.indexOf('id="site-shell-style"')).toBeLessThan(head);
    expect(html.indexOf('id="site-shell-head"')).toBeLessThan(head);
    expect(html.indexOf('id="site-shell-body"')).toBeGreaterThan(html.lastIndexOf('<script', html.indexOf('id="site-shell-body"') - 1) - 1);
    expect(html.indexOf('id="site-shell-body"')).toBeLessThan(html.lastIndexOf('</body>'));
    expect(html.length).toBeGreaterThan(archify.length);
    expect(html.replace(/<script id="site-shell-head">[\s\S]*?<\/style>/, '').replace(/<script id="site-shell-body">[\s\S]*?<\/script>/, '')).toBe(archify);
  });

  test('refuses a page without a head or body', () => {
    expect(() => withShell('<p>hi</p>')).toThrow(/Not an Archify page/);
  });
});

describe('shellHeadScript', () => {
  const run = (search: string) => {
    const attributes = new Map<string, string>();
    const document = { documentElement: { setAttribute: (name: string, value: string) => attributes.set(name, value) } };
    new Function('location', 'document', shellHeadScript)({ search }, document);
    return attributes;
  };

  test('marks a framed page', () => {
    expect(run('?frame=1&theme=light').has('data-site-frame')).toBeTrue();
  });

  test('leaves a direct visit alone', () => {
    expect(run('?theme=light').has('data-site-frame')).toBeFalse();
    expect(run('').has('data-site-frame')).toBeFalse();
  });
});

type Listener = () => void;

function fakePage({ framed = true, reduced = false, capable = true, height = 640, width = 900, fullscreenable = true, granted = true } = {}) {
  const setMode = mock(() => {});
  const postMessage = mock((_data: unknown, _origin: string) => {});
  const attributes = new Map<string, string>(framed ? [['data-site-frame', '']] : []);
  let resize: Listener = () => {};
  let mutate: Listener = () => {};
  const listeners: Record<string, Listener[]> = {};
  const menus: { height: number; bottom: number }[] = [];
  const presentClicks: Listener[] = [];
  const state = { height, presenting: false, fullscreen: null as unknown };
  const requestFullscreen = mock(() => {
    if (!granted) {
      return Promise.reject(new TypeError('not granted'));
    }
    state.fullscreen = html;
    return Promise.resolve();
  });
  const exitFullscreen = mock(() => {
    state.fullscreen = null;
    return Promise.resolve();
  });
  const stage = {
    active: () => state.presenting,
    exit: mock(() => {
      state.presenting = false;
      attributes.delete('data-present');
    }),
  };
  const html: Record<string, unknown> = {
    hasAttribute: (name: string) => attributes.has(name),
    getAttribute: (name: string) => attributes.get(name) ?? null,
  };
  if (fullscreenable) {
    html.requestFullscreen = requestFullscreen;
  }
  const window: Record<string, unknown> = {
    innerWidth: width,
    matchMedia: (query: string) => ({ matches: reduced && query.includes('reduce') }),
    Archify: { motionGovernor: { capable, setMode }, presentation: stage },
    addEventListener: () => {},
    requestAnimationFrame: (callback: Listener) => callback(),
  };
  window.parent = framed ? { postMessage } : window;
  const document = {
    documentElement: html,
    body: { getBoundingClientRect: () => ({ height: state.height }) },
    get fullscreenElement() {
      return state.fullscreen;
    },
    exitFullscreen,
    querySelector: (selector: string) => (selector === '.toolbar' ? {} : null),
    querySelectorAll: (selector: string) =>
      selector === '.toolbar [role="menu"]' ? menus.map((menu) => ({ getBoundingClientRect: () => menu })) : [],
    getElementById: (id: string) =>
      id === 'btn-present' ? { addEventListener: (_type: string, listener: Listener) => presentClicks.push(listener) } : null,
    addEventListener: (type: string, listener: Listener) => {
      (listeners[type] ??= []).push(listener);
    },
  };
  class ResizeObserver {
    constructor(callback: Listener) {
      resize = callback;
    }
    observe() {}
  }
  class MutationObserver {
    constructor(callback: Listener) {
      mutate = callback;
    }
    observe() {}
  }
  new Function('window', 'document', 'ResizeObserver', 'MutationObserver', shellBodyScript)(
    window,
    document,
    ResizeObserver,
    MutationObserver,
  );
  const heights = () =>
    postMessage.mock.calls.map(([data]) => data as { type: string; height?: number }).filter((data) => data.type === HEIGHT_MESSAGE).map((data) => data.height);
  const presentRequests = () => postMessage.mock.calls.filter(([data]) => isPresentRequest(data)).length;
  return {
    setMode,
    postMessage,
    heights,
    presentRequests,
    isPresenting: () => state.presenting,
    requestFullscreen,
    exitFullscreen,
    stage,
    resizeTo(next: number) {
      state.height = next;
      resize();
    },
    openMenu(bottom: number) {
      menus.push({ height: 300, bottom });
      mutate();
    },
    setWidth(next: number) {
      window.innerWidth = next;
    },
    clickPresent() {
      state.presenting = !state.presenting;
      if (state.presenting) {
        attributes.set('data-present', 'true');
      } else {
        attributes.delete('data-present');
      }
      for (const listener of presentClicks) {
        listener();
      }
    },
    leaveFullscreen() {
      state.fullscreen = null;
      for (const listener of listeners.fullscreenchange ?? []) {
        listener();
      }
    },
  };
}

describe('shellBodyScript', () => {
  test('starts the motion Live without saving the choice', () => {
    expect(fakePage().setMode).toHaveBeenCalledWith('live', { persist: false });
  });

  test('stays Still for a reader who prefers reduced motion, or without motion', () => {
    expect(fakePage({ reduced: true }).setMode).not.toHaveBeenCalled();
    expect(fakePage({ capable: false }).setMode).not.toHaveBeenCalled();
  });

  test('reports its height to the page in a form the page accepts', () => {
    const { postMessage } = fakePage({ height: 640.4 });
    expect(postMessage).toHaveBeenCalledTimes(1);
    const [data] = postMessage.mock.calls[0];
    expect(data).toEqual({ type: HEIGHT_MESSAGE, height: 641 });
    expect(reportedHeight(data)).toBe(641);
  });

  test('a direct visit reports nothing', () => {
    expect(fakePage({ framed: false }).postMessage).not.toHaveBeenCalled();
  });

  test('grows to show an open toolbar menu', () => {
    const page = fakePage({ height: 300 });
    page.openMenu(520);
    expect(page.heights()).toEqual([300, 528]);
  });

  test('a layout that answers its own height settles instead of flickering', () => {
    const page = fakePage({ height: 300 });
    for (let i = 0; i < 20; i++) {
      page.resizeTo(i % 2 === 0 ? 254 : 302);
    }
    const heights = page.heights();
    expect(heights.length).toBeLessThan(12);
    expect(heights.at(-1)).toBe(302);
  });

  test('reports a smaller height again once the frame changes width', () => {
    const page = fakePage({ height: 300 });
    for (let i = 0; i < 20; i++) {
      page.resizeTo(i % 2 === 0 ? 254 : 302);
    }
    page.setWidth(400);
    page.resizeTo(200);
    expect(page.heights().at(-1)).toBe(200);
  });

  test('Present takes the stage to fullscreen, and leaving fullscreen leaves the stage', () => {
    const page = fakePage();
    page.clickPresent();
    expect(page.requestFullscreen).toHaveBeenCalledTimes(1);
    page.leaveFullscreen();
    expect(page.stage.exit).toHaveBeenCalledTimes(1);
  });

  test('closing Present leaves fullscreen', () => {
    const page = fakePage();
    page.clickPresent();
    page.clickPresent();
    expect(page.exitFullscreen).toHaveBeenCalledTimes(1);
  });

  test('does not report the stage height while presenting', () => {
    const page = fakePage({ height: 300 });
    page.clickPresent();
    page.resizeTo(900);
    expect(page.heights()).toEqual([300]);
  });

  test('Present goes fullscreen without asking the page for anything', () => {
    const page = fakePage();
    page.clickPresent();
    expect(page.presentRequests()).toBe(0);
  });

  test('where fullscreen is refused, the page opens the stage instead', async () => {
    const page = fakePage({ granted: false });
    page.clickPresent();
    await Promise.resolve();
    await Promise.resolve();
    expect(page.presentRequests()).toBe(1);
    expect(page.isPresenting()).toBeFalse();
    expect(page.postMessage).toHaveBeenCalledWith({ type: PRESENT_MESSAGE }, '*');
  });

  test('without fullscreen, the page opens the stage', () => {
    const page = fakePage({ fullscreenable: false });
    page.clickPresent();
    expect(page.requestFullscreen).not.toHaveBeenCalled();
    expect(page.presentRequests()).toBe(1);
    expect(page.isPresenting()).toBeFalse();
  });
});
