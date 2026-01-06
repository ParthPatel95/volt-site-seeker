import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ProjectForecast, ForecastDriver, RecommendedAction } from '../../types/voltbuild-phase3.types';
import { VoltBuildProject, VoltBuildPhase, VoltBuildTask } from '../../types/voltbuild.types';
import { toast } from 'sonner';
import { addDays } from 'date-fns';

export function useProjectForecasts(
  projectId: string, 
  project: VoltBuildProject,
  phases: VoltBuildPhase[],
  tasks: VoltBuildTask[]
) {
  const queryClient = useQueryClient();

  const { data: forecasts = [], isLoading } = useQuery({
    queryKey: ['voltbuild-forecasts', projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('voltbuild_project_forecasts')
        .select('*')
        .eq('project_id', projectId)
        .order('forecast_date', { ascending: false })
        .limit(10);

      if (error) throw error;
      return (data || []).map(d => ({
        ...d,
        primary_drivers: (d.primary_drivers || []) as unknown as ForecastDriver[],
        recommended_actions: (d.recommended_actions || []) as unknown as RecommendedAction[],
      })) as ProjectForecast[];
    },
    enabled: !!projectId,
  });

  const latestForecast = forecasts[0] || null;
  const previousForecast = forecasts[1] || null;

  const generateForecastMutation = useMutation({
    mutationFn: async () => {
      const totalTasks = tasks.length;
      const completedTasks = tasks.filter(t => t.status === 'complete').length;
      const blockedTasks = tasks.filter(t => t.status === 'blocked').length;
      const inProgressTasks = tasks.filter(t => t.status === 'in_progress').length;
      
      let scheduleSlipDays = 0;
      const primaryDrivers: ForecastDriver[] = [];
      const recommendedActions: RecommendedAction[] = [];

      if (blockedTasks > 0) {
        const blockerImpact = blockedTasks * 3;
        scheduleSlipDays += blockerImpact;
        primaryDrivers.push({
          type: 'blockers',
          description: `${blockedTasks} blocked task(s) causing delays`,
          impact: 'negative',
          value: blockedTasks,
        });
        recommendedActions.push({
          priority: 'high',
          action: `Resolve ${blockedTasks} blocked tasks immediately`,
          expected_impact: `Could recover ${blockerImpact} days`,
        });
      }

      if (completedTasks < totalTasks * 0.5 && inProgressTasks < 3 && totalTasks > 0) {
        scheduleSlipDays += 7;
        primaryDrivers.push({
          type: 'schedule',
          description: 'Low task velocity - fewer tasks in progress than expected',
          impact: 'negative',
          value: inProgressTasks,
        });
      }

      const completedPhases = phases.filter(p => p.status === 'complete').length;
      if (completedPhases > 0) {
        primaryDrivers.push({
          type: 'schedule',
          description: `${completedPhases} phase(s) completed on schedule`,
          impact: 'positive',
          value: completedPhases,
        });
      }

      const targetEndDate = project.estimated_end_date ? new Date(project.estimated_end_date) : addDays(new Date(), 180);
      const projectedRfsDate = addDays(targetEndDate, scheduleSlipDays);

      const capexOverrunPct = blockedTasks > 2 ? 5 + (blockedTasks * 2) : 0;

      let confidence = 50;
      if (totalTasks > 0) confidence += 10;
      if (phases.length > 0) confidence += 10;
      if (project.estimated_end_date) confidence += 10;
      confidence = Math.min(confidence, 85);

      if (primaryDrivers.filter(d => d.impact === 'negative').length === 0) {
        primaryDrivers.push({
          type: 'schedule',
          description: 'Project is on track with no major blockers',
          impact: 'positive',
        });
        recommendedActions.push({
          priority: 'low',
          action: 'Continue monitoring daily progress',
          expected_impact: 'Maintain current trajectory',
        });
      }

      const { error } = await supabase
        .from('voltbuild_project_forecasts')
        .insert({
          project_id: projectId,
          forecast_date: new Date().toISOString().split('T')[0],
          projected_rfs_date: projectedRfsDate.toISOString().split('T')[0],
          schedule_slip_days: scheduleSlipDays,
          projected_grand_total: 0,
          capex_overrun_pct: capexOverrunPct,
          confidence_pct: confidence,
          primary_drivers: primaryDrivers as any,
          recommended_actions: recommendedActions as any,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['voltbuild-forecasts', projectId] });
      toast.success('Forecast generated');
    },
    onError: (error) => {
      toast.error('Failed to generate forecast');
      console.error(error);
    },
  });

  return {
    forecasts,
    latestForecast,
    previousForecast,
    isLoading,
    generateForecast: generateForecastMutation.mutateAsync,
    isGenerating: generateForecastMutation.isPending,
  };
}
