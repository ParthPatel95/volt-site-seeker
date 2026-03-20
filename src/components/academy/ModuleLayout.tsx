import React, { useState, useEffect, useCallback, useRef, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ChevronLeft, ChevronRight, CheckCircle2, Circle, BookOpen, 
  Clock, ArrowLeft, Menu, X, GraduationCap, Play
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useAcademyProgress } from '@/hooks/useAcademyProgress';
import { ACADEMY_CURRICULUM, DIFFICULTY_BADGES, type CurriculumModule, type Lesson } from '@/constants/curriculum-data';
import { useIsMobile } from '@/hooks/use-mobile';
import { motion, AnimatePresence } from 'framer-motion';
import { COURSE_THUMBNAILS } from '@/assets/thumbnails';

interface LessonSection {
  id: string; // anchor
  title: string;
  component: React.ReactNode;
}

interface ModuleLayoutProps {
  moduleId: string;
  children: React.ReactNode;
  /** Map of anchor IDs to rendered section components — used for scroll tracking */
  sections?: LessonSection[];
}

const SectionLoader = () => (
  <div className="flex items-center justify-center py-20">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
  </div>
);

export const ModuleLayout = ({ moduleId, children }: ModuleLayoutProps) => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const module = ACADEMY_CURRICULUM.find(m => m.id === moduleId);
  const {
    completedSections,
    markSectionComplete,
    markSectionIncomplete,
    toggleSection,
    getCompletionPercentage,
    recordModuleStart,
  } = useAcademyProgress(moduleId);

  const [activeLesson, setActiveLesson] = useState<string>(module?.lessons[0]?.anchor || '');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  // Record module start on mount
  useEffect(() => {
    recordModuleStart();
  }, [recordModuleStart]);

  // Scroll tracking — detect which section is active
  useEffect(() => {
    if (!module) return;

    const handleScroll = () => {
      const anchors = module.lessons
        .map(l => l.anchor)
        .filter(Boolean) as string[];

      for (let i = anchors.length - 1; i >= 0; i--) {
        const el = document.getElementById(anchors[i]);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= 120) {
            setActiveLesson(anchors[i]);
            return;
          }
        }
      }
      if (anchors.length > 0) setActiveLesson(anchors[0]);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [module]);

  const scrollToLesson = (anchor: string) => {
    const el = document.getElementById(anchor);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setActiveLesson(anchor);
      if (isMobile) setSidebarOpen(false);
    }
  };

  const handleMarkComplete = () => {
    if (activeLesson) {
      if (completedSections.includes(activeLesson)) {
        markSectionIncomplete(activeLesson);
      } else {
        markSectionComplete(activeLesson);
      }
    }
  };

  const goToNextLesson = () => {
    if (!module) return;
    const anchors = module.lessons.map(l => l.anchor).filter(Boolean) as string[];
    const idx = anchors.indexOf(activeLesson);
    if (idx < anchors.length - 1) {
      scrollToLesson(anchors[idx + 1]);
    }
  };

  const goToPrevLesson = () => {
    if (!module) return;
    const anchors = module.lessons.map(l => l.anchor).filter(Boolean) as string[];
    const idx = anchors.indexOf(activeLesson);
    if (idx > 0) {
      scrollToLesson(anchors[idx - 1]);
    }
  };

  // Find next module in curriculum
  const currentIndex = ACADEMY_CURRICULUM.findIndex(m => m.id === moduleId);
  const nextModule = currentIndex < ACADEMY_CURRICULUM.length - 1 ? ACADEMY_CURRICULUM[currentIndex + 1] : null;

  if (!module) return null;

  const completionPct = getCompletionPercentage(module.lessons.length);
  const isCurrentComplete = completedSections.includes(activeLesson);
  const activeLessonIdx = module.lessons.findIndex(l => l.anchor === activeLesson);
  const isLastLesson = activeLessonIdx === module.lessons.length - 1;
  const isFirstLesson = activeLessonIdx <= 0;

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Module header */}
      <div className="p-4 border-b border-border">
        <button
          onClick={() => navigate('/academy')}
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors mb-3"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Academy
        </button>
        <div className="flex items-center gap-2 mb-2">
          <module.icon className="w-5 h-5 text-primary shrink-0" />
          <h2 className="font-semibold text-sm text-foreground line-clamp-1">{module.title}</h2>
        </div>
        <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
          <span className="flex items-center gap-1">
            <BookOpen className="w-3 h-3" />
            {module.lessons.length} lessons
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {module.estimatedMinutes}m
          </span>
        </div>
        <Progress value={completionPct} className="h-1.5" />
        <p className="text-[10px] text-muted-foreground mt-1.5">{completionPct}% complete</p>
      </div>

      {/* Lesson list */}
      <div className="flex-1 overflow-y-auto py-2">
        <div className="px-2 space-y-0.5">
          {module.lessons.map((lesson, idx) => {
            const isActive = lesson.anchor === activeLesson;
            const isComplete = completedSections.includes(lesson.anchor || '');
            return (
              <button
                key={lesson.anchor || idx}
                onClick={() => lesson.anchor && scrollToLesson(lesson.anchor)}
                className={cn(
                  "w-full flex items-start gap-2.5 px-3 py-2.5 rounded-lg text-left transition-all text-sm",
                  isActive
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                {/* Status icon */}
                <span className="mt-0.5 shrink-0">
                  {isComplete ? (
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                  ) : (
                    <Circle className={cn("w-4 h-4", isActive ? "text-primary" : "text-muted-foreground/40")} />
                  )}
                </span>
                <span className="flex-1 leading-snug">
                  <span className="text-[10px] text-muted-foreground block mb-0.5">
                    Lesson {idx + 1}
                  </span>
                  {lesson.title}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Next module teaser */}
      {nextModule && completionPct === 100 && (
        <div className="p-4 border-t border-border">
          <p className="text-[10px] text-muted-foreground mb-2 uppercase tracking-wide font-medium">Next Module</p>
          <button
            onClick={() => navigate(nextModule.route)}
            className="w-full flex items-center gap-2 p-2.5 rounded-lg bg-primary/5 hover:bg-primary/10 transition-colors text-left"
          >
            <nextModule.icon className="w-4 h-4 text-primary shrink-0" />
            <span className="text-xs font-medium text-foreground line-clamp-1">{nextModule.title}</span>
            <ChevronRight className="w-3.5 h-3.5 text-muted-foreground ml-auto shrink-0" />
          </button>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-background flex">
      {/* Desktop sidebar */}
      {!isMobile && (
        <AnimatePresence>
          {!sidebarCollapsed ? (
            <motion.aside
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 280, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed top-0 left-0 h-screen z-40 bg-card border-r border-border overflow-hidden"
              style={{ width: 280 }}
            >
              <SidebarContent />
              <button
                onClick={() => setSidebarCollapsed(true)}
                className="absolute top-4 right-2 p-1 rounded-md hover:bg-muted transition-colors"
                title="Collapse sidebar"
              >
                <ChevronLeft className="w-4 h-4 text-muted-foreground" />
              </button>
            </motion.aside>
          ) : null}
        </AnimatePresence>
      )}

      {/* Collapsed sidebar toggle — desktop */}
      {!isMobile && sidebarCollapsed && (
        <button
          onClick={() => setSidebarCollapsed(false)}
          className="fixed top-4 left-4 z-40 flex items-center gap-2 px-3 py-2 rounded-lg bg-card border border-border shadow-sm hover:bg-muted transition-colors"
        >
          <Menu className="w-4 h-4 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">Lessons</span>
        </button>
      )}

      {/* Mobile sidebar — Sheet */}
      {isMobile && (
        <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
          <SheetContent side="left" className="w-[300px] p-0">
            <SidebarContent />
          </SheetContent>
        </Sheet>
      )}

      {/* Main content area */}
      <div
        className={cn(
          "flex-1 min-w-0 transition-all duration-200",
          !isMobile && !sidebarCollapsed ? "ml-[280px]" : ""
        )}
      >
        {/* Top bar — breadcrumbs + mobile menu */}
        <header className="sticky top-0 z-30 bg-background/95 backdrop-blur-sm border-b border-border px-4 h-12 flex items-center gap-3">
          {isMobile && (
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-1.5 rounded-md hover:bg-muted transition-colors"
            >
              <Menu className="w-5 h-5 text-muted-foreground" />
            </button>
          )}

          {/* Breadcrumbs */}
          <nav className="flex items-center gap-1.5 text-xs text-muted-foreground overflow-hidden">
            <button onClick={() => navigate('/academy')} className="hover:text-foreground transition-colors shrink-0">
              Academy
            </button>
            <ChevronRight className="w-3 h-3 shrink-0" />
            <span className="text-foreground font-medium truncate">{module.title}</span>
            {activeLesson && (
              <>
                <ChevronRight className="w-3 h-3 shrink-0" />
                <span className="truncate">
                  {module.lessons.find(l => l.anchor === activeLesson)?.title || ''}
                </span>
              </>
            )}
          </nav>

          {/* Progress pill */}
          <div className="ml-auto flex items-center gap-2 shrink-0">
            <span className="text-[10px] text-muted-foreground hidden sm:inline">
              {completedSections.length}/{module.lessons.length} done
            </span>
            <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden hidden sm:block">
              <div
                className="h-full bg-primary rounded-full transition-all duration-300"
                style={{ width: `${completionPct}%` }}
              />
            </div>
          </div>
        </header>

        {/* Page content */}
        <main ref={contentRef} className="pb-20">
          {children}
        </main>

        {/* Bottom floating bar — Mark Complete + Nav */}
        <div className="fixed bottom-0 left-0 right-0 z-30 bg-card/95 backdrop-blur-sm border-t border-border">
          <div
            className={cn(
              "flex items-center justify-between px-4 h-14 transition-all duration-200",
              !isMobile && !sidebarCollapsed ? "ml-[280px]" : ""
            )}
          >
            {/* Previous */}
            <Button
              variant="ghost"
              size="sm"
              onClick={goToPrevLesson}
              disabled={isFirstLesson}
              className="gap-1.5"
            >
              <ChevronLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Previous</span>
            </Button>

            {/* Mark complete */}
            <Button
              variant={isCurrentComplete ? "outline" : "default"}
              size="sm"
              onClick={handleMarkComplete}
              className="gap-1.5"
            >
              <CheckCircle2 className={cn("w-4 h-4", isCurrentComplete && "text-green-500")} />
              {isCurrentComplete ? "Completed" : "Mark Complete"}
            </Button>

            {/* Next */}
            {isLastLesson && nextModule ? (
              <Button
                size="sm"
                onClick={() => navigate(nextModule.route)}
                className="gap-1.5"
              >
                Next Module
                <ChevronRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                onClick={goToNextLesson}
                disabled={isLastLesson}
                className="gap-1.5"
              >
                <span className="hidden sm:inline">Next</span>
                <ChevronRight className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModuleLayout;
