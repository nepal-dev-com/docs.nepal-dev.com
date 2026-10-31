'use client';
import { useEffect, useRef, useState } from 'react';
import type { CatalogEntry } from '@/lib/catalog';
import { matchesEntry, useHomeSearch } from './search-state';

type Ring = NonNullable<CatalogEntry['ecosystem']> | 'project';

const ringOrder: Ring[] = ['npm', 'composer', 'pypi', 'go', 'cargo', 'other', 'project'];
// Shown faintly when nothing is documented yet, so the hero keeps its shape (ADR-0014 app flow).
const emptyRings: Ring[] = ['npm', 'composer', 'pypi', 'go', 'project'];

export const ringOf = (entry: CatalogEntry): Ring =>
  entry.kind === 'project' ? 'project' : (entry.ecosystem ?? 'other');

export function presentRings(entries: CatalogEntry[]): Ring[] {
  if (entries.length === 0) {
    return emptyRings;
  }
  const present = new Set(entries.map(ringOf));
  return ringOrder.filter((ring) => present.has(ring));
}

interface Body {
  entry: CatalogEntry;
  ring: number;
  angle: number;
  lit: number;
  x: number;
  y: number;
  depth: number;
}

interface Hover {
  entry: CatalogEntry;
  x: number;
  y: number;
}

const tilt = 0.34;

