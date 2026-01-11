import React, { useRef, useMemo, useCallback, useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Calendar } from 'lucide-react';
import { GanttProvider } from './context/GanttContext';
import { GanttToolbar } from './components/GanttToolbar';
import { GanttTimeHeader } from './components/GanttTimeHeader';
import { GanttGrid } from './components/GanttGrid';
import { GanttTaskList } from './components/GanttTaskList';
import { GanttTaskBar } from './components/GanttTaskBar';
import { GanttDependencyLayer } from './components/GanttDependencyLayer';
import { GanttContextMenu } from './components/GanttContextMenu';
import { 
  GanttTask, 
  GanttPhase, 
  GanttDependency, 
  GanttMilestone,
  GanttConfig,
  ZOOM_CONFIGS,
} from './types/gantt.types';
import { calculateTimelineBounds, generateTimeColumns } from './utils/dateCalculations';

// Re-export types for external use
export type { GanttTask, GanttPhase, GanttDependency, GanttMilestone };

interface EnhancedGanttChartProps {
  phases: GanttPhase[];
  tasks: GanttTask[];
  dependencies?: GanttDependency[];
  milestones?: GanttMilestone[];
  projectId?: string;
  onTaskClick?: (task: GanttTask) => void;
  onTaskDateChange?: (taskId: string, startDate: string, endDate: string) => void;
  onTaskStatusChange?: (taskId: string, status: GanttTask['status']) => void;
  onDependencyCreate?: (predecessorId: string, successorId: string) => void;
  onDependencyDelete?: (dependencyId: string) => void;
  onTaskDelete?: (taskId: string) => void;
  onTaskDuplicate?: (task: GanttTask) => void;
  initialConfig?: Partial<GanttConfig>;
  className?: string;
}

