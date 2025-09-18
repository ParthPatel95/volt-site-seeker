import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export interface OptimizationParams {
  energyDemand: number;
  operatingHours: number;
  flexibilityWindow: number;
  demandChargeRate: number;
  transmissionRate: number;
  carbonPrice: number;
  carbonIntensity: number;
  priority: 'cost' | 'carbon' | 'balanced';
}

export interface LoadScheduleSlot {
  hour: number;
  timeSlot: string;
  energyPrice: number;
  demandCharge: number;
  transmissionCost: number;
  carbonCost: number;
  totalCost: number;
  carbonEmissions: number;
  recommendationScore: number;
  isOptimal: boolean;
}

export interface OptimizationResult {
  scheduleOptions: LoadScheduleSlot[];
  optimalSlots: LoadScheduleSlot[];
  savings: {
    costSavings: number;
    carbonSavings: number;
    percentSavings: number;
  };
  summary: {
    bestStartTime: string;
    totalCost: number;
    totalEmissions: number;
    paybackPeriod?: number;
  };
}

export interface StorageROIParams {
  storageCapacityMWh: number;
  storagePowerMW: number;
  capitalCost: number;
  operatingCostPerYear: number;
  projectLifeYears: number;
  discountRate: number;
  chargeEfficiency?: number;
  dischargeEfficiency?: number;
  demandChargeRate?: number;
}

export interface StorageROIResult {
  npv: number;
  paybackPeriod: number;
  irr: number;
  annualRevenue: number;
  revenueBreakdown: {
    arbitrage: number;
    demandCharges: number;
    ancillaryServices: number;
  };
  levelizedCostOfStorage: number;
}

export interface DemandResponseParams {
  baselineLoadMW: number;
  curtailmentCapacityMW: number;
  curtailmentDurationHours: number;
  incentiveRate: number;
  availabilityPayment: number;
  participationDays: number;
}

export interface DemandResponseResult {
  annualRevenue: number;
  revenueBreakdown: {
    availability: number;
    dispatch: number;
  };
  implementationCost: number;
  annualOperatingCost: number;
  paybackPeriod: number;
  netAnnualBenefit: number;
  dispatchEvents: number;
}

export function useOptimizationEngine() {
  const [loadingSchedule, setLoadingSchedule] = useState(false);
  const [loadingStorage, setLoadingStorage] = useState(false);
  const [loadingDemandResponse, setLoadingDemandResponse] = useState(false);
  const { toast } = useToast();

  const optimizeLoadSchedule = async (params: OptimizationParams): Promise<OptimizationResult | null> => {
    setLoadingSchedule(true);
    try {
      const { data, error } = await supabase.functions.invoke('optimization-engine', {
        body: { action: 'optimize_load_schedule', params }
      });

      if (error) throw error;

      toast({
        title: "Load schedule optimized",
        description: `Found ${data.result.optimalSlots.length} optimal time slots`,
      });

      return data.result;
    } catch (error: any) {
      console.error('Error optimizing load schedule:', error);
      toast({
        title: "Optimization failed",
        description: error.message || "Failed to optimize load schedule",
        variant: "destructive",
      });
      return null;
    } finally {
      setLoadingSchedule(false);
    }
  };

  const calculateStorageROI = async (params: StorageROIParams): Promise<StorageROIResult | null> => {
    setLoadingStorage(true);
    try {
      const { data, error } = await supabase.functions.invoke('optimization-engine', {
        body: { action: 'calculate_storage_roi', params }
      });

      if (error) throw error;

      toast({
        title: "Storage ROI calculated",
        description: `Payback period: ${data.result.paybackPeriod} years`,
      });

      return data.result;
    } catch (error: any) {
      console.error('Error calculating storage ROI:', error);
      toast({
        title: "Calculation failed",
        description: error.message || "Failed to calculate storage ROI",
        variant: "destructive",
      });
      return null;
    } finally {
      setLoadingStorage(false);
    }
  };

  const analyzeDemandResponse = async (params: DemandResponseParams): Promise<DemandResponseResult | null> => {
    setLoadingDemandResponse(true);
    try {
      const { data, error } = await supabase.functions.invoke('optimization-engine', {
        body: { action: 'analyze_demand_response', params }
      });

      if (error) throw error;

      toast({
        title: "Demand response analyzed",
        description: `Annual revenue potential: $${data.result.annualRevenue.toLocaleString()}`,
      });

      return data.result;
    } catch (error: any) {
      console.error('Error analyzing demand response:', error);
      toast({
        title: "Analysis failed",
        description: error.message || "Failed to analyze demand response",
        variant: "destructive",
      });
      return null;
    } finally {
      setLoadingDemandResponse(false);
    }
  };

  return {
    optimizeLoadSchedule,
    calculateStorageROI,
    analyzeDemandResponse,
    loadingSchedule,
    loadingStorage,
    loadingDemandResponse
  };
}