export type ZoomLevel = 'day' | 'week' | 'month' | 'quarter';

export type MilestoneStatus = 'upcoming' | 'completed' | 'missed';

export interface VoltBuildMilestone {
  id: string;
  project_id: string;
  name: string;
  target_date: string;
  status: MilestoneStatus;
  phase_id: string | null;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface TimelineTask {
  id: string;
  phase_id: string;
  title: string;
  status: string;
  priority: string;
  is_critical: boolean;
  estimated_start_date: string | null;
  estimated_end_date: string | null;
  depends_on: string | null;
  assigned_to: string | null;
  progress: number;
  order_index: number;
}

export interface TimelinePhase {
  id: string;
  name: string;
  status: string;
  progress: number;
  estimated_start_date: string | null;
  estimated_end_date: string | null;
  order_index: number;
  tasks: TimelineTask[];
}

export interface TimelineFilters {
  status: string[];
  priority: string[];
  showCriticalPath: boolean;
  searchQuery: string;
  phaseId: string | null;
}

export interface TimelineDependency {
  sourceTaskId: string;
  targetTaskId: string;
  sourceX: number;
  sourceY: number;
  targetX: number;
  targetY: number;
  status: 'complete' | 'blocking' | 'pending';
}

export interface TimelineMetrics {
  totalDuration: number;
  daysRemaining: number;
  percentComplete: number;
  tasksOnTrack: number;
  tasksAtRisk: number;
  tasksDelayed: number;
  criticalPathTasks: number;
  nextMilestone: VoltBuildMilestone | null;
}
