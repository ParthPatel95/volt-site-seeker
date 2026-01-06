import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { VoltBuildMilestone, TimelinePhase, TimelineMetrics, TimelineTask } from '../../types/voltbuild-timeline.types';
import { differenceInDays, parseISO, isAfter, isBefore } from 'date-fns';
import { toast } from 'sonner';

export function useTimelineData(projectId: string | null) {
  const queryClient = useQueryClient();

  // Fetch phases with tasks
  const { data: phases = [], isLoading: phasesLoading } = useQuery({
    queryKey: ['timeline-phases', projectId],
    queryFn: async () => {
      if (!projectId) return [];
      
      const { data: phasesData, error: phasesError } = await supabase
        .from('voltbuild_phases')
        .select('*')
        .eq('project_id', projectId)
        .order('order_index');

      if (phasesError) throw phasesError;

      const phasesWithTasks: TimelinePhase[] = await Promise.all(
        phasesData.map(async (phase) => {
          const { data: tasks } = await supabase
            .from('voltbuild_tasks')
            .select('*')
            .eq('phase_id', phase.id)
            .order('order_index');

          return {
            id: phase.id,
            name: phase.name,
            status: phase.status,
            progress: phase.progress || 0,
            estimated_start_date: phase.estimated_start_date,
            estimated_end_date: phase.estimated_end_date,
            order_index: phase.order_index,
            tasks: (tasks || []).map((task): TimelineTask => ({
              id: task.id,
              phase_id: task.phase_id,
              title: task.name,
              status: task.status,
              priority: 'medium', // Default priority since it's not in schema
              is_critical: task.is_critical_path,
              estimated_start_date: task.actual_start_date,
              estimated_end_date: task.actual_end_date,
              depends_on: task.depends_on?.length > 0 ? task.depends_on[0] : null,
              assigned_to: task.assigned_user_id,
              progress: task.status === 'complete' ? 100 : task.status === 'in_progress' ? 50 : 0,
              order_index: task.order_index,
            })),
          };
        })
      );

      return phasesWithTasks;
    },
    enabled: !!projectId,
  });

  // Fetch milestones
  const { data: milestones = [], isLoading: milestonesLoading } = useQuery({
    queryKey: ['timeline-milestones', projectId],
    queryFn: async () => {
      if (!projectId) return [];
      
      const { data, error } = await supabase
        .from('voltbuild_milestones')
        .select('*')
        .eq('project_id', projectId)
        .order('target_date');

      if (error) throw error;
      return data as VoltBuildMilestone[];
    },
    enabled: !!projectId,
  });

  // Fetch project for dates
  const { data: project } = useQuery({
    queryKey: ['timeline-project', projectId],
    queryFn: async () => {
      if (!projectId) return null;
      
      const { data, error } = await supabase
        .from('voltbuild_projects')
        .select('*')
        .eq('id', projectId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!projectId,
  });

  // Calculate metrics
  const metrics: TimelineMetrics = (() => {
    const allTasks = phases.flatMap(p => p.tasks);
    const today = new Date();
    
    const completedTasks = allTasks.filter(t => t.status === 'complete');
    const criticalTasks = allTasks.filter(t => t.is_critical);
    
    let tasksAtRisk = 0;
    let tasksDelayed = 0;
    
    allTasks.forEach(task => {
      if (task.status === 'complete') return;
      if (task.estimated_end_date) {
        const endDate = parseISO(task.estimated_end_date);
        if (isBefore(endDate, today)) {
          tasksDelayed++;
        } else if (differenceInDays(endDate, today) <= 7) {
          tasksAtRisk++;
        }
      }
    });

    const startDate = project?.estimated_start_date ? parseISO(project.estimated_start_date) : today;
    const endDate = project?.estimated_end_date ? parseISO(project.estimated_end_date) : today;
    const totalDuration = differenceInDays(endDate, startDate);
    const daysRemaining = Math.max(0, differenceInDays(endDate, today));

    const upcomingMilestones = milestones
      .filter(m => m.status === 'upcoming' && isAfter(parseISO(m.target_date), today))
      .sort((a, b) => parseISO(a.target_date).getTime() - parseISO(b.target_date).getTime());

    return {
      totalDuration,
      daysRemaining,
      percentComplete: allTasks.length > 0 
        ? Math.round((completedTasks.length / allTasks.length) * 100) 
        : 0,
      tasksOnTrack: allTasks.length - tasksAtRisk - tasksDelayed - completedTasks.length,
      tasksAtRisk,
      tasksDelayed,
      criticalPathTasks: criticalTasks.length,
      nextMilestone: upcomingMilestones[0] || null,
    };
  })();

  // Create milestone mutation
  const createMilestone = useMutation({
    mutationFn: async (milestone: Omit<VoltBuildMilestone, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('voltbuild_milestones')
        .insert(milestone)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timeline-milestones', projectId] });
      toast.success('Milestone created');
    },
    onError: () => {
      toast.error('Failed to create milestone');
    },
  });

  // Update task dates mutation
  const updateTaskDates = useMutation({
    mutationFn: async ({ taskId, startDate, endDate }: { taskId: string; startDate: string | null; endDate: string | null }) => {
      const { error } = await supabase
        .from('voltbuild_tasks')
        .update({ 
          estimated_start_date: startDate, 
          estimated_end_date: endDate 
        })
        .eq('id', taskId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timeline-phases', projectId] });
      toast.success('Task dates updated');
    },
    onError: () => {
      toast.error('Failed to update task dates');
    },
  });

  return {
    phases,
    milestones,
    project,
    metrics,
    isLoading: phasesLoading || milestonesLoading,
    createMilestone,
    updateTaskDates,
  };
}
