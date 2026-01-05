import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { VoltBuildRisk, RiskSeverity, RiskStatus } from '../types/voltbuild.types';
import { toast } from 'sonner';

export function useVoltBuildRisks(projectId: string | null) {
  const queryClient = useQueryClient();

  const risksQuery = useQuery({
    queryKey: ['voltbuild-risks', projectId],
    queryFn: async (): Promise<VoltBuildRisk[]> => {
      if (!projectId) return [];

      const { data, error } = await supabase
        .from('voltbuild_risks')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []) as VoltBuildRisk[];
    },
    enabled: !!projectId,
  });

  const createRiskMutation = useMutation({
    mutationFn: async (risk: {
      project_id: string;
      phase_id?: string;
      title: string;
      description?: string;
      severity: RiskSeverity;
      mitigation_plan?: string;
      owner?: string;
    }) => {
      const { data, error } = await supabase
        .from('voltbuild_risks')
        .insert({
          project_id: risk.project_id,
          phase_id: risk.phase_id || null,
          title: risk.title,
          description: risk.description || null,
          severity: risk.severity,
          mitigation_plan: risk.mitigation_plan || null,
          owner: risk.owner || null,
          status: 'open' as RiskStatus,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['voltbuild-risks', projectId] });
      toast.success('Risk added');
    },
    onError: (error: Error) => {
      toast.error(`Failed to add risk: ${error.message}`);
    },
  });

  const updateRiskMutation = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<VoltBuildRisk> & { id: string }) => {
      const { data, error } = await supabase
        .from('voltbuild_risks')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['voltbuild-risks', projectId] });
      toast.success('Risk updated');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update risk: ${error.message}`);
    },
  });

  const deleteRiskMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('voltbuild_risks')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['voltbuild-risks', projectId] });
      toast.success('Risk removed');
    },
    onError: (error: Error) => {
      toast.error(`Failed to remove risk: ${error.message}`);
    },
  });

  const updateRiskStatus = async (riskId: string, status: RiskStatus) => {
    updateRiskMutation.mutate({ id: riskId, status });
  };

  // Get risks by phase
  const getRisksByPhase = (phaseId: string) => {
    return (risksQuery.data || []).filter(risk => risk.phase_id === phaseId);
  };

  // Get open high-severity risks
  const getHighSeverityRisks = () => {
    return (risksQuery.data || []).filter(
      risk => risk.severity === 'high' && risk.status === 'open'
    );
  };

  return {
    risks: risksQuery.data || [],
    isLoading: risksQuery.isLoading,
    error: risksQuery.error,
    createRisk: createRiskMutation.mutate,
    updateRisk: updateRiskMutation.mutate,
    deleteRisk: deleteRiskMutation.mutate,
    updateRiskStatus,
    getRisksByPhase,
    getHighSeverityRisks,
    isCreating: createRiskMutation.isPending,
    isUpdating: updateRiskMutation.isPending,
    isDeleting: deleteRiskMutation.isPending,
  };
}
