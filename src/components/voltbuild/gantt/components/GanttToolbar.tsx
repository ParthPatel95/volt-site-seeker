import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  ZoomIn,
  ZoomOut,
  Settings2,
  Download,
  Calendar,
  Layers,
  ChevronDown,
  Eye,
  EyeOff,
  Zap,
  Link2,
  Flag,
  FileImage,
  FileSpreadsheet,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useGantt } from '../context/GanttContext';
import { ZoomLevel } from '../types/gantt.types';

interface GanttToolbarProps {
  onExportPNG?: () => void;
  onExportCSV?: () => void;
  onScrollToToday?: () => void;
}

export function GanttToolbar({ onExportPNG, onExportCSV, onScrollToToday }: GanttToolbarProps) {
  const { 
    state, 
    zoomConfig,
    setZoomLevel, 
    updateConfig,
    criticalPathTasks,
  } = useGantt();

  const { config, zoomLevel, selection } = state;

  const zoomLevels: { value: ZoomLevel; label: string }[] = [
    { value: 'day', label: 'Day' },
    { value: 'week', label: 'Week' },
    { value: 'month', label: 'Month' },
    { value: 'quarter', label: 'Quarter' },
  ];

  const zoomIn = () => {
    const currentIndex = zoomLevels.findIndex(z => z.value === zoomLevel);
    if (currentIndex > 0) {
      setZoomLevel(zoomLevels[currentIndex - 1].value);
    }
  };

  const zoomOut = () => {
    const currentIndex = zoomLevels.findIndex(z => z.value === zoomLevel);
    if (currentIndex < zoomLevels.length - 1) {
      setZoomLevel(zoomLevels[currentIndex + 1].value);
    }
  };

  return (
    <div className="flex items-center justify-between gap-2 p-3 border-b bg-muted/30">
      {/* Left side - Zoom controls */}
      <div className="flex items-center gap-2">
        <div className="flex items-center border rounded-lg bg-background">
          <Button
            variant="ghost"
            size="sm"
            onClick={zoomIn}
            disabled={zoomLevel === 'day'}
            className="h-8 px-2"
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 px-3 gap-1">
                {zoomLevels.find(z => z.value === zoomLevel)?.label}
                <ChevronDown className="h-3 w-3 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              {zoomLevels.map(level => (
                <DropdownMenuItem
                  key={level.value}
                  onClick={() => setZoomLevel(level.value)}
                  className={cn(zoomLevel === level.value && 'bg-accent')}
                >
                  {level.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={zoomOut}
            disabled={zoomLevel === 'quarter'}
            className="h-8 px-2"
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={onScrollToToday}
          className="h-8 gap-1.5"
        >
          <Calendar className="h-3.5 w-3.5" />
          Today
        </Button>

        <Separator orientation="vertical" className="h-6" />

        {/* Status indicators */}
        {selection.linkingFromId && (
          <Badge variant="secondary" className="animate-pulse gap-1">
            <Link2 className="h-3 w-3" />
            Linking mode - Click target task
          </Badge>
        )}

        {criticalPathTasks.size > 0 && config.showCriticalPath && (
          <Badge variant="outline" className="gap-1 border-orange-400 text-orange-600">
            <Zap className="h-3 w-3" />
            {criticalPathTasks.size} Critical
          </Badge>
        )}
      </div>

      {/* Right side - View options and export */}
      <div className="flex items-center gap-2">
        {/* View Options */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="h-8 gap-1.5">
              <Eye className="h-3.5 w-3.5" />
              View
              <ChevronDown className="h-3 w-3 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-64">
            <div className="grid gap-4">
              <div className="space-y-2">
                <h4 className="font-medium leading-none">Display Options</h4>
                <p className="text-xs text-muted-foreground">
                  Toggle chart elements
                </p>
              </div>
              
              <div className="grid gap-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="show-dependencies" className="flex items-center gap-2 text-sm">
                    <Link2 className="h-3.5 w-3.5 text-muted-foreground" />
                    Dependencies
                  </Label>
                  <Switch
                    id="show-dependencies"
                    checked={config.showDependencies}
                    onCheckedChange={(checked) => updateConfig({ showDependencies: checked })}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="show-critical" className="flex items-center gap-2 text-sm">
                    <Zap className="h-3.5 w-3.5 text-orange-500" />
                    Critical Path
                  </Label>
                  <Switch
                    id="show-critical"
                    checked={config.showCriticalPath}
                    onCheckedChange={(checked) => updateConfig({ showCriticalPath: checked })}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="show-progress" className="flex items-center gap-2 text-sm">
                    <Layers className="h-3.5 w-3.5 text-muted-foreground" />
                    Progress
                  </Label>
                  <Switch
                    id="show-progress"
                    checked={config.showProgress}
                    onCheckedChange={(checked) => updateConfig({ showProgress: checked })}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="show-baseline" className="flex items-center gap-2 text-sm">
                    <Layers className="h-3.5 w-3.5 text-muted-foreground" />
                    Baseline
                  </Label>
                  <Switch
                    id="show-baseline"
                    checked={config.showBaseline}
                    onCheckedChange={(checked) => updateConfig({ showBaseline: checked })}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="show-milestones" className="flex items-center gap-2 text-sm">
                    <Flag className="h-3.5 w-3.5 text-muted-foreground" />
                    Milestones
                  </Label>
                  <Switch
                    id="show-milestones"
                    checked={config.showMilestones}
                    onCheckedChange={(checked) => updateConfig({ showMilestones: checked })}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="show-today" className="flex items-center gap-2 text-sm">
                    <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                    Today Line
                  </Label>
                  <Switch
                    id="show-today"
                    checked={config.showTodayLine}
                    onCheckedChange={(checked) => updateConfig({ showTodayLine: checked })}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="show-weekends" className="flex items-center gap-2 text-sm">
                    <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                    Weekends
                  </Label>
                  <Switch
                    id="show-weekends"
                    checked={config.showWeekends}
                    onCheckedChange={(checked) => updateConfig({ showWeekends: checked })}
                  />
                </div>
              </div>
            </div>
          </PopoverContent>
        </Popover>

        {/* Export Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-8 gap-1.5">
              <Download className="h-3.5 w-3.5" />
              Export
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Export As</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onExportPNG} disabled={!onExportPNG}>
              <FileImage className="h-4 w-4 mr-2" />
              PNG Image
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onExportCSV} disabled={!onExportCSV}>
              <FileSpreadsheet className="h-4 w-4 mr-2" />
              CSV Spreadsheet
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
