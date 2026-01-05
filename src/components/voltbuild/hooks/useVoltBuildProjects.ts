import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { VoltBuildProject, ProjectStatus, DEFAULT_PHASES } from '../types/voltbuild.types';
import { toast } from 'sonner';

export function useVoltBuildProjects() {
  const queryClient = useQueryClient();

  const projectsQuery = useQuery({
    queryKey: ['voltbuild-projects'],
    queryFn: async (): Promise<VoltBuildProject[]> => {
      const { data, error } = await supabase
        .from('voltbuild_projects')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []) as VoltBuildProject[];
    },
  });

  const createProjectMutation = useMutation({
    mutationFn: async (project: {
      name: string;
      description?: string;
      target_mw?: number;
      cooling_type?: string;
      utility_iso?: string;
      location?: string;
      linked_site_id?: string;
      estimated_start_date?: string;
      estimated_end_date?: string;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Create the project
      const { data: newProject, error: projectError } = await supabase
        .from('voltbuild_projects')
        .insert({
          user_id: user.id,
          name: project.name,
          description: project.description || null,
          target_mw: project.target_mw || null,
          cooling_type: project.cooling_type || null,
          utility_iso: project.utility_iso || null,
          location: project.location || null,
          linked_site_id: project.linked_site_id || null,
          estimated_start_date: project.estimated_start_date || null,
          estimated_end_date: project.estimated_end_date || null,
          status: 'planning' as ProjectStatus,
          overall_progress: 0,
        })
        .select()
        .single();

      if (projectError) throw projectError;

      // Create default phases
      const phasesData = DEFAULT_PHASES.map((phase, index) => ({
        project_id: newProject.id,
        name: phase.name,
        description: phase.description,
        order_index: index,
        status: 'not_started' as const,
        progress: 0,
      }));

      const { data: phases, error: phasesError } = await supabase
        .from('voltbuild_phases')
        .insert(phasesData)
        .select();

      if (phasesError) throw phasesError;

      // Create default tasks for each phase
      const tasksData: Array<{
        phase_id: string;
        name: string;
        description: string;
        order_index: number;
        status: 'not_started';
        assigned_role: 'owner';
        is_critical_path: boolean;
        depends_on: string[];
      }> = [];

      phases.forEach((phase, phaseIndex) => {
        const phaseConfig = DEFAULT_PHASES[phaseIndex];
        phaseConfig.tasks.forEach((task, taskIndex) => {
          tasksData.push({
            phase_id: phase.id,
            name: task.name,
            description: task.description,
            order_index: taskIndex,
            status: 'not_started',
            assigned_role: 'owner',
            is_critical_path: false,
            depends_on: [],
          });
        });
      });

      const { error: tasksError } = await supabase
        .from('voltbuild_tasks')
        .insert(tasksData);

      if (tasksError) throw tasksError;

      return newProject;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['voltbuild-projects'] });
      toast.success('Project created successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to create project: ${error.message}`);
    },
  });

  const updateProjectMutation = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<VoltBuildProject> & { id: string }) => {
      const { data, error } = await supabase
        .from('voltbuild_projects')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['voltbuild-projects'] });
      toast.success('Project updated');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update project: ${error.message}`);
    },
  });

  const deleteProjectMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('voltbuild_projects')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['voltbuild-projects'] });
      toast.success('Project deleted');
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete project: ${error.message}`);
    },
  });

  return {
    projects: projectsQuery.data || [],
    isLoading: projectsQuery.isLoading,
    error: projectsQuery.error,
    createProject: createProjectMutation.mutate,
    updateProject: updateProjectMutation.mutate,
    deleteProject: deleteProjectMutation.mutate,
    isCreating: createProjectMutation.isPending,
    isUpdating: updateProjectMutation.isPending,
    isDeleting: deleteProjectMutation.isPending,
  };
}

export function useVoltBuildProject(projectId: string | null) {
  return useQuery({
    queryKey: ['voltbuild-project', projectId],
    queryFn: async (): Promise<VoltBuildProject | null> => {
      if (!projectId) return null;

      const { data, error } = await supabase
        .from('voltbuild_projects')
        .select('*')
        .eq('id', projectId)
        .single();

      if (error) throw error;
      return data as VoltBuildProject;
    },
    enabled: !!projectId,
  });
}
