import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
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
import { Loader2, Package, HardHat, Building2, Warehouse } from 'lucide-react';
import { WorkspaceType } from '../types/demolition.types';

interface CreateWorkspaceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: { name: string; description?: string; workspace_type?: WorkspaceType }) => void;
  isLoading?: boolean;
}

const WORKSPACE_TYPE_OPTIONS: { value: WorkspaceType; label: string; icon: React.ElementType; description: string }[] = [
  { 
    value: 'general', 
    label: 'General', 
    icon: Package, 
    description: 'Standard inventory tracking' 
  },
  { 
    value: 'demolition', 
    label: 'Demolition', 
    icon: HardHat, 
    description: 'Scrap metal, salvage & hazmat analysis' 
  },
  { 
    value: 'construction', 
    label: 'Construction', 
    icon: Building2, 
    description: 'Building materials & tools' 
  },
  { 
    value: 'warehouse', 
    label: 'Warehouse', 
    icon: Warehouse, 
    description: 'Bulk storage & logistics' 
  },
];

export function CreateWorkspaceDialog({
  open,
  onOpenChange,
  onSubmit,
  isLoading = false,
}: CreateWorkspaceDialogProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [workspaceType, setWorkspaceType] = useState<WorkspaceType>('general');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    
    onSubmit({
      name: name.trim(),
      description: description.trim() || undefined,
      workspace_type: workspaceType,
    });
    
    // Reset form
    setName('');
    setDescription('');
    setWorkspaceType('general');
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setName('');
      setDescription('');
      setWorkspaceType('general');
    }
    onOpenChange(open);
  };

  const selectedType = WORKSPACE_TYPE_OPTIONS.find(t => t.value === workspaceType);

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="w-5 h-5" />
            Create Workspace
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Workspace Name *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Main Warehouse, Demo Site A"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="workspace-type">Workspace Type</Label>
            <Select value={workspaceType} onValueChange={(v) => setWorkspaceType(v as WorkspaceType)}>
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                {WORKSPACE_TYPE_OPTIONS.map((option) => {
                  const Icon = option.icon;
                  return (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex items-center gap-2">
                        <Icon className="w-4 h-4" />
                        <span>{option.label}</span>
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
            {selectedType && (
              <p className="text-xs text-muted-foreground mt-1">
                {selectedType.description}
              </p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional description for this workspace"
              rows={3}
            />
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={!name.trim() || isLoading}>
              {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Create Workspace
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
