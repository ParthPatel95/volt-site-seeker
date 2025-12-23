import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

const AESO_QUERY_KEY = ['aeso-market-data'];

interface AESOPricing {
  current_price: number;
  average_price: number;
  peak_price: number;
  off_peak_price: number;
  market_conditions: string;
  timestamp: string;
  qa_metadata?: any;
  source?: string;
}

interface AESOLoadData {
  current_demand_mw: number;
  peak_forecast_mw: number;
  reserve_margin: number;
  capacity_margin: number;
  forecast_date: string;
  source?: string;
}

interface AESOGenerationMix {
  total_generation_mw: number;
  natural_gas_mw: number;
  wind_mw: number;
  hydro_mw: number;
  solar_mw: number;
  coal_mw: number;
  other_mw: number;
  renewable_percentage: number;
  timestamp: string;
  source?: string;
}

// Static fallback data when API is unavailable
const FALLBACK_PRICING: AESOPricing = {
  current_price: 55.00,
  average_price: 52.00,
  peak_price: 95.00,
  off_peak_price: 35.00,
  market_conditions: 'fallback',
  timestamp: new Date().toISOString(),
  source: 'static_fallback'
};

const FALLBACK_LOAD: AESOLoadData = {
  current_demand_mw: 10500,
  peak_forecast_mw: 12000,
  reserve_margin: 12.5,
  capacity_margin: 18.0,
  forecast_date: new Date().toISOString(),
  source: 'static_fallback'
};

const FALLBACK_GENERATION: AESOGenerationMix = {
  total_generation_mw: 11000,
  natural_gas_mw: 6050,
  wind_mw: 2750,
  hydro_mw: 440,
  solar_mw: 880,
  coal_mw: 0,
  other_mw: 880,
  renewable_percentage: 37,
  timestamp: new Date().toISOString(),
  source: 'static_fallback'
};

const CACHE_KEY = 'aeso_data_cache';

const cacheData = (data: any) => {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({
      data,
      timestamp: Date.now()
    }));
  } catch (e) {
    // Ignore localStorage errors
  }
};

const getCachedData = (): any | null => {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      const { data, timestamp } = JSON.parse(cached);
      if (Date.now() - timestamp < 60 * 60 * 1000) {
        return data;
      }
    }
  } catch (e) {
    // Ignore localStorage errors
  }
  return null;
};

// Primary fetch: use energy-data-integration (more stable, cached)
const fetchAESOData = async () => {
  try {
    // Use energy-data-integration as primary source - it's more stable
    const { data, error } = await supabase.functions.invoke('energy-data-integration');
    
    if (error) {
      console.warn('Energy data integration failed:', error.message);
      throw error;
    }
    
    // Extract AESO data from the unified response
    if (data?.aeso) {
      return data.aeso;
    }
    
    // If no AESO data in response, return null to trigger fallback
    console.warn('No AESO data in energy-data-integration response');
    return null;
  } catch (e) {
    console.error('AESO data fetch failed:', e);
    throw e;
  }
};

const synthesizePricing = (aesoData: any): AESOPricing => {
  if (!aesoData) return FALLBACK_PRICING;
  
  const p = aesoData.pricing;
  if (p && typeof p.current_price === 'number' && Number.isFinite(p.current_price)) {
    return {
      current_price: Number(p.current_price),
      average_price: Number.isFinite(Number(p.average_price)) ? Number(p.average_price) : Number(p.current_price) * 0.95,
      peak_price: Number.isFinite(Number(p.peak_price)) ? Number(p.peak_price) : Number(p.current_price) * 1.8,
      off_peak_price: Number.isFinite(Number(p.off_peak_price)) ? Number(p.off_peak_price) : Number(p.current_price) * 0.6,
      market_conditions: p.market_conditions || 'normal',
      timestamp: p.timestamp || new Date().toISOString(),
      qa_metadata: p.qa_metadata,
      source: p?.source || 'aeso_api'
    };
  }
  
  // Synthesize from load/generation data
  const ld = aesoData.loadData || {};
  const gm = aesoData.generationMix || {};
  const reserve = typeof ld.reserve_margin === 'number' ? ld.reserve_margin : 12.5;
  const renewPct = typeof gm.renewable_percentage === 'number' ? gm.renewable_percentage : 20;
  const base = 55;
  let estimate = base + (12.5 - reserve) * 2 - (renewPct - 25) * 0.3;
  if (!Number.isFinite(estimate)) estimate = base;
  estimate = Math.max(5, Math.min(250, Math.round(estimate * 100) / 100));
  
  return {
    current_price: estimate,
    average_price: Math.round((estimate * 0.95) * 100) / 100,
    peak_price: Math.round((estimate * 1.8) * 100) / 100,
    off_peak_price: Math.round((estimate * 0.6) * 100) / 100,
    market_conditions: 'estimated',
    timestamp: new Date().toISOString(),
    qa_metadata: { note: 'estimated_from_csd', reserve, renewable_percentage: renewPct },
    source: 'aeso_estimated'
  };
};

export const useAESOData = () => {
  const { data, isLoading, isFetching, error, refetch: queryRefetch } = useQuery({
    queryKey: AESO_QUERY_KEY,
    queryFn: fetchAESOData,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchInterval: 10 * 60 * 1000,
    retry: 2,
    retryDelay: (attemptIndex: number) => Math.min(2000 * Math.pow(2, attemptIndex), 30000),
    placeholderData: keepPreviousData,
  });

  if (data && !error) {
    cacheData(data);
  }

  const cachedData = getCachedData();
  const aesoData = data || cachedData;
  const hasData = !!(aesoData?.pricing || aesoData?.loadData || aesoData?.generationMix);
  const isFallback = !data && (!!cachedData || !!error);

  const refetch = async () => {
    await queryRefetch();
  };

  return {
    pricing: synthesizePricing(aesoData) || FALLBACK_PRICING,
    loadData: (aesoData?.loadData as AESOLoadData) || FALLBACK_LOAD,
    generationMix: (aesoData?.generationMix as AESOGenerationMix) || FALLBACK_GENERATION,
    loading: isLoading,
    isFetching,
    hasData: hasData || isFallback,
    isFallback,
    connectionStatus: (data ? 'connected' : (cachedData ? 'cached' : 'fallback')) as 'connected' | 'cached' | 'fallback',
    error: error?.message || null,
    refetch
  };
};
