import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Loader2, LayoutDashboard, ListTodo, GanttChart, AlertTriangle } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

import { VoltBuildHeader } from './VoltBuildHeader';
import { VoltBuildPhaseList } from './VoltBuildPhaseList';
import { VoltBuildTaskDetail } from './VoltBuildTaskDetail';
import { VoltBuildProgress, VoltBuildPhaseProgress } from './VoltBuildProgress';
import { VoltBuildTimeline } from './VoltBuildTimeline';
import { VoltBuildRisks } from './VoltBuildRisks';
import { VoltBuildNewProject } from './VoltBuildNewProject';
import { VoltBuildNewTask } from './VoltBuildNewTask';

import { useVoltBuildProjects } from './hooks/useVoltBuildProjects';
import { useVoltBuildPhases } from './hooks/useVoltBuildPhases';
import { useVoltBuildRisks } from './hooks/useVoltBuildRisks';
import { VoltBuildTask, TaskStatus, VoltBuildPhase } from './types/voltbuild.types';
import { toast } from 'sonner';

export function VoltBuildPage() {
  const queryClient = useQueryClient();
  
  // State
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [expandedPhases, setExpandedPhases] = useState<string[]>([]);
  const [isNewProjectOpen, setIsNewProjectOpen] = useState(false);
  const [newTaskPhase, setNewTaskPhase] = useState<{ id: string; name: string } | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [isMobile, setIsMobile] = useState(false);
  const [isTaskSheetOpen, setIsTaskSheetOpen] = useState(false);

  // Data hooks
  const { projects, isLoading: projectsLoading, createProject, isCreating } = useVoltBuildProjects();
  const { phases, isLoading: phasesLoading, recalculateProjectProgress } = useVoltBuildPhases(selectedProjectId);
  const { risks, createRisk, updateRisk, deleteRisk } = useVoltBuildRisks(selectedProjectId);

  // Load tasks for all phases
  const [tasksByPhase, setTasksByPhase] = useState<Record<string, VoltBuildTask[]>>({});
  const [tasksLoading, setTasksLoading] = useState(false);

  // Check for mobile
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Auto-select first project
  useEffect(() => {
    if (projects.length > 0 && !selectedProjectId) {
      setSelectedProjectId(projects[0].id);
    }
  }, [projects, selectedProjectId]);

  // Auto-expand first phase (only once when phases first load)
  const hasAutoExpanded = React.useRef(false);
  useEffect(() => {
    if (phases.length > 0 && !hasAutoExpanded.current) {
      hasAutoExpanded.current = true;
      setExpandedPhases([phases[0].id]);
    }
  }, [phases]);

  // Load tasks for all phases - use stable phase IDs reference
  const phaseIds = useMemo(() => phases.map(p => p.id).join(','), [phases]);
  
  useEffect(() => {
    if (!selectedProjectId || phases.length === 0) {
      setTasksByPhase({});
      return;
    }

    const loadTasks = async () => {
      setTasksLoading(true);
      try {
        const ids = phases.map(p => p.id);
        const { data, error } = await supabase
          .from('voltbuild_tasks')
          .select('*')
          .in('phase_id', ids)
          .order('order_index', { ascending: true });

        if (error) throw error;

        const grouped: Record<string, VoltBuildTask[]> = {};
        phases.forEach(p => grouped[p.id] = []);
        (data || []).forEach(task => {
          if (grouped[task.phase_id]) {
            grouped[task.phase_id].push(task as VoltBuildTask);
          }
        });
        setTasksByPhase(grouped);
      } catch (error) {
        console.error('Failed to load tasks:', error);
      } finally {
        setTasksLoading(false);
      }
    };

    loadTasks();
  }, [selectedProjectId, phaseIds]);

  // Get all tasks flattened
  const allTasks = useMemo(() => {
    return Object.values(tasksByPhase).flat();
  }, [tasksByPhase]);

  // Get selected project
  const selectedProject = useMemo(() => {
    return projects.find(p => p.id === selectedProjectId) || null;
  }, [projects, selectedProjectId]);

  // Get selected task
  const selectedTask = useMemo(() => {
    if (!selectedTaskId) return null;
    return allTasks.find(t => t.id === selectedTaskId) || null;
  }, [allTasks, selectedTaskId]);

  // Get phase for selected task
  const selectedTaskPhase = useMemo(() => {
    if (!selectedTask) return null;
    return phases.find(p => p.id === selectedTask.phase_id) || null;
  }, [selectedTask, phases]);

  // Handle project creation
  const handleCreateProject = (data: Parameters<typeof createProject>[0]) => {
    createProject(data, {
      onSuccess: (newProject) => {
        setSelectedProjectId(newProject.id);
        setIsNewProjectOpen(false);
      },
    });
  };

  // Handle task status change
  const handleTaskStatusChange = async (taskId: string, status: TaskStatus) => {
    try {
      const updates: Partial<VoltBuildTask> = { status };
      
      // Auto-set dates based on status
      if (status === 'in_progress' && !selectedTask?.actual_start_date) {
        updates.actual_start_date = new Date().toISOString().split('T')[0];
      }
      if (status === 'complete' && !selectedTask?.actual_end_date) {
        updates.actual_end_date = new Date().toISOString().split('T')[0];
      }

      const { error } = await supabase
        .from('voltbuild_tasks')
        .update(updates)
        .eq('id', taskId);

      if (error) throw error;

      // Refresh tasks
      const task = allTasks.find(t => t.id === taskId);
      if (task) {
        const updatedTasks = { ...tasksByPhase };
        const phaseTaskIndex = updatedTasks[task.phase_id]?.findIndex(t => t.id === taskId);
        if (phaseTaskIndex !== undefined && phaseTaskIndex >= 0) {
          updatedTasks[task.phase_id][phaseTaskIndex] = { ...task, ...updates };
          setTasksByPhase(updatedTasks);
        }

        // Recalculate phase progress
        await updatePhaseProgress(task.phase_id);
      }
    } catch (error) {
      toast.error('Failed to update task status');
    }
  };

  // Update phase progress based on task completion
  const updatePhaseProgress = async (phaseId: string) => {
    const phaseTasks = tasksByPhase[phaseId] || [];
    if (phaseTasks.length === 0) return;

    const completedCount = phaseTasks.filter(t => t.status === 'complete').length;
    const progress = Math.round((completedCount / phaseTasks.length) * 100);

    // Determine phase status
    let status: VoltBuildPhase['status'] = 'not_started';
    if (completedCount === phaseTasks.length) {
      status = 'complete';
    } else if (phaseTasks.some(t => t.status === 'blocked')) {
      status = 'blocked';
    } else if (phaseTasks.some(t => t.status === 'in_progress' || t.status === 'complete')) {
      status = 'in_progress';
    }

    await supabase
      .from('voltbuild_phases')
      .update({ progress, status })
      .eq('id', phaseId);

    queryClient.invalidateQueries({ queryKey: ['voltbuild-phases', selectedProjectId] });
    recalculateProjectProgress();
  };

  // Handle task update
  const handleTaskUpdate = async (updates: Partial<VoltBuildTask>) => {
    if (!selectedTaskId) return;

    try {
      const { error } = await supabase
        .from('voltbuild_tasks')
        .update(updates)
        .eq('id', selectedTaskId);

      if (error) throw error;

      // Refresh tasks locally
      const task = allTasks.find(t => t.id === selectedTaskId);
      if (task) {
        const updatedTasks = { ...tasksByPhase };
        const phaseTaskIndex = updatedTasks[task.phase_id]?.findIndex(t => t.id === selectedTaskId);
        if (phaseTaskIndex !== undefined && phaseTaskIndex >= 0) {
          updatedTasks[task.phase_id][phaseTaskIndex] = { ...task, ...updates };
          setTasksByPhase(updatedTasks);
        }

        if (updates.status) {
          await updatePhaseProgress(task.phase_id);
        }
      }

      toast.success('Task updated');
    } catch (error) {
      toast.error('Failed to update task');
    }
  };

  // Handle task delete
  const handleTaskDelete = async () => {
    if (!selectedTaskId || !selectedTask) return;

    try {
      const phaseId = selectedTask.phase_id;
      
      const { error } = await supabase
        .from('voltbuild_tasks')
        .delete()
        .eq('id', selectedTaskId);

      if (error) throw error;

      // Remove from local state
      const updatedTasks = { ...tasksByPhase };
      updatedTasks[phaseId] = updatedTasks[phaseId]?.filter(t => t.id !== selectedTaskId) || [];
      setTasksByPhase(updatedTasks);
      setSelectedTaskId(null);
      setIsTaskSheetOpen(false);

      await updatePhaseProgress(phaseId);
      toast.success('Task deleted');
    } catch (error) {
      toast.error('Failed to delete task');
    }
  };

  // Handle new task creation
  const handleCreateTask = async (data: {
    phase_id: string;
    name: string;
    description?: string;
    assigned_role?: VoltBuildTask['assigned_role'];
    estimated_duration_days?: number;
    is_critical_path?: boolean;
  }) => {
    try {
      const currentTasks = tasksByPhase[data.phase_id] || [];
      const maxOrder = currentTasks.length > 0 
        ? Math.max(...currentTasks.map(t => t.order_index)) 
        : -1;

      const { data: newTask, error } = await supabase
        .from('voltbuild_tasks')
        .insert({
          phase_id: data.phase_id,
          name: data.name,
          description: data.description || null,
          assigned_role: data.assigned_role || 'owner',
          estimated_duration_days: data.estimated_duration_days || null,
          is_critical_path: data.is_critical_path || false,
          order_index: maxOrder + 1,
          status: 'not_started',
          depends_on: [],
        })
        .select()
        .single();

      if (error) throw error;

      // Add to local state
      const updatedTasks = { ...tasksByPhase };
      updatedTasks[data.phase_id] = [...(updatedTasks[data.phase_id] || []), newTask as VoltBuildTask];
      setTasksByPhase(updatedTasks);
      setNewTaskPhase(null);

      toast.success('Task created');
    } catch (error) {
      toast.error('Failed to create task');
    }
  };

  // Handle task selection
  const handleTaskSelect = (taskId: string) => {
    setSelectedTaskId(taskId);
    if (isMobile) {
      setIsTaskSheetOpen(true);
    }
  };

  // Loading state
  if (projectsLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <VoltBuildHeader
        projects={projects}
        selectedProjectId={selectedProjectId}
        onProjectSelect={setSelectedProjectId}
        onNewProject={() => setIsNewProjectOpen(true)}
        selectedProject={selectedProject}
      />

      {/* Main Content */}
      {!selectedProject ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <p className="mb-4 text-lg text-muted-foreground">
              No projects yet. Create your first build project to get started.
            </p>
            <button
              onClick={() => setIsNewProjectOpen(true)}
              className="text-primary hover:underline"
            >
              Create New Project
            </button>
          </CardContent>
        </Card>
      ) : (
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="overview" className="gap-2">
              <LayoutDashboard className="w-4 h-4" />
              <span className="hidden sm:inline">Overview</span>
            </TabsTrigger>
            <TabsTrigger value="tasks" className="gap-2">
              <ListTodo className="w-4 h-4" />
              <span className="hidden sm:inline">Tasks</span>
            </TabsTrigger>
            <TabsTrigger value="timeline" className="gap-2">
              <GanttChart className="w-4 h-4" />
              <span className="hidden sm:inline">Timeline</span>
            </TabsTrigger>
            <TabsTrigger value="risks" className="gap-2">
              <AlertTriangle className="w-4 h-4" />
              <span className="hidden sm:inline">Risks</span>
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <VoltBuildProgress
              project={selectedProject}
              phases={phases}
              allTasks={allTasks}
            />

            <div className="grid gap-6 lg:grid-cols-2">
              <VoltBuildPhaseProgress phases={phases} />
              <VoltBuildRisks
                risks={risks}
                phases={phases}
                projectId={selectedProjectId!}
                onCreateRisk={createRisk}
                onUpdateRisk={(id, updates) => updateRisk({ id, ...updates })}
                onDeleteRisk={deleteRisk}
              />
            </div>

            <VoltBuildTimeline
              phases={phases}
              tasks={tasksByPhase}
              projectStartDate={selectedProject.estimated_start_date}
              projectEndDate={selectedProject.estimated_end_date}
            />
          </TabsContent>

          {/* Tasks Tab */}
          <TabsContent value="tasks">
            <div className="grid gap-6 lg:grid-cols-5">
              {/* Phase & Task List */}
              <div className="lg:col-span-3">
                {phasesLoading || tasksLoading ? (
                  <div className="flex items-center justify-center h-64">
                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                  </div>
                ) : (
                  <VoltBuildPhaseList
                    phases={phases}
                    tasks={tasksByPhase}
                    risks={risks}
                    selectedTaskId={selectedTaskId}
                    onTaskSelect={handleTaskSelect}
                    onTaskStatusChange={handleTaskStatusChange}
                    onAddTask={(phaseId) => {
                      const phase = phases.find(p => p.id === phaseId);
                      if (phase) {
                        setNewTaskPhase({ id: phaseId, name: phase.name });
                      }
                    }}
                    expandedPhases={expandedPhases}
                    onExpandedChange={setExpandedPhases}
                  />
                )}
              </div>

              {/* Task Detail Panel (Desktop) */}
              <div className="hidden lg:block lg:col-span-2">
                {selectedTask ? (
                  <VoltBuildTaskDetail
                    task={selectedTask}
                    onUpdate={handleTaskUpdate}
                    onDelete={handleTaskDelete}
                    onClose={() => setSelectedTaskId(null)}
                  />
                ) : (
                  <Card className="h-64">
                    <CardContent className="flex items-center justify-center h-full">
                      <p className="text-muted-foreground">
                        Select a task to view details
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>

          {/* Timeline Tab */}
          <TabsContent value="timeline">
            <VoltBuildTimeline
              phases={phases}
              tasks={tasksByPhase}
              projectStartDate={selectedProject.estimated_start_date}
              projectEndDate={selectedProject.estimated_end_date}
            />
          </TabsContent>

          {/* Risks Tab */}
          <TabsContent value="risks">
            <VoltBuildRisks
              risks={risks}
              phases={phases}
              projectId={selectedProjectId!}
              onCreateRisk={createRisk}
              onUpdateRisk={(id, updates) => updateRisk({ id, ...updates })}
              onDeleteRisk={deleteRisk}
            />
          </TabsContent>
        </Tabs>
      )}

      {/* New Project Dialog */}
      <VoltBuildNewProject
        open={isNewProjectOpen}
        onOpenChange={setIsNewProjectOpen}
        onSubmit={handleCreateProject}
        isLoading={isCreating}
      />

      {/* New Task Dialog */}
      {newTaskPhase && (
        <VoltBuildNewTask
          open={!!newTaskPhase}
          onOpenChange={(open) => !open && setNewTaskPhase(null)}
          phaseId={newTaskPhase.id}
          phaseName={newTaskPhase.name}
          onSubmit={handleCreateTask}
        />
      )}

      {/* Task Detail Sheet (Mobile) */}
      <Sheet open={isTaskSheetOpen && isMobile} onOpenChange={setIsTaskSheetOpen}>
        <SheetContent side="bottom" className="h-[80vh]">
          <SheetHeader>
            <SheetTitle>Task Details</SheetTitle>
          </SheetHeader>
          {selectedTask && (
            <div className="mt-4">
              <VoltBuildTaskDetail
                task={selectedTask}
                onUpdate={handleTaskUpdate}
                onDelete={handleTaskDelete}
                onClose={() => {
                  setIsTaskSheetOpen(false);
                  setSelectedTaskId(null);
                }}
              />
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
