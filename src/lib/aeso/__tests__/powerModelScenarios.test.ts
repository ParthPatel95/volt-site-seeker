import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import {
  usePowerModelCalculator,
  type FacilityParams,
  type HourlyRecord,
} from '@/hooks/usePowerModelCalculator';
import { AESO_RATE_DTS_2026 } from '@/constants/tariff-rates';

function genHourlyYear(poolPrice: number, ail = 11000): HourlyRecord[] {
  const out: HourlyRecord[] = [];
  const start = new Date(Date.UTC(2026, 0, 1));
  for (let h = 0; h < 8760; h++) {
    const d = new Date(start.getTime() + h * 3600_000);
    const date = d.toISOString().slice(0, 10);
    const he = (d.getUTCHours() + 1);
    // Push a single very-high spike per month so 12CP avoidance has a target
    const spike = (h % 730 === 17) ? ail + 5000 : ail;
    out.push({ date, he, poolPrice, ailMW: spike });
  }
  return out;
}

const baseParams: FacilityParams = {
  contractedCapacityMW: 45,
  substationFraction: 1.0,
  twelveCP_AvoidanceHours: 12,
  hostingRateUSD: 0.07,
  cadUsdRate: 0.7334,
  targetUptimePercent: 98,
  curtailmentStrategy: '12cp-priority',
  fixedPriceCAD: 0,
  peakAvoidanceSuccessRate: 0.85,
};

describe('usePowerModelCalculator — scenario fields', () => {
  it('exposes missingTwelveCP = successRate × full12CP under 12cp-priority', () => {
    const data = genHourlyYear(40); // below typical breakeven
    const { result } = renderHook(() => usePowerModelCalculator(data, baseParams));
    const a = result.current.annual!;
    const full12 = 12 * AESO_RATE_DTS_2026.bulkSystem.coincidentDemand * 45;
    expect(a.totalBulkCoincidentDemandFull).toBeCloseTo(full12, 4);
    expect(a.missingTwelveCP).toBeCloseTo(0.85 * full12, 4);
  });

  it("'none' strategy ⇒ missingTwelveCP === 0 (pays full 12CP)", () => {
    const data = genHourlyYear(40);
    const { result } = renderHook(() =>
      usePowerModelCalculator(data, { ...baseParams, curtailmentStrategy: 'none' }),
    );
    const a = result.current.annual!;
    expect(a.missingTwelveCP).toBe(0);
    expect(a.totalPriceCurtailmentSavings).toBe(0);
  });

  it('totalBulkCoincidentDemandFull honors tariff override', () => {
    const data = genHourlyYear(40);
    const { result } = renderHook(() =>
      usePowerModelCalculator(data, baseParams, { bulkCoincidentDemand: 20000 }),
    );
    const a = result.current.annual!;
    expect(a.totalBulkCoincidentDemandFull).toBeCloseTo(12 * 20000 * 45, 4);
    expect(a.missingTwelveCP).toBeCloseTo(0.85 * 12 * 20000 * 45, 4);
  });

  it('curtailment savings exceed pool-only energy when hours are curtailed', () => {
    // Pool price high enough to trigger price curtailment
    const data = genHourlyYear(500);
    const { result } = renderHook(() => usePowerModelCalculator(data, baseParams));
    const a = result.current.annual!;
    const log = result.current.shutdownLog;
    const priceHrs = log.filter(s => s.reason === 'Price' || s.reason === '12CP+Price');
    expect(priceHrs.length).toBeGreaterThan(0);
    // Savings include OR + other variable charges, so > pool-energy-only sum
    const poolOnly = priceHrs.reduce((s, r) => s + r.poolPrice * 45, 0);
    expect(a.totalPriceCurtailmentSavings).toBeGreaterThan(poolOnly);
  });
});
