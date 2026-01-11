import React, { useRef, useMemo, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
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
    <Card className="overflow-hidden">
      <CardHeader className="p-0">
        <GanttToolbar onScrollToToday={scrollToToday} />
      </CardHeader>
      
      <CardContent className="p-0">
        <ScrollArea className="w-full h-[600px]" ref={scrollAreaRef}>
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
        onDuplicateTask={onTaskDuplicate}
      />
    </Card>
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
