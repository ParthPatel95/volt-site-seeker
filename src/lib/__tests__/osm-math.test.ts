import { describe, it, expect } from 'vitest';
import {
  haversineKm,
  bearingDeg,
  classifyVoltage,
  parseVoltageKv,
  scoreInterconnectCandidate,
} from '../osm-math';

describe('haversineKm', () => {
  it('returns 0 for the same point', () => {
    expect(haversineKm(51.0447, -114.0719, 51.0447, -114.0719)).toBeCloseTo(0, 5);
  });

  it('computes Calgary → Edmonton ≈ 280 km', () => {
    // Reference: ~280 km great-circle between downtown YYC and YEG.
    const d = haversineKm(51.0447, -114.0719, 53.5461, -113.4938);
    expect(d).toBeGreaterThan(275);
    expect(d).toBeLessThan(285);
  });

  it('is symmetric', () => {
    const a = haversineKm(51, -114, 53, -113);
    const b = haversineKm(53, -113, 51, -114);
    expect(a).toBeCloseTo(b, 6);
  });
});

describe('bearingDeg', () => {
  it('north is 0°', () => {
    // From the equator, due-north neighbour.
    expect(bearingDeg(0, 0, 1, 0)).toBeCloseTo(0, 1);
  });

  it('east is 90°', () => {
    expect(bearingDeg(0, 0, 0, 1)).toBeCloseTo(90, 1);
  });

  it('south is 180°', () => {
    expect(bearingDeg(0, 0, -1, 0)).toBeCloseTo(180, 1);
  });

  it('west is 270°', () => {
    expect(bearingDeg(0, 0, 0, -1)).toBeCloseTo(270, 1);
  });

  it('always returns 0..360', () => {
    // Stress-test a handful of jurisdictionally-relevant pairs.
    const pairs: [number, number, number, number][] = [
      [51, -114, 53, -113],
      [29.7, -95.4, 32.8, -96.8],
      [60, 100, -60, -100],
    ];
    for (const [a, b, c, d] of pairs) {
      const v = bearingDeg(a, b, c, d);
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(360);
    }
  });
});

describe('classifyVoltage', () => {
  it('classifies the four buckets', () => {
    expect(classifyVoltage(500)).toBe('≥240 kV');
    expect(classifyVoltage(240)).toBe('≥240 kV');
    expect(classifyVoltage(138)).toBe('138–230 kV');
    expect(classifyVoltage(69)).toBe('69–138 kV');
    expect(classifyVoltage(25)).toBe('<69 kV');
  });

  it('treats the 240 / 138 / 69 thresholds as inclusive on the upper bucket', () => {
    expect(classifyVoltage(239.999)).toBe('138–230 kV');
    expect(classifyVoltage(137.999)).toBe('69–138 kV');
    expect(classifyVoltage(68.999)).toBe('<69 kV');
  });
});

describe('parseVoltageKv', () => {
  it('returns [] for empty / null', () => {
    expect(parseVoltageKv(null)).toEqual([]);
    expect(parseVoltageKv('')).toEqual([]);
    expect(parseVoltageKv(undefined)).toEqual([]);
  });

  it('parses a single value in volts', () => {
    expect(parseVoltageKv('240000')).toEqual([240]);
  });

  it('parses an explicit kV unit', () => {
    expect(parseVoltageKv('138kV')).toEqual([138]);
  });

  it('sorts multi-value OSM tags descending', () => {
    expect(parseVoltageKv('240000;138000;69000')).toEqual([240, 138, 69]);
    expect(parseVoltageKv('69000;240000;138000')).toEqual([240, 138, 69]);
  });

  it('drops garbage entries', () => {
    expect(parseVoltageKv('foo;240000;bar;25000')).toEqual([240, 25]);
  });
});

describe('scoreInterconnectCandidate', () => {
  it('ranks a close bulk substation above a distant one', () => {
    const near = scoreInterconnectCandidate({
      distance_km: 1.5,
      max_kv: 240,
      substation_type: 'transmission',
      operator: 'AltaLink',
    });
    const far = scoreInterconnectCandidate({
      distance_km: 9,
      max_kv: 240,
      substation_type: 'transmission',
      operator: 'AltaLink',
    });
    expect(near.score).toBeGreaterThan(far.score);
  });

  it('ranks a tagged transmission substation above an untagged one at equal distance', () => {
    const tagged = scoreInterconnectCandidate({
      distance_km: 3,
      max_kv: 138,
      substation_type: 'transmission',
      operator: 'ATCO',
    });
    const untagged = scoreInterconnectCandidate({
      distance_km: 3,
      max_kv: 138,
      substation_type: null,
      operator: 'ATCO',
    });
    expect(tagged.score).toBeGreaterThan(untagged.score);
  });

  it('boosts a known operator over an unknown one', () => {
    const named = scoreInterconnectCandidate({
      distance_km: 3,
      max_kv: 138,
      substation_type: 'transmission',
      operator: 'AltaLink',
    });
    const anon = scoreInterconnectCandidate({
      distance_km: 3,
      max_kv: 138,
      substation_type: 'transmission',
      operator: null,
    });
    expect(named.score - anon.score).toBe(10);
  });

  it('emits a "within 2 km" rationale only when distance < 2 km', () => {
    const close = scoreInterconnectCandidate({
      distance_km: 1,
      max_kv: 138,
      substation_type: 'transmission',
      operator: 'ATCO',
    });
    expect(close.rationale).toContain('within 2 km');

    const far = scoreInterconnectCandidate({
      distance_km: 4,
      max_kv: 138,
      substation_type: 'transmission',
      operator: 'ATCO',
    });
    expect(far.rationale).not.toContain('within 2 km');
    expect(far.rationale).toContain('within 5 km');
  });

  it('never returns a negative score', () => {
    const veryFar = scoreInterconnectCandidate({
      distance_km: 50,
      max_kv: 25,
      substation_type: null,
      operator: null,
    });
    expect(veryFar.score).toBeGreaterThanOrEqual(0);
  });
});
