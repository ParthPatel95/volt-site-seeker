import { useState, ReactNode } from 'react';
import { ChevronDown, GraduationCap, Wrench, FlaskConical } from 'lucide-react';

type DepthLevel = 'basic' | 'intermediate' | 'expert';

interface ProgressiveDisclosureProps {
  basicContent: ReactNode;
  intermediateContent?: ReactNode;
  expertContent?: ReactNode;
  defaultLevel?: DepthLevel;
  labels?: {
    basic?: string;
    intermediate?: string;
    expert?: string;
  };
}

const levelConfig = {
  basic: {
    icon: GraduationCap,
    label: 'Conceptual',
    description: 'Key concepts explained simply',
    color: 'bg-blue-500',
  },
  intermediate: {
    icon: Wrench,
    label: 'Practical',
    description: 'How to apply this in practice',
    color: 'bg-amber-500',
  },
  expert: {
    icon: FlaskConical,
    label: 'Technical',
    description: 'Engineering formulas & deep details',
    color: 'bg-purple-500',
  },
};

export default function ProgressiveDisclosure({
  basicContent,
  intermediateContent,
  expertContent,
  defaultLevel = 'basic',
  labels = {},
}: ProgressiveDisclosureProps) {
  const [currentLevel, setCurrentLevel] = useState<DepthLevel>(defaultLevel);

  const levels: DepthLevel[] = ['basic'];
  if (intermediateContent) levels.push('intermediate');
  if (expertContent) levels.push('expert');

  const getCurrentContent = () => {
    switch (currentLevel) {
      case 'expert':
        return expertContent || intermediateContent || basicContent;
      case 'intermediate':
        return intermediateContent || basicContent;
      default:
        return basicContent;
    }
  };

  if (levels.length === 1) {
    return <div>{basicContent}</div>;
  }

  return (
    <div className="space-y-4">
      {/* Level Selector */}
      <div className="flex flex-wrap gap-2">
        {levels.map((level) => {
          const config = levelConfig[level];
          const Icon = config.icon;
          const isActive = currentLevel === level;
          const customLabel = labels[level];

          return (
            <button
              key={level}
              onClick={() => setCurrentLevel(level)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? `${config.color} text-white shadow-lg`
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{customLabel || config.label}</span>
            </button>
          );
        })}
      </div>

      {/* Current Level Description */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span className={`w-2 h-2 rounded-full ${levelConfig[currentLevel].color}`} />
        {levelConfig[currentLevel].description}
      </div>

      {/* Content Area */}
      <div className="transition-all duration-300">
        {getCurrentContent()}
      </div>

      {/* Expand Prompt (only show if not at max level) */}
      {currentLevel !== levels[levels.length - 1] && (
        <button
          onClick={() => {
            const currentIndex = levels.indexOf(currentLevel);
            if (currentIndex < levels.length - 1) {
              setCurrentLevel(levels[currentIndex + 1]);
            }
          }}
          className="flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors group"
        >
          <ChevronDown className="w-4 h-4 group-hover:translate-y-0.5 transition-transform" />
          Show more technical detail
        </button>
      )}
    </div>
  );
}
