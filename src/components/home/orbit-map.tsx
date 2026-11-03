'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ZoomIn, ZoomOut } from 'lucide-react';
import type { CatalogEntry } from '@/lib/catalog';
import { kindName, ringName, ringOf, type Ring } from '@/lib/rings';
import { starField, type Star } from '@/lib/sky';
import { easeZoom, farPlanets, systemScale, verseFragment } from '@/lib/verse-view';
import {
  cometPath,
  cometSeconds,
  cometStarts,
  corona,
  heroRings,
  lean,
  mixHex,
  orbitDistance,
  spinUp,
  systemFacts,
  trailArc,
  trailLength,
} from '@/lib/hero-sky';
import { privateProjects } from './private-projects';

interface Body {
  entry: CatalogEntry;
  ring: number;
  angle: number;
  lit: number;
  x: number;
  y: number;
  depth: number;
}

type Hover = { x: number; y: number } & ({ entry: CatalogEntry } | { ring: Ring });

interface Geometry {
  cx: number;
  cy: number;
  tilt: number;
  radii: number[];
  empty: Ring[];
  rings: Ring[];
}

// Below this width the system sits above the hero text instead of beside it (home.css).
const stacked = 860;
const farNames = privateProjects.map((project) => project.slug);
const spunKey = 'puncoz-verse:hero-spun';
// Empty orbits' names sit on their upper left, each a little further round, so none overlap (ADR-0032 decision 1).
const labelAngle = (ring: number) => Math.PI + (54 + ring * 15) * (Math.PI / 180);
const comets = cometStarts(5, 400);
const cometPeriod = comets[comets.length - 1] + 30;

function shouldSpinUp(reduce: boolean): boolean {
  if (reduce || location.hash === verseFragment) {
    return false;
  }
  try {
    if (sessionStorage.getItem(spunKey)) {
      return false;
    }
    sessionStorage.setItem(spunKey, '1');
  } catch {
    // Without storage the arrival simply runs on every visit (ADR-0032 decision 5).
  }
  return true;
}

/**
 * The system (ADR-0017 decision 2): the star, an orbit per ecosystem, every planet labelled with
 * its moons, its night side turned away from the star. Zoomed out, it is the Verse: the system small
 * and still turning, the belt and the private planets far beyond it (ADR-0029 decision 5). It
 * comes alive under ADR-0032: every ecosystem's orbit, a living star, trails, pointer depth, the
 * arrival, the telemetry line and a comet now and then.
 */
