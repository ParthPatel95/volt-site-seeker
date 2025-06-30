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
  cents_per_kwh: number;
  qa_metadata?: {
    endpoint_used: string;
    response_time_ms: number;
    data_quality: 'fresh' | 'moderate' | 'stale' | 'simulated' | 'unknown';
    validation_passed: boolean;
    raw_data_sample?: any;
    network_issue?: string;
  };
}

export interface AESOLoadData {
  current_demand_mw: number;
  peak_forecast_mw: number;
  forecast_date: string;
  capacity_margin: number;
  reserve_margin: number;
  qa_metadata?: {
    endpoint_used: string;
    response_time_ms: number;
    data_quality: 'fresh' | 'moderate' | 'stale' | 'simulated' | 'unknown';
    validation_passed: boolean;
    raw_data_sample?: any;
    network_issue?: string;
  };
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
  qa_metadata?: {
    endpoint_used: string;
    response_time_ms: number;
    data_quality: 'fresh' | 'moderate' | 'stale' | 'simulated' | 'unknown';
    validation_passed: boolean;
    raw_data_sample?: any;
    network_issue?: string;
  };
}

const isValidNumber = (value: any): value is number => {
  return typeof value === 'number' && !isNaN(value) && isFinite(value);
};

const validatePricingData = (data: any): AESOPricing | null => {
  if (!data) return null;
  
  const pricing = {
    current_price: isValidNumber(data.current_price) ? data.current_price : 0,
    average_price: isValidNumber(data.average_price) ? data.average_price : 0,
    peak_price: isValidNumber(data.peak_price) ? data.peak_price : 0,
    off_peak_price: isValidNumber(data.off_peak_price) ? data.off_peak_price : 0,
    timestamp: data.timestamp || new Date().toISOString(),
    market_conditions: data.market_conditions || 'normal',
    cents_per_kwh: isValidNumber(data.cents_per_kwh) ? data.cents_per_kwh : 0
  };
  
  // Ensure at least current_price is valid
  return pricing.current_price > 0 ? pricing : null;
};

const validateLoadData = (data: any): AESOLoadData | null => {
  if (!data) return null;
  
  const loadData = {
    current_demand_mw: isValidNumber(data.current_demand_mw) ? data.current_demand_mw : 0,
    peak_forecast_mw: isValidNumber(data.peak_forecast_mw) ? data.peak_forecast_mw : 0,
    forecast_date: data.forecast_date || new Date().toISOString(),
    capacity_margin: isValidNumber(data.capacity_margin) ? data.capacity_margin : 0,
    reserve_margin: isValidNumber(data.reserve_margin) ? data.reserve_margin : 0
  };
  
  // Ensure at least current_demand_mw is valid
  return loadData.current_demand_mw > 0 ? loadData : null;
};

const validateGenerationData = (data: any): AESOGenerationMix | null => {
  if (!data) return null;
  
  const genData = {
    natural_gas_mw: isValidNumber(data.natural_gas_mw) ? data.natural_gas_mw : 0,
    wind_mw: isValidNumber(data.wind_mw) ? data.wind_mw : 0,
    solar_mw: isValidNumber(data.solar_mw) ? data.solar_mw : 0,
    hydro_mw: isValidNumber(data.hydro_mw) ? data.hydro_mw : 0,
    coal_mw: isValidNumber(data.coal_mw) ? data.coal_mw : 0,
    other_mw: isValidNumber(data.other_mw) ? data.other_mw : 0,
    total_generation_mw: isValidNumber(data.total_generation_mw) ? data.total_generation_mw : 0,
    renewable_percentage: isValidNumber(data.renewable_percentage) ? data.renewable_percentage : 0,
    timestamp: data.timestamp || new Date().toISOString()
  };
  
  // Ensure total generation is valid
  return genData.total_generation_mw > 0 ? genData : null;
};

