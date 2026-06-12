import { describe, it, expect } from 'vitest';
import { cameraPose, sceneOpacity } from '../scroll-scene-path';

const dist = (a: number[], b: number[]) =>
  Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);

describe('cameraPose', () => {
  it('starts at the aisle entrance and ends pulled back wide', () => {
    const start = cameraPose(0);
    expect(start.pos[0]).toBeCloseTo(-5.6, 5);
    expect(start.pos[1]).toBeCloseTo(0.55, 5);

    const end = cameraPose(1);
    expect(end.pos[1]).toBeGreaterThan(4); // elevated
    expect(end.pos[2]).toBeGreaterThan(6); // pulled back
  });

  it('travels forward down the aisle through the reading chapters', () => {
    // Within segment B, camera x must be strictly increasing.
    let prevX = cameraPose(0.2).pos[0];
    for (let p = 0.24; p <= 0.48; p += 0.04) {
      const x = cameraPose(p).pos[0];
      expect(x).toBeGreaterThan(prevX);
      prevX = x;
    }
  });

  it('is continuous at every segment joint', () => {
    for (const joint of [0.18, 0.5, 0.78]) {
      const before = cameraPose(joint - 1e-4);
      const after = cameraPose(joint + 1e-4);
      expect(dist(before.pos, after.pos)).toBeLessThan(0.05);
      expect(dist(before.look, after.look)).toBeLessThan(0.05);
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
});

describe('sceneOpacity', () => {
  it('is full at the hero, dimmed through the reading zone, re-emerging at the close', () => {
    expect(sceneOpacity(0)).toBe(1);
    expect(sceneOpacity(0.5)).toBeCloseTo(0.3, 5);
    expect(sceneOpacity(1)).toBeCloseTo(0.65, 5);
  });

  it('never leaves [0, 1]', () => {
    for (let p = -0.5; p <= 1.5; p += 0.05) {
      const o = sceneOpacity(p);
      expect(o).toBeGreaterThanOrEqual(0);
      expect(o).toBeLessThanOrEqual(1);
    }
  });
});
