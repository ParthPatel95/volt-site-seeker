import React, { useMemo } from 'react';
import { useGantt } from '../context/GanttContext';
import { generateTimeColumns, getPositionForDate } from '../utils/dateCalculations';

interface TargetMilestone {
  id: string;
  name: string;
  target_date: string;
  color: string;
  milestone_type: string;
}

interface EnhancedGanttGridProps {
  startDate: Date;
  endDate: Date;
  totalWidth: number;
  totalHeight: number;
  targetMilestones?: TargetMilestone[];
}

export function EnhancedGanttGrid({ 
  startDate, 
  endDate, 
  totalWidth, 
  totalHeight,
  targetMilestones = [] 
}: EnhancedGanttGridProps) {
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

  // Target milestone positions
  const milestonePositions = useMemo(() => {
    return targetMilestones.map(milestone => {
      const date = new Date(milestone.target_date);
      if (date < startDate || date > endDate) return null;
      return {
        ...milestone,
        position: getPositionForDate(date, startDate, endDate, totalWidth),
      };
    }).filter((m): m is NonNullable<typeof m> => m !== null);
  }, [targetMilestones, startDate, endDate, totalWidth]);

  const taskListWidth = config.taskListWidth + 180; // Match enhanced task list

  return (
    <div 
      className="absolute inset-0 pointer-events-none"
      style={{ 
        left: taskListWidth,
        width: totalWidth,
        height: totalHeight,
      }}
    >
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

        {/* Target milestone lines */}
        {milestonePositions.map(milestone => (
          <g key={`milestone-${milestone.id}`}>
            {/* Milestone line */}
            <line
              x1={milestone.position}
              y1={0}
              x2={milestone.position}
              y2={totalHeight}
              stroke={milestone.color}
              strokeWidth={2}
              strokeDasharray="8 4"
            />
            {/* Milestone marker at top */}
            <rect
              x={milestone.position - 40}
              y={0}
              width={80}
              height={20}
              rx={4}
              fill={milestone.color}
            />
            <text
              x={milestone.position}
              y={14}
              textAnchor="middle"
              fill="white"
              fontSize={10}
              fontWeight={600}
            >
              {milestone.name.length > 12 ? milestone.name.substring(0, 12) + '...' : milestone.name}
            </text>
            {/* Milestone type badge */}
            <rect
              x={milestone.position - 30}
              y={22}
              width={60}
              height={14}
              rx={3}
              fill={milestone.color}
              fillOpacity={0.2}
            />
            <text
              x={milestone.position}
              y={32}
              textAnchor="middle"
              fill={milestone.color}
              fontSize={8}
              fontWeight={500}
            >
              {milestone.milestone_type.toUpperCase()}
            </text>
          </g>
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
              x={todayPosition - 25}
              y={0}
              width={50}
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
              fontWeight={600}
            >
              TODAY
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