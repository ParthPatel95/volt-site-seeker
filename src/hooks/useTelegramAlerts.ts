import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface TelegramAlertSetting {
  id: string;
  user_id: string;
  bot_token: string;
  chat_id: string;
  name: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface TelegramAlertRule {
  id: string;
  setting_id: string;
  alert_type: AlertType;
  condition: 'above' | 'below' | 'equals' | 'contains' | 'change_percent';
  threshold_value: number | null;
  custom_metric: string | null;
  message_template: string | null;
  cooldown_minutes: number;
  is_active: boolean;
  last_triggered_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface TelegramAlertHistory {
  id: string;
  rule_id: string;
  setting_id: string;
  message: string;
  trigger_data: any;
  sent_at: string;
  success: boolean;
  error_message: string | null;
}

export type AlertType = 
  // Price Alerts
  | 'price_low' 
  | 'price_high' 
  | 'price_spike'
  | 'price_negative'
  // Grid Alerts
  | 'grid_stress' 
  | 'plant_outage' 
  | 'eea'
  | 'demand_peak'
  | 'intertie_flow'
  // Scheduled Reports
  | 'hourly_summary'
  | 'daily_morning_briefing'
  | 'daily_evening_summary'
  // Generation Mix
  | 'generation_mix'
  | 'renewable_percentage'
  | 'wind_forecast'
  | 'solar_production'
  // Custom
  | 'custom';

export interface AlertTypeInfo {
  label: string;
  description: string;
  icon: string;
  defaultThreshold: number;
  category: 'price' | 'grid' | 'scheduled' | 'generation' | 'custom';
  isScheduled?: boolean;
  unit?: string;
}

export const ALERT_TYPE_INFO: Record<AlertType, AlertTypeInfo> = {
  // Price Alerts
  price_low: {
    label: 'Low Price Alert',
    description: 'Notify when pool price drops below threshold',
    icon: '💰',
    defaultThreshold: 10,
    category: 'price',
    unit: '$/MWh',
  },
  price_high: {
    label: 'High Price Alert',
    description: 'Notify when pool price exceeds threshold',
    icon: '📈',
    defaultThreshold: 50,
    category: 'price',
    unit: '$/MWh',
  },
  price_spike: {
    label: 'Price Spike Alert',
    description: 'Notify on rapid price increases (% change in 1 hour)',
    icon: '🚀',
    defaultThreshold: 100,
    category: 'price',
    unit: '%',
  },
  price_negative: {
    label: 'Negative Price Alert',
    description: 'Alert when electricity prices go negative - great for high-consumption',
    icon: '💚',
    defaultThreshold: 0,
    category: 'price',
    unit: '$/MWh',
  },

  // Grid Alerts
  grid_stress: {
    label: 'Grid Stress Alert',
    description: 'Notify when reserve margin falls below safe levels',
    icon: '⚠️',
    defaultThreshold: 10,
    category: 'grid',
    unit: '%',
  },
  plant_outage: {
    label: 'Plant Outage Alert',
    description: 'Notify when significant generation capacity goes offline',
    icon: '🏭',
    defaultThreshold: 500,
    category: 'grid',
    unit: 'MW',
  },
  eea: {
    label: 'Energy Emergency Alert',
    description: 'Notify when AESO declares an Energy Emergency Alert',
    icon: '🚨',
    defaultThreshold: 0,
    category: 'grid',
  },
  demand_peak: {
    label: 'Peak Demand Alert',
    description: 'Alert when system load approaches peak capacity',
    icon: '📊',
    defaultThreshold: 11000,
    category: 'grid',
    unit: 'MW',
  },
  intertie_flow: {
    label: 'Intertie Flow Change',
    description: 'Significant changes in BC/SK/Montana power flows',
    icon: '🔄',
    defaultThreshold: 200,
    category: 'grid',
    unit: 'MW',
  },

  // Scheduled Reports
  hourly_summary: {
    label: 'Hourly Price Summary',
    description: 'Receive hourly price updates with current, average, and market conditions',
    icon: '🕐',
    defaultThreshold: 0,
    category: 'scheduled',
    isScheduled: true,
  },
  daily_morning_briefing: {
    label: 'Morning Market Briefing',
    description: 'Daily 7 AM summary with overnight prices, forecast, and market outlook',
    icon: '🌅',
    defaultThreshold: 0,
    category: 'scheduled',
    isScheduled: true,
  },
  daily_evening_summary: {
    label: 'Evening Market Summary',
    description: 'Daily 6 PM recap with full day analysis and next day preview',
    icon: '🌆',
    defaultThreshold: 0,
    category: 'scheduled',
    isScheduled: true,
  },

  // Generation Mix
  generation_mix: {
    label: 'Generation Mix Update',
    description: 'Hourly breakdown of power generation by fuel type',
    icon: '⚡',
    defaultThreshold: 0,
    category: 'generation',
    isScheduled: true,
  },
  renewable_percentage: {
    label: 'Renewable Energy Alert',
    description: 'Alert when renewable generation exceeds threshold percentage',
    icon: '🌱',
    defaultThreshold: 30,
    category: 'generation',
    unit: '%',
  },
  wind_forecast: {
    label: 'Wind Generation Alert',
    description: 'Significant wind generation ramp up/down notifications',
    icon: '💨',
    defaultThreshold: 500,
    category: 'generation',
    unit: 'MW',
  },
  solar_production: {
    label: 'Solar Peak Alert',
    description: 'Solar generation peak and production milestones',
    icon: '☀️',
    defaultThreshold: 100,
    category: 'generation',
    unit: 'MW',
  },

  // Custom
  custom: {
    label: 'Custom Alert',
    description: 'Create your own custom alert conditions',
    icon: '⚙️',
    defaultThreshold: 0,
    category: 'custom',
  },
};

export const ALERT_CATEGORIES = {
  price: { label: 'Price Alerts', icon: '💰' },
  grid: { label: 'Grid Alerts', icon: '⚡' },
  scheduled: { label: 'Scheduled Reports', icon: '📅' },
  generation: { label: 'Generation Mix', icon: '🔋' },
  custom: { label: 'Custom', icon: '⚙️' },
};

export function useTelegramAlerts() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [testingConnection, setTestingConnection] = useState(false);

  // Fetch user's telegram settings
  const { data: settings, isLoading: settingsLoading, error: settingsError } = useQuery({
    queryKey: ['telegram-settings'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('telegram_alert_settings')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as TelegramAlertSetting[];
    },
  });

  // Fetch rules for a specific setting
  const useRulesForSetting = (settingId: string | null) => {
    return useQuery({
      queryKey: ['telegram-rules', settingId],
      queryFn: async () => {
        if (!settingId) return [];

        const { data, error } = await supabase
          .from('telegram_alert_rules')
          .select('*')
          .eq('setting_id', settingId)
          .order('created_at', { ascending: true });

        if (error) throw error;
        return data as TelegramAlertRule[];
      },
      enabled: !!settingId,
    });
  };

  // Fetch alert history
  const useAlertHistory = (settingId: string | null, limit: number = 50) => {
    return useQuery({
      queryKey: ['telegram-history', settingId, limit],
      queryFn: async () => {
        if (!settingId) return [];

        const { data, error } = await supabase
          .from('telegram_alert_history')
          .select('*')
          .eq('setting_id', settingId)
          .order('sent_at', { ascending: false })
          .limit(limit);

        if (error) throw error;
        return data as TelegramAlertHistory[];
      },
      enabled: !!settingId,
    });
  };

  // Create new telegram setting
  const createSettingMutation = useMutation({
    mutationFn: async (setting: Omit<TelegramAlertSetting, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('telegram_alert_settings')
        .insert({ ...setting, user_id: user.id })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['telegram-settings'] });
      toast({ title: 'Telegram settings saved', description: 'Your Telegram configuration has been saved.' });
    },
    onError: (error: any) => {
      toast({ title: 'Error saving settings', description: error.message, variant: 'destructive' });
    },
  });

  // Update telegram setting
  const updateSettingMutation = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<TelegramAlertSetting> & { id: string }) => {
      const { data, error } = await supabase
        .from('telegram_alert_settings')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['telegram-settings'] });
    },
    onError: (error: any) => {
      toast({ title: 'Error updating settings', description: error.message, variant: 'destructive' });
    },
  });

  // Delete telegram setting
  const deleteSettingMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('telegram_alert_settings')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['telegram-settings'] });
      toast({ title: 'Settings deleted', description: 'Telegram configuration has been removed.' });
    },
    onError: (error: any) => {
      toast({ title: 'Error deleting settings', description: error.message, variant: 'destructive' });
    },
  });

  // Create alert rule
  const createRuleMutation = useMutation({
    mutationFn: async (rule: Omit<TelegramAlertRule, 'id' | 'created_at' | 'updated_at' | 'last_triggered_at'>) => {
      const { data, error } = await supabase
        .from('telegram_alert_rules')
        .insert(rule)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['telegram-rules', variables.setting_id] });
      toast({ title: 'Alert rule created', description: 'Your alert rule has been saved.' });
    },
    onError: (error: any) => {
      toast({ title: 'Error creating rule', description: error.message, variant: 'destructive' });
    },
  });

  // Update alert rule
  const updateRuleMutation = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<TelegramAlertRule> & { id: string }) => {
      const { data, error } = await supabase
        .from('telegram_alert_rules')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['telegram-rules', data.setting_id] });
    },
    onError: (error: any) => {
      toast({ title: 'Error updating rule', description: error.message, variant: 'destructive' });
    },
  });

  // Delete alert rule
  const deleteRuleMutation = useMutation({
    mutationFn: async ({ id, settingId }: { id: string; settingId: string }) => {
      const { error } = await supabase
        .from('telegram_alert_rules')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return settingId;
    },
    onSuccess: (settingId) => {
      queryClient.invalidateQueries({ queryKey: ['telegram-rules', settingId] });
      toast({ title: 'Alert rule deleted' });
    },
    onError: (error: any) => {
      toast({ title: 'Error deleting rule', description: error.message, variant: 'destructive' });
    },
  });

  // Test connection
  const testConnection = useCallback(async (botToken: string, chatId: string) => {
    setTestingConnection(true);
    try {
      const { data, error } = await supabase.functions.invoke('telegram-notifier', {
        body: {
          action: 'test_connection',
          botToken,
          chatId,
        },
      });

      if (error) throw error;

      if (data.success) {
        toast({
          title: '✅ Connection successful!',
          description: `Bot "${data.botName}" connected to "${data.chatTitle}"`,
        });
        return { success: true, ...data };
      } else {
        toast({
          title: 'Connection failed',
          description: data.error || 'Could not connect to Telegram',
          variant: 'destructive',
        });
        return { success: false, error: data.error };
      }
    } catch (error: any) {
      toast({
        title: 'Connection test failed',
        description: error.message,
        variant: 'destructive',
      });
      return { success: false, error: error.message };
    } finally {
      setTestingConnection(false);
    }
  }, [toast]);

  // Trigger manual alert check
  const triggerAlertCheck = useCallback(async (forceCheck: boolean = false) => {
    try {
      const { data, error } = await supabase.functions.invoke('aeso-telegram-alerts', {
        body: { forceCheck },
      });

      if (error) throw error;

      toast({
        title: 'Alert check complete',
        description: `Sent ${data.alertsSent || 0} alerts`,
      });

      return data;
    } catch (error: any) {
      toast({
        title: 'Alert check failed',
        description: error.message,
        variant: 'destructive',
      });
      throw error;
    }
  }, [toast]);

  // Test a specific rule
  const testRule = useCallback(async (ruleId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('aeso-telegram-alerts', {
        body: { testRuleId: ruleId },
      });

      if (error) throw error;

      const result = data.results?.find((r: any) => r.ruleId === ruleId);
      if (result?.success) {
        toast({ title: 'Test alert sent!', description: 'Check your Telegram group.' });
      } else {
        toast({ title: 'Test failed', description: result?.error || 'Could not send test alert', variant: 'destructive' });
      }

      return data;
    } catch (error: any) {
      toast({
        title: 'Test failed',
        description: error.message,
        variant: 'destructive',
      });
      throw error;
    }
  }, [toast]);

  return {
    // Data
    settings,
    settingsLoading,
    settingsError,
    
    // Hooks for nested data
    useRulesForSetting,
    useAlertHistory,
    
    // Mutations
    createSetting: createSettingMutation.mutate,
    updateSetting: updateSettingMutation.mutate,
    deleteSetting: deleteSettingMutation.mutate,
    createRule: createRuleMutation.mutate,
    updateRule: updateRuleMutation.mutate,
    deleteRule: deleteRuleMutation.mutate,
    
    // Actions
    testConnection,
    testingConnection,
    triggerAlertCheck,
    testRule,
    
    // Loading states
    isCreatingSetting: createSettingMutation.isPending,
    isUpdatingSetting: updateSettingMutation.isPending,
    isDeletingSetting: deleteSettingMutation.isPending,
    isCreatingRule: createRuleMutation.isPending,
    isUpdatingRule: updateRuleMutation.isPending,
    isDeletingRule: deleteRuleMutation.isPending,
  };
}
