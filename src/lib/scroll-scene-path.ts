// Camera path for the landing-page scroll scene. Pure math — no three.js
// dependency — so the journey is unit-testable.
//
// World layout (matches src/components/landing/v2/EnergySite.tsx):
//   x:   transmission line tower row at -46 → -34 → -22 → -10
//        substation centered at x ≈ 6 (gravel pad spans 14)
//        datacenter at x ≈ 18 (footprint 14 × 9, height 6)
//   y:   ground = 0; conductor sag at y ≈ 12.4; datacenter roof at y ≈ 6
//   z:   transmission line offset along z = 0; substation extends ±3; access road runs +z
//
// Scroll storyboard:
//   A  hero            — wide establishing shot looking down the line
//   B  chapter 01–02   — dollying along the conductors toward the substation
//   C  chapter 03–04   — beside the transformers, then turn to face the DC
//   D  chapter 05–06   — pulling up to a high three-quarter
//   E  chapter 07-end  — aerial overlook of the whole site

export type Vec = [number, number, number];

export interface CameraPose {
  pos: Vec;
  look: Vec;
}

interface Segment {
  from: number;
  to: number;
  posA: Vec;
  posB: Vec;
  lookA: Vec;
  lookB: Vec;
}

const SEGMENTS: Segment[] = [
  // A — hero: wide shot along the transmission line
  {
    from: 0, to: 0.15,
    posA: [-58, 6, 14], posB: [-46, 5, 10],
    lookA: [-20, 8, 0], lookB: [-14, 7, 0],
  },
  // B — chapters 01-02: dollying down the line
  {
    from: 0.15, to: 0.4,
    posA: [-46, 5, 10], posB: [-14, 4, 6],
    lookA: [-14, 7, 0], lookB: [6, 5, 0],
  },
  // C1 — chapter 03: approaching the substation
  {
    from: 0.4, to: 0.55,
    posA: [-14, 4, 6], posB: [-2, 3, 6],
    lookA: [6, 5, 0], lookB: [8, 2, 0],
  },
  // C2 — chapter 04: alongside the transformers, then pan toward the DC
  {
    from: 0.55, to: 0.7,
    posA: [-2, 3, 6], posB: [10, 3, 8],
    lookA: [8, 2, 0], lookB: [18, 3, -1],
  },
  // D — chapters 05-06: rising for a three-quarter view of the whole site
  {
    from: 0.7, to: 0.88,
    posA: [10, 3, 8], posB: [-10, 22, 24],
    lookA: [18, 3, -1], lookB: [6, 0, 0],
  },
  // E — close: pulled back high, light aerial drift
  {
    from: 0.88, to: 1.0001,
    posA: [-10, 22, 24], posB: [-22, 34, 30],
    lookA: [6, 0, 0], lookB: [4, 0, -2],
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

/** Scene-layer opacity for scroll progress (full at hero, dimmed mid-page). */
export function sceneOpacity(p: number): number {
  const stops: [number, number][] = [
    [0, 1], [0.12, 0.95], [0.24, 0.42], [0.78, 0.42], [0.95, 0.75], [1, 0.75],
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
