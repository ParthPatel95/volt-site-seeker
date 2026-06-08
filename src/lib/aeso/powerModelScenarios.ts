/**
 * Canonical Power Model scenario math.
 *
 * Every Power Model surface (KPIs, scenario comparison, optimization funnel,
 * scenario builder, CSV, PDF, AI prompt) MUST derive its all-in totals and
 * ¢/kWh figures from this module so the page never shows two different
 * all-in prices for the same configuration.
 *
 * Definitions:
 *   - "Invoice all-in rate" = totalAmountDue / deliveredKWh (post-curtailment).
 *     This is what the customer actually pays per delivered kWh.
 *   - "Full-output reference rate" = scenarioCost / no-curtailment kWh. Useful
 *     as a planning reference but NEVER labeled as the invoice rate.
 */
import type { AnnualSummary } from '@/hooks/usePowerModelCalculator';

export type ScenarioKey = 'base' | 'twelveCP' | 'priceCurtail' | 'both';

export interface ScenarioCost {
  key: ScenarioKey;
  /** Pre-GST CAD. */
  preGST: number;
  /** Post-GST CAD (this is what the customer pays). */
  total: number;
  /** Invoice all-in rate ¢/kWh CAD using delivered kWh denominator. */
  centsPerKwhCAD: number;
  /** Invoice all-in rate ¢/kWh USD using delivered kWh denominator. */
  centsPerKwhUSD: number;
  /** Savings vs base, in CAD (post-GST). */
  savingsVsBase: number;
}

export interface ScenarioBundle {
  /** Delivered kWh used for the invoice denominator (post-curtailment). */
  deliveredKWh: number;
  base: ScenarioCost;
  twelveCP: ScenarioCost;
  priceCurtail: ScenarioCost;
  both: ScenarioCost;
  /** True when no hours qualified for price curtailment. */
  zeroQualifyingHours: boolean;
}

/**
 * Build the canonical scenario bundle from an AnnualSummary. All four
 * scenarios are reconciled to the calculator's `totalPreGST`/`totalAmountDue`,
 * so the "both" scenario always matches the headline KPI exactly.
 */
export function buildScenarioBundle(
  annual: AnnualSummary,
  cadUsdRate: number,
): ScenarioBundle | null {
  if (!annual || annual.totalKWh <= 0) return null;

  const deliveredKWh = annual.totalKWh;
  const gstRate = annual.totalPreGST > 0 ? annual.totalGST / annual.totalPreGST : 0;
  const priceCurtailSavings = Math.max(0, annual.totalPriceCurtailmentSavings);
  const missingTwelveCP = Math.max(0, annual.missingTwelveCP);

  const bothPreGST = annual.totalPreGST;
  const twelveCPPreGST = bothPreGST + priceCurtailSavings;
  const priceCurtailPreGST = bothPreGST + missingTwelveCP;
  const basePreGST = bothPreGST + missingTwelveCP + priceCurtailSavings;

  const toCost = (key: ScenarioKey, preGST: number, baseTotal: number | null): ScenarioCost => {
    const total = preGST * (1 + gstRate);
    const centsPerKwhCAD = (total / deliveredKWh) * 100;
    return {
      key,
      preGST,
      total,
      centsPerKwhCAD,
      centsPerKwhUSD: centsPerKwhCAD * cadUsdRate,
      savingsVsBase: baseTotal == null ? 0 : Math.max(0, baseTotal - total),
    };
  };

  const base = toCost('base', basePreGST, null);
  return {
    deliveredKWh,
    base,
    twelveCP: toCost('twelveCP', twelveCPPreGST, base.total),
    priceCurtail: toCost('priceCurtail', priceCurtailPreGST, base.total),
    both: toCost('both', bothPreGST, base.total),
    zeroQualifyingHours: priceCurtailSavings === 0,
  };
}