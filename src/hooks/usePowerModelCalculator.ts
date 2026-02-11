import { useMemo } from 'react';
import { AESO_RATE_DTS_2025, FORTISALBERTA_RATE_65_2026, DEFAULT_FACILITY_PARAMS } from '@/constants/tariff-rates';

export interface FacilityParams {
  contractedCapacityMW: number;
  substationFraction: number;
  twelveCP_AvoidanceHours: number;
  hostingRateUSD: number;
  cadUsdRate: number;
  targetUptimePercent: number;
}

export interface TariffOverrides {
  bulkCoincidentDemand?: number;
  bulkMeteredEnergy?: number;
  regionalBillingCapacity?: number;
  regionalMeteredEnergy?: number;
  podSubstation?: number;
  podTiers?: { rate: number; mw: number }[];
  operatingReservePercent?: number;
  tcrMeteredEnergy?: number;
  voltageControlMeteredEnergy?: number;
  systemSupportHighestDemand?: number;
  riderFMeteredEnergy?: number;
  retailerFeeMeteredEnergy?: number;
  gstRate?: number;
  fortisDemandChargeKwMonth?: number;
  fortisVolumetricCentsKwh?: number;
}

export interface HourlyRecord {
  date: string;
  he: number;
  poolPrice: number;
  ailMW: number;
}

export interface ShutdownRecord {
  date: string;
  he: number;
  poolPrice: number;
  ailMW: number;
  reason: '12CP' | 'Price' | 'UptimeCap' | '12CP+Price';
  costAvoided: number;
}

export interface MonthlyResult {
  month: string;
  monthIndex: number;
  totalHours: number;
  runningHours: number;
  curtailedHours: number;
  curtailed12CP: number;
  curtailedPrice: number;
  curtailedOverlap: number;
  curtailedUptimeCap: number;
  uptimePercent: number;
  mwh: number;
  kwh: number;
  avgPoolPriceRunning: number;
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
  totalDTSCharges: number;
  poolEnergy: number;
  retailerFee: number;
  riderF: number;
  totalEnergyCharges: number;
  fortisDemandCharge: number;
  fortisDistribution: number;
  totalFortisCharges: number;
  totalPreGST: number;
  gst: number;
  totalAmountDue: number;
  perKwhCAD: number;
  perKwhUSD: number;
}

export interface AnnualSummary {
  totalHours: number;
  totalRunningHours: number;
  avgUptimePercent: number;
  totalMWh: number;
  totalKWh: number;
  totalDTSCharges: number;
  totalEnergyCharges: number;
  totalFortisCharges: number;
  totalPreGST: number;
  totalGST: number;
  totalAmountDue: number;
  avgPerKwhCAD: number;
  avgPerKwhUSD: number;
  avgPoolPriceRunning: number;
}

const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December'];

/** Resolve a tariff value: use override if provided, otherwise fall back to default */
function r(override: number | undefined, defaultVal: number): number {
  return override !== undefined ? override : defaultVal;
}

function calculatePODTieredCharge(
  capacityMW: number,
  subFraction: number,
  tierOverrides?: { rate: number; mw: number }[]
): number {
  const tiers = tierOverrides ?? AESO_RATE_DTS_2025.pointOfDelivery.tiers;
  let remaining = capacityMW;
  let total = 0;
  for (const tier of tiers) {
    const tierMW = tier.mw === Infinity ? remaining : tier.mw * subFraction;
    const appliedMW = Math.min(remaining, tierMW);
    if (appliedMW <= 0) break;
    total += appliedMW * tier.rate;
    remaining -= appliedMW;
  }
  return total;
}

