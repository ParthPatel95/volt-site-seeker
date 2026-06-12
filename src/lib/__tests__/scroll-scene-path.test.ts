import { describe, it, expect } from 'vitest';
import { cameraPose, sceneOpacity } from '../scroll-scene-path';

const dist = (a: number[], b: number[]) =>
  Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);

describe('cameraPose', () => {
  it('starts far west along the transmission line and ends in an aerial overlook', () => {
    const start = cameraPose(0);
    expect(start.pos[0]).toBeLessThan(-40); // far west
    expect(start.pos[1]).toBeLessThan(10);  // low altitude

    const end = cameraPose(1);
    expect(end.pos[1]).toBeGreaterThan(20); // elevated
  });

  it('travels eastward through the reading chapters (B → C)', () => {
    let prevX = cameraPose(0.16).pos[0];
    for (let p = 0.2; p <= 0.6; p += 0.04) {
      const x = cameraPose(p).pos[0];
      expect(x).toBeGreaterThan(prevX - 0.001);
      prevX = x;
    }
  });

  it('is continuous at every segment joint', () => {
    for (const joint of [0.15, 0.4, 0.55, 0.7, 0.88]) {
      const before = cameraPose(joint - 1e-4);
      const after = cameraPose(joint + 1e-4);
      expect(dist(before.pos, after.pos)).toBeLessThan(0.1);
      expect(dist(before.look, after.look)).toBeLessThan(0.1);
    }
  });

  it('clamps out-of-range progress instead of extrapolating', () => {
    expect(cameraPose(-1)).toEqual(cameraPose(0));
    expect(cameraPose(2)).toEqual(cameraPose(1));
    for (const p of [-1, 0, 0.33, 0.66, 1, 2]) {
      const { pos, look } = cameraPose(p);
      for (const v of [...pos, ...look]) expect(Number.isFinite(v)).toBe(true);
    }
  });

  it('looks toward the substation centre while passing it', () => {
    // Around the substation pass, the look-at x should land near the
    // substation (x ≈ 6–18), not back behind the camera.
    for (const p of [0.45, 0.55, 0.65]) {
      const { pos, look } = cameraPose(p);
      expect(look[0]).toBeGreaterThan(pos[0] - 8); // looking forward / sideways
    }
  });
});

describe('sceneOpacity', () => {
  it('is full at the hero, dimmed through the reading zone, re-emerging at the close', () => {
    expect(sceneOpacity(0)).toBe(1);
    expect(sceneOpacity(0.5)).toBeCloseTo(0.42, 5);
    expect(sceneOpacity(1)).toBeCloseTo(0.75, 5);
  });

  it('never leaves [0, 1]', () => {
    for (let p = -0.5; p <= 1.5; p += 0.05) {
      const o = sceneOpacity(p);
      expect(o).toBeGreaterThanOrEqual(0);
      expect(o).toBeLessThanOrEqual(1);
    }
  });
});
