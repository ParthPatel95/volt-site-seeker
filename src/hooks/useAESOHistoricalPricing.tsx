import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export interface HistoricalPricingData {
  statistics: {
    average: number;
    peak: number;
    low: number;
    volatility: number;
    trend?: 'up' | 'down' | 'stable';
  };
  chartData: Array<{
    date: string;
    price: number;
    average?: number;
    peak?: number;
  }>;
  peakHours?: Array<{
    date: string;
    hour: number;
    price: number;
  }>;
  distribution?: Array<{
    range: string;
    hours: number;
  }>;
  hourlyPatterns?: Array<{
    hour: number;
    averagePrice: number;
  }>;
  seasonalPatterns?: {
    [key: string]: {
      average: number;
      peak: number;
    };
  };
  predictions?: Array<{
    hour: number;
    predictedPrice: number;
    confidence: number;
  }>;
  patterns?: Array<{
    type: string;
    description: string;
    count?: number;
    threshold?: number;
  }>;
  lastUpdated?: string;
}

export interface PeakAnalysisData {
  totalShutdowns: number;
  totalHours: number;
  averageSavings: number;
  events: Array<{
    date: string;
    price: number;
    duration: number;
    savings: number;
  }>;
}

export function useAESOHistoricalPricing() {
  const [monthlyData, setMonthlyData] = useState<HistoricalPricingData | null>(null);
  const [yearlyData, setYearlyData] = useState<HistoricalPricingData | null>(null);
  const [peakAnalysis, setPeakAnalysis] = useState<PeakAnalysisData | null>(null);
  const [loadingMonthly, setLoadingMonthly] = useState(false);
  const [loadingYearly, setLoadingYearly] = useState(false);
  const [loadingPeakAnalysis, setLoadingPeakAnalysis] = useState(false);
  const { toast } = useToast();

  const fetchMonthlyData = async () => {
    setLoadingMonthly(true);
    try {
      const { data, error } = await supabase.functions.invoke('aeso-historical-pricing', {
        body: { timeframe: 'monthly' }
      });

      if (error) throw error;

      if (data.error) {
        throw new Error(data.error);
      } else {
        setMonthlyData(data);
        
        toast({
          title: "Monthly data loaded",
          description: "Real-time 30-day pricing data updated",
        });
      }
    } catch (error: any) {
      console.error('Error fetching monthly data:', error);
      
      toast({
        title: "Error loading data",
        description: "Failed to fetch real-time pricing data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoadingMonthly(false);
    }
  };

  const fetchYearlyData = async () => {
    setLoadingYearly(true);
    try {
      const { data, error } = await supabase.functions.invoke('aeso-historical-pricing', {
        body: { timeframe: 'yearly' }
      });

      if (error) throw error;

      if (data.error) {
        throw new Error(data.error);
      } else {
        setYearlyData(data);
        
        toast({
          title: "Yearly data loaded",
          description: "Real-time 12-month pricing data updated",
        });
      }
    } catch (error: any) {
      console.error('Error fetching yearly data:', error);
      
      toast({
        title: "Error loading data",
        description: "Failed to fetch real-time pricing data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoadingYearly(false);
    }
  };

  const analyzePeakShutdown = async (shutdownHours: number, priceThreshold: number) => {
    setLoadingPeakAnalysis(true);
    try {
      // Use real historical data for peak analysis
      if (!monthlyData) {
        throw new Error('No historical data available for analysis. Please load monthly data first.');
      }

      const events = monthlyData.chartData
        .filter(day => day.price > priceThreshold)
        .map(day => ({
          date: day.date,
          price: day.price,
          duration: shutdownHours,
          savings: (day.price - priceThreshold * 0.7) * shutdownHours
        }));

      const analysis: PeakAnalysisData = {
        totalShutdowns: events.length,
        totalHours: events.length * shutdownHours,
        averageSavings: events.length > 0 ? events.reduce((sum, e) => sum + e.savings, 0) / events.length : 0,
        events
      };

      setPeakAnalysis(analysis);
      
      toast({
        title: "Peak analysis complete",
        description: `Found ${analysis.totalShutdowns} potential shutdown events based on real data`,
      });
    } catch (error: any) {
      console.error('Error analyzing peak shutdown:', error);
      toast({
        title: "Error running analysis",
        description: error.message || "Failed to analyze peak shutdown scenarios",
        variant: "destructive",
      });
    } finally {
      setLoadingPeakAnalysis(false);
    }
  };

  return {
    monthlyData,
    yearlyData,
    peakAnalysis,
    loadingMonthly,
    loadingYearly,
    loadingPeakAnalysis,
    fetchMonthlyData,
    fetchYearlyData,
    analyzePeakShutdown,
  };
}
