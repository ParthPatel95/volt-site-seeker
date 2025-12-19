import React, { useMemo } from 'react';
import { Bitcoin, Server, Zap, Droplets, CircuitBoard, Volume2, Waves, MapPin, DollarSign, Settings, ShieldAlert, TrendingUp, CheckCircle2, Lock, ArrowRight, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import { useAllModulesProgress } from '@/hooks/useProgressTracking';
import { motion } from 'framer-motion';
import { ScrollReveal } from '@/components/landing/ScrollAnimations';

interface ModuleData {
  id: string;
  title: string;
  shortTitle: string;
  icon: React.ElementType;
  route: string;
  totalSections: number;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  category: 'fundamentals' | 'operations' | 'advanced';
  recommended?: string[];
}

const journeyModules: ModuleData[] = [
  // Fundamentals Row
  { id: 'bitcoin', title: 'Bitcoin Fundamentals', shortTitle: 'Bitcoin 101', icon: Bitcoin, route: '/bitcoin', totalSections: 12, difficulty: 'Beginner', category: 'fundamentals' },
  { id: 'aeso', title: 'Alberta Energy Market', shortTitle: 'AESO 101', icon: Zap, route: '/aeso-101', totalSections: 10, difficulty: 'Beginner', category: 'fundamentals' },
  { id: 'mining-economics', title: 'Mining Economics', shortTitle: 'Economics', icon: DollarSign, route: '/mining-economics', totalSections: 8, difficulty: 'Beginner', category: 'fundamentals', recommended: ['bitcoin'] },
  
  // Operations Row
  { id: 'datacenters', title: 'Mining Infrastructure', shortTitle: 'Datacenters', icon: Server, route: '/datacenters', totalSections: 10, difficulty: 'Intermediate', category: 'operations', recommended: ['bitcoin'] },
  { id: 'electrical', title: 'Electrical Infrastructure', shortTitle: 'Electrical', icon: CircuitBoard, route: '/electrical-infrastructure', totalSections: 12, difficulty: 'Intermediate', category: 'operations', recommended: ['datacenters'] },
  { id: 'operations', title: 'Operations & Maintenance', shortTitle: 'Operations', icon: Settings, route: '/operations', totalSections: 8, difficulty: 'Intermediate', category: 'operations', recommended: ['datacenters'] },
  
  // Advanced Row
  { id: 'hydro', title: 'Hydro Cooling Systems', shortTitle: 'Hydro Cooling', icon: Droplets, route: '/hydro-datacenters', totalSections: 12, difficulty: 'Advanced', category: 'advanced', recommended: ['datacenters', 'electrical'] },
  { id: 'immersion', title: 'Immersion Cooling', shortTitle: 'Immersion', icon: Waves, route: '/immersion-cooling', totalSections: 10, difficulty: 'Advanced', category: 'advanced', recommended: ['datacenters'] },
  { id: 'noise', title: 'Noise Management', shortTitle: 'Noise', icon: Volume2, route: '/noise-management', totalSections: 10, difficulty: 'Intermediate', category: 'operations' },
  { id: 'site-selection', title: 'Site Selection', shortTitle: 'Site Select', icon: MapPin, route: '/site-selection', totalSections: 9, difficulty: 'Advanced', category: 'advanced', recommended: ['aeso', 'mining-economics'] },
  { id: 'risk-management', title: 'Risk Management', shortTitle: 'Risk', icon: ShieldAlert, route: '/risk-management', totalSections: 8, difficulty: 'Advanced', category: 'advanced' },
  { id: 'scaling-growth', title: 'Scaling & Growth', shortTitle: 'Scaling', icon: TrendingUp, route: '/scaling-growth', totalSections: 8, difficulty: 'Advanced', category: 'advanced', recommended: ['mining-economics', 'operations'] },
];

const difficultyColors = {
  Beginner: { bg: 'bg-green-500/10', text: 'text-green-600', border: 'border-green-500/30' },
  Intermediate: { bg: 'bg-blue-500/10', text: 'text-blue-600', border: 'border-blue-500/30' },
  Advanced: { bg: 'bg-purple-500/10', text: 'text-purple-600', border: 'border-purple-500/30' },
};

export const LearningJourneyMap: React.FC = () => {
  const navigate = useNavigate();
  const { getModuleProgress } = useAllModulesProgress();

  const moduleStates = useMemo(() => {
    return journeyModules.map(module => {
      const progress = getModuleProgress(module.id, module.totalSections);
      
      // Check if prerequisites are met
      let isLocked = false;
      if (module.recommended && module.recommended.length > 0) {
        const prereqsMet = module.recommended.some(prereqId => {
          const prereqProgress = getModuleProgress(prereqId, journeyModules.find(m => m.id === prereqId)?.totalSections || 0);
          return prereqProgress.percentage >= 50;
        });
        isLocked = !prereqsMet && !progress.isStarted;
      }

      return {
        ...module,
        progress,
        isLocked,
      };
    });
  }, [getModuleProgress]);

  const categories = [
    { key: 'fundamentals', title: 'Fundamentals', subtitle: 'Start your journey here', color: 'from-green-500/20 to-green-500/5' },
    { key: 'operations', title: 'Operations', subtitle: 'Master the infrastructure', color: 'from-blue-500/20 to-blue-500/5' },
    { key: 'advanced', title: 'Advanced', subtitle: 'Expert-level topics', color: 'from-purple-500/20 to-purple-500/5' },
  ];

  return (
    <section className="py-16 bg-gradient-to-b from-watt-light to-background">
      <div className="container mx-auto px-4">
        <ScrollReveal>
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-watt-navy mb-4">
              Your Learning Journey
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Follow the recommended path or forge your own way. Each module builds on the previous to create a complete understanding.
            </p>
          </div>
        </ScrollReveal>

        {/* Journey Categories */}
        <div className="space-y-8 max-w-6xl mx-auto">
          {categories.map((category, categoryIndex) => {
            const categoryModules = moduleStates.filter(m => m.category === category.key);
            
            return (
              <ScrollReveal key={category.key} delay={categoryIndex * 100}>
                <div className={cn(
                  "rounded-2xl p-6 bg-gradient-to-r border border-border/50",
                  category.color
                )}>
                  {/* Category Header */}
                  <div className="flex items-center gap-3 mb-6">
                    <div className="flex items-center gap-2">
                      <h3 className="text-xl font-bold text-watt-navy">{category.title}</h3>
                      <span className="text-sm text-muted-foreground">• {category.subtitle}</span>
                    </div>
                    <div className="flex-1 h-px bg-border/50" />
                  </div>

                  {/* Module Cards */}
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {categoryModules.map((module, index) => {
                      const Icon = module.icon;
                      const diffColors = difficultyColors[module.difficulty];
                      
                      return (
                        <motion.div
                          key={module.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: categoryIndex * 0.1 + index * 0.05 }}
                          whileHover={!module.isLocked ? { scale: 1.02, y: -5 } : {}}
                          onClick={() => !module.isLocked && navigate(module.route)}
                          className={cn(
                            "relative p-4 rounded-xl bg-white border transition-all cursor-pointer group",
                            module.progress.isComplete 
                              ? "border-green-500/30 ring-2 ring-green-500/20"
                              : module.progress.isStarted
                              ? "border-primary/30 ring-1 ring-primary/10"
                              : "border-border hover:border-primary/30 hover:shadow-lg",
                            module.isLocked && "opacity-60 cursor-not-allowed"
                          )}
                        >
                          {/* Completion Badge */}
                          {module.progress.isComplete && (
                            <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
                              <CheckCircle2 className="w-4 h-4 text-white" />
                            </div>
                          )}

                          {/* Lock Icon for locked modules */}
                          {module.isLocked && (
                            <div className="absolute -top-2 -right-2 w-6 h-6 bg-muted rounded-full flex items-center justify-center">
                              <Lock className="w-3 h-3 text-muted-foreground" />
                            </div>
                          )}

                          {/* Icon */}
                          <div className={cn(
                            "w-10 h-10 rounded-lg flex items-center justify-center mb-3",
                            module.progress.isComplete ? "bg-green-500/10" : diffColors.bg
                          )}>
                            <Icon className={cn(
                              "w-5 h-5",
                              module.progress.isComplete ? "text-green-600" : diffColors.text
                            )} />
                          </div>

                          {/* Title */}
                          <h4 className="font-semibold text-watt-navy text-sm mb-1 group-hover:text-primary transition-colors">
                            {module.shortTitle}
                          </h4>

                          {/* Difficulty Badge */}
                          <span className={cn(
                            "text-[10px] font-medium px-2 py-0.5 rounded-full",
                            diffColors.bg, diffColors.text
                          )}>
                            {module.difficulty}
                          </span>

                          {/* Progress Bar */}
                          {module.progress.isStarted && !module.progress.isComplete && (
                            <div className="mt-3">
                              <div className="h-1 bg-muted rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-primary rounded-full transition-all"
                                  style={{ width: `${module.progress.percentage}%` }}
                                />
                              </div>
                              <p className="text-[10px] text-muted-foreground mt-1">
                                {module.progress.percentage}% complete
                              </p>
                            </div>
                          )}

                          {/* Arrow on hover */}
                          {!module.isLocked && (
                            <ChevronRight className="absolute bottom-4 right-4 w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                          )}
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              </ScrollReveal>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap justify-center gap-6 mt-10 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500" />
            <span className="text-muted-foreground">Completed</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-primary" />
            <span className="text-muted-foreground">In Progress</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-muted border border-border" />
            <span className="text-muted-foreground">Not Started</span>
          </div>
          <div className="flex items-center gap-2">
            <Lock className="w-3 h-3 text-muted-foreground" />
            <span className="text-muted-foreground">Recommended Prerequisite</span>
          </div>
        </div>
      </div>
    </section>
  );
};
