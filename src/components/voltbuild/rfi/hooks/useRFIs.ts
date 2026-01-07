import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export type RFIStatus = 'open' | 'answered' | 'closed';
export type RFIPriority = 'critical' | 'high' | 'normal' | 'low';
export type RFIDiscipline = 'electrical' | 'civil' | 'structural' | 'mechanical' | 'architectural' | 'other';

export interface RFI {
  id: string;
  project_id: string;
  phase_id: string | null;
  rfi_number: string;
  subject: string;
  question: string;
  submitted_by: string | null;
  submitted_date: string;
  due_date: string | null;
  assigned_to: string | null;
  response: string | null;
  response_date: string | null;
  status: RFIStatus;
  priority: RFIPriority;
  discipline: RFIDiscipline | null;
  cost_impact: number | null;
  schedule_impact_days: number | null;
  attachments: { name: string; url: string }[];
  created_at: string;
  updated_at: string;
}

export const RFI_STATUS_CONFIG: Record<RFIStatus, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  open: { label: 'Open', variant: 'destructive' },
  answered: { label: 'Answered', variant: 'default' },
  closed: { label: 'Closed', variant: 'outline' },
};

export const RFI_PRIORITY_CONFIG: Record<RFIPriority, { label: string; color: string }> = {
  critical: { label: 'Critical', color: 'text-destructive' },
  high: { label: 'High', color: 'text-amber-500' },
  normal: { label: 'Normal', color: 'text-foreground' },
  low: { label: 'Low', color: 'text-muted-foreground' },
};

export const RFI_DISCIPLINES: RFIDiscipline[] = ['electrical', 'civil', 'structural', 'mechanical', 'architectural', 'other'];

export function useRFIs(projectId: string | null) {
  const queryClient = useQueryClient();

  const { data: rfis = [], isLoading } = useQuery({
    queryKey: ['voltbuild-rfis', projectId],
    queryFn: async () => {
      if (!projectId) return [];
      const { data, error } = await supabase
        .from('voltbuild_rfis')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as RFI[];
    },
    enabled: !!projectId,
  });

  const createMutation = useMutation({
    mutationFn: async (rfi: Omit<RFI, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('voltbuild_rfis')
        .insert(rfi)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['voltbuild-rfis', projectId] });
      toast.success('RFI created');
    },
    onError: () => toast.error('Failed to create RFI'),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<RFI> & { id: string }) => {
      const { error } = await supabase
        .from('voltbuild_rfis')
        .update(updates)
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['voltbuild-rfis', projectId] });
      toast.success('RFI updated');
    },
    onError: () => toast.error('Failed to update RFI'),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('voltbuild_rfis')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['voltbuild-rfis', projectId] });
      toast.success('RFI deleted');
    },
    onError: () => toast.error('Failed to delete RFI'),
  });

  const generateRFINumber = () => {
    const nextNum = rfis.length + 1;
    return `RFI-${String(nextNum).padStart(4, '0')}`;
  };

  const getStats = () => {
    const open = rfis.filter(r => r.status === 'open').length;
    const answered = rfis.filter(r => r.status === 'answered').length;
    const closed = rfis.filter(r => r.status === 'closed').length;
    const overdue = rfis.filter(r => 
      r.status === 'open' && 
      r.due_date && 
      new Date(r.due_date) < new Date()
    ).length;

    return { total: rfis.length, open, answered, closed, overdue };
  };

  return {
    rfis,
    isLoading,
    createRFI: createMutation.mutate,
    updateRFI: updateMutation.mutate,
    deleteRFI: deleteMutation.mutate,
    generateRFINumber,
    getStats,
    isCreating: createMutation.isPending,
  };
}
