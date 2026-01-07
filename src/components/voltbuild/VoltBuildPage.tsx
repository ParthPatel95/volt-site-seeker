import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Loader2, Lock } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useVoltBuildAccess } from '@/hooks/useVoltBuildAccess';

import { VoltBuildLayout, VoltBuildView } from './layout/VoltBuildLayout';
import { VoltBuildOverviewRedesign } from './overview/VoltBuildOverviewRedesign';
import { VoltBuildHeader } from './VoltBuildHeader';
import { VoltBuildKanbanBoard } from './kanban/VoltBuildKanbanBoard';
import { VoltBuildTaskDetail } from './VoltBuildTaskDetail';
import { VoltBuildProgress, VoltBuildPhaseProgress } from './VoltBuildProgress';
import { VoltBuildTimeline } from './VoltBuildTimeline';
import { EnhancedTimeline } from './timeline/EnhancedTimeline';
import { EnhancedRisksTab } from './risks/EnhancedRisksTab';
import { VoltBuildNewProject } from './VoltBuildNewProject';
import { VoltBuildNewTask } from './VoltBuildNewTask';
import { VoltCapExTab } from './capex/VoltCapExTab';
import { VoltLeadTimeTab } from './leadtime/VoltLeadTimeTab';
import { VoltAdvisorTab } from './advisor/VoltAdvisorTab';
import { VoltBidsTab } from './bids/VoltBidsTab';
import { VoltProcurementTab } from './procurement/VoltProcurementTab';
import { VoltChangeOrdersTab } from './changeorders/VoltChangeOrdersTab';
import { VoltQualityTab } from './quality/VoltQualityTab';
import { VoltReportingTab } from './reporting/VoltReportingTab';

// Phase 3 Tabs
import { VoltDailyLogsTab } from './dailylogs/VoltDailyLogsTab';
import { VoltFieldCheckInsTab } from './fieldcheckins/VoltFieldCheckInsTab';
import { VoltVerificationTab } from './verification/VoltVerificationTab';
import { VoltForecastingTab } from './forecasting/VoltForecastingTab';
import { VoltUtilityMonitorTab } from './utilitymonitor/VoltUtilityMonitorTab';
import { VoltSafetyTab } from './safety/VoltSafetyTab';

import { useVoltBuildProjects } from './hooks/useVoltBuildProjects';
import { useVoltBuildPhases } from './hooks/useVoltBuildPhases';
import { useVoltBuildRisks } from './hooks/useVoltBuildRisks';
import { VoltBuildTask, TaskStatus, VoltBuildPhase } from './types/voltbuild.types';
import { toast } from 'sonner';

