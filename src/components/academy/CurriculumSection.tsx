import { useState, useMemo } from "react";
import { ChevronDown, BookOpen, CheckCircle2, Search, Clock, ArrowRight, LayoutGrid, Route } from "lucide-react";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { useAllModulesProgress } from "@/hooks/useProgressTracking";
import { useAcademyAuth } from "@/contexts/AcademyAuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  ACADEMY_CURRICULUM,
  CURRICULUM_CATEGORIES,
  LEARNING_PHASES,
  DIFFICULTY_BADGES,
  type CurriculumModule,
  type Lesson,
} from "@/constants/curriculum-data";

const ModuleCard = ({ module, index }: { module: CurriculumModule; index: number }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { academyUser } = useAcademyAuth();
  const { getModuleProgress, allProgress } = useAllModulesProgress();
  
  const progress = getModuleProgress(module.id, module.lessons.length);
  const moduleProgress = allProgress[module.id];
  const completedSections = moduleProgress?.completedSections || [];
  const diffBadge = DIFFICULTY_BADGES[module.difficulty];

  const handleLessonClick = (lesson: Lesson) => {
    if (lesson.anchor) {
      navigate(`${module.route}#${lesson.anchor}`);
    } else {
      navigate(module.route);
    }
  };

  const handleStartModule = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(module.route);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03 }}
      className={cn(
        "border border-border rounded-xl overflow-hidden bg-card",
        progress.isComplete && "ring-2 ring-green-500/20"
      )}
    >
      <div className="p-5">
        <div className="flex items-start justify-between gap-4 mb-3">
          <div className="flex items-start gap-3">
            <div className={cn(
              "w-10 h-10 rounded-lg flex items-center justify-center shrink-0",
              progress.isComplete ? "bg-green-500/10" : "bg-primary/10"
            )}>
              <module.icon className={cn(
                "w-5 h-5",
                progress.isComplete ? "text-green-600" : "text-primary"
              )} />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-semibold text-foreground">{module.title}</h3>
                {progress.isComplete && (
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                )}
              </div>
              <p className="text-sm text-muted-foreground mt-1">{module.description}</p>
            </div>
          </div>
        </div>

        {/* Meta row */}
        <div className="flex items-center gap-3 text-sm mb-4 flex-wrap">
          <span className={cn("px-2 py-0.5 rounded-full text-xs font-medium", diffBadge.bg, diffBadge.text)}>
            {module.difficulty}
          </span>
          <span className="text-muted-foreground">{module.lessons.length} lessons</span>
          <span className="text-muted-foreground flex items-center gap-1">
            <Clock className="w-3 h-3" />
            ~{module.estimatedMinutes} min
          </span>
          {progress.isStarted && !progress.isComplete && (
            <span className="text-primary font-medium">{progress.percentage}% complete</span>
          )}
        </div>

        {/* Prerequisites */}
        {module.prerequisites && module.prerequisites.length > 0 && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-4">
            <span className="font-medium">Requires:</span>
            {module.prerequisites.map(prereqId => {
              const prereq = ACADEMY_CURRICULUM.find(m => m.id === prereqId);
              return prereq ? (
                <span key={prereqId} className="px-2 py-0.5 rounded bg-muted text-muted-foreground">
                  {prereq.title}
                </span>
              ) : null;
            })}
          </div>
        )}

        {/* Progress bar */}
        {progress.isStarted && (
          <div className="h-1.5 bg-muted rounded-full overflow-hidden mb-4">
            <motion.div 
              className={cn(
                "h-full rounded-full",
                progress.isComplete ? "bg-green-500" : "bg-primary"
              )}
              initial={{ width: 0 }}
              animate={{ width: `${progress.percentage}%` }}
            />
          </div>
        )}

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="gap-1"
          >
            <BookOpen className="w-4 h-4" />
            {isExpanded ? "Hide" : "View"} Lessons
            <ChevronDown className={cn(
              "w-4 h-4 transition-transform",
              isExpanded && "rotate-180"
            )} />
          </Button>
          <Button
            size="sm"
            onClick={handleStartModule}
          >
            {progress.isComplete ? "Review" : progress.isStarted ? "Continue" : "Start"}
          </Button>
        </div>
      </div>

      {/* Lessons List */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="border-t border-border bg-muted/30">
              {module.lessons.map((lesson, lessonIndex) => {
                const isCompleted = completedSections.includes(lesson.anchor || lesson.title);
                return (
                  <button
                    key={lesson.title}
                    onClick={() => handleLessonClick(lesson)}
                    className="w-full flex items-center gap-3 px-5 py-3 hover:bg-muted/50 transition-colors text-left border-b border-border/50 last:border-b-0"
                  >
                    <div className={cn(
                      "w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium shrink-0",
                      isCompleted 
                        ? "bg-green-500/10 text-green-600" 
                        : "bg-muted text-muted-foreground"
                    )}>
                      {isCompleted ? (
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      ) : (
                        lessonIndex + 1
                      )}
                    </div>
                    <span className={cn(
                      "text-sm",
                      isCompleted ? "text-muted-foreground" : "text-foreground"
                    )}>
                      {lesson.title}
                    </span>
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// Learning Path Phase Component
const LearningPathPhase = ({ phase, modules }: { phase: typeof LEARNING_PHASES[number]; modules: CurriculumModule[] }) => {
  const navigate = useNavigate();
  const { getModuleProgress } = useAllModulesProgress();

  const phaseMinutes = modules.reduce((sum, m) => sum + m.estimatedMinutes, 0);
  const phaseLessons = modules.reduce((sum, m) => sum + m.lessons.length, 0);

  return (
    <div className="relative">
      {/* Phase Header */}
      <div className="flex items-center gap-4 mb-6">
        <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg shrink-0">
          {phase.phase}
        </div>
        <div>
          <h3 className="text-lg font-bold text-foreground">{phase.title}</h3>
          <p className="text-sm text-muted-foreground">
            {phase.description} · {modules.length} modules · {phaseLessons} lessons · ~{Math.round(phaseMinutes / 60)}h
          </p>
        </div>
      </div>

      {/* Phase Modules */}
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
              {/* Connector dot */}
              <div className={cn(
                "absolute -left-[calc(2.25rem+1px)] top-5 w-3 h-3 rounded-full border-2",
                progress.isComplete
                  ? "bg-green-500 border-green-500"
                  : progress.isStarted
                    ? "bg-primary border-primary"
                    : "bg-background border-border"
              )} />

              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className={cn(
                    "w-9 h-9 rounded-lg flex items-center justify-center shrink-0",
                    progress.isComplete ? "bg-green-500/10" : "bg-primary/10"
                  )}>
                    <module.icon className={cn(
                      "w-4 h-4",
                      progress.isComplete ? "text-green-600" : "text-primary"
                    )} />
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

export const CurriculumSection = () => {
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'path'>('grid');

  const filteredModules = useMemo(() => {
    return ACADEMY_CURRICULUM.filter(module => {
      const matchesCategory = activeCategory === 'all' || module.category === activeCategory;
      const matchesSearch = searchQuery === '' || 
        module.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        module.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        module.lessons.some(l => l.title.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, searchQuery]);

  const isPathView = viewMode === 'path' && activeCategory === 'all' && searchQuery === '';

  return (
    <section id="curriculum" className="py-16 bg-background">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-foreground mb-3">
            Browse All Modules
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {ACADEMY_CURRICULUM.length} modules covering everything from Bitcoin basics to advanced operations. 
            All content is free — sign up to track your progress.
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-col gap-4 mb-8 max-w-5xl mx-auto">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search modules or lessons..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* View toggle */}
            <div className="flex gap-1 border border-border rounded-lg p-1">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className="gap-1.5"
              >
                <LayoutGrid className="w-4 h-4" />
                Grid
              </Button>
              <Button
                variant={viewMode === 'path' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('path')}
                className="gap-1.5"
              >
                <Route className="w-4 h-4" />
                Learning Path
              </Button>
            </div>
          </div>

          {/* Category tabs (hide in path view) */}
          {!isPathView && (
            <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0">
              {CURRICULUM_CATEGORIES.map((cat) => (
                <Button
                  key={cat.key}
                  variant={activeCategory === cat.key ? "default" : "outline"}
                  size="sm"
                  onClick={() => setActiveCategory(cat.key)}
                  className="whitespace-nowrap"
                >
                  {cat.label}
                  <span className={cn(
                    "ml-1.5 px-1.5 py-0.5 rounded text-xs",
                    activeCategory === cat.key 
                      ? "bg-primary-foreground/20" 
                      : "bg-muted"
                  )}>
                    {cat.count}
                  </span>
                </Button>
              ))}
            </div>
          )}
        </div>

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
            <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
              {filteredModules.map((module, index) => (
                <ModuleCard key={module.id} module={module} index={index} />
              ))}
            </div>

            {filteredModules.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No modules found matching your search.</p>
                <Button
                  variant="link"
                  onClick={() => { setSearchQuery(''); setActiveCategory('all'); }}
                >
                  Clear filters
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
};
