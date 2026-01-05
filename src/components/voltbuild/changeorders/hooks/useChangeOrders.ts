import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ChangeOrder, ChangeOrderStatus } from '../../types/voltbuild-phase2.types';
import { toast } from 'sonner';

export function useChangeOrders(projectId: string | null) {
  const queryClient = useQueryClient();

  const changeOrdersQuery = useQuery({
    queryKey: ['change-orders', projectId],
    queryFn: async (): Promise<ChangeOrder[]> => {
      if (!projectId) return [];

      const { data, error } = await supabase
        .from('change_orders')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []).map(item => ({
        ...item,
        attachments: item.attachments as { name: string; url: string }[] || [],
      })) as ChangeOrder[];
    },
    enabled: !!projectId,
  });

  const createChangeOrderMutation = useMutation({
    mutationFn: async (co: Omit<ChangeOrder, 'id' | 'created_at' | 'change_order_number'>) => {
      // Generate CO number
      const { data: existing } = await supabase
        .from('change_orders')
        .select('id')
        .eq('project_id', co.project_id);
      
      const nextNum = (existing?.length || 0) + 1;
      const change_order_number = `CO-${String(nextNum).padStart(3, '0')}`;

      const { data, error } = await supabase
        .from('change_orders')
        .insert({ ...co, change_order_number })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['change-orders', projectId] });
      toast.success('Change order created successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to create change order: ${error.message}`);
    },
  });

  const updateChangeOrderMutation = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<ChangeOrder> & { id: string }) => {
      const { data, error } = await supabase
        .from('change_orders')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['change-orders', projectId] });
      toast.success('Change order updated successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update change order: ${error.message}`);
    },
  });

  const approveChangeOrder = async (id: string, approvedBy: string) => {
    updateChangeOrderMutation.mutate({
      id,
      status: 'approved',
      approved_by: approvedBy,
      approved_at: new Date().toISOString(),
    });
  };

  const rejectChangeOrder = async (id: string) => {
    updateChangeOrderMutation.mutate({
      id,
      status: 'rejected',
    });
  };

  const implementChangeOrder = async (id: string) => {
    updateChangeOrderMutation.mutate({
      id,
      status: 'implemented',
      implemented_at: new Date().toISOString(),
    });
  };

  const deleteChangeOrderMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('change_orders')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['change-orders', projectId] });
      toast.success('Change order deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete change order: ${error.message}`);
    },
  });

  // Get impact summary
  const getImpactSummary = () => {
    const changeOrders = changeOrdersQuery.data || [];
    const approved = changeOrders.filter(co => co.status === 'approved' || co.status === 'implemented');
    
    return {
      totalChangeOrders: changeOrders.length,
      approvedCount: approved.length,
      pendingCount: changeOrders.filter(co => co.status === 'submitted').length,
      totalCostDelta: approved.reduce((sum, co) => sum + (co.cost_delta || 0), 0),
      totalScheduleDelta: approved.reduce((sum, co) => sum + (co.schedule_delta_days || 0), 0),
    };
  };

  // Filter by status
  const filterByStatus = (status?: ChangeOrderStatus) => {
    const changeOrders = changeOrdersQuery.data || [];
    if (!status) return changeOrders;
    return changeOrders.filter(co => co.status === status);
  };

  return {
    changeOrders: changeOrdersQuery.data || [],
    isLoading: changeOrdersQuery.isLoading,
    error: changeOrdersQuery.error,
    createChangeOrder: createChangeOrderMutation.mutate,
    updateChangeOrder: updateChangeOrderMutation.mutate,
    approveChangeOrder,
    rejectChangeOrder,
    implementChangeOrder,
    deleteChangeOrder: deleteChangeOrderMutation.mutate,
    getImpactSummary,
    filterByStatus,
    isCreating: createChangeOrderMutation.isPending,
    isUpdating: updateChangeOrderMutation.isPending,
    isDeleting: deleteChangeOrderMutation.isPending,
  };
}
