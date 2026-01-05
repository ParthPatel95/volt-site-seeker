import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { EnergizationGate, EnergizationGateStatus, CommissioningChecklist } from '../../types/voltbuild-phase2.types';
import { toast } from 'sonner';

export function useEnergizationGates(projectId: string | null) {
  const queryClient = useQueryClient();

  const gatesQuery = useQuery({
    queryKey: ['energization-gates', projectId],
    queryFn: async (): Promise<EnergizationGate[]> => {
      if (!projectId) return [];

      const { data, error } = await supabase
        .from('energization_gates')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return (data || []).map(item => ({
        ...item,
        required_checklists: item.required_checklists || [],
      })) as EnergizationGate[];
    },
    enabled: !!projectId,
  });

  const createGateMutation = useMutation({
    mutationFn: async (gate: Omit<EnergizationGate, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('energization_gates')
        .insert(gate)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['energization-gates', projectId] });
      toast.success('Energization gate created successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to create gate: ${error.message}`);
    },
  });

  const updateGateMutation = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<EnergizationGate> & { id: string }) => {
      const { data, error } = await supabase
        .from('energization_gates')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['energization-gates', projectId] });
      toast.success('Gate updated successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update gate: ${error.message}`);
    },
  });

  const deleteGateMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('energization_gates')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['energization-gates', projectId] });
      toast.success('Gate deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete gate: ${error.message}`);
    },
  });

  // Calculate gate status based on checklists
  const calculateGateStatus = (gate: EnergizationGate, checklists: CommissioningChecklist[]): EnergizationGateStatus => {
    if (gate.required_checklists.length === 0) return 'blocked';
    
    const requiredChecklists = checklists.filter(c => gate.required_checklists.includes(c.id));
    const allComplete = requiredChecklists.every(c => c.status === 'complete');
    
    return allComplete && requiredChecklists.length === gate.required_checklists.length ? 'ready' : 'blocked';
  };

  // Update gate status based on current checklist completion
  const refreshGateStatus = async (gateId: string, checklists: CommissioningChecklist[]) => {
    const gate = gatesQuery.data?.find(g => g.id === gateId);
    if (!gate) return;

    const newStatus = calculateGateStatus(gate, checklists);
    if (newStatus !== gate.status) {
      updateGateMutation.mutate({ id: gateId, status: newStatus });
    }
  };

  // Get gate with completion details
  const getGateDetails = (gateId: string, checklists: CommissioningChecklist[]) => {
    const gate = gatesQuery.data?.find(g => g.id === gateId);
    if (!gate) return null;

    const requiredChecklists = checklists.filter(c => gate.required_checklists.includes(c.id));
    const completedChecklists = requiredChecklists.filter(c => c.status === 'complete');

    return {
      ...gate,
      checklistDetails: requiredChecklists.map(c => ({
        id: c.id,
        name: c.checklist_name,
        status: c.status,
        isComplete: c.status === 'complete',
      })),
      completedCount: completedChecklists.length,
      totalRequired: requiredChecklists.length,
      isReady: completedChecklists.length === requiredChecklists.length && requiredChecklists.length > 0,
    };
  };

  return {
    gates: gatesQuery.data || [],
    isLoading: gatesQuery.isLoading,
    error: gatesQuery.error,
    createGate: createGateMutation.mutate,
    updateGate: updateGateMutation.mutate,
    deleteGate: deleteGateMutation.mutate,
    calculateGateStatus,
    refreshGateStatus,
    getGateDetails,
    isCreating: createGateMutation.isPending,
    isUpdating: updateGateMutation.isPending,
    isDeleting: deleteGateMutation.isPending,
  };
}
