import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { 
  Search, 
  Filter, 
  Download, 
  Zap, 
  Calendar,
  ChevronDown,
} from 'lucide-react';
import { ZoomLevel, TimelineFilters, TimelineMetrics } from '../types/voltbuild-timeline.types';

interface TimelineHeaderProps {
  zoomLevel: ZoomLevel;
  onZoomChange: (level: ZoomLevel) => void;
  filters: TimelineFilters;
  onFiltersChange: (filters: TimelineFilters) => void;
  metrics: TimelineMetrics;
  onExport: () => void;
}

const zoomLevels: { value: ZoomLevel; label: string }[] = [
  { value: 'day', label: 'Day' },
  { value: 'week', label: 'Week' },
  { value: 'month', label: 'Month' },
  { value: 'quarter', label: 'Quarter' },
];

const statusOptions = [
  { value: 'not_started', label: 'Not Started' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'blocked', label: 'Blocked' },
  { value: 'complete', label: 'Complete' },
];

const priorityOptions = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'critical', label: 'Critical' },
];

export function TimelineHeader({
  zoomLevel,
  onZoomChange,
  filters,
  onFiltersChange,
  metrics,
  onExport,
}: TimelineHeaderProps) {
  const handleStatusToggle = (status: string) => {
    const newStatuses = filters.status.includes(status)
      ? filters.status.filter(s => s !== status)
      : [...filters.status, status];
    onFiltersChange({ ...filters, status: newStatuses });
  };

  const handlePriorityToggle = (priority: string) => {
    const newPriorities = filters.priority.includes(priority)
      ? filters.priority.filter(p => p !== priority)
      : [...filters.priority, priority];
    onFiltersChange({ ...filters, priority: newPriorities });
  };

  const activeFiltersCount = 
    filters.status.length + 
    filters.priority.length + 
    (filters.showCriticalPath ? 1 : 0);

  return (
    <div className="space-y-3">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">Project Timeline</h2>
        </div>
        
        <div className="flex items-center gap-2 flex-wrap">
          {/* Zoom Controls */}
          <div className="flex rounded-md border border-border overflow-hidden">
            {zoomLevels.map((level) => (
              <Button
                key={level.value}
                variant="ghost"
                size="sm"
                className={`rounded-none border-r last:border-r-0 px-3 h-8 ${
                  zoomLevel === level.value 
                    ? 'bg-primary text-primary-foreground hover:bg-primary/90' 
                    : ''
                }`}
                onClick={() => onZoomChange(level.value)}
              >
                {level.label}
              </Button>
            ))}
          </div>

          {/* Critical Path Toggle */}
          <Button
            variant={filters.showCriticalPath ? 'default' : 'outline'}
            size="sm"
            className="h-8 gap-1"
            onClick={() => onFiltersChange({ ...filters, showCriticalPath: !filters.showCriticalPath })}
          >
            <Zap className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Critical Path</span>
          </Button>

          {/* Export */}
          <Button variant="outline" size="sm" className="h-8" onClick={onExport}>
            <Download className="h-3.5 w-3.5 sm:mr-1" />
            <span className="hidden sm:inline">Export</span>
          </Button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          {/* Search */}
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search tasks..."
              value={filters.searchQuery}
              onChange={(e) => onFiltersChange({ ...filters, searchQuery: e.target.value })}
              className="pl-8 h-8"
            />
          </div>

          {/* Filters Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 gap-1">
                <Filter className="h-3.5 w-3.5" />
                Filters
                {activeFiltersCount > 0 && (
                  <Badge variant="secondary" className="ml-1 h-4 px-1 text-xs">
                    {activeFiltersCount}
                  </Badge>
                )}
                <ChevronDown className="h-3 w-3 ml-1" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48">
              <DropdownMenuLabel>Status</DropdownMenuLabel>
              {statusOptions.map((option) => (
                <DropdownMenuCheckboxItem
                  key={option.value}
                  checked={filters.status.includes(option.value)}
                  onCheckedChange={() => handleStatusToggle(option.value)}
                >
                  {option.label}
                </DropdownMenuCheckboxItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuLabel>Priority</DropdownMenuLabel>
              {priorityOptions.map((option) => (
                <DropdownMenuCheckboxItem
                  key={option.value}
                  checked={filters.priority.includes(option.value)}
                  onCheckedChange={() => handlePriorityToggle(option.value)}
                >
                  {option.label}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Metrics Summary */}
        <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
          <span>
            <span className="font-medium text-foreground">{metrics.percentComplete}%</span> complete
          </span>
          <span className="hidden sm:inline">•</span>
          <span className="hidden sm:inline">
            <span className="font-medium text-green-600">{metrics.tasksOnTrack}</span> on track
          </span>
          {metrics.tasksAtRisk > 0 && (
            <>
              <span>•</span>
              <span>
                <span className="font-medium text-amber-600">{metrics.tasksAtRisk}</span> at risk
              </span>
            </>
          )}
          {metrics.tasksDelayed > 0 && (
            <>
              <span>•</span>
              <span>
                <span className="font-medium text-red-600">{metrics.tasksDelayed}</span> delayed
              </span>
            </>
          )}
          {metrics.criticalPathTasks > 0 && (
            <>
              <span className="hidden sm:inline">•</span>
              <span className="hidden sm:inline">
                <span className="font-medium text-primary">{metrics.criticalPathTasks}</span> critical
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
