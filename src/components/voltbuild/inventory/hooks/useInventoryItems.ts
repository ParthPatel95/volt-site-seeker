import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { InventoryItem, InventoryFilters } from '../types/inventory.types';
import { generateInventoryBarcode, generateItemQRData } from '@/utils/codeGenerator';

export function useInventoryItems(projectId: string | null, filters?: InventoryFilters) {
  const queryClient = useQueryClient();

  // Fetch all inventory items for a project
  const {
    data: items = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ['inventory-items', projectId, filters],
    queryFn: async () => {
      if (!projectId) return [];

      let query = supabase
        .from('inventory_items')
        .select(`
          *,
          category:inventory_categories(*)
        `)
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });

      // Apply filters
      if (filters?.categoryId) {
        query = query.eq('category_id', filters.categoryId);
      }
      if (filters?.status) {
        query = query.eq('status', filters.status);
      }
      if (filters?.location) {
        query = query.eq('location', filters.location);
      }
      // Note: lowStockOnly filter is applied client-side after fetch
      // because PostgREST doesn't support column-to-column comparisons
      if (filters?.search) {
        query = query.or(`name.ilike.%${filters.search}%,sku.ilike.%${filters.search}%,barcode.ilike.%${filters.search}%`);
      }

      const { data, error } = await query;

      if (error) throw error;
      
      let items = (data || []) as InventoryItem[];
      
      // Apply client-side filter for low stock
      if (filters?.lowStockOnly) {
        items = items.filter(item => item.quantity <= item.min_stock_level);
      }
      
      // Apply client-side filter for expiring items (within 30 days)
      if (filters?.expiringOnly) {
        const thirtyDaysFromNow = new Date();
        thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
        items = items.filter(item => 
          item.expiry_date && new Date(item.expiry_date) <= thirtyDaysFromNow
        );
      }
      
      return items;
    },
    enabled: !!projectId,
  });

  // Create item mutation
  const createItemMutation = useMutation({
    mutationFn: async (item: Omit<InventoryItem, 'id' | 'created_at' | 'updated_at' | 'category'>) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      // Auto-generate barcode if not provided
      const barcode = item.barcode || generateInventoryBarcode();
      
      // Generate QR code data
      const qrData = generateItemQRData({
        id: '', // Will be replaced after insert
        name: item.name,
        sku: item.sku,
        barcode: barcode,
      });
      
      const { data, error } = await supabase
        .from('inventory_items')
        .insert({
          ...item,
          barcode,
          qr_code: qrData,
          created_by: user?.id,
        })
        .select()
        .single();

      if (error) throw error;
      
      // Update QR code with actual ID
      if (data) {
        const updatedQrData = generateItemQRData({
          id: data.id,
          name: data.name,
          sku: data.sku,
          barcode: data.barcode,
        });
        
        await supabase
          .from('inventory_items')
          .update({ qr_code: updatedQrData })
          .eq('id', data.id);
      }
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory-items', projectId] });
      queryClient.invalidateQueries({ queryKey: ['inventory-stats', projectId] });
      toast.success('Item added to inventory');
    },
    onError: (error) => {
      toast.error(`Failed to add item: ${error.message}`);
    },
  });

  // Update item mutation
  const updateItemMutation = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<InventoryItem> & { id: string }) => {
      const { data, error } = await supabase
        .from('inventory_items')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory-items', projectId] });
      queryClient.invalidateQueries({ queryKey: ['inventory-stats', projectId] });
      toast.success('Item updated');
    },
    onError: (error) => {
      toast.error(`Failed to update item: ${error.message}`);
    },
  });

  // Delete item mutation
  const deleteItemMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('inventory_items')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory-items', projectId] });
      queryClient.invalidateQueries({ queryKey: ['inventory-stats', projectId] });
      toast.success('Item deleted');
    },
    onError: (error) => {
      toast.error(`Failed to delete item: ${error.message}`);
    },
  });

  // Adjust quantity mutation (with transaction logging)
  const adjustQuantityMutation = useMutation({
    mutationFn: async ({
      itemId,
      quantityChange,
      type,
      reason,
      notes,
    }: {
      itemId: string;
      quantityChange: number;
      type: 'in' | 'out' | 'adjustment';
      reason?: string;
      notes?: string;
    }) => {
      // Get current item
      const { data: item, error: fetchError } = await supabase
        .from('inventory_items')
        .select('quantity, project_id, min_stock_level')
        .eq('id', itemId)
        .single();

      if (fetchError) throw fetchError;

      const quantityBefore = item.quantity;
      const quantityAfter = quantityBefore + quantityChange;

      if (quantityAfter < 0) {
        throw new Error('Cannot reduce quantity below zero');
      }

      const { data: { user } } = await supabase.auth.getUser();

      // Update item quantity
      const { error: updateError } = await supabase
        .from('inventory_items')
        .update({ 
          quantity: quantityAfter,
          status: quantityAfter === 0 ? 'out_of_stock' : 
                  quantityAfter <= item.min_stock_level ? 'low_stock' : 'in_stock'
        })
        .eq('id', itemId);

      if (updateError) throw updateError;

      // Create transaction record
      const { error: transactionError } = await supabase
        .from('inventory_transactions')
        .insert({
          item_id: itemId,
          project_id: item.project_id,
          transaction_type: type,
          quantity_change: quantityChange,
          quantity_before: quantityBefore,
          quantity_after: quantityAfter,
          reason,
          notes,
          performed_by: user?.id,
        });

      if (transactionError) throw transactionError;

      return { quantityBefore, quantityAfter };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory-items', projectId] });
      queryClient.invalidateQueries({ queryKey: ['inventory-stats', projectId] });
      queryClient.invalidateQueries({ queryKey: ['inventory-transactions'] });
      toast.success('Quantity adjusted');
    },
    onError: (error) => {
      toast.error(`Failed to adjust quantity: ${error.message}`);
    },
  });

  // Find item by barcode
  const findByBarcode = async (barcode: string): Promise<InventoryItem | null> => {
    if (!projectId) return null;

    const { data, error } = await supabase
      .from('inventory_items')
      .select('*')
      .eq('project_id', projectId)
      .eq('barcode', barcode)
      .maybeSingle();

    if (error) {
      console.error('Error finding item by barcode:', error);
      return null;
    }

    return data as InventoryItem | null;
  };

  return {
    items,
    isLoading,
    error,
    createItem: createItemMutation.mutate,
    updateItem: updateItemMutation.mutate,
    deleteItem: deleteItemMutation.mutate,
    adjustQuantity: adjustQuantityMutation.mutate,
    findByBarcode,
    isCreating: createItemMutation.isPending,
    isUpdating: updateItemMutation.isPending,
    isDeleting: deleteItemMutation.isPending,
    isAdjusting: adjustQuantityMutation.isPending,
  };
}
