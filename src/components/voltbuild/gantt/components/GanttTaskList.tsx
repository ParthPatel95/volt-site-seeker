import React from 'react';
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
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useGantt } from '../context/GanttContext';
import { GanttTask, GanttPhase, TASK_STATUS_COLORS } from '../types/gantt.types';

interface GanttTaskListProps {
  onTaskClick?: (task: GanttTask) => void;
  onLinkClick?: (taskId: string) => void;
}

export function GanttTaskList({ onTaskClick, onLinkClick }: GanttTaskListProps) {
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

  return (
    <div 
      className="sticky left-0 z-10 bg-background border-r flex-shrink-0"
      style={{ width: config.taskListWidth }}
    >
      {phases.map(phase => {
        const phaseTasks = tasks.filter(t => t.phase_id === phase.id);
        const isExpanded = expandedPhases.has(phase.id);
        const completedTasks = phaseTasks.filter(t => t.status === 'complete').length;
        const criticalCount = phaseTasks.filter(t => criticalPathTasks.has(t.id)).length;

        return (
          <div key={phase.id}>
            {/* Phase Row */}
            <div 
              className={cn(
                "flex items-center gap-2 px-2 border-b cursor-pointer transition-colors",
                "hover:bg-accent/50"
              )}
              style={{ height: config.rowHeight }}
              onClick={() => togglePhase(phase.id)}
            >
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                )}
              </Button>
              
              <span className="font-medium text-sm truncate flex-1">
                {phase.name}
              </span>
              
              <div className="flex items-center gap-1.5">
                {criticalCount > 0 && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <Zap className="h-3.5 w-3.5 text-orange-500" />
                      </TooltipTrigger>
                      <TooltipContent>
                        {criticalCount} critical task{criticalCount !== 1 ? 's' : ''}
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
                
                <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                  {completedTasks}/{phaseTasks.length}
                </Badge>
              </div>
            </div>

            {/* Task Rows */}
            {isExpanded && phaseTasks.map(task => {
              const isSelected = selection.selectedTaskIds.has(task.id);
              const isHovered = selection.hoveredTaskId === task.id;
              const isLinkSource = selection.linkingFromId === task.id;
              const isCritical = criticalPathTasks.has(task.id);
              const statusColor = TASK_STATUS_COLORS[task.status];

              return (
                <div
                  key={task.id}
                  className={cn(
                    "flex items-center gap-1.5 px-2 pl-8 border-b cursor-pointer transition-colors group",
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
                  {/* Drag handle */}
                  <GripVertical className="h-3.5 w-3.5 text-muted-foreground/30 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab" />
                  
                  {/* Critical path indicator */}
                  {isCritical ? (
                    <Zap className="h-3.5 w-3.5 text-orange-500 flex-shrink-0" />
                  ) : (
                    <div className="w-3.5" />
                  )}
                  
                  {/* Status dot */}
                  <div 
                    className={cn("w-2 h-2 rounded-full flex-shrink-0", statusColor.bg)}
                  />
                  
                  {/* Task name */}
                  <span className="text-sm truncate flex-1">
                    {task.name}
                  </span>
                  
                  {/* Link button */}
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className={cn(
                            "h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity",
                            isLinkSource && "opacity-100 text-blue-500"
                          )}
                          onClick={(e) => handleLinkClick(task.id, e)}
                        >
                          <Link2 className="h-3.5 w-3.5" />
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
                  
                  {/* More options */}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => {
                      e.stopPropagation();
                      openContextMenu(e.clientX, e.clientY, task.id);
                    }}
                  >
                    <MoreHorizontal className="h-3.5 w-3.5" />
                  </Button>
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}
