import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface ShutdownRule {
  id: string;
  name: string;
  description: string | null;
  price_ceiling_cad: number;
  price_floor_cad: number;
  soft_ceiling_cad: number | null;
  duration_threshold_minutes: number;
  grace_period_seconds: number;
  affected_priority_groups: string[];
  notification_channels: string[];
  is_active: boolean;
  last_triggered_at: string | null;
  trigger_count: number;
  created_at: string;
}

export interface AutomationDecision {
  timestamp: string;
  current_price: number;
  predicted_price_1h: number;
  predicted_price_6h: number;
  grid_stress_level: 'normal' | 'elevated' | 'high' | 'critical';
  decision: 'continue' | 'prepare_shutdown' | 'shutdown' | 'resume';
  affected_pdu_groups: string[];
  reason: string;
  confidence_score: number;
  estimated_savings: number;
}

export interface AutomationLog {
  id: string;
  action_type: 'shutdown' | 'resume' | 'warning' | 'manual_override' | 'scheduled';
  trigger_price: number | null;
  threshold_price: number | null;
  affected_pdu_count: number;
  total_load_affected_kw: number;
  estimated_savings_cad: number | null;
  executed_at: string;
  completed_at: string | null;
  status: string;
}

export interface PriceCeilingAlert {
  id: string;
  alert_type: 'ceiling_breach' | 'ceiling_warning' | 'floor_breach' | 'forecast_warning' | 'grid_stress';
  current_price: number;
  threshold_price: number;
  price_direction: string | null;
  forecast_breach_hours: number | null;
  grid_stress_level: string | null;
  is_active: boolean;
  created_at: string;
}

export interface AutomationAnalytics {
  period_days: number;
  total_shutdowns: number;
  total_resumes: number;
  total_savings_cad: number;
  total_curtailment_hours: number;
  average_price_avoided_cad: number;
  recent_logs: AutomationLog[];
  active_alerts: PriceCeilingAlert[];
}

export function useDatacenterAutomation() {
  const [rules, setRules] = useState<ShutdownRule[]>([]);
  const [analytics, setAnalytics] = useState<AutomationAnalytics | null>(null);
  const [latestDecision, setLatestDecision] = useState<AutomationDecision | null>(null);
  const [loading, setLoading] = useState(false);
  const [evaluating, setEvaluating] = useState(false);
  const { toast } = useToast();

  const fetchRules = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('datacenter-automation-engine', {
        body: { action: 'get_rules' }
      });

      if (error) throw error;
      setRules(data.rules || []);
      return data.rules;
    } catch (error: any) {
      console.error('Error fetching rules:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch shutdown rules',
        variant: 'destructive',
      });
      return [];
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const createRule = useCallback(async (ruleData: {
    name: string;
    description?: string;
    price_ceiling_cad: number;
    price_floor_cad: number;
    soft_ceiling_cad?: number;
    duration_threshold_minutes?: number;
    grace_period_seconds?: number;
    affected_priority_groups: string[];
    notification_channels?: string[];
  }) => {
    try {
      const { data, error } = await supabase.functions.invoke('datacenter-automation-engine', {
        body: { action: 'create_rule', rule_data: ruleData }
      });

      if (error) throw error;

      toast({
        title: 'Rule Created',
        description: `${ruleData.name} has been created`,
      });

      await fetchRules();
      return data.rule;
    } catch (error: any) {
      console.error('Error creating rule:', error);
      toast({
        title: 'Error',
        description: 'Failed to create shutdown rule',
        variant: 'destructive',
      });
      return null;
    }
  }, [fetchRules, toast]);

  const updateRule = useCallback(async (ruleId: string, ruleData: Partial<ShutdownRule>) => {
    try {
      const { data, error } = await supabase.functions.invoke('datacenter-automation-engine', {
        body: { action: 'update_rule', rule_id: ruleId, rule_data: ruleData }
      });

      if (error) throw error;

      toast({
        title: 'Rule Updated',
        description: 'Shutdown rule has been updated',
      });

      await fetchRules();
      return data.rule;
    } catch (error: any) {
      console.error('Error updating rule:', error);
      toast({
        title: 'Error',
        description: 'Failed to update rule',
        variant: 'destructive',
      });
      return null;
    }
  }, [fetchRules, toast]);

  const deleteRule = useCallback(async (ruleId: string) => {
    try {
      const { error } = await supabase.functions.invoke('datacenter-automation-engine', {
        body: { action: 'delete_rule', rule_id: ruleId }
      });

      if (error) throw error;

      toast({
        title: 'Rule Deleted',
        description: 'Shutdown rule has been removed',
      });

      await fetchRules();
      return true;
    } catch (error: any) {
      console.error('Error deleting rule:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete rule',
        variant: 'destructive',
      });
      return false;
    }
  }, [fetchRules, toast]);

  const evaluateAutomation = useCallback(async () => {
    setEvaluating(true);
    try {
      const { data, error } = await supabase.functions.invoke('datacenter-automation-engine', {
        body: { action: 'evaluate' }
      });

      if (error) throw error;

      setLatestDecision(data.decision);
      return data.decision as AutomationDecision;
    } catch (error: any) {
      console.error('Error evaluating automation:', error);
      return null;
    } finally {
      setEvaluating(false);
    }
  }, []);

  const executeDecision = useCallback(async (decision: AutomationDecision) => {
    try {
      const { data, error } = await supabase.functions.invoke('datacenter-automation-engine', {
        body: { action: 'execute', decision }
      });

      if (error) throw error;

      toast({
        title: 'Decision Executed',
        description: `Action: ${decision.decision}`,
      });

      return data;
    } catch (error: any) {
      console.error('Error executing decision:', error);
      toast({
        title: 'Error',
        description: 'Failed to execute automation decision',
        variant: 'destructive',
      });
      return null;
    }
  }, [toast]);

  const fetchAnalytics = useCallback(async (periodDays: number = 30) => {
    try {
      const { data, error } = await supabase.functions.invoke('datacenter-automation-engine', {
        body: { action: 'get_analytics', period_days: periodDays }
      });

      if (error) throw error;

      setAnalytics(data.analytics);
      return data.analytics as AutomationAnalytics;
    } catch (error: any) {
      console.error('Error fetching analytics:', error);
      return null;
    }
  }, []);

  // Auto-evaluate every 5 minutes when component is mounted
  useEffect(() => {
    const interval = setInterval(() => {
      evaluateAutomation();
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [evaluateAutomation]);

  return {
    rules,
    analytics,
    latestDecision,
    loading,
    evaluating,
    fetchRules,
    createRule,
    updateRule,
    deleteRule,
    evaluateAutomation,
    executeDecision,
    fetchAnalytics,
  };
}
