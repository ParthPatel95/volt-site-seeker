## Goal

Add a "Pick" mode to the Advisory globe. When enabled, clicking anywhere on the Earth surface finds the nearest marker (HQ or pipeline site) and shows its name, lat/lng, and computed 3D xyz in the existing readout area.

## What changes (frontend only, single file)

Edit `src/components/advisory/AdvisoryPipelineGlobe.tsx`:

1. **Add a "Pick" toggle button** next to the existing Play/Pause and Debug buttons (top-right cluster), using the `Crosshair` icon from `lucide-react`. State: `const [pickMode, setPickMode] = useState(false)`.

2. **Make the Earth sphere clickable in pick mode**:
   - Add an `onClick` handler on the Earth surface mesh (the day-map sphere inside `Earth`).
   - Pass a callback prop `onPickPoint(localPoint: THREE.Vector3)` from the parent down to `Earth`. The handler uses the intersection's `point` transformed into the globe group's local space (so it works regardless of current rotation), normalizes it to the unit sphere, and calls back.
   - Cursor becomes `crosshair` when `pickMode` is on (set on the container).

3. **Nearest-marker search** (in parent `AdvisoryPipelineGlobe`):
   - Build a list `[HQ, ...PIPELINE_PROJECTS]` with each entry's unit vector via `latLngToVec3(lat, lng, 1)`.
   - On pick, compute great-circle distance via `acos(dot(clickedUnit, markerUnit))` and pick the smallest.
   - Store result in `pickedId` state.

4. **Readout panel** (new compact card, bottom-left, same styling as legend):
   - Always shows the last clicked lat/lng + xyz when in pick mode.
   - Shows the matched nearest marker: name, its lat/lng, its computed xyz (at `RADIUS * 1.025`, matching markers).
   - Includes a small "Clear" button.
   - `onPointerEnter/Leave` toggles `hoverPaused` like the existing legend.

5. **Debug overlay reuse**: when `pickMode` is on but `debug` is off, still show the pick readout. Both can coexist. The existing debug rows table is unchanged.

6. **Convert click point → lat/lng** (utility in same file or `globeProjection.ts`):
   ```text
   lat = asin(y) * 180/π
   lng = atan2(z, -x) * 180/π - LNG_OFFSET_DEG
   ```
   This is the inverse of `latLngToVec3` and will be added as `vec3ToLatLng` in `globeProjection.ts` with a small unit test in `__tests__/globeProjection.test.ts` asserting round-trip on Calgary, Texas, and Newfoundland.

## Technical details

- **Local-space conversion**: in the Earth click handler use `groupRef.current.worldToLocal(e.point.clone())` then `.normalize()` so the picked direction is independent of the current tour rotation. This is what gets fed to `vec3ToLatLng`.
- **No interference with existing marker clicks**: `ProjectMarker` already calls `e.stopPropagation()`, so clicking a marker still selects it (fly-to). Clicking empty Earth surface in pick mode runs the nearest-marker logic instead.
- **Pick mode does not auto-trigger fly-to**, so the readout stays visible while the user inspects coordinates.
- **Pause behavior**: enabling pick mode does not auto-pause the tour, but hovering the readout panel pauses it (consistent with current pattern).

## Out of scope

- No data, route, or backend changes.
- No changes to projection math beyond the new inverse helper.
- No changes to other Advisory sections.

## QA after implementation

- Toggle Pick on, click over Texas → readout shows "Texas" as nearest, with matching lat/lng.
- Click mid-Atlantic → readout shows whichever marker is closest by great-circle distance.
- Confirm clicking a marker still triggers fly-to (not hijacked by pick mode).
- Confirm xyz values in the readout match those listed in the existing Debug overlay for the same marker.
- Run `bunx vitest run src/components/advisory/__tests__/globeProjection.test.ts` — round-trip test passes.
