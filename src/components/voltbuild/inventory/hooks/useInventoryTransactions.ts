import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { InventoryTransaction } from '../types/inventory.types';

export function useInventoryTransactions(itemId: string | null, projectId?: string | null) {
  // Fetch transactions for a specific item
  const {
    data: transactions = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ['inventory-transactions', itemId],
    queryFn: async () => {
      if (!itemId) return [];

      const { data, error } = await supabase
        .from('inventory_transactions')
        .select('*')
        .eq('item_id', itemId)
        .order('performed_at', { ascending: false });

      if (error) throw error;
      return (data || []) as InventoryTransaction[];
    },
    enabled: !!itemId,
  });

  // Fetch all transactions for a project (for reporting)
  const {
    data: projectTransactions = [],
    isLoading: isLoadingProject,
  } = useQuery({
    queryKey: ['inventory-transactions-project', projectId],
    queryFn: async () => {
      if (!projectId) return [];

      const { data, error } = await supabase
        .from('inventory_transactions')
        .select(`
          *,
          item:inventory_items(id, name, sku)
        `)
        .eq('project_id', projectId)
        .order('performed_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      return (data || []) as InventoryTransaction[];
    },
    enabled: !!projectId,
  });

  return {
    transactions,
    projectTransactions,
    isLoading,
    isLoadingProject,
    error,
  };
}
