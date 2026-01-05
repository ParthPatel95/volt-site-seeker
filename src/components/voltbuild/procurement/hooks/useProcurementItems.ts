import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ProcurementItem, ProcurementCategory, ProcurementStatus } from '../../types/voltbuild-phase2.types';
import { toast } from 'sonner';

export function useProcurementItems(projectId: string | null) {
  const queryClient = useQueryClient();

  const procurementItemsQuery = useQuery({
    queryKey: ['procurement-items', projectId],
    queryFn: async (): Promise<ProcurementItem[]> => {
      if (!projectId) return [];

      const { data, error } = await supabase
        .from('procurement_items')
        .select('*')
        .eq('project_id', projectId)
        .order('expected_delivery_date', { ascending: true });

      if (error) throw error;
      return (data || []) as ProcurementItem[];
    },
    enabled: !!projectId,
  });

  const createProcurementItemMutation = useMutation({
    mutationFn: async (item: Omit<ProcurementItem, 'id' | 'created_at' | 'total_cost'>) => {
      const { data, error } = await supabase
        .from('procurement_items')
        .insert(item)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['procurement-items', projectId] });
      toast.success('Procurement item created successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to create procurement item: ${error.message}`);
    },
  });

  const updateProcurementItemMutation = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<ProcurementItem> & { id: string }) => {
      const { total_cost, ...rest } = updates;
      const { data, error } = await supabase
        .from('procurement_items')
        .update(rest)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['procurement-items', projectId] });
      toast.success('Procurement item updated successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update procurement item: ${error.message}`);
    },
  });

  const updateProcurementStatus = async (id: string, status: ProcurementStatus) => {
    const updates: Partial<ProcurementItem> = { status };
    if (status === 'delivered') {
      updates.actual_delivery_date = new Date().toISOString().split('T')[0];
    }
    updateProcurementItemMutation.mutate({ id, ...updates });
  };

  const deleteProcurementItemMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('procurement_items')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['procurement-items', projectId] });
      toast.success('Procurement item deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete procurement item: ${error.message}`);
    },
  });

  // Get statistics
  const getStats = () => {
    const items = procurementItemsQuery.data || [];
    return {
      total: items.length,
      planned: items.filter(i => i.status === 'planned').length,
      ordered: items.filter(i => i.status === 'ordered').length,
      inTransit: items.filter(i => i.status === 'in_transit').length,
      delivered: items.filter(i => i.status === 'delivered').length,
      delayed: items.filter(i => i.status === 'delayed').length,
      totalCost: items.reduce((sum, i) => sum + (i.total_cost || 0), 0),
    };
  };

  // Filter items
  const filterItems = (category?: ProcurementCategory, status?: ProcurementStatus, phaseId?: string) => {
    let items = procurementItemsQuery.data || [];
    if (category) items = items.filter(i => i.category === category);
    if (status) items = items.filter(i => i.status === status);
    if (phaseId) items = items.filter(i => i.linked_phase_id === phaseId);
    return items;
  };

  // Check for missing critical items (for lead time integration)
  const getMissingCriticalItems = (leadTimeInputs?: { transformer_required?: boolean; switchgear_required?: boolean }) => {
    const items = procurementItemsQuery.data || [];
    const missing: string[] = [];

    if (leadTimeInputs?.transformer_required) {
      const hasTransformer = items.some(i => i.category === 'Transformers');
      if (!hasTransformer) missing.push('Transformer');
    }

    if (leadTimeInputs?.switchgear_required) {
      const hasSwitchgear = items.some(i => i.category === 'Switchgear');
      if (!hasSwitchgear) missing.push('Switchgear');
    }

    return missing;
  };

  return {
    procurementItems: procurementItemsQuery.data || [],
    isLoading: procurementItemsQuery.isLoading,
    error: procurementItemsQuery.error,
    createProcurementItem: createProcurementItemMutation.mutate,
    updateProcurementItem: updateProcurementItemMutation.mutate,
    updateProcurementStatus,
    deleteProcurementItem: deleteProcurementItemMutation.mutate,
    getStats,
    filterItems,
    getMissingCriticalItems,
    isCreating: createProcurementItemMutation.isPending,
    isUpdating: updateProcurementItemMutation.isPending,
    isDeleting: deleteProcurementItemMutation.isPending,
  };
}
