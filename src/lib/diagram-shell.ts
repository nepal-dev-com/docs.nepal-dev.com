/**
 * ADR-0022 decision 6: what the site adds to every Archify diagram as it is served. The committed
 * file stays Archify's own; this runs on its text at build.
 */

// The site's tokens (`src/app/global.css`); a test keeps the two in step.
export const siteTokens = {
  light: {
    bg: '#f6f7f9',
    panel: '#ffffff',
    panel2: '#f1f3f7',
    line: '#dde1e9',
    line2: '#c4cbd8',
    ink: '#0d1016',
    muted: '#4f586b',
    faint: '#5f6880',
  },
  dark: {
    bg: '#0a0c10',
    panel: '#141821',
    panel2: '#1a1f2a',
    line: '#232937',
    line2: '#323a4c',
    ink: '#e9ecf2',
    muted: '#9ba4b6',
    faint: '#7f889e',
  },
} as const;

// What a frame hides of Archify's page: its title, notes rail, theme and style buttons and the
// guide's credit. The diagram, its labels and its controls stay.
export const framedHidden = [
  '.header',
  '#reader-rail',
  '#rail-reveal',
  '#btn-theme',
  '.preset-wrap',
  '.diagram-guide-credit',
] as const;

export const HEIGHT_MESSAGE = 'archify-height';
export const PRESENT_MESSAGE = 'archify-present';

function palette(theme: keyof typeof siteTokens): string {
  const t = siteTokens[theme];
  return [
    `--bg: ${t.bg}`,
    `--grid: ${t.line}`,
    `--canvas-dot: color-mix(in srgb, ${t.muted} 18%, transparent)`,
    `--text: ${t.ink}`,
    `--text-muted: ${t.muted}`,
    `--text-faint: ${t.faint}`,
    `--panel: ${t.panel}`,
    `--panel-border: ${t.line}`,
    `--lane-fill: color-mix(in srgb, ${t.panel} 55%, transparent)`,
    `--lane-stroke: ${t.line2}`,
    `--mask: ${t.panel}`,
    `--toolbar-bg: ${t.panel}`,
    `--toolbar-border: ${t.line}`,
    `--toolbar-text: ${t.ink}`,
    `--toolbar-hover: ${t.panel2}`,
    `--toolbar-menu-bg: ${t.panel}`,
  ].join('; ');
}

// `:not(#site-shell)` lifts these above Archify's own `[data-preset][data-theme]` and layout rules.
const framed = 'html[data-site-frame]:not(#site-shell)';
// Archify's Present stage has its own layout; the frame's layout steps aside for it. Archify sizes
// the dock and the export menu from the viewport, the frame itself: here they keep their own size.
const framedReading = 'html[data-site-frame]:not([data-present="true"]):not(#site-shell)';

export const shellStyle = `
html[data-theme="dark"]:not(#site-shell) { ${palette('dark')}; }
html[data-theme="light"]:not(#site-shell) { ${palette('light')}; }
${framedHidden
  .map((selector) => `${selector === '.header' ? framedReading : framed} ${selector}`)
  .join(',\n')} { display: none !important; }
${framedReading}, ${framedReading} body { min-height: 0 !important; height: auto !important; }
${framedReading} { overflow: hidden; }
${framedReading} body { overflow: visible; }
${framedReading} body { --archify-page-top: 0px; padding: 0.5rem !important; background: var(--bg); background-image: none; }
${framedReading} .container { display: block !important; max-width: none; margin: 0; }
${framedReading} .toolbar { position: relative; top: auto; right: auto; z-index: 100; justify-content: flex-end; width: auto; max-width: none; margin: 0 0 0.5rem; }
${framed} .diagram-container { border: 0; border-radius: 0; box-shadow: none; background: transparent; }
${framedReading} .diagram-container { --archify-nav-reserve: 0px !important; padding-bottom: 4.25rem !important; }
${framedReading} .diagram-nav { translate: none !important; }
${framedReading} .toolbar .export-menu { position: absolute; top: calc(100% + 0.125rem); right: 0; left: auto; width: min(19rem, calc(100vw - 1rem)); max-height: none; overflow: visible; }
`;

// Runs first: marks a framed page before paint.
export const shellHeadScript = `(function () {
  try {
    if (new URLSearchParams(location.search).get('frame') === '1') {
      document.documentElement.setAttribute('data-site-frame', '');
    }
  } catch (_) {}
})();`;

