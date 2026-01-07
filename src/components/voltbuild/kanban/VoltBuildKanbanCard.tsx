import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Flag, MessageSquare, Paperclip, GripVertical, Clock } from 'lucide-react';
import { VoltBuildTask, VoltBuildPhase, ROLE_CONFIG } from '../types/voltbuild.types';
import { cn } from '@/lib/utils';

interface VoltBuildKanbanCardProps {
  task: VoltBuildTask;
  phase?: VoltBuildPhase;
  isSelected: boolean;
  onClick: () => void;
  onDragStart: (e: React.DragEvent, taskId: string) => void;
  commentCount?: number;
  documentCount?: number;
}

export function VoltBuildKanbanCard({
  task,
  phase,
  isSelected,
  onClick,
  onDragStart,
  commentCount = 0,
  documentCount = 0,
}: VoltBuildKanbanCardProps) {
  const roleConfig = ROLE_CONFIG[task.assigned_role];

  const getInitials = (name: string | null | undefined) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, task.id)}
      onClick={onClick}
      className={cn(
        'group p-3 rounded-lg border bg-card cursor-pointer transition-all',
        'hover:shadow-md hover:border-primary/50',
        isSelected && 'ring-2 ring-primary border-primary',
        task.status === 'complete' && 'opacity-75'
      )}
    >
      {/* Drag Handle & Task Name */}
      <div className="flex items-start gap-2">
        <GripVertical className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 mt-0.5 cursor-grab" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span
              className={cn(
                'font-medium text-sm line-clamp-2',
                task.status === 'complete' && 'line-through text-muted-foreground'
              )}
            >
              {task.name}
            </span>
            {task.is_critical_path && (
              <Flag className="w-3 h-3 text-red-500 flex-shrink-0" />
            )}
          </div>
        </div>
      </div>

      {/* Phase Badge */}
      {phase && (
        <div className="mt-2">
          <Badge variant="outline" className="text-xs font-normal truncate max-w-full">
            {phase.name}
          </Badge>
        </div>
      )}

      {/* Footer Row */}
      <div className="flex items-center justify-between mt-3 gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          {/* Role Badge */}
          <Badge
            variant="outline"
            className={cn('text-xs py-0 h-5', roleConfig.color)}
          >
            {roleConfig.label}
          </Badge>

          {/* Duration */}
          {task.estimated_duration_days && (
            <span className="flex items-center gap-0.5 text-xs text-muted-foreground">
              <Clock className="w-3 h-3" />
              {task.estimated_duration_days}d
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Indicators */}
          {documentCount > 0 && (
            <span className="flex items-center gap-0.5 text-xs text-muted-foreground">
              <Paperclip className="w-3 h-3" />
              {documentCount}
            </span>
          )}
          {commentCount > 0 && (
            <span className="flex items-center gap-0.5 text-xs text-muted-foreground">
              <MessageSquare className="w-3 h-3" />
              {commentCount}
            </span>
          )}

          {/* Assigned User Avatar */}
          {task.assigned_user_id && task.assigned_user && (
            <Avatar className="w-6 h-6">
              <AvatarFallback className="text-xs bg-primary/10 text-primary">
                {getInitials(task.assigned_user.full_name)}
              </AvatarFallback>
            </Avatar>
          )}
        </div>
      </div>
    </div>
  );
}
