import { useState, useMemo } from "react";
import { LayoutGrid, Route, BookOpen, CheckCircle2, ArrowRight, Clock, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { useAllModulesProgress } from "@/hooks/useProgressTracking";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { CourseCard } from "./CourseCard";
import {
  ACADEMY_CURRICULUM,
  CURRICULUM_CATEGORIES,
  LEARNING_PHASES,
  DIFFICULTY_BADGES,
  type CurriculumModule,
} from "@/constants/curriculum-data";

// My Learning Section (shown when user has progress)
const MyLearningSection = () => {
  const navigate = useNavigate();
  const { allProgress, getModuleProgress } = useAllModulesProgress();

  const inProgress = useMemo(() => {
    return ACADEMY_CURRICULUM
      .map(m => ({ module: m, progress: getModuleProgress(m.id, m.lessons.length) }))
      .filter(({ progress }) => progress.isStarted && !progress.isComplete)
      .slice(0, 3);
  }, [allProgress, getModuleProgress]);

  const completedCount = useMemo(() => {
    return ACADEMY_CURRICULUM.filter(m => getModuleProgress(m.id, m.lessons.length).isComplete).length;
  }, [allProgress, getModuleProgress]);

  if (inProgress.length === 0 && completedCount === 0) return null;

  return (
    <section className="py-8 border-b border-border bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
              <TrendingUp className="w-4.5 h-4.5 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">My Learning</h2>
              <p className="text-sm text-muted-foreground">
                {completedCount} of {ACADEMY_CURRICULUM.length} courses completed
              </p>
            </div>
          </div>
          {completedCount > 0 && (
            <div className="hidden sm:flex items-center gap-2">
              <Progress value={(completedCount / ACADEMY_CURRICULUM.length) * 100} className="w-32 h-2" />
              <span className="text-sm text-muted-foreground font-medium">
                {Math.round((completedCount / ACADEMY_CURRICULUM.length) * 100)}%
              </span>
            </div>
          )}
        </div>

        {inProgress.length > 0 && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {inProgress.map(({ module, progress }) => (
              <motion.div
                key={module.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-4 p-4 rounded-xl bg-card border border-border hover:shadow-md transition-all cursor-pointer"
                onClick={() => navigate(module.route)}
              >
                <div className="w-11 h-11 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <module.icon className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-foreground text-sm truncate">{module.title}</h3>
                  <div className="flex items-center gap-2 mt-1.5">
                    <Progress value={progress.percentage} className="flex-1 h-1.5" />
                    <span className="text-xs text-muted-foreground shrink-0">{progress.percentage}%</span>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-muted-foreground shrink-0" />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

// Learning Path Phase
const LearningPathPhase = ({ phase, modules }: { phase: typeof LEARNING_PHASES[number]; modules: CurriculumModule[] }) => {
  const navigate = useNavigate();
  const { getModuleProgress } = useAllModulesProgress();

  return (
    <div className="relative">
      <div className="flex items-center gap-4 mb-6">
        <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg shrink-0">
          {phase.phase}
        </div>
        <div>
          <h3 className="text-lg font-bold text-foreground">{phase.title}</h3>
          <p className="text-sm text-muted-foreground">{phase.description}</p>
        </div>
      </div>

      <div className="ml-5 pl-9 border-l-2 border-border space-y-4 pb-8">
        {modules.map((module) => {
          const progress = getModuleProgress(module.id, module.lessons.length);
          const diffBadge = DIFFICULTY_BADGES[module.difficulty];

          return (
            <motion.div
              key={module.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className={cn(
                "relative bg-card border border-border rounded-xl p-4 cursor-pointer hover:shadow-md transition-all",
                progress.isComplete && "border-green-500/30"
              )}
              onClick={() => navigate(module.route)}
            >
              <div className={cn(
                "absolute -left-[calc(2.25rem+1px)] top-5 w-3 h-3 rounded-full border-2",
                progress.isComplete ? "bg-green-500 border-green-500"
                  : progress.isStarted ? "bg-primary border-primary"
                  : "bg-background border-border"
              )} />

              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className={cn(
                    "w-9 h-9 rounded-lg flex items-center justify-center shrink-0",
                    progress.isComplete ? "bg-green-500/10" : "bg-primary/10"
                  )}>
                    <module.icon className={cn("w-4 h-4", progress.isComplete ? "text-green-600" : "text-primary")} />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-foreground text-sm truncate">{module.title}</h4>
                      {progress.isComplete && <CheckCircle2 className="w-3.5 h-3.5 text-green-500 shrink-0" />}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className={cn("px-1.5 py-0.5 rounded text-[10px] font-medium", diffBadge.bg, diffBadge.text)}>
                        {module.difficulty}
                      </span>
                      <span className="text-xs text-muted-foreground">{module.lessons.length} lessons</span>
                      <span className="text-xs text-muted-foreground">~{module.estimatedMinutes}m</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {progress.isStarted && !progress.isComplete && (
                    <span className="text-xs font-medium text-primary">{progress.percentage}%</span>
                  )}
                  <ArrowRight className="w-4 h-4 text-muted-foreground" />
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

interface CurriculumSectionProps {
  searchQuery?: string;
}

export const CurriculumSection = ({ searchQuery = "" }: CurriculumSectionProps) => {
  const [activeCategory, setActiveCategory] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "path">("grid");
  const { getModuleProgress } = useAllModulesProgress();

  const filteredModules = useMemo(() => {
    return ACADEMY_CURRICULUM.filter(module => {
      const matchesCategory = activeCategory === "all" || module.category === activeCategory;
      const matchesSearch = searchQuery === "" ||
        module.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        module.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        module.lessons.some(l => l.title.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, searchQuery]);

  const isPathView = viewMode === "path" && activeCategory === "all" && searchQuery === "";

  return (
    <>
      <MyLearningSection />

      <section id="curriculum" className="py-12 bg-background">
        <div className="container mx-auto px-4">
          {/* Section header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <h2 className="text-2xl font-bold text-foreground">Explore Courses</h2>
              <p className="text-sm text-muted-foreground mt-1">
                {ACADEMY_CURRICULUM.length} courses · All free · Sign up to track progress
              </p>
            </div>

            {/* View toggle */}
            <div className="flex gap-1 border border-border rounded-lg p-1 self-start">
              <Button
                variant={viewMode === "grid" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("grid")}
                className="gap-1.5 h-8"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                Courses
              </Button>
              <Button
                variant={viewMode === "path" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("path")}
                className="gap-1.5 h-8"
              >
                <Route className="w-3.5 h-3.5" />
                Learning Path
              </Button>
            </div>
          </div>

          {/* Category pills */}
          {!isPathView && (
            <div className="flex gap-2 overflow-x-auto pb-2 mb-8 scrollbar-none">
              {CURRICULUM_CATEGORIES.map((cat) => (
                <Button
                  key={cat.key}
                  variant={activeCategory === cat.key ? "default" : "outline"}
                  size="sm"
                  onClick={() => setActiveCategory(cat.key)}
                  className="whitespace-nowrap rounded-full h-8"
                >
                  {cat.label}
                  <span className={cn(
                    "ml-1.5 px-1.5 py-0.5 rounded-full text-xs",
                    activeCategory === cat.key ? "bg-primary-foreground/20" : "bg-muted"
                  )}>
                    {cat.count}
                  </span>
                </Button>
              ))}
            </div>
          )}

          {/* Content */}
          {isPathView ? (
            <div className="max-w-3xl mx-auto">
              {LEARNING_PHASES.map((phase) => {
                const phaseModules = ACADEMY_CURRICULUM.filter(m => m.phase === phase.phase);
                return <LearningPathPhase key={phase.phase} phase={phase} modules={phaseModules} />;
              })}
            </div>
          ) : (
            <>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredModules.map((module, index) => (
                  <CourseCard
                    key={module.id}
                    module={module}
                    progress={getModuleProgress(module.id, module.lessons.length)}
                    index={index}
                  />
                ))}
              </div>

              {filteredModules.length === 0 && (
                <div className="text-center py-16">
                  <BookOpen className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                  <p className="text-muted-foreground mb-2">No courses found matching your search.</p>
                  <Button
                    variant="link"
                    onClick={() => setActiveCategory("all")}
                  >
                    Clear filters
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </>
  );
};
