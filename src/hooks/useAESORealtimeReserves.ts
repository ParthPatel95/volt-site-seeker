import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface RealtimeReserves {
  total_mw: number;
  spinning_mw: number;
  supplemental_mw: number;
  required_mw: number;
  margin_percent: number;
  timestamp: string;
  source: string;
}

export function useAESORealtimeReserves() {
  const [reserves, setReserves] = useState<RealtimeReserves | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastFetched, setLastFetched] = useState<Date | null>(null);

  const fetchRealtimeReserves = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('energy-data-integration');

      if (fnError) {
        throw new Error(fnError.message);
      }

      const aesoData = data?.aeso;
      const operatingReserve = aesoData?.operatingReserve;

      if (operatingReserve && operatingReserve.total_mw > 0) {
        const marginPercent = operatingReserve.required_mw > 0
          ? ((operatingReserve.total_mw - operatingReserve.required_mw) / operatingReserve.required_mw) * 100
          : 0;

        setReserves({
          total_mw: operatingReserve.total_mw || 0,
          spinning_mw: operatingReserve.spinning_mw || 0,
          supplemental_mw: operatingReserve.supplemental_mw || 0,
          required_mw: operatingReserve.required_mw || 0,
          margin_percent: Math.round(marginPercent * 10) / 10,
          timestamp: operatingReserve.timestamp || new Date().toISOString(),
          source: operatingReserve.source || 'aeso_api'
        });
        setLastFetched(new Date());
      } else {
        // No reserve data available from API
        setReserves(null);
        setError('Operating reserve data not currently available from AESO');
      }
    } catch (err: any) {
      console.error('Error fetching realtime reserves:', err);
      setError(err.message || 'Failed to fetch reserves');
      setReserves(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const getMarginStatus = useCallback((marginPercent: number): { status: string; color: string } => {
    if (marginPercent >= 10) return { status: 'Adequate', color: 'text-green-600' };
    if (marginPercent >= 5) return { status: 'Moderate', color: 'text-yellow-600' };
    if (marginPercent >= 0) return { status: 'Tight', color: 'text-orange-600' };
    return { status: 'Deficit', color: 'text-red-600' };
  }, []);

  return {
    reserves,
    loading,
    error,
    lastFetched,
    fetchRealtimeReserves,
    getMarginStatus
  };
}
