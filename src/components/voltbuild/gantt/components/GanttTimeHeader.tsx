import React, { useMemo } from 'react';
import { format, startOfMonth, startOfQuarter, startOfYear, getQuarter } from 'date-fns';
import { cn } from '@/lib/utils';
import { useGantt } from '../context/GanttContext';
import { generateTimeColumns } from '../utils/dateCalculations';

interface GanttTimeHeaderProps {
  startDate: Date;
  endDate: Date;
  totalWidth: number;
}

export function GanttTimeHeader({ startDate, endDate, totalWidth }: GanttTimeHeaderProps) {
  const { state, zoomConfig } = useGantt();
  const { config, zoomLevel } = state;

  // Generate time columns
  const timeColumns = useMemo(() => 
    generateTimeColumns(startDate, endDate, zoomLevel),
    [startDate, endDate, zoomLevel]
  );

  // Generate header groups (months, quarters, years)
  const headerGroups = useMemo(() => {
    const groups: { label: string; width: number; startX: number }[] = [];
    
    if (zoomLevel === 'day' || zoomLevel === 'week') {
      // Group by month
      let currentMonth = '';
      let currentStartX = 0;
      let currentWidth = 0;

      timeColumns.forEach((col, idx) => {
        const monthLabel = format(col.date, 'MMM yyyy');
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

  return (
    <div 
      className="sticky top-0 z-20 bg-background border-b"
      style={{ height: config.headerHeight }}
    >
      {/* Upper header - Month/Year groups */}
      <div className="flex h-1/2 border-b bg-muted/50">
        <div 
          className="flex-shrink-0 sticky left-0 z-30 border-r bg-muted/50 flex items-center px-4"
          style={{ width: config.taskListWidth }}
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
      <div className="flex h-1/2 bg-background">
        <div 
          className="flex-shrink-0 sticky left-0 z-30 border-r bg-background"
          style={{ width: config.taskListWidth }}
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
