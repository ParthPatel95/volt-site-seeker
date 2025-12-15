import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

// Shared query key - all market hooks will use this same key for cache sharing
export const UNIFIED_ENERGY_QUERY_KEY = ['unified-energy-data'];

export interface UnifiedEnergyData {
  success: boolean;
  ercot?: any;
  aeso?: any;
  miso?: any;
  caiso?: any;
  nyiso?: any;
  pjm?: any;
  spp?: any;
  ieso?: any;
  error?: string;
}

// LocalStorage cache key for emergency fallback
const UNIFIED_CACHE_KEY = 'unified_energy_cache';

// Cache successful data
const cacheUnifiedData = (data: UnifiedEnergyData) => {
  try {
    localStorage.setItem(UNIFIED_CACHE_KEY, JSON.stringify({
      data,
      timestamp: Date.now()
    }));
  } catch (e) {
    // Ignore localStorage errors
  }
};

// Get cached data (valid for 30 minutes)
const getCachedUnifiedData = (): UnifiedEnergyData | null => {
  try {
    const cached = localStorage.getItem(UNIFIED_CACHE_KEY);
    if (cached) {
      const { data, timestamp } = JSON.parse(cached);
      if (Date.now() - timestamp < 30 * 60 * 1000) {
        return data;
      }
    }
  } catch (e) {
    // Ignore localStorage errors
  }
  return null;
};

// Shared query function with fallback handling
export const fetchUnifiedEnergyData = async (): Promise<UnifiedEnergyData> => {
  try {
    const { data, error } = await supabase.functions.invoke('energy-data-integration');
    
    if (error) {
      console.warn('Unified energy data fetch error, using cache:', error);
      const cached = getCachedUnifiedData();
      if (cached) return cached;
      throw error;
    }
    
    // Cache successful response
    if (data) {
      cacheUnifiedData(data);
    }
    
    return data as UnifiedEnergyData;
  } catch (e) {
    console.error('Energy data integration failed:', e);
    const cached = getCachedUnifiedData();
    if (cached) {
      console.log('Using cached unified energy data');
      return cached;
    }
    // Return empty success response instead of throwing
    return { success: false, error: 'Data temporarily unavailable' };
  }
};

// Shared query config to avoid repetition
const sharedQueryConfig = {
  queryKey: UNIFIED_ENERGY_QUERY_KEY,
  queryFn: fetchUnifiedEnergyData,
  staleTime: 2 * 60 * 1000, // 2 minutes - data is fresh
  gcTime: 10 * 60 * 1000, // 10 minutes - keep in cache
  refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  retry: 2,
  retryDelay: (attemptIndex: number) => Math.min(1000 * Math.pow(2, attemptIndex), 30000),
  placeholderData: keepPreviousData, // Show previous data while fetching new data
};

// Main unified hook - call this once at the top level
export const useUnifiedEnergyData = () => {
  return useQuery(sharedQueryConfig);
};

// Selector hooks for individual markets - these share the cache
export const useUnifiedERCOTData = () => {
  return useQuery({
    ...sharedQueryConfig,
    select: (data) => data?.ercot,
  });
};

export const useUnifiedAESOData = () => {
  return useQuery({
    ...sharedQueryConfig,
    select: (data) => data?.aeso,
  });
};

export const useUnifiedMISOData = () => {
  return useQuery({
    ...sharedQueryConfig,
    select: (data) => data?.miso,
  });
};

export const useUnifiedCAISOData = () => {
  return useQuery({
    ...sharedQueryConfig,
    select: (data) => data?.caiso,
  });
};

export const useUnifiedNYISOData = () => {
  return useQuery({
    ...sharedQueryConfig,
    select: (data) => data?.nyiso,
  });
};

export const useUnifiedPJMData = () => {
  return useQuery({
    ...sharedQueryConfig,
    select: (data) => data?.pjm,
  });
};

export const useUnifiedSPPData = () => {
  return useQuery({
    ...sharedQueryConfig,
    select: (data) => data?.spp,
  });
};

export const useUnifiedIESOData = () => {
  return useQuery({
    ...sharedQueryConfig,
    select: (data) => data?.ieso,
  });
};
