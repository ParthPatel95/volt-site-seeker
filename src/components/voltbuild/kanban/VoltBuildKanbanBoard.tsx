import React, { useState, useMemo } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { VoltBuildKanbanColumn } from './VoltBuildKanbanColumn';
import { VoltBuildKanbanCard } from './VoltBuildKanbanCard';
import { VoltBuildTask, VoltBuildPhase, TaskStatus } from '../types/voltbuild.types';

interface VoltBuildKanbanBoardProps {
  tasks: VoltBuildTask[];
  phases: VoltBuildPhase[];
  selectedTaskId: string | null;
  onTaskSelect: (taskId: string) => void;
  onTaskStatusChange: (taskId: string, status: TaskStatus) => void;
  onAddTask: (phaseId: string) => void;
}

const STATUSES: TaskStatus[] = ['not_started', 'in_progress', 'blocked', 'complete'];

export function VoltBuildKanbanBoard({
  tasks,
  phases,
  selectedTaskId,
  onTaskSelect,
  onTaskStatusChange,
  onAddTask,
}: VoltBuildKanbanBoardProps) {
  const [selectedPhaseFilter, setSelectedPhaseFilter] = useState<string>('all');
  const [dragOverStatus, setDragOverStatus] = useState<TaskStatus | null>(null);
  const [draggingTaskId, setDraggingTaskId] = useState<string | null>(null);

  // Filter tasks by phase
  const filteredTasks = useMemo(() => {
    if (selectedPhaseFilter === 'all') return tasks;
    return tasks.filter(t => t.phase_id === selectedPhaseFilter);
  }, [tasks, selectedPhaseFilter]);

  // Group tasks by status
  const tasksByStatus = useMemo(() => {
    const grouped: Record<TaskStatus, VoltBuildTask[]> = {
      not_started: [],
      in_progress: [],
      blocked: [],
      complete: [],
    };

    filteredTasks.forEach(task => {
      if (grouped[task.status]) {
        grouped[task.status].push(task);
      }
    });

    return grouped;
  }, [filteredTasks]);

  // Get phase by id
  const getPhase = (phaseId: string) => phases.find(p => p.id === phaseId);

  // Drag handlers
  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData('taskId', taskId);
    setDraggingTaskId(taskId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDragEnter = (status: TaskStatus) => {
    setDragOverStatus(status);
  };

  const handleDragLeave = () => {
    setDragOverStatus(null);
  };

  const handleDrop = (e: React.DragEvent, status: TaskStatus) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('taskId');
    if (taskId) {
      const task = tasks.find(t => t.id === taskId);
      if (task && task.status !== status) {
        onTaskStatusChange(taskId, status);
      }
    }
    setDragOverStatus(null);
    setDraggingTaskId(null);
  };

  // Get first phase for add task
  const handleAddTask = () => {
    const targetPhaseId = selectedPhaseFilter !== 'all' 
      ? selectedPhaseFilter 
      : phases[0]?.id;
    
    if (targetPhaseId) {
      onAddTask(targetPhaseId);
    }
  };

  return (
    <div className="space-y-4">
      {/* Phase Filter */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Filter by Phase:</span>
          <Select
            value={selectedPhaseFilter}
            onValueChange={setSelectedPhaseFilter}
          >
            <SelectTrigger className="w-[250px]">
              <SelectValue placeholder="All Phases" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Phases</SelectItem>
              {phases.map(phase => (
                <SelectItem key={phase.id} value={phase.id}>
                  {phase.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="text-sm text-muted-foreground">
          {filteredTasks.length} task{filteredTasks.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Kanban Columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {STATUSES.map(status => (
          <div
            key={status}
            onDragEnter={() => handleDragEnter(status)}
            onDragLeave={handleDragLeave}
          >
            <VoltBuildKanbanColumn
              status={status}
              count={tasksByStatus[status].length}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onAddTask={status !== 'complete' ? handleAddTask : undefined}
              isDragOver={dragOverStatus === status && draggingTaskId !== null}
            >
              {tasksByStatus[status].map(task => (
                <VoltBuildKanbanCard
                  key={task.id}
                  task={task}
                  phase={getPhase(task.phase_id)}
                  isSelected={task.id === selectedTaskId}
                  onClick={() => onTaskSelect(task.id)}
                  onDragStart={handleDragStart}
                />
              ))}
            </VoltBuildKanbanColumn>
          </div>
        ))}
      </div>
    </div>
  );
}
