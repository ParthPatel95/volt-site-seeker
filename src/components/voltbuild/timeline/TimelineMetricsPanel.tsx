import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Zap,
  Flag,
  Calendar,
} from 'lucide-react';
import { TimelineMetrics, VoltBuildMilestone } from '../types/voltbuild-timeline.types';
import { format, parseISO } from 'date-fns';

interface TimelineMetricsPanelProps {
  metrics: TimelineMetrics;
}

export function TimelineMetricsPanel({ metrics }: TimelineMetricsPanelProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 mb-4">
      {/* Progress */}
      <Card className="p-3">
        <div className="flex items-center gap-2 mb-2">
          <div className="p-1.5 rounded-md bg-primary/10">
            <CheckCircle2 className="h-4 w-4 text-primary" />
          </div>
          <span className="text-xs text-muted-foreground">Complete</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xl font-bold">{metrics.percentComplete}%</span>
          <Progress value={metrics.percentComplete} className="h-1.5 flex-1" />
        </div>
      </Card>

      {/* Days Remaining */}
      <Card className="p-3">
        <div className="flex items-center gap-2 mb-2">
          <div className="p-1.5 rounded-md bg-blue-500/10">
            <Clock className="h-4 w-4 text-blue-500" />
          </div>
          <span className="text-xs text-muted-foreground">Days Left</span>
        </div>
        <span className="text-xl font-bold">{metrics.daysRemaining}</span>
      </Card>

      {/* On Track */}
      <Card className="p-3">
        <div className="flex items-center gap-2 mb-2">
          <div className="p-1.5 rounded-md bg-green-500/10">
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </div>
          <span className="text-xs text-muted-foreground">On Track</span>
        </div>
        <span className="text-xl font-bold text-green-600">{metrics.tasksOnTrack}</span>
      </Card>

      {/* At Risk */}
      <Card className="p-3">
        <div className="flex items-center gap-2 mb-2">
          <div className="p-1.5 rounded-md bg-amber-500/10">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
          </div>
          <span className="text-xs text-muted-foreground">At Risk</span>
        </div>
        <span className="text-xl font-bold text-amber-600">{metrics.tasksAtRisk}</span>
      </Card>

      {/* Delayed */}
      <Card className="p-3">
        <div className="flex items-center gap-2 mb-2">
          <div className="p-1.5 rounded-md bg-red-500/10">
            <XCircle className="h-4 w-4 text-red-500" />
          </div>
          <span className="text-xs text-muted-foreground">Delayed</span>
        </div>
        <span className="text-xl font-bold text-red-600">{metrics.tasksDelayed}</span>
      </Card>

      {/* Critical Path / Next Milestone */}
      <Card className="p-3">
        <div className="flex items-center gap-2 mb-2">
          <div className="p-1.5 rounded-md bg-orange-500/10">
            {metrics.nextMilestone ? (
              <Flag className="h-4 w-4 text-orange-500" />
            ) : (
              <Zap className="h-4 w-4 text-orange-500" />
            )}
          </div>
          <span className="text-xs text-muted-foreground">
            {metrics.nextMilestone ? 'Next Milestone' : 'Critical'}
          </span>
        </div>
        {metrics.nextMilestone ? (
          <div className="truncate">
            <span className="text-sm font-medium">{metrics.nextMilestone.name}</span>
            <div className="text-[10px] text-muted-foreground">
              {format(parseISO(metrics.nextMilestone.target_date), 'MMM d')}
            </div>
          </div>
        ) : (
          <span className="text-xl font-bold text-orange-600">{metrics.criticalPathTasks}</span>
        )}
      </Card>
    </div>
  );
}
