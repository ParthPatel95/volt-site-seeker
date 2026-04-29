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

let LNG_OFFSET_DEG = 0;
export const getLngOffset = () => LNG_OFFSET_DEG;
export const setLngOffset = (deg: number) => { LNG_OFFSET_DEG = deg; };

/** Lat/lng (degrees) → 3D position on a sphere of radius `r`. */
export const latLngToVec3 = (lat: number, lng: number, r: number): THREE.Vector3 => {
  const latRad = lat * (Math.PI / 180);
  const lngRad = (lng + LNG_OFFSET_DEG) * (Math.PI / 180);
  return new THREE.Vector3(
    -r * Math.cos(latRad) * Math.cos(lngRad),
     r * Math.sin(latRad),
     r * Math.cos(latRad) * Math.sin(lngRad),
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
  let lng = Math.atan2(n.z, -n.x) * (180 / Math.PI) - LNG_OFFSET_DEG;
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