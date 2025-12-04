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

// Shared query function
export const fetchUnifiedEnergyData = async (): Promise<UnifiedEnergyData> => {
  const { data, error } = await supabase.functions.invoke('energy-data-integration');
  
  if (error) {
    console.error('Unified energy data fetch error:', error);
    throw error;
  }
  
  return data as UnifiedEnergyData;
};

// Shared query config to avoid repetition
const sharedQueryConfig = {
  queryKey: UNIFIED_ENERGY_QUERY_KEY,
  queryFn: fetchUnifiedEnergyData,
  staleTime: 5 * 60 * 1000, // 5 minutes - data is fresh
  gcTime: 10 * 60 * 1000, // 10 minutes - keep in cache
  refetchInterval: 10 * 60 * 1000, // Refetch every 10 minutes
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
