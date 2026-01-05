import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ProjectReport, ReportType, ReportKPIs } from '../../types/voltbuild-phase2.types';
import { toast } from 'sonner';
import { Json } from '@/integrations/supabase/types';

export function useProjectReports(projectId: string | null) {
  const queryClient = useQueryClient();

  const reportsQuery = useQuery({
    queryKey: ['project-reports', projectId],
    queryFn: async (): Promise<ProjectReport[]> => {
      if (!projectId) return [];

      const { data, error } = await supabase
        .from('project_reports')
        .select('*')
        .eq('project_id', projectId)
        .order('period_end', { ascending: false });

      if (error) throw error;
      return (data || []).map(item => ({
        ...item,
        kpis: (item.kpis as unknown as ReportKPIs) || {
          completion_percentage: 0,
          tasks_completed: 0,
          tasks_total: 0,
          open_blockers: 0,
          capex_spent: 0,
          capex_budget: 0,
          days_to_rfs: 0,
          change_orders_approved: 0,
          total_cost_delta: 0,
          total_schedule_delta: 0,
        },
        snapshot_data: (item.snapshot_data as Record<string, unknown>) || {},
      })) as ProjectReport[];
    },
    enabled: !!projectId,
  });

  const createReportMutation = useMutation({
    mutationFn: async (report: Omit<ProjectReport, 'id' | 'created_at'>) => {
      const { data, error } = await supabase
        .from('project_reports')
        .insert({
          ...report,
          kpis: report.kpis as unknown as Json,
          snapshot_data: report.snapshot_data as unknown as Json,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project-reports', projectId] });
      toast.success('Report generated successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to generate report: ${error.message}`);
    },
  });

  const updateReportMutation = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<ProjectReport> & { id: string }) => {
      const updateData: Record<string, unknown> = { ...updates };
      if (updates.kpis) {
        updateData.kpis = updates.kpis as unknown as Json;
      }
      if (updates.snapshot_data) {
        updateData.snapshot_data = updates.snapshot_data as unknown as Json;
      }
      
      const { data, error } = await supabase
        .from('project_reports')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project-reports', projectId] });
      toast.success('Report updated successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update report: ${error.message}`);
    },
  });

  const deleteReportMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('project_reports')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project-reports', projectId] });
      toast.success('Report deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete report: ${error.message}`);
    },
  });

  // Generate report with data from all modules
  const generateReport = async (
    reportType: ReportType,
    periodStart: string,
    periodEnd: string,
    projectData: {
      project: { name: string; overall_progress: number };
      tasks: { total: number; completed: number; blockers: number };
      capex: { spent: number; budget: number };
      leadTime: { daysToRfs: number };
      changeOrders: { approved: number; costDelta: number; scheduleDelta: number };
    }
  ) => {
    if (!projectId) return;

    const kpis: ReportKPIs = {
      completion_percentage: projectData.project.overall_progress,
      tasks_completed: projectData.tasks.completed,
      tasks_total: projectData.tasks.total,
      open_blockers: projectData.tasks.blockers,
      capex_spent: projectData.capex.spent,
      capex_budget: projectData.capex.budget,
      days_to_rfs: projectData.leadTime.daysToRfs,
      change_orders_approved: projectData.changeOrders.approved,
      total_cost_delta: projectData.changeOrders.costDelta,
      total_schedule_delta: projectData.changeOrders.scheduleDelta,
    };

    // Generate summary text
    const spendPercentage = projectData.capex.budget > 0 
      ? Math.round((projectData.capex.spent / projectData.capex.budget) * 100) 
      : 0;
    
    const summary = `
**${reportType === 'weekly' ? 'Weekly' : 'Monthly'} Progress Report**

Project ${projectData.project.name} is currently at ${projectData.project.overall_progress}% completion.

**Key Highlights:**
- ${projectData.tasks.completed} of ${projectData.tasks.total} tasks completed
- ${projectData.tasks.blockers} open blockers requiring attention
- CAPEX: $${projectData.capex.spent.toLocaleString()} spent of $${projectData.capex.budget.toLocaleString()} budget (${spendPercentage}%)
- ${projectData.leadTime.daysToRfs} days to target RFS

**Change Orders:**
- ${projectData.changeOrders.approved} approved change orders
- Net cost impact: $${projectData.changeOrders.costDelta.toLocaleString()}
- Net schedule impact: ${projectData.changeOrders.scheduleDelta} days
    `.trim();

    createReportMutation.mutate({
      project_id: projectId,
      report_type: reportType,
      period_start: periodStart,
      period_end: periodEnd,
      generated_summary: summary,
      kpis,
      snapshot_data: projectData,
      exported_pdf_url: null,
    });
  };

  return {
    reports: reportsQuery.data || [],
    isLoading: reportsQuery.isLoading,
    error: reportsQuery.error,
    generateReport,
    updateReport: updateReportMutation.mutate,
    deleteReport: deleteReportMutation.mutate,
    isGenerating: createReportMutation.isPending,
    isUpdating: updateReportMutation.isPending,
    isDeleting: deleteReportMutation.isPending,
  };
}
