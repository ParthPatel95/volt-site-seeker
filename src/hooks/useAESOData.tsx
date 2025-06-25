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
  data_quality: 'fresh' | 'moderate' | 'stale' | 'unknown' | 'error';
  validation_passed: boolean;
}

export function useAESOData() {
  const [pricing, setPricing] = useState<AESOPricing | null>(null);
  const [loadData, setLoadData] = useState<AESOLoadData | null>(null);
  const [generationMix, setGenerationMix] = useState<AESOGenerationMix | null>(null);
  const [loading, setLoading] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'error'>('connecting');
  const [qaMetrics, setQaMetrics] = useState<Record<string, QAMetrics>>({});
  const [lastFetchTime, setLastFetchTime] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
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
      
      if (!data.success) {
        throw new Error(data.error || 'API request failed');
      }
      
      // Update QA metrics
      if (data?.qa_metrics) {
        setQaMetrics(prev => ({
          ...prev,
          [dataType]: data.qa_metrics
        }));
      }
      
      // Only accept live API data - no fallback allowed
      const isLiveData = data?.source === 'aeso_api';
      const isValidData = data?.qa_metrics?.validation_passed === true;
      
      console.log('Data source validation:', { 
        isValidData, 
        isLiveData,
        source: data?.source, 
        validation_passed: data?.qa_metrics?.validation_passed,
        endpoint_used: data?.qa_metrics?.endpoint_used,
        data_quality: data?.qa_metrics?.data_quality
      });
      
      if (isValidData && isLiveData) {
        setConnectionStatus('connected');
        setLastFetchTime(data.timestamp || new Date().toISOString());
        setError(null);
        console.log('✅ Successfully received live AESO data');
        return data?.data || data;
      } else {
        throw new Error('Only live AESO data is accepted - no fallback data allowed');
      }

    } catch (error: any) {
      console.error('Error fetching AESO data:', error);
      
      setConnectionStatus('error');
      setError(error.message || 'Failed to fetch live data');
      
      toast({
        title: "AESO API Error",
        description: `Failed to fetch live data: ${error.message}`,
        variant: "destructive"
      });
      
      throw error;
    }
  };

  const getCurrentPrices = async () => {
    try {
      const data = await fetchAESOData('fetch_current_prices');
      if (data) {
        setPricing(data);
        console.log('Pricing data updated:', data);
      }
      return data;
    } catch (error) {
      console.error('Failed to get current prices:', error);
      return null;
    }
  };

  const getLoadForecast = async () => {
    try {
      const data = await fetchAESOData('fetch_load_forecast');
      if (data) {
        setLoadData(data);
        console.log('Load data updated:', data);
      }
      return data;
    } catch (error) {
      console.error('Failed to get load forecast:', error);
      return null;
    }
  };

  const getGenerationMix = async () => {
    try {
      const data = await fetchAESOData('fetch_generation_mix');
      if (data) {
        setGenerationMix(data);
        console.log('Generation mix updated:', data);
      }
      return data;
    } catch (error) {
      console.error('Failed to get generation mix:', error);
      return null;
    }
  };

  // Auto-fetch data on component mount with strict live data requirement
  useEffect(() => {
    const fetchAllData = async () => {
      console.log('Starting AESO live data fetch...');
      setLoading(true);
      
      try {
        // Fetch all data types concurrently
        const results = await Promise.allSettled([
          getCurrentPrices(),
          getLoadForecast(),
          getGenerationMix()
        ]);
        
        // Check if at least one fetch succeeded
        const successfulResults = results.filter(result => 
          result.status === 'fulfilled' && result.value !== null
        );
        
        if (successfulResults.length > 0) {
          console.log(`AESO live data fetch completed: ${successfulResults.length}/3 successful`);
          setConnectionStatus('connected');
        } else {
          console.log('All AESO live data fetches failed');
          setConnectionStatus('error');
          setError('Unable to fetch live AESO data. Please check API configuration.');
        }
        
      } catch (error) {
        console.error('Failed to fetch AESO live data:', error);
        setConnectionStatus('error');
        setError('Unable to fetch live AESO data. Please check API configuration.');
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
    
    // Set up interval to refresh data every 5 minutes
    const interval = setInterval(() => {
      console.log('Refreshing AESO live data...');
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
    error,
    getCurrentPrices,
    getLoadForecast,
    getGenerationMix,
    refetch: () => {
      console.log('Manual refetch of live data triggered');
      setLoading(true);
      Promise.allSettled([
        getCurrentPrices(),
        getLoadForecast(),
        getGenerationMix()
      ]).finally(() => setLoading(false));
    }
  };
}
