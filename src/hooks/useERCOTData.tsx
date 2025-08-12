
import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface ERCOTPricing {
  current_price: number;
  average_price: number;
  peak_price: number;
  off_peak_price: number;
  market_conditions: string;
  source?: string;
}

interface ERCOTLoadData {
  current_demand_mw: number;
  peak_forecast_mw: number;
  reserve_margin: number;
  source?: string;
}

interface ERCOTGenerationMix {
  total_generation_mw: number;
  natural_gas_mw: number;
  wind_mw: number;
  solar_mw: number;
  nuclear_mw: number;
  renewable_percentage: number;
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
  const intervalRef = useRef<number | null>(null);
  const isFetchingRef = useRef(false);
  const lastFetchAtRef = useRef(0);

  useEffect(() => {
    const fetchData = async () => {
      const now = Date.now();
      if (isFetchingRef.current || now - lastFetchAtRef.current < 1500) return;
      isFetchingRef.current = true;
      lastFetchAtRef.current = now;
      try {
        setError(null);
        const { data, error } = await supabase.functions.invoke('energy-data-integration');
        if (error) {
          console.error('Energy data fetch error:', error);
          setError('Failed to fetch ERCOT data');
          return;
        }
        if (data?.success && data?.ercot) {
          setPricing(data.ercot.pricing);
          setLoadData(data.ercot.loadData);
          setGenerationMix(data.ercot.generationMix);
          setZoneLMPs(data.ercot.zoneLMPs || null);
          setOrdcAdder(data.ercot.ordcAdder || null);
          setAncillaryPrices(data.ercot.ancillaryPrices || null);
          setSystemFrequency(data.ercot.systemFrequency || null);
          setConstraints(data.ercot.constraints || null);
          setIntertieFlows(data.ercot.intertieFlows || null);
          setWeatherZoneLoad(data.ercot.weatherZoneLoad || null);
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
    intervalRef.current = window.setInterval(fetchData, 300000); // 5 minutes

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
    try {
      isFetchingRef.current = true;
      lastFetchAtRef.current = Date.now();
      const { data, error } = await supabase.functions.invoke('energy-data-integration');
      if (error) {
        console.error('Energy data fetch error:', error);
        setError('Failed to fetch ERCOT data');
        return;
      }
      if (data?.success && data?.ercot) {
        setPricing(data.ercot.pricing);
        setLoadData(data.ercot.loadData);
        setGenerationMix(data.ercot.generationMix);
        setZoneLMPs(data.ercot.zoneLMPs || null);
        setOrdcAdder(data.ercot.ordcAdder || null);
        setAncillaryPrices(data.ercot.ancillaryPrices || null);
        setSystemFrequency(data.ercot.systemFrequency || null);
        setConstraints(data.ercot.constraints || null);
        setIntertieFlows(data.ercot.intertieFlows || null);
        setWeatherZoneLoad(data.ercot.weatherZoneLoad || null);
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
    loading,
    error,
    refetch
  };
};
