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

// Get cached data (valid for 60 minutes - extended for emergency fallback)
const getCachedUnifiedData = (): UnifiedEnergyData | null => {
  try {
    const cached = localStorage.getItem(UNIFIED_CACHE_KEY);
    if (cached) {
      const { data, timestamp } = JSON.parse(cached);
      if (Date.now() - timestamp < 60 * 60 * 1000) { // 60 minutes
        return data;
      }
    }
  } catch (e) {
    // Ignore localStorage errors
  }
  return null;
};

// Helper to detect boot errors (503, BOOT_ERROR, connection failures)
const isBootError = (error: any): boolean => {
  const message = error?.message || String(error);
  return message.includes('503') || 
         message.includes('BOOT_ERROR') ||
         message.includes('failed to start') ||
         message.includes('FunctionsFetchError') ||
         message.includes('Failed to send');
};

// Helper for delay
const delay = (ms: number) => new Promise(r => setTimeout(r, ms));

// Shared query function with boot error retry logic
export const fetchUnifiedEnergyData = async (retryCount = 0): Promise<UnifiedEnergyData> => {
  try {
    const { data, error } = await supabase.functions.invoke('energy-data-integration');
    
    if (error) {
      // Check if it's a boot error - retry with exponential backoff
      if (isBootError(error) && retryCount < 3) {
        const delayMs = (retryCount + 1) * 2000; // 2s, 4s, 6s
        console.log(`[Energy] Boot error detected, retry ${retryCount + 1}/3 in ${delayMs}ms...`);
        await delay(delayMs);
        return fetchUnifiedEnergyData(retryCount + 1);
      }
      
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
    // Retry on boot errors
    if (isBootError(e) && retryCount < 3) {
      const delayMs = (retryCount + 1) * 2000;
      console.log(`[Energy] Boot error in catch, retry ${retryCount + 1}/3 in ${delayMs}ms...`);
      await delay(delayMs);
      return fetchUnifiedEnergyData(retryCount + 1);
    }
    
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

// Pre-warm the edge function on module load to prevent cold starts
if (typeof window !== 'undefined') {
  setTimeout(() => {
    supabase.functions.invoke('energy-data-integration', {
      body: { healthcheck: 'true' }
    }).then(() => {
      console.log('[Energy] Pre-warm successful');
    }).catch(() => {
      // Silent pre-warm failure is ok
    });
  }, 1000);
  
  // Keep function warm with periodic health checks every 4 minutes
  setInterval(() => {
    supabase.functions.invoke('energy-data-integration', {
      body: { healthcheck: 'true' }
    }).catch(() => {});
  }, 4 * 60 * 1000);
}

// Internal fetch function with retry support
const fetchWithRetry = (retryCount = 0): Promise<UnifiedEnergyData> => fetchUnifiedEnergyData(retryCount);

// Wrapper for useQuery compatibility - this is what hooks should use
export const unifiedEnergyQueryFn = () => fetchWithRetry(0);

// Shared query config to avoid repetition
const sharedQueryConfig = {
  queryKey: UNIFIED_ENERGY_QUERY_KEY,
  queryFn: unifiedEnergyQueryFn,
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
