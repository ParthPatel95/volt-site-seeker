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
  variant?: 'light' | 'dark';
}

const LearningObjectives = ({ 
  title = "In this section, you'll learn:",
  objectives, 
  prerequisites,
  estimatedTime,
  variant = 'light'
}: LearningObjectivesProps) => {
  const isDark = variant === 'dark';
  
  return (
    <div className={`rounded-xl p-6 mb-8 ${
      isDark 
        ? 'bg-white/10 border border-white/20 backdrop-blur-md' 
        : 'bg-gradient-to-r from-watt-blue/5 to-watt-bitcoin/5 border border-watt-blue/20'
    }`}>
      <div className="flex items-start gap-4">
        <div className={`p-2 rounded-lg shrink-0 ${isDark ? 'bg-watt-blue/20' : 'bg-watt-blue/10'}`}>
          <Target className="w-5 h-5 text-watt-blue" />
        </div>
        <div className="flex-1 space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <h4 className={`font-semibold ${isDark ? 'text-white' : 'text-watt-navy'}`}>{title}</h4>
            {estimatedTime && (
              <span className={`text-xs px-2 py-1 rounded-full ${
                isDark ? 'bg-white/10 text-white/70' : 'bg-watt-navy/10 text-watt-navy/70'
              }`}>
                ⏱️ {estimatedTime}
              </span>
            )}
          </div>
          
          <ul className="space-y-2">
            {objectives.map((objective, index) => (
              <li key={index} className={`flex items-start gap-2 text-sm ${isDark ? 'text-white/80' : 'text-watt-navy/80'}`}>
                <span className="text-watt-blue font-bold mt-0.5">✓</span>
                {objective}
              </li>
            ))}
          </ul>
          
          {prerequisites && prerequisites.length > 0 && (
            <div className={`pt-3 border-t ${isDark ? 'border-white/20' : 'border-watt-navy/10'}`}>
              <div className={`flex items-center gap-2 text-xs mb-2 ${isDark ? 'text-white/60' : 'text-watt-navy/60'}`}>
                <BookOpen className="w-3 h-3" />
                <span>Prerequisites:</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {prerequisites.map((prereq, index) => (
                  <Link 
                    key={index}
                    to={prereq.href}
                    className={`text-xs px-2 py-1 rounded transition-colors ${
                      isDark 
                        ? 'bg-white/10 hover:bg-white/20 text-white/70 hover:text-white' 
                        : 'bg-watt-navy/5 hover:bg-watt-navy/10 text-watt-navy/70 hover:text-watt-blue'
                    }`}
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
