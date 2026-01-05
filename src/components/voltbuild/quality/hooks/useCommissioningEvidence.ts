import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { CommissioningEvidence } from '../../types/voltbuild-phase2.types';
import { toast } from 'sonner';

export function useCommissioningEvidence(checklistId: string | null) {
  const queryClient = useQueryClient();

  const evidenceQuery = useQuery({
    queryKey: ['commissioning-evidence', checklistId],
    queryFn: async (): Promise<CommissioningEvidence[]> => {
      if (!checklistId) return [];

      const { data, error } = await supabase
        .from('commissioning_evidence')
        .select('*')
        .eq('checklist_id', checklistId)
        .order('item_index', { ascending: true });

      if (error) throw error;
      return (data || []) as CommissioningEvidence[];
    },
    enabled: !!checklistId,
  });

  const createEvidenceMutation = useMutation({
    mutationFn: async (evidence: Omit<CommissioningEvidence, 'id' | 'uploaded_at'>) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from('commissioning_evidence')
        .insert({
          ...evidence,
          uploaded_by: user?.id || null,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['commissioning-evidence', checklistId] });
      toast.success('Evidence uploaded successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to upload evidence: ${error.message}`);
    },
  });

  const updateEvidenceMutation = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<CommissioningEvidence> & { id: string }) => {
      const { data, error } = await supabase
        .from('commissioning_evidence')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['commissioning-evidence', checklistId] });
      toast.success('Evidence updated successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update evidence: ${error.message}`);
    },
  });

  const deleteEvidenceMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('commissioning_evidence')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['commissioning-evidence', checklistId] });
      toast.success('Evidence deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete evidence: ${error.message}`);
    },
  });

  // Get evidence for a specific item
  const getEvidenceForItem = (itemIndex: number) => {
    return (evidenceQuery.data || []).filter(e => e.item_index === itemIndex);
  };

  return {
    evidence: evidenceQuery.data || [],
    isLoading: evidenceQuery.isLoading,
    error: evidenceQuery.error,
    createEvidence: createEvidenceMutation.mutate,
    updateEvidence: updateEvidenceMutation.mutate,
    deleteEvidence: deleteEvidenceMutation.mutate,
    getEvidenceForItem,
    isCreating: createEvidenceMutation.isPending,
    isUpdating: updateEvidenceMutation.isPending,
    isDeleting: deleteEvidenceMutation.isPending,
  };
}
