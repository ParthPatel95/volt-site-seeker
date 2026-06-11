import { describe, it, expect } from 'vitest';
import { REGIONS, projectToScene, mwToBarHeight, statusColor } from '../gem-scene';

describe('projectToScene', () => {
  it('places the region centre at the scene origin', () => {
    const p = projectToScene(REGIONS.AB.centerLat, REGIONS.AB.centerLng, REGIONS.AB);
    expect(p).not.toBeNull();
    expect(p!.x).toBeCloseTo(0, 5);
    expect(p!.z).toBeCloseTo(0, 5);
  });

  it('maps north to -z and east to +x at true km scale', () => {
    // 1 degree north of centre ≈ 111.32 km ≈ 11.1 scene units up (-z).
    const north = projectToScene(REGIONS.AB.centerLat + 1, REGIONS.AB.centerLng, REGIONS.AB)!;
    expect(north.z).toBeCloseTo(-11.132, 2);
    expect(north.x).toBeCloseTo(0, 5);

    const east = projectToScene(REGIONS.AB.centerLat, REGIONS.AB.centerLng + 1, REGIONS.AB)!;
    expect(east.x).toBeGreaterThan(0);
    // At ~53°N, a degree of longitude is ~cos(53°) of a latitude degree.
    expect(east.x).toBeCloseTo(11.132 * Math.cos((REGIONS.AB.centerLat * Math.PI) / 180), 2);
  });

  it('returns null (skip, not clamp) outside the modelled span', () => {
    // Texas coordinates against the Alberta region spec are far out of span.
    expect(projectToScene(30.6, -96.6, REGIONS.AB)).toBeNull();
  });
});

describe('mwToBarHeight', () => {
  it('renders unknown MW as height 0 — never an invented bar', () => {
    expect(mwToBarHeight(null)).toBe(0);
    expect(mwToBarHeight(0)).toBe(0);
    expect(mwToBarHeight(-5)).toBe(0);
  });

  it('is monotonic in MW', () => {
    const h10 = mwToBarHeight(10);
    const h45 = mwToBarHeight(45);
    const h450 = mwToBarHeight(450);
    expect(h45).toBeGreaterThan(h10);
    expect(h450).toBeGreaterThan(h45);
  });
});

describe('statusColor', () => {
  it('maps every status to a distinct color and unknowns to slate', () => {
    const statuses = ['closed', 'announced_closure', 'for_sale', 'idle', 'curtailed', 'operating'];
    const colors = statuses.map(statusColor);
    expect(new Set(colors).size).toBe(statuses.length);
    expect(statusColor('whatever')).toBe('#94a3b8');
  });
});
