import { useNavigate } from "react-router-dom";
import { Clock, BookOpen, ArrowRight, CheckCircle2, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { DIFFICULTY_BADGES, type CurriculumModule } from "@/constants/curriculum-data";

// Gradient backgrounds for course thumbnails by category
const CATEGORY_GRADIENTS: Record<string, string> = {
  fundamentals: "from-amber-500/80 to-orange-600/80",
  operations: "from-blue-500/80 to-cyan-600/80",
  advanced: "from-violet-500/80 to-purple-600/80",
  masterclass: "from-emerald-500/80 to-teal-600/80",
};

const CATEGORY_LABELS: Record<string, string> = {
  fundamentals: "Fundamentals",
  operations: "Operations",
  advanced: "Advanced",
  masterclass: "Masterclass",
};

interface CourseCardProps {
  module: CurriculumModule;
  progress?: { percentage: number; isStarted: boolean; isComplete: boolean };
  index?: number;
}

export const CourseCard = ({ module, progress, index = 0 }: CourseCardProps) => {
  const navigate = useNavigate();
  const diffBadge = DIFFICULTY_BADGES[module.difficulty];
  const gradient = CATEGORY_GRADIENTS[module.category] || CATEGORY_GRADIENTS.fundamentals;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.3 }}
      className="group cursor-pointer rounded-xl border border-border bg-card overflow-hidden hover:shadow-lg hover:border-border/80 transition-all duration-200"
      onClick={() => navigate(module.route)}
    >
      {/* Thumbnail */}
      <div className={cn("relative h-40 bg-gradient-to-br flex items-center justify-center", gradient)}>
        <module.icon className="w-14 h-14 text-white/90" />
        
        {/* Category badge */}
        <span className="absolute top-3 left-3 px-2.5 py-1 rounded-md bg-black/30 backdrop-blur-sm text-white text-xs font-medium">
          {CATEGORY_LABELS[module.category]}
        </span>

        {/* Completion badge */}
        {progress?.isComplete && (
          <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 rounded-md bg-green-500/90 text-white text-xs font-medium">
            <CheckCircle2 className="w-3 h-3" />
            Completed
          </div>
        )}

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-200" />
      </div>

      {/* Content */}
      <div className="p-5">
        <h3 className="font-semibold text-foreground text-base mb-1.5 group-hover:text-primary transition-colors line-clamp-1">
          {module.title}
        </h3>
        <p className="text-sm text-muted-foreground mb-4 line-clamp-2 leading-relaxed">
          {module.description}
        </p>

        {/* Meta row */}
        <div className="flex items-center gap-3 text-xs text-muted-foreground mb-4">
          <span className={cn("px-2 py-0.5 rounded-full font-medium", diffBadge.bg, diffBadge.text)}>
            {module.difficulty}
          </span>
          <span className="flex items-center gap-1">
            <BookOpen className="w-3 h-3" />
            {module.lessons.length} lessons
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {module.estimatedMinutes}m
          </span>
        </div>

        {/* Progress bar or CTA */}
        {progress?.isStarted ? (
          <div className="space-y-2">
            <Progress 
              value={progress.percentage} 
              className="h-1.5"
            />
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">{progress.percentage}% complete</span>
              <Button variant="link" size="sm" className="h-auto p-0 text-xs gap-1">
                {progress.isComplete ? "Review" : "Continue"}
                <ArrowRight className="w-3 h-3" />
              </Button>
            </div>
          </div>
        ) : (
          <Button variant="outline" size="sm" className="w-full gap-1.5 group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary transition-colors">
            Start Course
            <ArrowRight className="w-3.5 h-3.5" />
          </Button>
        )}
      </div>
    </motion.div>
  );
};
