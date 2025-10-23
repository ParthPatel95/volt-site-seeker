import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface MISOPricing {
  current_price: number;
  average_price: number;
  peak_price: number;
  off_peak_price: number;
  market_conditions: string;
  timestamp?: string;
  source?: string;
}

interface MISOLoadData {
  current_demand_mw: number;
  peak_forecast_mw: number;
  reserve_margin: number;
  timestamp?: string;
  source?: string;
}

interface MISOGenerationMix {
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

export const useMISOData = () => {
  const [pricing, setPricing] = useState<MISOPricing | null>(null);
  const [loadData, setLoadData] = useState<MISOLoadData | null>(null);
  const [generationMix, setGenerationMix] = useState<MISOGenerationMix | null>(null);
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
          setError('Failed to fetch MISO data');
          return;
        }

        if (data?.success && data?.miso) {
          setPricing(data.miso.pricing);
          setLoadData(data.miso.loadData);
          setGenerationMix(data.miso.generationMix);
        } else {
          console.error('MISO data fetch failed:', data?.error);
          setError(data?.error || 'Unknown error fetching MISO data');
        }
      } catch (error) {
        console.error('Error fetching MISO data:', error);
        setError('Network error fetching MISO data');
      } finally {
        setLoading(false);
        isFetchingRef.current = false;
      }
    };

    fetchData();
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = window.setInterval(fetchData, 600000); // 10 minutes
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
        setError('Failed to fetch MISO data');
        return;
      }

      if (data?.success && data?.miso) {
        setPricing(data.miso.pricing);
        setLoadData(data.miso.loadData);
        setGenerationMix(data.miso.generationMix);
      } else {
        setError(data?.error || 'Unknown error fetching MISO data');
      }
    } catch (error) {
      console.error('Error refetching MISO data:', error);
      setError('Network error fetching MISO data');
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
