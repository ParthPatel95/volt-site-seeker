import { describe, it, expect } from 'vitest';
import { latLngToVec3, greatCircleArc, mwToMarkerSize } from '../globe-math';

const len = (v: { x: number; y: number; z: number }) =>
  Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z);

describe('latLngToVec3', () => {
  it('puts poles on the y axis and keeps points on the sphere', () => {
    const north = latLngToVec3(90, 0, 2);
    expect(north.y).toBeCloseTo(2, 5);
    expect(Math.abs(north.x)).toBeLessThan(1e-6);
    expect(Math.abs(north.z)).toBeLessThan(1e-6);

    for (const [lat, lng] of [[51.04, -114.07], [0.42, 33.2], [-33.9, 151.2]]) {
      expect(len(latLngToVec3(lat, lng, 2))).toBeCloseTo(2, 5);
    }
  });

  it('separates distinct sites (Calgary vs Jinja are far apart)', () => {
    const calgary = latLngToVec3(51.0447, -114.0719, 2);
    const jinja = latLngToVec3(0.4244, 33.2042, 2);
    const d = len({ x: calgary.x - jinja.x, y: calgary.y - jinja.y, z: calgary.z - jinja.z });
    expect(d).toBeGreaterThan(2); // chord across most of the globe
  });
});

describe('greatCircleArc', () => {
  const calgary = { lat: 51.0447, lng: -114.0719 };
  const jinja = { lat: 0.4244, lng: 33.2042 };

  it('starts and ends on the sphere surface and rises in between', () => {
    const pts = greatCircleArc(calgary, jinja, 2, 40);
    expect(pts).toHaveLength(41);
    expect(len(pts[0])).toBeCloseTo(2, 3);
    expect(len(pts[40])).toBeCloseTo(2, 3);
    const midAlt = len(pts[20]);
    expect(midAlt).toBeGreaterThan(2.05);
    expect(midAlt).toBeLessThanOrEqual(2 + 2 * 0.35 + 1e-6); // lift cap
  });

  it('handles near-identical endpoints without NaN', () => {
    const pts = greatCircleArc(calgary, { lat: 51.0448, lng: -114.0718 }, 2, 8);
    for (const p of pts) {
      expect(Number.isFinite(p.x)).toBe(true);
      expect(Number.isFinite(p.y)).toBe(true);
      expect(Number.isFinite(p.z)).toBe(true);
    }
  });
});

describe('mwToMarkerSize', () => {
  it('is monotonic and clamped to the design range', () => {
    const small = mwToMarkerSize(45, 536);
    const big = mwToMarkerSize(536, 536);
    expect(big).toBeGreaterThan(small);
    expect(small).toBeGreaterThanOrEqual(0.035);
    expect(big).toBeLessThanOrEqual(0.12 + 1e-9);
  });

  it('falls back to the minimum for degenerate inputs instead of inventing size', () => {
    expect(mwToMarkerSize(0, 536)).toBe(0.03);
    expect(mwToMarkerSize(100, 0)).toBe(0.03);
  });
});
