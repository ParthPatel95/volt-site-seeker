import { describe, it, expect } from 'vitest';
import { estimateDTSMonth } from '../billEstimator2026';
import { AESO_RATE_DTS_2026 } from '@/constants/tariff-rates';

describe('estimateDTSMonth — AESO 2026-015T Bill Estimator', () => {
  const billingMW = 45;
  const mwh = 32850; // ~1 month at 45 MW continuous
  const substationFraction = 1.0;
  const peakAvoidanceSuccessRate = 0.85;
  const poolEnergyAtActualPrice = 1_500_000; // $ CAD

  const est = estimateDTSMonth({
    billingMW,
    mwh,
    substationFraction,
    peakAvoidanceSuccessRate,
    poolEnergyAtActualPrice,
  });

  it('computes bulk coincident demand with success-rate haircut', () => {
    const expected =
      AESO_RATE_DTS_2026.bulkSystem.coincidentDemand * billingMW * (1 - peakAvoidanceSuccessRate);
    expect(est.bulkCoincidentDemand).toBeCloseTo(expected, 6);
  });

  it('computes bulk metered energy', () => {
    expect(est.bulkMeteredEnergy).toBeCloseTo(
      AESO_RATE_DTS_2026.bulkSystem.meteredEnergy * mwh,
      6,
    );
  });

  it('computes regional billing capacity and energy', () => {
    expect(est.regionalBillingCapacity).toBeCloseTo(
      AESO_RATE_DTS_2026.regionalSystem.billingCapacity * billingMW,
      6,
    );
    expect(est.regionalMeteredEnergy).toBeCloseTo(
      AESO_RATE_DTS_2026.regionalSystem.meteredEnergy * mwh,
      6,
    );
  });

  it('computes POD substation as flat fee × fraction', () => {
    expect(est.podSubstation).toBeCloseTo(
      AESO_RATE_DTS_2026.pointOfDelivery.substation * substationFraction,
      6,
    );
  });

  it('walks the POD tier table correctly for 45 MW @ full substation', () => {
    // 7.5 * 5122 + 9.5 * 3037 + 23 * 2033 + 5 * 1252
    const expected = 7.5 * 5122 + 9.5 * 3037 + 23 * 2033 + 5 * 1252;
    expect(est.podTiered).toBeCloseTo(expected, 6);
  });

  it('computes operating reserve as % of pool-priced energy', () => {
    expect(est.operatingReserve).toBeCloseTo(
      (AESO_RATE_DTS_2026.operatingReserve.ratePercent / 100) * poolEnergyAtActualPrice,
      6,
    );
  });

  it('subtotal equals the sum of components', () => {
    const sum =
      est.bulkCoincidentDemand +
      est.bulkMeteredEnergy +
      est.regionalBillingCapacity +
      est.regionalMeteredEnergy +
      est.podSubstation +
      est.podTiered +
      est.operatingReserve +
      est.tcr +
      est.voltageControl +
      est.systemSupport;
    expect(est.dtsSubtotal).toBeCloseTo(sum, 4);
  });
});