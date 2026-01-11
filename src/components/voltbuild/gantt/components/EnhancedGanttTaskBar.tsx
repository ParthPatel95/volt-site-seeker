import React, { useState, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { format, parseISO, differenceInDays } from 'date-fns';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { 
  Zap, 
  User, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  MessageSquare,
} from 'lucide-react';
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

interface EnhancedGanttTaskBarProps {
  task: GanttTask;
  startDate: Date;
  endDate: Date;
  totalWidth: number;
  rowIndex: number;
  wbsCode?: string;
  projectStartDate?: Date | null;
  onDateChange?: (taskId: string, newStart: string, newEnd: string) => void;
  onClick?: (task: GanttTask) => void;
}

const DRAG_THRESHOLD = 5; // Minimum pixels to consider it a drag

export function EnhancedGanttTaskBar({
  task,
  startDate,
  endDate,
  totalWidth,
  rowIndex,
  wbsCode,
  projectStartDate,
  onDateChange,
  onClick,
}: EnhancedGanttTaskBarProps) {
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
  const top = config.headerHeight + (rowIndex * config.rowHeight) + (config.rowHeight - 30) / 2;

  // Status colors with enhanced styling
  const statusColor = isCritical ? TASK_STATUS_COLORS.critical : TASK_STATUS_COLORS[task.status];
  
  // Calculate days relative to project start
  const startDay = projectStartDate 
    ? differenceInDays(parseISO(task.estimated_start_date), projectStartDate) + 1 
    : null;
  const duration = calculateDuration(task.estimated_start_date, task.estimated_end_date);

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

  // Milestone rendering (diamond shape with enhanced styling)
  if (isMilestoneTask) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <motion.div
              className={cn(
                "absolute cursor-pointer transition-all",
                isSelected && "ring-2 ring-ring ring-offset-2",
                isHovered && "scale-125"
              )}
              style={{
                left: left + config.taskListWidth + 180 - 10,
                top: top + 5,
                width: 20,
                height: 20,
              }}
              initial={{ scale: 0, opacity: 0, rotate: 45 }}
              animate={{ scale: 1, opacity: 1, rotate: 45 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              onClick={handleClick}
              onMouseEnter={() => hoverTask(task.id)}
              onMouseLeave={() => hoverTask(null)}
            >
              <div 
                className={cn(
                  "w-full h-full rounded-sm shadow-md",
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

  // Calculate if task bar is wide enough for different elements
  const showProgress = width > 80 && config.showProgress;
  const showLabel = width > 60;
  const showPercentage = width > 100 && task.progress > 0;

  // Regular task bar with enhanced features
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <motion.div
            className={cn(
              "absolute rounded-md cursor-pointer transition-shadow group overflow-hidden",
              "border shadow-sm",
              isSelected && "ring-2 ring-ring ring-offset-1",
              isHovered && !isSelected && "ring-2 ring-ring/50 shadow-md",
              isCritical && "ring-2 ring-orange-400 border-orange-400",
              !isCritical && "border-transparent",
              dragMode && "opacity-90 shadow-lg"
            )}
            style={{
              left: left + config.taskListWidth + 180,
              top,
              width: Math.max(width, config.minTaskWidth),
              height: 30,
              backgroundColor: statusColor.fill,
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

            {/* Progress fill with gradient */}
            {showProgress && task.progress > 0 && (
              <motion.div 
                className="absolute inset-y-0 left-0 bg-white/30 rounded-l-md"
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(task.progress, 100)}%` }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
              />
            )}

            {/* Left resize handle */}
            <div 
              className="absolute left-0 top-0 bottom-0 w-2 cursor-ew-resize opacity-0 group-hover:opacity-100 bg-black/20 rounded-l-md transition-opacity z-20"
              onMouseDown={(e) => handleMouseDown(e, 'resize-left')}
            />

            {/* Right resize handle */}
            <div 
              className="absolute right-0 top-0 bottom-0 w-2 cursor-ew-resize opacity-0 group-hover:opacity-100 bg-black/20 rounded-r-md transition-opacity z-20"
              onMouseDown={(e) => handleMouseDown(e, 'resize-right')}
            />

            {/* Task content */}
            <div className="absolute inset-0 flex items-center justify-between px-2 pointer-events-none">
              {/* Left side - Task name and icons */}
              <div className="flex items-center gap-1.5 min-w-0 flex-1">
                {isCritical && (
                  <Zap className="w-3 h-3 text-white flex-shrink-0" />
                )}
                {showLabel && (
                  <span className="text-xs font-medium text-white truncate drop-shadow-sm">
                    {task.name}
                  </span>
                )}
              </div>
              
              {/* Right side - Progress percentage */}
              {showPercentage && (
                <span className="text-[10px] font-bold text-white/90 flex-shrink-0 ml-1 bg-black/20 px-1 rounded">
                  {task.progress}%
                </span>
              )}
            </div>

            {/* Bottom progress indicator bar */}
            {task.progress > 0 && task.progress < 100 && (
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/20">
                <motion.div 
                  className="h-full bg-white/60"
                  initial={{ width: 0 }}
                  animate={{ width: `${task.progress}%` }}
                />
              </div>
            )}

            {/* Baseline bar (if enabled and different from current) */}
            {config.showBaseline && task.baseline_start_date && task.baseline_end_date && (
              <div 
                className="absolute -bottom-3 h-2 bg-muted-foreground/40 rounded-full border border-muted-foreground/20"
                style={{
                  left: getPositionForDate(task.baseline_start_date, startDate, endDate, totalWidth) - left,
                  width: getWidthForRange(task.baseline_start_date, task.baseline_end_date, startDate, endDate, totalWidth),
                }}
              />
            )}
          </motion.div>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs">
          <div className="space-y-2">
            {/* Header */}
            <div className="flex items-center gap-2">
              {isCritical && <Zap className="w-4 h-4 text-orange-500" />}
              <p className="font-semibold">{task.name}</p>
            </div>
            
            {/* WBS Code */}
            {wbsCode && (
              <Badge variant="outline" className="text-[10px]">
                WBS: {wbsCode}
              </Badge>
            )}
            
            {/* Details grid */}
            <div className="text-xs space-y-1">
              <div className="flex items-center gap-2">
                <Calendar className="w-3 h-3 text-muted-foreground" />
                <span>{formatDateRange(task.estimated_start_date, task.estimated_end_date)}</span>
              </div>
              
              <div className="flex items-center gap-2">
                <Clock className="w-3 h-3 text-muted-foreground" />
                <span>Duration: {duration} days</span>
                {startDay && <span className="text-muted-foreground">• Day {startDay}</span>}
              </div>
              
              <div className="flex items-center gap-2">
                {task.status === 'complete' ? (
                  <CheckCircle2 className="w-3 h-3 text-green-500" />
                ) : task.status === 'blocked' ? (
                  <AlertCircle className="w-3 h-3 text-destructive" />
                ) : (
                  <div className={cn("w-3 h-3 rounded-full", statusColor.bg)} />
                )}
                <span className="capitalize">{task.status.replace('_', ' ')}</span>
                {task.progress > 0 && (
                  <span className="font-medium">• {task.progress}% complete</span>
                )}
              </div>
              
              {task.assigned_role && (
                <div className="flex items-center gap-2">
                  <User className="w-3 h-3 text-muted-foreground" />
                  <span>{task.assigned_role}</span>
                </div>
              )}
            </div>
            
            {/* Progress bar */}
            {task.progress > 0 && task.progress < 100 && (
              <div className="pt-1">
                <Progress value={task.progress} className="h-1.5" />
              </div>
            )}
            
            {/* Notes preview */}
            {task.description && (
              <div className="pt-1 border-t flex items-start gap-1.5">
                <MessageSquare className="w-3 h-3 text-muted-foreground mt-0.5 flex-shrink-0" />
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {task.description}
                </p>
              </div>
            )}
            
            {/* Critical path warning */}
            {isCritical && (
              <div className="pt-1 border-t">
                <p className="text-xs text-orange-600 font-medium flex items-center gap-1">
                  <Zap className="w-3 h-3" />
                  Critical Path Task
                </p>
              </div>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}