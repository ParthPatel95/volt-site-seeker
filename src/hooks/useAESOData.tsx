
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface AESOPricing {
  current_price: number;
  average_price: number;
  peak_price: number;
  off_peak_price: number;
  market_conditions: string;
  timestamp: string;
  qa_metadata?: any;
}

interface AESOLoadData {
  current_demand_mw: number;
  peak_forecast_mw: number;
  reserve_margin: number;
  capacity_margin: number;
  forecast_date: string;
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
}

export const useAESOData = () => {
  const [pricing, setPricing] = useState<AESOPricing | null>(null);
  const [loadData, setLoadData] = useState<AESOLoadData | null>(null);
  const [generationMix, setGenerationMix] = useState<AESOGenerationMix | null>(null);
  const [loading, setLoading] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'fallback'>('connected');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setError(null);
        const { data, error } = await supabase.functions.invoke('aeso-data-integration');
        
        if (error) {
          console.error('AESO API error:', error);
          setError('Failed to fetch AESO data');
          setConnectionStatus('fallback');
          return;
        }

        if (data?.success) {
          setPricing(data.pricing);
          setLoadData(data.loadData);
          setGenerationMix(data.generationMix);
          setConnectionStatus('connected');
        } else {
          console.error('AESO data fetch failed:', data?.error);
          setError(data?.error || 'Unknown error fetching AESO data');
          setConnectionStatus('fallback');
        }
      } catch (error) {
        console.error('Error fetching AESO data:', error);
        setError('Network error fetching AESO data');
        setConnectionStatus('fallback');
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
      const { data, error } = await supabase.functions.invoke('aeso-data-integration');
      
      if (error) {
        console.error('AESO API error:', error);
        setError('Failed to fetch AESO data');
        setConnectionStatus('fallback');
        return;
      }

      if (data?.success) {
        setPricing(data.pricing);
        setLoadData(data.loadData);
        setGenerationMix(data.generationMix);
        setConnectionStatus('connected');
      } else {
        setError(data?.error || 'Unknown error fetching AESO data');
        setConnectionStatus('fallback');
      }
    } catch (error) {
      console.error('Error refetching AESO data:', error);
      setError('Network error fetching AESO data');
      setConnectionStatus('fallback');
    } finally {
      setLoading(false);
    }
  };

  return {
    pricing,
    loadData,
    generationMix,
    loading,
    connectionStatus,
    error,
    refetch
  };
};
