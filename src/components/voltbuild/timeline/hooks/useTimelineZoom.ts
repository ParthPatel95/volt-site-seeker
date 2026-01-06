import { useState, useMemo, useCallback, useEffect } from 'react';
import { ZoomLevel } from '../../types/voltbuild-timeline.types';
import { 
  addDays, 
  addWeeks, 
  addMonths, 
  addQuarters,
  differenceInDays,
  differenceInWeeks,
  differenceInMonths,
  differenceInQuarters,
  startOfDay,
  startOfWeek,
  startOfMonth,
  startOfQuarter,
  format,
  parseISO,
} from 'date-fns';

interface UseTimelineZoomProps {
  startDate: Date;
  endDate: Date;
}

interface TimelineUnit {
  date: Date;
  label: string;
  subLabel?: string;
  isToday: boolean;
  width: number;
}

export function useTimelineZoom({ startDate, endDate }: UseTimelineZoomProps) {
  const [zoomLevel, setZoomLevel] = useState<ZoomLevel>('week');

  // Keyboard shortcuts for zoom
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '+' || e.key === '=') {
        setZoomLevel(prev => {
          if (prev === 'quarter') return 'month';
          if (prev === 'month') return 'week';
          if (prev === 'week') return 'day';
          return prev;
        });
      } else if (e.key === '-') {
        setZoomLevel(prev => {
          if (prev === 'day') return 'week';
          if (prev === 'week') return 'month';
          if (prev === 'month') return 'quarter';
          return prev;
        });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Calculate unit width based on zoom level
  const unitWidth = useMemo(() => {
    switch (zoomLevel) {
      case 'day': return 40;
      case 'week': return 80;
      case 'month': return 120;
      case 'quarter': return 160;
    }
  }, [zoomLevel]);

  // Generate timeline units
  const timelineUnits = useMemo((): TimelineUnit[] => {
    const units: TimelineUnit[] = [];
    const today = startOfDay(new Date());
    
    let current = startDate;
    const adjustedStart = (() => {
      switch (zoomLevel) {
        case 'day': return startOfDay(startDate);
        case 'week': return startOfWeek(startDate, { weekStartsOn: 1 });
        case 'month': return startOfMonth(startDate);
        case 'quarter': return startOfQuarter(startDate);
      }
    })();

    current = adjustedStart;

    const addUnit = (date: Date): Date => {
      switch (zoomLevel) {
        case 'day': return addDays(date, 1);
        case 'week': return addWeeks(date, 1);
        case 'month': return addMonths(date, 1);
        case 'quarter': return addQuarters(date, 1);
      }
    };

    const formatLabel = (date: Date): { label: string; subLabel?: string } => {
      switch (zoomLevel) {
        case 'day': 
          return { 
            label: format(date, 'd'), 
            subLabel: format(date, 'EEE') 
          };
        case 'week': 
          return { 
            label: `W${format(date, 'w')}`, 
            subLabel: format(date, 'MMM d') 
          };
        case 'month': 
          return { 
            label: format(date, 'MMM'), 
            subLabel: format(date, 'yyyy') 
          };
        case 'quarter': 
          return { 
            label: `Q${Math.ceil((date.getMonth() + 1) / 3)}`, 
            subLabel: format(date, 'yyyy') 
          };
      }
    };

    while (current <= endDate) {
      const { label, subLabel } = formatLabel(current);
      units.push({
        date: current,
        label,
        subLabel,
        isToday: differenceInDays(current, today) === 0,
        width: unitWidth,
      });
      current = addUnit(current);
    }

    return units;
  }, [startDate, endDate, zoomLevel, unitWidth]);

  // Calculate total timeline width
  const totalWidth = useMemo(() => {
    return timelineUnits.length * unitWidth;
  }, [timelineUnits, unitWidth]);

  // Calculate position for a date on the timeline
  const getPositionForDate = useCallback((date: Date | string): number => {
    const d = typeof date === 'string' ? parseISO(date) : date;
    const daysDiff = differenceInDays(d, startDate);
    
    switch (zoomLevel) {
      case 'day':
        return daysDiff * unitWidth;
      case 'week':
        return (daysDiff / 7) * unitWidth;
      case 'month':
        return (daysDiff / 30) * unitWidth;
      case 'quarter':
        return (daysDiff / 90) * unitWidth;
    }
  }, [startDate, zoomLevel, unitWidth]);

  // Calculate width for a date range
  const getWidthForRange = useCallback((start: Date | string, end: Date | string): number => {
    const s = typeof start === 'string' ? parseISO(start) : start;
    const e = typeof end === 'string' ? parseISO(end) : end;
    const daysDiff = differenceInDays(e, s);
    
    switch (zoomLevel) {
      case 'day':
        return Math.max(daysDiff * unitWidth, unitWidth);
      case 'week':
        return Math.max((daysDiff / 7) * unitWidth, unitWidth / 2);
      case 'month':
        return Math.max((daysDiff / 30) * unitWidth, unitWidth / 3);
      case 'quarter':
        return Math.max((daysDiff / 90) * unitWidth, unitWidth / 4);
    }
  }, [zoomLevel, unitWidth]);

  // Get today's position
  const todayPosition = useMemo(() => {
    return getPositionForDate(new Date());
  }, [getPositionForDate]);

  return {
    zoomLevel,
    setZoomLevel,
    timelineUnits,
    totalWidth,
    unitWidth,
    getPositionForDate,
    getWidthForRange,
    todayPosition,
  };
}
