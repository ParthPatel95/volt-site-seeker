
import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface AESOPricing {
  current_price: number;
  average_price: number;
  peak_price: number;
  off_peak_price: number;
  market_conditions: string;
  timestamp: string;
  qa_metadata?: any;
  source?: string;
}

interface AESOLoadData {
  current_demand_mw: number;
  peak_forecast_mw: number;
  reserve_margin: number;
  capacity_margin: number;
  forecast_date: string;
  source?: string;
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
  source?: string;
}

export const useAESOData = () => {
  const [pricing, setPricing] = useState<AESOPricing | null>(null);
  const [loadData, setLoadData] = useState<AESOLoadData | null>(null);
  const [generationMix, setGenerationMix] = useState<AESOGenerationMix | null>(null);
  const [loading, setLoading] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'fallback'>('connected');
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
          setError('Failed to fetch AESO data');
          setConnectionStatus('fallback');
          return;
        }

        if (data?.success && data?.aeso) {
          const p: any = data.aeso.pricing;
          if (p) {
            setPricing({
              ...p,
              current_price: Number.isFinite(Number(p.current_price)) ? Number(p.current_price) : 0,
              average_price: Number.isFinite(Number(p.average_price)) ? Number(p.average_price) : 0,
              peak_price: Number.isFinite(Number(p.peak_price)) ? Number(p.peak_price) : 0,
              off_peak_price: Number.isFinite(Number(p.off_peak_price)) ? Number(p.off_peak_price) : 0,
              source: p?.source || 'aeso_api'
            });
            setConnectionStatus('connected');
          } else {
            console.warn('AESO pricing missing in response; leaving pricing null to avoid fallback badge.', data?.aeso);
            setPricing(null);
            setConnectionStatus('fallback');
          }
          setLoadData(data.aeso.loadData);
          setGenerationMix(data.aeso.generationMix);
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
        isFetchingRef.current = false;
      }
    };

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
        setError('Failed to fetch AESO data');
        setConnectionStatus('fallback');
        return;
      }

      if (data?.success && data?.aeso) {
        const p: any = data.aeso.pricing;
        if (p) {
          setPricing({
            ...p,
            current_price: Number.isFinite(Number(p.current_price)) ? Number(p.current_price) : 0,
            average_price: Number.isFinite(Number(p.average_price)) ? Number(p.average_price) : 0,
            peak_price: Number.isFinite(Number(p.peak_price)) ? Number(p.peak_price) : 0,
            off_peak_price: Number.isFinite(Number(p.off_peak_price)) ? Number(p.off_peak_price) : 0,
            source: p?.source || 'aeso_api'
          });
          setConnectionStatus('connected');
        } else {
          console.warn('AESO pricing missing in response (refetch); leaving pricing null to avoid fallback badge.', data?.aeso);
          setPricing(null);
          setConnectionStatus('fallback');
        }
        setLoadData(data.aeso.loadData);
        setGenerationMix(data.aeso.generationMix);
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
      isFetchingRef.current = false;
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