export function useAESOData() {
  const [pricing, setPricing] = useState<AESOPricing | null>(null);
  const [loadData, setLoadData] = useState<AESOLoadData | null>(null);
  const [generationMix, setGenerationMix] = useState<AESOGenerationMix | null>(null);
  const [loading, setLoading] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'fallback' | 'network_issue'>('connecting');
  const [lastFetchTime, setLastFetchTime] = useState<string>('');
  const [hasShownNetworkNotice, setHasShownNetworkNotice] = useState(false);
  const [networkInfo, setNetworkInfo] = useState<any>(null);
  const { toast } = useToast();

  const fetchAESOData = async (dataType: string) => {
    setLoading(true);
    try {
      console.log('🔄 Fetching AESO data:', dataType);
      
      const { data, error } = await supabase.functions.invoke('aeso-data-integration', {
        body: { action: dataType }
      });

      if (error) {
        console.error('❌ AESO API error:', error);
        throw error;
      }

      console.log('📨 AESO data received:', data);
      
      // Validate the response structure
      if (!data || data.success === false) {
        throw new Error(data?.error || 'Failed to fetch AESO data');
      }

      // Validate that we have actual data
      if (!data.data) {
        throw new Error('No data returned from AESO API');
      }

      // Store network info for QA display
      setNetworkInfo(data.network_info);

      // Enhanced connection status logic
      if (data.source === 'aeso_api' && data.qa_status === 'success') {
        setConnectionStatus('connected');
        setHasShownNetworkNotice(false);
        setLastFetchTime(data.timestamp);
        
        if (connectionStatus !== 'connected') {
          toast({
            title: "✅ AESO API Connected",
            description: "Now receiving live market data from AESO",
            variant: "default"
          });
        }
      } else if (data.qa_status?.includes('network') || data.qa_status?.includes('deno')) {
        setConnectionStatus('network_issue');
        if (connectionStatus !== 'network_issue' && !hasShownNetworkNotice) {
          setHasShownNetworkNotice(true);
          toast({
            title: "🌐 Network Connectivity Issue",
            description: "AESO API unreachable - likely IP blocking or TLS issue. Using simulated data.",
            variant: "default"
          });
        }
      } else if (data.source === 'fallback') {
        setConnectionStatus('fallback');
        if (connectionStatus !== 'fallback' && !hasShownNetworkNotice) {
          setHasShownNetworkNotice(true);
          toast({
            title: "⚠️ Using Simulated Data",
            description: "AESO API unavailable, showing realistic test data",
            variant: "default"
          });
        }
      }
      
      return data.data;

    } catch (error: any) {
      console.error('❌ Error fetching AESO data:', error);
      setConnectionStatus('network_issue');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const getCurrentPrices = async () => {
    const data = await fetchAESOData('fetch_current_prices');
    const validatedData = validatePricingData(data);
    if (validatedData) {
      setPricing(validatedData);
      console.log('Pricing data updated:', validatedData);
    } else {
      console.warn('Invalid pricing data received, skipping update');
    }
    return validatedData;
  };

  const getLoadForecast = async () => {
    const data = await fetchAESOData('fetch_load_forecast');
    const validatedData = validateLoadData(data);
    if (validatedData) {
      setLoadData(validatedData);
      console.log('Load data updated:', validatedData);
    } else {
      console.warn('Invalid load data received, skipping update');
    }
    return validatedData;
  };

  const getGenerationMix = async () => {
    const data = await fetchAESOData('fetch_generation_mix');
    const validatedData = validateGenerationData(data);
    if (validatedData) {
      setGenerationMix(validatedData);
      console.log('Generation data updated:', validatedData);
    } else {
      console.warn('Invalid generation data received, skipping update');
    }
    return validatedData;
  };

  // Auto-fetch data on component mount
  useEffect(() => {
    const fetchAllData = async () => {
      console.log('🚀 Starting AESO data fetch...');
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
    lastFetchTime,
    networkInfo,
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
