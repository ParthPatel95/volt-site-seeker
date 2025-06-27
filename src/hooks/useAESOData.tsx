
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface AESOPricing {
  current_price: number;
  average_price: number;
  peak_price: number;
  off_peak_price: number;
  timestamp: string;
  market_conditions: string;
  cents_per_kwh: number;
}

export interface AESOLoadData {
  current_demand_mw: number;
  peak_forecast_mw: number;
  forecast_date: string;
  capacity_margin: number;
  reserve_margin: number;
}

export interface AESOGenerationMix {
  natural_gas_mw: number;
  wind_mw: number;
  solar_mw: number;
  hydro_mw: number;
  coal_mw: number;
  other_mw: number;
  total_generation_mw: number;
  renewable_percentage: number;
  timestamp: string;
}

export type ConnectionStatus = 'connected' | 'fallback' | 'disconnected' | 'error';

export interface AESODataStatus {
  isLive: boolean;
  lastUpdate: string | null;
  errorMessage: string | null;
  retryCount: number;
}

export function useAESOData() {
  const [pricing, setPricing] = useState<AESOPricing | null>(null);
  const [loadData, setLoadData] = useState<AESOLoadData | null>(null);
  const [generationMix, setGenerationMix] = useState<AESOGenerationMix | null>(null);
  const [loading, setLoading] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('disconnected');
  const [dataStatus, setDataStatus] = useState<AESODataStatus>({
    isLive: false,
    lastUpdate: null,
    errorMessage: null,
    retryCount: 0
  });

  const fetchData = async () => {
    setLoading(true);
    console.log('Starting AESO data fetch...');
    
    try {
      // Fetch pricing data with enhanced error handling
      const pricingResponse = await supabase.functions.invoke('aeso-data-integration', {
        body: { action: 'fetch_current_prices' }
      });
      
      if (pricingResponse.data?.success && pricingResponse.data?.data) {
        console.log('Pricing data updated:', pricingResponse.data.data);
        setPricing(pricingResponse.data.data);
        
        const isLive = pricingResponse.data.source === 'aeso_api';
        setConnectionStatus(isLive ? 'connected' : 'fallback');
        
        setDataStatus({
          isLive,
          lastUpdate: pricingResponse.data.lastSuccessfulCall || new Date().toISOString(),
          errorMessage: pricingResponse.data.error || null,
          retryCount: isLive ? 0 : dataStatus.retryCount + 1
        });
      }

      // Fetch load data
      const loadResponse = await supabase.functions.invoke('aeso-data-integration', {
        body: { action: 'fetch_load_forecast' }
      });
      
      if (loadResponse.data?.success && loadResponse.data?.data) {
        console.log('Load data updated:', loadResponse.data.data);
        setLoadData(loadResponse.data.data);
      }

      // Fetch generation mix
      const generationResponse = await supabase.functions.invoke('aeso-data-integration', {
        body: { action: 'fetch_generation_mix' }
      });
      
      if (generationResponse.data?.success && generationResponse.data?.data) {
        console.log('Generation data updated:', generationResponse.data.data);
        setGenerationMix(generationResponse.data.data);
      }

    } catch (error) {
      console.error('Error fetching AESO data:', error);
      setConnectionStatus('error');
      setDataStatus(prev => ({
        ...prev,
        isLive: false,
        errorMessage: 'Unable to fetch AESO data',
        retryCount: prev.retryCount + 1
      }));
    } finally {
      setLoading(false);
    }
  };

  const refetch = () => {
    fetchData();
  };

  useEffect(() => {
    fetchData();
    
    // Set up polling for live data updates
    const interval = setInterval(fetchData, 60000); // Update every minute
    
    return () => clearInterval(interval);
  }, []);

  return {
    pricing,
    loadData,
    generationMix,
    loading,
    connectionStatus,
    dataStatus,
    refetch
  };
}
