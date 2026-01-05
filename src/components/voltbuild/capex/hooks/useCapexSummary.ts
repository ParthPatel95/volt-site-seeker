import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { CapexProjectSummary, CapexCalculatedSummary, CapexPhaseLine, CapexCategory } from '../../types/voltbuild-advanced.types';
import { useMemo } from 'react';
import { toast } from 'sonner';

export function useCapexSummary(projectId: string | null) {
  const queryClient = useQueryClient();

  const summaryQuery = useQuery({
    queryKey: ['capex-summary', projectId],
    queryFn: async (): Promise<CapexProjectSummary | null> => {
      if (!projectId) return null;

      const { data, error } = await supabase
        .from('capex_project_summary')
        .select('*')
        .eq('project_id', projectId)
        .maybeSingle();

      if (error) throw error;
      return data as CapexProjectSummary | null;
    },
    enabled: !!projectId,
  });

  const upsertSummaryMutation = useMutation({
    mutationFn: async (summary: Partial<CapexProjectSummary> & { project_id: string }) => {
      const { data, error } = await supabase
        .from('capex_project_summary')
        .upsert({
          project_id: summary.project_id,
          currency: summary.currency || 'USD',
          contingency_pct: summary.contingency_pct ?? 10,
          tax_pct: summary.tax_pct ?? 0,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['capex-summary', projectId] });
    },
    onError: (error: Error) => {
      toast.error(`Failed to update settings: ${error.message}`);
    },
  });

  return {
    summary: summaryQuery.data,
    isLoading: summaryQuery.isLoading,
    error: summaryQuery.error,
    upsertSummary: upsertSummaryMutation.mutate,
    isUpdating: upsertSummaryMutation.isPending,
  };
}

export function useCapexCalculations(
  lines: CapexPhaseLine[],
  summary: CapexProjectSummary | null | undefined,
  targetMw: number | null | undefined
): CapexCalculatedSummary {
  return useMemo(() => {
    const contingencyPct = summary?.contingency_pct ?? 10;
    const taxPct = summary?.tax_pct ?? 0;

    // Calculate totals by category
    const byCategory: Record<CapexCategory, number> = {
      Civil: 0,
      Electrical: 0,
      Mechanical: 0,
      IT: 0,
      Other: 0,
    };

    // Calculate totals by phase
    const byPhase: Record<string, number> = {};

    let totalDirect = 0;

    lines.forEach(line => {
      const subtotal = line.subtotal || (line.quantity * line.unit_cost);
      totalDirect += subtotal;

      // Group by phase
      if (!byPhase[line.phase_id]) {
        byPhase[line.phase_id] = 0;
      }
      byPhase[line.phase_id] += subtotal;

      // Group by category (from catalog item if available, otherwise 'Other')
      const category = line.catalog_item?.category || 'Other';
      if (category in byCategory) {
        byCategory[category as CapexCategory] += subtotal;
      } else {
        byCategory.Other += subtotal;
      }
    });

    const totalContingency = totalDirect * (contingencyPct / 100);
    const totalTax = (totalDirect + totalContingency) * (taxPct / 100);
    const grandTotal = totalDirect + totalContingency + totalTax;
    const costPerMw = targetMw && targetMw > 0 ? grandTotal / targetMw : null;

    return {
      totalDirect,
      totalContingency,
      totalTax,
      grandTotal,
      costPerMw,
      byCategory,
      byPhase,
    };
  }, [lines, summary, targetMw]);
}
