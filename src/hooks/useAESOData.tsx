
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export interface AESOPricing {
  source: string;
  timestamp: string;
  current_price_cents_kwh: number;
  current_price_dollars_mwh: number;
  rates: {
    hourly: Array<{timestamp: string; price_cents_per_kwh: number}>;
    daily_avg: number;
    monthly_avg: number;
    trailing12mo_avg: number;
  };
  market_conditions: string;
}

export interface AESOLoadData {
  source: string;
  timestamp: string;
  load: {
    current_mw: number;
    peak_mw: number;
    avg_mw: number;
    current_gw: string;
    peak_gw: string;
    avg_gw: string;
  };
  capacity_margin: number;
  reserve_margin: number;
}

export interface AESOGenerationMix {
  source: string;
  timestamp: string;
  fuel_mix: {
    gas_percent: string;
    wind_percent: string;
    solar_percent: string;
    hydro_percent: string;
    coal_percent: string;
    other_percent: string;
    renewable_percent: string;
  };
  generation_mw: {
    gas_mw: number;
    wind_mw: number;
    solar_mw: number;
    hydro_mw: number;
    coal_mw: number;
    other_mw: number;
    total_mw: number;
  };
}

export interface AESOForecast {
  source: string;
  timestamp: string;
  forecast: {
    tomorrow_avg_cents_kwh: number;
    next_hour_cents_kwh: number;
    trend: string;
  };
}

export interface AESOOutageData {
  source: string;
  timestamp: string;
  outages: {
    active_count: number;
    planned_count: number;
    transmission_issues: number;
    risk_level: string;
  };
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
  const [forecast, setForecast] = useState<AESOForecast | null>(null);
  const [outageData, setOutageData] = useState<AESOOutageData | null>(null);
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
      
      // Only accept live API data
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
        throw new Error('Only live AESO data is accepted - API validation failed');
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

  const getForecastPrices = async () => {
    try {
      const data = await fetchAESOData('fetch_forecast_prices');
      if (data) {
        setForecast(data);
        console.log('Forecast data updated:', data);
      }
      return data;
    } catch (error) {
      console.error('Failed to get forecast prices:', error);
      return null;
    }
  };

  const getOutageData = async () => {
    try {
      const data = await fetchAESOData('fetch_outage_data');
      if (data) {
        setOutageData(data);
        console.log('Outage data updated:', data);
      }
      return data;
    } catch (error) {
      console.error('Failed to get outage data:', error);
      return null;
    }
  };

  // Auto-fetch all data on component mount
  useEffect(() => {
    const fetchAllData = async () => {
      console.log('Starting AESO live data fetch...');
      setLoading(true);
      
      try {
        // Fetch all data types concurrently
        const results = await Promise.allSettled([
          getCurrentPrices(),
          getLoadForecast(),
          getGenerationMix(),
          getForecastPrices(),
          getOutageData()
        ]);
        
        // Check if at least one fetch succeeded
        const successfulResults = results.filter(result => 
          result.status === 'fulfilled' && result.value !== null
        );
        
        if (successfulResults.length > 0) {
          console.log(`AESO live data fetch completed: ${successfulResults.length}/5 successful`);
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
    forecast,
    outageData,
    loading,
    connectionStatus,
    qaMetrics,
    lastFetchTime,
    error,
    getCurrentPrices,
    getLoadForecast,
    getGenerationMix,
    getForecastPrices,
    getOutageData,
    refetch: () => {
      console.log('Manual refetch of live data triggered');
      setLoading(true);
      Promise.allSettled([
        getCurrentPrices(),
        getLoadForecast(),
        getGenerationMix(),
        getForecastPrices(),
        getOutageData()
      ]).finally(() => setLoading(false));
    }
  };
}
