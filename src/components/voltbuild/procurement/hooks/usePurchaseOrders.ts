import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { PurchaseOrder, PurchaseOrderStatus } from '../../types/voltbuild-phase2.types';
import { toast } from 'sonner';

export function usePurchaseOrders(projectId: string | null) {
  const queryClient = useQueryClient();

  const purchaseOrdersQuery = useQuery({
    queryKey: ['purchase-orders', projectId],
    queryFn: async (): Promise<PurchaseOrder[]> => {
      if (!projectId) return [];

      const { data, error } = await supabase
        .from('purchase_orders')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []) as PurchaseOrder[];
    },
    enabled: !!projectId,
  });

  const createPurchaseOrderMutation = useMutation({
    mutationFn: async (po: Omit<PurchaseOrder, 'id' | 'created_at'>) => {
      const { data, error } = await supabase
        .from('purchase_orders')
        .insert(po)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchase-orders', projectId] });
      toast.success('Purchase order created successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to create purchase order: ${error.message}`);
    },
  });

  const updatePurchaseOrderMutation = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<PurchaseOrder> & { id: string }) => {
      const { data, error } = await supabase
        .from('purchase_orders')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchase-orders', projectId] });
      toast.success('Purchase order updated successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update purchase order: ${error.message}`);
    },
  });

  const updatePurchaseOrderStatus = async (id: string, status: PurchaseOrderStatus) => {
    updatePurchaseOrderMutation.mutate({ id, status });
  };

  const deletePurchaseOrderMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('purchase_orders')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchase-orders', projectId] });
      toast.success('Purchase order deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete purchase order: ${error.message}`);
    },
  });

  // Generate next PO number
  const generatePONumber = () => {
    const pos = purchaseOrdersQuery.data || [];
    const nextNum = pos.length + 1;
    return `PO-${String(nextNum).padStart(4, '0')}`;
  };

  // Get total amount by status
  const getTotalsByStatus = () => {
    const pos = purchaseOrdersQuery.data || [];
    return {
      draft: pos.filter(p => p.status === 'draft').reduce((sum, p) => sum + p.amount, 0),
      sent: pos.filter(p => p.status === 'sent').reduce((sum, p) => sum + p.amount, 0),
      accepted: pos.filter(p => p.status === 'accepted').reduce((sum, p) => sum + p.amount, 0),
      paid: pos.filter(p => p.status === 'paid').reduce((sum, p) => sum + p.amount, 0),
      closed: pos.filter(p => p.status === 'closed').reduce((sum, p) => sum + p.amount, 0),
      total: pos.reduce((sum, p) => sum + p.amount, 0),
    };
  };

  return {
    purchaseOrders: purchaseOrdersQuery.data || [],
    isLoading: purchaseOrdersQuery.isLoading,
    error: purchaseOrdersQuery.error,
    createPurchaseOrder: createPurchaseOrderMutation.mutate,
    updatePurchaseOrder: updatePurchaseOrderMutation.mutate,
    updatePurchaseOrderStatus,
    deletePurchaseOrder: deletePurchaseOrderMutation.mutate,
    generatePONumber,
    getTotalsByStatus,
    isCreating: createPurchaseOrderMutation.isPending,
    isUpdating: updatePurchaseOrderMutation.isPending,
    isDeleting: deletePurchaseOrderMutation.isPending,
  };
}
