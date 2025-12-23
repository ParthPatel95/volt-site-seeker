import { useState } from 'react';
import { CheckCircle, XCircle, AlertCircle, ArrowRight, RotateCcw, Waves } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface CheckItem {
  id: string;
  question: string;
  category: string;
  weight: number;
  options: { value: number; label: string }[];
}

const checkItems: CheckItem[] = [
  {
    id: 'current-cooling',
    question: 'What cooling method do you currently use?',
    category: 'Infrastructure',
    weight: 1,
    options: [
      { value: 2, label: 'Air-cooled, hitting thermal limits' },
      { value: 1, label: 'Air-cooled, working fine' },
      { value: 3, label: 'Already using hydro/immersion' },
      { value: 0, label: 'Not currently mining' }
    ]
  },
  {
    id: 'scale',
    question: 'What scale are you considering for immersion?',
    category: 'Scale',
    weight: 1.5,
    options: [
      { value: 1, label: '1-5 ASICs (home/hobbyist)' },
      { value: 2, label: '6-20 ASICs (small operation)' },
      { value: 3, label: '21-100 ASICs (commercial)' },
      { value: 2, label: '100+ ASICs (industrial)' }
    ]
  },
  {
    id: 'technical',
    question: 'What is your technical expertise level?',
    category: 'Team',
    weight: 1.5,
    options: [
      { value: 1, label: 'Basic - can follow instructions' },
      { value: 2, label: 'Intermediate - comfortable with hardware' },
      { value: 3, label: 'Advanced - engineering background' },
      { value: 3, label: 'Expert - prior immersion experience' }
    ]
  },
  {
    id: 'budget',
    question: 'What is your upfront budget for cooling infrastructure?',
    category: 'Budget',
    weight: 1,
    options: [
      { value: 0, label: 'Minimal (<$1,000)' },
      { value: 1, label: 'Moderate ($1,000-$10,000)' },
      { value: 2, label: 'Substantial ($10,000-$50,000)' },
      { value: 3, label: 'Enterprise ($50,000+)' }
    ]
  },
  {
    id: 'timeline',
    question: 'When do you need to deploy?',
    category: 'Timeline',
    weight: 0.5,
    options: [
      { value: 1, label: 'ASAP - within 1 month' },
      { value: 2, label: 'Soon - 1-3 months' },
      { value: 3, label: 'Planning - 3-6 months' },
      { value: 3, label: 'Future - 6+ months' }
    ]
  },
  {
    id: 'site',
    question: 'What are your site constraints?',
    category: 'Site',
    weight: 1,
    options: [
      { value: 1, label: 'Indoor residential (noise/heat concerns)' },
      { value: 2, label: 'Indoor commercial/industrial' },
      { value: 3, label: 'Outdoor with infrastructure' },
      { value: 2, label: 'Remote/off-grid' }
    ]
  }
];

