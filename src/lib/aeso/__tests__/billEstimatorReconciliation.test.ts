import { describe, it, expect } from 'vitest';
import { reconcileAnnual } from '../billEstimatorReconciliation';
import { estimateDTSMonth } from '../billEstimator2026';
import { AESO_RATE_DTS_2026 } from '@/constants/tariff-rates';
import type { MonthlyResult, FacilityParams } from '@/hooks/usePowerModelCalculator';

const params: FacilityParams = {
  contractedCapacityMW: 45,
  substationFraction: 1.0,
  twelveCP_AvoidanceHours: 35,
  hostingRateUSD: 0.07,
  cadUsdRate: 0.7334,
  targetUptimePercent: 95,
  curtailmentStrategy: '12cp-priority',
  fixedPriceCAD: 0,
  peakAvoidanceSuccessRate: 0.85,
};

function makeMonth(over: Partial<MonthlyResult> = {}): MonthlyResult {
  const mwh = 32850;
  const poolEnergyAtActualPrice = 1_500_000;
  const est = estimateDTSMonth({
    billingMW: params.contractedCapacityMW,
    mwh,
    substationFraction: params.substationFraction,
    peakAvoidanceSuccessRate: 0.85,
    poolEnergyAtActualPrice,
  });
  const base: MonthlyResult = {
    month: 'January', monthIndex: 0, totalHours: 730, runningHours: 730,
    curtailedHours: 0, curtailed12CP: 0, curtailedPrice: 0, curtailedOverlap: 0,
    curtailedUptimeCap: 0, uptimePercent: 100, mwh, kwh: mwh * 1000,
    avgPoolPriceRunning: 50,
    bulkCoincidentDemand: est.bulkCoincidentDemand,
    bulkMeteredEnergy: est.bulkMeteredEnergy,
    regionalBillingCapacity: est.regionalBillingCapacity,
    regionalMeteredEnergy: est.regionalMeteredEnergy,
    podSubstation: est.podSubstation,
    podTiered: est.podTiered,
    operatingReserve: est.operatingReserve,
    tcr: est.tcr,
    voltageControl: est.voltageControl,
    systemSupport: est.systemSupport,
    totalDTSCharges: est.dtsSubtotal,
    poolEnergy: poolEnergyAtActualPrice, retailerFee: 0, riderF: 0,
    totalEnergyCharges: poolEnergyAtActualPrice,
    fortisDemandCharge: 0, fortisDistribution: 0, totalFortisCharges: 0,
    totalPreGST: 0, gst: 0, totalAmountDue: 0, perKwhCAD: 0, perKwhUSD: 0,
    curtailmentSavings: 0, overContractCredits: 0,
  };
  return { ...base, ...over };
}

describe('reconcileAnnual', () => {
  it('passes when the calculator matches the estimator', () => {
    const recon = reconcileAnnual([makeMonth()], null, params);
    expect(recon.status).toBe('pass');
    expect(recon.subtotalDelta.withinTolerance).toBe(true);
    recon.lines.forEach((l) => expect(l.withinTolerance).toBe(true));
  });

  it('flags drift when a single DTS line is perturbed', () => {
    const m = makeMonth();
    const bump = AESO_RATE_DTS_2026.regionalSystem.billingCapacity * 45 * 0.05;
    m.regionalBillingCapacity += bump;
    m.totalDTSCharges += bump;
    const recon = reconcileAnnual([m], null, params);
    expect(recon.status).not.toBe('pass');
    const regLine = recon.lines.find((l) => l.key === 'regionalBillingCapacity')!;
    expect(regLine.withinTolerance).toBe(false);
    expect(regLine.deltaAbs).toBeGreaterThan(0);
  });
});