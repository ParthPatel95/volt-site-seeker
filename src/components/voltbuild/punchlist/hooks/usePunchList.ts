import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export type PunchPriority = 'A' | 'B' | 'C';
export type PunchStatus = 'open' | 'in_progress' | 'complete' | 'verified';

export interface PunchItem {
  id: string;
  project_id: string;
  phase_id: string | null;
  item_number: string | null;
  description: string;
  location: string | null;
  responsible_party: string | null;
  priority: PunchPriority;
  status: PunchStatus;
  identified_date: string;
  due_date: string | null;
  completed_date: string | null;
  verified_by: string | null;
  verified_date: string | null;
  photos: { name: string; url: string }[];
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export const PUNCH_PRIORITY_CONFIG: Record<PunchPriority, { label: string; description: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  A: { label: 'A - Critical', description: 'Safety or functional issue', variant: 'destructive' },
  B: { label: 'B - Functional', description: 'Affects operation', variant: 'default' },
  C: { label: 'C - Cosmetic', description: 'Appearance only', variant: 'outline' },
};

export const PUNCH_STATUS_CONFIG: Record<PunchStatus, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  open: { label: 'Open', variant: 'destructive' },
  in_progress: { label: 'In Progress', variant: 'default' },
  complete: { label: 'Complete', variant: 'secondary' },
  verified: { label: 'Verified', variant: 'outline' },
};

export function usePunchList(projectId: string | null) {
  const queryClient = useQueryClient();

  const { data: punchItems = [], isLoading } = useQuery({
    queryKey: ['voltbuild-punch-items', projectId],
    queryFn: async () => {
      if (!projectId) return [];
      const { data, error } = await supabase
        .from('voltbuild_punch_items')
        .select('*')
        .eq('project_id', projectId)
        .order('priority', { ascending: true })
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as PunchItem[];
    },
    enabled: !!projectId,
  });

  const createMutation = useMutation({
    mutationFn: async (item: Omit<PunchItem, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('voltbuild_punch_items')
        .insert(item)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['voltbuild-punch-items', projectId] });
      toast.success('Punch item created');
    },
    onError: () => toast.error('Failed to create punch item'),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<PunchItem> & { id: string }) => {
      const { error } = await supabase
        .from('voltbuild_punch_items')
        .update(updates)
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['voltbuild-punch-items', projectId] });
      toast.success('Punch item updated');
    },
    onError: () => toast.error('Failed to update punch item'),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('voltbuild_punch_items')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['voltbuild-punch-items', projectId] });
      toast.success('Punch item deleted');
    },
    onError: () => toast.error('Failed to delete punch item'),
  });

  const generateItemNumber = () => {
    const nextNum = punchItems.length + 1;
    return `PL-${String(nextNum).padStart(4, '0')}`;
  };

  const getStats = () => {
    const open = punchItems.filter(i => i.status === 'open').length;
    const inProgress = punchItems.filter(i => i.status === 'in_progress').length;
    const complete = punchItems.filter(i => i.status === 'complete').length;
    const verified = punchItems.filter(i => i.status === 'verified').length;
    const priorityA = punchItems.filter(i => i.priority === 'A' && i.status !== 'verified').length;

    return { total: punchItems.length, open, inProgress, complete, verified, priorityA };
  };

  return {
    punchItems,
    isLoading,
    createPunchItem: createMutation.mutate,
    updatePunchItem: updateMutation.mutate,
    deletePunchItem: deleteMutation.mutate,
    generateItemNumber,
    getStats,
    isCreating: createMutation.isPending,
  };
}
