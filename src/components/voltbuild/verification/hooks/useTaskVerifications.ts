import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { TaskVerification, VerificationFormData } from '../../types/voltbuild-phase3.types';
import { toast } from 'sonner';

export function useTaskVerifications(projectId: string) {
  const queryClient = useQueryClient();

  const { data: verifications = [], isLoading } = useQuery({
    queryKey: ['voltbuild-verifications', projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('voltbuild_task_verifications')
        .select('*')
        .eq('project_id', projectId)
        .order('submitted_at', { ascending: false });

      if (error) throw error;
      return data as TaskVerification[];
    },
    enabled: !!projectId,
  });

  const submitMutation = useMutation({
    mutationFn: async (data: VerificationFormData) => {
      const { data: user } = await supabase.auth.getUser();
      const { error } = await supabase
        .from('voltbuild_task_verifications')
        .insert({
          project_id: projectId,
          task_id: data.task_id,
          phase_id: data.phase_id,
          verification_type: data.verification_type,
          file_url: data.file_url,
          notes: data.notes,
          submitted_by: user.user?.id,
          status: 'submitted',
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['voltbuild-verifications', projectId] });
      toast.success('Evidence submitted for review');
    },
    onError: (error) => {
      toast.error('Failed to submit evidence');
      console.error(error);
    },
  });

  const approveMutation = useMutation({
    mutationFn: async (id: string) => {
      const { data: user } = await supabase.auth.getUser();
      const { error } = await supabase
        .from('voltbuild_task_verifications')
        .update({
          status: 'approved',
          approved_by: user.user?.id,
          approved_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['voltbuild-verifications', projectId] });
      toast.success('Verification approved');
    },
    onError: (error) => {
      toast.error('Failed to approve verification');
      console.error(error);
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason: string }) => {
      const { data: user } = await supabase.auth.getUser();
      const { error } = await supabase
        .from('voltbuild_task_verifications')
        .update({
          status: 'rejected',
          approved_by: user.user?.id,
          approved_at: new Date().toISOString(),
          rejection_reason: reason,
        })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['voltbuild-verifications', projectId] });
      toast.success('Verification rejected');
    },
    onError: (error) => {
      toast.error('Failed to reject verification');
      console.error(error);
    },
  });

  return {
    verifications,
    isLoading,
    submitVerification: submitMutation.mutateAsync,
    approveVerification: approveMutation.mutateAsync,
    rejectVerification: rejectMutation.mutateAsync,
    isSubmitting: submitMutation.isPending,
  };
}
