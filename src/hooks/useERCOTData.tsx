
import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

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
  const [pricing, setPricing] = useState<ERCOTPricing | null>(null);
  const [loadData, setLoadData] = useState<ERCOTLoadData | null>(null);
  const [generationMix, setGenerationMix] = useState<ERCOTGenerationMix | null>(null);
  const [zoneLMPs, setZoneLMPs] = useState<ERCOTZoneLMPs | null>(null);
  const [ordcAdder, setOrdcAdder] = useState<ERCOTORDC | null>(null);
  const [ancillaryPrices, setAncillaryPrices] = useState<ERCOTAncillary | null>(null);
  const [systemFrequency, setSystemFrequency] = useState<ERCOTFrequency | null>(null);
  const [constraints, setConstraints] = useState<ERCOTConstraints | null>(null);
  const [intertieFlows, setIntertieFlows] = useState<ERCOTIntertieFlows | null>(null);
  const [weatherZoneLoad, setWeatherZoneLoad] = useState<ERCOTWeatherZoneLoad | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Additional enhanced data states
  const [operatingReserve, setOperatingReserve] = useState<any>(null);
  const [interchange, setInterchange] = useState<any>(null);
  const [energyStorage, setEnergyStorage] = useState<any>(null);
  const [windSolarForecast, setWindSolarForecast] = useState<any>(null);
  const [assetOutages, setAssetOutages] = useState<any>(null);
  const [historicalPrices, setHistoricalPrices] = useState<any>(null);
  const [marketAnalytics, setMarketAnalytics] = useState<any>(null);
  const [alerts, setAlerts] = useState<any[]>([]);
  const intervalRef = useRef<number | null>(null);
  const isFetchingRef = useRef(false);
  const lastFetchAtRef = useRef(0);
  const retryCountRef = useRef(0);
  const maxRetries = 3;

  useEffect(() => {
    const fetchData = async () => {
      const now = Date.now();
      if (isFetchingRef.current || now - lastFetchAtRef.current < 2000) return;
      isFetchingRef.current = true;
      lastFetchAtRef.current = now;
      try {
        setError(null);
        const { data, error } = await supabase.functions.invoke('energy-data-integration');
        if (error) {
          console.error('Energy data fetch error:', error);
          
          // Check if it's a rate limit error and retry with exponential backoff
          if (error.message?.includes('429') || error.message?.includes('rate limit')) {
            if (retryCountRef.current < maxRetries) {
              retryCountRef.current++;
              const backoffDelay = Math.min(1000 * Math.pow(2, retryCountRef.current), 30000);
              console.log(`Rate limited. Retrying in ${backoffDelay}ms (attempt ${retryCountRef.current}/${maxRetries})`);
              setTimeout(fetchData, backoffDelay);
              return;
            }
            setError('ERCOT API rate limited. Data will refresh automatically.');
          } else {
            setError('Failed to fetch ERCOT data');
          }
          return;
        }
      if (data?.success && data?.ercot) {
        // Reset retry count on success
        retryCountRef.current = 0;
        
        // Update data if we have at least pricing (which is the most critical)
        if (data.ercot.pricing) {
          setPricing(data.ercot.pricing);
        }
        if (data.ercot.loadData) {
          setLoadData(data.ercot.loadData);
        }
        if (data.ercot.generationMix) {
          setGenerationMix(data.ercot.generationMix);
        }
        
        setZoneLMPs(data.ercot.zoneLMPs || null);
        setOrdcAdder(data.ercot.ordcAdder || null);
        setAncillaryPrices(data.ercot.ancillaryPrices || null);
        setSystemFrequency(data.ercot.systemFrequency || null);
        setConstraints(data.ercot.constraints || null);
        setIntertieFlows(data.ercot.intertieFlows || null);
        setWeatherZoneLoad(data.ercot.weatherZoneLoad || null);
        setOperatingReserve(data.ercot.operatingReserve || null);
        setInterchange(data.ercot.interchange || null);
        setEnergyStorage(data.ercot.energyStorage || null);
        setWindSolarForecast(null);
        setAssetOutages(null);
        setHistoricalPrices(null);
        setMarketAnalytics(null);
        setAlerts([]);
      } else {
          console.error('ERCOT data fetch failed:', data?.error);
          setError(data?.error || 'Unknown error fetching ERCOT data');
        }
      } catch (error) {
        console.error('Error fetching ERCOT data:', error);
        setError('Network error fetching ERCOT data');
      } finally {
        setLoading(false);
        isFetchingRef.current = false;
      }
    };

    // initial fetch and stabilized interval (handles React 18 StrictMode)
    fetchData();
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = window.setInterval(fetchData, 300000); // 5 minutes (reduced from 10 to handle rate limits better)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, []);

  const refetch = async () => {
    if (isFetchingRef.current) return;
    setLoading(true);
    setError(null);
    retryCountRef.current = 0; // Reset retry count on manual refetch
    try {
      isFetchingRef.current = true;
      lastFetchAtRef.current = Date.now();
      const { data, error } = await supabase.functions.invoke('energy-data-integration');
      if (error) {
        console.error('Energy data fetch error:', error);
        if (error.message?.includes('429') || error.message?.includes('rate limit')) {
          setError('ERCOT API rate limited. Please wait a moment and try again.');
        } else {
          setError('Failed to fetch ERCOT data');
        }
        return;
      }
      if (data?.success && data?.ercot) {
        if (data.ercot.pricing) {
          setPricing(data.ercot.pricing);
        }
        if (data.ercot.loadData) {
          setLoadData(data.ercot.loadData);
        }
        if (data.ercot.generationMix) {
          setGenerationMix(data.ercot.generationMix);
        }
        
        setZoneLMPs(data.ercot.zoneLMPs || null);
        setOrdcAdder(data.ercot.ordcAdder || null);
        setAncillaryPrices(data.ercot.ancillaryPrices || null);
        setSystemFrequency(data.ercot.systemFrequency || null);
        setConstraints(data.ercot.constraints || null);
        setIntertieFlows(data.ercot.intertieFlows || null);
        setWeatherZoneLoad(data.ercot.weatherZoneLoad || null);
        setOperatingReserve(data.ercot.operatingReserve || null);
        setInterchange(data.ercot.interchange || null);
        setEnergyStorage(data.ercot.energyStorage || null);
        setWindSolarForecast(null);
        setAssetOutages(null);
        setHistoricalPrices(null);
        setMarketAnalytics(null);
        setAlerts([]);
      } else {
        setError(data?.error || 'Unknown error fetching ERCOT data');
      }
    } catch (error) {
      console.error('Error refetching ERCOT data:', error);
      setError('Network error fetching ERCOT data');
    } finally {
      setLoading(false);
      isFetchingRef.current = false;
    }
  };

  const dismissAlert = (alertId: string) => {
    setAlerts(prev => prev.filter(alert => alert.id !== alertId));
  };

  const clearAllAlerts = () => {
    setAlerts([]);
  };

  return {
    pricing,
    loadData,
    generationMix,
    zoneLMPs,
    ordcAdder,
    ancillaryPrices,
    systemFrequency,
    constraints,
    intertieFlows,
    weatherZoneLoad,
    operatingReserve,
    interchange,
    energyStorage,
    windSolarForecast,
    assetOutages,
    historicalPrices,
    marketAnalytics,
    alerts,
    loading,
    error,
    refetch,
    dismissAlert,
    clearAllAlerts
  };
};
