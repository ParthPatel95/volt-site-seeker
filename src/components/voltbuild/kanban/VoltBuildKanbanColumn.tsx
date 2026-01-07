import React from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CheckCircle2, Clock, AlertCircle, Circle, Plus } from 'lucide-react';
import { TaskStatus, TASK_STATUS_CONFIG } from '../types/voltbuild.types';
import { cn } from '@/lib/utils';

interface VoltBuildKanbanColumnProps {
  status: TaskStatus;
  count: number;
  children: React.ReactNode;
  onDrop: (e: React.DragEvent, status: TaskStatus) => void;
  onDragOver: (e: React.DragEvent) => void;
  onAddTask?: () => void;
  isDragOver: boolean;
}

const StatusIcon = ({ status }: { status: TaskStatus }) => {
  const iconClass = "w-4 h-4";
  switch (status) {
    case 'complete':
      return <CheckCircle2 className={cn(iconClass, "text-green-600 dark:text-green-400")} />;
    case 'in_progress':
      return <Clock className={cn(iconClass, "text-blue-600 dark:text-blue-400")} />;
    case 'blocked':
      return <AlertCircle className={cn(iconClass, "text-red-600 dark:text-red-400")} />;
    default:
      return <Circle className={cn(iconClass, "text-muted-foreground")} />;
  }
};

export function VoltBuildKanbanColumn({
  status,
  count,
  children,
  onDrop,
  onDragOver,
  onAddTask,
  isDragOver,
}: VoltBuildKanbanColumnProps) {
  const config = TASK_STATUS_CONFIG[status];

  const getColumnBgColor = (status: TaskStatus) => {
    switch (status) {
      case 'complete':
        return 'bg-green-500/5';
      case 'in_progress':
        return 'bg-blue-500/5';
      case 'blocked':
        return 'bg-red-500/5';
      default:
        return 'bg-muted/30';
    }
  };

  return (
    <div
      className={cn(
        'flex flex-col rounded-lg border h-full min-h-[400px]',
        getColumnBgColor(status),
        isDragOver && 'ring-2 ring-primary ring-offset-2 ring-offset-background'
      )}
      onDrop={(e) => onDrop(e, status)}
      onDragOver={onDragOver}
    >
      {/* Column Header */}
      <div className="flex items-center justify-between p-3 border-b bg-background/50 backdrop-blur-sm rounded-t-lg sticky top-0">
        <div className="flex items-center gap-2">
          <StatusIcon status={status} />
          <span className={cn('font-medium text-sm', config.color)}>
            {config.label}
          </span>
          <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded-full">
            {count}
          </span>
        </div>
      </div>

      {/* Column Content */}
      <ScrollArea className="flex-1 p-2">
        <div className="space-y-2">
          {children}
        </div>
      </ScrollArea>

      {/* Add Task Button */}
      {onAddTask && status !== 'complete' && (
        <div className="p-2 border-t">
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start text-muted-foreground hover:text-foreground"
            onClick={onAddTask}
          >
            <Plus className="w-4 h-4 mr-1" />
            Add Task
          </Button>
        </div>
      )}
    </div>
  );
}
