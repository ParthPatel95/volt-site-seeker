import { parseISO, differenceInDays, addDays, format } from 'date-fns';
import { GanttTask, GanttDependency } from '../types/gantt.types';

interface TaskNode {
  id: string;
  duration: number;
  earlyStart: number;
  earlyFinish: number;
  lateStart: number;
  lateFinish: number;
  slack: number;
  isCritical: boolean;
}

interface CriticalPathResult {
  criticalPathTaskIds: Set<string>;
  criticalPathDependencyIds: Set<string>;
  projectDuration: number;
  taskNodes: Map<string, TaskNode>;
}

/**
 * Calculate the critical path using the Critical Path Method (CPM)
 */
export function calculateCriticalPath(
  tasks: GanttTask[],
  dependencies: GanttDependency[]
): CriticalPathResult {
  // Build task nodes with durations
  const taskNodes = new Map<string, TaskNode>();
  const projectStartDate = getProjectStartDate(tasks);
  
  tasks.forEach(task => {
    const duration = calculateTaskDuration(task);
    taskNodes.set(task.id, {
      id: task.id,
      duration,
      earlyStart: 0,
      earlyFinish: 0,
      lateStart: Infinity,
      lateFinish: Infinity,
      slack: 0,
      isCritical: false,
    });
  });

  // Build adjacency lists
  const successors = new Map<string, string[]>();
  const predecessors = new Map<string, string[]>();
  
  tasks.forEach(task => {
    successors.set(task.id, []);
    predecessors.set(task.id, []);
  });

  dependencies.forEach(dep => {
    if (successors.has(dep.predecessor_task_id) && predecessors.has(dep.successor_task_id)) {
      successors.get(dep.predecessor_task_id)!.push(dep.successor_task_id);
      predecessors.get(dep.successor_task_id)!.push(dep.predecessor_task_id);
    }
  });

  // Topological sort
  const sorted = topologicalSort(tasks, predecessors, successors);
  if (!sorted) {
    // Circular dependency detected, fall back to explicit critical path flags
    return fallbackToCriticalPathFlags(tasks, dependencies);
  }

  // Forward pass - calculate early start and early finish
  sorted.forEach(taskId => {
    const node = taskNodes.get(taskId)!;
    const preds = predecessors.get(taskId) || [];
    
    if (preds.length === 0) {
      node.earlyStart = 0;
    } else {
      node.earlyStart = Math.max(
        ...preds.map(predId => {
          const predNode = taskNodes.get(predId)!;
          const dep = dependencies.find(
            d => d.predecessor_task_id === predId && d.successor_task_id === taskId
          );
          const lag = dep?.lag_days || 0;
          return predNode.earlyFinish + lag;
        })
      );
    }
    node.earlyFinish = node.earlyStart + node.duration;
  });

  // Find project duration (latest early finish)
  let projectDuration = 0;
  taskNodes.forEach(node => {
    if (node.earlyFinish > projectDuration) {
      projectDuration = node.earlyFinish;
    }
  });

  // Backward pass - calculate late start and late finish
  const reversedSorted = [...sorted].reverse();
  reversedSorted.forEach(taskId => {
    const node = taskNodes.get(taskId)!;
    const succs = successors.get(taskId) || [];
    
    if (succs.length === 0) {
      node.lateFinish = projectDuration;
    } else {
      node.lateFinish = Math.min(
        ...succs.map(succId => {
          const succNode = taskNodes.get(succId)!;
          const dep = dependencies.find(
            d => d.predecessor_task_id === taskId && d.successor_task_id === succId
          );
          const lag = dep?.lag_days || 0;
          return succNode.lateStart - lag;
        })
      );
    }
    node.lateStart = node.lateFinish - node.duration;
  });

  // Calculate slack and identify critical path
  const criticalPathTaskIds = new Set<string>();
  taskNodes.forEach((node, taskId) => {
    node.slack = node.lateStart - node.earlyStart;
    node.isCritical = node.slack === 0;
    if (node.isCritical) {
      criticalPathTaskIds.add(taskId);
    }
  });

  // Identify critical dependencies
  const criticalPathDependencyIds = new Set<string>();
  dependencies.forEach(dep => {
    if (criticalPathTaskIds.has(dep.predecessor_task_id) && 
        criticalPathTaskIds.has(dep.successor_task_id)) {
      criticalPathDependencyIds.add(dep.id);
    }
  });

  return {
    criticalPathTaskIds,
    criticalPathDependencyIds,
    projectDuration,
    taskNodes,
  };
}

