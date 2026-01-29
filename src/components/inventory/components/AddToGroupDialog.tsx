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
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Package, Archive, Layers, LayoutGrid, Menu, Loader2, Plus } from 'lucide-react';
import { useInventoryGroups } from '../hooks/useInventoryGroups';
import { InventoryGroup, ContainerType } from '../types/group.types';
import { InventoryItem } from '../types/inventory.types';
import { cn } from '@/lib/utils';

interface AddToGroupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: InventoryItem | null;
  workspaceId: string;
}

const containerIcons: Record<ContainerType, React.ReactNode> = {
  box: <Package className="w-4 h-4" />,
  bin: <Archive className="w-4 h-4" />,
  pallet: <Layers className="w-4 h-4" />,
  shelf: <LayoutGrid className="w-4 h-4" />,
  drawer: <Menu className="w-4 h-4" />,
};

export function AddToGroupDialog({
  open,
  onOpenChange,
  item,
  workspaceId,
}: AddToGroupDialogProps) {
  const { groups, isLoading, addItemToGroup, createGroup, isCreating } = useInventoryGroups(workspaceId);
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [showQuickCreate, setShowQuickCreate] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');

  const handleAdd = async () => {
    if (!item || !selectedGroup) return;
    
    setIsAdding(true);
    addItemToGroup({
      groupId: selectedGroup,
      itemId: item.id,
      quantity,
    });
    setIsAdding(false);
    onOpenChange(false);
    resetState();
  };

  const handleQuickCreate = () => {
    if (!newGroupName.trim()) return;
    
    createGroup({
      workspace_id: workspaceId,
      name: newGroupName.trim(),
      container_type: 'box',
    });
    setNewGroupName('');
    setShowQuickCreate(false);
  };

  const resetState = () => {
    setSelectedGroup(null);
    setQuantity(1);
    setShowQuickCreate(false);
    setNewGroupName('');
  };

  if (!item) return null;

  return (
    <Dialog open={open} onOpenChange={(open) => { onOpenChange(open); if (!open) resetState(); }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add to Group</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="p-3 bg-muted/50 rounded-lg">
            <p className="font-medium">{item.name}</p>
            {item.sku && <p className="text-sm text-muted-foreground">SKU: {item.sku}</p>}
          </div>

          <div className="space-y-2">
            <Label>Quantity to add</Label>
            <Input
              type="number"
              min={1}
              max={item.quantity}
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
            />
            <p className="text-xs text-muted-foreground">
              Available: {item.quantity} {item.unit}
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Select Group</Label>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs"
                onClick={() => setShowQuickCreate(!showQuickCreate)}
              >
                <Plus className="w-3 h-3 mr-1" />
                New Group
              </Button>
            </div>

            {showQuickCreate && (
              <div className="flex gap-2 p-2 bg-muted/50 rounded-lg">
                <Input
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  placeholder="New group name..."
                  className="flex-1"
                  onKeyDown={(e) => e.key === 'Enter' && handleQuickCreate()}
                />
                <Button size="sm" onClick={handleQuickCreate} disabled={!newGroupName.trim() || isCreating}>
                  {isCreating ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create'}
                </Button>
              </div>
            )}

            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : groups.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Package className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No groups yet. Create one above.</p>
              </div>
            ) : (
              <ScrollArea className="h-48 border rounded-lg">
                <div className="p-2 space-y-1">
                  {groups.map((group) => (
                    <button
                      key={group.id}
                      className={cn(
                        "w-full flex items-center gap-3 p-2 rounded-lg transition-colors text-left",
                        selectedGroup === group.id
                          ? "bg-primary/10 border border-primary"
                          : "hover:bg-muted"
                      )}
                      onClick={() => setSelectedGroup(group.id)}
                    >
                      <div className="w-8 h-8 rounded bg-muted flex items-center justify-center flex-shrink-0">
                        {containerIcons[group.container_type as ContainerType]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{group.name}</p>
                        <p className="text-xs text-muted-foreground truncate">
                          {group.group_code}
                          {group.location && ` • ${group.location}`}
                        </p>
                      </div>
                      <Badge variant="outline" className="capitalize text-xs">
                        {group.container_type}
                      </Badge>
                    </button>
                  ))}
                </div>
              </ScrollArea>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleAdd} disabled={!selectedGroup || isAdding}>
            {isAdding && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Add to Group
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
