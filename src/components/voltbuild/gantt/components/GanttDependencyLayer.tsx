import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useGantt } from '../context/GanttContext';
import { calculateDependencyPaths } from '../utils/dependencyRouting';

interface GanttDependencyLayerProps {
  startDate: Date;
  endDate: Date;
  totalWidth: number;
  totalHeight: number;
  onDependencyClick?: (dependencyId: string) => void;
}

export function GanttDependencyLayer({
  startDate,
  endDate,
  totalWidth,
  totalHeight,
  onDependencyClick,
}: GanttDependencyLayerProps) {
  const { state, taskPositions, criticalPathTasks } = useGantt();
  const { tasks, dependencies, config } = state;

  // Calculate dependency paths
  const dependencyPaths = useMemo(() => {
    if (!config.showDependencies || dependencies.length === 0) {
      return [];
    }

    return calculateDependencyPaths({
      tasks,
      dependencies,
      taskPositions,
      startDate,
      endDate,
      totalWidth,
      rowHeight: config.rowHeight,
      headerHeight: config.headerHeight,
      taskListWidth: config.taskListWidth,
      criticalPathTasks,
    });
  }, [
    config.showDependencies,
    config.rowHeight,
    config.headerHeight,
    config.taskListWidth,
    dependencies,
    tasks,
    taskPositions,
    startDate,
    endDate,
    totalWidth,
    criticalPathTasks,
  ]);

  if (!config.showDependencies || dependencyPaths.length === 0) {
    return null;
  }

  return (
    <svg
      className="absolute inset-0 pointer-events-none overflow-visible"
      style={{ 
        width: totalWidth + config.taskListWidth,
        height: totalHeight,
        zIndex: 5,
      }}
    >
      {/* Arrowhead marker definitions */}
      <defs>
        <marker
          id="arrowhead-normal"
          markerWidth="10"
          markerHeight="7"
          refX="9"
          refY="3.5"
          orient="auto"
          markerUnits="strokeWidth"
        >
          <polygon
            points="0 0, 10 3.5, 0 7"
            fill="hsl(var(--primary))"
          />
        </marker>
        <marker
          id="arrowhead-critical"
          markerWidth="10"
          markerHeight="7"
          refX="9"
          refY="3.5"
          orient="auto"
          markerUnits="strokeWidth"
        >
          <polygon
            points="0 0, 10 3.5, 0 7"
            fill="hsl(25, 95%, 53%)"
          />
        </marker>
        <marker
          id="arrowhead-hover"
          markerWidth="12"
          markerHeight="8"
          refX="10"
          refY="4"
          orient="auto"
          markerUnits="strokeWidth"
        >
          <polygon
            points="0 0, 12 4, 0 8"
            fill="hsl(var(--primary))"
          />
        </marker>
      </defs>

      {/* Dependency paths */}
      {dependencyPaths.map((dep) => (
        <motion.g 
          key={dep.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          {/* Shadow/glow for critical path */}
          {dep.isCritical && config.showCriticalPath && (
            <motion.path
              d={dep.path}
              fill="none"
              stroke="hsl(25, 95%, 53%)"
              strokeWidth={6}
              strokeOpacity={0.2}
              className="blur-sm"
            />
          )}
          
          {/* Main path */}
          <motion.path
            d={dep.path}
            fill="none"
            stroke={dep.isCritical && config.showCriticalPath 
              ? "hsl(25, 95%, 53%)" 
              : "hsl(var(--primary))"
            }
            strokeWidth={dep.isCritical && config.showCriticalPath ? 2.5 : 2}
            strokeLinecap="round"
            markerEnd={
              dep.isCritical && config.showCriticalPath 
                ? "url(#arrowhead-critical)" 
                : "url(#arrowhead-normal)"
            }
            className={cn(
              "pointer-events-auto cursor-pointer transition-all",
              "hover:stroke-[3]"
            )}
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            onClick={() => onDependencyClick?.(dep.id)}
          />

          {/* Lag indicator (if lag > 0) */}
          {dep.lagDays > 0 && (
            <g className="pointer-events-none">
              {/* Calculate midpoint of path for lag indicator */}
              <text
                x="0"
                y="0"
                className="text-[10px] fill-muted-foreground"
              >
                <textPath
                  href={`#path-${dep.id}`}
                  startOffset="50%"
                  textAnchor="middle"
                >
                  +{dep.lagDays}d
                </textPath>
              </text>
            </g>
          )}
        </motion.g>
      ))}

      {/* Hidden paths for text positioning */}
      {dependencyPaths
        .filter(dep => dep.lagDays > 0)
        .map((dep) => (
          <path
            key={`path-${dep.id}`}
            id={`path-${dep.id}`}
            d={dep.path}
            fill="none"
            stroke="none"
          />
        ))
      }
    </svg>
  );
}
