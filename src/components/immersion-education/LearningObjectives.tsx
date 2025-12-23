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
    <div className="rounded-xl p-6 mb-8 bg-gradient-to-r from-cyan-500/5 to-blue-500/5 border border-cyan-500/20">
      <div className="flex items-start gap-4">
        <div className="p-2 rounded-lg shrink-0 bg-cyan-500/10">
          <Target className="w-5 h-5 text-cyan-500" />
        </div>
        <div className="flex-1 space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <h4 className="font-semibold text-foreground">{title}</h4>
            {estimatedTime && (
              <span className="text-xs px-2 py-1 rounded-full bg-cyan-500/10 text-cyan-500">
                ⏱️ {estimatedTime}
              </span>
            )}
          </div>
          
          <ul className="space-y-2">
            {objectives.map((objective, index) => (
              <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                <span className="text-cyan-500 font-bold mt-0.5">✓</span>
                {objective}
              </li>
            ))}
          </ul>
          
          {prerequisites && prerequisites.length > 0 && (
            <div className="pt-3 border-t border-cyan-500/20">
              <div className="flex items-center gap-2 text-xs mb-2 text-muted-foreground">
                <BookOpen className="w-3 h-3" />
                <span>Prerequisites:</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {prerequisites.map((prereq, index) => (
                  <Link 
                    key={index}
                    to={prereq.href}
                    className="text-xs px-2 py-1 rounded transition-colors bg-cyan-500/10 hover:bg-cyan-500/20 text-muted-foreground hover:text-cyan-500"
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
