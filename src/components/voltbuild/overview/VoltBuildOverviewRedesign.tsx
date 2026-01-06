import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, 
  ListTodo, 
  Calendar, 
  Target
} from 'lucide-react';
import { format, differenceInDays } from 'date-fns';
import { KPICard } from './KPICard';
import { PhaseProgressGrid } from './PhaseProgressGrid';
import { ProjectHealthScore } from './ProjectHealthScore';
import { QuickActionsGrid } from './QuickActionsGrid';
import { RecentActivityFeed } from './RecentActivityFeed';
import { VoltBuildProject, VoltBuildPhase, VoltBuildTask } from '../types/voltbuild.types';
import { VoltBuildView } from '../layout/VoltBuildLayout';

interface VoltBuildOverviewRedesignProps {
  project: VoltBuildProject;
  phases: VoltBuildPhase[];
  tasks: VoltBuildTask[];
  onNavigate: (view: VoltBuildView) => void;
  onAddTask: () => void;
  onAddRisk: () => void;
}

export function VoltBuildOverviewRedesign({
  project,
  phases,
  tasks,
  onNavigate,
  onAddTask,
  onAddRisk
}: VoltBuildOverviewRedesignProps) {
  // Calculate metrics
  const metrics = useMemo(() => {
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.status === 'complete').length;
    const inProgressTasks = tasks.filter(t => t.status === 'in_progress').length;
    const blockedTasks = tasks.filter(t => t.status === 'blocked').length;
    const criticalTasks = tasks.filter(t => t.is_critical_path);
    const criticalComplete = criticalTasks.filter(t => t.status === 'complete').length;
    
    const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    
    // Timeline calculations
    const startDate = project.estimated_start_date ? new Date(project.estimated_start_date) : new Date();
    const targetDate = project.estimated_end_date ? new Date(project.estimated_end_date) : null;
    const today = new Date();
    const daysRemaining = targetDate ? differenceInDays(targetDate, today) : null;
    const elapsedDays = differenceInDays(today, startDate);
    
    // Health score calculation
    const healthScore = Math.min(100, Math.max(0,
      progress * 0.4 +
      (blockedTasks === 0 ? 30 : Math.max(0, 30 - blockedTasks * 10)) +
      (criticalTasks.length > 0 ? (criticalComplete / criticalTasks.length) * 30 : 30)
    ));
    
    // Risk counts based on status
    const atRiskCount = blockedTasks;
    const onTrackCount = tasks.filter(t => t.status === 'in_progress' || t.status === 'complete').length;
    const delayedCount = blockedTasks;
    
    return {
      totalTasks,
      completedTasks,
      inProgressTasks,
      blockedTasks,
      progress,
      criticalTasks: criticalTasks.length,
      criticalComplete,
      daysRemaining,
      elapsedDays,
      targetDate,
      healthScore,
      atRiskCount,
      onTrackCount,
      delayedCount
    };
  }, [tasks, project]);

  // Generate mock activities from tasks
  const recentActivities = useMemo(() => {
    const completed = tasks
      .filter(t => t.status === 'complete' && t.updated_at)
      .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
      .slice(0, 5)
      .map(t => ({
        id: t.id,
        type: 'task_completed' as const,
        title: t.name,
        timestamp: new Date(t.updated_at)
      }));
    
    return completed;
  }, [tasks]);

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
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="p-4 sm:p-6 space-y-6"
    >
      {/* Header */}
      <motion.div variants={itemVariants}>
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground">{project.name}</h1>
        <p className="text-muted-foreground mt-1">
          {project.location || 'No location'} • {project.target_mw || '--'}MW {project.cooling_type || 'Standard'}
        </p>
      </motion.div>

      {/* KPI Cards Grid */}
      <motion.div 
        variants={itemVariants}
        className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4"
      >
        <KPICard
          title="Overall Progress"
          value={`${metrics.progress}%`}
          icon={LayoutDashboard}
          progress={metrics.progress}
          variant="default"
          trend={metrics.progress >= 50 ? 'up' : 'neutral'}
          trendValue={`${metrics.elapsedDays}d elapsed`}
          onClick={() => onNavigate('overview')}
        />
        
        <KPICard
          title="Tasks Completed"
          value={`${metrics.completedTasks}/${metrics.totalTasks}`}
          subtitle={`${metrics.inProgressTasks} in progress`}
          icon={ListTodo}
          variant="success"
          onClick={() => onNavigate('tasks')}
        />
        
        <KPICard
          title="Critical Path"
          value={`${metrics.criticalComplete}/${metrics.criticalTasks}`}
          subtitle="milestones complete"
          icon={Target}
          variant={metrics.criticalComplete === metrics.criticalTasks ? 'success' : 'warning'}
          onClick={() => onNavigate('timeline')}
        />
        
        <KPICard
          title="Days Remaining"
          value={metrics.daysRemaining !== null ? metrics.daysRemaining : '--'}
          subtitle={metrics.targetDate ? format(metrics.targetDate, 'MMM d, yyyy') : 'No target set'}
          icon={Calendar}
          variant={metrics.daysRemaining !== null && metrics.daysRemaining < 30 ? 'warning' : 'purple'}
          onClick={() => onNavigate('timeline')}
        />
      </motion.div>

      {/* Quick Actions */}
      <motion.div variants={itemVariants}>
        <QuickActionsGrid
          onAddTask={onAddTask}
          onAddRisk={onAddRisk}
          onExportReport={() => onNavigate('reporting')}
          onOpenAdvisor={() => onNavigate('advisor')}
          onViewTimeline={() => onNavigate('timeline')}
        />
      </motion.div>

      {/* Main Content Grid */}
      <motion.div 
        variants={itemVariants}
        className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6"
      >
        {/* Phase Progress - Takes 2 columns */}
        <div className="lg:col-span-2">
          <PhaseProgressGrid phases={phases} />
        </div>
        
        {/* Project Health */}
        <div>
          <ProjectHealthScore
            score={metrics.healthScore}
            onTrackCount={metrics.onTrackCount}
            atRiskCount={metrics.atRiskCount}
            delayedCount={metrics.delayedCount}
            insight={metrics.blockedTasks > 0 
              ? `${metrics.blockedTasks} blocked task${metrics.blockedTasks > 1 ? 's' : ''} need attention`
              : 'Project is progressing well'
            }
          />
        </div>
      </motion.div>

      {/* Recent Activity */}
      <motion.div variants={itemVariants}>
        <RecentActivityFeed activities={recentActivities} />
      </motion.div>
    </motion.div>
  );
}
