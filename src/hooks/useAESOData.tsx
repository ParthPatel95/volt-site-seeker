
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
        console.error('AESO API returned error:', data.error);
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
        if (connectionStatus === 'fallback') {
          toast({
            title: "AESO API Connected",
            description: "Now receiving live market data from AESO",
            variant: "default"
          });
        }
      } else {
        setConnectionStatus('fallback');
        // Only show toast once when first switching to fallback
        if (connectionStatus !== 'fallback' && !hasShownFallbackNotice) {
          setHasShownFallbackNotice(true);
          toast({
            title: "AESO API Issue",
            description: "Unable to connect to AESO API. Please check API configuration in settings.",
            variant: "destructive"
          });
        }
      }
      
      return data?.data || data;

    } catch (error: any) {
      console.error('Error fetching AESO data:', error);
      setConnectionStatus('fallback');
      
      // Show error notification
      if (!hasShownFallbackNotice) {
        setHasShownFallbackNotice(true);
        toast({
          title: "AESO API Connection Failed",
          description: "Check AESO API key configuration. Using demo data temporarily.",
          variant: "destructive"
        });
      }
      
      // Return null to indicate failure - no fallback data for real-only mode
      return null;
    } finally {
      setLoading(false);
    }
  };

  const getCurrentPrices = async () => {
    const data = await fetchAESOData('fetch_current_prices');
    if (data) {
      setPricing(data);
    } else {
      setPricing(null);
    }
    return data;
  };

  const getLoadForecast = async () => {
    const data = await fetchAESOData('fetch_load_forecast');
    if (data) {
      setLoadData(data);
    } else {
      setLoadData(null);
    }
    return data;
  };

  const getGenerationMix = async () => {
    const data = await fetchAESOData('fetch_generation_mix');
    if (data) {
      setGenerationMix(data);
    } else {
      setGenerationMix(null);
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
