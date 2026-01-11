import React, { useState, useRef, useMemo, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { VoltBuildProject } from '../types/voltbuild.types';
import { TimelineFilters, TimelineTask } from '../types/voltbuild-timeline.types';
import { useTimelineData } from './hooks/useTimelineData';
import { useTimelineZoom } from './hooks/useTimelineZoom';
import { TimelineHeader } from './TimelineHeader';
import { TimelineGrid } from './TimelineGrid';
import { TimelinePhaseRow } from './TimelinePhaseRow';
import { TimelineMilestones } from './TimelineMilestones';
import { TimelineMetricsPanel } from './TimelineMetricsPanel';
import { EnhancedGanttChart, GanttTask, GanttPhase, GanttDependency } from '../gantt';
import { useTaskDependencies } from '../gantt/hooks/useTaskDependencies';
import { parseISO, addDays, format } from 'date-fns';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { CheckCircle2, AlertTriangle, Zap, Calendar, Link, GanttChart as GanttChartIcon, LayoutList } from 'lucide-react';

interface EnhancedTimelineProps {
  project: VoltBuildProject;
}

export function EnhancedTimeline({ project }: EnhancedTimelineProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [selectedTask, setSelectedTask] = useState<TimelineTask | null>(null);
  const [filters, setFilters] = useState<TimelineFilters>({
    status: [],
    priority: [],
    showCriticalPath: false,
    searchQuery: '',
    phaseId: null,
  });

  const { phases, milestones, metrics, isLoading } = useTimelineData(project.id);
  const { dependencies, createDependency } = useTaskDependencies(project.id);

  // Flatten tasks for Gantt chart with proper typing
  const allTasks = useMemo((): GanttTask[] => {
    return phases.flatMap(phase => 
      phase.tasks.map(task => ({
        id: task.id,
        name: task.title,
        phase_id: phase.id,
        status: task.status as GanttTask['status'],
        estimated_start_date: task.estimated_start_date ?? null,
        estimated_end_date: task.estimated_end_date ?? null,
        is_critical_path: task.is_critical ?? false,
        progress: task.status === 'complete' ? 100 : task.status === 'in_progress' ? 50 : 0,
      }))
    );
  }, [phases]);

  // Calculate timeline bounds
  const { startDate, endDate } = useMemo(() => {
    const projectStart = project.estimated_start_date 
      ? parseISO(project.estimated_start_date) 
      : new Date();
    const projectEnd = project.estimated_end_date 
      ? parseISO(project.estimated_end_date) 
      : addDays(projectStart, 180);
    
    // Add buffer
    return {
      startDate: addDays(projectStart, -7),
      endDate: addDays(projectEnd, 14),
    };
  }, [project]);

  const {
    zoomLevel,
    setZoomLevel,
    timelineUnits,
    totalWidth,
    getPositionForDate,
    getWidthForRange,
    todayPosition,
  } = useTimelineZoom({ startDate, endDate });

  const handleExport = () => {
    toast.success('Export feature coming soon');
  };

  const handleTaskClick = (task: TimelineTask) => {
    setSelectedTask(task);
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-4">
          <Skeleton className="h-8 w-48 mb-4" />
          <Skeleton className="h-[400px] w-full" />
        </CardContent>
      </Card>
    );
  }

  const handleDependencyCreate = (predecessorId: string, successorId: string) => {
    createDependency({
      predecessorTaskId: predecessorId,
      successorTaskId: successorId,
      dependencyType: 'finish_to_start',
      lagDays: 0,
    });
  };

  const handleTaskStatusChange = useCallback(async (taskId: string, status: GanttTask['status']) => {
    try {
      const { error } = await supabase
        .from('voltbuild_tasks')
        .update({ status })
        .eq('id', taskId);

      if (error) throw error;
      toast.success('Task status updated');
    } catch (error) {
      toast.error('Failed to update task status');
    }
  }, []);

  return (
    <div className="space-y-4">
      {/* Metrics Panel */}
      <TimelineMetricsPanel metrics={metrics} />

      {/* Main Timeline Card */}
      <Card>
        <CardContent className="p-4">
          <Tabs defaultValue="timeline" className="w-full">
            <div className="flex items-center justify-between mb-4">
              <TabsList>
                <TabsTrigger value="timeline" className="flex items-center gap-2">
                  <LayoutList className="w-4 h-4" />
                  Timeline
                </TabsTrigger>
                <TabsTrigger value="gantt" className="flex items-center gap-2">
                  <GanttChartIcon className="w-4 h-4" />
                  Gantt Chart
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="timeline" className="mt-0">
              {/* Header */}
              <TimelineHeader
                zoomLevel={zoomLevel}
                onZoomChange={setZoomLevel}
                filters={filters}
                onFiltersChange={setFilters}
                metrics={metrics}
                onExport={handleExport}
              />

              {/* Timeline Container */}
              <div className="mt-4 border rounded-lg overflow-hidden">
            <ScrollArea className="w-full" ref={scrollRef}>
              <div className="min-w-[800px]" style={{ width: Math.max(totalWidth + 256, 800) }}>
                {/* Grid with Date Headers */}
                <div className="relative">
                  {/* Fixed Left Column + Scrollable Timeline */}
                  <div className="flex">
                    {/* Empty space for fixed column header */}
                    <div className="w-48 md:w-64 flex-shrink-0 border-r border-border bg-muted/50 py-2 px-3 sticky left-0 z-20">
                      <span className="text-xs font-medium text-muted-foreground">Phase / Task</span>
                    </div>
                    
                    {/* Timeline Grid Header */}
                    <TimelineGrid
                      units={timelineUnits}
                      totalWidth={totalWidth}
                      todayPosition={todayPosition}
                      zoomLevel={zoomLevel}
                    />
                  </div>

                  {/* Phase Rows */}
                  <div className="relative">
                    {/* Milestones Overlay */}
                    <div className="absolute left-48 md:left-64 right-0 h-full pointer-events-none z-20">
                      <TimelineMilestones
                        milestones={milestones}
                        getPositionForDate={getPositionForDate}
                        targetRfsDate={project.estimated_end_date}
                      />
                    </div>

                    {/* Phase and Task Rows */}
                    {phases.length > 0 ? (
                      phases.map((phase) => (
                        <TimelinePhaseRow
                          key={phase.id}
                          phase={phase}
                          getPositionForDate={getPositionForDate}
                          getWidthForRange={getWidthForRange}
                          startDate={startDate}
                          filters={filters}
                          onTaskClick={handleTaskClick}
                        />
                      ))
                    ) : (
                      <div className="flex items-center justify-center py-12 text-muted-foreground">
                        <div className="text-center">
                          <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
                          <p>No phases found. Create phases to see the timeline.</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          </div>

              {/* Legend */}
              <div className="flex items-center gap-4 mt-4 text-xs text-muted-foreground flex-wrap">
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-sm bg-green-500" />
                  <span>Complete</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-sm bg-blue-500" />
                  <span>In Progress</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-sm bg-gray-400" />
                  <span>Not Started</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-sm bg-red-500" />
                  <span>Blocked</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-sm bg-orange-500 ring-2 ring-orange-500 ring-offset-1" />
                  <span>Critical Path</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-0.5 h-4 bg-primary" />
                  <span>Today</span>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="gantt" className="mt-0">
              <EnhancedGanttChart
                phases={phases.map(p => ({ id: p.id, name: p.name }))}
                tasks={allTasks}
                dependencies={dependencies.map(d => ({
                  id: d.id,
                  project_id: project.id,
                  predecessor_task_id: d.predecessor_task_id,
                  successor_task_id: d.successor_task_id,
                  dependency_type: d.dependency_type as 'finish_to_start' | 'start_to_start' | 'finish_to_finish' | 'start_to_finish',
                  lag_days: d.lag_days,
                  created_at: d.created_at,
                }))}
                projectId={project.id}
                onDependencyCreate={handleDependencyCreate}
                onTaskClick={(task) => {
                  const timelineTask = phases
                    .flatMap(p => p.tasks)
                    .find(t => t.id === task.id);
                  if (timelineTask) {
                    setSelectedTask(timelineTask);
                  }
                }}
                onTaskStatusChange={handleTaskStatusChange}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Task Detail Sheet */}
      <Sheet open={!!selectedTask} onOpenChange={(open) => !open && setSelectedTask(null)}>
        <SheetContent className="sm:max-w-md">
          {selectedTask && (
            <>
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2">
                  {selectedTask.is_critical && <Zap className="h-4 w-4 text-orange-500" />}
                  {selectedTask.title}
                </SheetTitle>
                <SheetDescription>Task Details</SheetDescription>
              </SheetHeader>

              <div className="mt-6 space-y-4">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="capitalize">
                    {selectedTask.status.replace('_', ' ')}
                  </Badge>
                  <Badge variant="outline" className="capitalize">
                    {selectedTask.priority}
                  </Badge>
                  {selectedTask.is_critical && (
                    <Badge className="bg-orange-500">Critical</Badge>
                  )}
                </div>

                {(selectedTask.estimated_start_date || selectedTask.estimated_end_date) && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Schedule
                    </h4>
                    <div className="text-sm text-muted-foreground">
                      {selectedTask.estimated_start_date && (
                        <p>Start: {format(parseISO(selectedTask.estimated_start_date), 'MMMM d, yyyy')}</p>
                      )}
                      {selectedTask.estimated_end_date && (
                        <p>End: {format(parseISO(selectedTask.estimated_end_date), 'MMMM d, yyyy')}</p>
                      )}
                    </div>
                  </div>
                )}

                {selectedTask.depends_on && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium flex items-center gap-2">
                      <Link className="h-4 w-4" />
                      Dependencies
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      This task depends on another task
                    </p>
                  </div>
                )}

                <div className="pt-4">
                  <Button 
                    className="w-full" 
                    onClick={() => {
                      setSelectedTask(null);
                      toast.info('Edit task feature coming soon');
                    }}
                  >
                    Edit Task
                  </Button>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