function getProjectStartDate(tasks: GanttTask[]): Date {
  const dates = tasks
    .filter(t => t.estimated_start_date)
    .map(t => parseISO(t.estimated_start_date!));
  
  if (dates.length === 0) return new Date();
  return dates.reduce((min, d) => d < min ? d : min, dates[0]);
}

function calculateTaskDuration(task: GanttTask): number {
  if (!task.estimated_start_date || !task.estimated_end_date) return 1;
  return Math.max(1, differenceInDays(
    parseISO(task.estimated_end_date),
    parseISO(task.estimated_start_date)
  ));
}

function topologicalSort(
  tasks: GanttTask[],
  predecessors: Map<string, string[]>,
  successors: Map<string, string[]>
): string[] | null {
  const sorted: string[] = [];
  const visited = new Set<string>();
  const visiting = new Set<string>();

  function visit(taskId: string): boolean {
    if (visiting.has(taskId)) return false; // Cycle detected
    if (visited.has(taskId)) return true;

    visiting.add(taskId);
    
    const preds = predecessors.get(taskId) || [];
    for (const pred of preds) {
      if (!visit(pred)) return false;
    }
    
    visiting.delete(taskId);
    visited.add(taskId);
    sorted.push(taskId);
    return true;
  }

  for (const task of tasks) {
    if (!visited.has(task.id)) {
      if (!visit(task.id)) return null;
    }
  }

  return sorted;
}

function fallbackToCriticalPathFlags(
  tasks: GanttTask[],
  dependencies: GanttDependency[]
): CriticalPathResult {
  const criticalPathTaskIds = new Set<string>();
  const criticalPathDependencyIds = new Set<string>();
  const taskNodes = new Map<string, TaskNode>();

  tasks.forEach(task => {
    if (task.is_critical_path) {
      criticalPathTaskIds.add(task.id);
    }
    taskNodes.set(task.id, {
      id: task.id,
      duration: calculateTaskDuration(task),
      earlyStart: 0,
      earlyFinish: 0,
      lateStart: 0,
      lateFinish: 0,
      slack: task.is_critical_path ? 0 : Infinity,
      isCritical: task.is_critical_path,
    });
  });

  dependencies.forEach(dep => {
    if (criticalPathTaskIds.has(dep.predecessor_task_id) && 
        criticalPathTaskIds.has(dep.successor_task_id)) {
      criticalPathDependencyIds.add(dep.id);
    }
  });

  return {
    criticalPathTaskIds,
    criticalPathDependencyIds,
    projectDuration: 0,
    taskNodes,
  };
}

/**
 * Get schedule analysis metrics
 */
export function getScheduleAnalysis(
  tasks: GanttTask[],
  criticalPath: CriticalPathResult
): {
  criticalPathLength: number;
  tasksOnCriticalPath: number;
  totalTasks: number;
  averageSlack: number;
  tasksWithNoSlack: number;
} {
  let totalSlack = 0;
  let tasksWithSlackCount = 0;

  criticalPath.taskNodes.forEach(node => {
    if (node.slack < Infinity) {
      totalSlack += node.slack;
      tasksWithSlackCount++;
    }
  });

  return {
    criticalPathLength: criticalPath.projectDuration,
    tasksOnCriticalPath: criticalPath.criticalPathTaskIds.size,
    totalTasks: tasks.length,
    averageSlack: tasksWithSlackCount > 0 ? totalSlack / tasksWithSlackCount : 0,
    tasksWithNoSlack: criticalPath.criticalPathTaskIds.size,
  };
}
