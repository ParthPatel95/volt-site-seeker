import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { CapexPhaseLine } from '../../types/voltbuild-advanced.types';
import { toast } from 'sonner';

export function useCapexLines(projectId: string | null) {
  const queryClient = useQueryClient();

  const linesQuery = useQuery({
    queryKey: ['capex-lines', projectId],
    queryFn: async (): Promise<CapexPhaseLine[]> => {
      if (!projectId) return [];

      const { data, error } = await supabase
        .from('capex_phase_lines')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return (data || []) as CapexPhaseLine[];
    },
    enabled: !!projectId,
  });

  const createLineMutation = useMutation({
    mutationFn: async (line: {
      project_id: string;
      phase_id: string;
      task_id?: string;
      catalog_item_id?: string;
      item_name: string;
      quantity: number;
      unit: string;
      unit_cost: number;
      notes?: string;
    }) => {
      const { data, error } = await supabase
        .from('capex_phase_lines')
        .insert({
          project_id: line.project_id,
          phase_id: line.phase_id,
          task_id: line.task_id || null,
          catalog_item_id: line.catalog_item_id || null,
          item_name: line.item_name,
          quantity: line.quantity,
          unit: line.unit,
          unit_cost: line.unit_cost,
          notes: line.notes || null,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['capex-lines', projectId] });
      toast.success('Line item added');
    },
    onError: (error: Error) => {
      toast.error(`Failed to add line item: ${error.message}`);
    },
  });

  const updateLineMutation = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<CapexPhaseLine> & { id: string }) => {
      const { data, error } = await supabase
        .from('capex_phase_lines')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['capex-lines', projectId] });
    },
    onError: (error: Error) => {
      toast.error(`Failed to update line item: ${error.message}`);
    },
  });

  const deleteLineMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('capex_phase_lines')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['capex-lines', projectId] });
      toast.success('Line item deleted');
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete line item: ${error.message}`);
    },
  });

  // Group lines by phase
  const linesByPhase = (linesQuery.data || []).reduce((acc, line) => {
    if (!acc[line.phase_id]) {
      acc[line.phase_id] = [];
    }
    acc[line.phase_id].push(line);
    return acc;
  }, {} as Record<string, CapexPhaseLine[]>);

  return {
    lines: linesQuery.data || [],
    linesByPhase,
    isLoading: linesQuery.isLoading,
    error: linesQuery.error,
    createLine: createLineMutation.mutate,
    updateLine: updateLineMutation.mutate,
    deleteLine: deleteLineMutation.mutate,
    isCreating: createLineMutation.isPending,
    isUpdating: updateLineMutation.isPending,
    isDeleting: deleteLineMutation.isPending,
  };
}
