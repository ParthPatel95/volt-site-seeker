import { useState } from 'react';
import { Check, Star, HelpCircle } from 'lucide-react';
import { LucideIcon } from 'lucide-react';

interface DecisionOption {
  id: string;
  name: string;
  icon?: LucideIcon;
  description: string;
  bestFor: string;
  scores: {
    [criterion: string]: 1 | 2 | 3 | 4 | 5;
  };
  recommended?: boolean;
}

interface DecisionCardProps {
  title: string;
  question: string;
  criteria: string[];
  options: DecisionOption[];
  onSelect?: (optionId: string) => void;
}

export default function DecisionCard({ 
  title, 
  question, 
  criteria, 
  options,
  onSelect 
}: DecisionCardProps) {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showScores, setShowScores] = useState(false);

  const handleSelect = (optionId: string) => {
    setSelectedOption(optionId);
    onSelect?.(optionId);
  };

  const getScoreColor = (score: number) => {
    if (score >= 4) return 'text-green-500';
    if (score >= 3) return 'text-amber-500';
    return 'text-red-400';
  };

  const getTotalScore = (option: DecisionOption) => {
    return Object.values(option.scores).reduce((sum, score) => sum + score, 0);
  };

  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-border bg-muted/30">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-bold text-foreground">{title}</h3>
          <button
            onClick={() => setShowScores(!showScores)}
            className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
          >
            <HelpCircle className="w-4 h-4" />
            {showScores ? 'Hide scores' : 'Compare scores'}
          </button>
        </div>
        <p className="text-muted-foreground">{question}</p>
      </div>

      {/* Options Grid */}
      <div className="p-6">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {options.map((option) => {
            const isSelected = selectedOption === option.id;
            const Icon = option.icon;
            
            return (
              <button
                key={option.id}
                onClick={() => handleSelect(option.id)}
                className={`relative text-left p-5 rounded-xl border-2 transition-all ${
                  isSelected
                    ? 'border-primary bg-primary/5 shadow-lg'
                    : option.recommended
                    ? 'border-green-500/50 bg-green-500/5 hover:border-green-500'
                    : 'border-border hover:border-muted-foreground/50'
                }`}
              >
                {/* Recommended Badge */}
                {option.recommended && (
                  <span className="absolute -top-2 -right-2 px-2 py-0.5 bg-green-500 text-white text-xs font-bold rounded-full">
                    RECOMMENDED
                  </span>
                )}

                {/* Selection Check */}
                {isSelected && (
                  <span className="absolute top-3 right-3 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                    <Check className="w-4 h-4 text-primary-foreground" />
                  </span>
                )}

                <div className="flex items-center gap-3 mb-3">
                  {Icon && (
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      isSelected ? 'bg-primary/20' : 'bg-muted'
                    }`}>
                      <Icon className={`w-5 h-5 ${isSelected ? 'text-primary' : 'text-muted-foreground'}`} />
                    </div>
                  )}
                  <h4 className="font-semibold text-foreground">{option.name}</h4>
                </div>

                <p className="text-sm text-muted-foreground mb-3">{option.description}</p>

                <div className="p-2 bg-muted/50 rounded-lg">
                  <span className="text-xs text-muted-foreground">Best for: </span>
                  <span className="text-xs text-foreground">{option.bestFor}</span>
                </div>

                {/* Scores (when expanded) */}
                {showScores && (
                  <div className="mt-4 pt-4 border-t border-border space-y-2">
                    {criteria.map((criterion) => (
                      <div key={criterion} className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">{criterion}</span>
                        <div className="flex gap-0.5">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`w-3.5 h-3.5 ${
                                star <= option.scores[criterion]
                                  ? getScoreColor(option.scores[criterion])
                                  : 'text-muted/30'
                              }`}
                              fill={star <= option.scores[criterion] ? 'currentColor' : 'none'}
                            />
                          ))}
                        </div>
                      </div>
                    ))}
                    <div className="flex items-center justify-between pt-2 border-t border-border/50">
                      <span className="text-sm font-medium text-foreground">Total</span>
                      <span className={`text-sm font-bold ${getScoreColor(getTotalScore(option) / criteria.length)}`}>
                        {getTotalScore(option)}/{criteria.length * 5}
                      </span>
                    </div>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
