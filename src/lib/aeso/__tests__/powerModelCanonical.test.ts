import { describe, it, expect } from 'vitest';
import { buildScenarioBundle } from '../powerModelScenarios';
import { auditCoverage } from '../dataCoverage';
import { rawTrainingDataToHourly, dedupeHourly } from '@/lib/power-model-parser';
import type { AnnualSummary, HourlyRecord } from '@/hooks/usePowerModelCalculator';

function makeAnnual(overrides: Partial<AnnualSummary> = {}): AnnualSummary {
  return {
    totalHours: 8760,
    totalRunningHours: 8500,
    avgUptimePercent: 97,
    totalMWh: 100_000,
    totalKWh: 100_000_000,
    totalDTSCharges: 2_000_000,
    totalEnergyCharges: 4_000_000,
    totalFortisCharges: 100_000,
    totalPreGST: 6_100_000,
    totalGST: 305_000,
    totalAmountDue: 6_405_000,
    avgPerKwhCAD: 6_405_000 / 100_000_000,
    avgPerKwhUSD: 0,
    avgPoolPriceRunning: 40,
    curtailmentSavings: 0,
    totalPoolEnergy: 4_000_000,
    totalOperatingReserve: 0,
    totalRetailerFee: 0,
    totalRiderF: 0,
    totalBulkMeteredEnergy: 0,
    totalRegionalBillingCapacity: 0,
    totalRegionalMeteredEnergy: 0,
    totalPodCharges: 0,
    totalFortisDemand: 0,
    totalFortisDistribution: 100_000,
    totalTCR: 0,
    totalVoltageControl: 0,
    totalSystemSupport: 0,
    totalBulkCoincidentDemandFull: 5_000_000,
    totalPriceCurtailmentSavings: 300_000,
    missingTwelveCP: 750_000,
    totalOverContractCredits: 0,
    effectivePerKwhCAD: 0,
    effectivePerKwhUSD: 0,
    ...overrides,
  };
}

describe('buildScenarioBundle — canonical scenario math', () => {
  const annual = makeAnnual();
  const bundle = buildScenarioBundle(annual, 0.7334)!;

  it('uses delivered kWh as the invoice denominator for every scenario', () => {
    expect(bundle.deliveredKWh).toBe(annual.totalKWh);
    expect(bundle.both.centsPerKwhCAD).toBeCloseTo((annual.totalAmountDue / annual.totalKWh) * 100, 6);
  });

  it("'both' scenario matches the calculator's totalAmountDue exactly", () => {
    expect(bundle.both.total).toBeCloseTo(annual.totalAmountDue, 4);
  });

  it('base = both + missingTwelveCP + price-curtail savings (pre-GST), grossed up by GST', () => {
    const gstRate = annual.totalGST / annual.totalPreGST;
    const expected = (annual.totalPreGST + annual.missingTwelveCP + annual.totalPriceCurtailmentSavings) * (1 + gstRate);
    expect(bundle.base.total).toBeCloseTo(expected, 4);
    expect(bundle.base.total).toBeGreaterThan(bundle.both.total);
  });

  it('savings vs base are non-negative and equal base − scenario.total', () => {
    expect(bundle.twelveCP.savingsVsBase).toBeCloseTo(bundle.base.total - bundle.twelveCP.total, 4);
    expect(bundle.priceCurtail.savingsVsBase).toBeCloseTo(bundle.base.total - bundle.priceCurtail.total, 4);
    expect(bundle.both.savingsVsBase).toBeCloseTo(bundle.base.total - bundle.both.total, 4);
  });
});

describe('auditCoverage — hourly coverage', () => {
  function build(year: number, month: number, hours: number): HourlyRecord[] {
    const out: HourlyRecord[] = [];
    const dim = new Date(year, month + 1, 0).getDate();
    for (let day = 1; day <= dim; day++) {
      for (let he = 1; he <= 24; he++) {
        if (out.length >= hours) return out;
        const date = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        out.push({ date, he, poolPrice: 40, ailMW: 11000 });
      }
    }
    return out;
  }

  it('flags an elapsed month with missing hours as not invoice-safe', () => {
    const records = build(2026, 0, 700); // Jan 2026 only 700 of 744 hours
    const report = auditCoverage(records, dedupeHourly(records), new Date(Date.UTC(2026, 2, 15)));
    const jan = report.months.find((m) => m.month === 0)!;
    expect(jan.missingHours).toBe(44);
    expect(jan.isComplete).toBe(true);
    expect(jan.status).toBe('partial');
    expect(jan.exactMatch).toBe(false);
    expect(report.isValidationSafe).toBe(false);
    expect(report.isExactCoverage).toBe(false);
  });

  it('passes when every elapsed month is complete', () => {
    const records = build(2026, 0, 744);
    const report = auditCoverage(records, dedupeHourly(records), new Date(Date.UTC(2026, 1, 5)));
    expect(report.isValidationSafe).toBe(true);
    const jan = report.months.find((m) => m.month === 0)!;
    expect(jan.exactMatch).toBe(true);
  });

  it('counts duplicate raw rows without inflating coverage', () => {
    const records = build(2026, 0, 744);
    const raw = [...records, ...records.slice(0, 10)];
    const report = auditCoverage(raw, dedupeHourly(raw), new Date(Date.UTC(2026, 1, 5)));
    expect(report.duplicateRecords).toBe(10);
    expect(report.distinctHours).toBe(744);
    // Duplicates break the strict per-hour-per-month contract.
    const jan = report.months.find((m) => m.month === 0)!;
    expect(jan.exactMatch).toBe(false);
    expect(report.isExactCoverage).toBe(false);
  });

  it('computes elapsed-hour expected count for an in-progress month', () => {
    // Pretend "now" is 2026-06-18T19:00Z → June has elapsed
    // 17 full days (17*24=408) + 19 hours = 427 expected hours.
    const records = build(2026, 5, 427);
    const report = auditCoverage(records, dedupeHourly(records), new Date(Date.UTC(2026, 5, 18, 19)));
    const jun = report.months.find((m) => m.month === 5)!;
    expect(jun.expectedHours).toBe(427);
    expect(jun.coveredHours).toBe(427);
    expect(jun.exactMatch).toBe(true);
    expect(report.isExactCoverage).toBe(true);
  });
});

describe('rawTrainingDataToHourly — UTC HE conversion', () => {
  it('maps UTC midnight to HE 1 of the same UTC day (no day rollback)', () => {
    const rows = [{ timestamp: '2026-01-02T00:00:00Z', pool_price: 50, ail_mw: 10000 }];
    const out = rawTrainingDataToHourly(rows);
    expect(out).toHaveLength(1);
    expect(out[0].he).toBe(1);
    expect(out[0].date).toBe('2026-01-02');
  });

  it('maps HE 2..24 to the same UTC date', () => {
    const rows = [
      { timestamp: '2026-01-01T01:00:00Z', pool_price: 50, ail_mw: 10000 },
      { timestamp: '2026-01-01T23:00:00Z', pool_price: 60, ail_mw: 11000 },
    ];
    const out = rawTrainingDataToHourly(rows);
    expect(out[0]).toMatchObject({ date: '2026-01-01', he: 2 });
    expect(out[1]).toMatchObject({ date: '2026-01-01', he: 24 });
  });
});