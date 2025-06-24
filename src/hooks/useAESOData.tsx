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
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected' | 'fallback'>('connecting');
  const [qaMetrics, setQaMetrics] = useState<Record<string, QAMetrics>>({});
  const [lastFetchTime, setLastFetchTime] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const { toast } = useToast();

  const fetchAESOData = async (dataType: string) => {
    setLoading(true);
    setErrorMessage('');
    
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

      console.log('AESO data received successfully:', { 
        source: data?.source, 
        timestamp: data?.timestamp,
        qa_metrics: data?.qa_metrics 
      });
      
      // Update QA metrics
      if (data?.qa_metrics) {
        setQaMetrics(prev => ({
          ...prev,
          [dataType]: data.qa_metrics
        }));
      }
      
      // Update connection status based on successful API response
      if (data?.source === 'aeso_api' && data?.qa_metrics?.validation_passed) {
        setConnectionStatus('connected');
        setLastFetchTime(data.timestamp);
        setErrorMessage('');
        
        // Show success toast if we were previously disconnected
        if (connectionStatus === 'disconnected') {
          toast({
            title: "AESO API Connected",
            description: "Successfully receiving live market data from AESO",
            variant: "default"
          });
        }
      } else {
        throw new Error('Invalid or failed data validation');
      }
      
      return data?.data || data;

    } catch (error: any) {
      console.error('Error fetching AESO data:', error);
      setConnectionStatus('disconnected');
      setErrorMessage(error.message || 'Connection failed');
      
      // Show error notification for real API failures
      toast({
        title: "AESO API Connection Failed",
        description: "Unable to fetch live data. Please check API configuration in settings.",
        variant: "destructive"
      });
      
      // Return null for failed requests - no fallback data in real-only mode
      return null;
    } finally {
      setLoading(false);
    }
  };

  const getCurrentPrices = async () => {
    const data = await fetchAESOData('fetch_current_prices');
    setPricing(data);
    return data;
  };

  const getLoadForecast = async () => {
    const data = await fetchAESOData('fetch_load_forecast');
    setLoadData(data);
    return data;
  };

  const getGenerationMix = async () => {
    const data = await fetchAESOData('fetch_generation_mix');
    setGenerationMix(data);
    return data;
  };

  // Auto-fetch data on component mount and set up refresh interval
  useEffect(() => {
    const fetchAllData = async () => {
      console.log('Starting AESO data fetch cycle...');
      await Promise.all([
        getCurrentPrices(),
        getLoadForecast(),
        getGenerationMix()
      ]);
    };

    fetchAllData();
    
    // Set up interval to refresh data every 2 minutes for live data
    const interval = setInterval(fetchAllData, 2 * 60 * 1000);

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
    errorMessage,
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