// Runs last: starts the motion; in a frame, reports its height and takes Present to fullscreen.
export const shellBodyScript = `(function () {
  var html = document.documentElement;
  var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var motion = window.Archify && window.Archify.motionGovernor;
  if (!reduced && motion && motion.capable && typeof motion.setMode === 'function') {
    motion.setMode('live', { persist: false });
  }
  if (!html.hasAttribute('data-site-frame') || window.parent === window) {
    return;
  }
  function presenting() {
    return html.getAttribute('data-present') === 'true' || Boolean(document.fullscreenElement);
  }
  // An open toolbar menu hangs below the toolbar; the frame grows to show it.
  function menuBottom() {
    var bottom = 0;
    var menus = document.querySelectorAll('.toolbar [role="menu"]');
    for (var i = 0; i < menus.length; i++) {
      var rect = menus[i].getBoundingClientRect();
      if (rect.height > 0) {
        bottom = Math.max(bottom, rect.bottom + 8);
      }
    }
    return bottom;
  }
  var last = 0;
  var recent = [];
  var growOnlyAt = 0;
  function report() {
    if (presenting()) {
      return;
    }
    var height = Math.ceil(Math.max(document.body.getBoundingClientRect().height, menuBottom()));
    if (Math.abs(height - last) <= 1) {
      return;
    }
    // A layout that answers its own height would resize forever; past 8 changes in 2s only
    // growth is reported, until the frame's width changes.
    if (growOnlyAt && growOnlyAt !== window.innerWidth) {
      growOnlyAt = 0;
      recent = [];
    }
    var now = Date.now();
    recent = recent.filter(function (t) { return now - t < 2000; });
    recent.push(now);
    if (recent.length > 8 && !growOnlyAt) {
      growOnlyAt = window.innerWidth;
    }
    if (growOnlyAt && height < last) {
      return;
    }
    last = height;
    window.parent.postMessage({ type: '${HEIGHT_MESSAGE}', height: height }, '*');
  }
  report();
  if (typeof ResizeObserver === 'function') {
    new ResizeObserver(report).observe(document.body);
  }
  var toolbar = document.querySelector('.toolbar');
  if (toolbar && typeof MutationObserver === 'function') {
    new MutationObserver(report).observe(toolbar, { subtree: true, attributes: true, attributeFilter: ['class', 'hidden', 'aria-expanded'] });
  }
  window.addEventListener('load', report);
  // Archify's Present is a stage the height of the viewport; in a frame that is the frame, so the
  // stage is taken to fullscreen, and leaving fullscreen leaves the stage. Where the frame cannot go
  // fullscreen, the page opens the diagram's own Present stage instead.
  var presentButton = document.getElementById('btn-present');
  var stage = window.Archify && window.Archify.presentation;
  if (presentButton && stage) {
    var fullscreenable = typeof html.requestFullscreen === 'function';
    function presentOnPage() {
      if (stage.active()) {
        stage.exit();
      }
      window.parent.postMessage({ type: '${PRESENT_MESSAGE}' }, '*');
    }
    presentButton.addEventListener('click', function () {
      if (stage.active() && !document.fullscreenElement) {
        if (fullscreenable) {
          html.requestFullscreen().catch(presentOnPage);
        } else {
          presentOnPage();
        }
      } else if (!stage.active() && document.fullscreenElement) {
        document.exitFullscreen().catch(function () {});
      }
    });
    document.addEventListener('fullscreenchange', function () {
      if (!document.fullscreenElement && stage.active()) {
        stage.exit();
      }
      window.requestAnimationFrame(report);
    });
  }
})();`;

/** Archify's HTML with the site shell added: styles and the frame marker in the head, the script last. */
export function withShell(html: string): string {
  const head = html.indexOf('</head>');
  const body = html.lastIndexOf('</body>');
  if (head === -1 || body === -1 || body < head) {
    throw new Error('Not an Archify page: no </head> or </body> (ADR-0022)');
  }
  return (
    html.slice(0, head) +
    `<script id="site-shell-head">${shellHeadScript}</script><style id="site-shell-style">${shellStyle}</style>` +
    html.slice(head, body) +
    `<script id="site-shell-body">${shellBodyScript}</script>` +
    html.slice(body)
  );
}
