import { Target, BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Prerequisite {
  title: string;
  href: string;
}

interface LearningObjectivesProps {
  title?: string;
  objectives: string[];
  prerequisites?: Prerequisite[];
  estimatedTime?: string;
}

const LearningObjectives = ({ 
  title = "In this section, you'll learn:",
  objectives, 
  prerequisites,
  estimatedTime
}: LearningObjectivesProps) => {
  return (
    <div className="rounded-xl p-6 mb-8 bg-gradient-to-r from-primary/5 to-accent/5 border border-primary/20">
      <div className="flex items-start gap-4">
        <div className="p-2 rounded-lg shrink-0 bg-primary/10">
          <Target className="w-5 h-5 text-primary" />
        </div>
        <div className="flex-1 space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <h4 className="font-semibold text-foreground">{title}</h4>
            {estimatedTime && (
              <span className="text-xs px-2 py-1 rounded-full bg-muted text-muted-foreground">
                ⏱️ {estimatedTime}
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
                    className="text-xs px-2 py-1 rounded transition-colors bg-muted hover:bg-muted/80 text-muted-foreground hover:text-primary"
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

export default LearningObjectives;
