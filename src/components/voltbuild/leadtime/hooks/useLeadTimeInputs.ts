import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { LeadTimeProjectInput } from '../../types/voltbuild-advanced.types';
import { toast } from 'sonner';

export function useLeadTimeInputs(projectId: string | null) {
  const queryClient = useQueryClient();

  const inputsQuery = useQuery({
    queryKey: ['leadtime-inputs', projectId],
    queryFn: async (): Promise<LeadTimeProjectInput | null> => {
      if (!projectId) return null;

      const { data, error } = await supabase
        .from('leadtime_project_inputs')
        .select('*')
        .eq('project_id', projectId)
        .maybeSingle();

      if (error) throw error;
      return data as LeadTimeProjectInput | null;
    },
    enabled: !!projectId,
  });

  const upsertInputsMutation = useMutation({
    mutationFn: async (inputs: Partial<LeadTimeProjectInput> & { project_id: string }) => {
      // Check if exists
      const { data: existing } = await supabase
        .from('leadtime_project_inputs')
        .select('id')
        .eq('project_id', inputs.project_id)
        .maybeSingle();

      if (existing) {
        // Update
        const { data, error } = await supabase
          .from('leadtime_project_inputs')
          .update({
            jurisdiction: inputs.jurisdiction,
            utility: inputs.utility,
            requested_mw: inputs.requested_mw,
            voltage_level: inputs.voltage_level,
            interconnection_type: inputs.interconnection_type,
            transformer_required: inputs.transformer_required,
            substation_upgrade_required: inputs.substation_upgrade_required,
            permitting_complexity: inputs.permitting_complexity,
            site_type: inputs.site_type,
            target_rfs_date: inputs.target_rfs_date,
          })
          .eq('project_id', inputs.project_id)
          .select()
          .single();

        if (error) throw error;
        return data;
      } else {
        // Insert
        const { data, error } = await supabase
          .from('leadtime_project_inputs')
          .insert({
            project_id: inputs.project_id,
            jurisdiction: inputs.jurisdiction,
            utility: inputs.utility,
            requested_mw: inputs.requested_mw,
            voltage_level: inputs.voltage_level,
            interconnection_type: inputs.interconnection_type,
            transformer_required: inputs.transformer_required ?? false,
            substation_upgrade_required: inputs.substation_upgrade_required ?? false,
            permitting_complexity: inputs.permitting_complexity,
            site_type: inputs.site_type,
            target_rfs_date: inputs.target_rfs_date,
          })
          .select()
          .single();

        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leadtime-inputs', projectId] });
      toast.success('Inputs saved');
    },
    onError: (error: Error) => {
      toast.error(`Failed to save inputs: ${error.message}`);
    },
  });

  return {
    inputs: inputsQuery.data,
    isLoading: inputsQuery.isLoading,
    error: inputsQuery.error,
    upsertInputs: upsertInputsMutation.mutate,
    isUpdating: upsertInputsMutation.isPending,
  };
}
