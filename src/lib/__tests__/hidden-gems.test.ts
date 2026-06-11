import { describe, it, expect } from 'vitest';
import {
  estimateFacilityMw,
  distanceToSegmentKm,
  scoreFacility,
  rankHiddenGems,
  scoreListingText,
  STATUS_WEIGHTS,
  ENERGY_INTENSITY_MWH_PER_TONNE,
  type FacilityRow,
  type GemContext,
} from '../hidden-gems';

function facility(overrides: Partial<FacilityRow> = {}): FacilityRow {
  return {
    id: 'f1',
    name: 'Test Plant',
    operator: 'TestCo',
    facility_type: 'sodium_chlorate',
    naics_code: '325181',
    lat: 53.8,
    lng: -112.9,
    coordinates_precision: 'locality',
    municipality: 'Bruderheim',
    status: 'operating',
    status_as_of: '2026-01-01',
    status_source_url: 'https://example.com',
    capacity_value: 55000,
    capacity_unit: 't/yr',
    estimated_mw: null,
    estimate_basis: 'intensity_model',
    grid_voltage_kv: 144,
    confidence: 'medium',
    source_url: 'https://example.com',
    source_publisher: 'Example',
    notes: null,
    last_verified: null,
    ...overrides,
  };
}

const emptyCtx: GemContext = {
  substations: [],
  transmissionLines: [],
  gasPipelines: [],
  fiberRoutes: [],
  waterSources: [],
};

describe('estimateFacilityMw', () => {
  it('derives ~57 MW for a 55 kt/yr sodium chlorate plant (the benchmark gem)', () => {
    const mw = estimateFacilityMw('sodium_chlorate', 55000, 't/yr');
    // 55000 t × 9 MWh/t ÷ 8760 h ÷ 0.9 ≈ 62.8 — within the 40–70 MW band
    // a real chlorate plant of this size draws.
    expect(mw).not.toBeNull();
    expect(mw!).toBeGreaterThan(40);
    expect(mw!).toBeLessThan(70);
  });

  it('passes through published MW capacity without modelling', () => {
    expect(estimateFacilityMw('anything', 45, 'MW')).toBe(45);
  });

  it('annualizes t/day inputs', () => {
    const daily = estimateFacilityMw('canola_crush', 1500, 't/day');
    const annual = estimateFacilityMw('canola_crush', 1500 * 365 * 0.9, 't/yr');
    expect(daily).toBeCloseTo(annual!, 1);
  });

  it('returns null — never a default — for missing capacity or unknown types', () => {
    expect(estimateFacilityMw('sodium_chlorate', null, 't/yr')).toBeNull();
    expect(estimateFacilityMw('sodium_chlorate', 0, 't/yr')).toBeNull();
    expect(estimateFacilityMw('unknown_type', 1000, 't/yr')).toBeNull();
    expect(estimateFacilityMw('sodium_chlorate', 1000, 'bananas')).toBeNull();
  });
});

describe('distanceToSegmentKm', () => {
  it('is ~0 for a point on the segment', () => {
    const d = distanceToSegmentKm(53.5, -113.5, 53.0, -113.5, 54.0, -113.5);
    expect(d).toBeLessThan(1);
  });

  it('matches endpoint distance when the point is beyond the segment end', () => {
    // Point well north of a short east-west segment.
    const d = distanceToSegmentKm(54.0, -113.0, 53.0, -113.1, 53.0, -112.9);
    // ~111 km per degree latitude
    expect(d).toBeGreaterThan(105);
    expect(d).toBeLessThan(118);
  });
});

describe('scoreFacility', () => {
  it('is fully deterministic — same inputs, same output', () => {
    const f = facility();
    const a = scoreFacility(f, emptyCtx);
    const b = scoreFacility(f, emptyCtx);
    expect(a.total).toBe(b.total);
    expect(a.factors).toEqual(b.factors);
  });

  it('scores 0 (not a default) for factors with no data', () => {
    const g = scoreFacility(facility({ capacity_value: null, estimated_mw: null }), emptyCtx);
    const load = g.factors.find((x) => x.key === 'load_magnitude')!;
    expect(load.score).toBe(0);
    expect(load.detail).toMatch(/not defaulted/);
    const sub = g.factors.find((x) => x.key === 'substation_proximity')!;
    expect(sub.score).toBe(0);
  });

  it('ranks a closed plant far above an identical operating plant', () => {
    const closed = scoreFacility(facility({ status: 'closed' }), emptyCtx);
    const operating = scoreFacility(facility({ status: 'operating' }), emptyCtx);
    expect(closed.total - operating.total).toBe(STATUS_WEIGHTS.closed - STATUS_WEIGHTS.operating);
  });

  it('credits substation and transmission proximity from context', () => {
    const ctx: GemContext = {
      ...emptyCtx,
      substations: [{ name: 'Near Sub', latitude: 53.81, longitude: -112.91, voltage_level: '144kV', capacity_mva: 100, utility_owner: 'X' }],
      transmissionLines: [{ name: 'L1', voltage_kv: 240, start_lat: 53.7, start_lng: -112.95, end_lat: 53.9, end_lng: -112.85 }],
    };
    const near = scoreFacility(facility(), ctx);
    const far = scoreFacility(facility(), emptyCtx);
    expect(near.total).toBeGreaterThan(far.total);
    expect(near.nearestSubstationKm).not.toBeNull();
    expect(near.nearestSubstationKm!).toBeLessThan(5);
    expect(near.nearestTransmissionKv).toBe(240);
  });

  it('total never exceeds 100 and factor maxima sum to 100', () => {
    const ctx: GemContext = {
      substations: [{ name: 'S', latitude: 53.8, longitude: -112.9, voltage_level: '240kV', capacity_mva: 500, utility_owner: 'X' }],
      transmissionLines: [{ voltage_kv: 240, start_lat: 53.8, start_lng: -113.0, end_lat: 53.8, end_lng: -112.8 }],
      gasPipelines: [{ start_lat: 53.8, start_lng: -113.0, end_lat: 53.8, end_lng: -112.8 }],
      fiberRoutes: [{ start_lat: 53.8, start_lng: -113.0, end_lat: 53.8, end_lng: -112.8 }],
      waterSources: [{ name: 'W', lat: 53.81, lng: -112.91 }],
    };
    const g = scoreFacility(facility({ status: 'closed', estimated_mw: 100 }), ctx);
    expect(g.total).toBeLessThanOrEqual(100);
    expect(g.factors.reduce((s, f) => s + f.max, 0)).toBe(100);
    expect(g.grade).toBe('A');
  });

  it('downgrades confidence when data gaps accumulate', () => {
    const g = scoreFacility(
      facility({ capacity_value: null, estimated_mw: null, status: 'unknown', confidence: 'high' }),
      emptyCtx,
    );
    expect(g.confidence).toBe('low');
  });
});

