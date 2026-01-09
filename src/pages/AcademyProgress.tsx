import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LandingNavigation } from '@/components/landing/LandingNavigation';
import { LandingFooter } from '@/components/landing/LandingFooter';
import { AcademyEmailVerificationBanner } from '@/components/academy/AcademyEmailVerificationBanner';
import { useAcademyAuth } from '@/contexts/AcademyAuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  BookOpen, 
  CheckCircle2, 
  Clock, 
  Trophy, 
  ArrowRight, 
  GraduationCap,
  BarChart3,
  Calendar
} from 'lucide-react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';

const academyModules = [
  { id: "bitcoin", title: "Bitcoin Fundamentals", route: "/bitcoin", totalSections: 12 },
  { id: "datacenters", title: "Mining Infrastructure", route: "/datacenters", totalSections: 10 },
  { id: "aeso", title: "Alberta Energy Market", route: "/aeso-101", totalSections: 10 },
  { id: "hydro", title: "Hydro Cooling Systems", route: "/hydro-datacenters", totalSections: 12 },
  { id: "electrical", title: "Electrical Infrastructure", route: "/electrical-infrastructure", totalSections: 12 },
  { id: "noise", title: "Noise Management", route: "/noise-management", totalSections: 10 },
  { id: "immersion", title: "Immersion Cooling", route: "/immersion-cooling", totalSections: 10 },
  { id: "mining-economics", title: "Mining Economics", route: "/mining-economics", totalSections: 8 },
  { id: "operations", title: "Operations & Maintenance", route: "/operations", totalSections: 8 },
  { id: "strategic-operations", title: "Strategic Operations", route: "/strategic-operations", totalSections: 6 },
  { id: "taxes-insurance", title: "Taxes & Insurance", route: "/taxes-insurance", totalSections: 10 },
  { id: "engineering-permitting", title: "Engineering & Permitting", route: "/engineering-permitting", totalSections: 10 },
  { id: "networking", title: "Networking Masterclass", route: "/networking", totalSections: 10 },
];

interface ModuleProgress {
  module_id: string;
  completed_sections: number;
  last_visited_at: string | null;
}

const AcademyProgress = () => {
  const navigate = useNavigate();
  const { user, academyUser } = useAcademyAuth();
  const [moduleProgress, setModuleProgress] = useState<Record<string, ModuleProgress>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    document.title = "My Progress | WattByte Academy";
  }, []);

  useEffect(() => {
    const fetchProgress = async () => {
      if (!user) return;

      try {
        // Fetch completed sections per module
        const { data: progressData } = await supabase
          .from('academy_progress')
          .select('module_id, section_id, completed_at')
          .eq('user_id', user.id);

        // Fetch module start times
        const { data: startData } = await supabase
          .from('academy_module_starts')
          .select('module_id, last_visited_at')
          .eq('user_id', user.id);

        const progressMap: Record<string, ModuleProgress> = {};

        // Group by module
        progressData?.forEach(item => {
          if (!progressMap[item.module_id]) {
            progressMap[item.module_id] = {
              module_id: item.module_id,
              completed_sections: 0,
              last_visited_at: null
            };
          }
          progressMap[item.module_id].completed_sections++;
        });

        // Add last visited info
        startData?.forEach(item => {
          if (progressMap[item.module_id]) {
            progressMap[item.module_id].last_visited_at = item.last_visited_at;
          }
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
  const completedModules = academyModules.filter(m => {
    const progress = moduleProgress[m.id];
    return progress && progress.completed_sections >= m.totalSections;
  }).length;

  return (
    <div className="min-h-screen bg-background">
      <LandingNavigation />
      
      {academyUser && !academyUser.is_email_verified && (
        <AcademyEmailVerificationBanner />
      )}
      
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">My Learning Progress</h1>
            <p className="text-muted-foreground">Track your journey through the WattByte Academy</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-card border border-border rounded-xl p-5"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <BarChart3 className="w-5 h-5 text-primary" />
                </div>
              </div>
              <div className="text-2xl font-bold" style={{ color: 'hsl(var(--watt-bitcoin))' }}>{overallProgress}%</div>
              <div className="text-sm text-muted-foreground">Overall Progress</div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-card border border-border rounded-xl p-5"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                </div>
              </div>
              <div className="text-2xl font-bold text-foreground">{completedSections}</div>
              <div className="text-sm text-muted-foreground">Sections Completed</div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-card border border-border rounded-xl p-5"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                  <Trophy className="w-5 h-5 text-purple-500" />
                </div>
              </div>
              <div className="text-2xl font-bold text-foreground">{completedModules}</div>
              <div className="text-sm text-muted-foreground">Modules Completed</div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-card border border-border rounded-xl p-5"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-blue-500" />
                </div>
              </div>
              <div className="text-2xl font-bold text-foreground">{academyModules.length}</div>
              <div className="text-sm text-muted-foreground">Total Modules</div>
            </motion.div>
          </div>

          {/* Overall Progress Bar */}
          <div className="bg-card border border-border rounded-xl p-6 mb-8">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold text-foreground">Overall Progress</h2>
              <span className="text-sm text-muted-foreground">{completedSections} / {totalSections} sections</span>
            </div>
            <Progress value={overallProgress} className="h-3" />
          </div>

          {/* Module List */}
          <h2 className="text-xl font-bold text-foreground mb-4">All Modules</h2>
          <div className="space-y-3">
            {academyModules.map((module, idx) => {
              const progress = moduleProgress[module.id];
              const completed = progress?.completed_sections || 0;
              const percentage = Math.round((completed / module.totalSections) * 100);
              const isComplete = completed >= module.totalSections;

              return (
                <motion.div
                  key={module.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className={`bg-card border rounded-xl p-5 cursor-pointer hover:shadow-md transition-shadow ${
                    isComplete ? 'border-green-500/30' : 'border-border'
                  }`}
                  onClick={() => navigate(module.route)}
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4 flex-1">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        isComplete ? 'bg-green-500/10' : 'bg-primary/10'
                      }`}>
                        {isComplete ? (
                          <CheckCircle2 className="w-5 h-5 text-green-500" />
                        ) : (
                          <GraduationCap className="w-5 h-5 text-primary" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-foreground truncate">{module.title}</h3>
                        <div className="flex items-center gap-4 mt-1">
                          <span className="text-sm text-muted-foreground">
                            {completed} / {module.totalSections} sections
                          </span>
                          {progress?.last_visited_at && (
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {format(new Date(progress.last_visited_at), 'MMM d')}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="w-24 hidden sm:block">
                        <Progress value={percentage} className="h-2" />
                      </div>
                      <span className="text-sm font-medium w-12 text-right" style={{ color: isComplete ? 'hsl(var(--watt-success))' : 'hsl(var(--watt-bitcoin))' }}>
                        {percentage}%
                      </span>
                      <ArrowRight className="w-4 h-4 text-muted-foreground" />
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Back to Academy */}
          <div className="mt-8 text-center">
            <Button variant="outline" onClick={() => navigate('/academy')}>
              Back to Academy
            </Button>
          </div>
        </div>
      </main>
      
      <LandingFooter />
    </div>
  );
};

export default AcademyProgress;
