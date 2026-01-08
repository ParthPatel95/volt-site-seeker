import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface TaskDependency {
  id: string;
  project_id: string;
  predecessor_task_id: string;
  successor_task_id: string;
  dependency_type: 'finish_to_start' | 'start_to_start' | 'finish_to_finish' | 'start_to_finish';
  lag_days: number;
  created_at: string;
}

export function useTaskDependencies(projectId: string | null) {
  const queryClient = useQueryClient();

  const { data: dependencies = [], isLoading } = useQuery({
    queryKey: ['voltbuild-dependencies', projectId],
    queryFn: async () => {
      if (!projectId) return [];

      const { data, error } = await supabase
        .from('voltbuild_task_dependencies')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data as TaskDependency[];
    },
    enabled: !!projectId,
  });

  const createDependency = useMutation({
    mutationFn: async ({
      predecessorTaskId,
      successorTaskId,
      dependencyType = 'finish_to_start',
      lagDays = 0,
    }: {
      predecessorTaskId: string;
      successorTaskId: string;
      dependencyType?: TaskDependency['dependency_type'];
      lagDays?: number;
    }) => {
      if (!projectId) throw new Error('No project selected');

      // Check for circular dependencies
      const existingReverse = dependencies.find(
        d => d.predecessor_task_id === successorTaskId && d.successor_task_id === predecessorTaskId
      );
      if (existingReverse) {
        throw new Error('This would create a circular dependency');
      }

      // Check if dependency already exists
      const existing = dependencies.find(
        d => d.predecessor_task_id === predecessorTaskId && d.successor_task_id === successorTaskId
      );
      if (existing) {
        throw new Error('This dependency already exists');
      }

      const { data, error } = await supabase
        .from('voltbuild_task_dependencies')
        .insert({
          project_id: projectId,
          predecessor_task_id: predecessorTaskId,
          successor_task_id: successorTaskId,
          dependency_type: dependencyType,
          lag_days: lagDays,
        })
        .select()
        .single();

      if (error) throw error;
      return data as TaskDependency;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['voltbuild-dependencies', projectId] });
      toast.success('Dependency created');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create dependency');
    },
  });

  const deleteDependency = useMutation({
    mutationFn: async (dependencyId: string) => {
      const { error } = await supabase
        .from('voltbuild_task_dependencies')
        .delete()
        .eq('id', dependencyId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['voltbuild-dependencies', projectId] });
      toast.success('Dependency removed');
    },
    onError: () => {
      toast.error('Failed to remove dependency');
    },
  });

  const updateDependency = useMutation({
    mutationFn: async ({
      id,
      dependencyType,
      lagDays,
    }: {
      id: string;
      dependencyType?: TaskDependency['dependency_type'];
      lagDays?: number;
    }) => {
      const updates: Partial<Pick<TaskDependency, 'dependency_type' | 'lag_days'>> = {};
      if (dependencyType) updates.dependency_type = dependencyType;
      if (lagDays !== undefined) updates.lag_days = lagDays;

      const { data, error } = await supabase
        .from('voltbuild_task_dependencies')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as TaskDependency;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['voltbuild-dependencies', projectId] });
      toast.success('Dependency updated');
    },
    onError: () => {
      toast.error('Failed to update dependency');
    },
  });

  return {
    dependencies,
    isLoading,
    createDependency: createDependency.mutate,
    deleteDependency: deleteDependency.mutate,
    updateDependency: updateDependency.mutate,
    isCreating: createDependency.isPending,
    isDeleting: deleteDependency.isPending,
  };
}
