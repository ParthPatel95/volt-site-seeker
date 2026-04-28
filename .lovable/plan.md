## Goal

Fix two issues with the Advisory globe:
1. **Marker placement is wrong** — the lat/lng → 3D conversion is rotated 180° from the texture's UV mapping, so projects render on the opposite side of the planet from where they should be (Alberta marker shows up over Asia).
2. **Lighting is dim and the auto-rotation isn't useful** — the globe should slowly orbit through the actual project locations (HQ + 7 sites) rather than spin freely, and the day side should be brighter and more cinematic.

## What changes

### 1. Correct marker geo-projection
Rewrite `latLngToVec3` in `src/components/advisory/AdvisoryPipelineGlobe.tsx` to match the equirectangular UV layout used by three.js `SphereGeometry` and our day-map texture (mrdoob earth_atmos):

```text
phi   = (90 - lat) * π/180        // polar angle from +Y
theta = -lng * π/180              // longitude, no +180 offset
x =  r * sin(phi) * cos(theta)
y =  r * cos(phi)
z =  r * sin(phi) * sin(theta)
```

Verification points (after fix):
- Calgary HQ (51.04, -114.07) sits over western Canada
- Texas marker (31.97, -99.90) sits over Texas
- Uganda Jinja (0.42, 33.20) sits on equator over east Africa
- India/Nepal/Bhutan markers cluster over the Indian subcontinent
- Newfoundland sits on the Canadian Atlantic coast

I'll cross-check by screenshotting the globe at multiple rotation angles and zooming on each marker to confirm it sits on the correct landmass.

### 2. Cinematic "tour" auto-rotation through real sites
Replace the free `rotation.y += 0.0008` spin with a guided camera tour that pans the globe so each pipeline site (HQ + 7 projects) faces the camera in sequence:

- Build a tour list = `[HQ, ...PIPELINE_PROJECTS]` ordered roughly west-to-east for natural flow (Texas → Alberta → Newfoundland → Uganda → Nepal → Bhutan → India), starting at HQ.
- Each "stop" holds the site front-and-center for ~2.5s, then smoothly interpolates (slerp on a quaternion) to the next stop over ~2s.
- Implement by rotating the **globe group** (not the camera) so OrbitControls still works for users who want to drag manually.
- Pause the tour automatically when the user starts dragging (OrbitControls `start` event) and on hover, resume after ~5s of inactivity.
- Earth keeps its 23.4° axial tilt; clouds keep their independent slow drift.

### 3. Improved lighting
- Bump `directionalLight` (sun) from `1.4` → `1.7` and warm it slightly to `#fff5e6`.
- Add a second fill light (cool, low intensity `#6aa9ff` at intensity `0.25`) opposite the sun so the night side isn't pitch black and arcs/markers stay visible.
- Lower the orange rim light from `0.18` → `0.12` so it accents the silhouette without tinting the day side.
- Raise atmosphere shader intensity slightly (exponent 2.2 → 1.9) for a stronger blue rim glow.
- Keep ambient low (`0.35`) so the terminator stays cinematic.

### 4. Marker polish (small)
- Cap project marker base size (`0.04 + min(capacity/600, 0.05)`) so the 536 MW Texas and 400 MW Uganda markers don't dwarf the globe.
- Keep HQ orange pulse but slightly reduce the outer halo opacity from `0.25` → `0.18`.
- Markers and arcs continue to render at `RADIUS * 1.025` so they sit cleanly above the cloud layer.

## Technical details

**File touched**
- `src/components/advisory/AdvisoryPipelineGlobe.tsx` — only this file. No texture, asset, or data changes.

**Tour math**
- For each stop, compute target rotation as the quaternion that rotates the site's surface normal vector to face `+Z` (toward camera at `(0, 0, 5.5)`):
  ```text
  siteVec = latLngToVec3(lat, lng, 1)   // unit vector
  target  = Quaternion.setFromUnitVectors(siteVec, new Vector3(0, 0, 1))
  ```
- Each frame: `group.quaternion.slerp(target, 0.04)` while in "transition" phase; freeze for 2.5s "hold" phase; advance index.
- Gentle latitude offset: tilt camera slightly (or apply small extra X rotation) so northern sites don't sit at the very top.

**Manual interaction handling**
- Subscribe to `OrbitControls` `start`/`end` events via a ref to set a `userInteracting` flag.
- While `userInteracting` or `paused` (hover): skip the slerp/advance logic; resume tour 5s after last interaction.

**No dependency changes.**

## Out of scope
- No changes to project data, copy, other Advisory sections, or styling outside the globe component.
- No new textures or assets.
- No changes to OrbitControls min/max distance or zoom behavior.

## QA after implementation
- Screenshot the globe at each tour stop and zoom in to confirm the marker sits on the correct country (Texas on Texas, Uganda on Uganda, etc.).
- Verify smooth slerp transitions (no jumps, no jitter at the poles).
- Confirm dragging pauses the tour, releasing resumes after 5s.
- Verify day-side brightness is improved and atmosphere rim glow is visible.
- Console: no Three.js / texture warnings.
