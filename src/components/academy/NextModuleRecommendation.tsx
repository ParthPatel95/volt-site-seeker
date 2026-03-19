import { Link } from 'react-router-dom';
import { ACADEMY_CURRICULUM } from '@/constants/curriculum-data';
import { ArrowRight, BookOpen, Clock, GraduationCap } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface NextModuleRecommendationProps {
  moduleId: string;
}

const difficultyColor: Record<string, string> = {
  Beginner: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  Intermediate: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  Advanced: 'bg-red-500/20 text-red-400 border-red-500/30',
};

export const NextModuleRecommendation = ({ moduleId }: NextModuleRecommendationProps) => {
  const currentIndex = ACADEMY_CURRICULUM.findIndex(m => m.id === moduleId);
  if (currentIndex === -1) return null;

  const nextModule = ACADEMY_CURRICULUM[currentIndex + 1];
  const secondModule = ACADEMY_CURRICULUM[currentIndex + 2];

  return (
    <section className="py-16 bg-muted/30 border-t border-border">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 text-muted-foreground mb-2">
            <GraduationCap className="w-5 h-5" />
            <span className="text-sm font-medium uppercase tracking-wider">Continue Your Learning Path</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-foreground">
            {nextModule ? 'Recommended Next Module' : "You've Completed the Curriculum!"}
          </h2>
        </div>

        {nextModule ? (
          <div className="space-y-4">
            {/* Primary recommendation */}
            <Link
              to={nextModule.route}
              className="group block rounded-xl border border-border bg-card p-6 hover:border-primary/50 hover:shadow-lg transition-all duration-300"
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <nextModule.icon className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="text-xs text-muted-foreground font-medium">Up Next — Phase {nextModule.phase}</span>
                    <Badge variant="outline" className={difficultyColor[nextModule.difficulty]}>
                      {nextModule.difficulty}
                    </Badge>
                  </div>
                  <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                    {nextModule.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{nextModule.description}</p>
                  <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1"><Clock className="w-4 h-4" />{nextModule.estimatedMinutes} min</span>
                    <span className="flex items-center gap-1"><BookOpen className="w-4 h-4" />{nextModule.lessons.length} lessons</span>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all flex-shrink-0 mt-1" />
              </div>
            </Link>

            {/* Secondary suggestion */}
            {secondModule && (
              <Link
                to={secondModule.route}
                className="group block rounded-lg border border-border/50 bg-card/50 p-4 hover:border-border hover:bg-card transition-all duration-300"
              >
                <div className="flex items-center gap-3">
                  <secondModule.icon className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                  <div className="flex-1 min-w-0">
                    <span className="text-xs text-muted-foreground">Also recommended</span>
                    <h4 className="text-sm font-medium text-foreground group-hover:text-primary transition-colors truncate">
                      {secondModule.title}
                    </h4>
                  </div>
                  <Badge variant="outline" className="text-xs border-border text-muted-foreground">
                    {secondModule.estimatedMinutes} min
                  </Badge>
                </div>
              </Link>
            )}
          </div>
        ) : (
          /* Last module - link back to academy */
          <div className="text-center">
            <p className="text-muted-foreground mb-6">
              Congratulations on completing all modules! Review any section or explore the full curriculum.
            </p>
            <Link
              to="/academy"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
            >
              <BookOpen className="w-5 h-5" />
              Back to Academy
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}
      </div>
    </section>
  );
};
