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
  fallbackSince: string | null;
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
    retryCount: 0,
    fallbackSince: null
  });

  const fetchData = async () => {
    setLoading(true);
    console.log('🔌 Starting AESO API Gateway data fetch...');
    
    try {
      // Use legacy method calls for backward compatibility
      const pricingResponse = await supabase.functions.invoke('aeso-data-integration', {
        body: { action: 'fetch_current_prices' }
      });
      
      console.log('📊 AESO API Gateway Pricing Response:', pricingResponse);
      
      if (pricingResponse.error) {
        console.error('❌ Supabase function error:', pricingResponse.error);
        throw new Error(`Function error: ${pricingResponse.error.message}`);
      }
      
      if (pricingResponse.data?.success && pricingResponse.data?.data) {
        console.log('✅ AESO pricing data updated:', pricingResponse.data.data);
        setPricing(pricingResponse.data.data);
        
        const isLive = pricingResponse.data.source === 'aeso_api';
        setConnectionStatus(isLive ? 'connected' : 'fallback');
        
        if (isLive) {
          console.log('🟢 AESO API Gateway is LIVE - real pool price data retrieved!');
          console.log(`💰 Current Alberta Pool Price: $${pricingResponse.data.data.current_price}/MWh (CAD)`);
        } else {
          console.log('⚠️ Using fallback data - API Gateway authentication or connection failed');
        }
        
        const lastUpdateTime = pricingResponse.data.timestamp || new Date().toISOString();
        const currentFallbackSince = !isLive && dataStatus.fallbackSince === null 
          ? new Date().toISOString() 
          : (isLive ? null : dataStatus.fallbackSince);
        
        setDataStatus({
          isLive,
          lastUpdate: lastUpdateTime,
          errorMessage: pricingResponse.data.error || null,
          retryCount: isLive ? 0 : dataStatus.retryCount + 1,
          fallbackSince: currentFallbackSince
        });
      } else {
        console.error('❌ Invalid response structure from AESO API Gateway function');
        throw new Error('Invalid response from AESO API Gateway function');
      }

      // Fetch load data
      const loadResponse = await supabase.functions.invoke('aeso-data-integration', {
        body: { action: 'fetch_load_forecast' }
      });
      
      if (loadResponse.data?.success && loadResponse.data?.data) {
        console.log('📈 Load data updated:', loadResponse.data.data);
        setLoadData(loadResponse.data.data);
      }

      // Fetch generation mix
      const generationResponse = await supabase.functions.invoke('aeso-data-integration', {
        body: { action: 'fetch_generation_mix' }
      });
      
      if (generationResponse.data?.success && generationResponse.data?.data) {
        console.log('⚡ Generation data updated:', generationResponse.data.data);
        setGenerationMix(generationResponse.data.data);
      }

    } catch (error) {
      console.error('💥 Error fetching AESO API Gateway data:', error);
      setConnectionStatus('error');
      
      setDataStatus(prev => ({
        ...prev,
        isLive: false,
        errorMessage: 'Unable to connect to AESO API Gateway - check AESO_SUB_KEY configuration',
        retryCount: prev.retryCount + 1,
        fallbackSince: prev.fallbackSince || new Date().toISOString()
      }));
    } finally {
      setLoading(false);
    }
  };

  const refetch = () => {
    console.log('🔄 Force refreshing AESO data...');
    fetchData();
  };

  const isFallbackStale = () => {
    if (!dataStatus.fallbackSince) return false;
    const fallbackStart = new Date(dataStatus.fallbackSince);
    const now = new Date();
    const hoursDiff = (now.getTime() - fallbackStart.getTime()) / (1000 * 60 * 60);
    return hoursDiff > 1;
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 120000); // Poll every 2 minutes
    return () => clearInterval(interval);
  }, []);

  return {
    pricing,
    loadData,
    generationMix,
    loading,
    connectionStatus,
    dataStatus: {
      ...dataStatus,
      isStale: isFallbackStale()
    },
    refetch
  };
}
