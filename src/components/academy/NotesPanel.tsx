import { useState } from 'react';
import { NotebookPen, X } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useNotes } from '@/hooks/useNotes';

interface Props {
  moduleId: string;
  activeSectionId: string;
}

export const NotesPanel = ({ moduleId, activeSectionId }: Props) => {
  const { notes, saveNote } = useNotes(moduleId);
  const [open, setOpen] = useState(false);
  const value = notes[activeSectionId]?.content ?? '';

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-1.5">
          <NotebookPen className="w-4 h-4" />
          <span className="hidden sm:inline text-xs">Notes</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-full sm:w-[420px] flex flex-col">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <NotebookPen className="w-4 h-4" /> My Notes
          </SheetTitle>
          <p className="text-xs text-muted-foreground">
            Notes for this section auto-save as you type.
          </p>
        </SheetHeader>
        <div className="flex-1 mt-4 overflow-hidden flex flex-col">
          <div className="text-xs text-muted-foreground mb-2">
            Section: <span className="font-mono">{activeSectionId || '—'}</span>
          </div>
          <Textarea
            value={value}
            onChange={(e) => saveNote(activeSectionId, e.target.value)}
            placeholder="Write your thoughts, key takeaways, or questions…"
            className="flex-1 min-h-[300px] resize-none"
          />
          <p className="text-[10px] text-muted-foreground mt-2">
            Saved automatically. Total sections with notes: {Object.keys(notes).filter(k => notes[k].content?.trim()).length}
          </p>
        </div>
      </SheetContent>
    </Sheet>
  );
};
