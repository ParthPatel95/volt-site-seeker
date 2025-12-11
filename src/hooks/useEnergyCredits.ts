import { useMemo } from 'react';
import { HourlyDataPoint } from '@/services/historicalDataService';

export interface CreditSettings {
  enabled: boolean;
  twelveCPAvoidanceRate: number; // 0-100%
  operatingReserveParticipation: number; // 0-100%
}

export interface CreditAdjustedData {
  originalData: HourlyDataPoint[];
  adjustedData: HourlyDataPoint[];
  creditSummary: CreditSummary;
}

export interface CreditSummary {
  baseAvgPrice: number;
  twelveCPCredit: number;
  orCredit: number;
  effectivePrice: number;
  savingsPercentage: number;
  totalHours: number;
  estimatedAnnualSavings: number; // $/MWh annualized
}

// AESO transmission adder is $11.73/MWh CAD
const TRANSMISSION_ADDER = 11.73;
// Average operating reserve price (conservative estimate based on historical data)
const AVG_OPERATING_RESERVE_PRICE = 5.0; // $/MWh typical range is $3-8

export function useEnergyCredits(
  data: HourlyDataPoint[],
  creditSettings: CreditSettings
): CreditAdjustedData {
  return useMemo(() => {
    if (!creditSettings.enabled || data.length === 0) {
      const avgPrice = data.length > 0 
        ? data.reduce((sum, d) => sum + d.price, 0) / data.length 
        : 0;
      
      return {
        originalData: data,
        adjustedData: data,
        creditSummary: {
          baseAvgPrice: avgPrice,
          twelveCPCredit: 0,
          orCredit: 0,
          effectivePrice: avgPrice,
          savingsPercentage: 0,
          totalHours: data.length,
          estimatedAnnualSavings: 0,
        },
      };
    }

    // Calculate 12CP credit
    // Monthly transmission savings = (Transmission Adder / 12) × Avoidance Rate
    const monthly12CPCredit = (TRANSMISSION_ADDER / 12) * (creditSettings.twelveCPAvoidanceRate / 100);
    
    // Calculate Operating Reserve credit
    const orCredit = AVG_OPERATING_RESERVE_PRICE * (creditSettings.operatingReserveParticipation / 100);
    
    // Total credit per MWh
    const totalCredit = monthly12CPCredit + orCredit;
    
    // Apply credits to each data point
    const adjustedData = data.map(point => ({
      ...point,
      price: Math.max(0, point.price - totalCredit), // Don't go below 0
    }));
    
    // Calculate summary statistics
    const baseAvgPrice = data.reduce((sum, d) => sum + d.price, 0) / data.length;
    const adjustedAvgPrice = adjustedData.reduce((sum, d) => sum + d.price, 0) / adjustedData.length;
    const savingsPercentage = baseAvgPrice > 0 
      ? ((baseAvgPrice - adjustedAvgPrice) / baseAvgPrice) * 100 
      : 0;
    
    // Annualized savings (assuming 8760 hours/year at 1 MW constant load)
    const estimatedAnnualSavings = totalCredit * 8760;
    
    return {
      originalData: data,
      adjustedData,
      creditSummary: {
        baseAvgPrice,
        twelveCPCredit: monthly12CPCredit,
        orCredit,
        effectivePrice: adjustedAvgPrice,
        savingsPercentage,
        totalHours: data.length,
        estimatedAnnualSavings,
      },
    };
  }, [data, creditSettings.enabled, creditSettings.twelveCPAvoidanceRate, creditSettings.operatingReserveParticipation]);
}

export const defaultCreditSettings: CreditSettings = {
  enabled: false,
  twelveCPAvoidanceRate: 50,
  operatingReserveParticipation: 0,
};
