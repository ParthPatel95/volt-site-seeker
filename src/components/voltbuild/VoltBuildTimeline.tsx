import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { VoltBuildPhase, VoltBuildTask, PHASE_STATUS_CONFIG } from './types/voltbuild.types';
import { cn } from '@/lib/utils';
import { format, differenceInDays, addDays, startOfDay, endOfDay, max, min } from 'date-fns';

interface VoltBuildTimelineProps {
  phases: VoltBuildPhase[];
  tasks: Record<string, VoltBuildTask[]>;
  projectStartDate: string | null;
  projectEndDate: string | null;
}

export function VoltBuildTimeline({
  phases,
  tasks,
  projectStartDate,
  projectEndDate,
}: VoltBuildTimelineProps) {
  // Calculate timeline bounds
  const { startDate, endDate, totalDays, monthMarkers } = useMemo(() => {
    const now = new Date();
    let minDate = projectStartDate ? new Date(projectStartDate) : now;
    let maxDate = projectEndDate ? new Date(projectEndDate) : addDays(now, 180);

    // Ensure minimum 30 day span
    const span = differenceInDays(maxDate, minDate);
    if (span < 30) {
      maxDate = addDays(minDate, 30);
    }

    const days = differenceInDays(maxDate, minDate) + 1;

    // Generate month markers
    const markers: { date: Date; label: string; position: number }[] = [];
    let currentDate = new Date(minDate.getFullYear(), minDate.getMonth(), 1);
    while (currentDate <= maxDate) {
      const dayPosition = differenceInDays(currentDate, minDate);
      if (dayPosition >= 0) {
        markers.push({
          date: currentDate,
          label: format(currentDate, 'MMM yyyy'),
          position: (dayPosition / days) * 100,
        });
      }
      currentDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
    }

    return {
      startDate: minDate,
      endDate: maxDate,
      totalDays: days,
      monthMarkers: markers,
    };
  }, [projectStartDate, projectEndDate]);

  // Calculate phase bars
  const phaseBars = useMemo(() => {
    return phases.map((phase) => {
      const phaseTasks = tasks[phase.id] || [];
      
      // Use phase dates if available, otherwise estimate based on position
      let phaseStart: Date;
      let phaseEnd: Date;

      if (phase.estimated_start_date && phase.estimated_end_date) {
        phaseStart = new Date(phase.estimated_start_date);
        phaseEnd = new Date(phase.estimated_end_date);
      } else {
        // Distribute phases evenly if no dates
        const phaseSpan = totalDays / phases.length;
        phaseStart = addDays(startDate, phase.order_index * phaseSpan);
        phaseEnd = addDays(phaseStart, phaseSpan - 5);
      }

      const startOffset = Math.max(0, differenceInDays(phaseStart, startDate));
      const duration = Math.max(1, differenceInDays(phaseEnd, phaseStart));

      return {
        phase,
        left: (startOffset / totalDays) * 100,
        width: (duration / totalDays) * 100,
        tasks: phaseTasks,
      };
    });
  }, [phases, tasks, startDate, totalDays]);

  // Today marker position
  const todayPosition = useMemo(() => {
    const today = new Date();
    const daysFromStart = differenceInDays(today, startDate);
    if (daysFromStart < 0 || daysFromStart > totalDays) return null;
    return (daysFromStart / totalDays) * 100;
  }, [startDate, totalDays]);

  const getStatusColor = (status: VoltBuildPhase['status']) => {
    switch (status) {
      case 'complete':
        return 'bg-green-500';
      case 'in_progress':
        return 'bg-blue-500';
      case 'blocked':
        return 'bg-red-500';
      default:
        return 'bg-muted-foreground/30';
    }
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Project Timeline</CardTitle>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-green-500" /> Complete
            </span>
            <span className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-blue-500" /> In Progress
            </span>
            <span className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-red-500" /> Blocked
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="w-full">
          <div className="min-w-[600px]">
            {/* Month headers */}
            <div className="relative h-6 mb-2 border-b border-border">
              {monthMarkers.map((marker, i) => (
                <div
                  key={i}
                  className="absolute text-xs text-muted-foreground"
                  style={{ left: `${marker.position}%` }}
                >
                  {marker.label}
                </div>
              ))}
            </div>

            {/* Timeline grid and bars */}
            <div className="relative">
              {/* Today marker */}
              {todayPosition !== null && (
                <div
                  className="absolute top-0 bottom-0 w-0.5 bg-primary z-10"
                  style={{ left: `${todayPosition}%` }}
                >
                  <Badge
                    className="absolute -top-6 -translate-x-1/2 text-xs"
                    variant="default"
                  >
                    Today
                  </Badge>
                </div>
              )}

              {/* Phase bars */}
              <div className="space-y-3">
                {phaseBars.map(({ phase, left, width, tasks: phaseTasks }) => {
                  const statusConfig = PHASE_STATUS_CONFIG[phase.status];
                  const completedTasks = phaseTasks.filter(t => t.status === 'complete').length;
                  const hasBlockedTasks = phaseTasks.some(t => t.status === 'blocked');

                  return (
                    <div key={phase.id} className="relative h-10">
                      {/* Phase label */}
                      <div className="absolute left-0 w-40 pr-2 text-sm truncate text-foreground">
                        {phase.name}
                      </div>

                      {/* Bar container */}
                      <div className="ml-44 relative h-full">
                        {/* Background track */}
                        <div className="absolute inset-0 rounded bg-muted/50" />

                        {/* Phase bar */}
                        <div
                          className={cn(
                            'absolute h-full rounded transition-all',
                            getStatusColor(phase.status),
                            hasBlockedTasks && phase.status !== 'blocked' && 'ring-2 ring-red-500 ring-offset-2 ring-offset-background'
                          )}
                          style={{
                            left: `${left}%`,
                            width: `${Math.max(width, 2)}%`,
                          }}
                        >
                          {/* Progress overlay */}
                          {phase.status !== 'complete' && phase.progress > 0 && (
                            <div
                              className="absolute inset-y-0 left-0 bg-white/20 rounded-l"
                              style={{ width: `${phase.progress}%` }}
                            />
                          )}

                          {/* Task count badge */}
                          {width > 8 && (
                            <div className="absolute inset-0 flex items-center justify-center text-xs font-medium text-white">
                              {completedTasks}/{phaseTasks.length}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
