import { useEffect, useRef } from 'react';
import { useReducedMotion } from 'framer-motion';

// JourneyScene — a compact, continuously-looping canvas for the media panel of
// the Energy→Compute chapter. It draws a live "compute floor": a grid of GPU /
// server nodes with flowing activity plus a scrolling telemetry strip. An
// `intensity` (0→1) controls how alive it is, so the three beats read as the
// same site coming online: stranded (sparse, idle) → developing → fully
// productive compute. Light brand theme; GPU-cheap 2D canvas, reduced-motion safe.

const SLATE = '100, 116, 139';

function hexToRgb(hex: string): string {
  const h = hex.replace('#', '');
  const n = parseInt(h.length === 3 ? h.split('').map((c) => c + c).join('') : h, 16);
  return `${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}`;
}

// Stable 0→1 hash so each node's "is it online" decision is deterministic.
function hash(c: number, r: number): number {
  const s = Math.sin(c * 12.9898 + r * 78.233) * 43758.5453;
  return s - Math.floor(s);
}

export function JourneyScene({
  accent,
  intensity = 1,
  className,
}: {
  accent: string;
  intensity?: number;
  className?: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const ACCENT = hexToRgb(accent);
    const COLS = 9;
    const ROWS = 5;
    const PAD = 16;

    let W = 0;
    let H = 0;
    let dpr = 1;

    // Scrolling telemetry samples (filled lazily once we know the width).
    const spark: number[] = [];

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = rect.width;
      H = rect.height;
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const want = Math.max(24, Math.round(W / 6));
      while (spark.length < want) spark.push(0.5);
      while (spark.length > want) spark.pop();
    };

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
      if (W === 0) resize();
      if (W === 0) return;

      // Light backdrop.
      const bg = ctx.createLinearGradient(0, 0, 0, H);
      bg.addColorStop(0, '#ffffff');
      bg.addColorStop(1, '#eef2f7');
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, W, H);

      const gridTop = PAD;
      const gridH = H * 0.62 - PAD;
      const gridW = W - PAD * 2;
      const cellW = gridW / COLS;
      const cellH = gridH / ROWS;
      const size = Math.min(cellW, cellH) * 0.56;

      // Node grid — lit fraction tracks `intensity`.
      for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
          const cx = PAD + (c + 0.5) * cellW;
          const cy = gridTop + (r + 0.5) * cellH;
          const active = hash(c, r) < intensity;
          if (active) {
            const pulse = 0.5 + 0.5 * Math.sin(t * 2.1 + (c * 1.7 + r * 2.3));
            const a = 0.25 + 0.6 * pulse;
            ctx.fillStyle = `rgba(${ACCENT}, ${a})`;
            roundRect(cx - size / 2, cy - size / 2, size, size, size * 0.28);
            ctx.fill();
            // soft glow
            const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, size * 1.4);
            g.addColorStop(0, `rgba(${ACCENT}, ${0.18 * pulse})`);
            g.addColorStop(1, `rgba(${ACCENT}, 0)`);
            ctx.fillStyle = g;
            ctx.beginPath();
            ctx.arc(cx, cy, size * 1.4, 0, Math.PI * 2);
            ctx.fill();
          } else {
            ctx.fillStyle = `rgba(${SLATE}, 0.12)`;
            roundRect(cx - size / 2, cy - size / 2, size, size, size * 0.28);
            ctx.fill();
          }
        }
      }

      // Data flow — dots streaming left→right along active rows.
      const flowSpeed = 0.04 + 0.12 * intensity;
      for (let r = 0; r < ROWS; r++) {
        if (hash(0, r) > intensity && hash(3, r) > intensity) continue; // mostly-idle row
        const cy = gridTop + (r + 0.5) * cellH;
        const count = 3;
        for (let k = 0; k < count; k++) {
          const phase = ((t * flowSpeed + k / count + r * 0.13) % 1);
          const x = PAD + phase * gridW;
          const a = Math.sin(phase * Math.PI); // fade in/out at the ends
          ctx.fillStyle = `rgba(${ACCENT}, ${0.5 * a * (0.4 + 0.6 * intensity)})`;
          ctx.beginPath();
          ctx.arc(x, cy, 1.6, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Telemetry strip — a scrolling sparkline + baseline.
      const stripTop = H * 0.66;
      const stripH = H - stripTop - PAD;
      const baseY = stripTop + stripH;
      // advance the scroll roughly twice a second regardless of framerate
      const step = Math.floor(t * (4 + 10 * intensity));
      const target =
        0.5 +
        (0.12 + 0.36 * intensity) *
          Math.sin(step * 0.5) *
          (0.6 + 0.4 * Math.sin(step * 0.17));
      spark.push(target);
      while (spark.length > Math.max(24, Math.round(W / 6))) spark.shift();

      // baseline grid line
      ctx.strokeStyle = `rgba(${SLATE}, 0.18)`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(PAD, baseY);
      ctx.lineTo(W - PAD, baseY);
      ctx.stroke();

      // filled sparkline
      const n = spark.length;
      const sx = (i: number) => PAD + (i / (n - 1)) * (W - PAD * 2);
      const sy = (v: number) => baseY - v * stripH;
      ctx.beginPath();
      ctx.moveTo(sx(0), sy(spark[0]));
      for (let i = 1; i < n; i++) ctx.lineTo(sx(i), sy(spark[i]));
      ctx.lineTo(sx(n - 1), baseY);
      ctx.lineTo(sx(0), baseY);
      ctx.closePath();
      const fill = ctx.createLinearGradient(0, stripTop, 0, baseY);
      fill.addColorStop(0, `rgba(${ACCENT}, ${0.18 + 0.12 * intensity})`);
      fill.addColorStop(1, `rgba(${ACCENT}, 0)`);
      ctx.fillStyle = fill;
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(sx(0), sy(spark[0]));
      for (let i = 1; i < n; i++) ctx.lineTo(sx(i), sy(spark[i]));
      ctx.strokeStyle = `rgba(${ACCENT}, ${0.5 + 0.4 * intensity})`;
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
      // No animation: draw a single representative frame, and redraw whenever
      // the panel is (re)sized — the first layout pass often reports 0×0.
      const redraw = () => {
        resize();
        if (W > 0) frame(0.6);
      };
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
        if (e.isIntersecting && !running) {
          running = true;
          raf = requestAnimationFrame(loop);
        } else if (!e.isIntersecting) {
          running = false;
          cancelAnimationFrame(raf);
        }
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
  }, [accent, intensity, reduced]);

  return <canvas ref={canvasRef} className={className} aria-hidden />;
}

export default JourneyScene;
