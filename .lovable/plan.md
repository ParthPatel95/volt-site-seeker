Plan to fix inaccurate globe locations

1. Correct the coordinate convention
- Replace the current longitude-offset-driven marker placement with a single explicit projection convention that matches Three.js sphere UVs and the existing Earth texture.
- Keep the Earth texture orientation and marker vectors in one shared coordinate frame so rotation, fly-to, debug, and click-pick all agree.

2. Remove fragile auto-calibration behavior
- Disable the land/ocean auto-calibration from controlling marker position. It can choose an offset based on image brightness, which is not precise enough for geographic placement and can shift all markers.
- Use a deterministic texture alignment constant instead, documented in `globeProjection.ts`.

3. Update dependent interactions
- Update `latLngToVec3`, `vec3ToLatLng`, and `tourQuaternionFor` so forward projection, inverse readout, fly-to selection, and nearest-marker picking all use the same corrected math.
- Ensure marker catalog vectors recompute from the same projection values used by rendered markers.

4. Strengthen regression tests
- Add canonical axis tests for known lat/lng positions so longitude signs cannot silently flip again.
- Add round-trip tests for Calgary, Texas, Newfoundland, and the rest of the project sites.
- Keep tour-centering tests to confirm fly-to and rotation still center the selected site.

5. Verify visually
- Run the targeted globe projection tests.
- Use the advisory page debug/pick readout to confirm Calgary, Texas, and Newfoundland markers sit on their expected continents and report matching lat/lng/xyz values.