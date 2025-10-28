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
      uptime95Price?: number;
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
  rawHourlyData?: Array<{
    datetime: string;
    price: number;
    date: string;
    hour: number;
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
  const [dailyData, setDailyData] = useState<HistoricalPricingData | null>(null);
  const [monthlyData, setMonthlyData] = useState<HistoricalPricingData | null>(null);
  const [yearlyData, setYearlyData] = useState<HistoricalPricingData | null>(null);
  const [peakAnalysis, setPeakAnalysis] = useState<PeakAnalysisData | null>(null);
  const [historicalTenYearData, setHistoricalTenYearData] = useState<any | null>(null);
  const [customPeriodData, setCustomPeriodData] = useState<HistoricalPricingData | null>(null);
  const [loadingDaily, setLoadingDaily] = useState(false);
  const [loadingMonthly, setLoadingMonthly] = useState(false);
  const [loadingYearly, setLoadingYearly] = useState(false);
  const [loadingPeakAnalysis, setLoadingPeakAnalysis] = useState(false);
  const [loadingHistoricalTenYear, setLoadingHistoricalTenYear] = useState(false);
  const [loadingCustomPeriod, setLoadingCustomPeriod] = useState(false);
  const { toast } = useToast();

  const fetchDailyData = async () => {
    setLoadingDaily(true);
    try {
      const { data, error } = await supabase.functions.invoke('aeso-historical-pricing', {
        body: { timeframe: 'daily' }
      });

      if (error) throw error;

      if (data.error) {
        throw new Error(data.error);
      } else {
        setDailyData(data);
        
        toast({
          title: "Daily data loaded",
          description: "Real-time 24-hour pricing data updated",
        });
      }
    } catch (error: any) {
      console.error('Error fetching daily data:', error);
      
      toast({
        title: "Error loading data",
        description: "Failed to fetch real-time pricing data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoadingDaily(false);
    }
  };

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
          // Savings = (peak price - average price) * duration
          // This represents what you would have paid vs baseline
          savings: (day.price - (monthlyData.statistics?.average || 0)) * shutdownHours
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

  const fetchHistoricalTenYearData = async (uptimePercentage: number = 100) => {
    setLoadingHistoricalTenYear(true);
    try {
      console.log(`Fetching real 8-year AESO historical data with ${uptimePercentage}% uptime filter...`);
      const { data, error } = await supabase.functions.invoke('aeso-historical-pricing', {
        body: { 
          timeframe: 'historical-10year',
          uptimePercentage 
        }
      });

      if (error) throw error;

      if (data.error) {
        throw new Error(data.error);
      } else {
        console.log('8-year historical data received:', data);
        setHistoricalTenYearData(data);
        
        toast({
          title: "8-year data loaded",
          description: `Real historical data from ${data.totalYears} years retrieved (${data.realDataYears} years with data)`,
        });
      }
    } catch (error: any) {
      console.error('Error fetching 8-year historical data:', error);
      
      toast({
        title: "Error loading 8-year data",
        description: error.message || "Failed to fetch 8-year historical data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoadingHistoricalTenYear(false);
    }
  };

  const fetchCustomPeriodData = async (daysInPeriod: number) => {
    // For 30 days, use existing monthlyData
    if (daysInPeriod === 30) {
      setCustomPeriodData(null); // Will fallback to monthlyData
      return;
    }
    
    setLoadingCustomPeriod(true);
    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - daysInPeriod);
      
      console.log(`Fetching custom period data for ${daysInPeriod} days...`);
      const { data, error } = await supabase.functions.invoke('aeso-historical-pricing', {
        body: {
          timeframe: 'custom',
          startDate: startDate.toISOString().split('T')[0],
          endDate: endDate.toISOString().split('T')[0]
        }
      });

      if (error) throw error;

      if (data.error) {
        throw new Error(data.error);
      } else {
        setCustomPeriodData(data);
        const dataPoints = data.rawHourlyData?.length || data.chartData?.length || 0;
        console.log(`Custom period data loaded: ${dataPoints} data points`);
        console.log('Data structure:', {
          hasRawHourlyData: !!data.rawHourlyData,
          hasChartData: !!data.chartData,
          rawHourlyDataLength: data.rawHourlyData?.length,
          chartDataLength: data.chartData?.length
        });
        
        toast({
          title: "Custom period data loaded",
          description: `${daysInPeriod} days of pricing data updated (${dataPoints} hours)`,
        });
      }
    } catch (error: any) {
      console.error('Error fetching custom period data:', error);
      setCustomPeriodData(null);
      toast({
        title: "Error loading custom period data",
        description: error.message || "Failed to fetch data",
        variant: "destructive",
      });
    } finally {
      setLoadingCustomPeriod(false);
    }
  };

  return {
    dailyData,
    monthlyData,
    yearlyData,
    peakAnalysis,
    historicalTenYearData,
    customPeriodData,
    loadingDaily,
    loadingMonthly,
    loadingYearly,
    loadingPeakAnalysis,
    loadingHistoricalTenYear,
    loadingCustomPeriod,
    fetchDailyData,
    fetchMonthlyData,
    fetchYearlyData,
    analyzePeakShutdown,
    fetchHistoricalTenYearData,
    fetchCustomPeriodData,
  };
}
