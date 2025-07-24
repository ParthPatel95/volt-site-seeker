
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface ERCOTPricing {
  current_price: number;
  average_price: number;
  peak_price: number;
  off_peak_price: number;
  market_conditions: string;
}

interface ERCOTLoadData {
  current_demand_mw: number;
  peak_forecast_mw: number;
  reserve_margin: number;
}

interface ERCOTGenerationMix {
  total_generation_mw: number;
  natural_gas_mw: number;
  wind_mw: number;
  solar_mw: number;
  nuclear_mw: number;
  renewable_percentage: number;
}

export const useERCOTData = () => {
  const [pricing, setPricing] = useState<ERCOTPricing | null>(null);
  const [loadData, setLoadData] = useState<ERCOTLoadData | null>(null);
  const [generationMix, setGenerationMix] = useState<ERCOTGenerationMix | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setError(null);
        const { data, error } = await supabase.functions.invoke('ercot-data-integration');
        
        if (error) {
          console.error('ERCOT API error:', error);
          setError('Failed to fetch ERCOT data');
          return;
        }

        if (data?.success) {
          setPricing(data.pricing);
          setLoadData(data.loadData);
          setGenerationMix(data.generationMix);
        } else {
          console.error('ERCOT data fetch failed:', data?.error);
          setError(data?.error || 'Unknown error fetching ERCOT data');
        }
      } catch (error) {
        console.error('Error fetching ERCOT data:', error);
        setError('Network error fetching ERCOT data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 300000); // 5 minutes
    return () => clearInterval(interval);
  }, []);

  const refetch = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase.functions.invoke('ercot-data-integration');
      
      if (error) {
        console.error('ERCOT API error:', error);
        setError('Failed to fetch ERCOT data');
        return;
      }

      if (data?.success) {
        setPricing(data.pricing);
        setLoadData(data.loadData);
        setGenerationMix(data.generationMix);
      } else {
        setError(data?.error || 'Unknown error fetching ERCOT data');
      }
    } catch (error) {
      console.error('Error refetching ERCOT data:', error);
      setError('Network error fetching ERCOT data');
    } finally {
      setLoading(false);
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
