import React from 'react';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Diamond, Flag } from 'lucide-react';
import { VoltBuildMilestone } from '../types/voltbuild-timeline.types';
import { format, parseISO } from 'date-fns';

interface TimelineMilestonesProps {
  milestones: VoltBuildMilestone[];
  getPositionForDate: (date: Date | string) => number;
  targetRfsDate?: string | null;
}

export function TimelineMilestones({
  milestones,
  getPositionForDate,
  targetRfsDate,
}: TimelineMilestonesProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-500 fill-green-500';
      case 'missed':
        return 'text-red-500 fill-red-500';
      default:
        return 'text-primary fill-primary';
    }
  };

  return (
    <TooltipProvider>
      {/* Milestones */}
      {milestones.map((milestone) => {
        const position = getPositionForDate(milestone.target_date);
        
        return (
          <Tooltip key={milestone.id}>
            <TooltipTrigger asChild>
              <div
                className="absolute top-0 z-30 cursor-pointer transform -translate-x-1/2"
                style={{ left: position }}
              >
                <Diamond 
                  className={`h-4 w-4 ${getStatusColor(milestone.status)} drop-shadow-sm`}
                />
              </div>
            </TooltipTrigger>
            <TooltipContent side="top">
              <div className="space-y-1">
                <div className="font-medium">{milestone.name}</div>
                <div className="text-xs text-muted-foreground">
                  {format(parseISO(milestone.target_date), 'MMM d, yyyy')}
                </div>
                {milestone.description && (
                  <div className="text-xs">{milestone.description}</div>
                )}
                <div className="text-xs capitalize text-muted-foreground">
                  Status: {milestone.status}
                </div>
              </div>
            </TooltipContent>
          </Tooltip>
        );
      })}

      {/* Target RFS Date */}
      {targetRfsDate && (
        <Tooltip>
          <TooltipTrigger asChild>
            <div
              className="absolute top-0 bottom-0 z-25 cursor-pointer"
              style={{ left: getPositionForDate(targetRfsDate) }}
            >
              <div className="absolute top-0 bottom-0 w-0.5 bg-green-600 opacity-70" />
              <div className="absolute -top-1 transform -translate-x-1/2 flex items-center gap-1 bg-green-600 text-white text-[10px] px-1.5 py-0.5 rounded-sm font-medium whitespace-nowrap">
                <Flag className="h-3 w-3" />
                Target RFS
              </div>
            </div>
          </TooltipTrigger>
          <TooltipContent side="top">
            <div className="space-y-1">
              <div className="font-medium">Target Ready for Service</div>
              <div className="text-xs text-muted-foreground">
                {format(parseISO(targetRfsDate), 'MMMM d, yyyy')}
              </div>
            </div>
          </TooltipContent>
        </Tooltip>
      )}
    </TooltipProvider>
  );
}
