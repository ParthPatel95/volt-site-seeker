import { Target, BookOpen, Clock } from 'lucide-react';
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
        : 'bg-gradient-to-r from-[hsl(var(--watt-blue)/0.05)] to-[hsl(var(--watt-bitcoin)/0.05)] border border-[hsl(var(--watt-blue)/0.2)]'
    }`}>
      <div className="flex items-start gap-4">
        <div className={`p-2 rounded-lg shrink-0 ${isDark ? 'bg-[hsl(var(--watt-blue)/0.2)]' : 'bg-[hsl(var(--watt-blue)/0.1)]'}`}>
          <Target className="w-5 h-5 text-[hsl(var(--watt-blue))]" />
        </div>
        <div className="flex-1 space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <h4 className={`font-semibold ${isDark ? 'text-white' : 'text-[hsl(var(--watt-navy))]'}`}>{title}</h4>
            {estimatedTime && (
              <span className={`text-xs px-2 py-1 rounded-full flex items-center gap-1 ${
                isDark ? 'bg-white/10 text-white/70' : 'bg-[hsl(var(--watt-navy)/0.1)] text-[hsl(var(--watt-navy)/0.7)]'
              }`}>
                <Clock className="w-3 h-3" />
                {estimatedTime}
              </span>
            )}
          </div>
          
          <ul className="space-y-2">
            {objectives.map((objective, index) => (
              <li key={index} className={`flex items-start gap-2 text-sm ${isDark ? 'text-white/80' : 'text-[hsl(var(--watt-navy)/0.8)]'}`}>
                <span className="text-[hsl(var(--watt-blue))] font-bold mt-0.5">✓</span>
                {objective}
              </li>
            ))}
          </ul>
          
          {prerequisites && prerequisites.length > 0 && (
            <div className={`pt-3 border-t ${isDark ? 'border-white/20' : 'border-[hsl(var(--watt-navy)/0.1)]'}`}>
              <div className={`flex items-center gap-2 text-xs mb-2 ${isDark ? 'text-white/60' : 'text-[hsl(var(--watt-navy)/0.6)]'}`}>
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
                        : 'bg-[hsl(var(--watt-navy)/0.05)] hover:bg-[hsl(var(--watt-navy)/0.1)] text-[hsl(var(--watt-navy)/0.7)] hover:text-[hsl(var(--watt-blue))]'
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
