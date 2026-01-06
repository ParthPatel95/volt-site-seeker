import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { FieldCheckin, FieldCheckinFormData } from '../../types/voltbuild-phase3.types';
import { toast } from 'sonner';

export function useFieldCheckins(projectId: string) {
  const queryClient = useQueryClient();

  const { data: checkins = [], isLoading } = useQuery({
    queryKey: ['voltbuild-field-checkins', projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('voltbuild_field_checkins')
        .select('*')
        .eq('project_id', projectId)
        .order('checkin_time', { ascending: false });

      if (error) throw error;
      return data as FieldCheckin[];
    },
    enabled: !!projectId,
  });

  // Get current user's active check-in
  const { data: activeCheckin } = useQuery({
    queryKey: ['voltbuild-active-checkin', projectId],
    queryFn: async () => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return null;

      const { data, error } = await supabase
        .from('voltbuild_field_checkins')
        .select('*')
        .eq('project_id', projectId)
        .eq('user_id', user.user.id)
        .is('checkout_time', null)
        .order('checkin_time', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      return data as FieldCheckin | null;
    },
    enabled: !!projectId,
  });

  const checkInMutation = useMutation({
    mutationFn: async (data: FieldCheckinFormData) => {
      const { data: user } = await supabase.auth.getUser();
      const { error } = await supabase
        .from('voltbuild_field_checkins')
        .insert({
          project_id: projectId,
          user_id: user.user?.id,
          user_name: data.user_name,
          coarse_location: data.coarse_location,
          method: data.method || 'manual',
          notes: data.notes,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['voltbuild-field-checkins', projectId] });
      queryClient.invalidateQueries({ queryKey: ['voltbuild-active-checkin', projectId] });
      toast.success('Checked in successfully');
    },
    onError: (error) => {
      toast.error('Failed to check in');
      console.error(error);
    },
  });

  const checkOutMutation = useMutation({
    mutationFn: async (checkinId: string) => {
      const { error } = await supabase
        .from('voltbuild_field_checkins')
        .update({ checkout_time: new Date().toISOString() })
        .eq('id', checkinId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['voltbuild-field-checkins', projectId] });
      queryClient.invalidateQueries({ queryKey: ['voltbuild-active-checkin', projectId] });
      toast.success('Checked out successfully');
    },
    onError: (error) => {
      toast.error('Failed to check out');
      console.error(error);
    },
  });

  return {
    checkins,
    isLoading,
    activeCheckin,
    checkIn: checkInMutation.mutateAsync,
    checkOut: checkOutMutation.mutateAsync,
    isCheckingIn: checkInMutation.isPending,
  };
}
