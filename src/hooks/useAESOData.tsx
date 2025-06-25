
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export interface AESOPricing {
  current_price: number;
  average_price: number;
  peak_price: number;
  off_peak_price: number;
  timestamp: string;
  market_conditions: string;
}

export interface AESOLoadData {
  current_demand_mw: number;
  peak_forecast_mw: number;
  forecast_date: string;
  capacity_margin: number;
  reserve_margin: number;
}

export interface AESOGenerationMix {
  natural_gas_mw: number;
  wind_mw: number;
  solar_mw: number;
  hydro_mw: number;
  coal_mw: number;
  other_mw: number;
  total_generation_mw: number;
  renewable_percentage: number;
  timestamp: string;
}

export interface QAMetrics {
  endpoint_used: string;
  response_time_ms: number;
  data_quality: 'fresh' | 'moderate' | 'stale' | 'unknown';
  validation_passed: boolean;
}

export function useAESOData() {
  const [pricing, setPricing] = useState<AESOPricing | null>(null);
  const [loadData, setLoadData] = useState<AESOLoadData | null>(null);
  const [generationMix, setGenerationMix] = useState<AESOGenerationMix | null>(null);
  const [loading, setLoading] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'fallback'>('connecting');
  const [qaMetrics, setQaMetrics] = useState<Record<string, QAMetrics>>({});
  const [lastFetchTime, setLastFetchTime] = useState<string>('');
  const [hasShownFallbackNotice, setHasShownFallbackNotice] = useState(false);
  const [hasShownLiveNotice, setHasShownLiveNotice] = useState(false);
  const { toast } = useToast();

  const fetchAESOData = async (dataType: string) => {
    try {
      console.log('Fetching AESO data:', dataType);
      
      const { data, error } = await supabase.functions.invoke('aeso-data-integration', {
        body: {
          action: dataType
        }
      });

      if (error) {
        console.error('AESO API error:', error);
        throw error;
      }

      console.log('AESO data received:', data);
      
      // Update QA metrics
      if (data?.qa_metrics) {
        setQaMetrics(prev => ({
          ...prev,
          [dataType]: data.qa_metrics
        }));
      }
      
      // Check if this is live API data or fallback data
      const isLiveData = data?.source === 'aeso_api' && data?.qa_metrics?.validation_passed === true;
      const isFallback = data?.source === 'fallback' || data?.qa_metrics?.validation_passed === false;
      
      console.log('Data source detection:', { 
        isLiveData, 
        isFallback, 
        source: data?.source, 
        validation_passed: data?.qa_metrics?.validation_passed,
        endpoint_used: data?.qa_metrics?.endpoint_used
      });
      
      if (isLiveData) {
        setConnectionStatus('connected');
        setHasShownFallbackNotice(false);
        setLastFetchTime(data.timestamp || new Date().toISOString());
        
        // Show success toast only once when first connecting to live data
        if (connectionStatus !== 'connected' && !hasShownLiveNotice) {
          setHasShownLiveNotice(true);
          toast({
            title: "AESO API Connected",
            description: "Now receiving live market data from AESO",
            variant: "default"
          });
        }
      } else if (isFallback) {
        setConnectionStatus('fallback');
        setHasShownLiveNotice(false);
        
        // Only show fallback toast once when first switching to fallback
        if (connectionStatus !== 'fallback' && !hasShownFallbackNotice) {
          setHasShownFallbackNotice(true);
          toast({
            title: "Using Demo Data",
            description: data?.api_error ? `AESO API error: ${data.api_error}` : "AESO API unavailable, showing demo data",
            variant: "destructive"
          });
        }
      }
      
      return data?.data || data;

    } catch (error: any) {
      console.error('Error fetching AESO data:', error);
      
      // Always set to fallback on error
      setConnectionStatus('fallback');
      setHasShownLiveNotice(false);
      
      // Only show fallback toast once
      if (!hasShownFallbackNotice) {
        setHasShownFallbackNotice(true);
        toast({
          title: "Connection Issue",
          description: "Using demo data while AESO API is unavailable",
          variant: "destructive"
        });
      }
      
      // Return enhanced fallback data for continuity
      const fallbackData = getEnhancedFallbackData(dataType);
      return fallbackData;
    }
  };

  const getEnhancedFallbackData = (dataType: string) => {
    const baseTime = Date.now();
    const variation = Math.sin(baseTime / 100000) * 0.1; // Gentle variation
    
    switch (dataType) {
      case 'fetch_current_prices':
        const basePrice = 46.08;
        const currentPrice = basePrice + (variation * 15);
        return {
          current_price: Math.max(25, currentPrice),
          average_price: 44.30,
          peak_price: Math.max(65, currentPrice * 1.6),
          off_peak_price: Math.max(20, currentPrice * 0.7),
          timestamp: new Date().toISOString(),
          market_conditions: currentPrice > 55 ? 'high_demand' : 'normal'
        };
      case 'fetch_load_forecast':
        const baseDemand = 9900;
        const currentDemand = baseDemand + (variation * 800);
        return {
          current_demand_mw: Math.max(8500, currentDemand),
          peak_forecast_mw: 11200,
          forecast_date: new Date().toISOString(),
          capacity_margin: 16.5 + (variation * 2.5),
          reserve_margin: 18.7 + (variation * 1.8)
        };
      case 'fetch_generation_mix':
        const baseTotal = 9900;
        const total = baseTotal + (variation * 600);
        
        // Alberta-typical generation mix with more realistic variations
        const naturalGas = total * (0.40 + variation * 0.08);
        const wind = total * (0.28 + variation * 0.12); // Wind varies significantly
        const hydro = total * 0.16; // More stable
        const solar = total * (0.06 + Math.max(0, variation * 0.04)); // Solar varies with time
        const coal = total * (0.07 - variation * 0.03); // Decreasing coal use
        const other = total - (naturalGas + wind + hydro + solar + coal);
        
        const renewablePercentage = ((wind + hydro + solar) / total) * 100;
        
        return {
          natural_gas_mw: Math.max(0, naturalGas),
          wind_mw: Math.max(0, wind),
          solar_mw: Math.max(0, solar),
          hydro_mw: Math.max(0, hydro),
          coal_mw: Math.max(0, coal),
          other_mw: Math.max(0, other),
          total_generation_mw: total,
          renewable_percentage: Math.min(75, Math.max(25, renewablePercentage)),
          timestamp: new Date().toISOString()
        };
      default:
        return null;
    }
  };

  const getCurrentPrices = async () => {
    setLoading(true);
    try {
      const data = await fetchAESOData('fetch_current_prices');
      if (data) {
        setPricing(data);
      }
      return data;
    } finally {
      setLoading(false);
    }
  };

  const getLoadForecast = async () => {
    setLoading(true);
    try {
      const data = await fetchAESOData('fetch_load_forecast');
      if (data) {
        setLoadData(data);
      }
      return data;
    } finally {
      setLoading(false);
    }
  };

  const getGenerationMix = async () => {
    setLoading(true);
    try {
      const data = await fetchAESOData('fetch_generation_mix');
      if (data) {
        setGenerationMix(data);
      }
      return data;
    } finally {
      setLoading(false);
    }
  };

  // Auto-fetch data on component mount
  useEffect(() => {
    const fetchAllData = async () => {
      console.log('Starting initial data fetch...');
      await Promise.all([
        getCurrentPrices(),
        getLoadForecast(),
        getGenerationMix()
      ]);
      console.log('Initial data fetch completed');
    };

    fetchAllData();
    
    // Set up interval to refresh data every 5 minutes
    const interval = setInterval(() => {
      console.log('Refreshing AESO data...');
      fetchAllData();
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  return {
    pricing,
    loadData,
    generationMix,
    loading,
    connectionStatus,
    qaMetrics,
    lastFetchTime,
    getCurrentPrices,
    getLoadForecast,
    getGenerationMix,
    refetch: () => {
      console.log('Manual refetch triggered');
      getCurrentPrices();
      getLoadForecast();
      getGenerationMix();
    }
  };
}
