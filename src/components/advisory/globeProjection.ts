import * as THREE from 'three';

/**
 * Pure projection helpers for the Advisory globe.
 *
 * The Earth mesh and all marker/arc meshes live in the SAME parent <group>,
 * so when the tour rotates that group both the texture and every marker
 * vector rotate as a single rigid body — they cannot drift out of alignment.
 *
 * `LNG_OFFSET_DEG` is set once by texture auto-calibration and shared here
 * so projection (markers) and tour math (camera-facing rotation) use the
 * exact same value. Tests pin it to 0 to assert the canonical mapping.
 */
export const GLOBE_RADIUS = 2;

/**
 * Longitude offset (degrees) used to align marker placement with whatever
 * equirectangular texture is loaded onto the Earth mesh. The default of 0
 * matches a standard NASA-style day map where u=0 is the antimeridian
 * (lng = -180°) and u=0.5 is Greenwich (lng = 0°), which is exactly the
 * convention three.js's SphereGeometry produces.
 *
 * If a texture is shifted, set this once via `setLngOffset` so projection
 * (markers), inverse projection (pick readout) and tour rotations all stay
 * locked together.
 */
let LNG_OFFSET_DEG = 0;
export const getLngOffset = () => LNG_OFFSET_DEG;
export const setLngOffset = (deg: number) => { LNG_OFFSET_DEG = deg; };

/**
 * Lat/lng (degrees) → 3D position on a sphere of radius `r`.
 *
 * Derived directly from three.js's SphereGeometry parametric form so that
 * the point we compute lands on the exact same texel the texture paints.
 *
 *   three.js vertex(u, v) =
 *     ( -cos(2πu)·sin(πv),  cos(πv),  sin(2πu)·sin(πv) )
 *
 * Standard equirectangular Earth maps use u = (lng + 180) / 360 and
 * v = (90 - lat) / 180. Substituting collapses to:
 *
 *     x =  cos(lat)·cos(lng)
 *     y =  sin(lat)
 *     z = -cos(lat)·sin(lng)
 *
 * This puts (0°, 0°) at +X (Gulf of Guinea, Greenwich on equator),
 * (0°, 90°E) at -Z, and the North Pole at +Y — matching the Blue Marble
 * orientation we ship.
 */
export const latLngToVec3 = (lat: number, lng: number, r: number): THREE.Vector3 => {
  const latRad = lat * (Math.PI / 180);
  const lngRad = (lng + LNG_OFFSET_DEG) * (Math.PI / 180);
  const cosLat = Math.cos(latRad);
  return new THREE.Vector3(
     r * cosLat * Math.cos(lngRad),
     r * Math.sin(latRad),
    -r * cosLat * Math.sin(lngRad),
  );
};

/**
 * Inverse of `latLngToVec3`. Accepts any vector (it will be normalized) in
 * the same coordinate frame the markers live in (i.e. local to the globe
 * group). Returns geographic lat/lng in degrees, with the calibrated
 * longitude offset removed so the result matches the source data.
 */
export const vec3ToLatLng = (v: THREE.Vector3): { lat: number; lng: number } => {
  const n = v.clone().normalize();
  const lat = Math.asin(Math.max(-1, Math.min(1, n.y))) * (180 / Math.PI);
  // Inverse of latLngToVec3: lng = atan2(-z, x) (because z = -cos·sin(lng)
  // and x = cos·cos(lng)), then strip the calibrated offset.
  let lng = Math.atan2(-n.z, n.x) * (180 / Math.PI) - LNG_OFFSET_DEG;
  // Wrap to [-180, 180]
  lng = ((lng + 540) % 360) - 180;
  return { lat, lng };
};

/**
 * Quaternion that, when applied to the globe group, brings (lat, lng) to
 * face the camera at +Z (with a small downward tilt so northern sites don't
 * sit at the very top of the frame).
 */
export const tourQuaternionFor = (lat: number, lng: number): THREE.Quaternion => {
  const v = latLngToVec3(lat, lng, 1).normalize();
  const target = new THREE.Vector3(0, -0.18, 1).normalize();
  return new THREE.Quaternion().setFromUnitVectors(v, target);
};

/** Where the (lat,lng) point ends up in world space after the tour rotation. */
export const projectAfterTour = (lat: number, lng: number): THREE.Vector3 => {
  const v = latLngToVec3(lat, lng, 1).normalize();
  return v.clone().applyQuaternion(tourQuaternionFor(lat, lng));
};