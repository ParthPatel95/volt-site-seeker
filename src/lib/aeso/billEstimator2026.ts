/**
 * AESO 2026-015T Appendix 1 Bill Estimator — independent reference implementation.
 * Source: https://www.aeso.ca/assets/Information-Documents/2026-015T-Appendix-1-Bill-Estimator.xlsx
 */
import { AESO_RATE_DTS_2026 } from '@/constants/tariff-rates';

export interface DTSEstimateInput {
  billingMW: number;
  mwh: number;
  substationFraction: number;
  peakAvoidanceSuccessRate: number;
  poolEnergyAtActualPrice: number;
}

export interface DTSEstimateMonth {
  bulkCoincidentDemand: number;
  bulkMeteredEnergy: number;
  regionalBillingCapacity: number;
  regionalMeteredEnergy: number;
  podSubstation: number;
  podTiered: number;
  operatingReserve: number;
  tcr: number;
  voltageControl: number;
  systemSupport: number;
  dtsSubtotal: number;
}

function podTieredCharge(capacityMW: number, subFraction: number): number {
  const tiers = AESO_RATE_DTS_2026.pointOfDelivery.tiers;
  let remaining = capacityMW;
  let total = 0;
  for (const tier of tiers) {
    const tierMW = tier.mw === Infinity ? remaining : tier.mw * subFraction;
    const applied = Math.min(remaining, tierMW);
    if (applied <= 0) break;
    total += applied * tier.rate;
    remaining -= applied;
  }
  return total;
}

export function estimateDTSMonth(input: DTSEstimateInput): DTSEstimateMonth {
  const r = AESO_RATE_DTS_2026;
  const successRate = Math.min(1, Math.max(0, input.peakAvoidanceSuccessRate));
  const bulkCoincidentDemand = r.bulkSystem.coincidentDemand * input.billingMW * (1 - successRate);
  const bulkMeteredEnergy = r.bulkSystem.meteredEnergy * input.mwh;
  const regionalBillingCapacity = r.regionalSystem.billingCapacity * input.billingMW;
  const regionalMeteredEnergy = r.regionalSystem.meteredEnergy * input.mwh;
  const podSubstation = r.pointOfDelivery.substation * input.substationFraction;
  const podTiered = podTieredCharge(input.billingMW, input.substationFraction);
  const operatingReserve = (r.operatingReserve.ratePercent / 100) * input.poolEnergyAtActualPrice;
  const tcr = r.tcr.meteredEnergy * input.mwh;
  const voltageControl = r.voltageControl.meteredEnergy * input.mwh;
  const systemSupport = r.systemSupport.highestDemand * input.billingMW;
  const dtsSubtotal =
    bulkCoincidentDemand + bulkMeteredEnergy + regionalBillingCapacity +
    regionalMeteredEnergy + podSubstation + podTiered + operatingReserve +
    tcr + voltageControl + systemSupport;
  return {
    bulkCoincidentDemand, bulkMeteredEnergy, regionalBillingCapacity,
    regionalMeteredEnergy, podSubstation, podTiered, operatingReserve,
    tcr, voltageControl, systemSupport, dtsSubtotal,
  };
}

export function estimateDTSAnnual(months: DTSEstimateMonth[]): DTSEstimateMonth {
  const empty: DTSEstimateMonth = {
    bulkCoincidentDemand: 0, bulkMeteredEnergy: 0, regionalBillingCapacity: 0,
    regionalMeteredEnergy: 0, podSubstation: 0, podTiered: 0, operatingReserve: 0,
    tcr: 0, voltageControl: 0, systemSupport: 0, dtsSubtotal: 0,
  };
  return months.reduce<DTSEstimateMonth>((acc, m) => {
    (Object.keys(empty) as (keyof DTSEstimateMonth)[]).forEach((k) => {
      acc[k] = (acc[k] as number) + (m[k] as number);
    });
    return acc;
  }, empty);
}

export const BILL_ESTIMATOR_SOURCE_URL =
  'https://www.aeso.ca/assets/Information-Documents/2026-015T-Appendix-1-Bill-Estimator.xlsx';