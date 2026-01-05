import React, { useMemo } from 'react';
import { Loader2 } from 'lucide-react';
import { VoltBuildProject } from '../types/voltbuild.types';
import { useLeadTimeInputs } from './hooks/useLeadTimeInputs';
import { useLeadTimeBaselines } from './hooks/useLeadTimeBaselines';
import { useLeadTimeForecasts, forecastsToMilestones } from './hooks/useLeadTimeForecasts';
import { LeadTimeInputCard } from './LeadTimeInputCard';
import { LeadTimeTimeline } from './LeadTimeTimeline';
import { LeadTimeRiskPanel } from './LeadTimeRiskPanel';
import { LeadTimeAlertBanner } from './LeadTimeAlertBanner';
import { parseISO } from 'date-fns';

interface VoltLeadTimeTabProps {
  project: VoltBuildProject;
}

export function VoltLeadTimeTab({ project }: VoltLeadTimeTabProps) {
  const {
    inputs,
    isLoading: inputsLoading,
    upsertInputs,
    isUpdating: isSaving,
  } = useLeadTimeInputs(project.id);

  const {
    data: baselines,
    isLoading: baselinesLoading,
  } = useLeadTimeBaselines(inputs?.jurisdiction || undefined);

  const {
    forecasts,
    isLoading: forecastsLoading,
    generateForecasts,
    isGenerating,
  } = useLeadTimeForecasts(project.id);

  const startDate = useMemo(() => {
    return project.estimated_start_date
      ? parseISO(project.estimated_start_date)
      : new Date();
  }, [project.estimated_start_date]);

  const milestones = useMemo(() => {
    return forecastsToMilestones(
      forecasts,
      inputs?.target_rfs_date || null,
      project.estimated_start_date
    );
  }, [forecasts, inputs?.target_rfs_date, project.estimated_start_date]);

  const handleSaveInputs = (values: Record<string, unknown>) => {
    upsertInputs({
      project_id: project.id,
      ...values,
    });
  };

  const handleCalculate = () => {
    if (!inputs || !baselines) return;
    generateForecasts({
      projectId: project.id,
      inputs: inputs,
      baselines: baselines,
    });
  };

  const isLoading = inputsLoading || baselinesLoading || forecastsLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-semibold">Lead Time Forecaster</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Predict utility interconnection and equipment timelines. All dates are
          estimated projections.
        </p>
      </div>

      {/* Alert Banner */}
      <LeadTimeAlertBanner
        milestones={milestones}
        targetRfsDate={inputs?.target_rfs_date || null}
        startDate={startDate}
      />

      {/* Main Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Inputs + Risk Panel */}
        <div className="lg:col-span-1 space-y-6">
          <LeadTimeInputCard
            inputs={inputs}
            projectMw={project.target_mw}
            onSave={handleSaveInputs}
            onCalculate={handleCalculate}
            isCalculating={isGenerating}
            isSaving={isSaving}
          />

          <LeadTimeRiskPanel milestones={milestones} />
        </div>

        {/* Right Column: Timeline */}
        <div className="lg:col-span-2">
          <LeadTimeTimeline
            milestones={milestones}
            startDate={startDate}
            targetRfsDate={inputs?.target_rfs_date || null}
          />
        </div>
      </div>
    </div>
  );
}
