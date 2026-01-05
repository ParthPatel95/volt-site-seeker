import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Brain, AlertTriangle, CheckCircle2, Clock, ArrowRight, Zap } from 'lucide-react';
import { VoltBuildProject, VoltBuildPhase, VoltBuildTask } from '../types/voltbuild.types';
import { AdvisorOutput, AdvisorStatus, ADVISOR_STATUS_CONFIG } from '../types/voltbuild-advanced.types';

interface VoltAdvisorTabProps {
  project: VoltBuildProject;
  phases: VoltBuildPhase[];
  tasks: VoltBuildTask[];
}

export function VoltAdvisorTab({ project, phases, tasks }: VoltAdvisorTabProps) {
  // Calculate advisor analysis
  const analysis: AdvisorOutput = useMemo(() => {
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.status === 'complete').length;
    const blockedTasks = tasks.filter(t => t.status === 'blocked');
    const inProgressTasks = tasks.filter(t => t.status === 'in_progress');
    const criticalTasks = tasks.filter(t => t.is_critical_path);
    
    // Health score calculation
    const completionRatio = totalTasks > 0 ? completedTasks / totalTasks : 0;
    const blockerPenalty = blockedTasks.length * 5;
    const healthScore = Math.max(0, Math.min(100, Math.round(completionRatio * 100 - blockerPenalty)));
    
    // Status label
    let statusLabel: AdvisorStatus = 'On Track';
    if (healthScore < 50 || blockedTasks.length > 2) statusLabel = 'Delayed';
    else if (healthScore < 75 || blockedTasks.length > 0) statusLabel = 'At Risk';
    
    // Critical path
    const criticalPath = criticalTasks.slice(0, 5).map(t => {
      const phase = phases.find(p => p.id === t.phase_id);
      return {
        taskId: t.id,
        taskName: t.name,
        phaseName: phase?.name || 'Unknown',
        reason: t.status === 'blocked' ? 'Blocked by dependencies' : 'Critical path task',
        riskDays: t.status === 'not_started' ? 5 : t.status === 'blocked' ? 10 : 0,
        status: t.status,
        dueDate: null,
      };
    });
    
    // Top actions
    const topActions = [];
    if (blockedTasks.length > 0) {
      topActions.push({
        id: '1',
        title: 'Resolve Blocked Tasks',
        why: `${blockedTasks.length} task(s) are currently blocked`,
        impact: 'High' as const,
        effortHours: blockedTasks.length * 2,
        suggestedOwnerRole: 'Project Manager',
      });
    }
    if (inProgressTasks.length === 0 && completedTasks < totalTasks) {
      topActions.push({
        id: '2',
        title: 'Start Next Phase Tasks',
        why: 'No tasks currently in progress',
        impact: 'High' as const,
        effortHours: 4,
        suggestedOwnerRole: 'Team Lead',
      });
    }
    if (criticalTasks.filter(t => t.status === 'not_started').length > 0) {
      topActions.push({
        id: '3',
        title: 'Prioritize Critical Path',
        why: 'Critical path tasks not yet started',
        impact: 'High' as const,
        effortHours: 8,
        suggestedOwnerRole: 'Owner',
      });
    }
    
    // Top risks
    const topRisks = [];
    if (blockedTasks.length > 0) {
      topRisks.push({
        id: '1',
        risk: 'Schedule slippage due to blocked tasks',
        evidence: `${blockedTasks.length} tasks are blocked`,
        mitigation: 'Review dependencies and unblock tasks',
        source: 'task' as const,
      });
    }
    if (project.overall_progress < 25 && phases.length > 0) {
      topRisks.push({
        id: '2',
        risk: 'Project behind schedule',
        evidence: `Only ${project.overall_progress}% complete`,
        mitigation: 'Accelerate resource allocation',
        source: 'schedule' as const,
      });
    }
    
    return { healthScore, statusLabel, criticalPath, topActions, topRisks };
  }, [project, phases, tasks]);

  const statusConfig = ADVISOR_STATUS_CONFIG[analysis.statusLabel];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Brain className="h-5 w-5 text-primary" />
          AI Advisor
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Critical-path analysis and recommendations. All insights are estimates based on current data.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Health Summary */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Project Health</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="relative w-20 h-20">
                <svg className="w-20 h-20 -rotate-90">
                  <circle cx="40" cy="40" r="36" stroke="currentColor" strokeWidth="8" fill="none" className="text-muted/20" />
                  <circle cx="40" cy="40" r="36" stroke="currentColor" strokeWidth="8" fill="none" className="text-primary" strokeDasharray={`${analysis.healthScore * 2.26} 226`} strokeLinecap="round" />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center text-2xl font-bold">{analysis.healthScore}</div>
              </div>
              <div>
                <Badge className={`${statusConfig.bgColor} ${statusConfig.color} border-0`}>{analysis.statusLabel}</Badge>
                <p className="text-sm text-muted-foreground mt-2">{tasks.filter(t => t.status === 'complete').length}/{tasks.length} tasks complete</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Status</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between text-sm"><span>Completed</span><span className="font-medium text-green-600">{tasks.filter(t => t.status === 'complete').length}</span></div>
            <div className="flex justify-between text-sm"><span>In Progress</span><span className="font-medium text-blue-600">{tasks.filter(t => t.status === 'in_progress').length}</span></div>
            <div className="flex justify-between text-sm"><span>Blocked</span><span className="font-medium text-red-600">{tasks.filter(t => t.status === 'blocked').length}</span></div>
            <div className="flex justify-between text-sm"><span>Not Started</span><span className="font-medium">{tasks.filter(t => t.status === 'not_started').length}</span></div>
          </CardContent>
        </Card>

        {/* Progress */}
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Overall Progress</CardTitle></CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{project.overall_progress}%</div>
            <Progress value={project.overall_progress} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-2">Based on phase completion</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recommended Actions */}
        <Card>
          <CardHeader><CardTitle className="text-lg flex items-center gap-2"><Zap className="h-5 w-5 text-amber-500" />Recommended Actions</CardTitle></CardHeader>
          <CardContent>
            {analysis.topActions.length === 0 ? (
              <div className="text-center py-4 text-muted-foreground flex items-center justify-center gap-2"><CheckCircle2 className="h-5 w-5 text-green-500" />No urgent actions needed</div>
            ) : (
              <div className="space-y-3">
                {analysis.topActions.map((action) => (
                  <div key={action.id} className="p-3 rounded-lg border bg-card">
                    <div className="flex items-start justify-between gap-2">
                      <div className="font-medium text-sm">{action.title}</div>
                      <Badge variant={action.impact === 'High' ? 'destructive' : 'secondary'}>{action.impact}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{action.why}</p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                      <span><Clock className="h-3 w-3 inline mr-1" />{action.effortHours}h est.</span>
                      <span>Owner: {action.suggestedOwnerRole}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Risks */}
        <Card>
          <CardHeader><CardTitle className="text-lg flex items-center gap-2"><AlertTriangle className="h-5 w-5 text-red-500" />Top Risks</CardTitle></CardHeader>
          <CardContent>
            {analysis.topRisks.length === 0 ? (
              <div className="text-center py-4 text-muted-foreground flex items-center justify-center gap-2"><CheckCircle2 className="h-5 w-5 text-green-500" />No significant risks identified</div>
            ) : (
              <div className="space-y-3">
                {analysis.topRisks.map((risk) => (
                  <div key={risk.id} className="p-3 rounded-lg border border-red-200 bg-red-50">
                    <div className="font-medium text-sm text-red-700">{risk.risk}</div>
                    <p className="text-xs text-red-600 mt-1">{risk.evidence}</p>
                    <div className="flex items-center gap-1 mt-2 text-xs text-green-700"><ArrowRight className="h-3 w-3" />{risk.mitigation}</div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Critical Path */}
      {analysis.criticalPath.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="text-lg">Critical Path Tasks</CardTitle></CardHeader>
          <CardContent>
            <ScrollArea className="max-h-64">
              <div className="space-y-2">
                {analysis.criticalPath.map((item, i) => (
                  <div key={item.taskId} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50">
                    <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-medium">{i + 1}</div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate">{item.taskName}</div>
                      <div className="text-xs text-muted-foreground">{item.phaseName}</div>
                    </div>
                    <Badge variant="outline" className="text-xs">{item.status}</Badge>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