function GanttChartInner({
  tasks,
  phases,
  dependencies = [],
  onTaskClick,
  onTaskDateChange,
  onTaskStatusChange,
  onDependencyCreate,
  onDependencyDelete,
  onTaskDelete,
  onTaskDuplicate,
}: Omit<EnhancedGanttChartProps, 'milestones' | 'initialConfig' | 'className' | 'projectId'>) {
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const fullscreenContainerRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Fullscreen toggle handler
  const toggleFullscreen = useCallback(async () => {
    try {
      if (!document.fullscreenElement) {
        await fullscreenContainerRef.current?.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch (error) {
      console.error('Fullscreen error:', error);
    }
  }, []);

  // Listen for fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Keyboard shortcut for fullscreen
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'f' && !e.ctrlKey && !e.metaKey && !e.altKey) {
        const target = e.target as HTMLElement;
        if (target.tagName !== 'INPUT' && target.tagName !== 'TEXTAREA') {
          toggleFullscreen();
        }
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [toggleFullscreen]);

  // Calculate timeline bounds
  const { startDate, endDate } = useMemo(() => 
    calculateTimelineBounds(tasks),
    [tasks]
  );

  // Calculate dimensions based on zoom level (using default 'week')
  const zoomConfig = ZOOM_CONFIGS.week;
  const timeColumns = useMemo(() => 
    generateTimeColumns(startDate, endDate, 'week'),
    [startDate, endDate]
  );
  const totalWidth = timeColumns.length * zoomConfig.columnWidth;
  
  // Calculate total height
  const config = { rowHeight: 44, headerHeight: 48, taskListWidth: 300 };
  let rowCount = 0;
  phases.forEach(phase => {
    rowCount++; // Phase row
    const phaseTasks = tasks.filter(t => t.phase_id === phase.id);
    rowCount += phaseTasks.length;
  });
  const totalHeight = config.headerHeight + (rowCount * config.rowHeight);

  // Scroll to today
  const scrollToToday = useCallback(() => {
    // Implementation would scroll the container to today's position
  }, []);

  // Handle link creation
  const handleLinkClick = useCallback((taskId: string) => {
    // This would be handled by the context - linking mode completes here
  }, []);

  // Build row index map
  const rowIndexMap = useMemo(() => {
    const map = new Map<string, number>();
    let idx = 0;
    phases.forEach(phase => {
      idx++; // Phase row
      const phaseTasks = tasks.filter(t => t.phase_id === phase.id);
      phaseTasks.forEach(task => {
        map.set(task.id, idx);
        idx++;
      });
    });
    return map;
  }, [phases, tasks]);

  return (
    <div 
      ref={fullscreenContainerRef}
      className={cn(
        "relative",
        isFullscreen && "bg-background"
      )}
    >
      <Card className="overflow-hidden h-full">
        <CardHeader className="p-0">
          <GanttToolbar 
            onScrollToToday={scrollToToday}
            isFullscreen={isFullscreen}
            onToggleFullscreen={toggleFullscreen}
          />
        </CardHeader>
        
        <CardContent className="p-0">
          <ScrollArea 
            className={cn(
              "w-full",
              isFullscreen ? "h-[calc(100vh-120px)]" : "h-[600px]"
            )} 
            ref={scrollAreaRef}
          >
          <div 
            ref={containerRef}
            className="relative"
            style={{ 
              width: config.taskListWidth + totalWidth,
              minHeight: totalHeight,
            }}
          >
            {/* Time Header */}
            <GanttTimeHeader
              startDate={startDate}
              endDate={endDate}
              totalWidth={totalWidth}
            />

            {/* Main content area */}
            <div className="relative flex" style={{ marginTop: config.headerHeight }}>
              {/* Task List (left panel) */}
              <GanttTaskList
                onTaskClick={onTaskClick}
                onLinkClick={onDependencyCreate ? handleLinkClick : undefined}
              />

              {/* Chart Area */}
              <div className="relative flex-1" style={{ height: rowCount * config.rowHeight }}>
                {/* Grid */}
                <GanttGrid
                  startDate={startDate}
                  endDate={endDate}
                  totalWidth={totalWidth}
                  totalHeight={rowCount * config.rowHeight}
                />

                {/* Task Bars */}
                {tasks.map(task => {
                  const rowIndex = rowIndexMap.get(task.id);
                  if (rowIndex === undefined) return null;
                  
                  return (
                    <GanttTaskBar
                      key={task.id}
                      task={task}
                      startDate={startDate}
                      endDate={endDate}
                      totalWidth={totalWidth}
                      rowIndex={rowIndex}
                      onDateChange={onTaskDateChange}
                      onClick={onTaskClick}
                    />
                  );
                })}

                {/* Dependency Lines */}
                <GanttDependencyLayer
                  startDate={startDate}
                  endDate={endDate}
                  totalWidth={totalWidth}
                  totalHeight={rowCount * config.rowHeight}
                  onDependencyClick={onDependencyDelete}
                />
              </div>
            </div>

            {/* Legend */}
            <div className="sticky bottom-0 left-0 right-0 flex items-center gap-4 p-3 text-xs text-muted-foreground border-t bg-muted/30">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-sm bg-green-500" />
                <span>Complete</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-sm bg-blue-500" />
                <span>In Progress</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-sm bg-muted" />
                <span>Not Started</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-sm bg-destructive" />
                <span>Blocked</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-sm bg-orange-500 ring-2 ring-orange-400" />
                <span>Critical Path</span>
              </div>
            </div>
          </div>
            <ScrollBar orientation="horizontal" />
            <ScrollBar orientation="vertical" />
          </ScrollArea>
        </CardContent>

        {/* Context Menu */}
        <GanttContextMenu
          onEditTask={onTaskClick}
          onDeleteTask={onTaskDelete}
          onStatusChange={onTaskStatusChange}
          onDuplicateTask={onTaskDuplicate ? onTaskDuplicate : undefined}
        />
      </Card>
    </div>
  );
}

export function EnhancedGanttChart({
  phases,
  tasks,
  dependencies = [],
  milestones = [],
  initialConfig,
  className,
  ...props
}: EnhancedGanttChartProps) {
  // Add default progress to tasks if missing
  const tasksWithProgress = useMemo(() => 
    tasks.map(t => ({
      ...t,
      progress: t.progress ?? (t.status === 'complete' ? 100 : t.status === 'in_progress' ? 50 : 0),
    })),
    [tasks]
  );

  // Filter to tasks with valid dates for rendering
  const tasksWithDates = useMemo(() => 
    tasksWithProgress.filter(t => t.estimated_start_date && t.estimated_end_date),
    [tasksWithProgress]
  );

  // Show empty state if no tasks have dates
  if (tasks.length > 0 && tasksWithDates.length === 0) {
    return (
      <Card className={`p-8 text-center ${className}`}>
        <Calendar className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
        <h3 className="font-medium text-lg">No Task Dates Set</h3>
        <p className="text-sm text-muted-foreground mt-1 max-w-md mx-auto">
          Add estimated start and end dates to your tasks to see them on the Gantt chart timeline.
        </p>
      </Card>
    );
  }

  return (
    <div className={className}>
      <GanttProvider
        tasks={tasksWithProgress}
        phases={phases}
        dependencies={dependencies}
        milestones={milestones}
        initialConfig={initialConfig}
      >
        <GanttChartInner
          phases={phases}
          tasks={tasksWithProgress}
          dependencies={dependencies}
          {...props}
        />
      </GanttProvider>
    </div>
  );
}
