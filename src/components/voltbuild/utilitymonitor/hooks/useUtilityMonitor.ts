import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { UtilityStatusUpdate, UtilityAlert, UtilityStatusFormData, UtilityStatus } from '../../types/voltbuild-phase3.types';
import { toast } from 'sonner';

export function useUtilityMonitor(projectId: string) {
  const queryClient = useQueryClient();

  const { data: utilityStatuses = [], isLoading: statusLoading } = useQuery({
    queryKey: ['voltbuild-utility-status', projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('voltbuild_utility_status')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data as UtilityStatusUpdate[];
    },
    enabled: !!projectId,
  });

  const { data: alerts = [], isLoading: alertsLoading } = useQuery({
    queryKey: ['voltbuild-utility-alerts', projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('voltbuild_utility_alerts')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as UtilityAlert[];
    },
    enabled: !!projectId,
  });

  const createMutation = useMutation({
    mutationFn: async (data: UtilityStatusFormData) => {
      const { error } = await supabase
        .from('voltbuild_utility_status')
        .insert({
          project_id: projectId,
          utility: data.utility,
          milestone: data.milestone,
          status: data.status || 'not_started',
          notes: data.notes,
          last_update_date: new Date().toISOString().split('T')[0],
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['voltbuild-utility-status', projectId] });
      toast.success('Milestone added');
    },
    onError: (error) => {
      toast.error('Failed to add milestone');
      console.error(error);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...data }: { id: string; status?: UtilityStatus; notes?: string; last_update_date?: string }) => {
      const { error } = await supabase
        .from('voltbuild_utility_status')
        .update({
          ...data,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['voltbuild-utility-status', projectId] });
      toast.success('Status updated');
    },
    onError: (error) => {
      toast.error('Failed to update status');
      console.error(error);
    },
  });

  const resolveAlertMutation = useMutation({
    mutationFn: async (alertId: string) => {
      const { error } = await supabase
        .from('voltbuild_utility_alerts')
        .update({ resolved_at: new Date().toISOString() })
        .eq('id', alertId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['voltbuild-utility-alerts', projectId] });
      toast.success('Alert resolved');
    },
    onError: (error) => {
      toast.error('Failed to resolve alert');
      console.error(error);
    },
  });

  return {
    utilityStatuses,
    alerts,
    isLoading: statusLoading || alertsLoading,
    createStatus: createMutation.mutateAsync,
    updateStatus: updateMutation.mutateAsync,
    resolveAlert: resolveAlertMutation.mutateAsync,
    isCreating: createMutation.isPending,
  };
}
