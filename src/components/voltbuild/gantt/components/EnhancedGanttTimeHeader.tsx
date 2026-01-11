import React, { useMemo } from 'react';
import { format, differenceInWeeks, startOfWeek } from 'date-fns';
import { cn } from '@/lib/utils';
import { useGantt } from '../context/GanttContext';
import { generateTimeColumns } from '../utils/dateCalculations';

interface EnhancedGanttTimeHeaderProps {
  startDate: Date;
  endDate: Date;
  totalWidth: number;
  projectStartDate?: Date;
}

export function EnhancedGanttTimeHeader({ 
  startDate, 
  endDate, 
  totalWidth,
  projectStartDate 
}: EnhancedGanttTimeHeaderProps) {
  const { state, zoomConfig } = useGantt();
  const { config, zoomLevel } = state;

  // Generate time columns
  const timeColumns = useMemo(() => 
    generateTimeColumns(startDate, endDate, zoomLevel),
    [startDate, endDate, zoomLevel]
  );

  // Calculate week numbers relative to project start
  const weekNumbers = useMemo(() => {
    if (!projectStartDate) return [];
    
    return timeColumns.map(col => {
      const weekNum = differenceInWeeks(col.date, projectStartDate) + 1;
      return weekNum > 0 ? weekNum : null;
    });
  }, [timeColumns, projectStartDate]);

  // Generate header groups (months, quarters, years)
  const headerGroups = useMemo(() => {
    const groups: { label: string; width: number; startX: number }[] = [];
    
    if (zoomLevel === 'day' || zoomLevel === 'week') {
      // Group by month
      let currentMonth = '';
      let currentStartX = 0;
      let currentWidth = 0;

      timeColumns.forEach((col, idx) => {
        const monthLabel = format(col.date, 'MMMM yyyy');
        if (monthLabel !== currentMonth) {
          if (currentMonth) {
            groups.push({ label: currentMonth, width: currentWidth, startX: currentStartX });
          }
          currentMonth = monthLabel;
          currentStartX = idx * zoomConfig.columnWidth;
          currentWidth = zoomConfig.columnWidth;
        } else {
          currentWidth += zoomConfig.columnWidth;
        }
      });

      if (currentMonth) {
        groups.push({ label: currentMonth, width: currentWidth, startX: currentStartX });
      }
    } else if (zoomLevel === 'month') {
      // Group by year
      let currentYear = '';
      let currentStartX = 0;
      let currentWidth = 0;

      timeColumns.forEach((col, idx) => {
        const yearLabel = format(col.date, 'yyyy');
        if (yearLabel !== currentYear) {
          if (currentYear) {
            groups.push({ label: currentYear, width: currentWidth, startX: currentStartX });
          }
          currentYear = yearLabel;
          currentStartX = idx * zoomConfig.columnWidth;
          currentWidth = zoomConfig.columnWidth;
        } else {
          currentWidth += zoomConfig.columnWidth;
        }
      });

      if (currentYear) {
        groups.push({ label: currentYear, width: currentWidth, startX: currentStartX });
      }
    } else {
      // Quarter view - group by year
      let currentYear = '';
      let currentStartX = 0;
      let currentWidth = 0;

      timeColumns.forEach((col, idx) => {
        const yearLabel = format(col.date, 'yyyy');
        if (yearLabel !== currentYear) {
          if (currentYear) {
            groups.push({ label: currentYear, width: currentWidth, startX: currentStartX });
          }
          currentYear = yearLabel;
          currentStartX = idx * zoomConfig.columnWidth;
          currentWidth = zoomConfig.columnWidth;
        } else {
          currentWidth += zoomConfig.columnWidth;
        }
      });

      if (currentYear) {
        groups.push({ label: currentYear, width: currentWidth, startX: currentStartX });
      }
    }

    return groups;
  }, [timeColumns, zoomLevel, zoomConfig.columnWidth]);

  // Generate week groupings for week number display
  const weekGroups = useMemo(() => {
    if (!projectStartDate || zoomLevel !== 'day') return [];
    
    const groups: { weekNum: number; width: number; startX: number }[] = [];
    let currentWeek = -1;
    let currentStartX = 0;
    let currentWidth = 0;

    weekNumbers.forEach((weekNum, idx) => {
      if (weekNum !== currentWeek) {
        if (currentWeek > 0) {
          groups.push({ weekNum: currentWeek, width: currentWidth, startX: currentStartX });
        }
        currentWeek = weekNum ?? -1;
        currentStartX = idx * zoomConfig.columnWidth;
        currentWidth = zoomConfig.columnWidth;
      } else {
        currentWidth += zoomConfig.columnWidth;
      }
    });

    if (currentWeek > 0) {
      groups.push({ weekNum: currentWeek, width: currentWidth, startX: currentStartX });
    }

    return groups;
  }, [weekNumbers, projectStartDate, zoomLevel, zoomConfig.columnWidth]);

  const headerHeight = projectStartDate && zoomLevel === 'day' ? config.headerHeight + 20 : config.headerHeight;
  const taskListWidth = config.taskListWidth + 180; // Match enhanced task list

  return (
    <div 
      className="sticky top-0 z-20 bg-background border-b"
      style={{ height: headerHeight }}
    >
      {/* Week Numbers Row (if applicable) */}
      {projectStartDate && zoomLevel === 'day' && (
        <div className="flex h-5 border-b bg-primary/5">
          <div 
            className="flex-shrink-0 sticky left-0 z-30 border-r bg-primary/5 flex items-center px-4"
            style={{ width: taskListWidth }}
          >
            <span className="text-[10px] font-medium text-primary">Week #</span>
          </div>
          <div className="relative flex" style={{ width: totalWidth }}>
            {weekGroups.map((group, idx) => (
              <div
                key={idx}
                className="flex-shrink-0 flex items-center justify-center border-r text-[10px] font-semibold text-primary bg-primary/5"
                style={{ 
                  width: group.width,
                  position: 'absolute',
                  left: group.startX,
                }}
              >
                W{group.weekNum}
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Upper header - Month/Year groups */}
      <div className="flex h-1/2 border-b bg-muted/50" style={{ height: config.headerHeight / 2 }}>
        <div 
          className="flex-shrink-0 sticky left-0 z-30 border-r bg-muted/50 flex items-center px-4"
          style={{ width: taskListWidth }}
        >
          <span className="text-sm font-medium text-muted-foreground">Phase / Task</span>
        </div>
        <div className="relative flex" style={{ width: totalWidth }}>
          {headerGroups.map((group, idx) => (
            <div
              key={idx}
              className="flex-shrink-0 flex items-center justify-center border-r text-xs font-medium text-muted-foreground"
              style={{ 
                width: group.width,
                position: 'absolute',
                left: group.startX,
              }}
            >
              {group.label}
            </div>
          ))}
        </div>
      </div>

      {/* Lower header - Individual time units */}
      <div className="flex bg-background" style={{ height: config.headerHeight / 2 }}>
        <div 
          className="flex-shrink-0 sticky left-0 z-30 border-r bg-background"
          style={{ width: taskListWidth }}
        />
        <div className="flex">
          {timeColumns.map((col, idx) => (
            <div
              key={idx}
              className={cn(
                "flex-shrink-0 flex items-center justify-center border-r text-xs",
                col.isWeekend && config.showWeekends && "bg-muted/30",
                col.isToday && "bg-primary/10 font-medium text-primary"
              )}
              style={{ width: zoomConfig.columnWidth }}
            >
              {col.label}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}