const ImmersionReadinessChecker = () => {
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [showResult, setShowResult] = useState(false);

  const handleAnswer = (value: number) => {
    const newAnswers = { ...answers, [checkItems[currentQuestion].id]: value };
    setAnswers(newAnswers);

    if (currentQuestion < checkItems.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      setShowResult(true);
    }
  };

  const calculateScore = () => {
    let weightedScore = 0;
    let maxScore = 0;

    checkItems.forEach((item) => {
      const answer = answers[item.id] || 0;
      weightedScore += answer * item.weight;
      maxScore += 3 * item.weight;
    });

    return Math.round((weightedScore / maxScore) * 100);
  };

  const getReadinessLevel = (score: number) => {
    if (score >= 75) return { level: 'Ready', color: 'green', icon: CheckCircle };
    if (score >= 50) return { level: 'Moderate', color: 'amber', icon: AlertCircle };
    return { level: 'Not Ready', color: 'red', icon: XCircle };
  };

  const getRecommendation = (score: number) => {
    if (score >= 75) {
      return {
        title: 'Ready for Immersion',
        description: 'Your situation is well-suited for immersion cooling. Consider starting with a pilot tank to validate your setup before scaling.',
        suggestion: 'Recommended: Start with 5-10 ASIC single-phase tank',
        actions: [
          'Review fluid selection options',
          'Size your heat rejection needs',
          'Plan maintenance procedures'
        ]
      };
    }
    if (score >= 50) {
      return {
        title: 'Some Preparation Needed',
        description: 'Immersion cooling is feasible but you should address some gaps first. Consider building expertise or adjusting your timeline.',
        suggestion: 'Recommended: Start smaller or use turnkey container',
        actions: [
          'Gain hands-on experience with a single-ASIC tank',
          'Budget for professional consultation',
          'Allow more planning time'
        ]
      };
    }
    return {
      title: 'More Preparation Required',
      description: 'Immersion cooling may not be the best fit right now. Consider optimizing your current air-cooled setup or building capabilities first.',
      suggestion: 'Recommended: Optimize air cooling or wait',
      actions: [
        'Maximize current air-cooled efficiency',
        'Build technical expertise gradually',
        'Save for appropriate budget level'
      ]
    };
  };

  const reset = () => {
    setAnswers({});
    setCurrentQuestion(0);
    setShowResult(false);
  };

  const score = showResult ? calculateScore() : 0;
  const readiness = getReadinessLevel(score);
  const recommendation = getRecommendation(score);

  return (
    <Card className="border-cyan-500/20 bg-gradient-to-br from-cyan-500/5 to-blue-500/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Waves className="w-5 h-5 text-cyan-500" />
          Immersion Readiness Assessment
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!showResult ? (
          <>
            {/* Progress */}
            <div className="flex gap-1 mb-6">
              {checkItems.map((_, i) => (
                <div
                  key={i}
                  className={`h-1 flex-1 rounded-full transition-colors ${
                    i <= currentQuestion ? 'bg-cyan-500' : 'bg-muted'
                  }`}
                />
              ))}
            </div>

            {/* Current Question */}
            <div className="mb-6">
              <div className="text-xs text-cyan-500 font-medium mb-2">
                {checkItems[currentQuestion].category}
              </div>
              <h4 className="font-semibold text-foreground text-lg mb-4">
                {checkItems[currentQuestion].question}
              </h4>

              <div className="space-y-3">
                {checkItems[currentQuestion].options.map((option, i) => (
                  <button
                    key={i}
                    onClick={() => handleAnswer(option.value)}
                    className="w-full text-left p-4 rounded-xl border border-border bg-card hover:border-cyan-500/50 hover:bg-cyan-500/5 transition-all group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-foreground group-hover:text-cyan-500">
                        {option.label}
                      </span>
                      <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-cyan-500 group-hover:translate-x-1 transition-all" />
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="text-center text-sm text-muted-foreground">
              Question {currentQuestion + 1} of {checkItems.length}
            </div>
          </>
        ) : (
          <div className="space-y-6">
            {/* Score Circle */}
            <div className="flex justify-center">
              <div className={`relative w-32 h-32 rounded-full border-4 flex items-center justify-center ${
                readiness.color === 'green' ? 'border-green-500 bg-green-500/10' :
                readiness.color === 'amber' ? 'border-amber-500 bg-amber-500/10' :
                'border-red-500 bg-red-500/10'
              }`}>
                <div className="text-center">
                  <div className={`text-3xl font-bold ${
                    readiness.color === 'green' ? 'text-green-500' :
                    readiness.color === 'amber' ? 'text-amber-500' :
                    'text-red-500'
                  }`}>
                    {score}%
                  </div>
                  <div className="text-xs text-muted-foreground">Ready</div>
                </div>
              </div>
            </div>

            {/* Readiness Level */}
            <div className={`p-4 rounded-xl flex items-center gap-3 ${
              readiness.color === 'green' ? 'bg-green-500/10 border border-green-500/30' :
              readiness.color === 'amber' ? 'bg-amber-500/10 border border-amber-500/30' :
              'bg-red-500/10 border border-red-500/30'
            }`}>
              {(() => {
                const Icon = readiness.icon;
                return <Icon className={`w-6 h-6 ${
                  readiness.color === 'green' ? 'text-green-500' :
                  readiness.color === 'amber' ? 'text-amber-500' :
                  'text-red-500'
                }`} />;
              })()}
              <div>
                <div className={`font-semibold ${
                  readiness.color === 'green' ? 'text-green-500' :
                  readiness.color === 'amber' ? 'text-amber-500' :
                  'text-red-500'
                }`}>
                  {recommendation.title}
                </div>
                <div className="text-sm text-muted-foreground">
                  {recommendation.description}
                </div>
              </div>
            </div>

            {/* Suggestion */}
            <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-xl p-4">
              <div className="text-sm font-medium text-cyan-500 mb-2">
                {recommendation.suggestion}
              </div>
              <ul className="space-y-1">
                {recommendation.actions.map((action, i) => (
                  <li key={i} className="text-sm text-muted-foreground flex items-center gap-2">
                    <span className="text-cyan-500">→</span> {action}
                  </li>
                ))}
              </ul>
            </div>

            <Button onClick={reset} variant="outline" className="w-full gap-2">
              <RotateCcw className="w-4 h-4" />
              Take Assessment Again
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ImmersionReadinessChecker;
