import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface HydroMiner {
  id: string;
  name: string;
  model: string;
  ip_address: string;
  mac_address: string | null;
  api_port: number;
  http_port: number;
  firmware_type: 'stock' | 'luxos' | 'braiins' | 'foundry';
  api_credentials: { username?: string; password?: string };
  priority_group: 'critical' | 'high' | 'medium' | 'low' | 'curtailable';
  location: string | null;
  current_status: 'mining' | 'idle' | 'sleeping' | 'offline' | 'error' | 'rebooting';
  current_hashrate_th: number | null;
  target_hashrate_th: number | null;
  power_consumption_w: number | null;
  inlet_temp_c: number | null;
  outlet_temp_c: number | null;
  chip_temp_avg_c: number | null;
  fan_speed_avg: number | null;
  pool_url: string | null;
  worker_name: string | null;
  last_seen: string | null;
  created_at: string;
  updated_at: string;
}

export interface MinerControlLog {
  id: string;
  miner_ids: string[];
  action: string;
  triggered_by: 'automation' | 'manual' | 'schedule' | 'alert';
  trigger_reason: string | null;
  target_power_w: number | null;
  execution_status: 'pending' | 'in_progress' | 'success' | 'partial' | 'failed';
  response_data: any;
  error_message: string | null;
  created_at: string;
  completed_at: string | null;
}

export interface FleetStats {
  total: number;
  mining: number;
  sleeping: number;
  offline: number;
  error: number;
  totalHashrateTH: number;
  totalPowerKW: number;
  byPriority: {
    critical: number;
    high: number;
    medium: number;
    low: number;
    curtailable: number;
  };
}

