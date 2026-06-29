import { useEffect, useRef } from 'react';
import { useReducedMotion } from 'framer-motion';

// GridFlowScene — an animated power single-line diagram for the substation /
// interconnection panels. Source nodes on the left feed a transformer bus that
// fans out to feeders on the right; energy pulses stream continuously along the
// connections, the nodes pulse, and an AC waveform scrolls along the bottom —
// "live, energized interconnection." Light brand theme; 2D canvas, reduced-
// motion safe, pauses off-screen.

const SLATE = '100, 116, 139';

function hexToRgb(hex: string): string {
  const h = hex.replace('#', '');
  const n = parseInt(h.length === 3 ? h.split('').map((c) => c + c).join('') : h, 16);
  return `${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}`;
}

// Normalised one-line diagram. Energy flows from sources (left) to feeders.
const NODES: { x: number; y: number; r: number }[] = [
  { x: 0.12, y: 0.26, r: 1.0 }, // source A
  { x: 0.12, y: 0.62, r: 1.0 }, // source B
  { x: 0.34, y: 0.44, r: 1.1 }, // collector
  { x: 0.56, y: 0.44, r: 1.4 }, // transformer bus (hub)
  { x: 0.82, y: 0.20, r: 0.9 }, // feeder 1
  { x: 0.82, y: 0.44, r: 0.9 }, // feeder 2
  { x: 0.82, y: 0.68, r: 0.9 }, // feeder 3
];
const EDGES: [number, number][] = [
  [0, 2], [1, 2], [2, 3], [3, 4], [3, 5], [3, 6],
];

export function GridFlowScene({ accent, className, dark = false }: { accent: string; className?: string; dark?: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reduced = useReducedMotion();
  // Palette: light panel (default) or a dark "window into the substation" used
  // in the model-journey cards alongside the dark Discovery / Datacenter scenes.
  const LINE = dark ? '150, 180, 210' : SLATE;
  const BG0 = dark ? '#0c1622' : '#ffffff';
  const BG1 = dark ? '#070d16' : '#eef2f7';
  const NODE_FILL = dark ? 'rgba(14,26,40,0.92)' : 'rgba(255,255,255,0.9)';

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const ACCENT = hexToRgb(accent);

    let W = 0;
    let H = 0;
    let dpr = 1;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = rect.width;
      H = rect.height;
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    // Diagram lives in the top ~78%; the AC waveform owns the bottom band.
    const px = (n: number) => 18 + n * (W - 36);
    const py = (n: number) => 14 + n * (H * 0.78 - 14);

    const roundRect = (x: number, y: number, w: number, h: number, r: number) => {
      const rr = Math.min(r, w / 2, h / 2);
      ctx.beginPath();
      ctx.moveTo(x + rr, y);
      ctx.arcTo(x + w, y, x + w, y + h, rr);
      ctx.arcTo(x + w, y + h, x, y + h, rr);
      ctx.arcTo(x, y + h, x, y, rr);
      ctx.arcTo(x, y, x + w, y, rr);
      ctx.closePath();
    };

    const frame = (t: number) => {
      if (!W) resize();
      if (!W) return;

      const bg = ctx.createLinearGradient(0, 0, 0, H);
      bg.addColorStop(0, BG0);
      bg.addColorStop(1, BG1);
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, W, H);

      // Edges — faint conductors.
      ctx.lineWidth = 1.25;
      for (const [a, b] of EDGES) {
        ctx.strokeStyle = `rgba(${LINE}, 0.22)`;
        ctx.beginPath();
        ctx.moveTo(px(NODES[a].x), py(NODES[a].y));
        ctx.lineTo(px(NODES[b].x), py(NODES[b].y));
        ctx.stroke();
      }

      // Energy pulses travelling source→feeder along each edge.
      for (let e = 0; e < EDGES.length; e++) {
        const [a, b] = EDGES[e];
        const ax = px(NODES[a].x), ay = py(NODES[a].y);
        const bx = px(NODES[b].x), by = py(NODES[b].y);
        const dots = 2;
        for (let k = 0; k < dots; k++) {
          const tt = (t * 0.32 + k / dots + e * 0.17) % 1;
          const x = ax + (bx - ax) * tt;
          const y = ay + (by - ay) * tt;
          const a2 = Math.sin(tt * Math.PI); // fade at the ends
          const g = ctx.createRadialGradient(x, y, 0, x, y, 6);
          g.addColorStop(0, `rgba(${ACCENT}, ${0.85 * a2})`);
          g.addColorStop(1, `rgba(${ACCENT}, 0)`);
          ctx.fillStyle = g;
          ctx.beginPath();
          ctx.arc(x, y, 6, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Nodes — transformer/bus squares that pulse.
      for (let i = 0; i < NODES.length; i++) {
        const n = NODES[i];
        const x = px(n.x), y = py(n.y);
        const s = 7 * n.r;
        const pulse = 0.5 + 0.5 * Math.sin(t * 2 + i * 1.3);
        ctx.fillStyle = NODE_FILL;
        ctx.strokeStyle = `rgba(${ACCENT}, ${0.45 + 0.4 * pulse})`;
        ctx.lineWidth = 1.5;
        roundRect(x - s, y - s, s * 2, s * 2, s * 0.5);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = `rgba(${ACCENT}, ${0.35 + 0.45 * pulse})`;
        ctx.beginPath();
        ctx.arc(x, y, s * 0.42, 0, Math.PI * 2);
        ctx.fill();
      }

      // AC waveform — live power along the bottom band.
      const wt = H * 0.84;
      const wh = H - wt - 12;
      const midY = wt + wh / 2;
      ctx.strokeStyle = `rgba(${LINE}, 0.18)`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(18, midY);
      ctx.lineTo(W - 18, midY);
      ctx.stroke();

      ctx.beginPath();
      const N = 80;
      for (let i = 0; i <= N; i++) {
        const x = 18 + (i / N) * (W - 36);
        const ph = (i / N) * Math.PI * 6 - t * 3;
        const y = midY - Math.sin(ph) * (wh * 0.4) * (0.75 + 0.25 * Math.sin(t * 1.3 + i * 0.05));
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.strokeStyle = `rgba(${ACCENT}, 0.7)`;
      ctx.lineWidth = 1.5;
      ctx.stroke();
    };

    let raf = 0;
    let running = true;
    const loop = (now: number) => {
      if (!running) return;
      frame(now / 1000);
      raf = requestAnimationFrame(loop);
    };

    if (reduced) {
      const redraw = () => { resize(); if (W) frame(0.5); };
      const ro = new ResizeObserver(redraw);
      ro.observe(canvas);
      redraw();
      return () => ro.disconnect();
    }

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting && !running) { running = true; raf = requestAnimationFrame(loop); }
        else if (!e.isIntersecting) { running = false; cancelAnimationFrame(raf); }
      },
      { threshold: 0.01 },
    );
    io.observe(canvas);
    raf = requestAnimationFrame(loop);
    return () => {
      running = false;
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
    };
  }, [accent, reduced, dark, LINE, BG0, BG1, NODE_FILL]);

  return <canvas ref={canvasRef} className={className} aria-hidden />;
}

export default GridFlowScene;
