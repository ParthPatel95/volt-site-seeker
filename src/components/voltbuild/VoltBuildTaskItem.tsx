import React from 'react';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CheckCircle2, Clock, AlertCircle, Circle, Flag } from 'lucide-react';
import { VoltBuildTask, TaskStatus, TASK_STATUS_CONFIG, ROLE_CONFIG } from './types/voltbuild.types';
import { cn } from '@/lib/utils';

interface VoltBuildTaskItemProps {
  task: VoltBuildTask;
  isSelected: boolean;
  onClick: () => void;
  onStatusChange: (status: TaskStatus) => void;
}

const TaskStatusIcon = ({ status }: { status: TaskStatus }) => {
  switch (status) {
    case 'complete':
      return <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400" />;
    case 'in_progress':
      return <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400" />;
    case 'blocked':
      return <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400" />;
    default:
      return <Circle className="w-4 h-4 text-muted-foreground" />;
  }
};

export function VoltBuildTaskItem({
  task,
  isSelected,
  onClick,
  onStatusChange,
}: VoltBuildTaskItemProps) {
  const statusConfig = TASK_STATUS_CONFIG[task.status];
  const roleConfig = ROLE_CONFIG[task.assigned_role];

  return (
    <div
      className={cn(
        'flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors',
        isSelected
          ? 'border-primary bg-primary/5'
          : 'border-border hover:border-primary/50 hover:bg-muted/50'
      )}
      onClick={onClick}
    >
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <TaskStatusIcon status={task.status} />

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span
              className={cn(
                'font-medium truncate',
                task.status === 'complete' && 'line-through text-muted-foreground'
              )}
            >
              {task.name}
            </span>
            {task.is_critical_path && (
              <Flag className="w-3 h-3 flex-shrink-0 text-red-500" />
            )}
          </div>
          {task.estimated_duration_days && (
            <span className="text-xs text-muted-foreground">
              Est. {task.estimated_duration_days} days
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 flex-shrink-0 ml-2">
        <Badge
          variant="outline"
          className={cn('hidden sm:flex text-xs', roleConfig.color)}
        >
          {roleConfig.label}
        </Badge>

        <Select
          value={task.status}
          onValueChange={(value) => {
            onStatusChange(value as TaskStatus);
          }}
        >
          <SelectTrigger
            className={cn(
              'h-7 w-[110px] text-xs',
              statusConfig.bgColor,
              statusConfig.color
            )}
            onClick={(e) => e.stopPropagation()}
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="not_started">Not Started</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="blocked">Blocked</SelectItem>
            <SelectItem value="complete">Complete</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
