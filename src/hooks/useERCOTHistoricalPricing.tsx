import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface HistoricalPricingData {
  statistics: {
    average: number;
    median: number;
    min: number;
    max: number;
    stdDev: number;
    percentile95: number;
  };
  chartData: Array<{ time: string; price: number }>;
  peakHours: Array<{ hour: number; avgPrice: number; count: number }>;
  distribution: Array<{ range: string; count: number; percentage: number }>;
  hourlyPattern: Array<{ hour: number; avgPrice: number }>;
  seasonalPattern: Array<{ month: string; avgPrice: number }>;
  predictions: {
    nextHour: number;
    nextDay: number;
    confidence: number;
  };
  patterns: {
    avgPeakPrice: number;
    avgOffPeakPrice: number;
    volatilityScore: number;
  };
  hourlyData: Array<{ timestamp: string; price: number; demand?: number }>;
}

export interface PeakAnalysisData {
  totalShutdowns: number;
  totalHours: number;
  averageSavings: number;
  shutdownEvents: Array<{
    date: string;
    duration: number;
    avgPrice: number;
    potentialSavings: number;
  }>;
}

export const useERCOTHistoricalPricing = () => {
  const [monthlyData, setMonthlyData] = useState<HistoricalPricingData | null>(null);
  const [yearlyData, setYearlyData] = useState<HistoricalPricingData | null>(null);
  const [peakAnalysis, setPeakAnalysis] = useState<PeakAnalysisData | null>(null);
  const [historicalTenYear, setHistoricalTenYear] = useState<HistoricalPricingData | null>(null);
  
  const [loadingMonthly, setLoadingMonthly] = useState(false);
  const [loadingYearly, setLoadingYearly] = useState(false);
  const [loadingPeakAnalysis, setLoadingPeakAnalysis] = useState(false);
  const [loadingTenYear, setLoadingTenYear] = useState(false);

  const fetchMonthlyData = async () => {
    setLoadingMonthly(true);
    try {
      const { data, error } = await supabase.functions.invoke('ercot-historical-pricing', {
        body: { period: '30days' }
      });

      if (error) throw error;
      if (data?.success) {
        setMonthlyData(data.data);
      }
    } catch (error) {
      console.error('Error fetching ERCOT monthly data:', error);
    } finally {
      setLoadingMonthly(false);
    }
  };

  const fetchYearlyData = async () => {
    setLoadingYearly(true);
    try {
      const { data, error } = await supabase.functions.invoke('ercot-historical-pricing', {
        body: { period: '12months' }
      });

      if (error) throw error;
      if (data?.success) {
        setYearlyData(data.data);
      }
    } catch (error) {
      console.error('Error fetching ERCOT yearly data:', error);
    } finally {
      setLoadingYearly(false);
    }
  };

  const analyzePeakShutdown = async (shutdownHours: number, priceThreshold: number) => {
    setLoadingPeakAnalysis(true);
    try {
      const { data, error } = await supabase.functions.invoke('ercot-historical-pricing', {
        body: { 
          period: '12months',
          analysis: 'peak_shutdown',
          shutdownHours,
          priceThreshold
        }
      });

      if (error) throw error;
      if (data?.success) {
        setPeakAnalysis(data.peakAnalysis);
      }
    } catch (error) {
      console.error('Error analyzing ERCOT peak shutdown:', error);
    } finally {
      setLoadingPeakAnalysis(false);
    }
  };

  const fetchHistoricalTenYearData = async () => {
    setLoadingTenYear(true);
    try {
      const { data, error } = await supabase.functions.invoke('ercot-historical-pricing', {
        body: { period: '10years' }
      });

      if (error) throw error;
      if (data?.success) {
        setHistoricalTenYear(data.data);
      }
    } catch (error) {
      console.error('Error fetching ERCOT 10-year data:', error);
    } finally {
      setLoadingTenYear(false);
    }
  };

  return {
    monthlyData,
    yearlyData,
    peakAnalysis,
    historicalTenYear,
    loadingMonthly,
    loadingYearly,
    loadingPeakAnalysis,
    loadingTenYear,
    fetchMonthlyData,
    fetchYearlyData,
    analyzePeakShutdown,
    fetchHistoricalTenYearData
  };
};
