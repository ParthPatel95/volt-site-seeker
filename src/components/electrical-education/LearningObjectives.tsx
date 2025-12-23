import React, { useState } from 'react';
import { Target, ChevronDown, ChevronUp, CheckCircle2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface LearningObjectivesProps {
  objectives: string[];
  sectionTitle?: string;
  accentColor?: 'bitcoin' | 'success' | 'trust' | 'coinbase';
}

const colorClasses = {
  bitcoin: {
    bg: 'bg-watt-bitcoin/10',
    border: 'border-watt-bitcoin/30',
    icon: 'text-watt-bitcoin',
    check: 'text-watt-bitcoin',
  },
  success: {
    bg: 'bg-watt-success/10',
    border: 'border-watt-success/30',
    icon: 'text-watt-success',
    check: 'text-watt-success',
  },
  trust: {
    bg: 'bg-watt-trust/10',
    border: 'border-watt-trust/30',
    icon: 'text-watt-trust',
    check: 'text-watt-trust',
  },
  coinbase: {
    bg: 'bg-watt-coinbase/10',
    border: 'border-watt-coinbase/30',
    icon: 'text-watt-coinbase',
    check: 'text-watt-coinbase',
  },
};

export const LearningObjectives: React.FC<LearningObjectivesProps> = ({
  objectives,
  sectionTitle = "What You'll Learn",
  accentColor = 'bitcoin',
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const colors = colorClasses[accentColor];

  return (
    <Card className={`mb-8 ${colors.border} ${colors.bg} border shadow-sm`}>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-6 py-4 flex items-center justify-between text-left"
      >
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${colors.bg}`}>
            <Target className={`w-5 h-5 ${colors.icon}`} />
          </div>
          <div>
            <h4 className="font-semibold text-foreground">{sectionTitle}</h4>
            <p className="text-xs text-muted-foreground">{objectives.length} learning objectives</p>
          </div>
        </div>
        {isExpanded ? (
          <ChevronUp className="w-5 h-5 text-muted-foreground" />
        ) : (
          <ChevronDown className="w-5 h-5 text-muted-foreground" />
        )}
      </button>
      
      {isExpanded && (
        <CardContent className="pt-0 pb-4 px-6">
          <div className="space-y-2">
            {objectives.map((objective, index) => (
              <div 
                key={index} 
                className="flex items-start gap-3 p-2 rounded-lg bg-background/50"
              >
                <CheckCircle2 className={`w-4 h-4 mt-0.5 ${colors.check} shrink-0`} />
                <span className="text-sm text-foreground">{objective}</span>
              </div>
            ))}
          </div>
        </CardContent>
      )}
    </Card>
  );
};

export default LearningObjectives;
