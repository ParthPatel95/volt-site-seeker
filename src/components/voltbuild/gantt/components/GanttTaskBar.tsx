import React, { useState, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { format, parseISO } from 'date-fns';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { useGantt } from '../context/GanttContext';
import { GanttTask, TASK_STATUS_COLORS, TaskBarDragMode } from '../types/gantt.types';
import { 
  getPositionForDate, 
  getWidthForRange, 
  getDateForPosition,
  formatDateRange,
  calculateDuration,
  isMilestone,
} from '../utils/dateCalculations';

interface GanttTaskBarProps {
  task: GanttTask;
  startDate: Date;
  endDate: Date;
  totalWidth: number;
  rowIndex: number;
  onDateChange?: (taskId: string, newStart: string, newEnd: string) => void;
  onClick?: (task: GanttTask) => void;
}

const DRAG_THRESHOLD = 5; // Minimum pixels to consider it a drag

export function GanttTaskBar({
  task,
  startDate,
  endDate,
  totalWidth,
  rowIndex,
  onDateChange,
  onClick,
}: GanttTaskBarProps) {
  const { state, selectTask, hoverTask, criticalPathTasks } = useGantt();
  const { config, selection } = state;
  
  const [dragMode, setDragMode] = useState<TaskBarDragMode>(null);
  const [dragOffset, setDragOffset] = useState({ left: 0, width: 0 });
  const dragStartRef = useRef<{ x: number; originalLeft: number; originalWidth: number } | null>(null);
  const dragOffsetRef = useRef({ left: 0, width: 0 });
  const hasDraggedRef = useRef(false);

  const isSelected = selection.selectedTaskIds.has(task.id);
  const isHovered = selection.hoveredTaskId === task.id;
  const isCritical = criticalPathTasks.has(task.id);
  const isMilestoneTask = isMilestone(task);

  // Calculate position and dimensions
  if (!task.estimated_start_date || !task.estimated_end_date) {
    return null;
  }

  const baseLeft = getPositionForDate(task.estimated_start_date, startDate, endDate, totalWidth);
  const baseWidth = getWidthForRange(task.estimated_start_date, task.estimated_end_date, startDate, endDate, totalWidth);
  
  const left = dragMode ? baseLeft + dragOffset.left : baseLeft;
  const width = dragMode ? baseWidth + dragOffset.width : baseWidth;
  const top = config.headerHeight + (rowIndex * config.rowHeight) + (config.rowHeight - 28) / 2;

  // Status colors
  const statusColor = isCritical ? TASK_STATUS_COLORS.critical : TASK_STATUS_COLORS[task.status];

  // Drag handlers
  const handleMouseDown = useCallback((e: React.MouseEvent, mode: TaskBarDragMode) => {
    e.preventDefault();
    e.stopPropagation();
    
    setDragMode(mode);
    hasDraggedRef.current = false;
    dragOffsetRef.current = { left: 0, width: 0 };
    dragStartRef.current = {
      x: e.clientX,
      originalLeft: baseLeft,
      originalWidth: baseWidth,
    };

    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (!dragStartRef.current) return;
      
      const deltaX = moveEvent.clientX - dragStartRef.current.x;
      
      // Check if we've exceeded the drag threshold
      if (Math.abs(deltaX) > DRAG_THRESHOLD) {
        hasDraggedRef.current = true;
      }
      
      let newOffset = { left: 0, width: 0 };
      
      if (mode === 'move') {
        newOffset = { left: deltaX, width: 0 };
      } else if (mode === 'resize-left') {
        const boundedOffset = Math.min(deltaX, dragStartRef.current.originalWidth - config.minTaskWidth);
        newOffset = { left: boundedOffset, width: -boundedOffset };
      } else if (mode === 'resize-right') {
        const boundedWidth = Math.max(config.minTaskWidth - dragStartRef.current.originalWidth, deltaX);
        newOffset = { left: 0, width: boundedWidth };
      }
      
      dragOffsetRef.current = newOffset;
      setDragOffset(newOffset);
    };

    const handleMouseUp = () => {
      // Only save if we actually dragged and have a handler
      if (hasDraggedRef.current && dragStartRef.current && onDateChange) {
        const currentOffset = dragOffsetRef.current;
        const finalLeft = dragStartRef.current.originalLeft + currentOffset.left;
        const finalWidth = dragStartRef.current.originalWidth + currentOffset.width;
        
        const newStartDate = getDateForPosition(finalLeft, startDate, endDate, totalWidth);
        const newEndDate = getDateForPosition(finalLeft + finalWidth, startDate, endDate, totalWidth);
        
        onDateChange(
          task.id,
          format(newStartDate, 'yyyy-MM-dd'),
          format(newEndDate, 'yyyy-MM-dd')
        );
      }
      
      setDragMode(null);
      setDragOffset({ left: 0, width: 0 });
      dragOffsetRef.current = { left: 0, width: 0 };
      dragStartRef.current = null;
      
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [baseLeft, baseWidth, config.minTaskWidth, onDateChange, task.id, startDate, endDate, totalWidth]);

  const handleClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    // Only open popup if we didn't drag
    if (!hasDraggedRef.current) {
      selectTask(task.id);
      onClick?.(task);
    }
    // Reset the flag after click is processed
    hasDraggedRef.current = false;
  }, [selectTask, task, onClick]);

  // Milestone rendering (diamond shape)
  if (isMilestoneTask) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <motion.div
              className={cn(
                "absolute cursor-pointer transition-all",
                isSelected && "ring-2 ring-ring ring-offset-2",
                isHovered && "scale-110"
              )}
              style={{
                left: left + config.taskListWidth - 8,
                top: top + 6,
                width: 16,
                height: 16,
              }}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              onClick={handleClick}
              onMouseEnter={() => hoverTask(task.id)}
              onMouseLeave={() => hoverTask(null)}
            >
              <div 
                className={cn(
                  "w-full h-full rotate-45 rounded-sm",
                  statusColor.bg,
                  isCritical && "ring-2 ring-orange-400"
                )}
              />
            </motion.div>
          </TooltipTrigger>
          <TooltipContent>
            <div className="space-y-1">
              <p className="font-medium">{task.name}</p>
              <p className="text-xs text-muted-foreground">
                Milestone: {formatDateRange(task.estimated_start_date, task.estimated_end_date)}
              </p>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  // Regular task bar
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <motion.div
            className={cn(
              "absolute rounded cursor-pointer transition-shadow group",
              statusColor.bg,
              isSelected && "ring-2 ring-ring ring-offset-1",
              isHovered && !isSelected && "ring-2 ring-ring/50",
              isCritical && "ring-2 ring-orange-400",
              dragMode && "opacity-80 shadow-lg"
            )}
            style={{
              left: left + config.taskListWidth,
              top,
              width: Math.max(width, config.minTaskWidth),
              height: 28,
            }}
            initial={{ scaleX: 0, opacity: 0 }}
            animate={{ scaleX: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            onMouseDown={(e) => handleMouseDown(e, 'move')}
            onMouseEnter={() => hoverTask(task.id)}
            onMouseLeave={() => hoverTask(null)}
          >
            {/* Clickable overlay - only triggers click if no drag */}
            <div 
              className="absolute inset-0 z-10"
              onClick={handleClick}
            />

            {/* Progress fill */}
            {config.showProgress && task.progress > 0 && (
              <div 
                className="absolute inset-y-0 left-0 bg-white/30 rounded-l"
                style={{ width: `${task.progress}%` }}
              />
            )}

            {/* Left resize handle */}
            <div 
              className="absolute left-0 top-0 bottom-0 w-2 cursor-ew-resize opacity-0 group-hover:opacity-100 bg-black/20 rounded-l transition-opacity z-20"
              onMouseDown={(e) => handleMouseDown(e, 'resize-left')}
            />

            {/* Right resize handle */}
            <div 
              className="absolute right-0 top-0 bottom-0 w-2 cursor-ew-resize opacity-0 group-hover:opacity-100 bg-black/20 rounded-r transition-opacity z-20"
              onMouseDown={(e) => handleMouseDown(e, 'resize-right')}
            />

            {/* Task label (shown if wide enough) */}
            {width > 60 && (
              <div className="absolute inset-0 flex items-center justify-center px-2 pointer-events-none">
                <span className="text-xs font-medium text-white truncate drop-shadow-sm">
                  {task.name}
                </span>
              </div>
            )}

            {/* Baseline bar (if enabled and different from current) */}
            {config.showBaseline && task.baseline_start_date && task.baseline_end_date && (
              <div 
                className="absolute -bottom-2 h-1.5 bg-muted-foreground/30 rounded-full"
                style={{
                  left: getPositionForDate(task.baseline_start_date, startDate, endDate, totalWidth) - left,
                  width: getWidthForRange(task.baseline_start_date, task.baseline_end_date, startDate, endDate, totalWidth),
                }}
              />
            )}
          </motion.div>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs">
          <div className="space-y-1.5">
            <p className="font-medium">{task.name}</p>
            <div className="text-xs space-y-0.5">
              <p className="text-muted-foreground">
                {formatDateRange(task.estimated_start_date, task.estimated_end_date)}
              </p>
              <p className="text-muted-foreground">
                Duration: {calculateDuration(task.estimated_start_date, task.estimated_end_date)} days
              </p>
              <div className="flex items-center gap-2">
                <span className="capitalize">{task.status.replace('_', ' ')}</span>
                {task.progress > 0 && <span>• {task.progress}% complete</span>}
              </div>
              {isCritical && (
                <p className="text-orange-600 font-medium">⚡ Critical Path</p>
              )}
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}