export function useMinerController() {
  const [miners, setMiners] = useState<HydroMiner[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [fleetStats, setFleetStats] = useState<FleetStats | null>(null);
  const { toast } = useToast();

  const fetchMiners = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('miner-controller', {
        body: { action: 'list' }
      });

      if (error) throw error;
      setMiners(data.miners || []);
      return data.miners;
    } catch (error: any) {
      console.error('Error fetching miners:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch miner fleet',
        variant: 'destructive',
      });
      return [];
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const registerMiner = useCallback(async (minerData: {
    name: string;
    model: string;
    ip_address: string;
    mac_address?: string;
    api_port?: number;
    http_port?: number;
    firmware_type: string;
    api_credentials?: { username: string; password: string };
    priority_group: string;
    location?: string;
    target_hashrate_th?: number;
  }) => {
    setActionLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('miner-controller', {
        body: { action: 'register', miner_data: minerData }
      });

      if (error) throw error;

      toast({
        title: 'Miner Registered',
        description: `${minerData.name} has been added to the fleet`,
      });

      await fetchMiners();
      return data.miner;
    } catch (error: any) {
      console.error('Error registering miner:', error);
      toast({
        title: 'Error',
        description: 'Failed to register miner',
        variant: 'destructive',
      });
      return null;
    } finally {
      setActionLoading(false);
    }
  }, [fetchMiners, toast]);

  const sleepMiners = useCallback(async (
    minerIds: string[], 
    reason?: string,
    triggeredBy: 'manual' | 'automation' | 'schedule' = 'manual'
  ) => {
    setActionLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('miner-controller', {
        body: { 
          action: 'sleep', 
          miner_ids: minerIds,
          reason,
          triggered_by: triggeredBy
        }
      });

      if (error) throw error;

      const successCount = data.results?.filter((r: any) => r.success).length || 0;
      
      toast({
        title: 'Sleep Command Sent',
        description: `${successCount}/${minerIds.length} miners put to sleep`,
      });

      setTimeout(fetchMiners, 2000);
      return data;
    } catch (error: any) {
      console.error('Error sleeping miners:', error);
      toast({
        title: 'Error',
        description: 'Failed to sleep miners',
        variant: 'destructive',
      });
      return null;
    } finally {
      setActionLoading(false);
    }
  }, [fetchMiners, toast]);

  const wakeupMiners = useCallback(async (
    minerIds: string[], 
    reason?: string,
    staggerSeconds: number = 5,
    triggeredBy: 'manual' | 'automation' | 'schedule' = 'manual'
  ) => {
    setActionLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('miner-controller', {
        body: { 
          action: 'wakeup', 
          miner_ids: minerIds,
          reason,
          stagger_seconds: staggerSeconds,
          triggered_by: triggeredBy
        }
      });

      if (error) throw error;

      const successCount = data.results?.filter((r: any) => r.success).length || 0;
      
      toast({
        title: 'Wakeup Command Sent',
        description: `${successCount}/${minerIds.length} miners waking up`,
      });

      setTimeout(fetchMiners, 3000);
      return data;
    } catch (error: any) {
      console.error('Error waking miners:', error);
      toast({
        title: 'Error',
        description: 'Failed to wake miners',
        variant: 'destructive',
      });
      return null;
    } finally {
      setActionLoading(false);
    }
  }, [fetchMiners, toast]);

  const rebootMiners = useCallback(async (minerIds: string[], reason?: string) => {
    setActionLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('miner-controller', {
        body: { 
          action: 'reboot', 
          miner_ids: minerIds,
          reason
        }
      });

      if (error) throw error;

      toast({
        title: 'Reboot Initiated',
        description: `Rebooting ${minerIds.length} miner(s)`,
      });

      setTimeout(fetchMiners, 5000);
      return data;
    } catch (error: any) {
      console.error('Error rebooting miners:', error);
      toast({
        title: 'Error',
        description: 'Failed to reboot miners',
        variant: 'destructive',
      });
      return null;
    } finally {
      setActionLoading(false);
    }
  }, [fetchMiners, toast]);

  const getMinerStatus = useCallback(async (minerIds: string[]) => {
    try {
      const { data, error } = await supabase.functions.invoke('miner-controller', {
        body: { action: 'status', miner_ids: minerIds }
      });

      if (error) throw error;
      return data.status;
    } catch (error: any) {
      console.error('Error getting miner status:', error);
      return null;
    }
  }, []);

  const updateMiner = useCallback(async (minerId: string, minerData: Partial<HydroMiner>) => {
    setActionLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('miner-controller', {
        body: { action: 'update', miner_id: minerId, miner_data: minerData }
      });

      if (error) throw error;

      toast({
        title: 'Miner Updated',
        description: 'Miner configuration has been updated',
      });

      await fetchMiners();
      return data.miner;
    } catch (error: any) {
      console.error('Error updating miner:', error);
      toast({
        title: 'Error',
        description: 'Failed to update miner',
        variant: 'destructive',
      });
      return null;
    } finally {
      setActionLoading(false);
    }
  }, [fetchMiners, toast]);

  const deleteMiner = useCallback(async (minerId: string) => {
    setActionLoading(true);
    try {
      const { error } = await supabase.functions.invoke('miner-controller', {
        body: { action: 'delete', miner_id: minerId }
      });

      if (error) throw error;

      toast({
        title: 'Miner Removed',
        description: 'Miner has been removed from the fleet',
      });

      await fetchMiners();
      return true;
    } catch (error: any) {
      console.error('Error deleting miner:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete miner',
        variant: 'destructive',
      });
      return false;
    } finally {
      setActionLoading(false);
    }
  }, [fetchMiners, toast]);

  const fetchFleetStats = useCallback(async () => {
    try {
      const { data, error } = await supabase.functions.invoke('miner-controller', {
        body: { action: 'stats' }
      });

      if (error) throw error;
      setFleetStats(data.stats);
      return data.stats;
    } catch (error: any) {
      console.error('Error fetching fleet stats:', error);
      return null;
    }
  }, []);

  const sleepByPriority = useCallback(async (
    priorityGroups: string[],
    reason: string
  ) => {
    setActionLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('miner-controller', {
        body: { 
          action: 'batch_sleep', 
          priority_groups: priorityGroups,
          reason,
          triggered_by: 'automation'
        }
      });

      if (error) throw error;

      toast({
        title: 'Batch Sleep Initiated',
        description: `Sleeping miners in ${priorityGroups.join(', ')} priority groups`,
      });

      setTimeout(fetchMiners, 2000);
      return data;
    } catch (error: any) {
      console.error('Error batch sleeping miners:', error);
      toast({
        title: 'Error',
        description: 'Failed to batch sleep miners',
        variant: 'destructive',
      });
      return null;
    } finally {
      setActionLoading(false);
    }
  }, [fetchMiners, toast]);

  // Computed stats from local miners array
  const stats = {
    total: miners.length,
    mining: miners.filter(m => m.current_status === 'mining').length,
    sleeping: miners.filter(m => m.current_status === 'sleeping').length,
    offline: miners.filter(m => m.current_status === 'offline').length,
    error: miners.filter(m => m.current_status === 'error').length,
    rebooting: miners.filter(m => m.current_status === 'rebooting').length,
    totalHashrateTH: miners.reduce((sum, m) => sum + (m.current_hashrate_th || 0), 0),
    totalPowerKW: miners.reduce((sum, m) => sum + (m.power_consumption_w || 0), 0) / 1000,
    avgEfficiency: miners.length > 0 
      ? miners.reduce((sum, m) => {
          if (m.power_consumption_w && m.current_hashrate_th) {
            return sum + (m.power_consumption_w / m.current_hashrate_th);
          }
          return sum;
        }, 0) / miners.filter(m => m.power_consumption_w && m.current_hashrate_th).length || 0
      : 0,
    byPriority: {
      critical: miners.filter(m => m.priority_group === 'critical'),
      high: miners.filter(m => m.priority_group === 'high'),
      medium: miners.filter(m => m.priority_group === 'medium'),
      low: miners.filter(m => m.priority_group === 'low'),
      curtailable: miners.filter(m => m.priority_group === 'curtailable'),
    },
    byFirmware: {
      stock: miners.filter(m => m.firmware_type === 'stock'),
      luxos: miners.filter(m => m.firmware_type === 'luxos'),
      braiins: miners.filter(m => m.firmware_type === 'braiins'),
      foundry: miners.filter(m => m.firmware_type === 'foundry'),
    },
    byModel: miners.reduce((acc, m) => {
      acc[m.model] = (acc[m.model] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
  };

  return {
    miners,
    loading,
    actionLoading,
    stats,
    fleetStats,
    fetchMiners,
    registerMiner,
    sleepMiners,
    wakeupMiners,
    rebootMiners,
    getMinerStatus,
    updateMiner,
    deleteMiner,
    fetchFleetStats,
    sleepByPriority,
  };
}
