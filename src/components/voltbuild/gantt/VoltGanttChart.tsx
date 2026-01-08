import React, { useState, useMemo, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  ChevronDown, 
  ChevronRight, 
  Link as LinkIcon,
  Zap,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { VoltBuildPhase } from '../types/voltbuild.types';
import { format, differenceInDays, eachDayOfInterval, eachWeekOfInterval, isWeekend, parseISO, addDays } from 'date-fns';

// Extended task type for Gantt with date fields
export interface GanttTask {
  id: string;
  phase_id: string;
  name: string;
  status: 'not_started' | 'in_progress' | 'blocked' | 'complete';
  is_critical_path: boolean;
  estimated_start_date: string | null;
  estimated_end_date: string | null;
  actual_start_date: string | null;
  actual_end_date: string | null;
}

interface TaskDependency {
  id: string;
  predecessor_task_id: string;
  successor_task_id: string;
  dependency_type: 'finish_to_start' | 'start_to_start' | 'finish_to_finish' | 'start_to_finish';
  lag_days: number;
}

interface VoltGanttChartProps {
  phases: VoltBuildPhase[];
  tasks: GanttTask[];
  dependencies?: TaskDependency[];
  startDate: Date;
  endDate: Date;
  onTaskClick?: (task: GanttTask) => void;
  onDependencyAdd?: (predecessorTaskId: string, successorTaskId: string) => void;
}

const ZOOM_LEVELS = {
  day: { columnWidth: 40, format: 'd', headerFormat: 'MMM yyyy' },
  week: { columnWidth: 100, format: "'W'w", headerFormat: 'MMM yyyy' },
  month: { columnWidth: 150, format: 'MMM', headerFormat: 'yyyy' },
};

type ZoomLevel = keyof typeof ZOOM_LEVELS;

export function VoltGanttChart({
  phases,
  tasks,
  dependencies = [],
  startDate,
  endDate,
  onTaskClick,
  onDependencyAdd,
}: VoltGanttChartProps) {
  const [zoomLevel, setZoomLevel] = useState<ZoomLevel>('week');
  const [expandedPhases, setExpandedPhases] = useState<Set<string>>(new Set(phases.map(p => p.id)));
  const [hoveredTask, setHoveredTask] = useState<string | null>(null);
  const [linkingFrom, setLinkingFrom] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const config = ZOOM_LEVELS[zoomLevel];

  // Calculate time columns based on zoom level
  const timeColumns = useMemo(() => {
    if (zoomLevel === 'day') {
      return eachDayOfInterval({ start: startDate, end: endDate });
    } else if (zoomLevel === 'week') {
      return eachWeekOfInterval({ start: startDate, end: endDate });
    } else {
      // Month view - simplified
      const months: Date[] = [];
      let current = new Date(startDate);
      while (current <= endDate) {
        months.push(new Date(current));
        current = new Date(current.getFullYear(), current.getMonth() + 1, 1);
      }
      return months;
    }
  }, [startDate, endDate, zoomLevel]);

  const totalWidth = timeColumns.length * config.columnWidth;
  const leftColumnWidth = 280;

  // Get position for a date
  const getPositionForDate = (date: Date): number => {
    const totalDays = differenceInDays(endDate, startDate);
    const dayOffset = differenceInDays(date, startDate);
    return (dayOffset / totalDays) * totalWidth;
  };

  // Get width for a date range
  const getWidthForRange = (start: Date, end: Date): number => {
    const days = differenceInDays(end, start);
    const totalDays = differenceInDays(endDate, startDate);
    return Math.max((days / totalDays) * totalWidth, 20);
  };

  // Today line position
  const today = new Date();
  const todayPosition = getPositionForDate(today);
  const showTodayLine = today >= startDate && today <= endDate;

  // Toggle phase expansion
  const togglePhase = (phaseId: string) => {
    const newExpanded = new Set(expandedPhases);
    if (newExpanded.has(phaseId)) {
      newExpanded.delete(phaseId);
    } else {
      newExpanded.add(phaseId);
    }
    setExpandedPhases(newExpanded);
  };

  // Get task bar color based on status
  const getTaskBarColor = (task: GanttTask) => {
    if (task.is_critical_path) return 'bg-orange-500';
    switch (task.status) {
      case 'complete': return 'bg-green-500';
      case 'in_progress': return 'bg-blue-500';
      case 'blocked': return 'bg-red-500';
      default: return 'bg-muted-foreground/50';
    }
  };

  // Handle linking tasks
  const handleTaskLinkClick = (taskId: string) => {
    if (!onDependencyAdd) return;
    
    if (linkingFrom === null) {
      setLinkingFrom(taskId);
    } else if (linkingFrom !== taskId) {
      onDependencyAdd(linkingFrom, taskId);
      setLinkingFrom(null);
    } else {
      setLinkingFrom(null);
    }
  };

  // Render dependency lines
  const renderDependencyLines = () => {
    return dependencies.map((dep) => {
      const predecessorTask = tasks.find(t => t.id === dep.predecessor_task_id);
      const successorTask = tasks.find(t => t.id === dep.successor_task_id);
      
      if (!predecessorTask || !successorTask) return null;
      if (!predecessorTask.estimated_end_date || !successorTask.estimated_start_date) return null;

      const predecessorEnd = parseISO(predecessorTask.estimated_end_date);
      const successorStart = parseISO(successorTask.estimated_start_date);
      
      const x1 = getPositionForDate(predecessorEnd) + leftColumnWidth;
      const x2 = getPositionForDate(successorStart) + leftColumnWidth;
      
      // Y positions would need task row indices - simplified for now
      return (
        <svg
          key={dep.id}
          className="absolute inset-0 pointer-events-none"
          style={{ zIndex: 5 }}
        >
          <path
            d={`M ${x1} 50 C ${x1 + 20} 50, ${x2 - 20} 80, ${x2} 80`}
            stroke="hsl(var(--primary))"
            strokeWidth={2}
            fill="none"
            markerEnd="url(#arrowhead)"
          />
          <defs>
            <marker
              id="arrowhead"
              markerWidth="10"
              markerHeight="7"
              refX="9"
              refY="3.5"
              orient="auto"
            >
              <polygon
                points="0 0, 10 3.5, 0 7"
                fill="hsl(var(--primary))"
              />
            </marker>
          </defs>
        </svg>
      );
    });
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Gantt Chart</CardTitle>
          <div className="flex items-center gap-2">
            {linkingFrom && (
              <Badge variant="outline" className="animate-pulse">
                Click target task to link
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="ml-2 h-4 w-4 p-0"
                  onClick={() => setLinkingFrom(null)}
                >
                  ×
                </Button>
              </Badge>
            )}
            <div className="flex items-center border rounded-lg">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setZoomLevel('day')}
                className={cn(zoomLevel === 'day' && 'bg-accent')}
              >
                Day
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setZoomLevel('week')}
                className={cn(zoomLevel === 'week' && 'bg-accent')}
              >
                Week
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setZoomLevel('month')}
                className={cn(zoomLevel === 'month' && 'bg-accent')}
              >
                Month
              </Button>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className="border-t">
          <ScrollArea className="w-full">
            <div 
              ref={containerRef}
              className="relative"
              style={{ width: leftColumnWidth + totalWidth }}
            >
              {/* Header Row */}
              <div className="flex border-b bg-muted/50 sticky top-0 z-10">
                <div 
                  className="flex-shrink-0 border-r px-4 py-2 font-medium text-sm sticky left-0 bg-muted/50 z-20"
                  style={{ width: leftColumnWidth }}
                >
                  Phase / Task
                </div>
                <div className="flex">
                  {timeColumns.map((date, idx) => (
                    <div
                      key={idx}
                      className={cn(
                        "flex-shrink-0 px-2 py-2 text-xs text-center border-r font-medium",
                        zoomLevel === 'day' && isWeekend(date) && "bg-muted"
                      )}
                      style={{ width: config.columnWidth }}
                    >
                      {format(date, config.format)}
                    </div>
                  ))}
                </div>
              </div>

              {/* Dependency Lines */}
              {renderDependencyLines()}

              {/* Today Line */}
              {showTodayLine && (
                <div 
                  className="absolute top-0 bottom-0 w-0.5 bg-primary z-30 pointer-events-none"
                  style={{ left: leftColumnWidth + todayPosition }}
                >
                  <div className="absolute -top-1 -left-2 px-1.5 py-0.5 bg-primary text-primary-foreground text-[10px] rounded">
                    Today
                  </div>
                </div>
              )}

              {/* Phases and Tasks */}
              {phases.map((phase) => {
                const phaseTasks = tasks.filter(t => t.phase_id === phase.id);
                const isExpanded = expandedPhases.has(phase.id);

                // Calculate phase bar dates
                const phaseStart = phase.estimated_start_date ? parseISO(phase.estimated_start_date) : null;
                const phaseEnd = phase.estimated_end_date ? parseISO(phase.estimated_end_date) : null;

                return (
                  <div key={phase.id}>
                    {/* Phase Row */}
                    <div className="flex border-b hover:bg-accent/30 transition-colors">
                      <div 
                        className="flex-shrink-0 border-r px-2 py-2 flex items-center gap-2 cursor-pointer sticky left-0 bg-background z-10"
                        style={{ width: leftColumnWidth }}
                        onClick={() => togglePhase(phase.id)}
                      >
                        {isExpanded ? (
                          <ChevronDown className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        )}
                        <span className="font-medium text-sm truncate">{phase.name}</span>
                        <Badge variant="outline" className="ml-auto text-xs">
                          {phaseTasks.length}
                        </Badge>
                      </div>
                      <div className="relative flex-1" style={{ height: 36 }}>
                        {phaseStart && phaseEnd && (
                          <div
                            className="absolute top-1/2 -translate-y-1/2 h-5 bg-primary/20 rounded border border-primary/30"
                            style={{
                              left: getPositionForDate(phaseStart),
                              width: getWidthForRange(phaseStart, phaseEnd),
                            }}
                          />
                        )}
                      </div>
                    </div>

                    {/* Task Rows */}
                    {isExpanded && phaseTasks.map((task) => {
                      const taskStart = task.estimated_start_date ? parseISO(task.estimated_start_date) : null;
                      const taskEnd = task.estimated_end_date ? parseISO(task.estimated_end_date) : null;
                      const isHovered = hoveredTask === task.id;
                      const isLinkSource = linkingFrom === task.id;

                      return (
                        <div 
                          key={task.id} 
                          className={cn(
                            "flex border-b hover:bg-accent/20 transition-colors",
                            isLinkSource && "bg-primary/10"
                          )}
                          onMouseEnter={() => setHoveredTask(task.id)}
                          onMouseLeave={() => setHoveredTask(null)}
                        >
                          <div 
                            className="flex-shrink-0 border-r px-2 py-2 flex items-center gap-2 pl-8 sticky left-0 bg-background z-10"
                            style={{ width: leftColumnWidth }}
                          >
                            {task.is_critical_path && (
                              <Zap className="h-3 w-3 text-orange-500 flex-shrink-0" />
                            )}
                            <span 
                              className="text-sm truncate flex-1 cursor-pointer hover:text-primary"
                              onClick={() => onTaskClick?.(task)}
                            >
                              {task.name}
                            </span>
                            {onDependencyAdd && (
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className={cn(
                                        "h-6 w-6 p-0 opacity-0 transition-opacity",
                                        (isHovered || isLinkSource) && "opacity-100"
                                      )}
                                      onClick={() => handleTaskLinkClick(task.id)}
                                    >
                                      <LinkIcon className="h-3 w-3" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    {linkingFrom ? 'Click to create dependency' : 'Link to another task'}
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            )}
                          </div>
                          <div className="relative flex-1" style={{ height: 36 }}>
                            {taskStart && taskEnd && (
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <div
                                      className={cn(
                                        "absolute top-1/2 -translate-y-1/2 h-6 rounded cursor-pointer transition-all",
                                        getTaskBarColor(task),
                                        isHovered && "ring-2 ring-ring ring-offset-1",
                                        task.is_critical_path && "ring-2 ring-orange-400"
                                      )}
                                      style={{
                                        left: getPositionForDate(taskStart),
                                        width: getWidthForRange(taskStart, taskEnd),
                                      }}
                                      onClick={() => onTaskClick?.(task)}
                                    >
                                      {/* Progress bar */}
                                      {task.status === 'in_progress' && (
                                        <div 
                                          className="absolute inset-y-0 left-0 bg-white/30 rounded-l"
                                          style={{ width: '50%' }}
                                        />
                                      )}
                                    </div>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <div className="text-sm">
                                      <p className="font-medium">{task.name}</p>
                                      <p className="text-xs text-muted-foreground">
                                        {format(taskStart, 'MMM d')} - {format(taskEnd, 'MMM d, yyyy')}
                                      </p>
                                      <p className="text-xs capitalize">{task.status.replace('_', ' ')}</p>
                                    </div>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })}

              {/* Legend */}
              <div className="flex items-center gap-4 p-4 text-xs text-muted-foreground border-t bg-muted/30">
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-sm bg-green-500" />
                  <span>Complete</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-sm bg-blue-500" />
                  <span>In Progress</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-sm bg-muted-foreground/50" />
                  <span>Not Started</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-sm bg-red-500" />
                  <span>Blocked</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-sm bg-orange-500 ring-2 ring-orange-400" />
                  <span>Critical Path</span>
                </div>
              </div>
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </div>
      </CardContent>
    </Card>
  );
}
