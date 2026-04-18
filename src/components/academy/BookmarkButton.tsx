import { Bookmark, BookmarkCheck } from 'lucide-react';
import { useBookmarks } from '@/hooks/useBookmarks';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface Props {
  moduleId: string;
  sectionId: string | null;
  label?: string;
  className?: string;
}

export const BookmarkButton = ({ moduleId, sectionId, label, className }: Props) => {
  const { isBookmarked, toggle } = useBookmarks(moduleId);
  const active = isBookmarked(moduleId, sectionId);
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => toggle(moduleId, sectionId, label)}
      className={cn('gap-1.5', className)}
      title={active ? 'Remove bookmark' : 'Bookmark this'}
    >
      {active ? (
        <BookmarkCheck className="w-4 h-4 text-primary" />
      ) : (
        <Bookmark className="w-4 h-4" />
      )}
      <span className="hidden sm:inline text-xs">{active ? 'Saved' : 'Save'}</span>
    </Button>
  );
};
