// Camera path for the persistent landing scroll scene. Pure math — no
// three.js dependency — so the journey is unit-testable.
//
// The page is one continuous shot through the datacenter hall:
//   A  hero            — holding at the cool-aisle entrance
//   B  chapters 01–03  — traveling down the aisle between the rack rows
//   C  chapters 04–05  — rising to a top-down overview (the "scale" beat)
//   D  chapters 06–end — pulling back wide for the close
// Segment endpoints are shared so the path is continuous by construction.

export type Vec = [number, number, number];

export interface CameraPose {
  pos: Vec;
  look: Vec;
}

interface Segment {
  /** scroll-progress span [from, to) */
  from: number;
  to: number;
  posA: Vec;
  posB: Vec;
  lookA: Vec;
  lookB: Vec;
}

const SEGMENTS: Segment[] = [
  {
    from: 0, to: 0.18,
    posA: [-5.6, 0.55, 0], posB: [-4.2, 0.6, 0],
    lookA: [2.5, 0.35, 0], lookB: [2.5, 0.35, 0],
  },
  {
    from: 0.18, to: 0.5,
    posA: [-4.2, 0.6, 0], posB: [3.2, 0.8, 0],
    lookA: [2.5, 0.35, 0], lookB: [9.0, 0.5, 0],
  },
  {
    from: 0.5, to: 0.78,
    posA: [3.2, 0.8, 0], posB: [0, 7.5, 5.5],
    lookA: [9.0, 0.5, 0], lookB: [0, 0, 0],
  },
  {
    from: 0.78, to: 1.0001, // inclusive upper bound
    posA: [0, 7.5, 5.5], posB: [-4.5, 5.5, 7.5],
    lookA: [0, 0, 0], lookB: [0, 0.5, 0],
  },
];

function smoothstep(t: number): number {
  const x = Math.min(1, Math.max(0, t));
  return x * x * (3 - 2 * x);
}

function lerpVec(a: Vec, b: Vec, t: number): Vec {
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
}

/** Camera pose for scroll progress p ∈ [0, 1]; clamped outside the range. */
export function cameraPose(p: number): CameraPose {
  const clamped = Math.min(1, Math.max(0, p));
  const seg = SEGMENTS.find((s) => clamped >= s.from && clamped < s.to) ?? SEGMENTS[SEGMENTS.length - 1];
  const local = smoothstep((clamped - seg.from) / (seg.to - seg.from));
  return {
    pos: lerpVec(seg.posA, seg.posB, local),
    look: lerpVec(seg.lookA, seg.lookB, local),
  };
}

/**
 * Scene-layer opacity for scroll progress: full at the hero, dimmed through
 * the reading sections so text stays legible, re-emerging for the close.
 */
export function sceneOpacity(p: number): number {
  const stops: [number, number][] = [
    [0, 1], [0.12, 0.95], [0.24, 0.3], [0.8, 0.3], [0.95, 0.65], [1, 0.65],
  ];
  const clamped = Math.min(1, Math.max(0, p));
  for (let i = 0; i < stops.length - 1; i++) {
    const [pa, va] = stops[i];
    const [pb, vb] = stops[i + 1];
    if (clamped >= pa && clamped <= pb) {
      const t = pb === pa ? 0 : (clamped - pa) / (pb - pa);
      return va + (vb - va) * t;
    }
  }
  return stops[stops.length - 1][1];
}
