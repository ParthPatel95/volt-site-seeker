import { useQuery } from '@tanstack/react-query';
import { UNIFIED_ENERGY_QUERY_KEY, unifiedEnergyQueryFn } from '@/hooks/useUnifiedEnergyData';

export interface PJMPricing {
  current_price: number;
  average_price: number;
  peak_price: number;
  off_peak_price: number;
  market_conditions: string;
  timestamp: string;
  source: string;
}

export interface PJMLoadData {
  current_demand_mw: number;
  peak_forecast_mw: number;
  reserve_margin: number;
  timestamp: string;
  source: string;
}

export interface PJMGenerationMix {
  total_generation_mw: number;
  natural_gas_mw: number;
  coal_mw: number;
  nuclear_mw: number;
  wind_mw: number;
  solar_mw: number;
  hydro_mw: number;
  other_mw: number;
  renewable_percentage: number;
  timestamp: string;
  source: string;
}

export const usePJMData = () => {
  const { data, isLoading, refetch: queryRefetch } = useQuery({
    queryKey: UNIFIED_ENERGY_QUERY_KEY,
    queryFn: unifiedEnergyQueryFn,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchInterval: 10 * 60 * 1000,
  });

  const pjmData = data?.pjm;

  const refetch = async () => {
    await queryRefetch();
  };

  return {
    pricing: pjmData?.pricing as PJMPricing | undefined,
    loadData: pjmData?.loadData as PJMLoadData | undefined,
    generationMix: pjmData?.generationMix as PJMGenerationMix | undefined,
    loading: isLoading,
    refetch
  };
};
