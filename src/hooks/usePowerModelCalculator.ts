import { useMemo } from 'react';
import { AESO_RATE_DTS_2026, FORTISALBERTA_RATE_65_2026, DEFAULT_FACILITY_PARAMS } from '@/constants/tariff-rates';

export type CurtailmentStrategy = '12cp-priority' | 'cost-optimized';

export interface FacilityParams {
  contractedCapacityMW: number;
  substationFraction: number;
  twelveCP_AvoidanceHours: number;
  hostingRateUSD: number;
  cadUsdRate: number;
  targetUptimePercent: number;
  curtailmentStrategy: CurtailmentStrategy;
  fixedPriceCAD: number;
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
  curtailmentSavings: number;
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
  curtailmentSavings: number;
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
  curtailmentSavings: number;
  // Component-level totals for per-kWh breakdown
  totalPoolEnergy: number;
  totalOperatingReserve: number;
  totalRetailerFee: number;
  totalRiderF: number;
  totalBulkMeteredEnergy: number;
  totalRegionalBillingCapacity: number;
  totalRegionalMeteredEnergy: number;
  totalPodCharges: number;
  totalFortisDemand: number;
  totalFortisDistribution: number;
  totalTCR: number;
  totalVoltageControl: number;
  totalSystemSupport: number;
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
  const tiers = tierOverrides ?? AESO_RATE_DTS_2026.pointOfDelivery.tiers;
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
  const retailer = r(overrides?.retailerFeeMeteredEnergy, AESO_RATE_DTS_2026.retailerFee.meteredEnergy);
  const bulkE = r(overrides?.bulkMeteredEnergy, AESO_RATE_DTS_2026.bulkSystem.meteredEnergy);
  const regE = r(overrides?.regionalMeteredEnergy, AESO_RATE_DTS_2026.regionalSystem.meteredEnergy);
  const tcrE = r(overrides?.tcrMeteredEnergy, AESO_RATE_DTS_2026.tcr.meteredEnergy);
  const vcE = r(overrides?.voltageControlMeteredEnergy, AESO_RATE_DTS_2026.voltageControl.meteredEnergy);
  const riderE = r(overrides?.riderFMeteredEnergy, AESO_RATE_DTS_2026.riderF.meteredEnergy);
  const fortisVol = r(overrides?.fortisVolumetricCentsKwh, FORTISALBERTA_RATE_65_2026.VOLUMETRIC_DELIVERY_CENTS_KWH);

  const marginal = retailer + bulkE + regE + tcrE + vcE + riderE + (fortisVol / 100 * 1000);
  const hostingRateCAD = params.hostingRateUSD / params.cadUsdRate * 1000;
  const orMultiplier = 1 + r(overrides?.operatingReservePercent, AESO_RATE_DTS_2026.operatingReserve.ratePercent) / 100;
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
    const orRate = r(tariffOverrides?.operatingReservePercent, AESO_RATE_DTS_2026.operatingReserve.ratePercent) / 100;
    const targetUptime = params.targetUptimePercent;

    // Resolved rates
    const bulkERate = r(tariffOverrides?.bulkMeteredEnergy, AESO_RATE_DTS_2026.bulkSystem.meteredEnergy);
    const regCapRate = r(tariffOverrides?.regionalBillingCapacity, AESO_RATE_DTS_2026.regionalSystem.billingCapacity);
    const regERate = r(tariffOverrides?.regionalMeteredEnergy, AESO_RATE_DTS_2026.regionalSystem.meteredEnergy);
    const podSubRate = r(tariffOverrides?.podSubstation, AESO_RATE_DTS_2026.pointOfDelivery.substation);
    const tcrRate = r(tariffOverrides?.tcrMeteredEnergy, AESO_RATE_DTS_2026.tcr.meteredEnergy);
    const vcRate = r(tariffOverrides?.voltageControlMeteredEnergy, AESO_RATE_DTS_2026.voltageControl.meteredEnergy);
    const ssRate = r(tariffOverrides?.systemSupportHighestDemand, AESO_RATE_DTS_2026.systemSupport.highestDemand);
    const retailerRate = r(tariffOverrides?.retailerFeeMeteredEnergy, AESO_RATE_DTS_2026.retailerFee.meteredEnergy);
    const riderRate = r(tariffOverrides?.riderFMeteredEnergy, AESO_RATE_DTS_2026.riderF.meteredEnergy);
    const fortisDemand = r(tariffOverrides?.fortisDemandChargeKwMonth, FORTISALBERTA_RATE_65_2026.DEMAND_CHARGE_KW_MONTH);
    const fortisVol = r(tariffOverrides?.fortisVolumetricCentsKwh, FORTISALBERTA_RATE_65_2026.VOLUMETRIC_DELIVERY_CENTS_KWH);
    const gstRate = r(tariffOverrides?.gstRate, AESO_RATE_DTS_2026.gst);

