import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { VoltBuildPhase, PhaseStatus } from '../types/voltbuild.types';
import { toast } from 'sonner';

export function useVoltBuildPhases(projectId: string | null) {
  const queryClient = useQueryClient();

  const phasesQuery = useQuery({
    queryKey: ['voltbuild-phases', projectId],
    queryFn: async (): Promise<VoltBuildPhase[]> => {
      if (!projectId) return [];

      const { data, error } = await supabase
        .from('voltbuild_phases')
        .select('*')
        .eq('project_id', projectId)
        .order('order_index', { ascending: true });

      if (error) throw error;
      return (data || []) as VoltBuildPhase[];
    },
    enabled: !!projectId,
  });

  const updatePhaseMutation = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<VoltBuildPhase> & { id: string }) => {
      const { data, error } = await supabase
        .from('voltbuild_phases')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['voltbuild-phases', projectId] });
      queryClient.invalidateQueries({ queryKey: ['voltbuild-projects'] });
    },
    onError: (error: Error) => {
      toast.error(`Failed to update phase: ${error.message}`);
    },
  });

  const updatePhaseStatus = async (phaseId: string, status: PhaseStatus) => {
    updatePhaseMutation.mutate({ id: phaseId, status });
  };

  // Calculate and update project progress when phases change
  const recalculateProjectProgress = async () => {
    if (!projectId || !phasesQuery.data) return;

    const totalPhases = phasesQuery.data.length;
    if (totalPhases === 0) return;

    const totalProgress = phasesQuery.data.reduce((sum, phase) => sum + (phase.progress || 0), 0);
    const averageProgress = Math.round(totalProgress / totalPhases);

    await supabase
      .from('voltbuild_projects')
      .update({ overall_progress: averageProgress })
      .eq('id', projectId);

    queryClient.invalidateQueries({ queryKey: ['voltbuild-projects'] });
    queryClient.invalidateQueries({ queryKey: ['voltbuild-project', projectId] });
  };

  return {
    phases: phasesQuery.data || [],
    isLoading: phasesQuery.isLoading,
    error: phasesQuery.error,
    updatePhase: updatePhaseMutation.mutate,
    updatePhaseStatus,
    recalculateProjectProgress,
    isUpdating: updatePhaseMutation.isPending,
  };
}
