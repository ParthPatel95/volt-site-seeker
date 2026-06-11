// Geometry helpers for the landing-page 3D pipeline globe.
// Pure math, no three.js dependency, so it stays unit-testable in vitest.

export interface Vec3 {
  x: number;
  y: number;
  z: number;
}

/** Standard lat/lng → unit-sphere position (y-up, lng 0 toward -x). */
export function latLngToVec3(lat: number, lng: number, radius: number): Vec3 {
  const phi = ((90 - lat) * Math.PI) / 180;
  const theta = ((lng + 180) * Math.PI) / 180;
  return {
    x: -(radius * Math.sin(phi) * Math.cos(theta)),
    y: radius * Math.cos(phi),
    z: radius * Math.sin(phi) * Math.sin(theta),
  };
}

function slerp(a: Vec3, b: Vec3, t: number): Vec3 {
  const dot = Math.max(-1, Math.min(1, a.x * b.x + a.y * b.y + a.z * b.z));
  const omega = Math.acos(dot);
  if (omega < 1e-6) return a;
  const so = Math.sin(omega);
  const f0 = Math.sin((1 - t) * omega) / so;
  const f1 = Math.sin(t * omega) / so;
  return { x: a.x * f0 + b.x * f1, y: a.y * f0 + b.y * f1, z: a.z * f0 + b.z * f1 };
}

/**
 * Great-circle arc between two surface points, lifted off the sphere so the
 * connection reads as an energy route. Returns `segments + 1` points.
 * Lift scales with arc length, capped so antipodal-ish routes stay graceful.
 */
export function greatCircleArc(
  from: { lat: number; lng: number },
  to: { lat: number; lng: number },
  radius: number,
  segments = 40,
): Vec3[] {
  const a = latLngToVec3(from.lat, from.lng, 1);
  const b = latLngToVec3(to.lat, to.lng, 1);
  const dot = Math.max(-1, Math.min(1, a.x * b.x + a.y * b.y + a.z * b.z));
  const angle = Math.acos(dot); // radians of separation
  const maxLift = radius * 0.35;
  const lift = Math.min(maxLift, radius * 0.5 * (angle / Math.PI));

  const pts: Vec3[] = [];
  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    const p = slerp(a, b, t);
    // Parabolic altitude profile: 0 at endpoints, max at midpoint.
    const altitude = radius + lift * 4 * t * (1 - t);
    pts.push({ x: p.x * altitude, y: p.y * altitude, z: p.z * altitude });
  }
  return pts;
}

/** Marker radius from site MW — sqrt scale, clamped, never fabricated. */
export function mwToMarkerSize(mw: number, maxMw: number): number {
  if (mw <= 0 || maxMw <= 0) return 0.03;
  const t = Math.sqrt(mw / maxMw);
  return 0.035 + t * 0.085; // 0.035 – 0.12 sphere radius
}
