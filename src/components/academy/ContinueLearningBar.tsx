import React, { useMemo } from 'react';
import { ArrowRight, PlayCircle } from 'lucide-react';
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

interface ContinueLearningBarProps {
  modules: ModuleInfo[];
  className?: string;
}

export const ContinueLearningBar: React.FC<ContinueLearningBarProps> = ({
  modules,
  className,
}) => {
  const navigate = useNavigate();
  const { allProgress, getModuleProgress } = useAllModulesProgress();

  // Find in-progress modules sorted by last visited
  const inProgressModules = useMemo(() => {
    const modulesWithProgress: { module: ModuleInfo; lastVisited: string | null; percentage: number }[] = [];

    for (const module of modules) {
      const progress = getModuleProgress(module.id, module.totalSections);
      
      if (progress.isStarted && !progress.isComplete) {
        const moduleProgress = allProgress[module.id];
        modulesWithProgress.push({
          module,
          lastVisited: moduleProgress?.lastVisited || null,
          percentage: progress.percentage,
        });
      }
    }

    // Sort by last visited (most recent first)
    return modulesWithProgress.sort((a, b) => {
      if (!a.lastVisited) return 1;
      if (!b.lastVisited) return -1;
      return b.lastVisited.localeCompare(a.lastVisited);
    });
  }, [modules, allProgress, getModuleProgress]);

  // Calculate simple stats
  const stats = useMemo(() => {
    let completed = 0;
    let started = 0;

    modules.forEach(module => {
      const progress = getModuleProgress(module.id, module.totalSections);
      if (progress.isComplete) {
        completed++;
        started++;
      } else if (progress.isStarted) {
        started++;
      }
    });

    return { completed, started, total: modules.length };
  }, [modules, getModuleProgress]);

  // Don't show if no progress
  if (stats.started === 0) {
    return null;
  }

  const currentModule = inProgressModules[0];

  const handleResume = () => {
    if (currentModule) {
      const moduleProgress = allProgress[currentModule.module.id];
      const anchor = moduleProgress?.lastVisited ? `#${moduleProgress.lastVisited}` : '';
      navigate(`${currentModule.module.route}${anchor}`);
    }
  };

  return (
    <section className={cn("py-6 bg-muted/50 border-b border-border", className)}>
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row items-center justify-between gap-4"
        >
          {/* Left side - Resume info */}
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <PlayCircle className="w-5 h-5 text-primary" />
            </div>
            
            {currentModule ? (
              <div>
                <p className="text-sm text-muted-foreground">Continue learning</p>
                <p className="font-semibold text-foreground">
                  {currentModule.module.title}
                  <span className="ml-2 text-sm font-normal text-muted-foreground">
                    ({currentModule.percentage}% complete)
                  </span>
                </p>
              </div>
            ) : (
              <div>
                <p className="text-sm text-muted-foreground">Great progress!</p>
                <p className="font-semibold text-foreground">
                  {stats.completed} of {stats.total} modules completed
                </p>
              </div>
            )}
          </div>

          {/* Right side - Stats and CTA */}
          <div className="flex items-center gap-6">
            <div className="hidden md:flex items-center gap-4 text-sm text-muted-foreground">
              <span>{stats.started} started</span>
              <span>•</span>
              <span>{stats.completed} completed</span>
            </div>

            {currentModule && (
              <Button onClick={handleResume} className="gap-2">
                Resume
                <ArrowRight className="w-4 h-4" />
              </Button>
            )}
          </div>
        </motion.div>
      </div>
    </section>
  );
};
