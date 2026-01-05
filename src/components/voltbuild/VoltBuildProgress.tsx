import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Clock, AlertCircle, Target, Calendar, TrendingUp } from 'lucide-react';
import { VoltBuildProject, VoltBuildPhase, VoltBuildTask } from './types/voltbuild.types';
import { cn } from '@/lib/utils';
import { format, differenceInDays, addDays } from 'date-fns';

interface VoltBuildProgressProps {
  project: VoltBuildProject;
  phases: VoltBuildPhase[];
  allTasks: VoltBuildTask[];
}

export function VoltBuildProgress({
  project,
  phases,
  allTasks,
}: VoltBuildProgressProps) {
  // Calculate stats
  const totalTasks = allTasks.length;
  const completedTasks = allTasks.filter((t) => t.status === 'complete').length;
  const inProgressTasks = allTasks.filter((t) => t.status === 'in_progress').length;
  const blockedTasks = allTasks.filter((t) => t.status === 'blocked').length;
  const criticalTasks = allTasks.filter((t) => t.is_critical_path).length;
  const criticalComplete = allTasks.filter(
    (t) => t.is_critical_path && t.status === 'complete'
  ).length;

  // Calculate timeline info
  const estimatedDays = project.estimated_start_date && project.estimated_end_date
    ? differenceInDays(new Date(project.estimated_end_date), new Date(project.estimated_start_date))
    : null;

  const elapsedDays = project.actual_start_date
    ? differenceInDays(new Date(), new Date(project.actual_start_date))
    : null;

  const progressRate = elapsedDays && elapsedDays > 0
    ? (project.overall_progress / elapsedDays).toFixed(1)
    : null;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {/* Overall Progress */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <Target className="w-4 h-4" />
            Overall Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-end gap-2">
              <span className="text-3xl font-bold text-foreground">
                {Math.round(project.overall_progress)}%
              </span>
              {progressRate && (
                <span className="text-sm text-muted-foreground mb-1">
                  +{progressRate}%/day
                </span>
              )}
            </div>
            <Progress value={project.overall_progress} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Task Completion */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <CheckCircle2 className="w-4 h-4" />
            Tasks Completed
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-end gap-2">
              <span className="text-3xl font-bold text-foreground">
                {completedTasks}
              </span>
              <span className="text-lg text-muted-foreground mb-0.5">
                / {totalTasks}
              </span>
            </div>
            <div className="flex gap-2 text-xs">
              <Badge variant="secondary" className="gap-1">
                <Clock className="w-3 h-3" />
                {inProgressTasks} active
              </Badge>
              {blockedTasks > 0 && (
                <Badge variant="destructive" className="gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {blockedTasks} blocked
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Critical Path */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <TrendingUp className="w-4 h-4" />
            Critical Path
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-end gap-2">
              <span className="text-3xl font-bold text-foreground">
                {criticalComplete}
              </span>
              <span className="text-lg text-muted-foreground mb-0.5">
                / {criticalTasks}
              </span>
            </div>
            <Progress
              value={criticalTasks > 0 ? (criticalComplete / criticalTasks) * 100 : 0}
              className={cn(
                'h-2',
                criticalComplete < criticalTasks && '[&>div]:bg-red-500'
              )}
            />
          </div>
        </CardContent>
      </Card>

      {/* Timeline */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <Calendar className="w-4 h-4" />
            Timeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-1">
            {project.estimated_end_date ? (
              <>
                <p className="text-sm text-muted-foreground">Target:</p>
                <p className="text-lg font-semibold text-foreground">
                  {format(new Date(project.estimated_end_date), 'MMM d, yyyy')}
                </p>
                {estimatedDays && elapsedDays !== null && (
                  <p className="text-xs text-muted-foreground">
                    Day {elapsedDays} of {estimatedDays}
                  </p>
                )}
              </>
            ) : (
              <p className="text-sm text-muted-foreground">No target date set</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function VoltBuildPhaseProgress({ phases }: { phases: VoltBuildPhase[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Phase Progress</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {phases.map((phase) => (
            <div key={phase.id} className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="truncate text-foreground">{phase.name}</span>
                <span className="font-medium text-muted-foreground">
                  {Math.round(phase.progress)}%
                </span>
              </div>
              <Progress value={phase.progress} className="h-2" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
