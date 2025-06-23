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
  const { toast } = useToast();

  const fetchAESOData = async (dataType: string) => {
    setLoading(true);
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

      if (data?.success === false) {
        throw new Error(data.error || 'Failed to fetch AESO data');
      }

      console.log('AESO data received:', data);
      
      // Update QA metrics
      if (data?.qa_metrics) {
        setQaMetrics(prev => ({
          ...prev,
          [dataType]: data.qa_metrics
        }));
      }
      
      // Update connection status based on data source
      if (data?.source === 'aeso_api') {
        setConnectionStatus('connected');
        setHasShownFallbackNotice(false);
        setLastFetchTime(data.timestamp);
        
        // Show success toast for real data
        if (!hasShownFallbackNotice) {
          toast({
            title: "AESO API Connected",
            description: "Now receiving live market data from AESO",
            variant: "default"
          });
        }
      } else if (data?.source === 'fallback') {
        setConnectionStatus('fallback');
        // Only show toast once when first switching to fallback
        if (connectionStatus !== 'fallback' && !hasShownFallbackNotice) {
          setHasShownFallbackNotice(true);
          toast({
            title: "Using Simulated Data",
            description: "Check AESO API key configuration for live data",
            variant: "default"
          });
        }
      }
      
      return data?.data || data;

    } catch (error: any) {
      console.error('Error fetching AESO data:', error);
      setConnectionStatus('fallback');
      
      // Return enhanced fallback data
      const fallbackData = getEnhancedFallbackData(dataType);
      if (fallbackData) {
        return fallbackData;
      }
      
      return null;
    } finally {
      setLoading(false);
    }
  };

  const getEnhancedFallbackData = (dataType: string) => {
    const baseTime = Date.now();
    const variation = Math.sin(baseTime / 100000) * 0.1; // Gentle variation
    
    switch (dataType) {
      case 'fetch_current_prices':
        const basePrice = 45.67;
        const currentPrice = basePrice + (variation * 20);
        return {
          current_price: Math.max(20, currentPrice),
          average_price: 42.30,
          peak_price: Math.max(60, currentPrice * 1.8),
          off_peak_price: Math.max(15, currentPrice * 0.6),
          timestamp: new Date().toISOString(),
          market_conditions: currentPrice > 60 ? 'high_demand' : 'normal'
        };
      case 'fetch_load_forecast':
        const baseDemand = 9850;
        const currentDemand = baseDemand + (variation * 1000);
        return {
          current_demand_mw: Math.max(8000, currentDemand),
          peak_forecast_mw: 11200,
          forecast_date: new Date().toISOString(),
          capacity_margin: 15.2 + (variation * 3),
          reserve_margin: 18.7 + (variation * 2)
        };
      case 'fetch_generation_mix':
        const baseTotal = 9850;
        const total = baseTotal + (variation * 800);
        
        // Alberta-typical generation mix
        const naturalGas = total * (0.42 + variation * 0.1);
        const wind = total * (0.28 + variation * 0.15); // Wind varies significantly
        const hydro = total * 0.15; // More stable
        const solar = total * (0.05 + Math.max(0, variation * 0.03)); // Solar varies with time of day
        const coal = total * (0.08 - variation * 0.05); // Decreasing coal use
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
          renewable_percentage: Math.min(80, Math.max(20, renewablePercentage)),
          timestamp: new Date().toISOString()
        };
      default:
        return null;
    }
  };

  const getCurrentPrices = async () => {
    const data = await fetchAESOData('fetch_current_prices');
    if (data) {
      setPricing(data);
    }
    return data;
  };

  const getLoadForecast = async () => {
    const data = await fetchAESOData('fetch_load_forecast');
    if (data) {
      setLoadData(data);
    }
    return data;
  };

  const getGenerationMix = async () => {
    const data = await fetchAESOData('fetch_generation_mix');
    if (data) {
      setGenerationMix(data);
    }
    return data;
  };

  // Auto-fetch data on component mount
  useEffect(() => {
    const fetchAllData = async () => {
      await Promise.all([
        getCurrentPrices(),
        getLoadForecast(),
        getGenerationMix()
      ]);
    };

    fetchAllData();
    
    // Set up interval to refresh data every 5 minutes
    const interval = setInterval(fetchAllData, 5 * 60 * 1000);

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
      getCurrentPrices();
      getLoadForecast();
      getGenerationMix();
    }
  };
}
