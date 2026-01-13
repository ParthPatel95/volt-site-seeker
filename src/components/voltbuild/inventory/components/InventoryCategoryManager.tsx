import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
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
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Plus,
  Edit,
  Trash2,
  Loader2,
  Folder,
  FolderOpen,
} from 'lucide-react';
import { InventoryCategory } from '../types/inventory.types';
import { useInventoryCategories } from '../hooks/useInventoryCategories';
import { cn } from '@/lib/utils';

interface InventoryCategoryManagerProps {
  projectId: string;
  categories: InventoryCategory[];
}

const PRESET_COLORS = [
  '#ef4444', '#f97316', '#f59e0b', '#eab308',
  '#84cc16', '#22c55e', '#14b8a6', '#06b6d4',
  '#0ea5e9', '#3b82f6', '#6366f1', '#8b5cf6',
  '#a855f7', '#d946ef', '#ec4899', '#f43f5e',
];

const PRESET_ICONS = [
  'folder', 'box', 'package', 'tool', 'wrench', 'cpu',
  'zap', 'battery', 'cable', 'hard-drive', 'server', 'monitor',
];

export function InventoryCategoryManager({ projectId, categories }: InventoryCategoryManagerProps) {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<InventoryCategory | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: PRESET_COLORS[0],
    icon: 'folder',
  });

  const {
    createCategory,
    updateCategory,
    deleteCategory,
    isCreating,
    isUpdating,
    isDeleting,
  } = useInventoryCategories(projectId);

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      color: PRESET_COLORS[0],
      icon: 'folder',
    });
  };

  const handleAdd = () => {
    resetForm();
    setShowAddDialog(true);
  };

  const handleEdit = (category: InventoryCategory) => {
    setSelectedCategory(category);
    setFormData({
      name: category.name,
      description: category.description || '',
      color: category.color || PRESET_COLORS[0],
      icon: category.icon || 'folder',
    });
    setShowEditDialog(true);
  };

  const handleDelete = (category: InventoryCategory) => {
    setSelectedCategory(category);
    setShowDeleteConfirm(true);
  };

  const handleSubmitAdd = () => {
    createCategory({
      project_id: projectId,
      name: formData.name,
      description: formData.description || undefined,
      color: formData.color,
      icon: formData.icon,
    });
    setShowAddDialog(false);
    resetForm();
  };

  const handleSubmitEdit = () => {
    if (selectedCategory) {
      updateCategory({
        id: selectedCategory.id,
        name: formData.name,
        description: formData.description || undefined,
        color: formData.color,
        icon: formData.icon,
      });
      setShowEditDialog(false);
      setSelectedCategory(null);
    }
  };

  const handleConfirmDelete = () => {
    if (selectedCategory) {
      deleteCategory(selectedCategory.id);
      setShowDeleteConfirm(false);
      setSelectedCategory(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Categories</h3>
          <p className="text-sm text-muted-foreground">
            Organize your inventory items into categories
          </p>
        </div>
        <Button onClick={handleAdd}>
          <Plus className="w-4 h-4 mr-2" />
          Add Category
        </Button>
      </div>

      {categories.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <FolderOpen className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-4">No categories yet</p>
            <Button variant="outline" onClick={handleAdd}>
              <Plus className="w-4 h-4 mr-2" />
              Create First Category
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((category) => (
            <Card key={category.id} className="group relative">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: `${category.color}20` }}
                  >
                    <Folder className="w-5 h-5" style={{ color: category.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium truncate">{category.name}</h4>
                    {category.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                        {category.description}
                      </p>
                    )}
                  </div>
                </div>

                <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => handleEdit(category)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:text-destructive"
                    onClick={() => handleDelete(category)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Category</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Name *</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Electronics, Tools, Safety Equipment"
              />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Input
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Optional description"
              />
            </div>
            <div className="space-y-2">
              <Label>Color</Label>
              <div className="flex flex-wrap gap-2">
                {PRESET_COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    className={cn(
                      "w-8 h-8 rounded-full transition-transform",
                      formData.color === color && "ring-2 ring-offset-2 ring-primary scale-110"
                    )}
                    style={{ backgroundColor: color }}
                    onClick={() => setFormData({ ...formData, color })}
                  />
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmitAdd} disabled={!formData.name || isCreating}>
              {isCreating && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Create Category
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Category</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Name *</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Category name"
              />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Input
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Optional description"
              />
            </div>
            <div className="space-y-2">
              <Label>Color</Label>
              <div className="flex flex-wrap gap-2">
                {PRESET_COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    className={cn(
                      "w-8 h-8 rounded-full transition-transform",
                      formData.color === color && "ring-2 ring-offset-2 ring-primary scale-110"
                    )}
                    style={{ backgroundColor: color }}
                    onClick={() => setFormData({ ...formData, color })}
                  />
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmitEdit} disabled={!formData.name || isUpdating}>
              {isUpdating && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Category</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{selectedCategory?.name}"? Items in this category will become uncategorized.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
