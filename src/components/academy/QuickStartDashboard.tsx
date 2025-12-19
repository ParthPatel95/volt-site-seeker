import React, { useMemo } from 'react';
import { ArrowRight, BookOpen, Clock, PlayCircle, Trophy, Flame, Target, CheckCircle2, Sparkles, Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import { useAllModulesProgress } from '@/hooks/useProgressTracking';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';

interface ModuleInfo {
  id: string;
  title: string;
  route: string;
  totalSections: number;
}

interface QuickStartDashboardProps {
  modules: ModuleInfo[];
  className?: string;
}

// Achievement badges
const achievements = [
  { id: 'first-lesson', title: 'First Steps', description: 'Complete your first lesson', icon: Star, threshold: 1 },
  { id: 'five-lessons', title: 'Getting Serious', description: 'Complete 5 lessons', icon: Flame, threshold: 5 },
  { id: 'first-module', title: 'Module Master', description: 'Complete your first module', icon: Trophy, threshold: 'module' },
  { id: 'half-way', title: 'Half Way There', description: 'Complete 50% of all content', icon: Target, threshold: 50 },
];

export const QuickStartDashboard: React.FC<QuickStartDashboardProps> = ({
  modules,
  className,
}) => {
  const navigate = useNavigate();
  const { allProgress, getModuleProgress } = useAllModulesProgress();

  // Find the most recently visited incomplete module
  const resumeData = useMemo(() => {
    let mostRecent: { module: ModuleInfo; lastVisited: string | null; percentage: number } | null = null;

    for (const module of modules) {
      const progress = getModuleProgress(module.id, module.totalSections);
      
      if (progress.isStarted && !progress.isComplete) {
        const moduleProgress = allProgress[module.id];
        if (moduleProgress) {
          if (!mostRecent || (moduleProgress.lastVisited && 
              (!mostRecent.lastVisited || moduleProgress.lastVisited > mostRecent.lastVisited))) {
            mostRecent = {
              module,
              lastVisited: moduleProgress.lastVisited,
              percentage: progress.percentage,
            };
          }
        }
      }
    }

    return mostRecent;
  }, [modules, allProgress, getModuleProgress]);

  // Calculate comprehensive stats
  const stats = useMemo(() => {
    let started = 0;
    let completed = 0;
    let totalLessons = 0;
    let completedLessons = 0;
    let recentModules: { title: string; route: string; percentage: number }[] = [];

    modules.forEach(module => {
      const progress = getModuleProgress(module.id, module.totalSections);
      totalLessons += module.totalSections;
      
      if (progress.isComplete) {
        completed++;
        started++;
        completedLessons += module.totalSections;
      } else if (progress.isStarted) {
        started++;
        completedLessons += Math.round((progress.percentage / 100) * module.totalSections);
        recentModules.push({
          title: module.title,
          route: module.route,
          percentage: progress.percentage,
        });
      }
    });

    // Sort recent by progress percentage (lowest first for "continue")
    recentModules.sort((a, b) => b.percentage - a.percentage);

    const overallProgress = Math.round((completedLessons / totalLessons) * 100);

    return {
      started,
      completed,
      totalModules: modules.length,
      completedLessons,
      totalLessons,
      overallProgress,
      recentModules: recentModules.slice(0, 3),
    };
  }, [modules, getModuleProgress]);

  // Calculate earned achievements
  const earnedAchievements = useMemo(() => {
    return achievements.filter(achievement => {
      if (achievement.threshold === 'module') {
        return stats.completed > 0;
      }
      if (typeof achievement.threshold === 'number') {
        if (achievement.id === 'half-way') {
          return stats.overallProgress >= achievement.threshold;
        }
        return stats.completedLessons >= achievement.threshold;
      }
      return false;
    });
  }, [stats]);

  // Don't show if no progress
  if (stats.started === 0) {
    return null;
  }

  const handleResume = () => {
    if (resumeData) {
      const moduleProgress = allProgress[resumeData.module.id];
      const anchor = moduleProgress?.lastVisited ? `#${moduleProgress.lastVisited}` : '';
      navigate(`${resumeData.module.route}${anchor}`);
    }
  };

  return (
    <section id="quick-start" className="py-12 bg-watt-light">
      <div className="container mx-auto px-4 max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className={cn('space-y-6', className)}
        >
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-watt-bitcoin/10 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-watt-bitcoin" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-watt-navy">Your Learning Dashboard</h2>
                <p className="text-sm text-muted-foreground">Pick up where you left off</p>
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Resume Card */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="lg:col-span-2 bg-gradient-to-br from-watt-navy via-watt-navy/95 to-watt-navy/90 rounded-2xl p-6 text-white relative overflow-hidden"
            >
              {/* Background decoration */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-watt-bitcoin/10 rounded-full blur-3xl" />
              
              <div className="relative z-10">
                <div className="flex items-center gap-2 text-watt-bitcoin mb-3">
                  <PlayCircle className="w-5 h-5" />
                  <span className="font-medium text-sm">Continue Learning</span>
                </div>
                
                {resumeData ? (
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold mb-2">{resumeData.module.title}</h3>
                      <div className="flex items-center gap-4 text-white/70 text-sm mb-4">
                        <span>{resumeData.percentage}% complete</span>
                        <span>•</span>
                        <span>~{Math.ceil((100 - resumeData.percentage) * 0.5)} min remaining</span>
                      </div>
                      {/* Progress bar */}
                      <div className="w-full max-w-sm h-2 bg-white/10 rounded-full overflow-hidden">
                        <motion.div
                          className="h-full bg-gradient-to-r from-watt-bitcoin to-watt-bitcoin/70 rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${resumeData.percentage}%` }}
                          transition={{ duration: 0.8, ease: 'easeOut' }}
                        />
                      </div>
                    </div>
                    <Button
                      onClick={handleResume}
                      size="lg"
                      className="bg-watt-bitcoin hover:bg-watt-bitcoin/90 text-white gap-2"
                    >
                      Resume
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center gap-4">
                    <CheckCircle2 className="w-12 h-12 text-watt-success" />
                    <div>
                      <h3 className="text-2xl font-bold">All caught up!</h3>
                      <p className="text-white/70">You've completed all in-progress modules</p>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Circular Progress */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-2xl p-6 border border-border shadow-sm flex flex-col items-center justify-center"
            >
              <div className="relative w-32 h-32">
                {/* Background circle */}
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="none"
                    className="text-muted/20"
                  />
                  <motion.circle
                    cx="64"
                    cy="64"
                    r="56"
                    stroke="url(#progressGradient)"
                    strokeWidth="8"
                    fill="none"
                    strokeLinecap="round"
                    initial={{ strokeDasharray: "0 352" }}
                    animate={{ strokeDasharray: `${stats.overallProgress * 3.52} 352` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                  />
                  <defs>
                    <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="hsl(var(--watt-bitcoin))" />
                      <stop offset="100%" stopColor="hsl(var(--watt-success))" />
                    </linearGradient>
                  </defs>
                </svg>
                {/* Center text */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-bold text-watt-navy">{stats.overallProgress}%</span>
                  <span className="text-xs text-muted-foreground">Complete</span>
                </div>
              </div>
              <div className="mt-4 text-center">
                <p className="text-sm text-muted-foreground">
                  {stats.completedLessons}/{stats.totalLessons} lessons
                </p>
              </div>
            </motion.div>
          </div>

          {/* Stats & Achievements Row */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Quick Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-2xl p-6 border border-border shadow-sm"
            >
              <h3 className="font-semibold text-watt-navy mb-4 flex items-center gap-2">
                <Target className="w-4 h-4 text-primary" />
                Learning Stats
              </h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-3 rounded-xl bg-blue-50">
                  <BookOpen className="w-5 h-5 text-blue-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-watt-navy">{stats.started}</p>
                  <p className="text-xs text-muted-foreground">Started</p>
                </div>
                <div className="text-center p-3 rounded-xl bg-green-50">
                  <CheckCircle2 className="w-5 h-5 text-green-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-watt-navy">{stats.completed}</p>
                  <p className="text-xs text-muted-foreground">Completed</p>
                </div>
                <div className="text-center p-3 rounded-xl bg-purple-50">
                  <Clock className="w-5 h-5 text-purple-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-watt-navy">{Math.round(stats.completedLessons * 3)}</p>
                  <p className="text-xs text-muted-foreground">Min Spent</p>
                </div>
              </div>
            </motion.div>

            {/* Achievements */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white rounded-2xl p-6 border border-border shadow-sm"
            >
              <h3 className="font-semibold text-watt-navy mb-4 flex items-center gap-2">
                <Trophy className="w-4 h-4 text-watt-bitcoin" />
                Achievements
              </h3>
              <div className="flex gap-3 flex-wrap">
                {achievements.map((achievement, index) => {
                  const isEarned = earnedAchievements.some(e => e.id === achievement.id);
                  const Icon = achievement.icon;
                  return (
                    <motion.div
                      key={achievement.id}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.5 + index * 0.1 }}
                      className={cn(
                        'group relative w-14 h-14 rounded-xl flex items-center justify-center transition-all',
                        isEarned 
                          ? 'bg-gradient-to-br from-watt-bitcoin/10 to-watt-bitcoin/5 border-2 border-watt-bitcoin/30 cursor-pointer hover:scale-110'
                          : 'bg-muted/50 border border-border opacity-40'
                      )}
                      title={`${achievement.title}: ${achievement.description}`}
                    >
                      <Icon className={cn(
                        'w-6 h-6',
                        isEarned ? 'text-watt-bitcoin' : 'text-muted-foreground'
                      )} />
                      {/* Tooltip */}
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-watt-navy text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                        {achievement.title}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
              <p className="text-xs text-muted-foreground mt-3">
                {earnedAchievements.length}/{achievements.length} unlocked
              </p>
            </motion.div>
          </div>

          {/* Recently Viewed */}
          {stats.recentModules.length > 1 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-white rounded-2xl p-6 border border-border shadow-sm"
            >
              <h3 className="font-semibold text-watt-navy mb-4">Recently Viewed</h3>
              <div className="grid sm:grid-cols-3 gap-3">
                {stats.recentModules.map((module, index) => (
                  <button
                    key={module.route}
                    onClick={() => navigate(module.route)}
                    className="flex items-center gap-3 p-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors text-left group"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-watt-navy truncate group-hover:text-primary transition-colors">
                        {module.title}
                      </p>
                      <p className="text-xs text-muted-foreground">{module.percentage}% complete</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </section>
  );
};
