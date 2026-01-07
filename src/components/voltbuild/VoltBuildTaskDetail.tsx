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
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  Calendar, Clock, Flag, MessageSquare, Trash2, Save, X, 
  User, Paperclip, Download, Eye, FileText, Loader2, Plus
} from 'lucide-react';
import {
  VoltBuildTask,
  TaskStatus,
  AssignedRole,
  TASK_STATUS_CONFIG,
  ROLE_CONFIG,
} from './types/voltbuild.types';
import { cn } from '@/lib/utils';
import { format, formatDistanceToNow } from 'date-fns';
import { useVoltBuildTaskComments } from './hooks/useVoltBuildTaskComments';
import { useVoltBuildTaskDocuments, TaskDocumentWithSecure } from './hooks/useVoltBuildTaskDocuments';
import { usePlatformUsers } from './hooks/usePlatformUsers';
import { VoltBuildDocumentPicker } from './VoltBuildDocumentPicker';
import { DocumentViewerDialog } from '@/components/secure-share/DocumentViewerDialog';

interface VoltBuildTaskDetailProps {
  task: VoltBuildTask;
  projectId: string;
  onUpdate: (updates: Partial<VoltBuildTask>) => void;
  onDelete: () => void;
  onClose: () => void;
}

export function VoltBuildTaskDetail({
  task,
  projectId,
  onUpdate,
  onDelete,
  onClose,
}: VoltBuildTaskDetailProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTask, setEditedTask] = useState(task);
  const [newComment, setNewComment] = useState('');
  const [isDocPickerOpen, setIsDocPickerOpen] = useState(false);
  const [viewerDocument, setViewerDocument] = useState<{
    id: string;
    name: string;
    storage_path: string;
    file_type: string;
  } | null>(null);

  const { comments, createComment, deleteComment, isCreating: isCreatingComment } = useVoltBuildTaskComments(task.id);
  const { documents, attachDocument, detachDocument, isAttaching } = useVoltBuildTaskDocuments(task.id);
  const { data: platformUsers = [] } = usePlatformUsers();

  const statusConfig = TASK_STATUS_CONFIG[task.status];
  const roleConfig = ROLE_CONFIG[task.assigned_role];

  const handleSave = () => {
    onUpdate({
      name: editedTask.name,
      description: editedTask.description,
      assigned_role: editedTask.assigned_role,
      assigned_user_id: editedTask.assigned_user_id,
      estimated_duration_days: editedTask.estimated_duration_days,
      is_critical_path: editedTask.is_critical_path,
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedTask(task);
    setIsEditing(false);
  };

  const handleAddComment = () => {
    if (!newComment.trim()) return;
    createComment({ task_id: task.id, content: newComment });
    setNewComment('');
  };

  const handleAttachDocuments = (selectedDocs: Array<{ id: string; file_name: string }>) => {
    selectedDocs.forEach(doc => {
      attachDocument({
        task_id: task.id,
        project_id: projectId,
        secure_document_id: doc.id,
        file_name: doc.file_name,
      });
    });
  };

  const handleViewDocument = (doc: TaskDocumentWithSecure) => {
    if (doc.secure_document?.storage_path) {
      setViewerDocument({
        id: doc.secure_document.id,
        name: doc.file_name,
        storage_path: doc.secure_document.storage_path,
        file_type: doc.secure_document.file_type || '',
      });
    }
  };


  const getInitials = (name: string | null) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const assignedUser = platformUsers.find(u => u.id === task.assigned_user_id);

  return (
    <Card className="w-full min-w-0 flex flex-col max-h-full">
      <CardHeader className="pb-3 flex-shrink-0">
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

      <ScrollArea className="flex-1">
        <CardContent className="space-y-4">
          {/* Status & Role */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

          {/* Assigned User */}
          <div className="space-y-2">
            <Label className="flex items-center gap-1 text-muted-foreground">
              <User className="w-3 h-3" />
              Assigned To
            </Label>
            {isEditing ? (
              <Select
                value={editedTask.assigned_user_id || 'none'}
                onValueChange={(value) =>
                  setEditedTask({ 
                    ...editedTask, 
                    assigned_user_id: value === 'none' ? null : value 
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select user" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Unassigned</SelectItem>
                  {platformUsers.map(user => (
                    <SelectItem key={user.id} value={user.id}>
                      <div className="flex items-center gap-2">
                        <Avatar className="w-5 h-5">
                          <AvatarFallback className="text-xs">
                            {getInitials(user.full_name)}
                          </AvatarFallback>
                        </Avatar>
                        <span>{user.full_name || user.email || 'Unknown'}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <div className="flex items-center gap-2">
                {assignedUser ? (
                  <>
                    <Avatar className="w-6 h-6">
                      <AvatarFallback className="text-xs">
                        {getInitials(assignedUser.full_name)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium">
                      {assignedUser.full_name || assignedUser.email}
                    </span>
                  </>
                ) : (
                  <span className="text-sm text-muted-foreground">Unassigned</span>
                )}
              </div>
            )}
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
              <p className="text-sm text-foreground break-words">
                {task.description || 'No description provided'}
              </p>
            )}
          </div>

          {/* Duration & Critical Path */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

          {/* Documents Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="flex items-center gap-1 text-muted-foreground">
                <Paperclip className="w-3 h-3" />
                Documents
              </Label>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => setIsDocPickerOpen(true)}
                disabled={isAttaching}
              >
                {isAttaching ? (
                  <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                ) : (
                  <Plus className="w-4 h-4 mr-1" />
                )}
                Attach
              </Button>
            </div>

            <div className="space-y-2">
              {documents.length > 0 ? (
                documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center gap-2 p-2 rounded-lg bg-muted/50 group min-w-0"
                  >
                    <FileText className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    <span className="text-sm flex-1 min-w-0 truncate" title={doc.file_name}>
                      {doc.file_name}
                    </span>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {doc.secure_document?.storage_path && (
                        <Button 
                          size="icon" 
                          variant="ghost" 
                          className="h-7 w-7"
                          onClick={() => handleViewDocument(doc)}
                          title="View"
                        >
                          <Eye className="w-3 h-3" />
                        </Button>
                      )}
                      <Button 
                        size="icon" 
                        variant="ghost" 
                        className="h-7 w-7 text-destructive hover:text-destructive"
                        onClick={() => detachDocument(doc.id)}
                        title="Remove"
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No documents attached</p>
              )}
            </div>
          </div>

          <Separator />

          {/* Comments Section */}
          <div className="space-y-3">
            <Label className="flex items-center gap-1 text-muted-foreground">
              <MessageSquare className="w-3 h-3" />
              Comments ({comments.length})
            </Label>

            <div className="space-y-2 max-h-[200px] overflow-y-auto">
              {comments.length > 0 ? (
                comments.map((comment) => (
                  <div
                    key={comment.id}
                    className="p-2 text-sm rounded-lg bg-muted group relative"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Avatar className="w-5 h-5">
                        <AvatarFallback className="text-xs">
                          {getInitials(comment.user?.full_name || null)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-medium text-xs">
                        {comment.user?.full_name || comment.user?.email || 'Anonymous'}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                      </span>
                    </div>
                    <p className="pl-7 break-words whitespace-pre-wrap">{comment.content}</p>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 text-destructive hover:text-destructive"
                      onClick={() => deleteComment(comment.id)}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
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
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleAddComment();
                  }
                }}
              />
              <Button
                size="sm"
                disabled={!newComment.trim() || isCreatingComment}
                onClick={handleAddComment}
              >
                {isCreatingComment ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  'Add'
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </ScrollArea>

      <VoltBuildDocumentPicker
        open={isDocPickerOpen}
        onOpenChange={setIsDocPickerOpen}
        onSelect={handleAttachDocuments}
        excludeIds={documents.filter(d => d.secure_document?.id).map(d => d.secure_document!.id)}
      />

      <DocumentViewerDialog
        open={!!viewerDocument}
        onOpenChange={(open) => !open && setViewerDocument(null)}
        document={viewerDocument}
        accessLevel="download"
      />
    </Card>
  );
}
