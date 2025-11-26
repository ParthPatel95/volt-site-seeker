import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { FolderInput } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface MoveFolderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  documentId: string;
  documentName: string;
  currentFolderId?: string | null;
}

export function MoveFolderDialog({
  open,
  onOpenChange,
  onSuccess,
  documentId,
  documentName,
  currentFolderId,
}: MoveFolderDialogProps) {
  const [folders, setFolders] = useState<any[]>([]);
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(currentFolderId || null);
  const [moving, setMoving] = useState(false);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      loadFolders();
    }
  }, [open]);

  const loadFolders = async () => {
    try {
      const { data, error } = await supabase
        .from('secure_folders')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      setFolders(data || []);
    } catch (error: any) {
      toast({
        title: 'Failed to load folders',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleMove = async () => {
    setMoving(true);
    try {
      const { error } = await supabase
        .from('secure_documents')
        .update({ folder_id: selectedFolderId })
        .eq('id', documentId);

      if (error) throw error;

      toast({
        title: 'Document moved',
        description: selectedFolderId
          ? 'Document has been moved to the selected folder'
          : 'Document has been moved to root level',
      });

      onOpenChange(false);
      onSuccess();
    } catch (error: any) {
      toast({
        title: 'Failed to move document',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setMoving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FolderInput className="w-5 h-5" />
            Move Document
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label className="text-sm text-muted-foreground">Document</Label>
            <p className="mt-1 text-sm font-medium line-clamp-1">{documentName}</p>
          </div>

          <div>
            <Label htmlFor="target-folder">Move to Folder</Label>
            <Select
              value={selectedFolderId || 'root'}
              onValueChange={(value) => setSelectedFolderId(value === 'root' ? null : value)}
              disabled={loading}
            >
              <SelectTrigger id="target-folder" className="mt-2">
                <SelectValue placeholder="Select a folder" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="root">📁 Root Level (No Folder)</SelectItem>
                {folders.map((folder) => (
                  <SelectItem
                    key={folder.id}
                    value={folder.id}
                    disabled={folder.id === currentFolderId}
                  >
                    <span className="flex items-center gap-2">
                      <span style={{ color: folder.color }}>📁</span>
                      {folder.name}
                      {folder.id === currentFolderId && ' (Current)'}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={moving}
            >
              Cancel
            </Button>
            <Button
              onClick={handleMove}
              disabled={moving || selectedFolderId === currentFolderId}
            >
              <FolderInput className="w-4 h-4 mr-2" />
              {moving ? 'Moving...' : 'Move Document'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
