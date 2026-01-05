import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
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
import { Switch } from '@/components/ui/switch';
import { Loader2 } from 'lucide-react';
import { AssignedRole } from './types/voltbuild.types';

interface VoltBuildNewTaskProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  phaseId: string;
  phaseName: string;
  onSubmit: (data: {
    phase_id: string;
    name: string;
    description?: string;
    assigned_role?: AssignedRole;
    estimated_duration_days?: number;
    is_critical_path?: boolean;
  }) => void;
  isLoading?: boolean;
}

export function VoltBuildNewTask({
  open,
  onOpenChange,
  phaseId,
  phaseName,
  onSubmit,
  isLoading,
}: VoltBuildNewTaskProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    assigned_role: 'owner' as AssignedRole,
    estimated_duration_days: '',
    is_critical_path: false,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    onSubmit({
      phase_id: phaseId,
      name: formData.name,
      description: formData.description || undefined,
      assigned_role: formData.assigned_role,
      estimated_duration_days: formData.estimated_duration_days
        ? parseInt(formData.estimated_duration_days)
        : undefined,
      is_critical_path: formData.is_critical_path,
    });

    // Reset form
    setFormData({
      name: '',
      description: '',
      assigned_role: 'owner',
      estimated_duration_days: '',
      is_critical_path: false,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add Task</DialogTitle>
          <p className="text-sm text-muted-foreground">
            Adding to: {phaseName}
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="task-name">Task Name *</Label>
            <Input
              id="task-name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="e.g., Install backup generators"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="task-description">Description</Label>
            <Textarea
              id="task-description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Task details and requirements"
              rows={2}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Assigned Role</Label>
              <Select
                value={formData.assigned_role}
                onValueChange={(value) =>
                  setFormData({
                    ...formData,
                    assigned_role: value as AssignedRole,
                  })
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
            </div>

            <div className="space-y-2">
              <Label htmlFor="duration">Est. Duration (days)</Label>
              <Input
                id="duration"
                type="number"
                min="1"
                value={formData.estimated_duration_days}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    estimated_duration_days: e.target.value,
                  })
                }
                placeholder="e.g., 14"
              />
            </div>
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg bg-muted">
            <div>
              <Label htmlFor="critical-path" className="cursor-pointer">
                Critical Path Task
              </Label>
              <p className="text-xs text-muted-foreground">
                Mark if this task directly affects project completion date
              </p>
            </div>
            <Switch
              id="critical-path"
              checked={formData.is_critical_path}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, is_critical_path: checked })
              }
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={!formData.name.trim() || isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Adding...
                </>
              ) : (
                'Add Task'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
