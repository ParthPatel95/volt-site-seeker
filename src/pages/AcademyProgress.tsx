import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { LandingNavigation } from '@/components/landing/LandingNavigation';
import { LandingFooter } from '@/components/landing/LandingFooter';
import { useAcademyAuth } from '@/contexts/AcademyAuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { CompletionCertificate } from '@/components/academy/CompletionCertificate';
import { Card, CardContent } from '@/components/ui/card';
import { COURSE_THUMBNAILS } from '@/assets/thumbnails';
import {
  BookOpen,
  CheckCircle2,
  Clock,
  Trophy,
  ArrowRight,
  GraduationCap,
  BarChart3,
  Calendar,
  Award,
  Play,
  Flame,
  Target,
  TrendingUp,
  ChevronRight,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { format, formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import {
  ACADEMY_CURRICULUM,
  LEARNING_PHASES,
  DIFFICULTY_BADGES,
  getModulesForProgress,
  type CurriculumModule,
} from '@/constants/curriculum-data';

const academyModules = getModulesForProgress();

// Category color map
const CATEGORY_COLORS: Record<string, string> = {
  fundamentals: 'from-blue-500 to-cyan-500',
  operations: 'from-amber-500 to-orange-500',
  advanced: 'from-purple-500 to-pink-500',
  masterclass: 'from-emerald-500 to-teal-500',
};

const DIFFICULTY_COLORS: Record<string, string> = {
  Beginner: 'bg-green-500/10 text-green-600 dark:text-green-400',
  Intermediate: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
  Advanced: 'bg-red-500/10 text-red-600 dark:text-red-400',
};

interface ModuleProgressData {
  module_id: string;
  completed_sections: number;
  last_visited_at: string | null;
  started_at: string | null;
}

const AcademyProgress = () => {
  const navigate = useNavigate();
  const { user, academyUser } = useAcademyAuth();
  const [moduleProgress, setModuleProgress] = useState<Record<string, ModuleProgressData>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [showCertificate, setShowCertificate] = useState(false);
  const [certificateModule, setCertificateModule] = useState<string | null>(null);
  const [hasAutoShownCert, setHasAutoShownCert] = useState(false);
  const [activeTab, setActiveTab] = useState<'in-progress' | 'completed' | 'all'>('in-progress');

  useEffect(() => {
    document.title = "My Learning | WattByte Academy";
  }, []);

  useEffect(() => {
    const fetchProgress = async () => {
      if (!user) return;
      try {
        const [{ data: progressData }, { data: startData }] = await Promise.all([
          supabase
            .from('academy_progress')
            .select('module_id, section_id, completed_at')
            .eq('user_id', user.id),
          supabase
            .from('academy_module_starts')
            .select('module_id, last_visited_at, started_at')
            .eq('user_id', user.id),
        ]);

        const progressMap: Record<string, ModuleProgressData> = {};

        progressData?.forEach(item => {
          if (!progressMap[item.module_id]) {
            progressMap[item.module_id] = { module_id: item.module_id, completed_sections: 0, last_visited_at: null, started_at: null };
          }
          progressMap[item.module_id].completed_sections++;
        });

        startData?.forEach(item => {
          if (!progressMap[item.module_id]) {
            progressMap[item.module_id] = { module_id: item.module_id, completed_sections: 0, last_visited_at: null, started_at: null };
          }
          progressMap[item.module_id].last_visited_at = item.last_visited_at;
          progressMap[item.module_id].started_at = item.started_at;
        });

        setModuleProgress(progressMap);
      } catch (error) {
        console.error('Error fetching progress:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProgress();
  }, [user]);

  const totalSections = academyModules.reduce((sum, m) => sum + m.totalSections, 0);
  const completedSections = Object.values(moduleProgress).reduce((sum, p) => sum + p.completed_sections, 0);
  const overallProgress = totalSections > 0 ? Math.round((completedSections / totalSections) * 100) : 0;
  const completedModulesList = ACADEMY_CURRICULUM.filter(m => {
    const p = moduleProgress[m.id];
    return p && p.completed_sections >= m.lessons.length;
  });
  const inProgressModules = ACADEMY_CURRICULUM.filter(m => {
    const p = moduleProgress[m.id];
    return p && p.completed_sections > 0 && p.completed_sections < m.lessons.length;
  });
  const notStartedModules = ACADEMY_CURRICULUM.filter(m => {
    const p = moduleProgress[m.id];
    return !p || p.completed_sections === 0;
  });

  const estimatedTimeSpent = completedSections * 3; // ~3 min per section
  const timeFormatted = estimatedTimeSpent >= 60
    ? `${Math.floor(estimatedTimeSpent / 60)}h ${estimatedTimeSpent % 60}m`
    : `${estimatedTimeSpent}m`;

  // Streak estimation (days since first activity)
  const streakDays = useMemo(() => {
    const starts = Object.values(moduleProgress).map(p => p.started_at).filter(Boolean) as string[];
    if (starts.length === 0) return 0;
    const earliest = new Date(Math.min(...starts.map(s => new Date(s).getTime())));
    return Math.ceil((Date.now() - earliest.getTime()) / (1000 * 60 * 60 * 24));
  }, [moduleProgress]);

  // Auto-show certificate when all modules complete
  useEffect(() => {
    if (overallProgress === 100 && !hasAutoShownCert && !isLoading) {
      const certShownKey = `wattbyte_cert_shown_${user?.id}`;
      if (!localStorage.getItem(certShownKey)) {
        setShowCertificate(true);
        setCertificateModule(null);
        setHasAutoShownCert(true);
        localStorage.setItem(certShownKey, 'true');
      }
    }
  }, [overallProgress, hasAutoShownCert, isLoading, user?.id]);

  // Next recommended module
  const nextModule = useMemo(() => {
    // First incomplete in-progress, or first not-started
    if (inProgressModules.length > 0) return inProgressModules[0];
    if (notStartedModules.length > 0) return notStartedModules[0];
    return null;
  }, [inProgressModules, notStartedModules]);

  const getModulePercentage = (m: CurriculumModule) => {
    const p = moduleProgress[m.id];
    if (!p) return 0;
    return Math.round((p.completed_sections / m.lessons.length) * 100);
  };

  const tabs = [
    { key: 'in-progress' as const, label: 'In Progress', count: inProgressModules.length },
    { key: 'completed' as const, label: 'Completed', count: completedModulesList.length },
    { key: 'all' as const, label: 'All Courses', count: ACADEMY_CURRICULUM.length },
  ];

  const displayedModules = activeTab === 'in-progress'
    ? inProgressModules
    : activeTab === 'completed'
    ? completedModulesList
    : ACADEMY_CURRICULUM;

  return (
    <div className="min-h-screen bg-background">
      <LandingNavigation />

      <main className="pt-20 pb-16">
        {/* Hero / Welcome Section */}
        <div className="bg-gradient-to-br from-primary/5 via-background to-accent/5 border-b border-border">
          <div className="container mx-auto px-4 py-10">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div>
                <motion.h1
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-2xl md:text-3xl font-bold text-foreground mb-1"
                >
                  Welcome back, {academyUser?.full_name?.split(' ')[0] || 'Learner'}
                </motion.h1>
                <p className="text-muted-foreground">
                {overallProgress === 100
                    ? "🎉 You've completed the entire curriculum!"
                    : nextModule
                    ? `Continue learning — pick up where you left off`
                    : 'Start your learning journey today'}
                </p>
              </div>

              {nextModule && overallProgress < 100 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <Button
                    onClick={() => navigate(nextModule.route)}
                    className="gap-2"
                    size="lg"
                  >
                    <Play className="w-4 h-4" />
                    {inProgressModules.length > 0 ? 'Continue Learning' : 'Start Learning'}
                  </Button>
                </motion.div>
              )}
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 mt-8">
          {/* Stats Row */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-8">
            {[
              { icon: Target, label: 'Overall', value: `${overallProgress}%`, color: 'text-primary', bg: 'bg-primary/10' },
              { icon: CheckCircle2, label: 'Completed', value: `${completedModulesList.length}/${ACADEMY_CURRICULUM.length}`, color: 'text-green-500', bg: 'bg-green-500/10' },
              { icon: BookOpen, label: 'Lessons Done', value: `${completedSections}`, color: 'text-blue-500', bg: 'bg-blue-500/10' },
              { icon: Clock, label: 'Time Spent', value: timeFormatted, color: 'text-purple-500', bg: 'bg-purple-500/10' },
              { icon: Flame, label: 'Active Days', value: `${streakDays}`, color: 'text-amber-500', bg: 'bg-amber-500/10' },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                className="bg-card border border-border rounded-xl p-4"
              >
                <div className={cn('w-9 h-9 rounded-lg flex items-center justify-center mb-2', stat.bg)}>
                  <stat.icon className={cn('w-4.5 h-4.5', stat.color)} />
                </div>
                <div className="text-xl font-bold text-foreground">{stat.value}</div>
                <div className="text-xs text-muted-foreground">{stat.label}</div>
              </motion.div>
            ))}
          </div>

          {/* Progress Ring + Overall Bar */}
          <div className="bg-card border border-border rounded-xl p-6 mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
              <div>
                <h2 className="font-semibold text-foreground mb-1">Curriculum Progress</h2>
                <p className="text-sm text-muted-foreground">{completedSections} of {totalSections} lessons completed</p>
              </div>
              {overallProgress === 100 && (
                <Button
                  onClick={() => { setShowCertificate(true); setCertificateModule(null); }}
                  className="gap-2"
                  variant="outline"
                  size="sm"
                >
                  <Award className="w-4 h-4" />
                  View Certificate
                </Button>
              )}
            </div>

            {/* Phase progress */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              {LEARNING_PHASES.map(phase => {
                const phaseModules = ACADEMY_CURRICULUM.filter(m => m.phase === phase.phase);
                const phaseLessons = phaseModules.reduce((s, m) => s + m.lessons.length, 0);
                const phaseCompleted = phaseModules.reduce((s, m) => s + (moduleProgress[m.id]?.completed_sections || 0), 0);
                const phasePct = phaseLessons > 0 ? Math.round((phaseCompleted / phaseLessons) * 100) : 0;

                return (
                  <div key={phase.phase} className="p-3 rounded-lg bg-muted/50">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium text-foreground">Phase {phase.phase}</span>
                      <span className="text-xs text-muted-foreground">{phasePct}%</span>
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">{phase.title}</p>
                    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-primary rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${phasePct}%` }}
                        transition={{ duration: 0.6, delay: phase.phase * 0.1 }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex items-center gap-1 mb-6 bg-muted/50 rounded-lg p-1 w-fit">
            {tabs.map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={cn(
                  'px-4 py-2 rounded-md text-sm font-medium transition-colors',
                  activeTab === tab.key
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {tab.label}
                <span className={cn(
                  'ml-1.5 text-xs px-1.5 py-0.5 rounded-full',
                  activeTab === tab.key ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
                )}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {/* Module Cards */}
          {displayedModules.length === 0 ? (
            <div className="text-center py-16 bg-card border border-border rounded-xl">
              <BookOpen className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">
                {activeTab === 'in-progress' ? 'No courses in progress' : 'No completed courses yet'}
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                {activeTab === 'in-progress'
                  ? 'Start a course from the catalog to begin tracking your progress.'
                  : 'Complete your first module to see it here.'}
              </p>
              <Button onClick={() => navigate('/academy')} variant="outline" className="gap-2">
                Browse Courses <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {displayedModules.map((module, idx) => {
                const progress = moduleProgress[module.id];
                const completed = progress?.completed_sections || 0;
                const percentage = getModulePercentage(module);
                const isComplete = completed >= module.lessons.length;
                const gradientClass = CATEGORY_COLORS[module.category] || 'from-gray-500 to-gray-600';

                return (
                  <motion.div
                    key={module.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.04 }}
                  >
                    <div
                      className={cn(
                        'bg-card border rounded-xl overflow-hidden cursor-pointer transition-all hover:shadow-lg hover:border-border/80 group',
                        isComplete ? 'border-green-500/30' : 'border-border'
                      )}
                      onClick={() => navigate(module.route)}
                    >
                      {/* Card Thumbnail */}
                      <div className={cn('h-28 bg-gradient-to-br relative', gradientClass)}>
                        <div className="absolute inset-0 bg-black/20" />
                        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                          <span className="text-xs font-medium text-white/90 bg-black/30 px-2 py-1 rounded">
                            Phase {module.phase}
                          </span>
                          <span className={cn('text-xs font-medium px-2 py-1 rounded', 'bg-white/20 text-white')}>
                            {module.difficulty}
                          </span>
                        </div>
                        {isComplete && (
                          <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
                            <CheckCircle2 className="w-5 h-5 text-white" />
                          </div>
                        )}
                      </div>

                      {/* Card Body */}
                      <div className="p-4">
                        <h3 className="font-semibold text-foreground mb-1 group-hover:text-primary transition-colors line-clamp-1">
                          {module.title}
                        </h3>
                        <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                          {module.description}
                        </p>

                        {/* Progress */}
                        <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                          <span>{completed}/{module.lessons.length} lessons</span>
                          <span className={cn('font-medium', isComplete ? 'text-green-500' : 'text-foreground')}>
                            {percentage}%
                          </span>
                        </div>
                        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                          <motion.div
                            className={cn('h-full rounded-full', isComplete ? 'bg-green-500' : 'bg-primary')}
                            initial={{ width: 0 }}
                            animate={{ width: `${percentage}%` }}
                            transition={{ duration: 0.5, delay: idx * 0.05 }}
                          />
                        </div>

                        {/* Footer */}
                        <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="w-3 h-3" />
                            {module.estimatedMinutes}m
                          </div>
                          {isComplete ? (
                            <button
                              className="text-xs font-medium text-primary hover:underline flex items-center gap-1"
                              onClick={(e) => {
                                e.stopPropagation();
                                setCertificateModule(module.title);
                                setShowCertificate(true);
                              }}
                            >
                              <Award className="w-3 h-3" />
                              Certificate
                            </button>
                          ) : progress?.last_visited_at ? (
                            <span className="text-xs text-muted-foreground">
                              {formatDistanceToNow(new Date(progress.last_visited_at), { addSuffix: true })}
                            </span>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}

          {/* Achievements Section */}
          {completedModulesList.length > 0 && (
            <div className="mt-12">
              <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                <Trophy className="w-5 h-5 text-amber-500" />
                Achievements
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {completedModulesList.map((module, idx) => (
                  <motion.div
                    key={module.id}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.05 }}
                    className="bg-card border border-border rounded-xl p-4 text-center cursor-pointer hover:border-primary/30 transition-colors"
                    onClick={(e) => {
                      setCertificateModule(module.title);
                      setShowCertificate(true);
                    }}
                  >
                    <div className={cn(
                      'w-12 h-12 rounded-full mx-auto mb-2 flex items-center justify-center bg-gradient-to-br',
                      CATEGORY_COLORS[module.category]
                    )}>
                      <CheckCircle2 className="w-6 h-6 text-white" />
                    </div>
                    <p className="text-xs font-medium text-foreground line-clamp-2">{module.title}</p>
                    <p className="text-[10px] text-muted-foreground mt-1">Completed</p>
                  </motion.div>
                ))}

                {/* Locked achievements for incomplete modules */}
                {notStartedModules.slice(0, 3).map((module, idx) => (
                  <div
                    key={module.id}
                    className="bg-muted/30 border border-dashed border-border rounded-xl p-4 text-center opacity-40"
                  >
                    <div className="w-12 h-12 rounded-full mx-auto mb-2 flex items-center justify-center bg-muted">
                      <GraduationCap className="w-6 h-6 text-muted-foreground" />
                    </div>
                    <p className="text-xs font-medium text-muted-foreground line-clamp-2">{module.title}</p>
                    <p className="text-[10px] text-muted-foreground mt-1">Locked</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Back to Academy */}
          <div className="mt-10 text-center">
            <Button variant="outline" onClick={() => navigate('/academy')} className="gap-2">
              <ArrowRight className="w-4 h-4 rotate-180" />
              Back to Academy
            </Button>
          </div>
        </div>
      </main>

      <LandingFooter />

      {showCertificate && (
        <CompletionCertificate
          moduleName={certificateModule || 'WattByte Academy — Full Curriculum'}
          completedAt={new Date().toISOString()}
          userName={academyUser?.full_name || 'Learner'}
          onClose={() => setShowCertificate(false)}
        />
      )}
    </div>
  );
};

export default AcademyProgress;
