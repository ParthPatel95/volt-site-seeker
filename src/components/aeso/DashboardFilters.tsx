import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, Clock, Tag, X } from 'lucide-react';

interface DashboardFiltersProps {
  selectedFilter: 'all' | 'starred' | 'recent';
  selectedTags: string[];
  availableTags: string[];
  onFilterChange: (filter: 'all' | 'starred' | 'recent') => void;
  onTagToggle: (tag: string) => void;
  onClearTags: () => void;
}

export function DashboardFilters({
  selectedFilter,
  selectedTags,
  availableTags,
  onFilterChange,
  onTagToggle,
  onClearTags,
}: DashboardFiltersProps) {
  return (
    <div className="space-y-4">
      {/* Quick Filters */}
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-muted-foreground">Filter:</span>
        <div className="flex gap-2">
          <Button
            variant={selectedFilter === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => onFilterChange('all')}
          >
            All
          </Button>
          <Button
            variant={selectedFilter === 'starred' ? 'default' : 'outline'}
            size="sm"
            onClick={() => onFilterChange('starred')}
          >
            <Star className="w-3 h-3 mr-1" />
            Starred
          </Button>
          <Button
            variant={selectedFilter === 'recent' ? 'default' : 'outline'}
            size="sm"
            onClick={() => onFilterChange('recent')}
          >
            <Clock className="w-3 h-3 mr-1" />
            Recently Viewed
          </Button>
        </div>
      </div>

      {/* Tag Filters */}
      {availableTags.length > 0 && (
        <div className="flex items-start gap-2">
          <div className="flex items-center gap-1 text-sm font-medium text-muted-foreground pt-1">
            <Tag className="w-3 h-3" />
            Tags:
          </div>
          <div className="flex-1 flex flex-wrap gap-2">
            {availableTags.map(tag => (
              <Badge
                key={tag}
                variant={selectedTags.includes(tag) ? 'default' : 'outline'}
                className="cursor-pointer hover:border-primary transition-colors"
                onClick={() => onTagToggle(tag)}
              >
                {tag}
              </Badge>
            ))}
            {selectedTags.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="h-6 px-2"
                onClick={onClearTags}
              >
                <X className="w-3 h-3 mr-1" />
                Clear
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
