
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export interface ERCOTPricing {
  current_price: number;
  average_price: number;
  peak_price: number;
  off_peak_price: number;
  load_zone: string;
  timestamp: string;
  market_conditions: string;
}

export interface ERCOTLoadData {
  current_demand_mw: number;
  peak_forecast_mw: number;
  forecast_date: string;
  capacity_margin: number;
  reserve_margin: number;
}

export interface ERCOTGenerationMix {
  natural_gas_mw: number;
  wind_mw: number;
  solar_mw: number;
  nuclear_mw: number;
  coal_mw: number;
  hydro_mw: number;
  other_mw: number;
  total_generation_mw: number;
  renewable_percentage: number;
  timestamp: string;
}

export function useERCOTData() {
  const [pricing, setPricing] = useState<ERCOTPricing | null>(null);
  const [loadData, setLoadData] = useState<ERCOTLoadData | null>(null);
  const [generationMix, setGenerationMix] = useState<ERCOTGenerationMix | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchERCOTData = async (dataType: string) => {
    setLoading(true);
    try {
      console.log('Fetching ERCOT data:', dataType);
      
      const { data, error } = await supabase.functions.invoke('ercot-data-integration', {
        body: {
          action: dataType
        }
      });

      if (error) {
        console.error('ERCOT API error:', error);
        throw error;
      }

      if (data?.success === false) {
        throw new Error(data.error || 'Failed to fetch ERCOT data');
      }

      console.log('ERCOT data received:', data);
      return data?.data || data;

    } catch (error: any) {
      console.error('Error fetching ERCOT data:', error);
      
      let errorMessage = "Failed to fetch ERCOT data";
      if (error.message?.includes('non-2xx')) {
        errorMessage = "ERCOT service temporarily unavailable";
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
      
      return null;
    } finally {
      setLoading(false);
    }
  };

  const getCurrentPrices = async () => {
    const data = await fetchERCOTData('fetch_current_prices');
    if (data) {
      setPricing(data);
    }
    return data;
  };

  const getLoadForecast = async () => {
    const data = await fetchERCOTData('fetch_load_forecast');
    if (data) {
      setLoadData(data);
    }
    return data;
  };

  const getGenerationMix = async () => {
    const data = await fetchERCOTData('fetch_generation_mix');
    if (data) {
      setGenerationMix(data);
    }
    return data;
  };

  const getInterconnectionQueue = async () => {
    return await fetchERCOTData('fetch_interconnection_queue');
  };

  // Auto-fetch data on component mount
  useEffect(() => {
    getCurrentPrices();
    getLoadForecast();
    getGenerationMix();
    
    // Set up interval to refresh data every 5 minutes
    const interval = setInterval(() => {
      getCurrentPrices();
      getLoadForecast();
      getGenerationMix();
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  return {
    pricing,
    loadData,
    generationMix,
    loading,
    getCurrentPrices,
    getLoadForecast,
    getGenerationMix,
    getInterconnectionQueue,
    refetch: () => {
      getCurrentPrices();
      getLoadForecast();
      getGenerationMix();
    }
  };
}
