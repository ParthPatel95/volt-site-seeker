import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { InventoryGroup, InventoryGroupItem, InventoryGroupWithItems } from '../types/group.types';
import { generateGroupCode } from '@/utils/codeGenerator';

export function useInventoryGroups(projectId: string | null) {
  const queryClient = useQueryClient();

  // Fetch all groups for a project
  const {
    data: groups = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ['inventory-groups', projectId],
    queryFn: async () => {
      if (!projectId) return [];

      const { data, error } = await supabase
        .from('inventory_groups')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as InventoryGroup[];
    },
    enabled: !!projectId,
  });

  // Fetch a single group with its items
  const fetchGroupWithItems = async (groupId: string): Promise<InventoryGroupWithItems | null> => {
    const { data: group, error: groupError } = await supabase
      .from('inventory_groups')
      .select('*')
      .eq('id', groupId)
      .single();

    if (groupError) {
      console.error('Error fetching group:', groupError);
      return null;
    }

    const { data: groupItems, error: itemsError } = await supabase
      .from('inventory_group_items')
      .select(`
        *,
        item:inventory_items(*)
      `)
      .eq('group_id', groupId);

    if (itemsError) {
      console.error('Error fetching group items:', itemsError);
      return null;
    }

    const items = groupItems as InventoryGroupItem[];
    const totalItems = items.reduce((sum, gi) => sum + gi.quantity, 0);
    const totalValue = items.reduce((sum, gi) => {
      const itemValue = gi.item?.unit_cost || 0;
      return sum + (itemValue * gi.quantity);
    }, 0);

    return {
      ...group,
      items,
      total_items: totalItems,
      total_value: totalValue,
    } as InventoryGroupWithItems;
  };

  // Create group mutation
  const createGroupMutation = useMutation({
    mutationFn: async (group: Omit<InventoryGroup, 'id' | 'created_at' | 'updated_at' | 'group_code'>) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      const groupCode = generateGroupCode();
      
      const { data, error } = await supabase
        .from('inventory_groups')
        .insert({
          ...group,
          group_code: groupCode,
          created_by: user?.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data as InventoryGroup;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory-groups', projectId] });
      toast.success('Group created');
    },
    onError: (error) => {
      toast.error(`Failed to create group: ${error.message}`);
    },
  });

  // Update group mutation
  const updateGroupMutation = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<InventoryGroup> & { id: string }) => {
      const { data, error } = await supabase
        .from('inventory_groups')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as InventoryGroup;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory-groups', projectId] });
      toast.success('Group updated');
    },
    onError: (error) => {
      toast.error(`Failed to update group: ${error.message}`);
    },
  });

  // Delete group mutation
  const deleteGroupMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('inventory_groups')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory-groups', projectId] });
      toast.success('Group deleted');
    },
    onError: (error) => {
      toast.error(`Failed to delete group: ${error.message}`);
    },
  });

  // Add item to group mutation
  const addItemToGroupMutation = useMutation({
    mutationFn: async ({ groupId, itemId, quantity = 1 }: { groupId: string; itemId: string; quantity?: number }) => {
      const { data, error } = await supabase
        .from('inventory_group_items')
        .upsert(
          { group_id: groupId, item_id: itemId, quantity },
          { onConflict: 'group_id,item_id' }
        )
        .select()
        .single();

      if (error) throw error;
      return data as InventoryGroupItem;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory-groups', projectId] });
      toast.success('Item added to group');
    },
    onError: (error) => {
      toast.error(`Failed to add item to group: ${error.message}`);
    },
  });

  // Remove item from group mutation
  const removeItemFromGroupMutation = useMutation({
    mutationFn: async ({ groupId, itemId }: { groupId: string; itemId: string }) => {
      const { error } = await supabase
        .from('inventory_group_items')
        .delete()
        .eq('group_id', groupId)
        .eq('item_id', itemId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory-groups', projectId] });
      toast.success('Item removed from group');
    },
    onError: (error) => {
      toast.error(`Failed to remove item from group: ${error.message}`);
    },
  });

  // Update item quantity in group
  const updateGroupItemQuantityMutation = useMutation({
    mutationFn: async ({ groupId, itemId, quantity }: { groupId: string; itemId: string; quantity: number }) => {
      const { data, error } = await supabase
        .from('inventory_group_items')
        .update({ quantity })
        .eq('group_id', groupId)
        .eq('item_id', itemId)
        .select()
        .single();

      if (error) throw error;
      return data as InventoryGroupItem;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory-groups', projectId] });
    },
    onError: (error) => {
      toast.error(`Failed to update quantity: ${error.message}`);
    },
  });

  return {
    groups,
    isLoading,
    error,
    fetchGroupWithItems,
    createGroup: createGroupMutation.mutate,
    updateGroup: updateGroupMutation.mutate,
    deleteGroup: deleteGroupMutation.mutate,
    addItemToGroup: addItemToGroupMutation.mutate,
    removeItemFromGroup: removeItemFromGroupMutation.mutate,
    updateGroupItemQuantity: updateGroupItemQuantityMutation.mutate,
    isCreating: createGroupMutation.isPending,
    isUpdating: updateGroupMutation.isPending,
    isDeleting: deleteGroupMutation.isPending,
  };
}
