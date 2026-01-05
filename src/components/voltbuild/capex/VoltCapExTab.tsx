import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { VoltBuildProject, VoltBuildPhase } from '../types/voltbuild.types';
import { useCapexLines } from './hooks/useCapexLines';
import { useCapexSummary, useCapexCalculations } from './hooks/useCapexSummary';
import { CapexPhaseAccordion } from './CapexPhaseAccordion';
import { CapexSummaryPanel } from './CapexSummaryPanel';

interface VoltCapExTabProps {
  project: VoltBuildProject;
  phases: VoltBuildPhase[];
}

export function VoltCapExTab({ project, phases }: VoltCapExTabProps) {
  const {
    lines,
    linesByPhase,
    isLoading: linesLoading,
    createLine,
    updateLine,
    deleteLine,
    isCreating,
  } = useCapexLines(project.id);

  const {
    summary,
    isLoading: summaryLoading,
    upsertSummary,
  } = useCapexSummary(project.id);

  const calculations = useCapexCalculations(lines, summary, project.target_mw);

  const isLoading = linesLoading || summaryLoading;

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
        <h2 className="text-xl font-semibold">CAPEX Estimator</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Estimate project costs by construction phase. All values are estimates.
        </p>
      </div>

      {/* Main Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Phase Accordion - 2/3 width on desktop */}
        <div className="lg:col-span-2 space-y-4">
          {phases.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                No phases found. Create phases in the Tasks tab first.
              </CardContent>
            </Card>
          ) : (
            <CapexPhaseAccordion
              phases={phases}
              linesByPhase={linesByPhase}
              calculations={calculations}
              projectId={project.id}
              onCreateLine={createLine}
              onUpdateLine={(id, updates) => updateLine({ id, ...updates })}
              onDeleteLine={deleteLine}
              isCreating={isCreating}
            />
          )}
        </div>

        {/* Summary Panel - 1/3 width on desktop */}
        <div className="lg:col-span-1">
          <CapexSummaryPanel
            calculations={calculations}
            summary={summary}
            projectName={project.name}
            targetMw={project.target_mw}
            onUpdateSettings={upsertSummary}
            projectId={project.id}
          />
        </div>
      </div>
    </div>
  );
}
