import { parseISO } from 'date-fns';
import { 
  GanttTask, 
  GanttDependency, 
  DependencyType, 
  DependencyPath,
  TaskPosition 
} from '../types/gantt.types';
import { getPositionForDate } from './dateCalculations';

interface RoutingParams {
  tasks: GanttTask[];
  dependencies: GanttDependency[];
  taskPositions: Map<string, { rowIndex: number; phaseId: string }>;
  startDate: Date;
  endDate: Date;
  totalWidth: number;
  rowHeight: number;
  headerHeight: number;
  taskListWidth: number;
  criticalPathTasks: Set<string>;
}

/**
 * Calculate SVG path for dependency arrows
 */
export function calculateDependencyPaths(params: RoutingParams): DependencyPath[] {
  const {
    tasks,
    dependencies,
    taskPositions,
    startDate,
    endDate,
    totalWidth,
    rowHeight,
    headerHeight,
    taskListWidth,
    criticalPathTasks,
  } = params;

  return dependencies.map(dep => {
    const predecessor = tasks.find(t => t.id === dep.predecessor_task_id);
    const successor = tasks.find(t => t.id === dep.successor_task_id);
    
    if (!predecessor || !successor) {
      return null;
    }

    const predPosition = taskPositions.get(predecessor.id);
    const succPosition = taskPositions.get(successor.id);
    
    if (!predPosition || !succPosition) {
      return null;
    }

    // Calculate connection points based on dependency type
    const points = calculateConnectionPoints({
      predecessor,
      successor,
      predRowIndex: predPosition.rowIndex,
      succRowIndex: succPosition.rowIndex,
      dependencyType: dep.dependency_type,
      startDate,
      endDate,
      totalWidth,
      rowHeight,
      headerHeight,
      taskListWidth,
    });

    if (!points) return null;

    const path = generateBezierPath(points, predPosition.rowIndex, succPosition.rowIndex);
    const isCritical = criticalPathTasks.has(predecessor.id) && criticalPathTasks.has(successor.id);

    return {
      id: dep.id,
      predecessorId: dep.predecessor_task_id,
      successorId: dep.successor_task_id,
      type: dep.dependency_type,
      path,
      isCritical,
      lagDays: dep.lag_days,
    };
  }).filter((p): p is DependencyPath => p !== null);
}

interface ConnectionPointsParams {
  predecessor: GanttTask;
  successor: GanttTask;
  predRowIndex: number;
  succRowIndex: number;
  dependencyType: DependencyType;
  startDate: Date;
  endDate: Date;
  totalWidth: number;
  rowHeight: number;
  headerHeight: number;
  taskListWidth: number;
}

interface ConnectionPoints {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
}

function calculateConnectionPoints(params: ConnectionPointsParams): ConnectionPoints | null {
  const {
    predecessor,
    successor,
    predRowIndex,
    succRowIndex,
    dependencyType,
    startDate,
    endDate,
    totalWidth,
    rowHeight,
    headerHeight,
    taskListWidth,
  } = params;

  if (!predecessor.estimated_start_date || !predecessor.estimated_end_date) return null;
  if (!successor.estimated_start_date || !successor.estimated_end_date) return null;

  const predStart = getPositionForDate(predecessor.estimated_start_date, startDate, endDate, totalWidth);
  const predEnd = getPositionForDate(predecessor.estimated_end_date, startDate, endDate, totalWidth);
  const succStart = getPositionForDate(successor.estimated_start_date, startDate, endDate, totalWidth);
  const succEnd = getPositionForDate(successor.estimated_end_date, startDate, endDate, totalWidth);

  const predY = headerHeight + (predRowIndex * rowHeight) + (rowHeight / 2);
  const succY = headerHeight + (succRowIndex * rowHeight) + (rowHeight / 2);

  let startX: number, endX: number;

  switch (dependencyType) {
    case 'finish_to_start':
      startX = taskListWidth + predEnd;
      endX = taskListWidth + succStart;
      break;
    case 'start_to_start':
      startX = taskListWidth + predStart;
      endX = taskListWidth + succStart;
      break;
    case 'finish_to_finish':
      startX = taskListWidth + predEnd;
      endX = taskListWidth + succEnd;
      break;
    case 'start_to_finish':
      startX = taskListWidth + predStart;
      endX = taskListWidth + succEnd;
      break;
    default:
      startX = taskListWidth + predEnd;
      endX = taskListWidth + succStart;
  }

  return { startX, startY: predY, endX, endY: succY };
}

