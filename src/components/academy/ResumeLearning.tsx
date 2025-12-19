import React from 'react';
import { ArrowRight, BookOpen, Clock, PlayCircle } from 'lucide-react';
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

interface ResumeLearningProps {
  modules: ModuleInfo[];
  className?: string;
}

export const ResumeLearning: React.FC<ResumeLearningProps> = ({
  modules,
  className,
}) => {
  const navigate = useNavigate();
  const { allProgress, getModuleProgress } = useAllModulesProgress();

  // Find the most recently visited incomplete module
  const getResumeModule = () => {
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
  };

  const resumeData = getResumeModule();

  // Calculate overall stats
  const stats = React.useMemo(() => {
    let started = 0;
    let completed = 0;
    let totalProgress = 0;

    modules.forEach(module => {
      const progress = getModuleProgress(module.id, module.totalSections);
      if (progress.isComplete) {
        completed++;
        started++;
      } else if (progress.isStarted) {
        started++;
      }
      totalProgress += progress.percentage;
    });

    return {
      started,
      completed,
      averageProgress: Math.round(totalProgress / modules.length),
    };
  }, [modules, getModuleProgress]);

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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={cn(
        'bg-gradient-to-r from-primary/10 via-primary/5 to-transparent',
        'border border-primary/20 rounded-2xl p-6',
        className
      )}
      role="region"
      aria-label="Resume learning"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        {/* Resume info */}
        <div className="flex-1">
          <div className="flex items-center gap-2 text-primary mb-2">
            <PlayCircle className="w-5 h-5" />
            <span className="font-medium text-sm">Continue Your Learning</span>
          </div>
          
          {resumeData ? (
            <>
              <h3 className="text-xl font-bold text-foreground mb-1">
                {resumeData.module.title}
              </h3>
              <p className="text-muted-foreground text-sm">
                {resumeData.percentage}% complete — pick up where you left off
              </p>
            </>
          ) : (
            <>
              <h3 className="text-xl font-bold text-foreground mb-1">
                Great job! All modules completed
              </h3>
              <p className="text-muted-foreground text-sm">
                You've completed all started modules. Start a new one!
              </p>
            </>
          )}
        </div>

        {/* Stats */}
        <div className="flex items-center gap-6">
          <div className="text-center">
            <div className="flex items-center gap-1.5 text-muted-foreground mb-1">
              <BookOpen className="w-4 h-4" />
              <span className="text-xs">Started</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{stats.started}</p>
          </div>
          <div className="w-px h-12 bg-border" />
          <div className="text-center">
            <div className="flex items-center gap-1.5 text-muted-foreground mb-1">
              <Clock className="w-4 h-4" />
              <span className="text-xs">Completed</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{stats.completed}</p>
          </div>
        </div>

        {/* Resume button */}
        {resumeData && (
          <Button
            onClick={handleResume}
            size="lg"
            className="gap-2"
            aria-label={`Resume ${resumeData.module.title}`}
          >
            Resume
            <ArrowRight className="w-4 h-4" />
          </Button>
        )}
      </div>
    </motion.div>
  );
};
