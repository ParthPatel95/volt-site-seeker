import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface GridAlert {
  id: string;
  title: string;
  description: string | null;
  link: string | null;
  published_at: string;
  status: string;
  alert_type: string | null;
  source: string;
  created_at: string;
}

export interface GridRiskLevel {
  level: 'normal' | 'elevated' | 'high' | 'critical';
  color: string;
  bgColor: string;
  borderColor: string;
  reserveMargin: number;
  reason: string;
}

export interface GridAlertStatus {
  hasActiveAlert: boolean;
  activeAlertCount: number;
  alertLevel: string;
}

export function useAESOGridAlerts() {
  const [alerts, setAlerts] = useState<GridAlert[]>([]);
  const [currentStatus, setCurrentStatus] = useState<GridAlertStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastFetched, setLastFetched] = useState<Date | null>(null);

  const fetchGridAlerts = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Call the edge function to fetch and parse RSS feed
      const { data, error: fnError } = await supabase.functions.invoke('aeso-grid-alerts');

      if (fnError) {
        throw new Error(fnError.message);
      }

      if (data?.success) {
        setAlerts(data.recentAlerts || []);
        setCurrentStatus(data.currentStatus || null);
        setLastFetched(new Date());
      } else {
        throw new Error(data?.error || 'Failed to fetch grid alerts');
      }
    } catch (err: any) {
      console.error('Error fetching grid alerts:', err);
      setError(err.message || 'Failed to fetch grid alerts');
      
      // Try to fetch from database as fallback
      try {
        const { data: dbAlerts, error: dbError } = await supabase
          .from('aeso_grid_alerts')
          .select('*')
          .order('published_at', { ascending: false })
          .limit(20);

        if (!dbError && dbAlerts) {
          setAlerts(dbAlerts);
          const activeAlerts = dbAlerts.filter(a => a.status === 'active');
          setCurrentStatus({
            hasActiveAlert: activeAlerts.length > 0,
            activeAlertCount: activeAlerts.length,
            alertLevel: activeAlerts.length > 0 ? 'warning' : 'normal'
          });
        }
      } catch (fallbackErr) {
        console.error('Fallback fetch also failed:', fallbackErr);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // Calculate risk level based on reserve data
  const calculateRiskLevel = useCallback((
    totalReserves: number,
    requiredReserves: number
  ): GridRiskLevel => {
    if (requiredReserves <= 0) {
      return {
        level: 'normal',
        color: 'text-green-600',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200',
        reserveMargin: 100,
        reason: 'Reserve data unavailable'
      };
    }

    const marginPercent = ((totalReserves - requiredReserves) / requiredReserves) * 100;

    if (totalReserves < requiredReserves) {
      return {
        level: 'critical',
        color: 'text-red-600',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-300',
        reserveMargin: marginPercent,
        reason: `Reserve deficit: ${Math.abs(Math.round(totalReserves - requiredReserves))} MW below required`
      };
    }

    if (marginPercent < 5) {
      return {
        level: 'high',
        color: 'text-orange-600',
        bgColor: 'bg-orange-50',
        borderColor: 'border-orange-300',
        reserveMargin: marginPercent,
        reason: `Tight reserves: only ${marginPercent.toFixed(1)}% margin above minimum`
      };
    }

    if (marginPercent < 15) {
      return {
        level: 'elevated',
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-50',
        borderColor: 'border-yellow-300',
        reserveMargin: marginPercent,
        reason: `Elevated monitoring: ${marginPercent.toFixed(1)}% reserve margin`
      };
    }

    return {
      level: 'normal',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      reserveMargin: marginPercent,
      reason: `Adequate reserves: ${marginPercent.toFixed(1)}% margin above minimum`
    };
  }, []);

  // Get historical alert statistics
  const getAlertStatistics = useCallback(() => {
    if (alerts.length === 0) {
      return {
        totalAlerts: 0,
        activeAlerts: 0,
        eeaAlerts: 0,
        lastAlertDate: null,
        alertsLast30Days: 0
      };
    }

    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const activeAlerts = alerts.filter(a => a.status === 'active');
    const eeaAlerts = alerts.filter(a => a.alert_type === 'eea');
    const recentAlerts = alerts.filter(a => new Date(a.published_at) > thirtyDaysAgo);

    return {
      totalAlerts: alerts.length,
      activeAlerts: activeAlerts.length,
      eeaAlerts: eeaAlerts.length,
      lastAlertDate: alerts.length > 0 ? new Date(alerts[0].published_at) : null,
      alertsLast30Days: recentAlerts.length
    };
  }, [alerts]);

  return {
    alerts,
    currentStatus,
    loading,
    error,
    lastFetched,
    fetchGridAlerts,
    calculateRiskLevel,
    getAlertStatistics
  };
}
