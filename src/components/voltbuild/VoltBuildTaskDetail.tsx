import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Calendar, Clock, Flag, MessageSquare, Trash2, Save, X } from 'lucide-react';
import {
  VoltBuildTask,
  TaskStatus,
  AssignedRole,
  TASK_STATUS_CONFIG,
  ROLE_CONFIG,
} from './types/voltbuild.types';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface VoltBuildTaskDetailProps {
  task: VoltBuildTask;
  onUpdate: (updates: Partial<VoltBuildTask>) => void;
  onDelete: () => void;
  onClose: () => void;
}

export function VoltBuildTaskDetail({
  task,
  onUpdate,
  onDelete,
  onClose,
}: VoltBuildTaskDetailProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTask, setEditedTask] = useState(task);
  const [newComment, setNewComment] = useState('');

  const statusConfig = TASK_STATUS_CONFIG[task.status];
  const roleConfig = ROLE_CONFIG[task.assigned_role];

  const handleSave = () => {
    onUpdate({
      name: editedTask.name,
      description: editedTask.description,
      assigned_role: editedTask.assigned_role,
      estimated_duration_days: editedTask.estimated_duration_days,
      is_critical_path: editedTask.is_critical_path,
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedTask(task);
    setIsEditing(false);
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            {isEditing ? (
              <Input
                value={editedTask.name}
                onChange={(e) =>
                  setEditedTask({ ...editedTask, name: e.target.value })
                }
                className="text-lg font-semibold"
              />
            ) : (
              <CardTitle className="text-lg truncate">{task.name}</CardTitle>
            )}
          </div>
          <div className="flex items-center gap-1 ml-2">
            {isEditing ? (
              <>
                <Button size="icon" variant="ghost" onClick={handleSave}>
                  <Save className="w-4 h-4" />
                </Button>
                <Button size="icon" variant="ghost" onClick={handleCancel}>
                  <X className="w-4 h-4" />
                </Button>
              </>
            ) : (
              <>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setIsEditing(true)}
                >
                  Edit
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="text-destructive hover:text-destructive"
                  onClick={onDelete}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </>
            )}
            <Button
              size="icon"
              variant="ghost"
              onClick={onClose}
              className="md:hidden"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Status & Role */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-muted-foreground">Status</Label>
            <Select
              value={task.status}
              onValueChange={(value) => onUpdate({ status: value as TaskStatus })}
            >
              <SelectTrigger className={cn(statusConfig.bgColor, statusConfig.color)}>
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

          <div className="space-y-2">
            <Label className="text-muted-foreground">Assigned Role</Label>
            {isEditing ? (
              <Select
                value={editedTask.assigned_role}
                onValueChange={(value) =>
                  setEditedTask({ ...editedTask, assigned_role: value as AssignedRole })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="owner">Owner</SelectItem>
                  <SelectItem value="engineer">Engineer</SelectItem>
                  <SelectItem value="contractor">Contractor</SelectItem>
                  <SelectItem value="utility">Utility</SelectItem>
                </SelectContent>
              </Select>
            ) : (
              <Badge variant="outline" className={cn('w-full justify-center py-2', roleConfig.color)}>
                {roleConfig.label}
              </Badge>
            )}
          </div>
        </div>

        {/* Description */}
        <div className="space-y-2">
          <Label className="text-muted-foreground">Description</Label>
          {isEditing ? (
            <Textarea
              value={editedTask.description || ''}
              onChange={(e) =>
                setEditedTask({ ...editedTask, description: e.target.value })
              }
              rows={3}
            />
          ) : (
            <p className="text-sm text-foreground">
              {task.description || 'No description provided'}
            </p>
          )}
        </div>

        {/* Duration & Critical Path */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="flex items-center gap-1 text-muted-foreground">
              <Clock className="w-3 h-3" />
              Est. Duration
            </Label>
            {isEditing ? (
              <Input
                type="number"
                value={editedTask.estimated_duration_days || ''}
                onChange={(e) =>
                  setEditedTask({
                    ...editedTask,
                    estimated_duration_days: parseInt(e.target.value) || null,
                  })
                }
                placeholder="Days"
              />
            ) : (
              <p className="text-sm font-medium">
                {task.estimated_duration_days
                  ? `${task.estimated_duration_days} days`
                  : 'Not set'}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-1 text-muted-foreground">
              <Flag className="w-3 h-3" />
              Critical Path
            </Label>
            {isEditing ? (
              <Select
                value={editedTask.is_critical_path ? 'yes' : 'no'}
                onValueChange={(value) =>
                  setEditedTask({ ...editedTask, is_critical_path: value === 'yes' })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="yes">Yes</SelectItem>
                  <SelectItem value="no">No</SelectItem>
                </SelectContent>
              </Select>
            ) : (
              <Badge
                variant={task.is_critical_path ? 'destructive' : 'secondary'}
                className="font-normal"
              >
                {task.is_critical_path ? 'Critical' : 'Non-Critical'}
              </Badge>
            )}
          </div>
        </div>

        {/* Dates */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="flex items-center gap-1 text-muted-foreground">
              <Calendar className="w-3 h-3" />
              Start Date
            </Label>
            <p className="text-sm font-medium">
              {task.actual_start_date
                ? format(new Date(task.actual_start_date), 'MMM d, yyyy')
                : 'Not started'}
            </p>
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-1 text-muted-foreground">
              <Calendar className="w-3 h-3" />
              End Date
            </Label>
            <p className="text-sm font-medium">
              {task.actual_end_date
                ? format(new Date(task.actual_end_date), 'MMM d, yyyy')
                : 'Not completed'}
            </p>
          </div>
        </div>

        <Separator />

        {/* Comments Section */}
        <div className="space-y-3">
          <Label className="flex items-center gap-1 text-muted-foreground">
            <MessageSquare className="w-3 h-3" />
            Comments
          </Label>

          <div className="space-y-2">
            {task.comments && task.comments.length > 0 ? (
              task.comments.map((comment) => (
                <div
                  key={comment.id}
                  className="p-2 text-sm rounded-lg bg-muted"
                >
                  <p>{comment.content}</p>
                  <span className="text-xs text-muted-foreground">
                    {format(new Date(comment.created_at), 'MMM d, h:mm a')}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No comments yet</p>
            )}
          </div>

          <div className="flex gap-2">
            <Input
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a comment..."
              className="flex-1"
            />
            <Button
              size="sm"
              disabled={!newComment.trim()}
              onClick={() => {
                // TODO: Implement comment creation
                setNewComment('');
              }}
            >
              Add
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
