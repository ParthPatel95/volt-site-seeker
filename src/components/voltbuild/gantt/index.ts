// Main exports
export { EnhancedGanttChart } from './EnhancedGanttChart';
export { VoltGanttChart } from './VoltGanttChart';
export { FullGanttChart } from './FullGanttChart';

// Enhanced Components
export { EnhancedGanttTaskList } from './components/EnhancedGanttTaskList';
export { EnhancedGanttTimeHeader } from './components/EnhancedGanttTimeHeader';
export { EnhancedGanttGrid } from './components/EnhancedGanttGrid';
export { EnhancedGanttTaskBar } from './components/EnhancedGanttTaskBar';
export { GanttPhaseBar } from './components/GanttPhaseBar';
export { GanttMilestoneMarker } from './components/GanttMilestoneMarker';
export type { MilestoneType, MilestoneStatus } from './components/GanttMilestoneMarker';

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
export * from './utils/wbsCalculations';