export function VoltBuildPage() {
  const queryClient = useQueryClient();
  const { isApproved, isLoading: accessLoading } = useVoltBuildAccess();
  
  // State
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [expandedPhases, setExpandedPhases] = useState<string[]>([]);
  const [isNewProjectOpen, setIsNewProjectOpen] = useState(false);
  const [newTaskPhase, setNewTaskPhase] = useState<{ id: string; name: string } | null>(null);
  const [currentView, setCurrentView] = useState<VoltBuildView>('overview');
  const [isMobile, setIsMobile] = useState(false);
  const [isTaskSheetOpen, setIsTaskSheetOpen] = useState(false);
  const [isNewRiskOpen, setIsNewRiskOpen] = useState(false);

  // Data hooks
  const { projects, isLoading: projectsLoading, createProject, updateProject, isCreating } = useVoltBuildProjects();
  const { phases, isLoading: phasesLoading, recalculateProjectProgress } = useVoltBuildPhases(selectedProjectId);
  const { risks, createRisk, updateRisk, deleteRisk } = useVoltBuildRisks(selectedProjectId);

  // Load tasks for all phases
  const [tasksByPhase, setTasksByPhase] = useState<Record<string, VoltBuildTask[]>>({});
  const [tasksLoading, setTasksLoading] = useState(false);

  // Check for mobile
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
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

  // Count for badges
  const openRisksCount = risks.filter(r => r.status === 'open').length;
  const pendingTasksCount = allTasks.filter(t => t.status === 'not_started' || t.status === 'in_progress').length;

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

  // Handle add task from overview
  const handleAddTaskFromOverview = () => {
    if (phases.length > 0) {
      setNewTaskPhase({ id: phases[0].id, name: phases[0].name });
    }
    setCurrentView('tasks');
  };

  // Handle add risk from overview
  const handleAddRiskFromOverview = () => {
    setCurrentView('risks');
  };

  // Loading state
  if (accessLoading || projectsLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Access denied
  if (!isApproved) {
    return (
      <div className="flex items-center justify-center h-screen p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="w-5 h-5" />
              Access Denied
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              You don't have permission to access Build Management. Please contact an administrator to request access.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Render content based on current view
  const renderContent = () => {
    if (!selectedProject) {
      return (
        <div className="flex items-center justify-center h-full p-8">
          <Card className="max-w-md w-full">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <p className="mb-4 text-lg text-muted-foreground text-center">
                No projects yet. Create your first build project to get started.
              </p>
              <button
                onClick={() => setIsNewProjectOpen(true)}
                className="text-primary hover:underline font-medium"
              >
                Create New Project
              </button>
            </CardContent>
          </Card>
        </div>
      );
    }

    switch (currentView) {
      case 'overview':
        return (
          <VoltBuildOverviewRedesign
            project={selectedProject}
            phases={phases}
            tasks={allTasks}
            onNavigate={setCurrentView}
            onAddTask={handleAddTaskFromOverview}
            onAddRisk={handleAddRiskFromOverview}
            onUpdateProject={(updates) => updateProject({ id: selectedProject.id, ...updates })}
          />
        );

      case 'tasks':
        return (
          <div className="p-4 sm:p-6">
            <h1 className="text-2xl font-bold text-foreground mb-6">Tasks</h1>
            <div className="grid gap-6 lg:grid-cols-5">
              {/* Kanban Board */}
              <div className="lg:col-span-3">
                {phasesLoading || tasksLoading ? (
                  <div className="flex items-center justify-center h-64">
                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                  </div>
                ) : (
                  <VoltBuildKanbanBoard
                    tasks={allTasks}
                    phases={phases}
                    selectedTaskId={selectedTaskId}
                    onTaskSelect={handleTaskSelect}
                    onTaskStatusChange={handleTaskStatusChange}
                    onAddTask={(phaseId) => {
                      const phase = phases.find(p => p.id === phaseId);
                      if (phase) {
                        setNewTaskPhase({ id: phaseId, name: phase.name });
                      }
                    }}
                  />
                )}
              </div>

              {/* Task Detail Panel (Desktop) */}
              <div className="hidden lg:block lg:col-span-2">
                {selectedTask && selectedProjectId ? (
                  <VoltBuildTaskDetail
                    task={selectedTask}
                    projectId={selectedProjectId}
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
          </div>
        );

      case 'timeline':
        return (
          <div className="p-4 sm:p-6">
            <EnhancedTimeline project={selectedProject} />
          </div>
        );

      case 'risks':
        return (
          <div className="p-4 sm:p-6">
            <EnhancedRisksTab
              projectId={selectedProjectId!}
              phases={phases.map(p => ({ id: p.id, name: p.name }))}
              tasks={allTasks.map(t => ({ id: t.id, name: t.name }))}
            />
          </div>
        );

      case 'capex':
        return (
          <div className="p-4 sm:p-6">
            <h1 className="text-2xl font-bold text-foreground mb-6">CAPEX Management</h1>
            <VoltCapExTab project={selectedProject} phases={phases} />
          </div>
        );

      case 'leadtime':
        return (
          <div className="p-4 sm:p-6">
            <h1 className="text-2xl font-bold text-foreground mb-6">Lead Times</h1>
            <VoltLeadTimeTab project={selectedProject} />
          </div>
        );

      case 'advisor':
        return (
          <div className="p-4 sm:p-6">
            <h1 className="text-2xl font-bold text-foreground mb-6">AI Project Advisor</h1>
            <VoltAdvisorTab project={selectedProject} phases={phases} tasks={allTasks} />
          </div>
        );

      case 'bids':
        return (
          <div className="p-4 sm:p-6">
            <h1 className="text-2xl font-bold text-foreground mb-6">Bids & Vendors</h1>
            <VoltBidsTab project={selectedProject} phases={phases} />
          </div>
        );

      case 'procurement':
        return (
          <div className="p-4 sm:p-6">
            <h1 className="text-2xl font-bold text-foreground mb-6">Procurement</h1>
            <VoltProcurementTab project={selectedProject} phases={phases} />
          </div>
        );

      case 'changeorders':
        return (
          <div className="p-4 sm:p-6">
            <h1 className="text-2xl font-bold text-foreground mb-6">Change Orders</h1>
            <VoltChangeOrdersTab project={selectedProject} phases={phases} />
          </div>
        );

      case 'quality':
        return (
          <div className="p-4 sm:p-6">
            <h1 className="text-2xl font-bold text-foreground mb-6">Quality & Commissioning</h1>
            <VoltQualityTab project={selectedProject} phases={phases} />
          </div>
        );

      case 'reporting':
        return (
          <div className="p-4 sm:p-6">
            <h1 className="text-2xl font-bold text-foreground mb-6">Reports</h1>
            <VoltReportingTab project={selectedProject} tasks={allTasks} />
          </div>
        );

      // Phase 3 Views
      case 'dailylogs':
        return (
          <div className="p-4 sm:p-6">
            <h1 className="text-2xl font-bold text-foreground mb-6">Daily Logs</h1>
            <VoltDailyLogsTab project={selectedProject} />
          </div>
        );

      case 'fieldcheckins':
        return (
          <div className="p-4 sm:p-6">
            <h1 className="text-2xl font-bold text-foreground mb-6">Field Check-Ins</h1>
            <VoltFieldCheckInsTab project={selectedProject} />
          </div>
        );

      case 'verification':
        return (
          <div className="p-4 sm:p-6">
            <h1 className="text-2xl font-bold text-foreground mb-6">Progress Verification</h1>
            <VoltVerificationTab project={selectedProject} phases={phases} tasks={allTasks} />
          </div>
        );

      case 'forecasting':
        return (
          <div className="p-4 sm:p-6">
            <h1 className="text-2xl font-bold text-foreground mb-6">Forecasting</h1>
            <VoltForecastingTab project={selectedProject} phases={phases} tasks={allTasks} />
          </div>
        );

      case 'utilitymonitor':
        return (
          <div className="p-4 sm:p-6">
            <h1 className="text-2xl font-bold text-foreground mb-6">Utility Monitor</h1>
            <VoltUtilityMonitorTab project={selectedProject} />
          </div>
        );

      case 'safety':
        return (
          <div className="p-4 sm:p-6">
            <h1 className="text-2xl font-bold text-foreground mb-6">Compliance & Safety</h1>
            <VoltSafetyTab project={selectedProject} />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <>
      {/* Project Header - Only on mobile or when needed */}
      <div className="lg:hidden border-b border-border bg-card">
        <VoltBuildHeader
          projects={projects}
          selectedProjectId={selectedProjectId}
          onProjectSelect={setSelectedProjectId}
          onNewProject={() => setIsNewProjectOpen(true)}
          selectedProject={selectedProject}
        />
      </div>

      {/* Main Layout with Sidebar */}
      <VoltBuildLayout
        currentView={currentView}
        onViewChange={setCurrentView}
        riskCount={openRisksCount}
        taskCount={pendingTasksCount}
        projects={projects}
        selectedProjectId={selectedProjectId}
        onProjectSelect={setSelectedProjectId}
        onNewProject={() => setIsNewProjectOpen(true)}
      >
        {renderContent()}
      </VoltBuildLayout>

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
          {selectedTask && selectedProjectId && (
            <div className="mt-4">
              <VoltBuildTaskDetail
                task={selectedTask}
                projectId={selectedProjectId}
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
    </>
  );
}
