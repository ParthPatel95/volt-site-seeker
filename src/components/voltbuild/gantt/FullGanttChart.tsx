import React, { useRef, useMemo, useCallback } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Calendar, AlertCircle } from 'lucide-react';
import { parseISO, differenceInDays } from 'date-fns';
import { GanttProvider } from './context/GanttContext';
import { GanttToolbar } from './components/GanttToolbar';
import { EnhancedGanttTimeHeader } from './components/EnhancedGanttTimeHeader';
import { EnhancedGanttGrid } from './components/EnhancedGanttGrid';
import { EnhancedGanttTaskList } from './components/EnhancedGanttTaskList';
import { EnhancedGanttTaskBar } from './components/EnhancedGanttTaskBar';
import { GanttPhaseBar } from './components/GanttPhaseBar';
import { GanttMilestoneMarker, MilestoneType, MilestoneStatus } from './components/GanttMilestoneMarker';
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
import { generateTaskWbsCode } from './utils/wbsCalculations';

interface TargetMilestone {
  id: string;
  name: string;
  target_date: string;
  color: string;
  milestone_type: MilestoneType;
  status?: MilestoneStatus;
  description?: string | null;
  batch_number?: number;
}

interface FullGanttChartProps {
  phases: GanttPhase[];
  tasks: GanttTask[];
  dependencies?: GanttDependency[];
  milestones?: GanttMilestone[];
  targetMilestones?: TargetMilestone[];
  projectId?: string;
  projectStartDate?: Date | null;
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

function FullGanttChartInner({
  tasks,
  phases,
  dependencies = [],
  targetMilestones = [],
  projectStartDate,
  onTaskClick,
  onTaskDateChange,
  onTaskStatusChange,
  onDependencyCreate,
  onDependencyDelete,
  onTaskDelete,
  onTaskDuplicate,
}: Omit<FullGanttChartProps, 'milestones' | 'initialConfig' | 'className' | 'projectId'>) {
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
  
  // Calculate total height (phases + tasks)
  const config = { rowHeight: 44, headerHeight: 72, taskListWidth: 300, minTaskWidth: 24 };
  let rowCount = 0;
  const phaseRowIndices = new Map<string, number>();
  const taskRowIndices = new Map<string, { rowIndex: number; phaseIndex: number; taskIndex: number }>();
  
  phases.forEach((phase, phaseIndex) => {
    phaseRowIndices.set(phase.id, rowCount);
    rowCount++; // Phase row
    
    const phaseTasks = tasks.filter(t => t.phase_id === phase.id);
    phaseTasks.forEach((task, taskIndex) => {
      taskRowIndices.set(task.id, { rowIndex: rowCount, phaseIndex, taskIndex });
      rowCount++;
    });
  });
  
  const totalHeight = config.headerHeight + (rowCount * config.rowHeight);

  // Calculate phase data for phase bars
  const phaseData = useMemo(() => {
    return phases.map((phase, phaseIndex) => {
      const phaseTasks = tasks.filter(t => t.phase_id === phase.id);
      const tasksWithDates = phaseTasks.filter(t => t.estimated_start_date && t.estimated_end_date);
      
      let phaseStartDate: Date | null = null;
      let phaseEndDate: Date | null = null;
      
      if (tasksWithDates.length > 0) {
        const startDates = tasksWithDates.map(t => parseISO(t.estimated_start_date!));
        const endDates = tasksWithDates.map(t => parseISO(t.estimated_end_date!));
        phaseStartDate = new Date(Math.min(...startDates.map(d => d.getTime())));
        phaseEndDate = new Date(Math.max(...endDates.map(d => d.getTime())));
      }
      
      const completedTasks = phaseTasks.filter(t => t.status === 'complete').length;
      const progress = phaseTasks.length > 0 
        ? Math.round(phaseTasks.reduce((sum, t) => sum + (t.progress || 0), 0) / phaseTasks.length)
        : 0;
      const criticalTasks = phaseTasks.filter(t => t.is_critical_path).length;
      const duration = phaseStartDate && phaseEndDate 
        ? differenceInDays(phaseEndDate, phaseStartDate) + 1 
        : 0;
      
      return {
        id: phase.id,
        name: phase.name,
        tasks: phaseTasks,
        startDate: phaseStartDate,
        endDate: phaseEndDate,
        duration,
        progress,
        completedTasks,
        totalTasks: phaseTasks.length,
        criticalTasks,
        rowIndex: phaseRowIndices.get(phase.id) || 0,
      };
    });
  }, [phases, tasks, phaseRowIndices]);

  // Format target milestones for the marker component
  const formattedMilestones = useMemo(() => {
    return targetMilestones.map(m => ({
      id: m.id,
      name: m.name,
      date: new Date(m.target_date),
      type: m.milestone_type,
      status: (m.status || 'upcoming') as MilestoneStatus,
      description: m.description,
      batchNumber: m.batch_number,
    }));
  }, [targetMilestones]);

  // Scroll to today
  const scrollToToday = useCallback(() => {
    // Implementation would scroll the container to today's position
  }, []);

  // Handle link creation
  const handleLinkClick = useCallback((taskId: string) => {
    // This would be handled by the context - linking mode completes here
  }, []);

  return (
    <Card className="overflow-hidden">
      <CardHeader className="p-0">
        <GanttToolbar onScrollToToday={scrollToToday} />
      </CardHeader>
      
      <CardContent className="p-0">
        <ScrollArea className="w-full h-[700px]" ref={scrollAreaRef}>
          <div 
            ref={containerRef}
            className="relative"
            style={{ 
              width: config.taskListWidth + 180 + totalWidth,
              minHeight: totalHeight,
            }}
          >
            {/* Time Header with Week Numbers */}
            <EnhancedGanttTimeHeader
              startDate={startDate}
              endDate={endDate}
              totalWidth={totalWidth}
              projectStartDate={projectStartDate ?? undefined}
            />

            {/* Milestone Markers at top */}
            <div className="absolute z-30 pointer-events-none" style={{ top: 0, left: 0, right: 0 }}>
              {formattedMilestones.map(milestone => (
                <GanttMilestoneMarker
                  key={milestone.id}
                  milestone={milestone}
                  timelineStartDate={startDate}
                  timelineEndDate={endDate}
                  totalWidth={totalWidth}
                  totalHeight={totalHeight}
                  config={{ taskListWidth: config.taskListWidth }}
                />
              ))}
            </div>

            {/* Main content area */}
            <div className="relative flex" style={{ marginTop: config.headerHeight }}>
              {/* Task List (left panel) */}
              <EnhancedGanttTaskList
                onTaskClick={onTaskClick}
                onLinkClick={onDependencyCreate ? handleLinkClick : undefined}
                projectStartDate={projectStartDate}
              />

              {/* Chart Area */}
              <div className="relative flex-1" style={{ height: rowCount * config.rowHeight }}>
                {/* Grid */}
                <EnhancedGanttGrid
                  startDate={startDate}
                  endDate={endDate}
                  totalWidth={totalWidth}
                  totalHeight={rowCount * config.rowHeight}
                  targetMilestones={targetMilestones}
                />

                {/* Phase Bars */}
                {phaseData.map(phase => (
                  <GanttPhaseBar
                    key={`phase-bar-${phase.id}`}
                    phase={phase}
                    timelineStartDate={startDate}
                    timelineEndDate={endDate}
                    totalWidth={totalWidth}
                    rowIndex={phase.rowIndex}
                    config={{
                      rowHeight: config.rowHeight,
                      headerHeight: config.headerHeight,
                      taskListWidth: config.taskListWidth,
                    }}
                  />
                ))}

                {/* Task Bars */}
                {tasks.map(task => {
                  const taskInfo = taskRowIndices.get(task.id);
                  if (!taskInfo) return null;
                  
                  const wbsCode = generateTaskWbsCode(taskInfo.phaseIndex, taskInfo.taskIndex);
                  
                  return (
                    <EnhancedGanttTaskBar
                      key={task.id}
                      task={task}
                      startDate={startDate}
                      endDate={endDate}
                      totalWidth={totalWidth}
                      rowIndex={taskInfo.rowIndex}
                      wbsCode={wbsCode}
                      projectStartDate={projectStartDate}
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
            <div className="sticky bottom-0 left-0 right-0 flex items-center gap-4 p-3 text-xs text-muted-foreground border-t bg-background/95 backdrop-blur">
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
              <div className="border-l pl-4 ml-2 flex items-center gap-1.5">
                <div className="w-4 h-4 bg-slate-200 dark:bg-slate-700 border-2 border-slate-500 rounded" />
                <span>Phase</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 bg-violet-500 rotate-45 rounded-sm" />
                <span>Milestone</span>
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

export function FullGanttChart({
  phases,
  tasks,
  dependencies = [],
  milestones = [],
  targetMilestones = [],
  projectStartDate,
  initialConfig,
  className,
  ...props
}: FullGanttChartProps) {
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

  // Show empty state if no tasks at all
  if (tasks.length === 0) {
    return (
      <Card className={`p-8 text-center ${className}`}>
        <AlertCircle className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
        <h3 className="font-medium text-lg">No Tasks Yet</h3>
        <p className="text-sm text-muted-foreground mt-1 max-w-md mx-auto">
          Create tasks with start and end dates to visualize your project schedule.
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
        <FullGanttChartInner
          phases={phases}
          tasks={tasksWithProgress}
          dependencies={dependencies}
          targetMilestones={targetMilestones}
          projectStartDate={projectStartDate}
          {...props}
        />
      </GanttProvider>
    </div>
  );
}
