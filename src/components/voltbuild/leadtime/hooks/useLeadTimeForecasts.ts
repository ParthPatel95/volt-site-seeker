import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { LeadTimeProjectForecast, LeadTimeProjectInput, LeadTimeBaseline, MilestoneWithRisk, RiskLevel } from '../../types/voltbuild-advanced.types';
import { toast } from 'sonner';
import { differenceInDays, parseISO, addDays } from 'date-fns';

export function useLeadTimeForecasts(projectId: string | null) {
  const queryClient = useQueryClient();

  const forecastsQuery = useQuery({
    queryKey: ['leadtime-forecasts', projectId],
    queryFn: async (): Promise<LeadTimeProjectForecast[]> => {
      if (!projectId) return [];

      const { data, error } = await supabase
        .from('leadtime_project_forecasts')
        .select('*')
        .eq('project_id', projectId)
        .order('predicted_min_days', { ascending: true });

      if (error) throw error;
      return (data || []) as LeadTimeProjectForecast[];
    },
    enabled: !!projectId,
  });

  const generateForecastsMutation = useMutation({
    mutationFn: async ({
      projectId,
      inputs,
      baselines,
    }: {
      projectId: string;
      inputs: LeadTimeProjectInput;
      baselines: LeadTimeBaseline[];
    }) => {
      // Delete existing forecasts
      await supabase
        .from('leadtime_project_forecasts')
        .delete()
        .eq('project_id', projectId);

      // Calculate forecasts
      const forecasts = calculateForecasts(inputs, baselines);

      // Insert new forecasts
      const { data, error } = await supabase
        .from('leadtime_project_forecasts')
        .insert(
          forecasts.map((f) => ({
            project_id: projectId,
            milestone: f.milestone,
            predicted_min_days: f.predicted_min_days,
            predicted_max_days: f.predicted_max_days,
            confidence_pct: f.confidence_pct,
            key_risk_factors: f.key_risk_factors,
            mitigation_actions: f.mitigation_actions,
          }))
        )
        .select();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leadtime-forecasts', projectId] });
      toast.success('Forecasts generated');
    },
    onError: (error: Error) => {
      toast.error(`Failed to generate forecasts: ${error.message}`);
    },
  });

  return {
    forecasts: forecastsQuery.data || [],
    isLoading: forecastsQuery.isLoading,
    error: forecastsQuery.error,
    generateForecasts: generateForecastsMutation.mutate,
    isGenerating: generateForecastsMutation.isPending,
  };
}

// Rule-based forecast calculation
function calculateForecasts(
  inputs: LeadTimeProjectInput,
  baselines: LeadTimeBaseline[]
): Array<{
  milestone: string;
  predicted_min_days: number;
  predicted_max_days: number;
  confidence_pct: number;
  key_risk_factors: string[];
  mitigation_actions: string[];
}> {
  // Filter baselines by jurisdiction
  const relevantBaselines = baselines.filter(
    (b) => b.jurisdiction === inputs.jurisdiction || b.jurisdiction === 'Generic'
  );

  // Prefer jurisdiction-specific over generic
  const milestoneMap = new Map<string, LeadTimeBaseline>();
  relevantBaselines.forEach((b) => {
    const existing = milestoneMap.get(b.milestone);
    if (!existing || b.jurisdiction !== 'Generic') {
      milestoneMap.set(b.milestone, b);
    }
  });

  const forecasts: Array<{
    milestone: string;
    predicted_min_days: number;
    predicted_max_days: number;
    confidence_pct: number;
    key_risk_factors: string[];
    mitigation_actions: string[];
  }> = [];

  milestoneMap.forEach((baseline) => {
    let minDays = baseline.baseline_min_days;
    let maxDays = baseline.baseline_max_days;
    const riskFactors: string[] = [];
    const mitigations: string[] = [];
    let confidence = 60;

    // Apply multipliers based on inputs
    if (inputs.requested_mw && inputs.requested_mw > 20) {
      minDays = Math.round(minDays * 1.2);
      maxDays = Math.round(maxDays * 1.2);
      riskFactors.push('Large capacity request (>20 MW) adds complexity');
      mitigations.push('Engage with utility early and often');
    }

    if (inputs.interconnection_type === 'Transmission') {
      minDays = Math.round(minDays * 1.25);
      maxDays = Math.round(maxDays * 1.25);
      riskFactors.push('Transmission interconnection requires additional studies');
      mitigations.push('Consider distribution-level alternatives');
    }

    if (inputs.substation_upgrade_required) {
      minDays = Math.round(minDays * 1.3);
      maxDays = Math.round(maxDays * 1.3);
      riskFactors.push('Substation upgrades add significant timeline');
      mitigations.push('Explore cost-sharing with other projects');
    }

    if (inputs.transformer_required && baseline.milestone.includes('Procurement')) {
      minDays += 180;
      maxDays += 365;
      riskFactors.push('Transformer lead times are 12-18+ months');
      mitigations.push('Order transformer as early as possible');
    }

    if (inputs.permitting_complexity === 'High') {
      if (baseline.milestone.includes('Permitting')) {
        minDays = Math.round(minDays * 1.2);
        maxDays = Math.round(maxDays * 1.2);
        riskFactors.push('Complex permitting environment');
        mitigations.push('Engage permitting consultant early');
      }
    }

    if (inputs.site_type === 'Greenfield') {
      minDays = Math.round(minDays * 1.15);
      maxDays = Math.round(maxDays * 1.15);
      riskFactors.push('Greenfield site requires additional development');
      mitigations.push('Complete site due diligence before commitment');
    }

    // Increase confidence if more inputs are provided
    if (inputs.target_rfs_date) confidence += 10;
    if (inputs.utility) confidence += 10;
    if (inputs.voltage_level) confidence += 5;
    confidence = Math.min(confidence, 95);

    forecasts.push({
      milestone: baseline.milestone,
      predicted_min_days: minDays,
      predicted_max_days: maxDays,
      confidence_pct: confidence,
      key_risk_factors: riskFactors,
      mitigation_actions: mitigations,
    });
  });

  // Sort by min days
  forecasts.sort((a, b) => a.predicted_min_days - b.predicted_min_days);

  return forecasts;
}

// Calculate risk level for a milestone
export function calculateMilestoneRisk(
  forecast: LeadTimeProjectForecast,
  targetRfsDate: string | null,
  startDate: Date
): RiskLevel {
  if (!targetRfsDate) return 'medium';

  const targetDate = parseISO(targetRfsDate);
  const maxEndDate = addDays(startDate, forecast.predicted_max_days);
  const daysToTarget = differenceInDays(targetDate, maxEndDate);

  if (daysToTarget < 0) return 'high';
  if (daysToTarget < 60) return 'medium';
  return 'low';
}

// Convert forecasts to timeline data
export function forecastsToMilestones(
  forecasts: LeadTimeProjectForecast[],
  targetRfsDate: string | null,
  projectStartDate?: string | null
): MilestoneWithRisk[] {
  const startDate = projectStartDate ? parseISO(projectStartDate) : new Date();
  
  let cumulativeDay = 0;
  
  return forecasts.map((f) => {
    const startDay = cumulativeDay;
    const endDay = startDay + f.predicted_max_days;
    cumulativeDay = endDay;

    return {
      ...f,
      startDay,
      endDay,
      riskLevel: calculateMilestoneRisk(f, targetRfsDate, startDate),
    };
  });
}
