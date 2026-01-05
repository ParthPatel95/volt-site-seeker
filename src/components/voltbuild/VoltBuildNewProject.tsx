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
import { Loader2 } from 'lucide-react';

interface VoltBuildNewProjectProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: {
    name: string;
    description?: string;
    target_mw?: number;
    cooling_type?: string;
    utility_iso?: string;
    location?: string;
    estimated_start_date?: string;
    estimated_end_date?: string;
  }) => void;
  isLoading?: boolean;
}

export function VoltBuildNewProject({
  open,
  onOpenChange,
  onSubmit,
  isLoading,
}: VoltBuildNewProjectProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    target_mw: '',
    cooling_type: '',
    utility_iso: '',
    location: '',
    estimated_start_date: '',
    estimated_end_date: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    onSubmit({
      name: formData.name,
      description: formData.description || undefined,
      target_mw: formData.target_mw ? parseFloat(formData.target_mw) : undefined,
      cooling_type: formData.cooling_type || undefined,
      utility_iso: formData.utility_iso || undefined,
      location: formData.location || undefined,
      estimated_start_date: formData.estimated_start_date || undefined,
      estimated_end_date: formData.estimated_end_date || undefined,
    });

    // Reset form
    setFormData({
      name: '',
      description: '',
      target_mw: '',
      cooling_type: '',
      utility_iso: '',
      location: '',
      estimated_start_date: '',
      estimated_end_date: '',
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Create New Build Project</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Project Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="e.g., Denver Mining Facility Phase 1"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Brief project description"
              rows={2}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="target_mw">Target Capacity (MW)</Label>
              <Input
                id="target_mw"
                type="number"
                step="0.1"
                value={formData.target_mw}
                onChange={(e) =>
                  setFormData({ ...formData, target_mw: e.target.value })
                }
                placeholder="e.g., 50"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cooling_type">Cooling Type</Label>
              <Select
                value={formData.cooling_type}
                onValueChange={(value) =>
                  setFormData({ ...formData, cooling_type: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="air">Air Cooling</SelectItem>
                  <SelectItem value="immersion">Immersion</SelectItem>
                  <SelectItem value="hybrid">Hybrid</SelectItem>
                  <SelectItem value="water">Water Cooling</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) =>
                  setFormData({ ...formData, location: e.target.value })
                }
                placeholder="e.g., Denver, CO"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="utility_iso">Utility / ISO</Label>
              <Input
                id="utility_iso"
                value={formData.utility_iso}
                onChange={(e) =>
                  setFormData({ ...formData, utility_iso: e.target.value })
                }
                placeholder="e.g., ERCOT"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="estimated_start_date">Estimated Start</Label>
              <Input
                id="estimated_start_date"
                type="date"
                value={formData.estimated_start_date}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    estimated_start_date: e.target.value,
                  })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="estimated_end_date">Target Completion</Label>
              <Input
                id="estimated_end_date"
                type="date"
                value={formData.estimated_end_date}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    estimated_end_date: e.target.value,
                  })
                }
              />
            </div>
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
                  Creating...
                </>
              ) : (
                'Create Project'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
