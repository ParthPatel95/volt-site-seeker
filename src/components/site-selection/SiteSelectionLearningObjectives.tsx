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
}

const SiteSelectionLearningObjectives = ({ 
  title = "In this section, you'll learn:",
  objectives, 
  prerequisites,
  estimatedTime
}: SiteSelectionLearningObjectivesProps) => {
  return (
    <div className="rounded-xl p-6 mb-8 bg-white/10 border border-white/20 backdrop-blur-md">
      <div className="flex items-start gap-4">
        <div className="p-2 rounded-lg shrink-0 bg-watt-purple/20">
          <Target className="w-5 h-5 text-watt-purple" />
        </div>
        <div className="flex-1 space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <h4 className="font-semibold text-white">{title}</h4>
            {estimatedTime && (
              <span className="text-xs px-2 py-1 rounded-full bg-white/10 text-white/70 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {estimatedTime}
              </span>
            )}
          </div>
          
          <ul className="space-y-2">
            {objectives.map((objective, index) => (
              <li key={index} className="flex items-start gap-2 text-sm text-white/80">
                <span className="text-watt-success font-bold mt-0.5">✓</span>
                {objective}
              </li>
            ))}
          </ul>
          
          {prerequisites && prerequisites.length > 0 && (
            <div className="pt-3 border-t border-white/20">
              <div className="flex items-center gap-2 text-xs mb-2 text-white/60">
                <BookOpen className="w-3 h-3" />
                <span>Prerequisites:</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {prerequisites.map((prereq, index) => (
                  <Link 
                    key={index}
                    to={prereq.href}
                    className="text-xs px-2 py-1 rounded transition-colors bg-white/10 hover:bg-white/20 text-white/70 hover:text-white"
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
