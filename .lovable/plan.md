## Goal

Replace the unconvincing procedural Earth in the Advisory page with a photorealistic globe using real NASA Blue Marble satellite imagery, while keeping the pipeline data visualization (HQ pulse, project pins, animated arcs) intact and the page fast.

## What changes

### 1. Photorealistic Earth rendering
- Replace the hand-drawn `CanvasTexture` continents in `src/components/advisory/AdvisoryPipelineGlobe.tsx` with three real textures loaded via `THREE.TextureLoader`:
  - **Day map** — NASA Blue Marble equirectangular color map (continents, oceans, ice caps look real)
  - **Bump/specular map** — gives oceans a subtle sheen vs. matte land
  - **Clouds** — semi-transparent cloud layer on a slightly larger sphere, slowly counter-rotating
- Add a soft blue **atmosphere glow** (back-side sphere with additive shader) for the iconic "Earth from space" rim light.
- Lighting: replace flat ambient with a directional "sun" light + low ambient so the terminator (day/night line) is visible and the globe reads as a real lit sphere from any angle.
- Use `sRGBEncoding` color space and proper anisotropic filtering so the texture stays crisp.

### 2. Asset hosting & performance
- Host the three textures locally in `public/textures/earth/` (so they're served from the same domain — no CORS, no third-party flakiness):
  - `earth-day-2k.jpg` (~400KB, 2048×1024)
  - `earth-bump-1k.jpg` (~150KB)
  - `earth-clouds-2k.png` (~500KB transparent)
- Total payload ~1MB, lazy-loaded only when the Advisory route mounts (the component is already behind `React.lazy`).
- Show the existing `GlobePlaceholder` skeleton while textures load; swap in the globe via `Suspense` + a texture-ready flag so users never see a black sphere.
- Keep current optimizations: capped DPR (1.5), reduced sphere segments where invisible, low star count.

### 3. Pipeline overlay (unchanged behavior, polished)
- Keep the existing HQ orange pulse ring at Edmonton.
- Keep project markers color-coded by `ENERGY_TYPE_COLORS` with hover tooltips.
- Keep animated Bezier arcs from each project to HQ.
- Slight tweak: render markers and arcs at `RADIUS * 1.005` so they sit just above the cloud layer and stay readable against the photorealistic surface.

### 4. Fallback & resilience
- If any texture fails to load (network/blocked), fall back to a solid brand-navy sphere with a subtle grid — never a black void. Log a single console warning, don't crash the scene.
- Wrap the `<Canvas>` in the existing error boundary pattern so a WebGL failure on old devices degrades to the placeholder card instead of breaking the page.

## Technical details

**Files touched**
- `src/components/advisory/AdvisoryPipelineGlobe.tsx` — full rewrite of the `EarthSphere` subcomponent; arcs/markers/HQ logic preserved.
- `public/textures/earth/earth-day-2k.jpg` — new (NASA Visible Earth Blue Marble, public domain)
- `public/textures/earth/earth-bump-1k.jpg` — new
- `public/textures/earth/earth-clouds-2k.png` — new

**Three.js specifics**
- `MeshPhongMaterial` with `map`, `bumpMap`, `bumpScale: 0.05`, `specular: new THREE.Color(0x223344)`, `shininess: 12`.
- Clouds: separate sphere at `RADIUS * 1.01`, `MeshLambertMaterial` with `transparent: true`, `opacity: 0.35`, `depthWrite: false`.
- Atmosphere: sphere at `RADIUS * 1.08` with `ShaderMaterial`, `side: THREE.BackSide`, `blending: THREE.AdditiveBlending`, fresnel-style rim glow in `#3a8fff`.
- Sun light: `DirectionalLight(#ffffff, 1.2)` positioned at `(5, 3, 5)`; `AmbientLight(#1a2540, 0.4)` to keep the night side from being pitch black so pipeline arcs remain visible.
- Earth tilt: `rotation.z = 23.4° * π/180` for realism.
- Auto-rotate at ~0.05 rad/s; clouds at ~0.07 rad/s for parallax.

**No dependency changes** — `three`, `@react-three/fiber@^8.18`, `@react-three/drei@^9.122` already installed.

## Out of scope
- No changes to other Advisory sections, navigation, or Supabase logic.
- No new dependencies.
- No changes to brand colors or copy.

## QA after implementation
- Visual: screenshot the Advisory hero on desktop + mobile viewports, zoom in on the globe to confirm continents are recognizable (North America, Africa, Eurasia visible), oceans are blue, atmosphere glow is visible at edges, HQ pulse and arcs render cleanly on top.
- Performance: confirm time-to-interactive on `/advisory` is unchanged or better; check console for texture load errors.
- Fallback: temporarily block the texture path in devtools to confirm the navy fallback renders instead of a black sphere.
