import React from 'react';
import { Badge } from '@/components/ui/badge';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { AlertTriangle, CheckCircle2, Clock, Zap, Link } from 'lucide-react';
import { TimelineTask } from '../types/voltbuild-timeline.types';
import { format, parseISO } from 'date-fns';

interface TimelineTaskBarProps {
  task: TimelineTask;
  left: number;
  width: number;
  showCriticalPath: boolean;
  isFiltered: boolean;
  onTaskClick: (task: TimelineTask) => void;
}

export function TimelineTaskBar({
  task,
  left,
  width,
  showCriticalPath,
  isFiltered,
  onTaskClick,
}: TimelineTaskBarProps) {
  const getStatusColor = () => {
    if (task.status === 'complete') return 'bg-green-500';
    if (task.status === 'blocked') return 'bg-red-500';
    if (task.status === 'in_progress') return 'bg-blue-500';
    return 'bg-gray-400';
  };

  const getStatusIcon = () => {
    if (task.status === 'complete') return <CheckCircle2 className="h-3 w-3" />;
    if (task.status === 'blocked') return <AlertTriangle className="h-3 w-3" />;
    if (task.status === 'in_progress') return <Clock className="h-3 w-3" />;
    return null;
  };

  const isCritical = task.is_critical;
  const opacity = showCriticalPath && !isCritical ? 'opacity-30' : 'opacity-100';
  const filtered = isFiltered ? 'opacity-30 pointer-events-none' : '';

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className={`absolute h-6 rounded-md cursor-pointer transition-all hover:scale-105 hover:shadow-md ${opacity} ${filtered}`}
            style={{
              left,
              width: Math.max(width, 20),
              top: 4,
            }}
            onClick={() => onTaskClick(task)}
          >
            {/* Background */}
            <div className={`absolute inset-0 rounded-md ${getStatusColor()} ${
              isCritical ? 'ring-2 ring-orange-500 ring-offset-1' : ''
            }`}>
              {/* Progress fill */}
              {task.progress > 0 && task.progress < 100 && (
                <div 
                  className="absolute inset-y-0 left-0 bg-white/30 rounded-l-md"
                  style={{ width: `${task.progress}%` }}
                />
              )}
            </div>

            {/* Content */}
            <div className="relative h-full flex items-center px-2 gap-1 text-white text-[10px] font-medium overflow-hidden">
              {getStatusIcon()}
              {isCritical && <Zap className="h-3 w-3 text-orange-300" />}
              {task.depends_on && <Link className="h-2.5 w-2.5 opacity-70" />}
              <span className="truncate">{task.title}</span>
            </div>
          </div>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs">
          <div className="space-y-1.5">
            <div className="font-medium">{task.title}</div>
            <div className="flex items-center gap-2 text-xs">
              <Badge variant="outline" className="text-[10px] capitalize">
                {task.status.replace('_', ' ')}
              </Badge>
              <Badge variant="outline" className="text-[10px] capitalize">
                {task.priority}
              </Badge>
              {isCritical && (
                <Badge className="bg-orange-500 text-[10px]">Critical</Badge>
              )}
            </div>
            {(task.estimated_start_date || task.estimated_end_date) && (
              <div className="text-xs text-muted-foreground">
                {task.estimated_start_date && (
                  <span>Start: {format(parseISO(task.estimated_start_date), 'MMM d, yyyy')}</span>
                )}
                {task.estimated_start_date && task.estimated_end_date && ' → '}
                {task.estimated_end_date && (
                  <span>End: {format(parseISO(task.estimated_end_date), 'MMM d, yyyy')}</span>
                )}
              </div>
            )}
            {task.depends_on && (
              <div className="text-xs text-muted-foreground flex items-center gap-1">
                <Link className="h-3 w-3" />
                Has dependency
              </div>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
