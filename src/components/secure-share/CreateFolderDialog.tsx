import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { FolderPlus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const FOLDER_COLORS = [
  { value: '#6366f1', label: 'Indigo' },
  { value: '#8b5cf6', label: 'Purple' },
  { value: '#ec4899', label: 'Pink' },
  { value: '#ef4444', label: 'Red' },
  { value: '#f59e0b', label: 'Orange' },
  { value: '#10b981', label: 'Green' },
  { value: '#06b6d4', label: 'Cyan' },
  { value: '#3b82f6', label: 'Blue' },
];

interface CreateFolderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  parentFolderId?: string | null;
}

export function CreateFolderDialog({
  open,
  onOpenChange,
  onSuccess,
  parentFolderId = null,
}: CreateFolderDialogProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('#6366f1');
  const [creating, setCreating] = useState(false);
  const { toast } = useToast();

  const handleCreate = async () => {
    if (!name.trim()) {
      toast({
        title: 'Folder name required',
        description: 'Please enter a name for the folder',
        variant: 'destructive',
      });
      return;
    }

    setCreating(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('secure_folders')
        .insert([{
          created_by: user.id,
          name: name.trim(),
          description: description.trim() || null,
          color,
          parent_folder_id: parentFolderId,
        }]);

      if (error) throw error;

      toast({
        title: 'Folder created',
        description: 'Your folder has been created successfully',
      });

      setName('');
      setDescription('');
      setColor('#6366f1');
      onOpenChange(false);
      onSuccess();
    } catch (error: any) {
      toast({
        title: 'Failed to create folder',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setCreating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FolderPlus className="w-5 h-5" />
            Create New Folder
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="folder-name">Folder Name</Label>
            <Input
              id="folder-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Q4 2024 Reports"
              className="mt-2"
              autoFocus
            />
          </div>

          <div>
            <Label htmlFor="folder-description">Description (Optional)</Label>
            <Textarea
              id="folder-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of this folder's contents"
              rows={2}
              className="mt-2"
            />
          </div>

          <div>
            <Label>Folder Color</Label>
            <div className="grid grid-cols-4 gap-2 mt-2">
              {FOLDER_COLORS.map((folderColor) => (
                <button
                  key={folderColor.value}
                  type="button"
                  onClick={() => setColor(folderColor.value)}
                  className={`h-10 rounded-lg border-2 transition-all hover:scale-105 ${
                    color === folderColor.value
                      ? 'border-foreground shadow-lg scale-105'
                      : 'border-border'
                  }`}
                  style={{ backgroundColor: folderColor.value }}
                  title={folderColor.label}
                />
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={creating}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreate}
              disabled={!name.trim() || creating}
            >
              <FolderPlus className="w-4 h-4 mr-2" />
              {creating ? 'Creating...' : 'Create Folder'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
