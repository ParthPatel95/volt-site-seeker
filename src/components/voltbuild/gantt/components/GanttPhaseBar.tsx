import React from 'react';
import { motion } from 'framer-motion';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { format, parseISO, differenceInDays } from 'date-fns';
import { getPositionForDate, getWidthForRange } from '../utils/dateCalculations';
import { GanttTask } from '../types/gantt.types';

interface PhaseData {
  id: string;
  name: string;
  tasks: GanttTask[];
  startDate: Date | null;
  endDate: Date | null;
  duration: number;
  progress: number;
  completedTasks: number;
  totalTasks: number;
  criticalTasks: number;
}

interface GanttPhaseBarProps {
  phase: PhaseData;
  timelineStartDate: Date;
  timelineEndDate: Date;
  totalWidth: number;
  rowIndex: number;
  config: {
    rowHeight: number;
    headerHeight: number;
    taskListWidth: number;
  };
  onClick?: () => void;
}

export function GanttPhaseBar({
  phase,
  timelineStartDate,
  timelineEndDate,
  totalWidth,
  rowIndex,
  config,
  onClick,
}: GanttPhaseBarProps) {
  if (!phase.startDate || !phase.endDate) {
    return null;
  }

  const left = getPositionForDate(phase.startDate, timelineStartDate, timelineEndDate, totalWidth);
  const width = getWidthForRange(
    phase.startDate.toISOString(),
    phase.endDate.toISOString(),
    timelineStartDate,
    timelineEndDate,
    totalWidth,
    40 // Minimum width for phase bars
  );
  const top = config.headerHeight + (rowIndex * config.rowHeight) + (config.rowHeight - 32) / 2;

  // Determine color based on progress
  const getProgressColor = () => {
    if (phase.progress >= 100) return 'bg-green-600';
    if (phase.progress >= 50) return 'bg-blue-600';
    if (phase.progress > 0) return 'bg-amber-600';
    return 'bg-slate-600';
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <motion.div
            className={cn(
              "absolute rounded-md cursor-pointer transition-all group",
              "border-2 border-slate-500 bg-slate-200/50 dark:bg-slate-800/50",
              "hover:border-slate-600 hover:shadow-md"
            )}
            style={{
              left: left + config.taskListWidth + 180,
              top,
              width: Math.max(width, 40),
              height: 32,
            }}
            initial={{ scaleX: 0, opacity: 0 }}
            animate={{ scaleX: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            onClick={onClick}
          >
            {/* Progress fill */}
            <div 
              className={cn(
                "absolute inset-y-0 left-0 rounded-l-md transition-all",
                getProgressColor()
              )}
              style={{ width: `${Math.min(phase.progress, 100)}%`, opacity: 0.4 }}
            />

            {/* Phase pattern stripes */}
            <div 
              className="absolute inset-0 opacity-10"
              style={{
                background: 'repeating-linear-gradient(45deg, transparent, transparent 5px, currentColor 5px, currentColor 6px)',
              }}
            />

            {/* Left bracket */}
            <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-slate-600 rounded-l-md" />
            
            {/* Right bracket */}
            <div className="absolute right-0 top-0 bottom-0 w-1.5 bg-slate-600 rounded-r-md" />

            {/* Phase label (shown if wide enough) */}
            {width > 100 && (
              <div className="absolute inset-0 flex items-center justify-center px-4">
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 truncate">
                  {phase.name} ({phase.progress}%)
                </span>
              </div>
            )}
          </motion.div>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-sm">
          <div className="space-y-2">
            <p className="font-semibold text-sm">{phase.name}</p>
            <div className="text-xs space-y-1">
              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">Duration:</span>
                <span>{phase.duration} days</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">Dates:</span>
                <span>
                  {format(phase.startDate, 'MMM d')} - {format(phase.endDate, 'MMM d, yyyy')}
                </span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">Progress:</span>
                <span className="font-medium">{phase.progress}%</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">Tasks:</span>
                <span>{phase.completedTasks}/{phase.totalTasks} complete</span>
              </div>
              {phase.criticalTasks > 0 && (
                <div className="flex justify-between gap-4">
                  <span className="text-orange-600">Critical Tasks:</span>
                  <span className="text-orange-600 font-medium">{phase.criticalTasks}</span>
                </div>
              )}
            </div>
            {/* Mini progress bar */}
            <div className="h-1.5 bg-muted rounded-full overflow-hidden mt-2">
              <div 
                className={cn("h-full transition-all", getProgressColor())}
                style={{ width: `${phase.progress}%` }}
              />
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
