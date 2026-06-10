import { describe, it, expect } from 'vitest';
import {
  projectLngLat,
  computeArc,
  ARC_VIEWBOX_WIDTH,
  ARC_VIEWBOX_HEIGHT,
} from '../arcProjection';

describe('projectLngLat', () => {
  it('puts (0, 0) at the centre of the viewbox', () => {
    const p = projectLngLat(0, 0);
    expect(p.x).toBe(ARC_VIEWBOX_WIDTH / 2);
    expect(p.y).toBe(ARC_VIEWBOX_HEIGHT / 2);
  });

  it('puts the north pole at the top edge', () => {
    expect(projectLngLat(0, 90).y).toBe(0);
  });

  it('puts the south pole at the bottom edge', () => {
    expect(projectLngLat(0, -90).y).toBe(ARC_VIEWBOX_HEIGHT);
  });

  it('puts the antimeridian at the right edge', () => {
    expect(projectLngLat(180, 0).x).toBe(ARC_VIEWBOX_WIDTH);
    expect(projectLngLat(-180, 0).x).toBe(0);
  });

  it('returns a finite point for extreme lat (no NaN)', () => {
    const p = projectLngLat(0, 90);
    expect(Number.isFinite(p.x)).toBe(true);
    expect(Number.isFinite(p.y)).toBe(true);
  });
});

describe('computeArc', () => {
  it('produces an SVG path starting at HQ and ending at the site', () => {
    const arc = computeArc({ x: 200, y: 250 }, { x: 800, y: 250 });
    expect(arc.d.startsWith('M200 250')).toBe(true);
    expect(arc.d.endsWith('800 250')).toBe(true);
  });

  it('returns a finite, non-NaN path when HQ and site coincide', () => {
    // Same point — len becomes 0 in the raw math but the helper guards with `|| 1`.
    const arc = computeArc({ x: 500, y: 250 }, { x: 500, y: 250 });
    expect(arc.d).not.toMatch(/NaN/);
    expect(Number.isFinite(arc.control.x)).toBe(true);
    expect(Number.isFinite(arc.control.y)).toBe(true);
  });

  it('clamps the lift at 160 for very long chords (dateline crossings)', () => {
    // Project two extreme lat/lng pairs that straddle the dateline.
    const a = projectLngLat(-170, 30);
    const b = projectLngLat(170, 30);
    const arc = computeArc(a, b);
    const midY = (a.y + b.y) / 2;
    // Lift is at most 160 — the control point should stay within that band.
    expect(Math.abs(arc.control.y - midY)).toBeLessThanOrEqual(160 + 1e-6);
  });

  it('lifts the control point toward the top of the map (negative y direction) for east-bound arcs', () => {
    // Two same-latitude points so the chord is horizontal; control should be above.
    const hq = { x: 200, y: 300 };
    const site = { x: 800, y: 300 };
    const arc = computeArc(hq, site);
    expect(arc.control.y).toBeLessThan(300);
  });

  it('lifts the control point toward the top of the map for west-bound arcs as well', () => {
    // Reverse direction — same chord, opposite traversal. Control still above chord.
    const hq = { x: 800, y: 300 };
    const site = { x: 200, y: 300 };
    const arc = computeArc(hq, site);
    expect(arc.control.y).toBeLessThan(300);
  });

  it('produces unique control points for two sites symmetric about HQ', () => {
    const hq = projectLngLat(-114, 51);
    const east = projectLngLat(-90, 51);
    const west = projectLngLat(-138, 51);
    const eastArc = computeArc(hq, east);
    const westArc = computeArc(hq, west);
    expect(eastArc.control.x).not.toBe(westArc.control.x);
  });

  it('all control-point coordinates are finite for projected Alberta → various', () => {
    const hq = projectLngLat(-114.0719, 51.0447);
    const targets = [
      projectLngLat(-95.3698, 29.7604),  // Houston
      projectLngLat(-79.3832, 43.6532),  // Toronto
      projectLngLat(0, 0),               // Null Island
      projectLngLat(151.2093, -33.8688), // Sydney
    ];
    for (const t of targets) {
      const a = computeArc(hq, t);
      expect(Number.isFinite(a.control.x)).toBe(true);
      expect(Number.isFinite(a.control.y)).toBe(true);
      expect(a.d).not.toMatch(/NaN/);
    }
  });
});
