import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export interface PriceAlert {
  id?: string;
  user_id?: string;
  alert_type: 'price_threshold' | 'spike_detection' | 'forecast_alert';
  threshold_value: number;
  condition: 'above' | 'below' | 'spike';
  is_active: boolean;
  notification_method: 'app' | 'email';
  created_at?: string;
}

export function usePriceAlerts() {
  const [alerts, setAlerts] = useState<PriceAlert[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPrice, setCurrentPrice] = useState<number | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchUserAlerts();
    // Set up real-time price monitoring
    const interval = setInterval(checkPriceTriggers, 60000); // Check every minute
    
    return () => clearInterval(interval);
  }, []);

  const fetchUserAlerts = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase.functions.invoke('price-alert-system', {
        body: { action: 'get_alerts', userId: user.id }
      });

      if (error) throw error;

      setAlerts(data.alerts || []);
    } catch (error: any) {
      console.error('Error fetching alerts:', error);
      toast({
        title: "Error loading alerts",
        description: error.message || "Failed to fetch price alerts",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createAlert = async (alertData: Omit<PriceAlert, 'id' | 'user_id' | 'created_at'>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase.functions.invoke('price-alert-system', {
        body: { action: 'create_alert', alertData, userId: user.id }
      });

      if (error) throw error;

      toast({
        title: "Alert created",
        description: data.message,
      });

      await fetchUserAlerts();
      return data.alert;
    } catch (error: any) {
      console.error('Error creating alert:', error);
      toast({
        title: "Error creating alert",
        description: error.message || "Failed to create price alert",
        variant: "destructive",
      });
      throw error;
    }
  };

  const updateAlert = async (alertData: PriceAlert) => {
    try {
      const { data, error } = await supabase.functions.invoke('price-alert-system', {
        body: { action: 'update_alert', alertData }
      });

      if (error) throw error;

      toast({
        title: "Alert updated",
        description: data.message,
      });

      await fetchUserAlerts();
      return data.alert;
    } catch (error: any) {
      console.error('Error updating alert:', error);
      toast({
        title: "Error updating alert",
        description: error.message || "Failed to update price alert",
        variant: "destructive",
      });
      throw error;
    }
  };

  const deleteAlert = async (alertId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase.functions.invoke('price-alert-system', {
        body: { action: 'delete_alert', alertData: { id: alertId }, userId: user.id }
      });

      if (error) throw error;

      toast({
        title: "Alert deleted",
        description: data.message,
      });

      await fetchUserAlerts();
    } catch (error: any) {
      console.error('Error deleting alert:', error);
      toast({
        title: "Error deleting alert",
        description: error.message || "Failed to delete price alert",
        variant: "destructive",
      });
      throw error;
    }
  };

  const checkPriceTriggers = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('price-alert-system', {
        body: { action: 'check_triggers' }
      });

      if (error) throw error;

      setCurrentPrice(data.current_price);

      // Show notifications for triggered alerts
      if (data.triggered_alerts && data.triggered_alerts.length > 0) {
        data.triggered_alerts.forEach((trigger: any) => {
          toast({
            title: "Price Alert Triggered!",
            description: trigger.message,
            variant: "default",
          });
        });
      }
    } catch (error: any) {
      console.error('Error checking price triggers:', error);
      // Don't show user-facing errors for background checks
    }
  };

  const createQuickAlert = async (type: 'spike' | 'high' | 'low', threshold?: number) => {
    const alertConfigs = {
      spike: {
        alert_type: 'spike_detection' as const,
        threshold_value: 50, // 50% spike threshold
        condition: 'spike' as const,
        is_active: true,
        notification_method: 'app' as const
      },
      high: {
        alert_type: 'price_threshold' as const,
        threshold_value: threshold || 100,
        condition: 'above' as const,
        is_active: true,
        notification_method: 'app' as const
      },
      low: {
        alert_type: 'price_threshold' as const,
        threshold_value: threshold || 30,
        condition: 'below' as const,
        is_active: true,
        notification_method: 'app' as const
      }
    };

    return await createAlert(alertConfigs[type]);
  };

  return {
    alerts,
    loading,
    currentPrice,
    fetchUserAlerts,
    createAlert,
    updateAlert,
    deleteAlert,
    createQuickAlert,
    checkPriceTriggers
  };
}