import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Plus,
  Package,
  Archive,
  Layers,
  LayoutGrid,
  Menu,
  MoreVertical,
  Printer,
  Edit,
  Trash2,
  MapPin,
  DollarSign,
  Loader2,
} from 'lucide-react';
import { useInventoryGroups } from '../hooks/useInventoryGroups';
import { InventoryGroup, InventoryGroupWithItems, ContainerType, CONTAINER_TYPES } from '../types/group.types';
import { InventoryPrintDialog } from './InventoryPrintDialog';
import { cn } from '@/lib/utils';

interface InventoryGroupManagerProps {
  workspaceId: string;
  onSelectGroup?: (group: InventoryGroupWithItems) => void;
}

const containerIcons: Record<ContainerType, React.ReactNode> = {
  box: <Package className="w-4 h-4" />,
  bin: <Archive className="w-4 h-4" />,
  pallet: <Layers className="w-4 h-4" />,
  shelf: <LayoutGrid className="w-4 h-4" />,
  drawer: <Menu className="w-4 h-4" />,
};

export function InventoryGroupManager({ workspaceId, onSelectGroup }: InventoryGroupManagerProps) {
  const {
    groups,
    isLoading,
    createGroup,
    updateGroup,
    deleteGroup,
    fetchGroupWithItems,
    isCreating,
  } = useInventoryGroups(workspaceId);

  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showPrintDialog, setShowPrintDialog] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<InventoryGroup | null>(null);
  const [groupWithItems, setGroupWithItems] = useState<InventoryGroupWithItems | null>(null);
  const [loadingGroupId, setLoadingGroupId] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    container_type: 'box' as ContainerType,
    location: '',
    storage_zone: '',
    bin_number: '',
  });

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      container_type: 'box',
      location: '',
      storage_zone: '',
      bin_number: '',
    });
  };

  const handleCreate = () => {
    createGroup({
      ...formData,
      workspace_id: workspaceId,
    });
    setShowCreateDialog(false);
    resetForm();
  };

  const handleEdit = () => {
    if (selectedGroup) {
      updateGroup({
        id: selectedGroup.id,
        ...formData,
      });
      setShowEditDialog(false);
      setSelectedGroup(null);
      resetForm();
    }
  };

  const handleDelete = () => {
    if (selectedGroup) {
      deleteGroup(selectedGroup.id);
      setShowDeleteConfirm(false);
      setSelectedGroup(null);
    }
  };

  const handleOpenEdit = (group: InventoryGroup) => {
    setSelectedGroup(group);
    setFormData({
      name: group.name,
      description: group.description || '',
      container_type: group.container_type as ContainerType,
      location: group.location || '',
      storage_zone: group.storage_zone || '',
      bin_number: group.bin_number || '',
    });
    setShowEditDialog(true);
  };

  const handleOpenPrint = async (group: InventoryGroup) => {
    setLoadingGroupId(group.id);
    const fullGroup = await fetchGroupWithItems(group.id);
    setLoadingGroupId(null);
    
    if (fullGroup) {
      setGroupWithItems(fullGroup);
      setShowPrintDialog(true);
    }
  };

  const handleGroupClick = async (group: InventoryGroup) => {
    if (onSelectGroup) {
      setLoadingGroupId(group.id);
      const fullGroup = await fetchGroupWithItems(group.id);
      setLoadingGroupId(null);
      
      if (fullGroup) {
        onSelectGroup(fullGroup);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-48">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Item Groups / Containers</h3>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Create Group
        </Button>
      </div>

      {groups.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Package className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-4">
              No groups created yet. Create a group to organize items into containers.
            </p>
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create First Group
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {groups.map((group) => (
            <Card
              key={group.id}
              className={cn(
                "cursor-pointer transition-all hover:shadow-md",
                loadingGroupId === group.id && "opacity-50"
              )}
              onClick={() => handleGroupClick(group)}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                      {containerIcons[group.container_type as ContainerType]}
                    </div>
                    <div>
                      <h4 className="font-medium">{group.name}</h4>
                      <p className="text-xs text-muted-foreground font-mono">
                        {group.group_code}
                      </p>
                    </div>
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleOpenPrint(group); }}>
                        <Printer className="w-4 h-4 mr-2" />
                        Print Label
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleOpenEdit(group); }}>
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedGroup(group);
                          setShowDeleteConfirm(true);
                        }}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {group.description && (
                  <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                    {group.description}
                  </p>
                )}

                <div className="flex items-center gap-3 mt-3 text-xs text-muted-foreground">
                  <Badge variant="outline" className="capitalize">
                    {group.container_type}
                  </Badge>
                  {group.location && (
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {group.location}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Group</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Name *</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Electrical Supplies Box 1"
              />
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Optional description..."
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label>Container Type</Label>
              <Select
                value={formData.container_type}
                onValueChange={(v) => setFormData({ ...formData, container_type: v as ContainerType })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CONTAINER_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      <div className="flex items-center gap-2">
                        {containerIcons[type.value]}
                        {type.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Location</Label>
                <Input
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="e.g., Warehouse A"
                />
              </div>
              <div className="space-y-2">
                <Label>Storage Zone</Label>
                <Input
                  value={formData.storage_zone}
                  onChange={(e) => setFormData({ ...formData, storage_zone: e.target.value })}
                  placeholder="e.g., Zone 1"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Bin/Shelf Number</Label>
              <Input
                value={formData.bin_number}
                onChange={(e) => setFormData({ ...formData, bin_number: e.target.value })}
                placeholder="e.g., A-12-3"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowCreateDialog(false); resetForm(); }}>
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={!formData.name || isCreating}>
              {isCreating && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Create Group
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={(open) => { setShowEditDialog(open); if (!open) resetForm(); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Group</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Name *</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label>Container Type</Label>
              <Select
                value={formData.container_type}
                onValueChange={(v) => setFormData({ ...formData, container_type: v as ContainerType })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CONTAINER_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      <div className="flex items-center gap-2">
                        {containerIcons[type.value]}
                        {type.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Location</Label>
                <Input
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Storage Zone</Label>
                <Input
                  value={formData.storage_zone}
                  onChange={(e) => setFormData({ ...formData, storage_zone: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Bin/Shelf Number</Label>
              <Input
                value={formData.bin_number}
                onChange={(e) => setFormData({ ...formData, bin_number: e.target.value })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowEditDialog(false); resetForm(); }}>
              Cancel
            </Button>
            <Button onClick={handleEdit} disabled={!formData.name}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Group</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{selectedGroup?.name}"? Items in this group will not be deleted, only the group association.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Print Dialog */}
      <InventoryPrintDialog
        open={showPrintDialog}
        onOpenChange={setShowPrintDialog}
        group={groupWithItems}
      />
    </div>
  );
}
