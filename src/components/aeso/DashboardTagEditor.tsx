import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { X, Plus, Tag } from 'lucide-react';

const PREDEFINED_TAGS = [
  'Trading',
  'Operations',
  'Analytics',
  'Forecasting',
  'Real-time',
  'Historical',
  'Executive',
  'Team',
];

interface DashboardTagEditorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentTags: string[];
  onSave: (tags: string[]) => void;
}

export function DashboardTagEditor({
  open,
  onOpenChange,
  currentTags,
  onSave,
}: DashboardTagEditorProps) {
  const [tags, setTags] = useState<string[]>(currentTags);
  const [newTag, setNewTag] = useState('');

  const handleAddTag = () => {
    const trimmed = newTag.trim();
    if (trimmed && !tags.includes(trimmed)) {
      setTags([...tags, trimmed]);
      setNewTag('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter(t => t !== tag));
  };

  const handleAddPredefined = (tag: string) => {
    if (!tags.includes(tag)) {
      setTags([...tags, tag]);
    }
  };

  const handleSave = () => {
    onSave(tags);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Manage Tags</DialogTitle>
          <DialogDescription>
            Add tags to organize and categorize your dashboard
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Current Tags */}
          <div>
            <label className="text-sm font-medium mb-2 block">Current Tags</label>
            {tags.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {tags.map(tag => (
                  <Badge key={tag} variant="secondary">
                    {tag}
                    <button
                      onClick={() => handleRemoveTag(tag)}
                      className="ml-1 hover:text-destructive"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No tags added yet</p>
            )}
          </div>

          {/* Add Custom Tag */}
          <div>
            <label className="text-sm font-medium mb-2 block">Add Custom Tag</label>
            <div className="flex gap-2">
              <Input
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="Enter tag name"
                onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                maxLength={20}
              />
              <Button onClick={handleAddTag} size="icon">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Predefined Tags */}
          <div>
            <label className="text-sm font-medium mb-2 block">Quick Add</label>
            <div className="flex flex-wrap gap-2">
              {PREDEFINED_TAGS.filter(t => !tags.includes(t)).map(tag => (
                <Badge
                  key={tag}
                  variant="outline"
                  className="cursor-pointer hover:bg-primary/10"
                  onClick={() => handleAddPredefined(tag)}
                >
                  <Tag className="w-3 h-3 mr-1" />
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Save Tags
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
