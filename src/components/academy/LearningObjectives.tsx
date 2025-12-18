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
    <div className="bg-gradient-to-r from-watt-blue/5 to-watt-bitcoin/5 border border-watt-blue/20 rounded-xl p-6 mb-8">
      <div className="flex items-start gap-4">
        <div className="p-2 bg-watt-blue/10 rounded-lg shrink-0">
          <Target className="w-5 h-5 text-watt-blue" />
        </div>
        <div className="flex-1 space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <h4 className="font-semibold text-watt-navy">{title}</h4>
            {estimatedTime && (
              <span className="text-xs bg-watt-navy/10 text-watt-navy/70 px-2 py-1 rounded-full">
                ⏱️ {estimatedTime}
              </span>
            )}
          </div>
          
          <ul className="space-y-2">
            {objectives.map((objective, index) => (
              <li key={index} className="flex items-start gap-2 text-sm text-watt-navy/80">
                <span className="text-watt-blue font-bold mt-0.5">✓</span>
                {objective}
              </li>
            ))}
          </ul>
          
          {prerequisites && prerequisites.length > 0 && (
            <div className="pt-3 border-t border-watt-navy/10">
              <div className="flex items-center gap-2 text-xs text-watt-navy/60 mb-2">
                <BookOpen className="w-3 h-3" />
                <span>Prerequisites:</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {prerequisites.map((prereq, index) => (
                  <Link 
                    key={index}
                    to={prereq.href}
                    className="text-xs bg-watt-navy/5 hover:bg-watt-navy/10 text-watt-navy/70 hover:text-watt-blue px-2 py-1 rounded transition-colors"
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
