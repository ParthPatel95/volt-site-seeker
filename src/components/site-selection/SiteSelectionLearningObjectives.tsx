import { Target, BookOpen, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Prerequisite {
  title: string;
  href: string;
}

interface SiteSelectionLearningObjectivesProps {
  title?: string;
  objectives: string[];
  prerequisites?: Prerequisite[];
  estimatedTime?: string;
  /**
   * Visual style for the card.
   * - light: solid card for light sections (default)
   * - dark: glass card for dark hero/overlays
   */
  variant?: 'light' | 'dark';
}

const SiteSelectionLearningObjectives = ({
  title = "In this section, you'll learn:",
  objectives,
  prerequisites,
  estimatedTime,
  variant = 'light',
}: SiteSelectionLearningObjectivesProps) => {
  const isDark = variant === 'dark';

  return (
    <div
      className={[
        'rounded-xl p-6 mb-8 border',
        isDark
          ? 'bg-card/70 border-border/50 backdrop-blur-md'
          : 'bg-card border-border shadow-sm',
      ].join(' ')}
    >
      <div className="flex items-start gap-4">
        <div className="p-2 rounded-lg shrink-0 bg-primary/10">
          <Target className="w-5 h-5 text-primary" />
        </div>
        <div className="flex-1 space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <h4 className="font-semibold text-foreground">{title}</h4>
            {estimatedTime && (
              <span className="text-xs px-2 py-1 rounded-full bg-muted text-muted-foreground flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {estimatedTime}
              </span>
            )}
          </div>

          <ul className="space-y-2">
            {objectives.map((objective, index) => (
              <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                <span className="text-primary font-bold mt-0.5">✓</span>
                {objective}
              </li>
            ))}
          </ul>

          {prerequisites && prerequisites.length > 0 && (
            <div className="pt-3 border-t border-border">
              <div className="flex items-center gap-2 text-xs mb-2 text-muted-foreground">
                <BookOpen className="w-3 h-3" />
                <span>Prerequisites:</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {prerequisites.map((prereq, index) => (
                  <Link
                    key={index}
                    to={prereq.href}
                    className="text-xs px-2 py-1 rounded transition-colors bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground"
                  >
                    {prereq.title} →
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SiteSelectionLearningObjectives;
