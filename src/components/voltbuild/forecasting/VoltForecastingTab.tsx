import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { TrendingUp, TrendingDown, Calendar, DollarSign, AlertTriangle, RefreshCw, Download, ChevronRight, Target, Clock } from 'lucide-react';
import { format, differenceInDays, addDays } from 'date-fns';
import { VoltBuildProject, VoltBuildPhase, VoltBuildTask } from '../types/voltbuild.types';
import { useProjectForecasts } from './hooks/useProjectForecasts';
import { cn } from '@/lib/utils';

interface VoltForecastingTabProps {
  project: VoltBuildProject;
  phases: VoltBuildPhase[];
  tasks: VoltBuildTask[];
}

export function VoltForecastingTab({ project, phases, tasks }: VoltForecastingTabProps) {
  const { latestForecast, previousForecast, isLoading, generateForecast, isGenerating } = useProjectForecasts(project.id, project, phases, tasks);

  // Calculate task metrics
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'complete').length;
  const blockedTasks = tasks.filter(t => t.status === 'blocked').length;
  const completionPct = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Target dates
  const targetRfsDate = project.estimated_end_date ? new Date(project.estimated_end_date) : null;
  const projectedRfsDate = latestForecast?.projected_rfs_date 
    ? new Date(latestForecast.projected_rfs_date)
    : targetRfsDate;

  const scheduleSlip = latestForecast?.schedule_slip_days || 0;
  const capexOverrun = latestForecast?.capex_overrun_pct || 0;
  const confidence = latestForecast?.confidence_pct || 0;

  // Compare with previous forecast
  const slipChange = previousForecast 
    ? (latestForecast?.schedule_slip_days || 0) - (previousForecast.schedule_slip_days || 0)
    : 0;

  return (
    <div className="p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Project Forecasting</h1>
          <p className="text-muted-foreground mt-1">
            Schedule and CAPEX predictions based on current progress
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export PDF
          </Button>
          <Button onClick={() => generateForecast()} disabled={isGenerating}>
            <RefreshCw className={cn("w-4 h-4 mr-2", isGenerating && "animate-spin")} />
            Generate Forecast
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Projected RFS */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={cn(
                  "p-2 rounded-lg",
                  scheduleSlip > 0 ? "bg-red-500/20" : "bg-emerald-500/20"
                )}>
                  <Calendar className={cn(
                    "w-5 h-5",
                    scheduleSlip > 0 ? "text-red-600" : "text-emerald-600"
                  )} />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Projected RFS</p>
                  <p className="text-xl font-bold">
                    {projectedRfsDate ? format(projectedRfsDate, 'MMM d, yyyy') : 'Not set'}
                  </p>
                </div>
              </div>
              {scheduleSlip !== 0 && (
                <Badge variant={scheduleSlip > 0 ? "destructive" : "default"}>
                  {scheduleSlip > 0 ? '+' : ''}{scheduleSlip}d
                </Badge>
              )}
            </div>
            {targetRfsDate && (
              <p className="text-xs text-muted-foreground mt-2">
                Target: {format(targetRfsDate, 'MMM d, yyyy')}
              </p>
            )}
          </CardContent>
        </Card>

        {/* CAPEX Status */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={cn(
                  "p-2 rounded-lg",
                  capexOverrun > 5 ? "bg-red-500/20" : capexOverrun > 0 ? "bg-amber-500/20" : "bg-emerald-500/20"
                )}>
                  <DollarSign className={cn(
                    "w-5 h-5",
                    capexOverrun > 5 ? "text-red-600" : capexOverrun > 0 ? "text-amber-600" : "text-emerald-600"
                  )} />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">CAPEX Variance</p>
                  <p className="text-xl font-bold">
                    {capexOverrun > 0 ? '+' : ''}{capexOverrun.toFixed(1)}%
                  </p>
                </div>
              </div>
              {latestForecast?.projected_grand_total && (
                <Badge variant="outline">
                  ${(latestForecast.projected_grand_total / 1000000).toFixed(1)}M
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Variance from baseline
            </p>
          </CardContent>
        </Card>

        {/* Completion Progress */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-3">
              <div className="p-2 rounded-lg bg-blue-500/20">
                <Target className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Completion</p>
                <p className="text-xl font-bold">{completionPct}%</p>
              </div>
            </div>
            <Progress value={completionPct} className="h-2" />
            <p className="text-xs text-muted-foreground mt-2">
              {completedTasks} of {totalTasks} tasks complete
            </p>
          </CardContent>
        </Card>

        {/* Forecast Confidence */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-3">
              <div className={cn(
                "p-2 rounded-lg",
                confidence >= 70 ? "bg-emerald-500/20" : confidence >= 50 ? "bg-amber-500/20" : "bg-red-500/20"
              )}>
                <TrendingUp className={cn(
                  "w-5 h-5",
                  confidence >= 70 ? "text-emerald-600" : confidence >= 50 ? "text-amber-600" : "text-red-600"
                )} />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Confidence</p>
                <p className="text-xl font-bold">{confidence}%</p>
              </div>
            </div>
            <Progress value={confidence} className="h-2" />
            <p className="text-xs text-muted-foreground mt-2">
              Based on data completeness
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Primary Drivers */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Primary Drivers
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!latestForecast?.primary_drivers || (latestForecast.primary_drivers as any[]).length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Generate a forecast to see primary drivers
              </div>
            ) : (
              <div className="space-y-3">
                {(latestForecast.primary_drivers as any[]).map((driver: any, index: number) => (
                  <div key={index} className="flex items-start gap-3 p-3 rounded-lg border">
                    <div className={cn(
                      "p-1.5 rounded",
                      driver.impact === 'negative' ? "bg-red-500/20" : 
                      driver.impact === 'positive' ? "bg-emerald-500/20" : "bg-muted"
                    )}>
                      {driver.impact === 'negative' ? (
                        <TrendingDown className="w-4 h-4 text-red-600" />
                      ) : driver.impact === 'positive' ? (
                        <TrendingUp className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-muted-foreground" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium capitalize">{driver.type}</p>
                      <p className="text-sm text-muted-foreground">{driver.description}</p>
                      {driver.value !== undefined && (
                        <Badge variant="outline" className="mt-1">
                          {driver.value}
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recommended Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              Recommended Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!latestForecast?.recommended_actions || (latestForecast.recommended_actions as any[]).length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Generate a forecast to see recommendations
              </div>
            ) : (
              <div className="space-y-3">
                {(latestForecast.recommended_actions as any[]).map((action: any, index: number) => (
                  <div key={index} className="flex items-start gap-3 p-3 rounded-lg border">
                    <Badge variant={
                      action.priority === 'high' ? 'destructive' :
                      action.priority === 'medium' ? 'default' : 'secondary'
                    } className="shrink-0">
                      {action.priority}
                    </Badge>
                    <div>
                      <p className="font-medium">{action.action}</p>
                      <p className="text-sm text-muted-foreground">{action.expected_impact}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Forecast History / What Changed */}
      {previousForecast && latestForecast && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              What Changed Since Last Forecast
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="p-4 rounded-lg bg-muted/50">
                <p className="text-sm text-muted-foreground">Schedule Slip</p>
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-lg font-bold">
                    {previousForecast.schedule_slip_days || 0}d → {latestForecast.schedule_slip_days || 0}d
                  </p>
                  {slipChange !== 0 && (
                    <Badge variant={slipChange > 0 ? "destructive" : "default"}>
                      {slipChange > 0 ? '+' : ''}{slipChange}d
                    </Badge>
                  )}
                </div>
              </div>
              <div className="p-4 rounded-lg bg-muted/50">
                <p className="text-sm text-muted-foreground">CAPEX Variance</p>
                <p className="text-lg font-bold mt-1">
                  {(previousForecast.capex_overrun_pct || 0).toFixed(1)}% → {(latestForecast.capex_overrun_pct || 0).toFixed(1)}%
                </p>
              </div>
              <div className="p-4 rounded-lg bg-muted/50">
                <p className="text-sm text-muted-foreground">Confidence</p>
                <p className="text-lg font-bold mt-1">
                  {previousForecast.confidence_pct || 0}% → {latestForecast.confidence_pct || 0}%
                </p>
              </div>
            </div>
            <Separator className="my-4" />
            <p className="text-sm text-muted-foreground">
              Last forecast: {format(new Date(previousForecast.forecast_date), 'MMM d, yyyy')} •
              Current forecast: {format(new Date(latestForecast.forecast_date), 'MMM d, yyyy')}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
