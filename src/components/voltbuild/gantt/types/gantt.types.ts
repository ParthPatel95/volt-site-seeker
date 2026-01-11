// Comprehensive Gantt Chart Type Definitions

export type ZoomLevel = 'day' | 'week' | 'month' | 'quarter';
export type DependencyType = 'finish_to_start' | 'start_to_start' | 'finish_to_finish' | 'start_to_finish';
export type TaskBarDragMode = 'move' | 'resize-left' | 'resize-right' | null;

export interface GanttTask {
  id: string;
  phase_id: string;
  name: string;
  status: 'not_started' | 'in_progress' | 'blocked' | 'complete';
  is_critical_path: boolean;
  estimated_start_date: string | null;
  estimated_end_date: string | null;
  actual_start_date?: string | null;
  actual_end_date?: string | null;
  baseline_start_date?: string | null;
  baseline_end_date?: string | null;
  progress: number;
  assigned_role?: string;
  assigned_user_id?: string | null;
  description?: string | null;
  order_index?: number;
}

export interface GanttPhase {
  id: string;
  name: string;
  status?: string;
  progress?: number;
  order_index?: number;
}

export interface GanttDependency {
  id: string;
  project_id: string;
  predecessor_task_id: string;
  successor_task_id: string;
  dependency_type: DependencyType;
  lag_days: number;
  created_at: string;
}

export interface GanttMilestone {
  id: string;
  project_id: string;
  name: string;
  target_date: string;
  status: 'upcoming' | 'completed' | 'missed';
  phase_id: string | null;
  description: string | null;
}

export interface TimeColumn {
  date: Date;
  label: string;
  isWeekend?: boolean;
  isToday?: boolean;
}

export interface GanttViewport {
  startDate: Date;
  endDate: Date;
  scrollLeft: number;
  scrollTop: number;
}

export interface GanttSelection {
  selectedTaskIds: Set<string>;
  hoveredTaskId: string | null;
  focusedTaskId: string | null;
  linkingFromId: string | null;
}

export interface TaskPosition {
  taskId: string;
  rowIndex: number;
  left: number;
  width: number;
  top: number;
  height: number;
}

export interface DependencyPath {
  id: string;
  predecessorId: string;
  successorId: string;
  type: DependencyType;
  path: string;
  isCritical: boolean;
  lagDays: number;
}

export interface GanttConfig {
  rowHeight: number;
  headerHeight: number;
  taskListWidth: number;
  minTaskWidth: number;
  snapToGrid: boolean;
  showBaseline: boolean;
  showCriticalPath: boolean;
  showProgress: boolean;
  showDependencies: boolean;
  showMilestones: boolean;
  showTodayLine: boolean;
  showWeekends: boolean;
  animationsEnabled: boolean;
}

export interface ZoomConfig {
  level: ZoomLevel;
  columnWidth: number;
  dateFormat: string;
  headerFormat: string;
  snapUnit: 'day' | 'week';
}

export const ZOOM_CONFIGS: Record<ZoomLevel, ZoomConfig> = {
  day: { level: 'day', columnWidth: 40, dateFormat: 'd', headerFormat: 'MMM yyyy', snapUnit: 'day' },
  week: { level: 'week', columnWidth: 120, dateFormat: "'W'w", headerFormat: 'MMM yyyy', snapUnit: 'day' },
  month: { level: 'month', columnWidth: 180, dateFormat: 'MMM', headerFormat: 'yyyy', snapUnit: 'week' },
  quarter: { level: 'quarter', columnWidth: 240, dateFormat: 'QQQ', headerFormat: 'yyyy', snapUnit: 'week' },
};

export const DEFAULT_GANTT_CONFIG: GanttConfig = {
  rowHeight: 44,
  headerHeight: 48,
  taskListWidth: 300,
  minTaskWidth: 24,
  snapToGrid: true,
  showBaseline: false,
  showCriticalPath: true,
  showProgress: true,
  showDependencies: true,
  showMilestones: true,
  showTodayLine: true,
  showWeekends: true,
  animationsEnabled: true,
};

// Status color configurations
export const TASK_STATUS_COLORS = {
  not_started: {
    bg: 'bg-muted',
    fill: 'hsl(var(--muted))',
    text: 'text-muted-foreground',
  },
  in_progress: {
    bg: 'bg-blue-500',
    fill: 'hsl(210, 100%, 50%)',
    text: 'text-blue-600',
  },
  blocked: {
    bg: 'bg-destructive',
    fill: 'hsl(var(--destructive))',
    text: 'text-destructive',
  },
  complete: {
    bg: 'bg-green-500',
    fill: 'hsl(142, 76%, 36%)',
    text: 'text-green-600',
  },
  critical: {
    bg: 'bg-orange-500',
    fill: 'hsl(25, 95%, 53%)',
    text: 'text-orange-600',
  },
};

// Dependency type display names
export const DEPENDENCY_TYPE_LABELS: Record<DependencyType, string> = {
  finish_to_start: 'Finish to Start (FS)',
  start_to_start: 'Start to Start (SS)',
  finish_to_finish: 'Finish to Finish (FF)',
  start_to_finish: 'Start to Finish (SF)',
};
