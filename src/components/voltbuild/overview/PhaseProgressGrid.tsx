import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';
import { VoltBuildPhase } from '../types/voltbuild.types';

interface PhaseProgressGridProps {
  phases: VoltBuildPhase[];
  onPhaseClick?: (phase: VoltBuildPhase) => void;
}

const statusColors = {
  'not_started': { ring: 'stroke-muted-foreground/30', fill: 'text-muted-foreground' },
  'in_progress': { ring: 'stroke-blue-500', fill: 'text-blue-500' },
  'complete': { ring: 'stroke-emerald-500', fill: 'text-emerald-500' },
  'blocked': { ring: 'stroke-red-500', fill: 'text-red-500' },
};

function CircularProgress({ progress, status, size = 48 }: { progress: number; status: string; size?: number }) {
  const strokeWidth = 4;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;
  const colors = statusColors[status as keyof typeof statusColors] || statusColors.not_started;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          className="stroke-muted/30"
        />
        {/* Progress circle */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          className={colors.ring}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          style={{
            strokeDasharray: circumference,
          }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className={cn("text-xs font-bold", colors.fill)}>
          {Math.round(progress)}%
        </span>
      </div>
    </div>
  );
}

export function PhaseProgressGrid({ phases, onPhaseClick }: PhaseProgressGridProps) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <Card className="p-4 sm:p-6">
      <h3 className="text-sm font-semibold text-foreground mb-4">Phase Progress</h3>
      
      {phases.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <p className="text-sm">No phases defined yet</p>
        </div>
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-3"
        >
          {phases.map((phase) => {
          const taskCount = phase.tasks?.length || 0;
          
          return (
            <motion.div
              key={phase.id}
              variants={itemVariants}
              onClick={() => onPhaseClick?.(phase)}
              className={cn(
                "flex items-center gap-4 p-3 rounded-lg",
                "bg-muted/30 hover:bg-muted/50 transition-colors",
                onPhaseClick && "cursor-pointer"
              )}
            >
              <CircularProgress 
                progress={phase.progress} 
                status={phase.status} 
              />
              
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {phase.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {taskCount} tasks
                </p>
              </div>
              
              <div className={cn(
                "px-2 py-1 rounded-full text-xs font-medium",
                phase.status === 'complete' && "bg-emerald-500/10 text-emerald-500",
                phase.status === 'in_progress' && "bg-blue-500/10 text-blue-500",
                phase.status === 'blocked' && "bg-red-500/10 text-red-500",
                phase.status === 'not_started' && "bg-muted text-muted-foreground"
              )}>
                {phase.status.replace('_', ' ')}
              </div>
            </motion.div>
            );
          })}
        </motion.div>
      )}
    </Card>
  );
}
