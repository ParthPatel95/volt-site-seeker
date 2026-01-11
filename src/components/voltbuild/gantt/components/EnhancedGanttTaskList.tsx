import React, { useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  ChevronDown, 
  ChevronRight, 
  Zap, 
  Link2, 
  GripVertical,
  MoreHorizontal,
  MessageSquare,
  Clock,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { differenceInDays, parseISO, format } from 'date-fns';
import { useGantt } from '../context/GanttContext';
import { GanttTask, TASK_STATUS_COLORS } from '../types/gantt.types';

interface EnhancedGanttTaskListProps {
  onTaskClick?: (task: GanttTask) => void;
  onLinkClick?: (taskId: string) => void;
  projectStartDate?: Date | null;
}

// Calculate duration in days between two dates
function calculateDuration(startDate: string | null, endDate: string | null): number | null {
  if (!startDate || !endDate) return null;
  try {
    const start = parseISO(startDate);
    const end = parseISO(endDate);
    return differenceInDays(end, start) + 1; // +1 to include both start and end days
  } catch {
    return null;
  }
}

// Calculate start day relative to project start
function calculateStartDay(taskStartDate: string | null, projectStartDate: Date | null): number | null {
  if (!taskStartDate || !projectStartDate) return null;
  try {
    const taskStart = parseISO(taskStartDate);
    return differenceInDays(taskStart, projectStartDate) + 1;
  } catch {
    return null;
  }
}

// Generate WBS code for a task based on phase index and task index
function generateWbsCode(phaseIndex: number, taskIndex: number): string {
  return `${phaseIndex + 1}.${taskIndex + 1}`;
}

export function EnhancedGanttTaskList({ onTaskClick, onLinkClick, projectStartDate }: EnhancedGanttTaskListProps) {
  const { 
    state, 
    togglePhase, 
    selectTask, 
    hoverTask,
    startLinking,
    cancelLinking,
    criticalPathTasks,
    openContextMenu,
  } = useGantt();

  const { 
    tasks, 
    phases, 
    config, 
    expandedPhases, 
    selection,
  } = state;

  const handleLinkClick = (taskId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (selection.linkingFromId === taskId) {
      cancelLinking();
    } else if (selection.linkingFromId) {
      onLinkClick?.(taskId);
    } else {
      startLinking(taskId);
    }
  };

  const handleContextMenu = (e: React.MouseEvent, taskId: string) => {
    e.preventDefault();
    openContextMenu(e.clientX, e.clientY, taskId);
  };

  // Memoize phase calculations
  const phaseCalculations = useMemo(() => {
    return phases.map((phase, phaseIndex) => {
      const phaseTasks = tasks.filter(t => t.phase_id === phase.id);
      const completedTasks = phaseTasks.filter(t => t.status === 'complete').length;
      const criticalCount = phaseTasks.filter(t => criticalPathTasks.has(t.id)).length;
      
      // Calculate phase duration from tasks
      const taskDates = phaseTasks
        .filter(t => t.estimated_start_date && t.estimated_end_date)
        .map(t => ({
          start: parseISO(t.estimated_start_date!),
          end: parseISO(t.estimated_end_date!),
        }));
      
      let phaseDuration = null;
      let phaseStartDay = null;
      
      if (taskDates.length > 0) {
        const earliestStart = taskDates.reduce((min, d) => d.start < min ? d.start : min, taskDates[0].start);
        const latestEnd = taskDates.reduce((max, d) => d.end > max ? d.end : max, taskDates[0].end);
        phaseDuration = differenceInDays(latestEnd, earliestStart) + 1;
        
        if (projectStartDate) {
          phaseStartDay = differenceInDays(earliestStart, projectStartDate) + 1;
        }
      }
      
      return {
        phase,
        phaseIndex,
        phaseTasks,
        completedTasks,
        criticalCount,
        phaseDuration,
        phaseStartDay,
        wbsCode: `${phaseIndex + 1}`,
      };
    });
  }, [phases, tasks, criticalPathTasks, projectStartDate]);

  return (
    <div 
      className="sticky left-0 z-10 bg-background border-r flex-shrink-0"
      style={{ width: config.taskListWidth + 180 }} // Wider to accommodate new columns
    >
      {/* Header row */}
      <div 
        className="flex items-center border-b bg-muted/50 text-xs font-medium text-muted-foreground"
        style={{ height: config.rowHeight }}
      >
        <div className="w-10 px-2 flex-shrink-0">WBS</div>
        <div className="flex-1 px-2 min-w-0">Task Name</div>
        <div className="w-12 px-1 text-center flex-shrink-0">Days</div>
        <div className="w-14 px-1 text-center flex-shrink-0">Start</div>
        <div className="w-14 px-1 text-center flex-shrink-0">End</div>
        <div className="w-8 flex-shrink-0" />
      </div>
      
      {phaseCalculations.map(({ phase, phaseIndex, phaseTasks, completedTasks, criticalCount, phaseDuration, phaseStartDay, wbsCode }) => {
        const isExpanded = expandedPhases.has(phase.id);

        return (
          <div key={phase.id}>
            {/* Phase Row */}
            <div 
              className={cn(
                "flex items-center border-b cursor-pointer transition-colors",
                "hover:bg-accent/50 bg-muted/30"
              )}
              style={{ height: config.rowHeight }}
              onClick={() => togglePhase(phase.id)}
            >
              <div className="w-10 px-2 text-xs font-semibold text-muted-foreground flex-shrink-0">
                {wbsCode}
              </div>
              
              <div className="flex items-center gap-1.5 flex-1 px-2 min-w-0">
                <Button variant="ghost" size="sm" className="h-5 w-5 p-0 flex-shrink-0">
                  {isExpanded ? (
                    <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                  ) : (
                    <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                  )}
                </Button>
                
                <span className="font-medium text-sm truncate">
                  {phase.name}
                </span>
                
                {criticalCount > 0 && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <Zap className="h-3 w-3 text-orange-500 flex-shrink-0" />
                      </TooltipTrigger>
                      <TooltipContent>
                        {criticalCount} critical task{criticalCount !== 1 ? 's' : ''}
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </div>
              
              <div className="w-12 px-1 text-center text-xs text-muted-foreground flex-shrink-0">
                {phaseDuration ?? '-'}
              </div>
              
              <div className="w-14 px-1 text-center text-xs text-muted-foreground flex-shrink-0">
                {phaseStartDay ? `D${phaseStartDay}` : '-'}
              </div>
              
              <div className="w-14 px-1 flex-shrink-0">
                <Badge variant="outline" className="text-[10px] px-1 py-0">
                  {completedTasks}/{phaseTasks.length}
                </Badge>
              </div>
              
              <div className="w-8 flex-shrink-0" />
            </div>

            {/* Task Rows */}
            {isExpanded && phaseTasks.map((task, taskIndex) => {
              const isSelected = selection.selectedTaskIds.has(task.id);
              const isHovered = selection.hoveredTaskId === task.id;
              const isLinkSource = selection.linkingFromId === task.id;
              const isCritical = criticalPathTasks.has(task.id);
              const statusColor = TASK_STATUS_COLORS[task.status];
              
              const duration = calculateDuration(task.estimated_start_date, task.estimated_end_date);
              const startDay = calculateStartDay(task.estimated_start_date, projectStartDate ?? null);
              const endDay = startDay && duration ? startDay + duration - 1 : null;
              const taskWbsCode = generateWbsCode(phaseIndex, taskIndex);

              return (
                <div
                  key={task.id}
                  className={cn(
                    "flex items-center border-b cursor-pointer transition-colors group",
                    isSelected && "bg-primary/10",
                    isHovered && !isSelected && "bg-accent/50",
                    isLinkSource && "bg-blue-500/10 ring-1 ring-inset ring-blue-500/30"
                  )}
                  style={{ height: config.rowHeight }}
                  onClick={() => {
                    if (selection.linkingFromId && selection.linkingFromId !== task.id) {
                      onLinkClick?.(task.id);
                    } else {
                      selectTask(task.id);
                      onTaskClick?.(task);
                    }
                  }}
                  onMouseEnter={() => hoverTask(task.id)}
                  onMouseLeave={() => hoverTask(null)}
                  onContextMenu={(e) => handleContextMenu(e, task.id)}
                >
                  {/* WBS Code */}
                  <div className="w-10 px-2 text-xs text-muted-foreground flex-shrink-0">
                    {taskWbsCode}
                  </div>
                  
                  {/* Task Name with status and critical indicators */}
                  <div className="flex items-center gap-1 flex-1 px-2 min-w-0">
                    <GripVertical className="h-3 w-3 text-muted-foreground/30 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab flex-shrink-0" />
                    
                    {isCritical ? (
                      <Zap className="h-3 w-3 text-orange-500 flex-shrink-0" />
                    ) : (
                      <div className="w-3 flex-shrink-0" />
                    )}
                    
                    <div 
                      className={cn("w-2 h-2 rounded-full flex-shrink-0", statusColor.bg)}
                    />
                    
                    <span className="text-sm truncate flex-1">
                      {task.name}
                    </span>
                    
                    {/* Notes indicator */}
                    {task.description && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <MessageSquare className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                          </TooltipTrigger>
                          <TooltipContent className="max-w-xs">
                            <p className="text-xs">{task.description}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                  </div>
                  
                  {/* Duration */}
                  <div className="w-12 px-1 text-center text-xs flex-shrink-0">
                    {duration ?? '-'}
                  </div>
                  
                  {/* Start Day */}
                  <div className="w-14 px-1 text-center text-xs text-muted-foreground flex-shrink-0">
                    {startDay ? `D${startDay}` : '-'}
                  </div>
                  
                  {/* End Day */}
                  <div className="w-14 px-1 text-center text-xs text-muted-foreground flex-shrink-0">
                    {endDay ? `D${endDay}` : '-'}
                  </div>
                  
                  {/* Actions */}
                  <div className="w-8 flex items-center justify-center gap-0.5 flex-shrink-0">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className={cn(
                              "h-5 w-5 p-0 opacity-0 group-hover:opacity-100 transition-opacity",
                              isLinkSource && "opacity-100 text-blue-500"
                            )}
                            onClick={(e) => handleLinkClick(task.id, e)}
                          >
                            <Link2 className="h-3 w-3" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          {selection.linkingFromId === task.id 
                            ? 'Click to cancel' 
                            : selection.linkingFromId 
                              ? 'Create dependency to this task'
                              : 'Create dependency from this task'
                          }
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}