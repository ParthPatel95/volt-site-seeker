# Replace 3D globe with an institutional arc-route map

The current Three.js globe is brittle (texture calibration, marker placement, lighting) and reads as a gimmick. We'll swap it for a clean, on-brand 2D world map showing animated arcs from Calgary HQ to each pipeline site — the "airline route map" pattern used by Stripe, Cloudflare, and Anduril. It's faster, deterministic, and unmistakably professional.

## What the user will see

- Deep navy world map (matte SVG continents, no graticule clutter) sized like the current globe slot.
- Calgary HQ rendered as a glowing orange node with a subtle pulse ring.
- An animated orange arc draws from HQ to each pipeline site on mount, staggered ~120ms apart, then settles into a steady gradient line.
- Each pipeline site is a small dot with a colored ring matching its energy type (Hydro/Natgas/Hybrid/Mix/Solar — reusing existing `ENERGY_TYPE_COLORS`).
- Hover a site → compact tooltip (location, country flag, capacity MW, energy type, status badge).
- Click a site → existing project detail card slides in (same content as today: image, description, status). Press Esc or click backdrop to close.
- Hover the HQ node → "Calgary HQ" tooltip.
- Below the map: a thin legend (energy-type swatches) and the existing `PipelineFlowStrip` stays as-is.
- Subtle parallax: arcs and dots drift ~6px on mouse-move for liveliness without spinning anything.

## What we remove

- `AdvisoryPipelineGlobe.tsx` (Three.js Canvas, OrbitControls, texture calibration, tour logic, debug/pick modes).
- `globeProjection.ts` and its tests (no longer needed).
- `three`, `@react-three/fiber`, `@react-three/drei` imports from this feature. We won't uninstall the packages in case other surfaces use them — a follow-up can prune.

## Technical approach

- New component: `src/components/advisory/AdvisoryPipelineMap.tsx`.
- Pure SVG, no canvas, no WebGL. Renders inside a `viewBox="0 0 1000 500"` equirectangular frame.
- Continent paths: use a small, hand-trimmed world TopoJSON converted to a single static SVG path string committed as `src/assets/pipeline/world-land.svg` (one path, ~30KB). No runtime topojson lib needed.
- Projection: simple equirectangular `lng → x = (lng+180)/360 * 1000`, `lat → y = (90-lat)/180 * 500`. Deterministic, no calibration.
- Arcs: quadratic Bézier from HQ to site, control point lifted perpendicular to the chord by `0.2 * distance` so arcs curve outward. Animated via `framer-motion`'s `pathLength` from 0→1 with stagger.
- Tooltips: framer-motion `AnimatePresence`, positioned with a small `<foreignObject>` or absolute-positioned div over the SVG using the projected x/y.
- Detail card: reuse the existing card markup currently in `AdvisoryPipelineGlobe.tsx` (extract to `PipelineProjectCard.tsx` so we don't duplicate JSX).
- Parallax: single `onMouseMove` on the wrapper updates a `motion.div` transform; respects `prefers-reduced-motion`.
- Responsive: SVG scales with `width: 100%`. On <640px, hide tooltips on hover and show details on tap only; legend wraps.
- Theming: all colors via existing tokens (`--watt-navy`, `--watt-bitcoin`, `ENERGY_TYPE_COLORS` hex map). No dynamic Tailwind classes.

## Files

- Add: `src/components/advisory/AdvisoryPipelineMap.tsx`
- Add: `src/components/advisory/PipelineProjectCard.tsx` (extracted detail card)
- Add: `src/assets/pipeline/world-land.svg` (static continent path)
- Edit: `src/pages/Advisory.tsx` — swap lazy import from `AdvisoryPipelineGlobe` to `AdvisoryPipelineMap`; update the loading placeholder copy.
- Delete: `src/components/advisory/AdvisoryPipelineGlobe.tsx`
- Delete: `src/components/advisory/globeProjection.ts`
- Delete: `src/components/advisory/__tests__/globeProjection.test.ts`

## Out of scope

- Uninstalling three/r3f packages (keep for now; prune later if unused).
- Changing pipeline data, copy, or surrounding sections.
- Adding region filter tabs (per your answer, interaction stays at hover + click).
