import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { VoltBuildTask, TaskStatus, AssignedRole } from '../types/voltbuild.types';
import { toast } from 'sonner';

export function useVoltBuildTasks(phaseId: string | null) {
  const queryClient = useQueryClient();

  const tasksQuery = useQuery({
    queryKey: ['voltbuild-tasks', phaseId],
    queryFn: async (): Promise<VoltBuildTask[]> => {
      if (!phaseId) return [];

      const { data, error } = await supabase
        .from('voltbuild_tasks')
        .select('*')
        .eq('phase_id', phaseId)
        .order('order_index', { ascending: true });

      if (error) throw error;
      return (data || []) as VoltBuildTask[];
    },
    enabled: !!phaseId,
  });

  const createTaskMutation = useMutation({
    mutationFn: async (task: {
      phase_id: string;
      name: string;
      description?: string;
      assigned_role?: AssignedRole;
      estimated_duration_days?: number;
      is_critical_path?: boolean;
    }) => {
      // Get the current max order_index
      const { data: existingTasks } = await supabase
        .from('voltbuild_tasks')
        .select('order_index')
        .eq('phase_id', task.phase_id)
        .order('order_index', { ascending: false })
        .limit(1);

      const maxIndex = existingTasks?.[0]?.order_index ?? -1;

      const { data, error } = await supabase
        .from('voltbuild_tasks')
        .insert({
          phase_id: task.phase_id,
          name: task.name,
          description: task.description || null,
          assigned_role: task.assigned_role || 'owner',
          estimated_duration_days: task.estimated_duration_days || null,
          is_critical_path: task.is_critical_path || false,
          order_index: maxIndex + 1,
          status: 'not_started',
          depends_on: [],
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['voltbuild-tasks', phaseId] });
      toast.success('Task created');
    },
    onError: (error: Error) => {
      toast.error(`Failed to create task: ${error.message}`);
    },
  });

  const updateTaskMutation = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<VoltBuildTask> & { id: string }) => {
      const { data, error } = await supabase
        .from('voltbuild_tasks')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['voltbuild-tasks', phaseId] });
    },
    onError: (error: Error) => {
      toast.error(`Failed to update task: ${error.message}`);
    },
  });

  const deleteTaskMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('voltbuild_tasks')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['voltbuild-tasks', phaseId] });
      toast.success('Task deleted');
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete task: ${error.message}`);
    },
  });

  const updateTaskStatus = async (taskId: string, status: TaskStatus) => {
    updateTaskMutation.mutate({ id: taskId, status });
  };

  return {
    tasks: tasksQuery.data || [],
    isLoading: tasksQuery.isLoading,
    error: tasksQuery.error,
    createTask: createTaskMutation.mutate,
    updateTask: updateTaskMutation.mutate,
    deleteTask: deleteTaskMutation.mutate,
    updateTaskStatus,
    isCreating: createTaskMutation.isPending,
    isUpdating: updateTaskMutation.isPending,
    isDeleting: deleteTaskMutation.isPending,
  };
}

export function useAllProjectTasks(projectId: string | null) {
  return useQuery({
    queryKey: ['voltbuild-all-tasks', projectId],
    queryFn: async (): Promise<VoltBuildTask[]> => {
      if (!projectId) return [];

      // First get all phases for this project
      const { data: phases, error: phasesError } = await supabase
        .from('voltbuild_phases')
        .select('id')
        .eq('project_id', projectId);

      if (phasesError) throw phasesError;
      if (!phases || phases.length === 0) return [];

      const phaseIds = phases.map(p => p.id);

      // Then get all tasks for those phases
      const { data, error } = await supabase
        .from('voltbuild_tasks')
        .select('*')
        .in('phase_id', phaseIds)
        .order('order_index', { ascending: true });

      if (error) throw error;
      return (data || []) as VoltBuildTask[];
    },
    enabled: !!projectId,
  });
}