function calculateBreakeven(params: FacilityParams, overrides?: TariffOverrides): number {
  const retailer = r(overrides?.retailerFeeMeteredEnergy, AESO_RATE_DTS_2025.retailerFee.meteredEnergy);
  const bulkE = r(overrides?.bulkMeteredEnergy, AESO_RATE_DTS_2025.bulkSystem.meteredEnergy);
  const regE = r(overrides?.regionalMeteredEnergy, AESO_RATE_DTS_2025.regionalSystem.meteredEnergy);
  const tcrE = r(overrides?.tcrMeteredEnergy, AESO_RATE_DTS_2025.tcr.meteredEnergy);
  const vcE = r(overrides?.voltageControlMeteredEnergy, AESO_RATE_DTS_2025.voltageControl.meteredEnergy);
  const riderE = r(overrides?.riderFMeteredEnergy, AESO_RATE_DTS_2025.riderF.meteredEnergy);
  const fortisVol = r(overrides?.fortisVolumetricCentsKwh, FORTISALBERTA_RATE_65_2026.VOLUMETRIC_DELIVERY_CENTS_KWH);

  const marginal = retailer + bulkE + regE + tcrE + vcE + riderE + (fortisVol / 100 * 1000);
  const hostingRateCAD = params.hostingRateUSD / params.cadUsdRate * 1000;
  const orMultiplier = 1 + r(overrides?.operatingReservePercent, AESO_RATE_DTS_2025.operatingReserve.ratePercent) / 100;
  return (hostingRateCAD - marginal) / orMultiplier;
}

