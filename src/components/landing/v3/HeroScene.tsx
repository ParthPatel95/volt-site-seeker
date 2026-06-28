import { useEffect, useRef } from 'react';
import { useReducedMotion } from 'framer-motion';

// A seamless, continuously-looping canvas animation for the hero: a slow
// glide down a datacenter aisle. A perspective floor scrolls toward you, rows
// of server racks with twinkling LEDs slide past, energy streaks flow along
// the rails (power in), and a drifting neural-net constellation pulses overhead
// (AI compute). Everything is phase-based, so there's no loop boundary — it
// runs forever on the light brand theme. No WebGL: just 2D canvas, GPU-cheap.

// ── Brand palette (matches CSS vars in index.css) ───────────────────────────
const ORANGE = '247, 147, 26'; //  #F7931A  watt-bitcoin (power)
const TEAL = '16, 165, 199'; //    #10a5c7  watt-trust   (data / AI)
const SLATE = '100, 116, 139'; //  slate-500            (structure)

// ── Scene constants (world units) ───────────────────────────────────────────
const Z_NEAR = 2.2; // nearest depth before an object recycles to the back
const Z_FAR = 64; //   farthest depth a rack spawns at
const CAM_H = 2.15; //  camera height above the floor plane
const AISLE = 3.1; //   half-width of the central aisle (rack rows sit here)
const RAIL_MAX = 9; //  how far the floor grid spreads laterally
const SPEED = 5.2; //   world units / second the camera travels forward

type Rack = { z: number; side: -1 | 1; units: number; seed: number };
type Streak = { z: number; side: -1 | 1; speed: number };
type Node = { x: number; y: number; vx: number; vy: number; r: number };
type Pulse = { edge: number; t: number; speed: number; warm: boolean };

