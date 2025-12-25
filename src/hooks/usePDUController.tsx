import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface PDUDevice {
  id: string;
  name: string;
  ip_address: string | null;
  protocol: 'snmp' | 'modbus' | 'rest' | 'webhook';
  api_endpoint: string | null;
  priority_group: 'critical' | 'high' | 'medium' | 'low';
  location: string | null;
  current_status: 'online' | 'offline' | 'shutting_down' | 'starting_up' | 'error';
  total_outlets: number;
  active_outlets: number;
  current_load_kw: number;
  max_capacity_kw: number;
  last_status_check: string | null;
  created_at: string;
}

export interface PDUPowerReading {
  id: string;
  pdu_id: string;
  power_kw: number;
  voltage: number | null;
  current_amps: number | null;
  timestamp: string;
}

export function usePDUController() {
  const [pdus, setPdus] = useState<PDUDevice[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const { toast } = useToast();

  const fetchPDUs = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('pdu-controller', {
        body: { action: 'list' }
      });

      if (error) throw error;
      setPdus(data.pdus || []);
      return data.pdus;
    } catch (error: any) {
      console.error('Error fetching PDUs:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch PDU devices',
        variant: 'destructive',
      });
      return [];
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const registerPDU = useCallback(async (pduData: {
    name: string;
    ip_address?: string;
    protocol: string;
    api_endpoint?: string;
    priority_group: string;
    location?: string;
    total_outlets?: number;
    max_capacity_kw?: number;
  }) => {
    setActionLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('pdu-controller', {
        body: { action: 'register', pdu_data: pduData }
      });

      if (error) throw error;

      toast({
        title: 'PDU Registered',
        description: `${pduData.name} has been added successfully`,
      });

      await fetchPDUs();
      return data.pdu;
    } catch (error: any) {
      console.error('Error registering PDU:', error);
      toast({
        title: 'Error',
        description: 'Failed to register PDU device',
        variant: 'destructive',
      });
      return null;
    } finally {
      setActionLoading(false);
    }
  }, [fetchPDUs, toast]);

  const shutdownPDUs = useCallback(async (pduIds: string[], reason?: string, gracePeriod?: number) => {
    setActionLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('pdu-controller', {
        body: { 
          action: 'shutdown', 
          pdu_ids: pduIds,
          reason,
          grace_period_seconds: gracePeriod || 60
        }
      });

      if (error) throw error;

      toast({
        title: 'Shutdown Initiated',
        description: `Shutting down ${pduIds.length} PDU(s)`,
      });

      // Refresh PDU list after a short delay
      setTimeout(fetchPDUs, 2000);
      return data;
    } catch (error: any) {
      console.error('Error shutting down PDUs:', error);
      toast({
        title: 'Error',
        description: 'Failed to initiate shutdown',
        variant: 'destructive',
      });
      return null;
    } finally {
      setActionLoading(false);
    }
  }, [fetchPDUs, toast]);

  const powerOnPDUs = useCallback(async (pduIds: string[], reason?: string) => {
    setActionLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('pdu-controller', {
        body: { 
          action: 'power_on', 
          pdu_ids: pduIds,
          reason
        }
      });

      if (error) throw error;

      toast({
        title: 'Power On Initiated',
        description: `Starting ${pduIds.length} PDU(s)`,
      });

      setTimeout(fetchPDUs, 2000);
      return data;
    } catch (error: any) {
      console.error('Error powering on PDUs:', error);
      toast({
        title: 'Error',
        description: 'Failed to power on PDUs',
        variant: 'destructive',
      });
      return null;
    } finally {
      setActionLoading(false);
    }
  }, [fetchPDUs, toast]);

  const updatePDU = useCallback(async (pduId: string, pduData: Partial<PDUDevice>) => {
    setActionLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('pdu-controller', {
        body: { action: 'update', pdu_id: pduId, pdu_data: pduData }
      });

      if (error) throw error;

      toast({
        title: 'PDU Updated',
        description: 'PDU configuration has been updated',
      });

      await fetchPDUs();
      return data.pdu;
    } catch (error: any) {
      console.error('Error updating PDU:', error);
      toast({
        title: 'Error',
        description: 'Failed to update PDU',
        variant: 'destructive',
      });
      return null;
    } finally {
      setActionLoading(false);
    }
  }, [fetchPDUs, toast]);

  const deletePDU = useCallback(async (pduId: string) => {
    setActionLoading(true);
    try {
      const { error } = await supabase.functions.invoke('pdu-controller', {
        body: { action: 'delete', pdu_id: pduId }
      });

      if (error) throw error;

      toast({
        title: 'PDU Deleted',
        description: 'PDU device has been removed',
      });

      await fetchPDUs();
      return true;
    } catch (error: any) {
      console.error('Error deleting PDU:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete PDU',
        variant: 'destructive',
      });
      return false;
    } finally {
      setActionLoading(false);
    }
  }, [fetchPDUs, toast]);

  const getPDUStatus = useCallback(async (pduIds: string[]) => {
    try {
      const { data, error } = await supabase.functions.invoke('pdu-controller', {
        body: { action: 'status', pdu_ids: pduIds }
      });

      if (error) throw error;
      return data;
    } catch (error: any) {
      console.error('Error getting PDU status:', error);
      return null;
    }
  }, []);

  // Computed stats
  const stats = {
    total: pdus.length,
    online: pdus.filter(p => p.current_status === 'online').length,
    offline: pdus.filter(p => p.current_status === 'offline').length,
    shuttingDown: pdus.filter(p => p.current_status === 'shutting_down').length,
    startingUp: pdus.filter(p => p.current_status === 'starting_up').length,
    error: pdus.filter(p => p.current_status === 'error').length,
    totalLoadKw: pdus.reduce((sum, p) => sum + (p.current_load_kw || 0), 0),
    totalCapacityKw: pdus.reduce((sum, p) => sum + (p.max_capacity_kw || 0), 0),
    byPriority: {
      critical: pdus.filter(p => p.priority_group === 'critical'),
      high: pdus.filter(p => p.priority_group === 'high'),
      medium: pdus.filter(p => p.priority_group === 'medium'),
      low: pdus.filter(p => p.priority_group === 'low'),
    }
  };

  return {
    pdus,
    loading,
    actionLoading,
    stats,
    fetchPDUs,
    registerPDU,
    shutdownPDUs,
    powerOnPDUs,
    updatePDU,
    deletePDU,
    getPDUStatus,
  };
}
