import { useQuery } from '@tanstack/react-query';
import { UNIFIED_ENERGY_QUERY_KEY, unifiedEnergyQueryFn } from '@/hooks/useUnifiedEnergyData';

interface ERCOTPricing {
  current_price: number;
  average_price: number;
  peak_price: number;
  off_peak_price: number;
  market_conditions: string;
  timestamp?: string;
  source?: string;
}

interface ERCOTLoadData {
  current_demand_mw: number;
  peak_forecast_mw: number;
  reserve_margin: number;
  timestamp?: string;
  source?: string;
}

interface ERCOTGenerationMix {
  total_generation_mw: number;
  natural_gas_mw: number;
  wind_mw: number;
  solar_mw: number;
  nuclear_mw: number;
  coal_mw: number;
  renewable_percentage: number;
  timestamp?: string;
  source?: string;
}

// Additional ERCOT data types
interface ERCOTZoneLMPs {
  LZ_HOUSTON?: number;
  LZ_NORTH?: number;
  LZ_SOUTH?: number;
  LZ_WEST?: number;
  HB_HUBAVG?: number;
  source?: string;
}
interface ERCOTORDC {
  adder_per_mwh?: number;
  source?: string;
}
interface ERCOTAncillary {
  reg_up?: number;
  reg_down?: number;
  rrs?: number;
  non_spin?: number;
  frrs_up?: number;
  frrs_down?: number;
  source?: string;
}
interface ERCOTFrequency {
  hz?: number;
  source?: string;
}
interface ERCOTConstraints {
  items?: { name: string; shadow_price: number }[];
  source?: string;
}
interface ERCOTIntertieFlows {
  imports_mw?: number;
  exports_mw?: number;
  net_mw?: number;
  source?: string;
}
interface ERCOTWeatherZoneLoad {
  [zone: string]: any;
}

export const useERCOTData = () => {
  const { data, isLoading, error, refetch: queryRefetch } = useQuery({
    queryKey: UNIFIED_ENERGY_QUERY_KEY,
    queryFn: unifiedEnergyQueryFn,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchInterval: 5 * 60 * 1000, // 5 minutes
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * Math.pow(2, attemptIndex), 30000),
  });

  const ercotData = data?.ercot;
  
  // Wrap refetch to match expected signature
  const refetch = async () => {
    await queryRefetch();
  };

  return {
    pricing: ercotData?.pricing as ERCOTPricing | null,
    loadData: ercotData?.loadData as ERCOTLoadData | null,
    generationMix: ercotData?.generationMix as ERCOTGenerationMix | null,
    zoneLMPs: ercotData?.zoneLMPs as ERCOTZoneLMPs | null,
    ordcAdder: ercotData?.ordcAdder as ERCOTORDC | null,
    ancillaryPrices: ercotData?.ancillaryPrices as ERCOTAncillary | null,
    systemFrequency: ercotData?.systemFrequency as ERCOTFrequency | null,
    constraints: ercotData?.constraints as ERCOTConstraints | null,
    intertieFlows: ercotData?.intertieFlows as ERCOTIntertieFlows | null,
    weatherZoneLoad: ercotData?.weatherZoneLoad as ERCOTWeatherZoneLoad | null,
    operatingReserve: ercotData?.operatingReserve || null,
    interchange: ercotData?.interchange || null,
    energyStorage: ercotData?.energyStorage || null,
    windSolarForecast: null,
    assetOutages: null,
    historicalPrices: null,
    marketAnalytics: null,
    alerts: [] as any[],
    loading: isLoading,
    error: error?.message || null,
    refetch,
    dismissAlert: () => {},
    clearAllAlerts: () => {}
  };
};
