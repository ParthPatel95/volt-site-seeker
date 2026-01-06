import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { SafetyToolboxTalk, SafetyIncident, PermitLog, ToolboxTalkFormData, IncidentFormData, PermitFormData, Attendee, Attachment, IncidentSeverity, IncidentStatus } from '../../types/voltbuild-phase3.types';
import { toast } from 'sonner';

export function useSafety(projectId: string) {
  const queryClient = useQueryClient();

  const { data: toolboxTalks = [], isLoading: talksLoading } = useQuery({
    queryKey: ['voltbuild-toolbox-talks', projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('voltbuild_safety_toolbox_talks')
        .select('*')
        .eq('project_id', projectId)
        .order('date', { ascending: false });
      if (error) throw error;
      return (data || []).map(d => ({
        ...d,
        attendees: (d.attendees || []) as unknown as Attendee[],
        attachments: (d.attachments || []) as unknown as Attachment[],
      })) as SafetyToolboxTalk[];
    },
    enabled: !!projectId,
  });

  const { data: incidents = [], isLoading: incidentsLoading } = useQuery({
    queryKey: ['voltbuild-incidents', projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('voltbuild_safety_incidents')
        .select('*')
        .eq('project_id', projectId)
        .order('date', { ascending: false });
      if (error) throw error;
      return (data || []).map(d => ({
        ...d,
        severity: d.severity as IncidentSeverity,
        status: d.status as IncidentStatus,
        attachments: (d.attachments || []) as unknown as Attachment[],
      })) as SafetyIncident[];
    },
    enabled: !!projectId,
  });

  const { data: permits = [], isLoading: permitsLoading } = useQuery({
    queryKey: ['voltbuild-permits', projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('voltbuild_permit_logs')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as PermitLog[];
    },
    enabled: !!projectId,
  });

  const createTalkMutation = useMutation({
    mutationFn: async (data: ToolboxTalkFormData) => {
      const { error } = await supabase
        .from('voltbuild_safety_toolbox_talks')
        .insert({
          project_id: projectId,
          date: data.date,
          topic: data.topic,
          conducted_by_name: data.conducted_by_name,
          attendees: (data.attendees || []) as any,
          notes: data.notes,
        });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['voltbuild-toolbox-talks', projectId] });
      toast.success('Toolbox talk recorded');
    },
  });

  const createIncidentMutation = useMutation({
    mutationFn: async (data: IncidentFormData) => {
      const { error } = await supabase
        .from('voltbuild_safety_incidents')
        .insert({
          project_id: projectId,
          date: data.date,
          severity: data.severity,
          description: data.description,
          immediate_actions: data.immediate_actions,
          reported_by_name: data.reported_by_name,
        });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['voltbuild-incidents', projectId] });
      toast.success('Incident reported');
    },
  });

  const createPermitMutation = useMutation({
    mutationFn: async (data: PermitFormData) => {
      const { error } = await supabase
        .from('voltbuild_permit_logs')
        .insert({
          project_id: projectId,
          permit_name: data.permit_name,
          authority: data.authority,
          submitted_date: data.submitted_date,
          approved_date: data.approved_date,
          expiry_date: data.expiry_date,
          status: data.status,
          file_url: data.file_url,
          notes: data.notes,
        });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['voltbuild-permits', projectId] });
      toast.success('Permit added');
    },
  });

  return {
    toolboxTalks,
    incidents,
    permits,
    isLoading: talksLoading || incidentsLoading || permitsLoading,
    createToolboxTalk: createTalkMutation.mutateAsync,
    createIncident: createIncidentMutation.mutateAsync,
    createPermit: createPermitMutation.mutateAsync,
  };
}