export function OrbitMap({ entries, star }: { entries: CatalogEntry[]; star: string }) {
  const router = useRouter();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hover, setHover] = useState<Hover | null>(null);
  const hoverRef = useRef<CatalogEntry | null>(null);
  const bodiesRef = useRef<Body[]>([]);
  const [verse, setVerse] = useState(false);
  const verseRef = useRef(false);
  const geometryRef = useRef<Geometry | null>(null);
  const leanRef = useRef({ nx: 0, ny: 0 });
  const facts = useMemo(() => systemFacts(entries), [entries]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d');
    if (!canvas || !context) {
      return;
    }

    const reduce = matchMedia('(prefers-reduced-motion: reduce)');
    const rings = heroRings(entries);
    const present = new Set(entries.map(ringOf));
    const hero = canvas.parentElement;
    const style = getComputedStyle(canvas);
    const token = (name: string) => style.getPropertyValue(name).trim();
    let colors = readColors();
    let width = 0;
    let height = 0;
    let base = 0;
    let time = 0;
    // The star and the comet keep their own time: pointing at a planet slows only the orbits.
    let skyTime = 0;
    const spinning = shouldSpinUp(reduce.matches);
    let leaning = { nx: 0, ny: 0 };
    let drawnLean = '';
    let last = performance.now();
    let frame = 0;
    let visible = true;
    // Opening `/#verse` eases out from the system too (ADR-0029 decision 5).
    let zoom = 0;
    let sky: Star[] = [];
    let belt: { angle: number; spread: number; size: number }[] = [];

    function readColors() {
      return {
        line: token('--home-line-2'),
        ink: token('--home-ink'),
        faint: token('--home-faint'),
        bg: token('--home-bg'),
        night: token('--home-night'),
        star: token('--home-star'),
        glow: token('--home-star-glow'),
        data: token('--home-font-data'),
        ring: (ring: Ring) => token(`--home-${ring}`),
        empty: (ring: Ring) => mixHex(token('--home-line-2'), token(`--home-${ring}`), 0.35),
      };
    }

    function layout() {
      const ratio = Math.min(devicePixelRatio || 1, 2);
      width = canvas!.clientWidth;
      height = canvas!.clientHeight;
      canvas!.width = width * ratio;
      canvas!.height = height * ratio;
      context!.setTransform(ratio, 0, 0, ratio, 0, 0);
      base = width > stacked ? Math.min(width * 0.26, height * 0.58, width * 0.3 - 24) : Math.min(width * 0.44, 190);
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
      sky = starField({ seed: 11, count: Math.round((width * height) / 7000), width, height, clear: 0, even: true });
      let seed = 7;
      const next = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
      belt = Array.from({ length: 150 }, () => ({ angle: next() * Math.PI * 2, spread: (next() - 0.5) * 0.14, size: 0.5 + next() }));
      hero?.style.setProperty('--star-x', `${starX()}px`);
      hero?.style.setProperty('--star-y', `${starY()}px`);
      hero?.style.setProperty('--nebula-r', `${Math.round(base * 1.4)}px`);
    }

    const radius = (ring: number) =>
      rings.length === 1 ? base * 0.62 : base * (0.34 + (ring * 0.66) / (rings.length - 1));
    const starX = () => (width > stacked ? width * 0.7 : width / 2);
    const starY = () => (width > stacked ? height * 0.5 : 160);
    let depth = lean(0, 0);
    const cx = () => starX() + depth.dx;
    const cy = () => starY() + depth.dy;
    const starRadius = 14;

    function drawStar(lit: number, glow: number) {
      const { breath, rays } = corona(skyTime);
      const layers = [
        [0.5, 0.35],
        [0.32, 0.6],
        [0.2, 0.9],
      ];
      for (const [reach, strength] of layers) {
        const gradient = context!.createRadialGradient(cx(), cy(), 0, cx(), cy(), base * reach);
        gradient.addColorStop(0, colors.glow);
        gradient.addColorStop(1, 'transparent');
        context!.globalAlpha = Math.min(1, strength * breath) * glow;
        context!.fillStyle = gradient;
        context!.beginPath();
        context!.arc(cx(), cy(), base * reach, 0, Math.PI * 2);
        context!.fill();
      }
      context!.globalAlpha = 0.25 * glow;
      context!.strokeStyle = colors.star;
      context!.lineCap = 'round';
      for (let ray = 0; ray < 8; ray++) {
        const angle = rays + (ray * Math.PI) / 4;
        const inner = starRadius * lit + 5;
        const outer = inner + (ray % 2 ? 10 : 18);
        context!.beginPath();
        context!.moveTo(cx() + Math.cos(angle) * inner, cy() + Math.sin(angle) * inner);
        context!.lineTo(cx() + Math.cos(angle) * outer, cy() + Math.sin(angle) * outer);
        context!.stroke();
      }
      context!.lineCap = 'butt';
      context!.globalAlpha = 1;
      context!.fillStyle = colors.star;
      context!.beginPath();
      context!.arc(cx(), cy(), starRadius * lit, 0, Math.PI * 2);
      context!.fill();
    }

    function drawStarLabel(scale: number) {
      context!.font = `500 11px ${colors.data}`;
      context!.fillStyle = colors.faint;
      context!.textAlign = 'center';
      context!.fillText(star, cx(), cy() + starRadius * scale + 19);
      context!.textAlign = 'left';
    }

    function drawComet() {
      const at = skyTime % cometPeriod;
      const index = comets.findIndex((start) => at >= start && at < start + cometSeconds);
      if (index < 0) {
        return;
      }
      // Below the site header, which the canvas runs under.
      const area = { width, cx: cx(), cy: cy(), boundary: width > stacked ? width * 0.52 : 0, top: 72 };
      const { head, tail, alpha } = cometPath(area, index, (at - comets[index]) / cometSeconds);
      const gradient = context!.createLinearGradient(head.x, head.y, tail.x, tail.y);
      gradient.addColorStop(0, colors.ink);
      gradient.addColorStop(1, 'transparent');
      context!.globalAlpha = 0.75 * alpha;
      context!.strokeStyle = gradient;
      context!.lineWidth = 1.6;
      context!.lineCap = 'round';
      context!.beginPath();
      context!.moveTo(head.x, head.y);
      context!.lineTo(tail.x, tail.y);
      context!.stroke();
      context!.lineCap = 'butt';
      context!.lineWidth = 1;
      context!.fillStyle = colors.ink;
      context!.globalAlpha = alpha;
      context!.beginPath();
      context!.arc(head.x, head.y, 1.8, 0, Math.PI * 2);
      context!.fill();
      context!.globalAlpha = 1;
    }

    function updateLean(delta: number) {
      const target = reduce.matches ? { nx: 0, ny: 0 } : leanRef.current;
      const step = reduce.matches ? 1 : 1 - Math.exp(-delta * 5);
      leaning = { nx: leaning.nx + (target.nx - leaning.nx) * step, ny: leaning.ny + (target.ny - leaning.ny) * step };
      depth = lean(leaning.nx, leaning.ny);
      const key = `${depth.nebulaX},${depth.nebulaY}`;
      if (hero && key !== drawnLean) {
        drawnLean = key;
        hero.style.setProperty('--nebula-x', `${depth.nebulaX}px`);
        hero.style.setProperty('--nebula-y', `${depth.nebulaY}px`);
      }
    }

    function drawVerse(outer: number) {
      context!.globalAlpha = zoom;
      for (const point of sky) {
        context!.globalAlpha = zoom * point.o;
        context!.fillStyle = point.bright ? colors.ink : colors.faint;
        context!.beginPath();
        context!.arc(point.x, point.y, point.r, 0, Math.PI * 2);
        context!.fill();
      }
      const beltTilt = depth.tilt;
      const beltRadius = Math.max(outer * systemScale(1) * 1.7, base * 0.5);
      context!.fillStyle = colors.faint;
      for (const rock of belt) {
        const reach = beltRadius * (1 + rock.spread);
        context!.globalAlpha = zoom * 0.6;
        context!.beginPath();
        context!.arc(cx() + Math.cos(rock.angle) * reach, cy() + Math.sin(rock.angle) * reach * beltTilt, rock.size, 0, Math.PI * 2);
        context!.fill();
      }
      const far = farPlanets(farNames, { cx: cx(), cy: cy(), reach: beltRadius * 1.6, width, height });
      context!.font = `500 11px ${colors.data}`;
      for (const planet of far) {
        context!.globalAlpha = zoom * 0.85;
        context!.beginPath();
        context!.arc(planet.x, planet.y, 5, 0, Math.PI * 2);
        context!.fillStyle = colors.night;
        context!.fill();
        context!.strokeStyle = colors.line;
        context!.lineWidth = 1;
        context!.stroke();
        // A thin crescent of light on the side that faces the star.
        const toward = Math.atan2(cy() - planet.y, cx() - planet.x);
        context!.beginPath();
        context!.arc(planet.x, planet.y, 5, toward - 1.1, toward + 1.1);
        context!.strokeStyle = colors.faint;
        context!.lineWidth = 1.5;
        context!.stroke();
        context!.lineWidth = 1;
        context!.fillStyle = colors.faint;
        context!.fillText(planet.name, planet.x + 10, planet.y + 4);
      }
      context!.globalAlpha = 1;
    }

    function draw(now: number) {
      const delta = Math.min(0.05, (now - last) / 1000);
      last = now;
      if (!reduce.matches) {
        time += delta * (hoverRef.current ? 0.15 : 1);
        skyTime += delta;
      }
      updateLean(delta);
      const arrival = spinning ? spinUp(skyTime) : spinUp(Infinity);
      zoom = easeZoom(zoom, verseRef.current ? 1 : 0, delta, reduce.matches);
      const scale = systemScale(zoom);
      const orbitTilt = depth.tilt;
      context!.clearRect(0, 0, width, height);
      if (zoom > 0) {
        drawVerse(radius(Math.max(0, rings.length - 1)));
      }
      context!.save();
      context!.translate(cx(), cy());
      context!.scale(scale, scale);
      context!.translate(-cx(), -cy());
      drawStar(arrival.star, arrival.corona);

      const empty = rings.filter((ring) => !present.has(ring));
      rings.forEach((ring, index) => {
        const open = !present.has(ring);
        context!.beginPath();
        context!.ellipse(cx(), cy(), radius(index), radius(index) * orbitTilt, 0, 0, Math.PI * 2);
        context!.strokeStyle = open ? colors.empty(ring) : colors.line;
        context!.globalAlpha = (open ? 0.6 : 0.7) * arrival.orbits;
        context!.lineWidth = open ? 0.75 : 1;
        context!.stroke();
      });
      context!.lineWidth = 1;
      context!.font = `500 11px ${colors.data}`;
      context!.fillStyle = colors.faint;
      context!.textAlign = 'center';
      rings.forEach((ring, index) => {
        if (present.has(ring)) {
          return;
        }
        const angle = labelAngle(index);
        context!.globalAlpha = arrival.orbits * (1 - zoom);
        context!.fillText(
          ringName[ring],
          cx() + Math.cos(angle) * radius(index),
          cy() + Math.sin(angle) * radius(index) * orbitTilt - 5,
        );
      });
      context!.textAlign = 'left';
      context!.globalAlpha = 1;
      geometryRef.current = {
        cx: cx(),
        cy: cy(),
        tilt: orbitTilt,
        radii: rings.map((_, index) => radius(index)),
        empty,
        rings,
      };

      const bodies = bodiesRef.current;
      const angles = new Map<Body, number>();
      for (const body of bodies) {
        const angle = body.angle + time * (0.07 / (1 + body.ring * 0.5)) + arrival.offset;
        angles.set(body, angle);
        body.x = cx() + Math.cos(angle) * radius(body.ring);
        body.y = cy() + Math.sin(angle) * radius(body.ring) * orbitTilt;
        body.depth = Math.sin(angle);
        const target = hoverRef.current === body.entry ? 1 : 0;
        body.lit += (target - body.lit) * (reduce.matches ? 1 : 0.12);
      }

      // Each planet's trail fades behind it along its orbit (ADR-0032 decision 3).
      context!.lineWidth = 2;
      for (const body of bodies) {
        const { from } = trailArc(angles.get(body)!);
        const steps = 18;
        context!.strokeStyle = colors.ring(ringOf(body.entry));
        for (let step = 0; step < steps; step++) {
          const a0 = from + (step / steps) * trailLength;
          const a1 = from + ((step + 1) / steps) * trailLength;
          context!.globalAlpha = 0.35 * ((step + 1) / steps) * arrival.orbits;
          context!.beginPath();
          context!.ellipse(cx(), cy(), radius(body.ring), radius(body.ring) * orbitTilt, 0, a0, a1);
          context!.stroke();
        }
      }
      context!.lineWidth = 1;
      context!.globalAlpha = 1;

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
        context!.globalAlpha = Math.min(1, 0.55 + (body.depth + 1) * 0.22 + body.lit) * (1 - zoom);
        const offset = body.entry.kind === 'project' ? size * 2 + 6 : size + 9;
        // Near the canvas's right edge the name goes on the planet's left, so it is never cut.
        const fits = body.x + offset + context!.measureText(body.entry.title).width <= width - 8;
        context!.textAlign = fits ? 'left' : 'right';
        const nameX = fits ? body.x + offset : body.x - offset;
        // On a narrow screen a long name crosses the empty orbits' names as it turns; the halo keeps it readable.
        context!.strokeStyle = colors.bg;
        context!.lineWidth = 3;
        context!.lineJoin = 'round';
        context!.strokeText(body.entry.title, nameX, body.y + 4);
        context!.fillText(body.entry.title, nameX, body.y + 4);
        context!.textAlign = 'left';
        context!.globalAlpha = 1;
      }
      context!.restore();
      drawStarLabel(scale);
      if (zoom === 0 && !reduce.matches) {
        drawComet();
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

    // The system leans toward a fine pointer moving over the hero (ADR-0032 decision 4).
    const fine = matchMedia('(pointer: fine)');
    const onLean = (event: PointerEvent) => {
      if (!fine.matches || event.pointerType === 'touch' || !hero) {
        return;
      }
      const rect = hero.getBoundingClientRect();
      leanRef.current = {
        nx: (event.clientX - rect.left - starX()) / (rect.width / 2),
        ny: (event.clientY - rect.top - starY()) / (rect.height / 2),
      };
    };
    const onLeave = () => {
      leanRef.current = { nx: 0, ny: 0 };
    };
    hero?.addEventListener('pointermove', onLean);
    hero?.addEventListener('pointerleave', onLeave);

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      themeObserver.disconnect();
      document.removeEventListener('visibilitychange', onVisibility);
      removeEventListener('resize', onResize);
      reduce.removeEventListener('change', start);
      canvas.removeEventListener('redraw', redraw);
      hero?.removeEventListener('pointermove', onLean);
      hero?.removeEventListener('pointerleave', onLeave);
    };
  }, [entries, star]);

  // Under reduced motion the loop is stopped, so a hover change asks for one more frame.
  useEffect(() => {
    canvasRef.current?.dispatchEvent(new Event('redraw'));
  }, [hover]);

  useEffect(() => {
    const sync = () => setVerse(location.hash === verseFragment);
    sync();
    addEventListener('hashchange', sync);
    return () => removeEventListener('hashchange', sync);
  }, []);

  useEffect(() => {
    verseRef.current = verse;
    canvasRef.current?.dispatchEvent(new Event('redraw'));
  }, [verse]);

  function toggleVerse() {
    const next = !verseRef.current;
    hoverRef.current = null;
    setHover(null);
    // Keeps Next.js' own history state and adds no history entry; `/#verse` stays shareable.
    history.replaceState(history.state, '', next ? verseFragment : location.pathname + location.search);
    setVerse(next);
  }

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
    let orbit: Ring | undefined;
    const geometry = geometryRef.current;
    if (!best && geometry) {
      for (const ring of geometry.empty) {
        const r = geometry.radii[geometry.rings.indexOf(ring)];
        if (orbitDistance(x, y, { cx: geometry.cx, cy: geometry.cy, rx: r, ry: r * geometry.tilt }) <= 8) {
          orbit = ring;
          break;
        }
      }
    }
    return { best, orbit, x, y, width: rect.width };
  }

  return (
    <>
      <div className="orbit-nebula" aria-hidden />
      <canvas
        ref={canvasRef}
        className="orbit"
        data-verse={verse ? '' : undefined}
        role="img"
        aria-label={
          verse
            ? `The Verse: the one system around ${star}, small, with the asteroid belt and the private projects far beyond it.`
            : `The system: the star is ${star}; each orbit is an ecosystem, each planet a package or project, each moon a documented version, dashed when unreleased. The cards below list the same planets.`
        }
        onPointerMove={(event) => {
          if (verseRef.current) {
            return;
          }
          const { best, orbit, x, y, width } = hit(event);
          hoverRef.current = best?.entry ?? null;
          const at = { x: Math.min(x + 16, width - 230), y: y + 16 };
          setHover(best ? { entry: best.entry, ...at } : orbit ? { ring: orbit, ...at } : null);
        }}
        onPointerLeave={() => {
          hoverRef.current = null;
          setHover(null);
        }}
        onClick={(event) => {
          if (verseRef.current) {
            toggleVerse();
            return;
          }
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
        {hover && 'ring' in hover && (
          <>
            <b>{ringName[hover.ring]}</b>
            <p>No planets yet</p>
          </>
        )}
        {hover && 'entry' in hover && (
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
      <div className="orbit-zoom-row">
        <p className="orbit-caption" aria-live="polite" key={verse ? 'verse' : 'system'}>
          {verse ? (
            'The Verse · one system so far'
          ) : (
            <>
              <span aria-hidden>{facts.line}</span>
              <span className="sr-only">{facts.sentence}</span>
            </>
          )}
        </p>
        <button type="button" className="orbit-zoom" onClick={toggleVerse}>
          {verse ? <ZoomIn aria-hidden /> : <ZoomOut aria-hidden />}
          {verse ? 'Back to the system' : 'Zoom out to the Verse'}
        </button>
      </div>
    </>
  );
}
