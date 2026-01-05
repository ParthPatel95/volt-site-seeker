import React from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Plus, CheckCircle2, Clock, AlertCircle, Circle } from 'lucide-react';
import { VoltBuildPhase, VoltBuildTask, VoltBuildRisk, PHASE_STATUS_CONFIG } from './types/voltbuild.types';
import { VoltBuildTaskItem } from './VoltBuildTaskItem';
import { cn } from '@/lib/utils';

interface VoltBuildPhaseListProps {
  phases: VoltBuildPhase[];
  tasks: Record<string, VoltBuildTask[]>;
  risks: VoltBuildRisk[];
  selectedTaskId: string | null;
  onTaskSelect: (taskId: string) => void;
  onTaskStatusChange: (taskId: string, status: VoltBuildTask['status']) => void;
  onAddTask: (phaseId: string) => void;
  expandedPhases: string[];
  onExpandedChange: (phases: string[]) => void;
}

const StatusIcon = ({ status }: { status: VoltBuildPhase['status'] }) => {
  switch (status) {
    case 'complete':
      return <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400" />;
    case 'in_progress':
      return <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400" />;
    case 'blocked':
      return <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400" />;
    default:
      return <Circle className="w-4 h-4 text-muted-foreground" />;
  }
};

export function VoltBuildPhaseList({
  phases,
  tasks,
  risks,
  selectedTaskId,
  onTaskSelect,
  onTaskStatusChange,
  onAddTask,
  expandedPhases,
  onExpandedChange,
}: VoltBuildPhaseListProps) {
  const getPhaseRisks = (phaseId: string) => {
    return risks.filter(r => r.phase_id === phaseId && r.status === 'open');
  };

  const getPhaseTaskStats = (phaseId: string) => {
    const phaseTasks = tasks[phaseId] || [];
    const total = phaseTasks.length;
    const completed = phaseTasks.filter(t => t.status === 'complete').length;
    const blocked = phaseTasks.filter(t => t.status === 'blocked').length;
    return { total, completed, blocked };
  };

  return (
    <div className="space-y-2">
      <Accordion
        type="multiple"
        value={expandedPhases}
        onValueChange={onExpandedChange}
        className="space-y-2"
      >
        {phases.map((phase) => {
          const phaseRisks = getPhaseRisks(phase.id);
          const { total, completed, blocked } = getPhaseTaskStats(phase.id);
          const phaseTasks = tasks[phase.id] || [];
          const statusConfig = PHASE_STATUS_CONFIG[phase.status];

          return (
            <AccordionItem
              key={phase.id}
              value={phase.id}
              className="border rounded-lg bg-card"
            >
              <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-muted/50 rounded-t-lg [&[data-state=open]]:rounded-b-none">
                <div className="flex items-center justify-between w-full pr-2">
                  <div className="flex items-center gap-3">
                    <StatusIcon status={phase.status} />
                    <div className="text-left">
                      <div className="font-medium text-foreground">
                        {phase.name}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {completed}/{total} tasks complete
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {phaseRisks.length > 0 && (
                      <Badge
                        variant="outline"
                        className="gap-1 text-yellow-700 border-yellow-300 bg-yellow-50 dark:text-yellow-400 dark:bg-yellow-500/10 dark:border-yellow-500/30"
                      >
                        <AlertTriangle className="w-3 h-3" />
                        {phaseRisks.length}
                      </Badge>
                    )}

                    {blocked > 0 && (
                      <Badge
                        variant="outline"
                        className="text-red-700 border-red-300 bg-red-50 dark:text-red-400 dark:bg-red-500/10 dark:border-red-500/30"
                      >
                        {blocked} blocked
                      </Badge>
                    )}

                    <div className="hidden w-24 sm:block">
                      <Progress value={phase.progress} className="h-2" />
                    </div>

                    <span className={cn('text-sm font-medium', statusConfig.color)}>
                      {Math.round(phase.progress)}%
                    </span>
                  </div>
                </div>
              </AccordionTrigger>

              <AccordionContent className="px-4 pb-4">
                <div className="pt-2 space-y-2">
                  {phaseTasks.map((task) => (
                    <VoltBuildTaskItem
                      key={task.id}
                      task={task}
                      isSelected={selectedTaskId === task.id}
                      onClick={() => onTaskSelect(task.id)}
                      onStatusChange={(status) => onTaskStatusChange(task.id, status)}
                    />
                  ))}

                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full mt-2 border border-dashed text-muted-foreground hover:text-foreground border-border"
                    onClick={(e) => {
                      e.stopPropagation();
                      onAddTask(phase.id);
                    }}
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Add Task
                  </Button>
                </div>
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>
    </div>
  );
}