export function usePowerModelCalculator(
  hourlyData: HourlyRecord[],
  params: FacilityParams,
  tariffOverrides?: TariffOverrides
) {
  return useMemo(() => {
    if (!hourlyData.length) return { monthly: [], annual: null, breakeven: calculateBreakeven(params, tariffOverrides), shutdownLog: [] as ShutdownRecord[] };

    const breakeven = calculateBreakeven(params, tariffOverrides);
    const cap = params.contractedCapacityMW;
    const subFrac = params.substationFraction;
    const orRate = r(tariffOverrides?.operatingReservePercent, AESO_RATE_DTS_2025.operatingReserve.ratePercent) / 100;
    const targetUptime = params.targetUptimePercent;

    // Resolved rates
    const bulkERate = r(tariffOverrides?.bulkMeteredEnergy, AESO_RATE_DTS_2025.bulkSystem.meteredEnergy);
    const regCapRate = r(tariffOverrides?.regionalBillingCapacity, AESO_RATE_DTS_2025.regionalSystem.billingCapacity);
    const regERate = r(tariffOverrides?.regionalMeteredEnergy, AESO_RATE_DTS_2025.regionalSystem.meteredEnergy);
    const podSubRate = r(tariffOverrides?.podSubstation, AESO_RATE_DTS_2025.pointOfDelivery.substation);
    const tcrRate = r(tariffOverrides?.tcrMeteredEnergy, AESO_RATE_DTS_2025.tcr.meteredEnergy);
    const vcRate = r(tariffOverrides?.voltageControlMeteredEnergy, AESO_RATE_DTS_2025.voltageControl.meteredEnergy);
    const ssRate = r(tariffOverrides?.systemSupportHighestDemand, AESO_RATE_DTS_2025.systemSupport.highestDemand);
    const retailerRate = r(tariffOverrides?.retailerFeeMeteredEnergy, AESO_RATE_DTS_2025.retailerFee.meteredEnergy);
    const riderRate = r(tariffOverrides?.riderFMeteredEnergy, AESO_RATE_DTS_2025.riderF.meteredEnergy);
    const fortisDemand = r(tariffOverrides?.fortisDemandChargeKwMonth, FORTISALBERTA_RATE_65_2026.DEMAND_CHARGE_KW_MONTH);
    const fortisVol = r(tariffOverrides?.fortisVolumetricCentsKwh, FORTISALBERTA_RATE_65_2026.VOLUMETRIC_DELIVERY_CENTS_KWH);
    const gstRate = r(tariffOverrides?.gstRate, AESO_RATE_DTS_2025.gst);

    const monthGroups = new Map<number, HourlyRecord[]>();
    for (const rec of hourlyData) {
      const d = new Date(rec.date);
      const key = d.getMonth();
      if (!monthGroups.has(key)) monthGroups.set(key, []);
      monthGroups.get(key)!.push(rec);
    }

    const monthly: MonthlyResult[] = [];
    const allShutdownRecords: ShutdownRecord[] = [];

    for (const [monthIdx, records] of monthGroups) {
      const sorted = [...records].sort((a, b) => b.ailMW - a.ailMW);
      const top12CPHours = new Set(
        sorted.slice(0, params.twelveCP_AvoidanceHours).map(r => `${r.date}-${r.he}`)
      );

      // Pass 1 & 2: 12CP and price curtailment
      const runningAfterPass12: HourlyRecord[] = [];
      let curtailed12CP = 0;
      let curtailedPrice = 0;
      let curtailedOverlap = 0;

      for (const rec of records) {
        const key = `${rec.date}-${rec.he}`;
        const is12CP = top12CPHours.has(key);
        const isPriceAbove = rec.poolPrice > breakeven;

        if (is12CP || isPriceAbove) {
          let reason: ShutdownRecord['reason'];
          if (is12CP && isPriceAbove) { curtailedOverlap++; reason = '12CP+Price'; }
          else if (is12CP) { curtailed12CP++; reason = '12CP'; }
          else { curtailedPrice++; reason = 'Price'; }

          const costAvoided = isPriceAbove ? (rec.poolPrice - breakeven) * cap : 0;
          allShutdownRecords.push({ date: rec.date, he: rec.he, poolPrice: rec.poolPrice, ailMW: rec.ailMW, reason, costAvoided });
        } else {
          runningAfterPass12.push(rec);
        }
      }

      // Pass 3: Uptime cap enforcement
      const totalHours = records.length;
      const maxRunningHours = Math.floor(totalHours * targetUptime / 100);
      let curtailedUptimeCap = 0;
      let finalRunning = runningAfterPass12;

      if (runningAfterPass12.length > maxRunningHours) {
        // Sort remaining running hours by price descending, curtail most expensive first
        const sortedByPrice = [...runningAfterPass12].sort((a, b) => b.poolPrice - a.poolPrice);
        const toRemove = runningAfterPass12.length - maxRunningHours;
        const removedSet = new Set<string>();

        for (let i = 0; i < toRemove; i++) {
          const rec = sortedByPrice[i];
          const key = `${rec.date}-${rec.he}`;
          removedSet.add(key);
          curtailedUptimeCap++;
          const costAvoided = rec.poolPrice > breakeven ? (rec.poolPrice - breakeven) * cap : rec.poolPrice * cap * 0.01; // minimal savings estimate
          allShutdownRecords.push({ date: rec.date, he: rec.he, poolPrice: rec.poolPrice, ailMW: rec.ailMW, reason: 'UptimeCap', costAvoided });
        }

        finalRunning = runningAfterPass12.filter(rec => !removedSet.has(`${rec.date}-${rec.he}`));
      }

      const runningHours = finalRunning.length;
      let poolEnergyTotal = 0;
      let runningPoolPriceSum = 0;

      for (const rec of finalRunning) {
        const mwh = cap;
        poolEnergyTotal += rec.poolPrice * mwh;
        runningPoolPriceSum += rec.poolPrice;
      }

      const curtailedHours = totalHours - runningHours;
      const mwh = runningHours * cap;
      const kwh = mwh * 1000;
      const avgPoolRunning = runningHours > 0 ? runningPoolPriceSum / runningHours : 0;

      const bulkCoincidentDemand = 0;
      const bulkMeteredEnergy = mwh * bulkERate;
      const regionalBillingCapacity = cap * regCapRate;
      const regionalMeteredEnergy = mwh * regERate;
      const podSubstation = podSubRate * subFrac;
      const podTiered = calculatePODTieredCharge(cap, subFrac, tariffOverrides?.podTiers);
      const operatingReserve = poolEnergyTotal * orRate;
      const tcr = mwh * tcrRate;
      const voltageControl = mwh * vcRate;
      const systemSupport = cap * ssRate;

      const totalDTSCharges = bulkCoincidentDemand + bulkMeteredEnergy + regionalBillingCapacity +
        regionalMeteredEnergy + podSubstation + podTiered + operatingReserve + tcr + voltageControl + systemSupport;

      const retailerFee = mwh * retailerRate;
      const riderF = mwh * riderRate;
      const totalEnergyCharges = poolEnergyTotal + retailerFee + riderF;

      const fortisDemandCharge = cap * 1000 * fortisDemand;
      const fortisDistribution = kwh * fortisVol / 100;
      const totalFortisCharges = fortisDemandCharge + fortisDistribution;

      const totalPreGST = totalDTSCharges + totalEnergyCharges + totalFortisCharges;
      const gst = totalPreGST * gstRate;
      const totalAmountDue = totalPreGST + gst;
      const perKwhCAD = kwh > 0 ? totalAmountDue / kwh : 0;
      const perKwhUSD = perKwhCAD * params.cadUsdRate;

      monthly.push({
        month: MONTH_NAMES[monthIdx], monthIndex: monthIdx, totalHours, runningHours, curtailedHours,
        curtailed12CP, curtailedPrice, curtailedOverlap, curtailedUptimeCap,
        uptimePercent: totalHours > 0 ? (runningHours / totalHours) * 100 : 0,
        mwh, kwh, avgPoolPriceRunning: avgPoolRunning,
        bulkCoincidentDemand, bulkMeteredEnergy, regionalBillingCapacity, regionalMeteredEnergy,
        podSubstation, podTiered, operatingReserve, tcr, voltageControl, systemSupport, totalDTSCharges,
        poolEnergy: poolEnergyTotal, retailerFee, riderF, totalEnergyCharges,
        fortisDemandCharge, fortisDistribution, totalFortisCharges,
        totalPreGST, gst, totalAmountDue, perKwhCAD, perKwhUSD,
      });
    }

    monthly.sort((a, b) => a.monthIndex - b.monthIndex);

    const annual: AnnualSummary = {
      totalHours: monthly.reduce((s, m) => s + m.totalHours, 0),
      totalRunningHours: monthly.reduce((s, m) => s + m.runningHours, 0),
      avgUptimePercent: monthly.length > 0 ? monthly.reduce((s, m) => s + m.uptimePercent, 0) / monthly.length : 0,
      totalMWh: monthly.reduce((s, m) => s + m.mwh, 0),
      totalKWh: monthly.reduce((s, m) => s + m.kwh, 0),
      totalDTSCharges: monthly.reduce((s, m) => s + m.totalDTSCharges, 0),
      totalEnergyCharges: monthly.reduce((s, m) => s + m.totalEnergyCharges, 0),
      totalFortisCharges: monthly.reduce((s, m) => s + m.totalFortisCharges, 0),
      totalPreGST: monthly.reduce((s, m) => s + m.totalPreGST, 0),
      totalGST: monthly.reduce((s, m) => s + m.gst, 0),
      totalAmountDue: monthly.reduce((s, m) => s + m.totalAmountDue, 0),
      avgPerKwhCAD: 0, avgPerKwhUSD: 0, avgPoolPriceRunning: 0,
    };
    if (annual.totalKWh > 0) {
      annual.avgPerKwhCAD = annual.totalAmountDue / annual.totalKWh;
      annual.avgPerKwhUSD = annual.avgPerKwhCAD * params.cadUsdRate;
    }
    if (annual.totalRunningHours > 0) {
      annual.avgPoolPriceRunning = monthly.reduce((s, m) => s + m.avgPoolPriceRunning * m.runningHours, 0) / annual.totalRunningHours;
    }

    // Sort shutdown log by date/he
    allShutdownRecords.sort((a, b) => a.date.localeCompare(b.date) || a.he - b.he);

    return { monthly, annual, breakeven, shutdownLog: allShutdownRecords };
  }, [hourlyData, params, tariffOverrides]);
}
