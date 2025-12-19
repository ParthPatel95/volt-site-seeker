import React from 'react';
import { Award, BookOpen, CheckCircle2, Clock, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAllModulesProgress } from '@/hooks/useProgressTracking';
import { motion } from 'framer-motion';

interface ModuleInfo {
  id: string;
  title: string;
  totalSections: number;
}

interface LearningStatsProps {
  modules: ModuleInfo[];
  className?: string;
}

export const LearningStats: React.FC<LearningStatsProps> = ({
  modules,
  className,
}) => {
  const { getModuleProgress } = useAllModulesProgress();

  const stats = React.useMemo(() => {
    let totalSections = 0;
    let completedSections = 0;
    let modulesStarted = 0;
    let modulesCompleted = 0;

    modules.forEach(module => {
      const progress = getModuleProgress(module.id, module.totalSections);
      totalSections += module.totalSections;
      
      if (progress.isComplete) {
        modulesCompleted++;
        modulesStarted++;
        completedSections += module.totalSections;
      } else if (progress.isStarted) {
        modulesStarted++;
        completedSections += Math.round((progress.percentage / 100) * module.totalSections);
      }
    });

    const overallProgress = totalSections > 0 
      ? Math.round((completedSections / totalSections) * 100) 
      : 0;

    // Estimate time: ~3 min per section completed
    const estimatedMinutes = completedSections * 3;
    const timeSpent = estimatedMinutes < 60 
      ? `${estimatedMinutes}m` 
      : `${Math.round(estimatedMinutes / 60)}h ${estimatedMinutes % 60}m`;

    return {
      totalSections,
      completedSections,
      modulesStarted,
      modulesCompleted,
      totalModules: modules.length,
      overallProgress,
      timeSpent,
    };
  }, [modules, getModuleProgress]);

  // Don't show if no progress
  if (stats.modulesStarted === 0) {
    return null;
  }

  const statItems = [
    {
      icon: BookOpen,
      label: 'Lessons Completed',
      value: `${stats.completedSections}/${stats.totalSections}`,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
    },
    {
      icon: CheckCircle2,
      label: 'Modules Completed',
      value: `${stats.modulesCompleted}/${stats.totalModules}`,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
    },
    {
      icon: Clock,
      label: 'Time Learning',
      value: stats.timeSpent,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
    },
    {
      icon: TrendingUp,
      label: 'Overall Progress',
      value: `${stats.overallProgress}%`,
      color: 'text-amber-500',
      bgColor: 'bg-amber-500/10',
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
      className={cn(
        'bg-background border border-border rounded-2xl p-6',
        className
      )}
      role="region"
      aria-label="Your learning statistics"
    >
      <div className="flex items-center gap-2 mb-6">
        <Award className="w-5 h-5 text-primary" />
        <h3 className="font-semibold text-foreground">Your Learning Journey</h3>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statItems.map((item, index) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className="text-center"
          >
            <div className={cn(
              'w-12 h-12 rounded-xl mx-auto mb-3 flex items-center justify-center',
              item.bgColor
            )}>
              <item.icon className={cn('w-6 h-6', item.color)} />
            </div>
            <p className="text-2xl font-bold text-foreground mb-1">{item.value}</p>
            <p className="text-xs text-muted-foreground">{item.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Progress bar */}
      <div className="mt-6 pt-6 border-t border-border">
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="text-muted-foreground">Overall Progress</span>
          <span className="font-medium text-foreground">{stats.overallProgress}%</span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-primary to-primary/70"
            initial={{ width: 0 }}
            animate={{ width: `${stats.overallProgress}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          />
        </div>
      </div>
    </motion.div>
  );
};
