/**
 * Reconcile calculator DTS output against the AESO 2026-015T Bill Estimator.
 *
 * The reconciler always evaluates the estimator with canonical AESO_RATE_DTS_2026
 * rates. If the user applies tariff overrides in the calculator, the
 * reconciliation will (correctly) surface drift on the affected rows.
 */
import type { MonthlyResult, AnnualSummary, FacilityParams } from '@/hooks/usePowerModelCalculator';
import { AESO_RATE_DTS_2026 } from '@/constants/tariff-rates';
import {
  estimateDTSMonth,
  estimateDTSAnnual,
  type DTSEstimateMonth,
} from './billEstimator2026';

export const LINE_ABS_TOL = 1.0;
export const LINE_PCT_TOL = 0.005;
export const SUBTOTAL_PCT_TOL = 0.001;

export interface LineDelta {
  key: keyof DTSEstimateMonth;
  label: string;
  calc: number;
  estimator: number;
  deltaAbs: number;
  deltaPct: number;
  withinTolerance: boolean;
}

export interface MonthReconciliation {
  month: string;
  monthIndex: number;
  lines: LineDelta[];
  subtotalDelta: LineDelta;
  allWithinTolerance: boolean;
}

export interface AnnualReconciliation {
  months: MonthReconciliation[];
  lines: LineDelta[];
  subtotalDelta: LineDelta;
  status: 'pass' | 'drift' | 'fail';
  calcSubtotal: number;
  estimatorSubtotal: number;
}

const LINE_LABELS: Record<keyof DTSEstimateMonth, string> = {
  bulkCoincidentDemand: 'Bulk Coincident Demand (12CP)',
  bulkMeteredEnergy: 'Bulk Metered Energy',
  regionalBillingCapacity: 'Regional Billing Capacity',
  regionalMeteredEnergy: 'Regional Metered Energy',
  podSubstation: 'POD Substation',
  podTiered: 'POD Tiered',
  operatingReserve: 'Operating Reserve',
  tcr: 'TCR',
  voltageControl: 'Voltage Control',
  systemSupport: 'System Support',
  dtsSubtotal: 'DTS Subtotal',
};

function diff(key: keyof DTSEstimateMonth, calc: number, est: number): LineDelta {
  const deltaAbs = calc - est;
  const absMag = Math.max(Math.abs(calc), Math.abs(est), 1e-9);
  const deltaPct = Math.abs(deltaAbs) / absMag;
  const withinTolerance = Math.abs(deltaAbs) <= LINE_ABS_TOL || deltaPct <= LINE_PCT_TOL;
  return {
    key,
    label: LINE_LABELS[key],
    calc,
    estimator: est,
    deltaAbs,
    deltaPct,
    withinTolerance,
  };
}

/**
 * Reverse-engineer the actual pool-priced energy used by the calculator from
 * the persisted operating-reserve charge. This avoids re-walking hourly data.
 */
function poolEnergyFromOR(operatingReserve: number): number {
  const orRate = AESO_RATE_DTS_2026.operatingReserve.ratePercent / 100;
  if (orRate === 0) return 0;
  return operatingReserve / orRate;
}

const COMPONENT_KEYS: (keyof DTSEstimateMonth)[] = [
  'bulkCoincidentDemand',
  'bulkMeteredEnergy',
  'regionalBillingCapacity',
  'regionalMeteredEnergy',
  'podSubstation',
  'podTiered',
  'operatingReserve',
  'tcr',
  'voltageControl',
  'systemSupport',
];

export function reconcileMonth(
  m: MonthlyResult,
  params: FacilityParams,
): MonthReconciliation {
  const successRate =
    params.curtailmentStrategy === 'none'
      ? 0
      : Math.min(1, Math.max(0, params.peakAvoidanceSuccessRate ?? 0.85));

  const est = estimateDTSMonth({
    billingMW: params.contractedCapacityMW,
    mwh: m.mwh,
    substationFraction: params.substationFraction,
    peakAvoidanceSuccessRate: successRate,
    poolEnergyAtActualPrice: poolEnergyFromOR(m.operatingReserve),
  });

  const lines = COMPONENT_KEYS.map((k) => diff(k, m[k] as number, est[k] as number));
  const subtotalDelta = diff('dtsSubtotal', m.totalDTSCharges, est.dtsSubtotal);
  return {
    month: m.month,
    monthIndex: m.monthIndex,
    lines,
    subtotalDelta,
    allWithinTolerance: lines.every((l) => l.withinTolerance) && subtotalDelta.withinTolerance,
  };
}

export function reconcileAnnual(
  monthly: MonthlyResult[],
  _annual: AnnualSummary | null,
  params: FacilityParams,
): AnnualReconciliation {
  const months = monthly.map((m) => reconcileMonth(m, params));

  const estAnnual = estimateDTSAnnual(
    months.map(
      (mr, i): DTSEstimateMonth => ({
        bulkCoincidentDemand: mr.lines[0].estimator,
        bulkMeteredEnergy: mr.lines[1].estimator,
        regionalBillingCapacity: mr.lines[2].estimator,
        regionalMeteredEnergy: mr.lines[3].estimator,
        podSubstation: mr.lines[4].estimator,
        podTiered: mr.lines[5].estimator,
        operatingReserve: mr.lines[6].estimator,
        tcr: mr.lines[7].estimator,
        voltageControl: mr.lines[8].estimator,
        systemSupport: mr.lines[9].estimator,
        dtsSubtotal: mr.subtotalDelta.estimator,
        // i unused but keeps map signature consistent
        ...(i < 0 ? {} : {}),
      }),
    ),
  );

  const calcAnnual: DTSEstimateMonth = {
    bulkCoincidentDemand: 0,
    bulkMeteredEnergy: 0,
    regionalBillingCapacity: 0,
    regionalMeteredEnergy: 0,
    podSubstation: 0,
    podTiered: 0,
    operatingReserve: 0,
    tcr: 0,
    voltageControl: 0,
    systemSupport: 0,
    dtsSubtotal: 0,
  };
  for (const m of monthly) {
    calcAnnual.bulkCoincidentDemand += m.bulkCoincidentDemand;
    calcAnnual.bulkMeteredEnergy += m.bulkMeteredEnergy;
    calcAnnual.regionalBillingCapacity += m.regionalBillingCapacity;
    calcAnnual.regionalMeteredEnergy += m.regionalMeteredEnergy;
    calcAnnual.podSubstation += m.podSubstation;
    calcAnnual.podTiered += m.podTiered;
    calcAnnual.operatingReserve += m.operatingReserve;
    calcAnnual.tcr += m.tcr;
    calcAnnual.voltageControl += m.voltageControl;
    calcAnnual.systemSupport += m.systemSupport;
    calcAnnual.dtsSubtotal += m.totalDTSCharges;
  }

  const lines = COMPONENT_KEYS.map((k) =>
    diff(k, calcAnnual[k] as number, estAnnual[k] as number),
  );
  const subtotalDelta = diff('dtsSubtotal', calcAnnual.dtsSubtotal, estAnnual.dtsSubtotal);

  const subPct = subtotalDelta.deltaPct;
  let status: AnnualReconciliation['status'] = 'pass';
  if (subPct > SUBTOTAL_PCT_TOL || !lines.every((l) => l.withinTolerance)) {
    status = subPct > 0.01 ? 'fail' : 'drift';
  }

  return {
    months,
    lines,
    subtotalDelta,
    status,
    calcSubtotal: calcAnnual.dtsSubtotal,
    estimatorSubtotal: estAnnual.dtsSubtotal,
  };
}