'use client';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { CatalogEntry } from '@/lib/catalog';
import { kindName, presentRings, ringOf, type Ring } from '@/lib/rings';

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

const tilt = 0.36;
// Below this width the system sits above the hero text instead of beside it (home.css).
const stacked = 860;

/**
 * The system (ADR-0017 decision 2): the star, an orbit per ecosystem, every planet labelled with
 * its moons, its night side turned away from the star.
 */
export function OrbitMap({ entries, star }: { entries: CatalogEntry[]; star: string }) {
  const router = useRouter();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hover, setHover] = useState<Hover | null>(null);
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
        faint: token('--home-faint'),
        bg: token('--home-bg'),
        star: token('--home-star'),
        glow: token('--home-star-glow'),
        data: token('--home-font-data'),
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
      base = width > stacked ? Math.min(width * 0.26, height * 0.58) : Math.min(width * 0.44, 190);
      bodiesRef.current = entries.map((entry) => {
        const ring = rings.indexOf(ringOf(entry));
        const siblings = entries.filter((other) => ringOf(other) === ringOf(entry));
        return {
          entry,
          ring,
          angle: (siblings.indexOf(entry) / siblings.length) * Math.PI * 2 + ring * 1.3 + 0.6,
          lit: 0,
          x: 0,
          y: 0,
          depth: 0,
        };
      });
    }

    const radius = (ring: number) =>
      rings.length === 1 ? base * 0.62 : base * (0.34 + (ring * 0.66) / (rings.length - 1));
    const cx = () => (width > stacked ? width * 0.7 : width / 2);
    const cy = () => (width > stacked ? height * 0.5 : 160);

    function drawStar() {
      const glow = context!.createRadialGradient(cx(), cy(), 0, cx(), cy(), base * 0.34);
      glow.addColorStop(0, colors.glow);
      glow.addColorStop(1, 'transparent');
      context!.fillStyle = glow;
      context!.beginPath();
      context!.arc(cx(), cy(), base * 0.34, 0, Math.PI * 2);
      context!.fill();
      context!.fillStyle = colors.star;
      context!.beginPath();
      context!.arc(cx(), cy(), 9, 0, Math.PI * 2);
      context!.fill();
      context!.font = `500 11px ${colors.data}`;
      context!.fillStyle = colors.faint;
      context!.textAlign = 'center';
      context!.fillText(star, cx(), cy() + 28);
      context!.textAlign = 'left';
    }

    function draw(now: number) {
      const delta = Math.min(0.05, (now - last) / 1000);
      last = now;
      if (!reduce.matches) {
        time += delta * (hoverRef.current ? 0.15 : 1);
      }
      context!.clearRect(0, 0, width, height);
      drawStar();

      rings.forEach((_, index) => {
        context!.beginPath();
        context!.ellipse(cx(), cy(), radius(index), radius(index) * tilt, 0, 0, Math.PI * 2);
        context!.strokeStyle = colors.line;
        context!.globalAlpha = entries.length === 0 ? 0.35 : 0.7;
        context!.lineWidth = 1;
        context!.stroke();
      });
      context!.globalAlpha = 1;

      const bodies = bodiesRef.current;
      for (const body of bodies) {
        const angle = body.angle + time * (0.07 / (1 + body.ring * 0.5));
        body.x = cx() + Math.cos(angle) * radius(body.ring);
        body.y = cy() + Math.sin(angle) * radius(body.ring) * tilt;
        body.depth = Math.sin(angle);
        const target = hoverRef.current === body.entry ? 1 : 0;
        body.lit += (target - body.lit) * (reduce.matches ? 1 : 0.12);
      }

      for (const body of [...bodies].sort((a, b) => a.depth - b.depth)) {
        const color = colors.ring(ringOf(body.entry));
        const scale = 0.82 + (body.depth + 1) * 0.16;
        const size = (body.entry.kind === 'project' ? 6 : 7) * scale * (1 + body.lit * 0.25);

        body.entry.lines.forEach((line, index) => {
          const orbit = (15 + index * 6) * scale;
          const angle = time * (1 - index * 0.15) + index * 2.1 + body.angle;
          context!.beginPath();
          context!.ellipse(body.x, body.y, orbit, orbit * 0.5, 0, 0, Math.PI * 2);
          context!.strokeStyle = color;
          context!.globalAlpha = 0.25;
          context!.setLineDash(line.channel === 'dev' ? [2, 3] : []);
          context!.stroke();
          context!.setLineDash([]);
          context!.globalAlpha = 1;
          context!.beginPath();
          context!.arc(body.x + Math.cos(angle) * orbit, body.y + Math.sin(angle) * orbit * 0.5, 2.2 * scale, 0, Math.PI * 2);
          if (line.channel === 'dev') {
            context!.fillStyle = colors.bg;
            context!.fill();
            context!.strokeStyle = color;
            context!.stroke();
          } else {
            context!.fillStyle = color;
            context!.globalAlpha = line.channel === 'legacy' ? 0.55 : 1;
            context!.fill();
            context!.globalAlpha = 1;
          }
        });

        if (body.entry.kind === 'project') {
          context!.beginPath();
          context!.ellipse(body.x, body.y, size * 2, size * 0.6, -0.3, 0, Math.PI * 2);
          context!.strokeStyle = color;
          context!.lineWidth = 1.4;
          context!.stroke();
          context!.beginPath();
          context!.arc(body.x, body.y, size, 0, Math.PI * 2);
          context!.fillStyle = colors.bg;
          context!.fill();
          context!.lineWidth = 1.8;
          context!.stroke();
          context!.lineWidth = 1;
        } else {
          context!.beginPath();
          context!.arc(body.x, body.y, size, 0, Math.PI * 2);
          context!.fillStyle = color;
          context!.fill();
          const away = Math.atan2(body.y - cy(), body.x - cx());
          context!.beginPath();
          context!.arc(body.x, body.y, size, away - Math.PI / 2, away + Math.PI / 2);
          context!.closePath();
          context!.fillStyle = 'rgba(0, 0, 0, 0.28)';
          context!.fill();
        }

        context!.font = `500 12px ${colors.data}`;
        context!.fillStyle = colors.ink;
        context!.globalAlpha = Math.min(1, 0.55 + (body.depth + 1) * 0.22 + body.lit);
        const offset = body.entry.kind === 'project' ? size * 2 + 6 : size + 9;
        context!.fillText(body.entry.title, body.x + offset, body.y + 4);
        context!.globalAlpha = 1;
      }

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
  }, [entries, star]);

  // Under reduced motion the loop is stopped, so a hover change asks for one more frame.
  useEffect(() => {
    canvasRef.current?.dispatchEvent(new Event('redraw'));
  }, [hover]);

  function hit(event: React.MouseEvent<HTMLCanvasElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    let best: Body | undefined;
    let distance = 24;
    for (const body of bodiesRef.current) {
      const d = Math.hypot(body.x - x, body.y - y);
      if (d < distance) {
        distance = d;
        best = body;
      }
    }
    return { best, x, y, width: rect.width };
  }

  return (
    <>
      <canvas
        ref={canvasRef}
        className="orbit"
        role="img"
        aria-label={`The system: the star is ${star}; each orbit is an ecosystem, each planet a package or project, each moon a documented version, dashed when unreleased. The cards below list the same planets.`}
        onPointerMove={(event) => {
          const { best, x, y, width } = hit(event);
          hoverRef.current = best?.entry ?? null;
          setHover(best ? { entry: best.entry, x: Math.min(x + 16, width - 230), y: y + 16 } : null);
        }}
        onPointerLeave={() => {
          hoverRef.current = null;
          setHover(null);
        }}
        onClick={(event) => {
          const { best } = hit(event);
          if (best) {
            router.push(best.entry.url);
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
            <small>
              {kindName[ringOf(hover.entry)]}
              {hover.entry.latest ? ` · ${hover.entry.latest.version}` : ''} · click to open
            </small>
          </>
        )}
      </div>
    </>
  );
}
