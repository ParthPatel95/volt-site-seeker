import React, { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { TimelinePhase, TimelineTask, TimelineFilters } from '../types/voltbuild-timeline.types';
import { TimelineTaskBar } from './TimelineTaskBar';
import { parseISO, differenceInDays } from 'date-fns';

interface TimelinePhaseRowProps {
  phase: TimelinePhase;
  getPositionForDate: (date: Date | string) => number;
  getWidthForRange: (start: Date | string, end: Date | string) => number;
  startDate: Date;
  filters: TimelineFilters;
  onTaskClick: (task: TimelineTask) => void;
}

export function TimelinePhaseRow({
  phase,
  getPositionForDate,
  getWidthForRange,
  startDate,
  filters,
  onTaskClick,
}: TimelinePhaseRowProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  const getStatusColor = () => {
    if (phase.status === 'complete') return 'bg-green-500';
    if (phase.status === 'blocked') return 'bg-red-500';
    if (phase.status === 'in_progress') return 'bg-blue-500';
    return 'bg-gray-400';
  };

  // Calculate phase bar position
  const phaseStart = phase.estimated_start_date 
    ? parseISO(phase.estimated_start_date) 
    : startDate;
  const phaseEnd = phase.estimated_end_date 
    ? parseISO(phase.estimated_end_date) 
    : new Date(startDate.getTime() + (30 * 24 * 60 * 60 * 1000)); // Default 30 days

  const phaseLeft = getPositionForDate(phaseStart);
  const phaseWidth = getWidthForRange(phaseStart, phaseEnd);

  // Filter tasks
  const filteredTasks = phase.tasks.filter((task) => {
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      if (!task.title.toLowerCase().includes(query)) return false;
    }
    if (filters.status.length > 0 && !filters.status.includes(task.status)) return false;
    if (filters.priority.length > 0 && !filters.priority.includes(task.priority)) return false;
    if (filters.showCriticalPath && !task.is_critical) return false;
    return true;
  });

  const visibleTasks = isExpanded ? filteredTasks : [];
  const completedTasks = phase.tasks.filter(t => t.status === 'complete').length;

  // Check if phase matches filter (to show/hide)
  const phaseMatchesFilter = filters.phaseId ? phase.id === filters.phaseId : true;
  if (!phaseMatchesFilter) return null;

  return (
    <div className="border-b border-border/50">
      {/* Phase Header Row */}
      <div className="flex items-center min-h-[48px] bg-muted/30 hover:bg-muted/50 transition-colors">
        {/* Phase Info (Fixed Left Column) */}
        <div className="w-48 md:w-64 flex-shrink-0 px-3 py-2 border-r border-border flex items-center gap-2 sticky left-0 bg-muted/30 z-10">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-0.5 hover:bg-muted rounded"
          >
            {isExpanded ? (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            )}
          </button>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-medium text-sm truncate">{phase.name}</span>
              <Badge variant="outline" className="text-[10px] hidden sm:inline-flex">
                {completedTasks}/{phase.tasks.length}
              </Badge>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <Progress value={phase.progress} className="h-1.5 flex-1" />
              <span className="text-[10px] text-muted-foreground w-8">
                {phase.progress}%
              </span>
            </div>
          </div>
        </div>

        {/* Phase Bar (Scrollable Area) */}
        <div className="relative flex-1 h-8">
          <div
            className={`absolute h-6 rounded-md ${getStatusColor()} opacity-60`}
            style={{
              left: phaseLeft,
              width: Math.max(phaseWidth, 40),
              top: 4,
            }}
          >
            <div 
              className="absolute inset-y-0 left-0 bg-white/30 rounded-l-md"
              style={{ width: `${phase.progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Task Rows */}
      {isExpanded && visibleTasks.length > 0 && (
        <div className="bg-background">
          {visibleTasks.map((task) => {
            const taskStart = task.estimated_start_date 
              ? parseISO(task.estimated_start_date) 
              : phaseStart;
            const taskEnd = task.estimated_end_date 
              ? parseISO(task.estimated_end_date) 
              : new Date(taskStart.getTime() + (7 * 24 * 60 * 60 * 1000)); // Default 7 days

            const taskLeft = getPositionForDate(taskStart);
            const taskWidth = getWidthForRange(taskStart, taskEnd);
            const isFilteredOut = filters.showCriticalPath && !task.is_critical;

            return (
              <div key={task.id} className="flex items-center min-h-[36px] hover:bg-muted/20">
                {/* Task Info */}
                <div className="w-48 md:w-64 flex-shrink-0 px-3 py-1.5 border-r border-border/50 sticky left-0 bg-background z-10">
                  <div className="flex items-center gap-2 pl-6">
                    <span className={`text-xs truncate ${isFilteredOut ? 'opacity-30' : ''}`}>
                      {task.title}
                    </span>
                  </div>
                </div>

                {/* Task Bar */}
                <div className="relative flex-1 h-[34px]">
                  <TimelineTaskBar
                    task={task}
                    left={taskLeft}
                    width={taskWidth}
                    showCriticalPath={filters.showCriticalPath}
                    isFiltered={isFilteredOut}
                    onTaskClick={onTaskClick}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Empty State */}
      {isExpanded && filteredTasks.length === 0 && phase.tasks.length > 0 && (
        <div className="flex items-center justify-center py-4 text-xs text-muted-foreground bg-background">
          No tasks match current filters
        </div>
      )}
    </div>
  );
}
