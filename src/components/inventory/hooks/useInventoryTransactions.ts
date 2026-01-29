import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { InventoryTransaction } from '../types/inventory.types';

export function useInventoryTransactions(itemId: string | null, workspaceId?: string | null) {
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

  // Fetch all transactions for a workspace (for reporting)
  const {
    data: workspaceTransactions = [],
    isLoading: isLoadingWorkspace,
  } = useQuery({
    queryKey: ['inventory-transactions-workspace', workspaceId],
    queryFn: async () => {
      if (!workspaceId) return [];

      const { data, error } = await supabase
        .from('inventory_transactions')
        .select(`
          *,
          item:inventory_items(id, name, sku, primary_image_url, unit)
        `)
        .eq('workspace_id', workspaceId)
        .order('performed_at', { ascending: false })
        .limit(200);

      if (error) throw error;
      return (data || []) as InventoryTransaction[];
    },
    enabled: !!workspaceId,
  });

  return {
    transactions,
    workspaceTransactions,
    isLoading,
    isLoadingWorkspace,
    error,
  };
}
