import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export interface HistoricalPricingData {
  statistics: {
    average: number;
    peak: number;
    low: number;
    volatility: number;
    trend?: 'up' | 'down';
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
      // For now, we'll generate realistic mock data
      // In a real implementation, this would call a Supabase function
      const mockData = generateMockMonthlyData();
      setMonthlyData(mockData);
      
      toast({
        title: "Monthly data loaded",
        description: "30-day pricing data has been updated",
      });
    } catch (error: any) {
      console.error('Error fetching monthly data:', error);
      toast({
        title: "Error loading monthly data",
        description: error.message || "Failed to fetch 30-day pricing data",
        variant: "destructive",
      });
    } finally {
      setLoadingMonthly(false);
    }
  };

  const fetchYearlyData = async () => {
    setLoadingYearly(true);
    try {
      // For now, we'll generate realistic mock data
      // In a real implementation, this would call a Supabase function
      const mockData = generateMockYearlyData();
      setYearlyData(mockData);
      
      toast({
        title: "Yearly data loaded",
        description: "12-month pricing data has been updated",
      });
    } catch (error: any) {
      console.error('Error fetching yearly data:', error);
      toast({
        title: "Error loading yearly data",
        description: error.message || "Failed to fetch 12-month pricing data",
        variant: "destructive",
      });
    } finally {
      setLoadingYearly(false);
    }
  };

  const analyzePeakShutdown = async (shutdownHours: number, priceThreshold: number) => {
    setLoadingPeakAnalysis(true);
    try {
      // For now, we'll generate realistic mock analysis
      // In a real implementation, this would call a Supabase function
      const mockAnalysis = generateMockPeakAnalysis(shutdownHours, priceThreshold);
      setPeakAnalysis(mockAnalysis);
      
      toast({
        title: "Peak analysis complete",
        description: `Found ${mockAnalysis.totalShutdowns} potential shutdown events`,
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

// Mock data generators (replace with real API calls in production)
function generateMockMonthlyData(): HistoricalPricingData {
  const basePrice = 45;
  const chartData = [];
  const peakHours = [];
  
  for (let i = 30; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    
    // Generate realistic price variations
    const timeOfDay = date.getHours();
    const isWeekend = date.getDay() === 0 || date.getDay() === 6;
    const isPeakHour = timeOfDay >= 16 && timeOfDay <= 20;
    
    let price = basePrice;
    price += Math.random() * 40 - 20; // ±20 variation
    if (isPeakHour && !isWeekend) price += 25; // Peak hour premium
    if (isWeekend) price -= 10; // Weekend discount
    price = Math.max(5, price); // Minimum price
    
    chartData.push({
      date: date.toLocaleDateString(),
      price: parseFloat(price.toFixed(2))
    });
    
    // Track high price hours for peak analysis
    if (price > 80) {
      peakHours.push({
        date: date.toLocaleDateString(),
        hour: timeOfDay,
        price: parseFloat(price.toFixed(2))
      });
    }
  }
  
  const prices = chartData.map(d => d.price);
  const average = prices.reduce((a, b) => a + b, 0) / prices.length;
  const peak = Math.max(...prices);
  const low = Math.min(...prices);
  const volatility = (Math.sqrt(prices.reduce((acc, val) => acc + Math.pow(val - average, 2), 0) / prices.length) / average) * 100;
  
  // Generate hourly patterns
  const hourlyPatterns = Array.from({ length: 24 }, (_, hour) => ({
    hour,
    averagePrice: basePrice + (hour >= 16 && hour <= 20 ? 20 : 0) + Math.random() * 10 - 5
  }));
  
  // Generate distribution
  const distribution = [
    { range: '$0-25', hours: Math.floor(Math.random() * 50) },
    { range: '$25-50', hours: Math.floor(Math.random() * 200) + 100 },
    { range: '$50-75', hours: Math.floor(Math.random() * 150) + 75 },
    { range: '$75-100', hours: Math.floor(Math.random() * 100) + 25 },
    { range: '$100+', hours: Math.floor(Math.random() * 50) }
  ];
  
  return {
    statistics: { average, peak, low, volatility },
    chartData,
    peakHours: peakHours.sort((a, b) => b.price - a.price),
    hourlyPatterns,
    distribution
  };
}

function generateMockYearlyData(): HistoricalPricingData {
  const basePrice = 45;
  const chartData = [];
  const seasonalPatterns: { [key: string]: { average: number; peak: number } } = {};
  
  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];
  
  const seasons = ['winter', 'spring', 'summer', 'fall'];
  seasons.forEach(season => {
    seasonalPatterns[season] = {
      average: basePrice + Math.random() * 20 - 10,
      peak: basePrice + Math.random() * 50 + 20
    };
  });
  
  months.forEach((month, index) => {
    // Seasonal adjustments
    let monthlyBase = basePrice;
    if (index >= 11 || index <= 1) monthlyBase += 15; // Winter
    if (index >= 5 && index <= 7) monthlyBase += 10; // Summer peak
    
    const average = monthlyBase + Math.random() * 20 - 10;
    const peak = average + Math.random() * 40 + 20;
    
    chartData.push({
      month,
      average: parseFloat(average.toFixed(2)),
      peak: parseFloat(peak.toFixed(2))
    });
  });
  
  const prices = chartData.map(d => d.average);
  const overall = {
    average: prices.reduce((a, b) => a + b, 0) / prices.length,
    peak: Math.max(...chartData.map(d => d.peak)),
    low: Math.min(...prices),
    volatility: (Math.sqrt(prices.reduce((acc, val) => acc + Math.pow(val - (prices.reduce((a, b) => a + b, 0) / prices.length), 2), 0) / prices.length) / (prices.reduce((a, b) => a + b, 0) / prices.length)) * 100,
    trend: prices[11] > prices[0] ? 'up' as const : 'down' as const
  };
  
  return {
    statistics: overall,
    chartData,
    seasonalPatterns
  };
}

function generateMockPeakAnalysis(shutdownHours: number, priceThreshold: number): PeakAnalysisData {
  const events = [];
  let totalShutdowns = 0;
  let totalHours = 0;
  let totalSavings = 0;
  
  // Generate realistic peak events over 30 days
  for (let i = 30; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    
    // Random chance of peak pricing
    if (Math.random() < 0.15) { // ~15% chance per day
      const price = priceThreshold + Math.random() * 100; // Price above threshold
      const savings = price - (priceThreshold * 0.7); // Savings compared to lower rate
      
      events.push({
        date: date.toLocaleDateString(),
        price: parseFloat(price.toFixed(2)),
        duration: shutdownHours,
        savings: parseFloat(savings.toFixed(2))
      });
      
      totalShutdowns++;
      totalHours += shutdownHours;
      totalSavings += savings;
    }
  }
  
  const averageSavings = totalSavings / Math.max(1, totalShutdowns);
  
  return {
    totalShutdowns,
    totalHours,
    averageSavings: parseFloat(averageSavings.toFixed(2)),
    events: events.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  };
}