/**
 * Generate a smooth Bezier curve path
 */
function generateBezierPath(points: ConnectionPoints, predRowIndex: number, succRowIndex: number): string {
  const { startX, startY, endX, endY } = points;
  
  const horizontalDistance = endX - startX;
  const verticalDistance = endY - startY;
  
  // Different routing strategies based on relative positions
  if (horizontalDistance > 20) {
    // Forward dependency - simple S-curve
    const controlOffset = Math.min(40, horizontalDistance / 2);
    return `M ${startX} ${startY} 
            C ${startX + controlOffset} ${startY}, 
              ${endX - controlOffset} ${endY}, 
              ${endX} ${endY}`;
  } else {
    // Backward dependency - route around tasks
    const goDown = succRowIndex > predRowIndex;
    const midY = goDown ? startY + 20 : startY - 20;
    const outsetX = Math.min(startX, endX) - 30;
    
    return `M ${startX} ${startY}
            L ${startX + 10} ${startY}
            Q ${startX + 10} ${midY}, ${outsetX} ${midY}
            L ${outsetX} ${endY}
            Q ${endX - 10} ${endY}, ${endX - 10} ${endY}
            L ${endX} ${endY}`;
  }
}

/**
 * Check for circular dependencies
 */
export function hasCircularDependency(
  dependencies: GanttDependency[],
  predecessorId: string,
  successorId: string
): boolean {
  // Build adjacency list
  const graph = new Map<string, Set<string>>();
  
  dependencies.forEach(dep => {
    if (!graph.has(dep.predecessor_task_id)) {
      graph.set(dep.predecessor_task_id, new Set());
    }
    graph.get(dep.predecessor_task_id)!.add(dep.successor_task_id);
  });

  // Add the proposed new dependency
  if (!graph.has(predecessorId)) {
    graph.set(predecessorId, new Set());
  }
  graph.get(predecessorId)!.add(successorId);

  // DFS to detect cycles
  const visited = new Set<string>();
  const recursionStack = new Set<string>();

  function hasCycle(node: string): boolean {
    visited.add(node);
    recursionStack.add(node);

    const neighbors = graph.get(node) || new Set();
    for (const neighbor of neighbors) {
      if (!visited.has(neighbor)) {
        if (hasCycle(neighbor)) return true;
      } else if (recursionStack.has(neighbor)) {
        return true;
      }
    }

    recursionStack.delete(node);
    return false;
  }

  // Check from the successor (would it create a path back to predecessor?)
  return hasCycle(successorId);
}

/**
 * Get all tasks dependent on a given task (direct and transitive)
 */
export function getDependentTasks(
  dependencies: GanttDependency[],
  taskId: string
): Set<string> {
  const dependents = new Set<string>();
  const toProcess = [taskId];

  while (toProcess.length > 0) {
    const current = toProcess.pop()!;
    
    dependencies.forEach(dep => {
      if (dep.predecessor_task_id === current && !dependents.has(dep.successor_task_id)) {
        dependents.add(dep.successor_task_id);
        toProcess.push(dep.successor_task_id);
      }
    });
  }

  return dependents;
}

/**
 * Get all predecessors of a given task (direct and transitive)
 */
export function getPredecessorTasks(
  dependencies: GanttDependency[],
  taskId: string
): Set<string> {
  const predecessors = new Set<string>();
  const toProcess = [taskId];

  while (toProcess.length > 0) {
    const current = toProcess.pop()!;
    
    dependencies.forEach(dep => {
      if (dep.successor_task_id === current && !predecessors.has(dep.predecessor_task_id)) {
        predecessors.add(dep.predecessor_task_id);
        toProcess.push(dep.predecessor_task_id);
      }
    });
  }

  return predecessors;
}
