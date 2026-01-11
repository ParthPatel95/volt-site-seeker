import React from 'react';
import { motion } from 'framer-motion';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { format, parseISO, differenceInDays } from 'date-fns';
import { Diamond, Truck, Flag, CheckCircle2, AlertTriangle, Calendar } from 'lucide-react';
import { getPositionForDate } from '../utils/dateCalculations';

export type MilestoneType = 'delivery' | 'target' | 'approval' | 'checkpoint' | 'deadline';
export type MilestoneStatus = 'upcoming' | 'completed' | 'missed' | 'at_risk';

interface MilestoneData {
  id: string;
  name: string;
  date: Date;
  type: MilestoneType;
  status: MilestoneStatus;
  description?: string | null;
  batchNumber?: number;
}

interface GanttMilestoneMarkerProps {
  milestone: MilestoneData;
  timelineStartDate: Date;
  timelineEndDate: Date;
  totalWidth: number;
  totalHeight: number;
  config: {
    taskListWidth: number;
  };
  onClick?: () => void;
}

const MILESTONE_ICONS: Record<MilestoneType, React.ComponentType<{ className?: string }>> = {
  delivery: Truck,
  target: Flag,
  approval: CheckCircle2,
  checkpoint: Calendar,
  deadline: AlertTriangle,
};

const MILESTONE_COLORS: Record<MilestoneType, { fill: string; stroke: string; bg: string }> = {
  delivery: { fill: '#8b5cf6', stroke: '#7c3aed', bg: 'bg-violet-500' },
  target: { fill: '#ef4444', stroke: '#dc2626', bg: 'bg-red-500' },
  approval: { fill: '#22c55e', stroke: '#16a34a', bg: 'bg-green-500' },
  checkpoint: { fill: '#3b82f6', stroke: '#2563eb', bg: 'bg-blue-500' },
  deadline: { fill: '#f97316', stroke: '#ea580c', bg: 'bg-orange-500' },
};

const STATUS_STYLES: Record<MilestoneStatus, string> = {
  upcoming: 'opacity-100',
  completed: 'opacity-80 ring-2 ring-green-400',
  missed: 'opacity-80 ring-2 ring-red-400',
  at_risk: 'opacity-100 ring-2 ring-amber-400 animate-pulse',
};

export function GanttMilestoneMarker({
  milestone,
  timelineStartDate,
  timelineEndDate,
  totalWidth,
  totalHeight,
  config,
  onClick,
}: GanttMilestoneMarkerProps) {
  const position = getPositionForDate(milestone.date, timelineStartDate, timelineEndDate, totalWidth);
  
  // Check if milestone is within visible range
  if (position < 0 || position > totalWidth) {
    return null;
  }

  const color = MILESTONE_COLORS[milestone.type];
  const Icon = MILESTONE_ICONS[milestone.type];
  const daysFromNow = differenceInDays(milestone.date, new Date());

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <motion.div
            className={cn(
              "absolute cursor-pointer z-20 flex flex-col items-center pointer-events-auto",
              STATUS_STYLES[milestone.status]
            )}
            style={{
              left: position + config.taskListWidth + 180 - 12,
              top: 4,
            }}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            onClick={onClick}
            whileHover={{ scale: 1.15 }}
          >
            {/* Diamond marker */}
            <div 
              className={cn(
                "w-6 h-6 flex items-center justify-center rounded-sm rotate-45",
                color.bg
              )}
            >
              <div className="-rotate-45">
                <Icon className="w-3.5 h-3.5 text-white" />
              </div>
            </div>
            
            {/* Batch number badge */}
            {milestone.batchNumber && (
              <Badge 
                variant="secondary" 
                className="mt-1 text-[10px] px-1.5 py-0 h-4 font-semibold"
              >
                B{milestone.batchNumber}
              </Badge>
            )}
            
            {/* Vertical line to chart */}
            <svg 
              className="absolute pointer-events-none"
              style={{ 
                top: milestone.batchNumber ? 44 : 28,
                left: 11,
                width: 2,
                height: totalHeight - (milestone.batchNumber ? 44 : 28),
              }}
            >
              <line
                x1={1}
                y1={0}
                x2={1}
                y2={totalHeight}
                stroke={color.fill}
                strokeWidth={2}
                strokeDasharray="6 4"
                strokeOpacity={0.6}
              />
            </svg>
          </motion.div>
        </TooltipTrigger>
        <TooltipContent side="right" className="max-w-xs">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className={cn("w-5 h-5 rounded flex items-center justify-center", color.bg)}>
                <Icon className="w-3 h-3 text-white" />
              </div>
              <p className="font-semibold">{milestone.name}</p>
            </div>
            
            <div className="text-xs space-y-1">
              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">Date:</span>
                <span>{format(milestone.date, 'MMM d, yyyy')}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">Type:</span>
                <span className="capitalize">{milestone.type}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">Status:</span>
                <Badge 
                  variant={
                    milestone.status === 'completed' ? 'default' :
                    milestone.status === 'missed' ? 'destructive' :
                    milestone.status === 'at_risk' ? 'secondary' : 'outline'
                  }
                  className="text-[10px] px-1.5 py-0 h-4"
                >
                  {milestone.status.replace('_', ' ')}
                </Badge>
              </div>
              {daysFromNow !== 0 && (
                <div className="flex justify-between gap-4">
                  <span className="text-muted-foreground">
                    {daysFromNow > 0 ? 'In:' : 'Overdue:'}
                  </span>
                  <span className={cn(daysFromNow < 0 && 'text-destructive font-medium')}>
                    {Math.abs(daysFromNow)} days
                  </span>
                </div>
              )}
              {milestone.batchNumber && (
                <div className="flex justify-between gap-4">
                  <span className="text-muted-foreground">Batch:</span>
                  <span className="font-medium">Batch {milestone.batchNumber}</span>
                </div>
              )}
            </div>
            
            {milestone.description && (
              <p className="text-xs text-muted-foreground pt-1 border-t">
                {milestone.description}
              </p>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