export function OrbitMap({ onPick }: { onPick: (entry: CatalogEntry) => void }) {
  const { entries, chips, text, demoText, active } = useHomeSearch();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hover, setHover] = useState<Hover | null>(null);
  const query = useRef({ chips, text: text || demoText, active: active || demoText !== '' });
  const hoverRef = useRef<CatalogEntry | null>(null);
  const bodiesRef = useRef<Body[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d');
    if (!canvas || !context) {
      return;
    }

    const reduce = matchMedia('(prefers-reduced-motion: reduce)');
    const rings = presentRings(entries);
    const style = getComputedStyle(canvas);
    const token = (name: string) => style.getPropertyValue(name).trim();
    let colors = readColors();
    let width = 0;
    let height = 0;
    let base = 0;
    let time = 0;
    let last = performance.now();
    let frame = 0;
    let visible = true;

    function readColors() {
      return {
        line: token('--home-line-2'),
        ink: token('--home-ink'),
        bg: token('--home-bg'),
        ring: (ring: Ring) => token(`--home-${ring}`),
      };
    }

    function layout() {
      const ratio = Math.min(devicePixelRatio || 1, 2);
      width = canvas!.clientWidth;
      height = canvas!.clientHeight;
      canvas!.width = width * ratio;
      canvas!.height = height * ratio;
      context!.setTransform(ratio, 0, 0, ratio, 0, 0);
      base = Math.min(width * 0.5, height * 1.05);
      bodiesRef.current = entries.map((entry) => {
        const ring = rings.indexOf(ringOf(entry));
        const siblings = entries.filter((other) => ringOf(other) === ringOf(entry));
        return {
          entry,
          ring,
          angle: (siblings.indexOf(entry) / siblings.length) * Math.PI * 2 + ring * 0.9,
          lit: 0,
          x: 0,
          y: 0,
          depth: 0,
        };
      });
    }

    const radius = (ring: number) => base * (0.36 + ring * (0.6 / Math.max(rings.length, 4)));
    const cx = () => width / 2;
    const cy = () => height * 0.52;

    function draw(now: number) {
      const delta = Math.min(0.05, (now - last) / 1000);
      last = now;
      const slow = hoverRef.current ? 0.15 : 1;
      if (!reduce.matches) {
        time += delta * slow;
      }
      const { chips: activeChips, text: activeText, active: searching } = query.current;
      context!.clearRect(0, 0, width, height);

      const bodies = bodiesRef.current;
      for (const body of bodies) {
        const speed = 0.06 / (1 + body.ring * 0.55);
        const angle = body.angle + time * speed;
        body.x = cx() + Math.cos(angle) * radius(body.ring);
        body.y = cy() + Math.sin(angle) * radius(body.ring) * tilt;
        body.depth = Math.sin(angle);
        const target = hoverRef.current === body.entry
          ? 1
          : searching
            ? matchesEntry(body.entry, activeChips, activeText) ? 1 : -1
            : 0;
        body.lit += (target - body.lit) * (reduce.matches ? 1 : 0.1);
      }

      rings.forEach((ring, index) => {
        const lit = searching && bodies.some((body) => body.ring === index && body.lit > 0.5);
        context!.beginPath();
        context!.ellipse(cx(), cy(), radius(index), radius(index) * tilt, 0, 0, Math.PI * 2);
        context!.strokeStyle = lit ? colors.ring(ring) : colors.line;
        context!.globalAlpha = entries.length === 0 ? 0.3 : lit ? 0.55 : searching ? 0.25 : 0.5;
        context!.lineWidth = 1;
        context!.stroke();
      });

      for (const body of [...bodies].sort((a, b) => a.depth - b.depth)) {
        const color = colors.ring(ringOf(body.entry));
        const scale = 0.8 + (body.depth + 1) * 0.2;
        const size = (5 + Math.max(body.lit, 0) * 3) * scale;
        const alpha = Math.max(0.15, 0.55 + (body.depth + 1) * 0.2 + body.lit * 0.4);
        const moons = body.entry.lines;

        moons.forEach((line, index) => {
          const unreleased = line.channel === 'dev';
          const orbit = (13 + index * 6) * scale;
          const angle = time * (1.1 - index * 0.18) + index * 2.1 + body.angle;
          context!.beginPath();
          context!.ellipse(body.x, body.y, orbit, orbit * 0.55, 0, 0, Math.PI * 2);
          context!.strokeStyle = color;
          context!.globalAlpha = alpha * 0.22;
          context!.lineWidth = 1;
          context!.setLineDash(unreleased ? [2, 3] : []);
          context!.stroke();
          context!.setLineDash([]);
          context!.globalAlpha = alpha;
          context!.beginPath();
          context!.arc(body.x + Math.cos(angle) * orbit, body.y + Math.sin(angle) * orbit * 0.55, 2 * scale, 0, Math.PI * 2);
          if (unreleased) {
            context!.fillStyle = colors.bg;
            context!.fill();
            context!.strokeStyle = color;
            context!.lineWidth = 1.2;
            context!.stroke();
          } else {
            context!.fillStyle = color;
            context!.fill();
          }
        });

        context!.globalAlpha = alpha;
        context!.beginPath();
        context!.arc(body.x, body.y, size, 0, Math.PI * 2);
        if (body.entry.kind === 'project') {
          context!.fillStyle = colors.bg;
          context!.fill();
          context!.strokeStyle = color;
          context!.lineWidth = 1.8;
          context!.stroke();
        } else {
          context!.fillStyle = color;
          context!.fill();
        }

        if (body.lit > 0.35) {
          context!.globalAlpha = Math.min(1, body.lit);
          context!.font = `500 12px ${token('--home-font-data')}`;
          context!.fillStyle = colors.ink;
          context!.fillText(body.entry.title, body.x + size + 8, body.y + 4);
        }
      }
      context!.globalAlpha = 1;

      if (visible && !reduce.matches) {
        frame = requestAnimationFrame(draw);
      }
    }

    function start() {
      cancelAnimationFrame(frame);
      last = performance.now();
      frame = requestAnimationFrame(draw);
    }

    // Pause while off-screen or in a hidden tab; under reduced motion each change redraws once.
    const observer = new IntersectionObserver(([item]) => {
      visible = item.isIntersecting && document.visibilityState === 'visible';
      if (visible) {
        start();
      }
    });
    observer.observe(canvas);
    const onVisibility = () => {
      visible = document.visibilityState === 'visible';
      if (visible) {
        start();
      }
    };
    const onResize = () => {
      layout();
      start();
    };
    const themeObserver = new MutationObserver(() => {
      colors = readColors();
      start();
    });
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['class', 'style'] });
    document.addEventListener('visibilitychange', onVisibility);
    addEventListener('resize', onResize);
    reduce.addEventListener('change', start);
    layout();
    start();

    const redraw = () => start();
    canvas.addEventListener('redraw', redraw);

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      themeObserver.disconnect();
      document.removeEventListener('visibilitychange', onVisibility);
      removeEventListener('resize', onResize);
      reduce.removeEventListener('change', start);
      canvas.removeEventListener('redraw', redraw);
    };
  }, [entries]);

  // Under reduced motion the loop is stopped, so a new query asks for one more frame.
  useEffect(() => {
    query.current = { chips, text: text || demoText, active: active || demoText !== '' };
    canvasRef.current?.dispatchEvent(new Event('redraw'));
  }, [chips, text, demoText, active, hover]);

  function hit(event: React.MouseEvent<HTMLCanvasElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    let best: Body | undefined;
    let distance = 22;
    for (const body of bodiesRef.current) {
      const d = Math.hypot(body.x - x, body.y - y);
      if (d < distance) {
        distance = d;
        best = body;
      }
    }
    return { best, x, y, width: rect.width };
  }

  const tagFor = (entry: CatalogEntry) =>
    entry.lines.length > 0
      ? entry.lines.map((line) => (
          <span key={line.segment} className={line.channel === 'dev' ? 'tag dev' : 'tag'}>
            {line.channel === 'dev' ? `dev ${line.version}` : `${line.name} · ${line.version}`}
          </span>
        ))
      : [<span key="kind" className="tag">{entry.kind}</span>];

  return (
    <>
      <canvas
        ref={canvasRef}
        className="orbit"
        role="img"
        aria-label="Map of every documented release: each ring is an ecosystem, each body a package or project, each moon one documented version. Unreleased versions are drawn dashed. The list under the search field has the same information."
        onPointerMove={(event) => {
          const { best, x, y, width } = hit(event);
          hoverRef.current = best?.entry ?? null;
          setHover(best ? { entry: best.entry, x: Math.min(x + 16, width - 220), y: y + 16 } : null);
        }}
        onPointerLeave={() => {
          hoverRef.current = null;
          setHover(null);
        }}
        onClick={(event) => {
          const { best } = hit(event);
          if (best) {
            onPick(best.entry);
          }
        }}
      />
      <div
        className={hover ? 'orbit-tip on' : 'orbit-tip'}
        style={hover ? { left: hover.x, top: hover.y } : undefined}
        aria-hidden
      >
        {hover && (
          <>
            <b>{hover.entry.title}</b>
            {hover.entry.description && <p>{hover.entry.description}</p>}
            <div className="tags">{tagFor(hover.entry)}</div>
          </>
        )}
      </div>
    </>
  );
}
