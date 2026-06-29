import { useEffect, useRef } from 'react';
import { useReducedMotion } from 'framer-motion';

// FacilityScene — a dark, animated top-down "aerial" of the flagship campus for
// the Flagship cinematic band (which is intentionally dark with white text). A
// cluster of buildings with twinkling lit windows, a substation that feeds power
// along transmission lines into the campus (energy pulses), a slow parcel-grid
// drift and a radar-style sweep. Navy base with warm/cool brand glows so the
// overlaid white copy still reads. 2D canvas, reduced-motion safe.

const WARM = '247, 147, 26';
const COOL = '16, 165, 199';

// Normalised building footprints (x, y, w, h) — a compact campus, weighted to
// the upper-right where the band's overlay is lightest.
const BUILDINGS = [
  { x: 0.44, y: 0.30, w: 0.16, h: 0.15, cool: false },
  { x: 0.64, y: 0.24, w: 0.12, h: 0.12, cool: true },
  { x: 0.60, y: 0.46, w: 0.19, h: 0.13, cool: false },
  { x: 0.42, y: 0.50, w: 0.13, h: 0.12, cool: true },
  { x: 0.81, y: 0.42, w: 0.10, h: 0.20, cool: false },
];
const SUBSTATION = { x: 0.26, y: 0.70 };

export function FacilityScene({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

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

    const X = (n: number) => n * W;
    const Y = (n: number) => n * H;

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

      // Navy base with a soft radial lift toward the upper-right.
      const bg = ctx.createLinearGradient(0, 0, 0, H);
      bg.addColorStop(0, '#0b1426');
      bg.addColorStop(1, '#060b16');
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, W, H);
      const lift = ctx.createRadialGradient(X(0.7), Y(0.32), 0, X(0.7), Y(0.32), Math.max(W, H) * 0.7);
      lift.addColorStop(0, 'rgba(40, 60, 95, 0.5)');
      lift.addColorStop(1, 'rgba(40, 60, 95, 0)');
      ctx.fillStyle = lift;
      ctx.fillRect(0, 0, W, H);

      // Drifting parcel grid.
      const cell = Math.max(46, W / 22);
      const off = (t * 6) % cell;
      ctx.strokeStyle = 'rgba(255,255,255,0.04)';
      ctx.lineWidth = 1;
      for (let x = -off; x < W; x += cell) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, H);
        ctx.stroke();
      }
      for (let y = -off; y < H; y += cell) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(W, y);
        ctx.stroke();
      }

      // Transmission lines: substation → each building, with energy pulses.
      const sx = X(SUBSTATION.x);
      const sy = Y(SUBSTATION.y);
      for (let b = 0; b < BUILDINGS.length; b++) {
        const bld = BUILDINGS[b];
        const cx = X(bld.x + bld.w / 2);
        const cy = Y(bld.y + bld.h / 2);
        ctx.strokeStyle = 'rgba(255,255,255,0.08)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(sx, sy);
        ctx.lineTo(cx, cy);
        ctx.stroke();
        const col = bld.cool ? COOL : WARM;
        for (let k = 0; k < 2; k++) {
          const tt = (t * 0.3 + k / 2 + b * 0.21) % 1;
          const x = sx + (cx - sx) * tt;
          const y = sy + (cy - sy) * tt;
          const a = Math.sin(tt * Math.PI);
          const g = ctx.createRadialGradient(x, y, 0, x, y, 7);
          g.addColorStop(0, `rgba(${col}, ${0.8 * a})`);
          g.addColorStop(1, `rgba(${col}, 0)`);
          ctx.fillStyle = g;
          ctx.beginPath();
          ctx.arc(x, y, 7, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Substation node.
      {
        const g = ctx.createRadialGradient(sx, sy, 0, sx, sy, 22);
        g.addColorStop(0, `rgba(${WARM}, 0.5)`);
        g.addColorStop(1, `rgba(${WARM}, 0)`);
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(sx, sy, 22, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = 'rgba(255,255,255,0.85)';
        roundRect(sx - 6, sy - 6, 12, 12, 3);
        ctx.fill();
      }

      // Buildings with twinkling lit windows.
      for (let b = 0; b < BUILDINGS.length; b++) {
        const bld = BUILDINGS[b];
        const x = X(bld.x), y = Y(bld.y), w = X(bld.w), h = Y(bld.h);
        ctx.fillStyle = 'rgba(18, 28, 46, 0.92)';
        ctx.strokeStyle = 'rgba(255,255,255,0.12)';
        ctx.lineWidth = 1;
        roundRect(x, y, w, h, 4);
        ctx.fill();
        ctx.stroke();
        // window grid
        const col = bld.cool ? COOL : WARM;
        const wc = Math.max(3, Math.floor(w / 14));
        const wr = Math.max(2, Math.floor(h / 14));
        const gapX = w / (wc + 1);
        const gapY = h / (wr + 1);
        for (let i = 0; i < wc; i++) {
          for (let j = 0; j < wr; j++) {
            const seed = b * 53 + i * 7 + j * 13;
            const lit = (seed % 5) !== 0;
            if (!lit) continue;
            const tw = 0.35 + 0.65 * (0.5 + 0.5 * Math.sin(t * 2.2 + seed));
            ctx.fillStyle = `rgba(${col}, ${0.25 + 0.55 * tw})`;
            ctx.beginPath();
            ctx.arc(x + (i + 1) * gapX, y + (j + 1) * gapY, 1.4, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }

      // Slow radar sweep for ambient life.
      const ang = (t * 0.25) % (Math.PI * 2);
      const sweep = ctx.createLinearGradient(
        X(0.7), Y(0.32),
        X(0.7) + Math.cos(ang) * W * 0.5, Y(0.32) + Math.sin(ang) * W * 0.5,
      );
      sweep.addColorStop(0, 'rgba(120, 170, 210, 0.06)');
      sweep.addColorStop(1, 'rgba(120, 170, 210, 0)');
      ctx.strokeStyle = sweep;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(X(0.7), Y(0.32));
      ctx.lineTo(X(0.7) + Math.cos(ang) * W * 0.6, Y(0.32) + Math.sin(ang) * W * 0.6);
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
      const redraw = () => { resize(); if (W) frame(0.8); };
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
  }, [reduced]);

  return <canvas ref={canvasRef} className={className} aria-hidden />;
}

export default FacilityScene;
