// Shared BTC ROI Calculation Utilities
// Single source of truth for all financial calculations

import { BTCNetworkData } from '../types/btc_roi_types';

export interface DailyMetrics {
  dailyBTC: number;
  dailyRevenue: number;
  dailyPowerCost: number;
  dailyPoolFees: number;
  dailyGrossProfit: number;       // Revenue - Power - Pool Fees
  dailyMaintenance: number;       // Based on annual maintenance %
  dailyNetCashFlow: number;       // Gross Profit - Maintenance (actual cash)
  dailyDepreciation: number;      // Non-cash, for reference only
}

export interface PaybackResult {
  months: number;                 // Actual months or Infinity
  label: string;                  // Display string
  isWithinHorizon: boolean;       // Whether payback is within projection period
  estimatedMonths?: number;       // Estimated months if beyond horizon
}

/**
 * Calculate daily metrics consistently across all components
 */
export function calculateDailyMetrics(
  hashrate: number,           // TH/s per unit
  powerDraw: number,          // Watts per unit
  units: number,
  effectiveRate: number,      // $/kWh
  poolFee: number,            // percentage
  hardwareCost: number,       // $ per unit
  maintenancePercent: number, // annual maintenance as % of investment
  networkData: BTCNetworkData
): DailyMetrics {
  const totalHashrate = hashrate * units * 1e12;  // Convert TH to H
  const blocksPerDay = 144;
  
  // BTC Mining
  const dailyBTC = (totalHashrate / networkData.hashrate) * blocksPerDay * networkData.blockReward;
  const dailyRevenue = dailyBTC * networkData.price;
  
  // Power Costs
  const totalPowerKW = (powerDraw * units) / 1000;
  const dailyPowerCost = totalPowerKW * 24 * effectiveRate;
  
  // Pool Fees
  const dailyPoolFees = dailyRevenue * (poolFee / 100);
  
  // Gross Profit (before maintenance)
  const dailyGrossProfit = dailyRevenue - dailyPowerCost - dailyPoolFees;
  
  // Maintenance (annualized, divided by 365)
  const totalInvestment = hardwareCost * units;
  const annualMaintenance = totalInvestment * (maintenancePercent / 100);
  const dailyMaintenance = annualMaintenance / 365;
  
  // Net Cash Flow (after maintenance) - this is actual cash profit
  const dailyNetCashFlow = dailyGrossProfit - dailyMaintenance;
  
  // Depreciation (non-cash, 3-year straight line)
  const dailyDepreciation = totalInvestment / (3 * 365);
  
  return {
    dailyBTC,
    dailyRevenue,
    dailyPowerCost,
    dailyPoolFees,
    dailyGrossProfit,
    dailyMaintenance,
    dailyNetCashFlow,
    dailyDepreciation
  };
}

/**
 * Calculate payback period with proper labeling
 * Handles cases where payback is beyond the projection horizon
 */
export function calculatePaybackWithLabel(
  projections: { cumulativeCashFlow: number; netCashFlow: number }[],
  horizonMonths: number = 36
): PaybackResult {
  // Check if payback occurs within horizon
  for (let i = 0; i < projections.length; i++) {
    if (projections[i].cumulativeCashFlow >= 0) {
      // Interpolate for exact month
      if (i === 0) {
        return {
          months: 1,
          label: '1 mo',
          isWithinHorizon: true
        };
      }
      const prevCF = projections[i - 1].cumulativeCashFlow;
      const currCF = projections[i].cumulativeCashFlow;
      const fraction = Math.abs(prevCF) / (currCF - prevCF);
      const exactMonths = i + fraction;
      return {
        months: exactMonths,
        label: `${exactMonths.toFixed(1)} mo`,
        isWithinHorizon: true
      };
    }
  }
  
  // Payback not within horizon - check if it will ever pay back
  const avgMonthlyNetCashFlow = projections.reduce((sum, p) => sum + p.netCashFlow, 0) / projections.length;
  const endCumulative = projections[projections.length - 1].cumulativeCashFlow;
  
  if (avgMonthlyNetCashFlow <= 0) {
    // Truly never pays back - negative or zero monthly cash flow
    return {
      months: Infinity,
      label: 'Never',
      isWithinHorizon: false
    };
  }
  
  // Positive cash flow but not within horizon - estimate payback
  const additionalMonths = Math.abs(endCumulative) / avgMonthlyNetCashFlow;
  const estimatedTotal = horizonMonths + additionalMonths;
  
  return {
    months: Infinity, // Still Infinity for calculation purposes
    label: `> ${horizonMonths} mo (~${Math.ceil(estimatedTotal)} mo)`,
    isWithinHorizon: false,
    estimatedMonths: estimatedTotal
  };
}

/**
 * Format currency consistently
 */
export function formatCurrency(value: number): string {
  const absValue = Math.abs(value);
  if (absValue >= 1000000) return `$${(value / 1000000).toFixed(2)}M`;
  if (absValue >= 1000) return `$${(value / 1000).toFixed(1)}K`;
  return `$${value.toFixed(2)}`;
}

/**
 * Format percentage consistently
 */
export function formatPercent(value: number, decimals: number = 1): string {
  return `${value.toFixed(decimals)}%`;
}
