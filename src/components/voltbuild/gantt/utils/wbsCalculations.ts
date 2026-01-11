import { differenceInDays, parseISO, format, addDays } from 'date-fns';
import { GanttTask, GanttPhase } from '../types/gantt.types';

// Generate WBS code for a phase
export function generatePhaseWbsCode(phaseIndex: number): string {
  return `${phaseIndex + 1}`;
}

// Generate WBS code for a task
export function generateTaskWbsCode(phaseIndex: number, taskIndex: number): string {
  return `${phaseIndex + 1}.${taskIndex + 1}`;
}

// Generate full hierarchical WBS code (e.g., "1.2.3" for sub-sub-tasks)
export function generateHierarchicalWbsCode(path: number[]): string {
  return path.map(i => i + 1).join('.');
}

// Calculate duration in days between two dates
export function calculateTaskDuration(startDate: string | null, endDate: string | null): number | null {
  if (!startDate || !endDate) return null;
  try {
    const start = parseISO(startDate);
    const end = parseISO(endDate);
    return differenceInDays(end, start) + 1; // +1 to include both start and end days
  } catch {
    return null;
  }
}

// Calculate end date from start date and duration
export function calculateEndDateFromDuration(startDate: string, durationDays: number): string {
  try {
    const start = parseISO(startDate);
    const end = addDays(start, durationDays - 1); // -1 because duration includes start day
    return format(end, 'yyyy-MM-dd');
  } catch {
    return startDate;
  }
}

// Calculate start date from end date and duration
export function calculateStartDateFromDuration(endDate: string, durationDays: number): string {
  try {
    const end = parseISO(endDate);
    const start = addDays(end, -(durationDays - 1)); // -1 because duration includes end day
    return format(start, 'yyyy-MM-dd');
  } catch {
    return endDate;
  }
}

// Calculate start day relative to project start
export function calculateRelativeStartDay(
  taskStartDate: string | null, 
  projectStartDate: Date | null
): number | null {
  if (!taskStartDate || !projectStartDate) return null;
  try {
    const taskStart = parseISO(taskStartDate);
    return differenceInDays(taskStart, projectStartDate) + 1;
  } catch {
    return null;
  }
}

// Calculate end day relative to project start
export function calculateRelativeEndDay(
  taskEndDate: string | null, 
  projectStartDate: Date | null
): number | null {
  if (!taskEndDate || !projectStartDate) return null;
  try {
    const taskEnd = parseISO(taskEndDate);
    return differenceInDays(taskEnd, projectStartDate) + 1;
  } catch {
    return null;
  }
}

// Calculate phase rollup dates and duration from child tasks
export interface PhaseRollup {
  startDate: string | null;
  endDate: string | null;
  duration: number | null;
  progress: number;
  taskCount: number;
  completedCount: number;
}

export function calculatePhaseRollup(tasks: GanttTask[]): PhaseRollup {
  if (tasks.length === 0) {
    return {
      startDate: null,
      endDate: null,
      duration: null,
      progress: 0,
      taskCount: 0,
      completedCount: 0,
    };
  }

  const completedCount = tasks.filter(t => t.status === 'complete').length;
  const progress = Math.round((completedCount / tasks.length) * 100);
  
  // Get tasks with valid dates
  const datedTasks = tasks.filter(t => t.estimated_start_date && t.estimated_end_date);
  
  if (datedTasks.length === 0) {
    return {
      startDate: null,
      endDate: null,
      duration: null,
      progress,
      taskCount: tasks.length,
      completedCount,
    };
  }

  // Find earliest start and latest end
  let earliestStart: Date | null = null;
  let latestEnd: Date | null = null;

  datedTasks.forEach(task => {
    const start = parseISO(task.estimated_start_date!);
    const end = parseISO(task.estimated_end_date!);

    if (!earliestStart || start < earliestStart) {
      earliestStart = start;
    }
    if (!latestEnd || end > latestEnd) {
      latestEnd = end;
    }
  });

  const startDate = earliestStart ? format(earliestStart, 'yyyy-MM-dd') : null;
  const endDate = latestEnd ? format(latestEnd, 'yyyy-MM-dd') : null;
  const duration = earliestStart && latestEnd 
    ? differenceInDays(latestEnd, earliestStart) + 1 
    : null;

  return {
    startDate,
    endDate,
    duration,
    progress,
    taskCount: tasks.length,
    completedCount,
  };
}

// Format date for display
export function formatDisplayDate(dateString: string | null, formatStr: string = 'MMM d'): string {
  if (!dateString) return '-';
  try {
    return format(parseISO(dateString), formatStr);
  } catch {
    return '-';
  }
}

// Calculate the total project duration
export function calculateProjectDuration(
  projectStartDate: string | null,
  projectEndDate: string | null
): number | null {
  if (!projectStartDate || !projectEndDate) return null;
  try {
    const start = parseISO(projectStartDate);
    const end = parseISO(projectEndDate);
    return differenceInDays(end, start) + 1;
  } catch {
    return null;
  }
}

// Validate and normalize WBS codes
export function normalizeWbsCode(wbsCode: string): string {
  // Remove any leading/trailing whitespace
  const trimmed = wbsCode.trim();
  
  // Split by dots and filter out empty parts
  const parts = trimmed.split('.').filter(p => p.length > 0);
  
  // Convert each part to a number and back to string to normalize (e.g., "01" -> "1")
  const normalized = parts.map(p => {
    const num = parseInt(p, 10);
    return isNaN(num) ? p : num.toString();
  });
  
  return normalized.join('.');
}

// Compare WBS codes for sorting
export function compareWbsCodes(a: string, b: string): number {
  const partsA = a.split('.').map(p => parseInt(p, 10) || 0);
  const partsB = b.split('.').map(p => parseInt(p, 10) || 0);
  
  const maxLength = Math.max(partsA.length, partsB.length);
  
  for (let i = 0; i < maxLength; i++) {
    const valA = partsA[i] || 0;
    const valB = partsB[i] || 0;
    
    if (valA !== valB) {
      return valA - valB;
    }
  }
  
  return 0;
}

// Get parent WBS code from a task WBS code
export function getParentWbsCode(wbsCode: string): string | null {
  const parts = wbsCode.split('.');
  if (parts.length <= 1) return null;
  return parts.slice(0, -1).join('.');
}

// Check if a WBS code is a descendant of another
export function isDescendantOf(childWbs: string, parentWbs: string): boolean {
  return childWbs.startsWith(parentWbs + '.');
}