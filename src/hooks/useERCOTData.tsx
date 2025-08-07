
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

export const useERCOTData = () => {
  const [pricing, setPricing] = useState<ERCOTPricing | null>(null);
  const [loadData, setLoadData] = useState<ERCOTLoadData | null>(null);
  const [generationMix, setGenerationMix] = useState<ERCOTGenerationMix | null>(null);
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
    loading,
    error,
    refetch
  };
};
