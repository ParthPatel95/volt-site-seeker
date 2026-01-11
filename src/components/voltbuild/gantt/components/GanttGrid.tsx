import React, { useMemo } from 'react';
import { cn } from '@/lib/utils';
import { useGantt } from '../context/GanttContext';
import { generateTimeColumns, getPositionForDate } from '../utils/dateCalculations';

interface GanttGridProps {
  startDate: Date;
  endDate: Date;
  totalWidth: number;
  totalHeight: number;
}

export function GanttGrid({ startDate, endDate, totalWidth, totalHeight }: GanttGridProps) {
  const { state, zoomConfig } = useGantt();
  const { config, zoomLevel } = state;

  // Generate time columns for grid lines
  const timeColumns = useMemo(() => 
    generateTimeColumns(startDate, endDate, zoomLevel),
    [startDate, endDate, zoomLevel]
  );

  // Today line position
  const todayPosition = useMemo(() => {
    const today = new Date();
    if (today < startDate || today > endDate) return null;
    return getPositionForDate(today, startDate, endDate, totalWidth);
  }, [startDate, endDate, totalWidth]);

  return (
    <div 
      className="absolute inset-0 pointer-events-none"
      style={{ 
        left: config.taskListWidth,
        width: totalWidth,
        height: totalHeight,
      }}
    >
      {/* Vertical grid lines */}
      <svg 
        className="absolute inset-0"
        width={totalWidth}
        height={totalHeight}
      >
        {/* Weekend backgrounds */}
        {config.showWeekends && zoomLevel === 'day' && timeColumns.map((col, idx) => 
          col.isWeekend && (
            <rect
              key={`weekend-${idx}`}
              x={idx * zoomConfig.columnWidth}
              y={0}
              width={zoomConfig.columnWidth}
              height={totalHeight}
              fill="hsl(var(--muted))"
              fillOpacity={0.3}
            />
          )
        )}

        {/* Grid lines */}
        {timeColumns.map((col, idx) => (
          <line
            key={`grid-${idx}`}
            x1={idx * zoomConfig.columnWidth}
            y1={0}
            x2={idx * zoomConfig.columnWidth}
            y2={totalHeight}
            stroke="hsl(var(--border))"
            strokeWidth={1}
            strokeOpacity={0.5}
          />
        ))}

        {/* Today line */}
        {config.showTodayLine && todayPosition !== null && (
          <>
            <line
              x1={todayPosition}
              y1={0}
              x2={todayPosition}
              y2={totalHeight}
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              strokeDasharray="4 2"
            />
            {/* Today marker at top */}
            <rect
              x={todayPosition - 20}
              y={0}
              width={40}
              height={18}
              rx={4}
              fill="hsl(var(--primary))"
            />
            <text
              x={todayPosition}
              y={13}
              textAnchor="middle"
              fill="hsl(var(--primary-foreground))"
              fontSize={10}
              fontWeight={500}
            >
              Today
            </text>
          </>
        )}
      </svg>

      {/* Horizontal row lines */}
      <div className="absolute inset-0">
        {Array.from({ length: Math.ceil(totalHeight / config.rowHeight) }).map((_, idx) => (
          <div
            key={`row-${idx}`}
            className="absolute w-full border-b border-border/50"
            style={{ top: (idx + 1) * config.rowHeight }}
          />
        ))}
      </div>
    </div>
  );
}
