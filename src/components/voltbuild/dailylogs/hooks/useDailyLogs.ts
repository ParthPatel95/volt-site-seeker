import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { DailyLog, DailyLogMedia, DailyLogFormData } from '../../types/voltbuild-phase3.types';
import { toast } from 'sonner';

export function useDailyLogs(projectId: string) {
  const queryClient = useQueryClient();

  const { data: dailyLogs = [], isLoading } = useQuery({
    queryKey: ['voltbuild-daily-logs', projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('voltbuild_daily_logs')
        .select('*')
        .eq('project_id', projectId)
        .order('date', { ascending: false });

      if (error) throw error;
      return data as DailyLog[];
    },
    enabled: !!projectId,
  });

  const createMutation = useMutation({
    mutationFn: async (data: DailyLogFormData) => {
      const { data: user } = await supabase.auth.getUser();
      const { data: newLog, error } = await supabase
        .from('voltbuild_daily_logs')
        .insert({
          project_id: projectId,
          created_by: user.user?.id,
          ...data,
        })
        .select()
        .single();

      if (error) throw error;
      return newLog;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['voltbuild-daily-logs', projectId] });
      toast.success('Daily log created');
    },
    onError: (error) => {
      toast.error('Failed to create daily log');
      console.error(error);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...data }: Partial<DailyLogFormData> & { id: string }) => {
      const { error } = await supabase
        .from('voltbuild_daily_logs')
        .update({ ...data, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['voltbuild-daily-logs', projectId] });
      toast.success('Daily log updated');
    },
    onError: (error) => {
      toast.error('Failed to update daily log');
      console.error(error);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('voltbuild_daily_logs')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['voltbuild-daily-logs', projectId] });
      toast.success('Daily log deleted');
    },
    onError: (error) => {
      toast.error('Failed to delete daily log');
      console.error(error);
    },
  });

  return {
    dailyLogs,
    isLoading,
    createDailyLog: createMutation.mutateAsync,
    updateDailyLog: updateMutation.mutateAsync,
    deleteDailyLog: deleteMutation.mutateAsync,
    isCreating: createMutation.isPending,
  };
}

export function useDailyLogMedia(dailyLogId: string) {
  const queryClient = useQueryClient();

  const { data: media = [], isLoading } = useQuery({
    queryKey: ['voltbuild-daily-log-media', dailyLogId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('voltbuild_daily_log_media')
        .select('*')
        .eq('daily_log_id', dailyLogId)
        .order('uploaded_at', { ascending: false });

      if (error) throw error;
      return data as DailyLogMedia[];
    },
    enabled: !!dailyLogId,
  });

  const addMutation = useMutation({
    mutationFn: async (data: { daily_log_id: string; file_url: string; caption?: string; type: 'photo' | 'video' | 'file' }) => {
      const { data: user } = await supabase.auth.getUser();
      const { error } = await supabase
        .from('voltbuild_daily_log_media')
        .insert({
          ...data,
          uploaded_by: user.user?.id,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['voltbuild-daily-log-media', dailyLogId] });
      toast.success('Media added');
    },
    onError: (error) => {
      toast.error('Failed to add media');
      console.error(error);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('voltbuild_daily_log_media')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['voltbuild-daily-log-media', dailyLogId] });
      toast.success('Media removed');
    },
    onError: (error) => {
      toast.error('Failed to remove media');
      console.error(error);
    },
  });

  return {
    media,
    isLoading,
    addMedia: addMutation.mutateAsync,
    deleteMedia: deleteMutation.mutateAsync,
    isAdding: addMutation.isPending,
  };
}
