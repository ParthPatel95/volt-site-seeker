import { useMemo } from 'react';
import { AESO_RATE_DTS_2025, FORTISALBERTA_RATE_65_2026, DEFAULT_FACILITY_PARAMS } from '@/constants/tariff-rates';

export interface FacilityParams {
  contractedCapacityMW: number;
  substationFraction: number;
  twelveCP_AvoidanceHours: number;
  hostingRateUSD: number;
  cadUsdRate: number;
}

export interface HourlyRecord {
  date: string;
  he: number; // Hour Ending 1-24
  poolPrice: number; // $/MWh
  ailMW: number; // Alberta Internal Load
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
  uptimePercent: number;
  mwh: number;
  kwh: number;
  avgPoolPriceRunning: number;
  // DTS Charges
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
  // Energy charges
  poolEnergy: number;
  retailerFee: number;
  riderF: number;
  totalEnergyCharges: number;
  // Totals
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
  totalPreGST: number;
  totalGST: number;
  totalAmountDue: number;
  avgPerKwhCAD: number;
  avgPerKwhUSD: number;
  avgPoolPriceRunning: number;
}

const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December'];

function calculatePODTieredCharge(capacityMW: number, subFraction: number): number {
  const tiers = AESO_RATE_DTS_2025.pointOfDelivery.tiers;
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

function calculateBreakeven(): number {
  const marginal = 
    AESO_RATE_DTS_2025.retailerFee.meteredEnergy +
    AESO_RATE_DTS_2025.bulkSystem.meteredEnergy +
    AESO_RATE_DTS_2025.regionalSystem.meteredEnergy +
    AESO_RATE_DTS_2025.tcr.meteredEnergy +
    AESO_RATE_DTS_2025.voltageControl.meteredEnergy +
    AESO_RATE_DTS_2025.riderF.meteredEnergy;
  
  const hostingRateCAD = DEFAULT_FACILITY_PARAMS.hostingRateUSD / DEFAULT_FACILITY_PARAMS.cadUsdRate * 1000; // $/MWh
  const orMultiplier = 1 + AESO_RATE_DTS_2025.operatingReserve.ratePercent / 100;
  // breakeven: hosting_rate_mwh = pool * orMultiplier + marginal
  // pool = (hosting_rate_mwh - marginal) / orMultiplier
  return (hostingRateCAD - marginal) / orMultiplier;
}

export function usePowerModelCalculator(
  hourlyData: HourlyRecord[],
  params: FacilityParams
) {
  return useMemo(() => {
    if (!hourlyData.length) return { monthly: [], annual: null, breakeven: calculateBreakeven() };

    const breakeven = calculateBreakeven();
    const cap = params.contractedCapacityMW;
    const subFrac = params.substationFraction;
    const orRate = AESO_RATE_DTS_2025.operatingReserve.ratePercent / 100;

    // Group by month
    const monthGroups = new Map<number, HourlyRecord[]>();
    for (const rec of hourlyData) {
      const d = new Date(rec.date);
      const key = d.getMonth(); // 0-11
      if (!monthGroups.has(key)) monthGroups.set(key, []);
      monthGroups.get(key)!.push(rec);
    }

    const monthly: MonthlyResult[] = [];

    for (const [monthIdx, records] of monthGroups) {
      // Sort by AIL descending to find top demand hours
      const sorted = [...records].sort((a, b) => b.ailMW - a.ailMW);
      const top12CPHours = new Set(
        sorted.slice(0, params.twelveCP_AvoidanceHours).map(r => `${r.date}-${r.he}`)
      );

      let runningHours = 0;
      let curtailed12CP = 0;
      let curtailedPrice = 0;
      let curtailedOverlap = 0;
      let poolEnergyTotal = 0;
      let runningPoolPriceSum = 0;

      for (const rec of records) {
        const key = `${rec.date}-${rec.he}`;
        const is12CP = top12CPHours.has(key);
        const isPriceAbove = rec.poolPrice > breakeven;
        
        if (is12CP || isPriceAbove) {
          if (is12CP && isPriceAbove) curtailedOverlap++;
          else if (is12CP) curtailed12CP++;
          else curtailedPrice++;
        } else {
          runningHours++;
          const mwh = cap; // 1 hour * capacity MW
          poolEnergyTotal += rec.poolPrice * mwh;
          runningPoolPriceSum += rec.poolPrice;
        }
      }

      const totalHours = records.length;
      const curtailedHours = totalHours - runningHours;
      const mwh = runningHours * cap;
      const kwh = mwh * 1000;
      const avgPoolRunning = runningHours > 0 ? runningPoolPriceSum / runningHours : 0;

      // 12CP avoidance means coincident demand = 0 MW (avoided all peaks)
      const bulkCoincidentDemand = 0; // Successfully avoided 12CP
      const bulkMeteredEnergy = mwh * AESO_RATE_DTS_2025.bulkSystem.meteredEnergy;
      const regionalBillingCapacity = cap * AESO_RATE_DTS_2025.regionalSystem.billingCapacity;
      const regionalMeteredEnergy = mwh * AESO_RATE_DTS_2025.regionalSystem.meteredEnergy;
      const podSubstation = AESO_RATE_DTS_2025.pointOfDelivery.substation * subFrac;
      const podTiered = calculatePODTieredCharge(cap, subFrac);
      const operatingReserve = poolEnergyTotal * orRate;
      const tcr = mwh * AESO_RATE_DTS_2025.tcr.meteredEnergy;
      const voltageControl = mwh * AESO_RATE_DTS_2025.voltageControl.meteredEnergy;
      const systemSupport = cap * AESO_RATE_DTS_2025.systemSupport.highestDemand;

      const totalDTSCharges = bulkCoincidentDemand + bulkMeteredEnergy + regionalBillingCapacity +
        regionalMeteredEnergy + podSubstation + podTiered + operatingReserve + tcr + voltageControl + systemSupport;

      const retailerFee = mwh * AESO_RATE_DTS_2025.retailerFee.meteredEnergy;
      const riderF = mwh * AESO_RATE_DTS_2025.riderF.meteredEnergy;
      const totalEnergyCharges = poolEnergyTotal + retailerFee + riderF;

      const totalPreGST = totalDTSCharges + totalEnergyCharges;
      const gst = totalPreGST * AESO_RATE_DTS_2025.gst;
      const totalAmountDue = totalPreGST + gst;
      const perKwhCAD = kwh > 0 ? totalAmountDue / kwh : 0;
      const perKwhUSD = perKwhCAD * params.cadUsdRate;

      monthly.push({
        month: MONTH_NAMES[monthIdx],
        monthIndex: monthIdx,
        totalHours,
        runningHours,
        curtailedHours,
        curtailed12CP,
        curtailedPrice,
        curtailedOverlap,
        uptimePercent: totalHours > 0 ? (runningHours / totalHours) * 100 : 0,
        mwh,
        kwh,
        avgPoolPriceRunning: avgPoolRunning,
        bulkCoincidentDemand,
        bulkMeteredEnergy,
        regionalBillingCapacity,
        regionalMeteredEnergy,
        podSubstation,
        podTiered,
        operatingReserve,
        tcr,
        voltageControl,
        systemSupport,
        totalDTSCharges,
        poolEnergy: poolEnergyTotal,
        retailerFee,
        riderF,
        totalEnergyCharges,
        totalPreGST,
        gst,
        totalAmountDue,
        perKwhCAD,
        perKwhUSD,
      });
    }

    monthly.sort((a, b) => a.monthIndex - b.monthIndex);

    // Annual summary
    const annual: AnnualSummary = {
      totalHours: monthly.reduce((s, m) => s + m.totalHours, 0),
      totalRunningHours: monthly.reduce((s, m) => s + m.runningHours, 0),
      avgUptimePercent: monthly.length > 0 ? monthly.reduce((s, m) => s + m.uptimePercent, 0) / monthly.length : 0,
      totalMWh: monthly.reduce((s, m) => s + m.mwh, 0),
      totalKWh: monthly.reduce((s, m) => s + m.kwh, 0),
      totalDTSCharges: monthly.reduce((s, m) => s + m.totalDTSCharges, 0),
      totalEnergyCharges: monthly.reduce((s, m) => s + m.totalEnergyCharges, 0),
      totalPreGST: monthly.reduce((s, m) => s + m.totalPreGST, 0),
      totalGST: monthly.reduce((s, m) => s + m.gst, 0),
      totalAmountDue: monthly.reduce((s, m) => s + m.totalAmountDue, 0),
      avgPerKwhCAD: 0,
      avgPerKwhUSD: 0,
      avgPoolPriceRunning: 0,
    };
    if (annual.totalKWh > 0) {
      annual.avgPerKwhCAD = annual.totalAmountDue / annual.totalKWh;
      annual.avgPerKwhUSD = annual.avgPerKwhCAD * params.cadUsdRate;
    }
    if (annual.totalRunningHours > 0) {
      annual.avgPoolPriceRunning = monthly.reduce((s, m) => s + m.avgPoolPriceRunning * m.runningHours, 0) / annual.totalRunningHours;
    }

    return { monthly, annual, breakeven };
  }, [hourlyData, params]);
}
