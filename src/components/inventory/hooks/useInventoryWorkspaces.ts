import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { InventoryWorkspace } from '../types/inventory.types';

export function useInventoryWorkspaces() {
  const queryClient = useQueryClient();

  // Fetch all workspaces for the current user
  const {
    data: workspaces = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ['inventory-workspaces'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('inventory_workspaces')
        .select('*')
        .eq('user_id', user.id)
        .order('name', { ascending: true });

      if (error) throw error;
      return (data || []) as InventoryWorkspace[];
    },
  });

  // Create workspace mutation
  const createWorkspaceMutation = useMutation({
    mutationFn: async (workspace: Omit<InventoryWorkspace, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Must be logged in');
      
      const { data, error } = await supabase
        .from('inventory_workspaces')
        .insert({
          ...workspace,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data as InventoryWorkspace;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory-workspaces'] });
      toast.success('Workspace created');
    },
    onError: (error) => {
      toast.error(`Failed to create workspace: ${error.message}`);
    },
  });

  // Update workspace mutation
  const updateWorkspaceMutation = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<InventoryWorkspace> & { id: string }) => {
      const { data, error } = await supabase
        .from('inventory_workspaces')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as InventoryWorkspace;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory-workspaces'] });
      toast.success('Workspace updated');
    },
    onError: (error) => {
      toast.error(`Failed to update workspace: ${error.message}`);
    },
  });

  // Delete workspace mutation
  const deleteWorkspaceMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('inventory_workspaces')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory-workspaces'] });
      toast.success('Workspace deleted');
    },
    onError: (error) => {
      toast.error(`Failed to delete workspace: ${error.message}`);
    },
  });

  return {
    workspaces,
    isLoading,
    error,
    createWorkspace: createWorkspaceMutation.mutate,
    updateWorkspace: updateWorkspaceMutation.mutate,
    deleteWorkspace: deleteWorkspaceMutation.mutate,
    isCreating: createWorkspaceMutation.isPending,
    isUpdating: updateWorkspaceMutation.isPending,
    isDeleting: deleteWorkspaceMutation.isPending,
  };
}