    const monthGroups = new Map<number, HourlyRecord[]>();
    for (const rec of hourlyData) {
      const d = new Date(rec.date);
      const key = d.getMonth();
      if (!monthGroups.has(key)) monthGroups.set(key, []);
      monthGroups.get(key)!.push(rec);
    }

    const monthly: MonthlyResult[] = [];
    const allShutdownRecords: ShutdownRecord[] = [];

    // Bulk coincident demand rate for cost-optimized scoring
    const bulkCoincidentRate = r(tariffOverrides?.bulkCoincidentDemand, AESO_RATE_DTS_2026.bulkSystem.coincidentDemand);

    for (const [monthIdx, records] of monthGroups) {
      const totalHours = records.length;
      // Budget-based curtailment: uptime target is a FLOOR (minimum guaranteed)
      const maxDowntimeHours = Math.floor(totalHours * (1 - targetUptime / 100));

      let curtailed12CP = 0;
      let curtailedPrice = 0;
      let curtailedOverlap = 0;
      const curtailedUptimeCap = 0;
      let finalRunning: HourlyRecord[];

      // Identify the SINGLE highest peak hour for 12CP avoidance this month
      // Only need to avoid the #1 peak to capture 12CP savings for the month
      const sorted12CP = [...records].sort((a, b) => b.ailMW - a.ailMW);
      const top12CPHour = sorted12CP.length > 0 ? sorted12CP[0] : null;
      const top12CPKey = top12CPHour ? `${top12CPHour.date}-${top12CPHour.he}` : '';

      const isFixedPrice = params.fixedPriceCAD > 0;

      // Helper: calculate curtailment savings per curtailed hour
      // With fixed price, savings = fixedPrice * cap (cost avoided by not consuming)
      // With variable price, savings = poolPrice * cap (cost avoided by not consuming at that hour's rate)
      const calcCurtailSavings = (rec: HourlyRecord) => {
        return isFixedPrice ? params.fixedPriceCAD * cap : rec.poolPrice * cap;
      };

      if (isFixedPrice || params.curtailmentStrategy === '12cp-priority') {
        // === Step 1: Curtail the single highest peak hour for 12CP ===
        let budgetRemaining = maxDowntimeHours;

        const runningAfter12CP: HourlyRecord[] = [];
        for (const rec of records) {
          const key = `${rec.date}-${rec.he}`;
          if (budgetRemaining > 0 && key === top12CPKey) {
            const isPriceAbove = !isFixedPrice && rec.poolPrice > breakeven;
            const reason: ShutdownRecord['reason'] = isPriceAbove ? '12CP+Price' : '12CP';
            if (isPriceAbove) curtailedOverlap++; else curtailed12CP++;
            const costAvoided = isPriceAbove ? (rec.poolPrice - breakeven) * cap : 0;
            allShutdownRecords.push({ date: rec.date, he: rec.he, poolPrice: rec.poolPrice, ailMW: rec.ailMW, reason, costAvoided, curtailmentSavings: calcCurtailSavings(rec) });
            budgetRemaining--;
          } else {
            runningAfter12CP.push(rec);
          }
        }

        // === Step 2: Use remaining budget to curtail the highest energy price hours ===
        if (budgetRemaining > 0) {
          // Sort remaining hours by effective cost (highest first)
          // Always sort by pool price descending - even with fixed pricing,
          // curtail highest pool-price hours for risk avoidance and reporting
          const priceCandidates = [...runningAfter12CP].sort((a, b) => b.poolPrice - a.poolPrice);

          // For variable pricing, only curtail hours above breakeven
          // For fixed pricing, all hours cost the same so curtail the ones with highest pool price (for reporting)
          const eligibleCandidates = isFixedPrice
            ? priceCandidates  // All hours cost the same fixed rate
            : priceCandidates.filter(r => r.poolPrice > breakeven);

          const priceCurtailCount = Math.min(eligibleCandidates.length, budgetRemaining);
          const priceCurtailSet = new Set(
            eligibleCandidates.slice(0, priceCurtailCount).map(r => `${r.date}-${r.he}`)
          );

          finalRunning = [];
          for (const rec of runningAfter12CP) {
            const key = `${rec.date}-${rec.he}`;
            if (priceCurtailSet.has(key)) {
              curtailedPrice++;
              const costAvoided = isFixedPrice
                ? params.fixedPriceCAD * cap
                : (rec.poolPrice - breakeven) * cap;
              allShutdownRecords.push({ date: rec.date, he: rec.he, poolPrice: rec.poolPrice, ailMW: rec.ailMW, reason: 'Price', costAvoided, curtailmentSavings: calcCurtailSavings(rec) });
            } else {
              finalRunning.push(rec);
            }
          }
        } else {
          finalRunning = runningAfter12CP;
        }
      } else {
        // === COST-OPTIMIZED (non-fixed price): 1 hour for 12CP, rest by price value ===
        // The single highest peak hour gets the full 12CP demand charge value
        const twelveCPValue = bulkCoincidentRate * cap;

        const candidates = records.map(rec => {
          const key = `${rec.date}-${rec.he}`;
          const is12CP = key === top12CPKey;
          const isExpensive = rec.poolPrice > breakeven;
          const cpValue = is12CP ? twelveCPValue : 0;
          const priceValue = isExpensive ? (rec.poolPrice - breakeven) * cap : 0;
          return { rec, value: Math.max(cpValue, priceValue), is12CP, isExpensive, key };
        })
        .filter(c => c.value > 0)
        .sort((a, b) => b.value - a.value);

        const curtailCount = Math.min(candidates.length, maxDowntimeHours);
        const curtailedKeys = new Set<string>();

        for (let i = 0; i < curtailCount; i++) {
          const c = candidates[i];
          curtailedKeys.add(c.key);
          if (c.is12CP && c.isExpensive) {
            curtailedOverlap++;
            const costAvoided = (c.rec.poolPrice - breakeven) * cap;
            allShutdownRecords.push({ date: c.rec.date, he: c.rec.he, poolPrice: c.rec.poolPrice, ailMW: c.rec.ailMW, reason: '12CP+Price', costAvoided, curtailmentSavings: calcCurtailSavings(c.rec) });
          } else if (c.is12CP) {
            curtailed12CP++;
            allShutdownRecords.push({ date: c.rec.date, he: c.rec.he, poolPrice: c.rec.poolPrice, ailMW: c.rec.ailMW, reason: '12CP', costAvoided: 0, curtailmentSavings: calcCurtailSavings(c.rec) });
          } else {
            curtailedPrice++;
            const costAvoided = (c.rec.poolPrice - breakeven) * cap;
            allShutdownRecords.push({ date: c.rec.date, he: c.rec.he, poolPrice: c.rec.poolPrice, ailMW: c.rec.ailMW, reason: 'Price', costAvoided, curtailmentSavings: calcCurtailSavings(c.rec) });
          }
        }

        finalRunning = records.filter(rec => !curtailedKeys.has(`${rec.date}-${rec.he}`));
      }

      const runningHours = finalRunning.length;
      let poolEnergyTotal = 0;
      let runningPoolPriceSum = 0;

      for (const rec of finalRunning) {
        const mwh = cap;
        // With fixed price contract, energy cost uses fixed rate, not pool price
        const effectivePrice = isFixedPrice ? params.fixedPriceCAD : rec.poolPrice;
        poolEnergyTotal += effectivePrice * mwh;
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

      // Calculate curtailment savings for this month from shutdown records
      const monthShutdownSavings = allShutdownRecords
        .filter(sr => new Date(sr.date).getMonth() === monthIdx)
        .reduce((s, sr) => s + sr.curtailmentSavings, 0);

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
        curtailmentSavings: monthShutdownSavings,
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
      curtailmentSavings: monthly.reduce((s, m) => s + m.curtailmentSavings, 0),
      // Component-level totals
      totalPoolEnergy: monthly.reduce((s, m) => s + m.poolEnergy, 0),
      totalOperatingReserve: monthly.reduce((s, m) => s + m.operatingReserve, 0),
      totalRetailerFee: monthly.reduce((s, m) => s + m.retailerFee, 0),
      totalRiderF: monthly.reduce((s, m) => s + m.riderF, 0),
      totalBulkMeteredEnergy: monthly.reduce((s, m) => s + m.bulkMeteredEnergy, 0),
      totalRegionalBillingCapacity: monthly.reduce((s, m) => s + m.regionalBillingCapacity, 0),
      totalRegionalMeteredEnergy: monthly.reduce((s, m) => s + m.regionalMeteredEnergy, 0),
      totalPodCharges: monthly.reduce((s, m) => s + m.podSubstation + m.podTiered, 0),
      totalFortisDemand: monthly.reduce((s, m) => s + m.fortisDemandCharge, 0),
      totalFortisDistribution: monthly.reduce((s, m) => s + m.fortisDistribution, 0),
      totalTCR: monthly.reduce((s, m) => s + m.tcr, 0),
      totalVoltageControl: monthly.reduce((s, m) => s + m.voltageControl, 0),
      totalSystemSupport: monthly.reduce((s, m) => s + m.systemSupport, 0),
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
