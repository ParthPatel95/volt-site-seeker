import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Save, X } from 'lucide-react';

interface EditTextDialogProps {
  isOpen: boolean;
  onClose: () => void;
  initialText: string;
  onSave: (editedText: string) => void;
}

export function EditTextDialog({ isOpen, onClose, initialText, onSave }: EditTextDialogProps) {
  const [editedText, setEditedText] = useState(initialText);
  
  const handleSave = () => {
    onSave(editedText);
    onClose();
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Edit Extracted Text</DialogTitle>
          <DialogDescription>
            Review and correct the extracted text before translation
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <Textarea
            value={editedText}
            onChange={(e) => setEditedText(e.target.value)}
            className="min-h-[400px] font-mono text-sm"
            placeholder="Extracted text will appear here..."
          />
          
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            <Button onClick={handleSave}>
              <Save className="w-4 h-4 mr-2" />
              Save & Use Text
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
