import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { InventoryStats, InventoryItem } from '../types/inventory.types';
import { addDays, isAfter, isBefore } from 'date-fns';

export function useInventoryStats(projectId: string | null) {
  // Fetch all items for stats calculation
  const {
    data: items = [],
    isLoading,
  } = useQuery({
    queryKey: ['inventory-items-stats', projectId],
    queryFn: async () => {
      if (!projectId) return [];

      const { data, error } = await supabase
        .from('inventory_items')
        .select('*')
        .eq('project_id', projectId);

      if (error) throw error;
      return (data || []) as InventoryItem[];
    },
    enabled: !!projectId,
  });

  // Calculate stats
  const stats: InventoryStats = useMemo(() => {
    const totalItems = items.length;
    const totalValue = items.reduce((sum, item) => sum + (item.quantity * item.unit_cost), 0);
    
    const inStockCount = items.filter(item => item.status === 'in_stock').length;
    const lowStockCount = items.filter(item => 
      item.quantity > 0 && item.quantity <= item.min_stock_level
    ).length;
    const outOfStockCount = items.filter(item => item.quantity === 0).length;
    
    // Items expiring in next 30 days
    const thirtyDaysFromNow = addDays(new Date(), 30);
    const expiringCount = items.filter(item => {
      if (!item.expiry_date) return false;
      const expiryDate = new Date(item.expiry_date);
      return isAfter(expiryDate, new Date()) && isBefore(expiryDate, thirtyDaysFromNow);
    }).length;

    // Count by category
    const categoryCounts: Record<string, number> = {};
    items.forEach(item => {
      const categoryId = item.category_id || 'uncategorized';
      categoryCounts[categoryId] = (categoryCounts[categoryId] || 0) + 1;
    });

    return {
      totalItems,
      totalValue,
      inStockCount,
      lowStockCount,
      outOfStockCount,
      expiringCount,
      categoryCounts,
    };
  }, [items]);

  // Get low stock items
  const lowStockItems = useMemo(() => {
    return items.filter(item => 
      item.quantity > 0 && item.quantity <= item.min_stock_level
    );
  }, [items]);

  // Get expiring items
  const expiringItems = useMemo(() => {
    const thirtyDaysFromNow = addDays(new Date(), 30);
    return items.filter(item => {
      if (!item.expiry_date) return false;
      const expiryDate = new Date(item.expiry_date);
      return isAfter(expiryDate, new Date()) && isBefore(expiryDate, thirtyDaysFromNow);
    });
  }, [items]);

  // Get out of stock items
  const outOfStockItems = useMemo(() => {
    return items.filter(item => item.quantity === 0);
  }, [items]);

  return {
    stats,
    lowStockItems,
    expiringItems,
    outOfStockItems,
    isLoading,
  };
}
