// Main exports
export { EnhancedGanttChart } from './EnhancedGanttChart';
export { VoltGanttChart } from './VoltGanttChart';

// Types
export type { 
  GanttTask, 
  GanttPhase, 
  GanttDependency, 
  GanttMilestone,
  GanttConfig,
  ZoomLevel,
  DependencyType,
} from './types/gantt.types';

// Hooks
export { useTaskDependencies, type TaskDependency } from './hooks/useTaskDependencies';

// Context
export { GanttProvider, useGantt } from './context/GanttContext';

// Utils
export { calculateCriticalPath } from './utils/criticalPathAlgorithm';
export { calculateTimelineBounds, getPositionForDate, getWidthForRange } from './utils/dateCalculations';