describe('rankHiddenGems', () => {
  const ctx = emptyCtx;
  const plants = [
    facility({ id: 'a', name: 'Operating Mill', status: 'operating' }),
    facility({ id: 'b', name: 'Closed Chlorate', status: 'closed' }),
    facility({ id: 'c', name: 'Curtailed Mill', status: 'curtailed', facility_type: 'pulp_mechanical', capacity_value: 230000 }),
  ];

  it('sorts by total score descending (closed > curtailed > operating)', () => {
    const ranked = rankHiddenGems(plants, ctx);
    expect(ranked.map((g) => g.facility.id)).toEqual(['b', 'c', 'a']);
  });

  it('applies minMw / status / type filters', () => {
    expect(rankHiddenGems(plants, ctx, { statuses: ['closed'] })).toHaveLength(1);
    expect(rankHiddenGems(plants, ctx, { facilityTypes: ['pulp_mechanical'] })).toHaveLength(1);
    expect(rankHiddenGems(plants, ctx, { minMw: 1000 })).toHaveLength(0);
  });

  it('applies state filter, defaulting rows without state to AB', () => {
    const mixed = [
      facility({ id: 'ab', state: 'AB' }),
      facility({ id: 'tx', state: 'TX' }),
      facility({ id: 'legacy' }), // no state column → treated as AB
    ];
    expect(rankHiddenGems(mixed, ctx, { states: ['TX'] }).map((g) => g.facility.id)).toEqual(['tx']);
    expect(rankHiddenGems(mixed, ctx, { states: ['AB'] })).toHaveLength(2);
  });
});

describe('Texas facility types', () => {
  it('models EAF steel and aluminum smelting at sane magnitudes', () => {
    // 3 Mt/yr EAF flat-roll (Sinton-class) ≈ 190 MW
    const eaf = estimateFacilityMw('eaf_steel', 3_000_000, 't/yr');
    expect(eaf!).toBeGreaterThan(150);
    expect(eaf!).toBeLessThan(230);
    // 267 kt/yr smelter (Rockdale-class) ≈ 440+ MW — aluminum is the ceiling.
    const smelter = estimateFacilityMw('aluminum_smelter', 267_000, 't/yr');
    expect(smelter!).toBeGreaterThan(350);
    expect(smelter!).toBeLessThan(550);
  });

  it('refuses to model fabs and LNG — published figures only', () => {
    expect(ENERGY_INTENSITY_MWH_PER_TONNE['semiconductor_fab']).toBeUndefined();
    expect(ENERGY_INTENSITY_MWH_PER_TONNE['lng_liquefaction']).toBeUndefined();
    expect(estimateFacilityMw('semiconductor_fab', 100000, 't/yr')).toBeNull();
  });
});

describe('scoreListingText', () => {
  it('detects the classic hidden-gem listing', () => {
    const r = scoreListingText(
      'Former chemical plant for sale — 45 MW on-site substation, 138kV transmission line frontage, rail spur.',
    );
    expect(r.signals).toContain('substation');
    expect(r.signals).toContain('mw_capacity');
    expect(r.signals).toContain('transmission_line');
    expect(r.signals).toContain('former_plant');
    expect(r.signals).toContain('rail_access');
    expect(r.score).toBeGreaterThanOrEqual(80);
  });

  it('scores plain listings 0 so they are filtered out, and caps at 100', () => {
    expect(scoreListingText('Beautiful 3-bedroom home with attached garage.')).toEqual({
      signals: [],
      score: 0,
    });
    const everything = scoreListingText(
      'former plant for sale: substation, 50 MW, 25 MVA, transmission line, industrial power, ' +
      'high-voltage, rail spur, natural gas line, data center ready, power contract, bitcoin mining facility',
    );
    expect(everything.score).toBe(100);
  });

  it('is case-insensitive and unit-tolerant', () => {
    expect(scoreListingText('SUBSTATION on site').signals).toContain('substation');
    expect(scoreListingText('12.5 megawatts available').signals).toContain('mw_capacity');
  });
});
