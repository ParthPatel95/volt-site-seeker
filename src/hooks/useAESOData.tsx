import { useQuery } from '@tanstack/react-query';
import { UNIFIED_ENERGY_QUERY_KEY, fetchUnifiedEnergyData } from '@/hooks/useUnifiedEnergyData';

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

// Helper to synthesize pricing if missing
const synthesizePricing = (aesoData: any): AESOPricing | null => {
  if (!aesoData) return null;
  
  const p = aesoData.pricing;
  if (p) {
    return {
      current_price: Number.isFinite(Number(p.current_price)) ? Number(p.current_price) : 0,
      average_price: Number.isFinite(Number(p.average_price)) ? Number(p.average_price) : 0,
      peak_price: Number.isFinite(Number(p.peak_price)) ? Number(p.peak_price) : 0,
      off_peak_price: Number.isFinite(Number(p.off_peak_price)) ? Number(p.off_peak_price) : 0,
      market_conditions: p.market_conditions || 'normal',
      timestamp: p.timestamp || new Date().toISOString(),
      qa_metadata: p.qa_metadata,
      source: p?.source || 'aeso_api'
    };
  }
  
  // Synthesize estimated pricing from load/generation data
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
  const { data, isLoading, error, refetch: queryRefetch } = useQuery({
    queryKey: UNIFIED_ENERGY_QUERY_KEY,
    queryFn: fetchUnifiedEnergyData,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchInterval: 10 * 60 * 1000,
    retry: 2,
  });

  const aesoData = data?.aeso;

  // Wrap refetch to match expected signature
  const refetch = async () => {
    await queryRefetch();
  };

  return {
    pricing: synthesizePricing(aesoData),
    loadData: aesoData?.loadData as AESOLoadData | null,
    generationMix: aesoData?.generationMix as AESOGenerationMix | null,
    loading: isLoading,
    connectionStatus: aesoData ? 'connected' : (error ? 'fallback' : 'connected') as 'connected' | 'fallback',
    error: error?.message || null,
    refetch
  };
};