export function HeroScene({ className }: { className?: string }) {
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
    let focal = 1;
    let horizon = 0;
    let vanishX = 0; // screen-x of the vanishing point

    // Project a floor-plane point (lateral x, depth z) to the screen, plus the
    // perspective scale at that depth. Nearer (small z) → lower on screen & bigger.
    const project = (x: number, z: number) => {
      const scale = focal / z;
      return {
        sx: vanishX + x * scale,
        sy: horizon + CAM_H * scale,
        scale,
      };
    };

    // ── Scene population ──────────────────────────────────────────────────────
    const RACK_COUNT = 34;
    const racks: Rack[] = [];
    for (let i = 0; i < RACK_COUNT; i++) {
      const side: -1 | 1 = i % 2 === 0 ? -1 : 1;
      racks.push({
        z: Z_NEAR + (i / RACK_COUNT) * (Z_FAR - Z_NEAR),
        side,
        units: 6 + Math.floor((i * 7) % 4),
        seed: (i * 1327) % 1000,
      });
    }

    const streaks: Streak[] = [];
    for (let i = 0; i < 14; i++) {
      streaks.push({
        z: Z_NEAR + Math.random() * (Z_FAR - Z_NEAR),
        side: i % 2 === 0 ? -1 : 1,
        speed: 7 + Math.random() * 6,
      });
    }

    // Neural constellation lives in normalized [0,1] space (mapped to the upper
    // band of the canvas each frame so it stays responsive).
    const nodes: Node[] = [];
    for (let i = 0; i < 14; i++) {
      nodes.push({
        x: Math.random(),
        y: Math.random(),
        vx: (Math.random() - 0.5) * 0.006,
        vy: (Math.random() - 0.5) * 0.006,
        r: 1.6 + Math.random() * 1.8,
      });
    }
    // Connect each node to its nearest neighbours → a stable edge list.
    const edges: [number, number][] = [];
    for (let i = 0; i < nodes.length; i++) {
      const dists = nodes
        .map((n, j) => ({ j, d: (n.x - nodes[i].x) ** 2 + (n.y - nodes[i].y) ** 2 }))
        .filter((o) => o.j !== i)
        .sort((a, b) => a.d - b.d);
      for (let k = 0; k < 2; k++) {
        const j = dists[k].j;
        if (!edges.some(([a, b]) => (a === i && b === j) || (a === j && b === i))) {
          edges.push([i, j]);
        }
      }
    }
    const pulses: Pulse[] = edges.map((_, i) => ({
      edge: i,
      t: Math.random(),
      speed: 0.18 + Math.random() * 0.22,
      warm: i % 3 === 0,
    }));

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = rect.width;
      H = rect.height;
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      // On wide screens push the vanishing point right so the aisle lives in
      // the open space beside the copy; centre it on narrow screens.
      vanishX = W >= 1024 ? W * 0.66 : W * 0.5;
      // Pick focal so the lateral grid (±RAIL_MAX) just fills the frame at the
      // nearest depth — keeps the scene's proportions consistent at any width.
      focal = (W * 0.5 * Z_NEAR) / RAIL_MAX;
      horizon = H * 0.44;
    };
    resize();
    window.addEventListener('resize', resize);

    // ── Drawing helpers ───────────────────────────────────────────────────────

    const drawFloor = (camZ: number) => {
      // Converging rails (static perspective lines along the aisle + spread).
      ctx.lineWidth = 1;
      for (let r = -RAIL_MAX; r <= RAIL_MAX; r += 1.5) {
        const a = project(r, Z_NEAR);
        const b = project(r, Z_FAR);
        const fade = 0.08 + 0.09 * (1 - Math.abs(r) / RAIL_MAX);
        ctx.strokeStyle = `rgba(${SLATE}, ${fade})`;
        ctx.beginPath();
        ctx.moveTo(a.sx, a.sy);
        ctx.lineTo(b.sx, b.sy);
        ctx.stroke();
      }
      // Scrolling rungs (perpendicular lines) — motion toward the viewer.
      const spacing = 2.4;
      const first = Math.ceil((camZ + Z_NEAR) / spacing) * spacing;
      for (let wz = first; wz - camZ < Z_FAR; wz += spacing) {
        const z = wz - camZ;
        if (z < Z_NEAR) continue;
        const left = project(-RAIL_MAX, z);
        const right = project(RAIL_MAX, z);
        const fade = 0.22 * (1 - z / Z_FAR);
        ctx.strokeStyle = `rgba(${SLATE}, ${Math.max(0, fade)})`;
        ctx.beginPath();
        ctx.moveTo(left.sx, left.sy);
        ctx.lineTo(right.sx, right.sy);
        ctx.stroke();
      }
    };

    const drawRack = (rack: Rack, t: number) => {
      const z = rack.z;
      const depthFade = Math.min(1, (Z_FAR - z) / Z_FAR + 0.2);
      // The cabinet occupies a 0.95-wide footprint just outside the aisle line.
      const outer = project(rack.side * (AISLE + 0.5), z);
      const inner = project(rack.side * (AISLE - 0.5), z);
      const rackH = 1.7 * outer.scale; // world height ~1.7 units
      const x = Math.min(outer.sx, inner.sx);
      const w = Math.abs(outer.sx - inner.sx);
      const topY = outer.sy - rackH;
      if (w < 1.5 || rackH < 4) return; // too far to bother drawing

      // Cabinet body — soft light slab with a subtle vertical sheen + edge.
      const body = ctx.createLinearGradient(x, topY, x + w, topY);
      body.addColorStop(0, `rgba(255,255,255,${0.82 * depthFade})`);
      body.addColorStop(1, `rgba(226,232,240,${0.82 * depthFade})`);
      ctx.fillStyle = body;
      ctx.strokeStyle = `rgba(${SLATE}, ${0.35 * depthFade})`;
      ctx.lineWidth = 1;
      roundRect(ctx, x, topY, w, rackH, Math.min(5, w * 0.14));
      ctx.fill();
      ctx.stroke();

      // Twinkling status LEDs stacked up the cabinet face (two columns).
      const rows = rack.units;
      const dotR = Math.max(0.7, w * 0.07);
      for (let u = 0; u < rows; u++) {
        const ly = topY + ((u + 0.6) / rows) * rackH;
        const phase = (rack.seed + u * 137) * 0.013;
        const tw = 0.4 + 0.6 * (0.5 + 0.5 * Math.sin(t * 2.3 + phase * 9));
        const warm = (rack.seed + u) % 4 === 0;
        const col = warm ? ORANGE : TEAL;
        ctx.fillStyle = `rgba(${col}, ${tw * depthFade})`;
        ctx.beginPath();
        ctx.arc(x + w * 0.22, ly, dotR, 0, Math.PI * 2);
        ctx.fill();
        // faint vent band across the rest of the unit
        ctx.fillStyle = `rgba(${SLATE}, ${0.1 * depthFade})`;
        ctx.fillRect(x + w * 0.4, ly - dotR * 0.5, w * 0.45, Math.max(0.5, dotR));
      }
    };

    const drawStreak = (s: Streak) => {
      // Energy travelling along the rack rail toward the viewer (power flow).
      const z = s.z;
      const depthFade = Math.min(1, (Z_FAR - z) / Z_FAR + 0.1);
      const p = project(s.side * (AISLE + 1.1), z);
      const tail = project(s.side * (AISLE + 1.1), z + 3);
      const grad = ctx.createLinearGradient(tail.sx, tail.sy, p.sx, p.sy);
      grad.addColorStop(0, `rgba(${ORANGE}, 0)`);
      grad.addColorStop(1, `rgba(${ORANGE}, ${0.6 * depthFade})`);
      ctx.strokeStyle = grad;
      ctx.lineWidth = Math.max(1, p.scale * 0.05);
      ctx.beginPath();
      ctx.moveTo(tail.sx, tail.sy);
      ctx.lineTo(p.sx, p.sy);
      ctx.stroke();
      const r = Math.max(1.2, p.scale * 0.06);
      const glow = ctx.createRadialGradient(p.sx, p.sy, 0, p.sx, p.sy, r * 3);
      glow.addColorStop(0, `rgba(${ORANGE}, ${0.9 * depthFade})`);
      glow.addColorStop(1, `rgba(${ORANGE}, 0)`);
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(p.sx, p.sy, r * 3, 0, Math.PI * 2);
      ctx.fill();
    };

    const drawNeural = (t: number) => {
      // Upper-band constellation: drifting nodes + edges with travelling pulses.
      const top = H * 0.04;
      const band = H * 0.34;
      const mapX = (nx: number) => nx * W;
      const mapY = (ny: number) => top + ny * band;

      ctx.lineWidth = 1;
      for (const [a, b] of edges) {
        ctx.strokeStyle = `rgba(${SLATE}, 0.12)`;
        ctx.beginPath();
        ctx.moveTo(mapX(nodes[a].x), mapY(nodes[a].y));
        ctx.lineTo(mapX(nodes[b].x), mapY(nodes[b].y));
        ctx.stroke();
      }
      // Travelling light pulses along edges.
      for (const pl of pulses) {
        const [a, b] = edges[pl.edge];
        const x = mapX(nodes[a].x + (nodes[b].x - nodes[a].x) * pl.t);
        const y = mapY(nodes[a].y + (nodes[b].y - nodes[a].y) * pl.t);
        const col = pl.warm ? ORANGE : TEAL;
        const glow = ctx.createRadialGradient(x, y, 0, x, y, 9);
        glow.addColorStop(0, `rgba(${col}, 0.9)`);
        glow.addColorStop(1, `rgba(${col}, 0)`);
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(x, y, 9, 0, Math.PI * 2);
        ctx.fill();
      }
      // Nodes themselves.
      for (const n of nodes) {
        const x = mapX(n.x);
        const y = mapY(n.y);
        const tw = 0.6 + 0.4 * Math.sin(t * 1.6 + n.x * 12);
        ctx.fillStyle = `rgba(${SLATE}, ${0.5})`;
        ctx.beginPath();
        ctx.arc(x, y, n.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = `rgba(${TEAL}, ${0.25 * tw})`;
        ctx.beginPath();
        ctx.arc(x, y, n.r + 2.5, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    // ── Frame loop ────────────────────────────────────────────────────────────
    let raf = 0;
    let last = performance.now();
    let camZ = 0;
    let elapsed = 0;
    let running = true;

    const renderFrame = (t: number, dt: number) => {
      elapsed += dt;
      camZ += dt * SPEED;

      ctx.clearRect(0, 0, W, H);

      // Light gradient backdrop.
      const bg = ctx.createLinearGradient(0, 0, 0, H);
      bg.addColorStop(0, '#ffffff');
      bg.addColorStop(0.55, '#f4f7fb');
      bg.addColorStop(1, '#e9eef5');
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, W, H);

      drawNeural(elapsed);
      drawFloor(camZ);

      // Racks are world-fixed; the camera moves, so compute each rack's depth
      // relative to the camera, wrap it into range, then sort far→near so the
      // nearer cabinets draw on top.
      const visible = racks
        .map((r) => ({ r, z: ((r.z - camZ) % (Z_FAR - Z_NEAR) + (Z_FAR - Z_NEAR)) % (Z_FAR - Z_NEAR) + Z_NEAR }))
        .sort((a, b) => b.z - a.z);
      for (const v of visible) drawRack({ ...v.r, z: v.z }, elapsed);

      // Streaks travel toward viewer; recycle to the back.
      for (const s of streaks) {
        s.z -= dt * s.speed;
        if (s.z < Z_NEAR) s.z += Z_FAR - Z_NEAR;
        drawStreak(s);
      }

      // Drift neural nodes, bounce inside [0,1].
      for (const n of nodes) {
        n.x += n.vx * dt;
        n.y += n.vy * dt;
        if (n.x < 0.02 || n.x > 0.98) n.vx *= -1;
        if (n.y < 0.02 || n.y > 0.98) n.vy *= -1;
        n.x = Math.max(0.02, Math.min(0.98, n.x));
        n.y = Math.max(0.02, Math.min(0.98, n.y));
      }
      for (const pl of pulses) {
        pl.t += pl.speed * dt;
        if (pl.t > 1) pl.t -= 1;
      }
    };

    if (reduced) {
      // Static, representative single frame.
      resize();
      renderFrame(0, 0);
    } else {
      const loop = (now: number) => {
        if (!running) return;
        const dt = Math.min(0.05, (now - last) / 1000);
        last = now;
        renderFrame(now / 1000, dt);
        raf = requestAnimationFrame(loop);
      };
      raf = requestAnimationFrame(loop);
    }

    // Pause when the hero scrolls out of view (saves battery).
    const io = new IntersectionObserver(
      ([entry]) => {
        if (reduced) return;
        if (entry.isIntersecting && !running) {
          running = true;
          last = performance.now();
          raf = requestAnimationFrame(function l(now) {
            if (!running) return;
            const dt = Math.min(0.05, (now - last) / 1000);
            last = now;
            renderFrame(now / 1000, dt);
            raf = requestAnimationFrame(l);
          });
        } else if (!entry.isIntersecting) {
          running = false;
          cancelAnimationFrame(raf);
        }
      },
      { threshold: 0.01 },
    );
    io.observe(canvas);

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      io.disconnect();
    };
  }, [reduced]);

  return <canvas ref={canvasRef} className={className} aria-hidden />;
}

// Small rounded-rect helper (no Path2D dependency for older Safari).
function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  const rr = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.arcTo(x + w, y, x + w, y + h, rr);
  ctx.arcTo(x + w, y + h, x, y + h, rr);
  ctx.arcTo(x, y + h, x, y, rr);
  ctx.arcTo(x, y, x + w, y, rr);
  ctx.closePath();
}

export default HeroScene;
