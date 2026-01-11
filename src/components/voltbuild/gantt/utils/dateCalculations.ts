import { 
  differenceInDays, 
  addDays, 
  parseISO, 
  startOfDay,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  eachWeekOfInterval,
  eachMonthOfInterval,
  format,
  isWeekend,
  isToday,
  isSameDay,
} from 'date-fns';
import { GanttTask, ZoomLevel, TimeColumn, ZOOM_CONFIGS } from '../types/gantt.types';

/**
 * Calculate timeline bounds from tasks
 */
export function calculateTimelineBounds(tasks: GanttTask[], padding = 14): { startDate: Date; endDate: Date } {
  const dates = tasks
    .filter(t => t.estimated_start_date || t.estimated_end_date)
    .flatMap(t => [
      t.estimated_start_date ? parseISO(t.estimated_start_date) : null,
      t.estimated_end_date ? parseISO(t.estimated_end_date) : null,
    ])
    .filter((d): d is Date => d !== null);

  if (dates.length === 0) {
    const today = new Date();
    return { 
      startDate: addDays(today, -7), 
      endDate: addDays(today, 90) 
    };
  }

  const minDate = dates.reduce((min, d) => d < min ? d : min, dates[0]);
  const maxDate = dates.reduce((max, d) => d > max ? d : max, dates[0]);

  return {
    startDate: addDays(minDate, -padding),
    endDate: addDays(maxDate, padding),
  };
}

/**
 * Generate time columns based on zoom level
 */
export function generateTimeColumns(
  startDate: Date, 
  endDate: Date, 
  zoomLevel: ZoomLevel
): TimeColumn[] {
  const config = ZOOM_CONFIGS[zoomLevel];
  
  switch (zoomLevel) {
    case 'day':
      return eachDayOfInterval({ start: startDate, end: endDate }).map(date => ({
        date,
        label: format(date, config.dateFormat),
        isWeekend: isWeekend(date),
        isToday: isToday(date),
      }));
    
    case 'week':
      return eachWeekOfInterval({ start: startDate, end: endDate }).map(date => ({
        date,
        label: format(date, config.dateFormat),
        isWeekend: false,
        isToday: isSameDay(date, startOfWeek(new Date())),
      }));
    
    case 'month':
    case 'quarter':
      return eachMonthOfInterval({ start: startDate, end: endDate }).map(date => ({
        date,
        label: format(date, config.dateFormat),
        isWeekend: false,
        isToday: false,
      }));
    
    default:
      return [];
  }
}

/**
 * Calculate pixel position for a date on the timeline
 */
export function getPositionForDate(
  date: Date | string,
  startDate: Date,
  endDate: Date,
  totalWidth: number
): number {
  const d = typeof date === 'string' ? parseISO(date) : date;
  const totalDays = differenceInDays(endDate, startDate);
  if (totalDays === 0) return 0;
  
  const dayOffset = differenceInDays(d, startDate);
  return (dayOffset / totalDays) * totalWidth;
}

/**
 * Calculate pixel width for a date range
 */
export function getWidthForRange(
  start: Date | string,
  end: Date | string,
  startDate: Date,
  endDate: Date,
  totalWidth: number,
  minWidth = 24
): number {
  const s = typeof start === 'string' ? parseISO(start) : start;
  const e = typeof end === 'string' ? parseISO(end) : end;
  
  const days = differenceInDays(e, s);
  const totalDays = differenceInDays(endDate, startDate);
  if (totalDays === 0) return minWidth;
  
  return Math.max((days / totalDays) * totalWidth, minWidth);
}

/**
 * Convert pixel position to date
 */
export function getDateForPosition(
  position: number,
  startDate: Date,
  endDate: Date,
  totalWidth: number
): Date {
  const totalDays = differenceInDays(endDate, startDate);
  const dayOffset = Math.round((position / totalWidth) * totalDays);
  return addDays(startDate, dayOffset);
}

/**
 * Snap a date to the nearest grid unit
 */
export function snapToGrid(
  date: Date,
  snapUnit: 'day' | 'week'
): Date {
  if (snapUnit === 'day') {
    return startOfDay(date);
  }
  return startOfWeek(date);
}

/**
 * Calculate task bar dimensions
 */
export function calculateTaskBarDimensions(
  task: GanttTask,
  startDate: Date,
  endDate: Date,
  totalWidth: number,
  rowHeight: number,
  rowIndex: number,
  headerHeight: number
): { left: number; width: number; top: number; height: number } | null {
  if (!task.estimated_start_date || !task.estimated_end_date) {
    return null;
  }

  const left = getPositionForDate(task.estimated_start_date, startDate, endDate, totalWidth);
  const width = getWidthForRange(
    task.estimated_start_date, 
    task.estimated_end_date, 
    startDate, 
    endDate, 
    totalWidth
  );
  const top = headerHeight + (rowIndex * rowHeight) + (rowHeight - 28) / 2;
  const height = 28;

  return { left, width, top, height };
}

/**
 * Check if a task is a milestone (same start and end date)
 */
export function isMilestone(task: GanttTask): boolean {
  if (!task.estimated_start_date || !task.estimated_end_date) return false;
  return isSameDay(
    parseISO(task.estimated_start_date),
    parseISO(task.estimated_end_date)
  );
}

/**
 * Format date range for display
 */
export function formatDateRange(startDate: string | null, endDate: string | null): string {
  if (!startDate && !endDate) return 'No dates set';
  if (!startDate) return `Until ${format(parseISO(endDate!), 'MMM d, yyyy')}`;
  if (!endDate) return `From ${format(parseISO(startDate), 'MMM d, yyyy')}`;
  
  const start = parseISO(startDate);
  const end = parseISO(endDate);
  
  if (isSameDay(start, end)) {
    return format(start, 'MMM d, yyyy');
  }
  
  return `${format(start, 'MMM d')} - ${format(end, 'MMM d, yyyy')}`;
}

/**
 * Calculate duration in days
 */
export function calculateDuration(startDate: string | null, endDate: string | null): number {
  if (!startDate || !endDate) return 0;
  return Math.max(1, differenceInDays(parseISO(endDate), parseISO(startDate)));
}
