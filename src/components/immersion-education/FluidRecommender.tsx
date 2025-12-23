import { useState } from 'react';
import { Droplets, DollarSign, Shield, Leaf, Wrench, ArrowRight, RotateCcw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface Question {
  id: string;
  question: string;
  icon: React.ElementType;
  options: { value: string; label: string; description: string }[];
}

const questions: Question[] = [
  {
    id: 'budget',
    question: 'What is your fluid budget level?',
    icon: DollarSign,
    options: [
      { value: 'low', label: 'Budget-Focused', description: 'Minimize upfront fluid cost' },
      { value: 'medium', label: 'Balanced', description: 'Moderate cost for better safety' },
      { value: 'high', label: 'Premium', description: 'Best performance regardless of cost' }
    ]
  },
  {
    id: 'safety',
    question: 'What are your fire safety requirements?',
    icon: Shield,
    options: [
      { value: 'standard', label: 'Standard', description: 'Basic fire prevention measures' },
      { value: 'enhanced', label: 'Enhanced', description: 'Higher flash point preferred' },
      { value: 'strict', label: 'Non-Flammable Required', description: 'Fire codes mandate non-flammable' }
    ]
  },
  {
    id: 'environmental',
    question: 'Environmental regulations at your site?',
    icon: Leaf,
    options: [
      { value: 'none', label: 'None Specific', description: 'No GWP restrictions' },
      { value: 'moderate', label: 'Some Restrictions', description: 'Prefer low-GWP options' },
      { value: 'strict', label: 'Strict GWP Limits', description: 'Must minimize environmental impact' }
    ]
  },
  {
    id: 'maintenance',
    question: 'Maintenance capability level?',
    icon: Wrench,
    options: [
      { value: 'basic', label: 'Basic', description: 'Limited technical staff' },
      { value: 'intermediate', label: 'Intermediate', description: 'Some specialized training' },
      { value: 'advanced', label: 'Advanced', description: 'Full engineering team' }
    ]
  }
];

const fluidRecommendations = {
  mineral: {
    name: 'Mineral Oil',
    examples: ['White Mineral Oil', 'Transformer Oil'],
    priceRange: '$2-5/L',
    pros: ['Very affordable', 'Easy to source', 'Good thermal properties'],
    cons: ['Flammable (flash point ~150°C)', 'Messy extraction', 'Degrades over time'],
    color: 'amber'
  },
  synthetic: {
    name: 'Synthetic Oil',
    examples: ['BitCool', 'Shell Diala S4'],
    priceRange: '$8-18/L',
    pros: ['High flash point (250°C+)', 'Long lifespan', 'Cleaner operation'],
    cons: ['Higher cost', 'Limited suppliers', 'Still requires cleanup'],
    color: 'cyan'
  },
  fluorocarbon: {
    name: 'Fluorocarbons',
    examples: ['3M Novec 7100', 'Fluorinert FC-72'],
    priceRange: '$100-300/L',
    pros: ['Non-flammable', 'Two-phase capable', 'Clean evaporation'],
    cons: ['Extremely expensive', 'High GWP concerns', 'Requires sealed systems'],
    color: 'purple'
  }
};

const FluidRecommender = () => {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [showResult, setShowResult] = useState(false);

  const handleAnswer = (value: string) => {
    const newAnswers = { ...answers, [questions[currentQuestion].id]: value };
    setAnswers(newAnswers);

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      setShowResult(true);
    }
  };

  const getRecommendation = () => {
    const { budget, safety, environmental, maintenance } = answers;

    // Decision logic
    if (safety === 'strict' || (budget === 'high' && maintenance === 'advanced')) {
      return 'fluorocarbon';
    }
    if (budget === 'low' && safety === 'standard' && environmental !== 'strict') {
      return 'mineral';
    }
    return 'synthetic';
  };

  const reset = () => {
    setAnswers({});
    setCurrentQuestion(0);
    setShowResult(false);
  };

  const recommendation = showResult ? fluidRecommendations[getRecommendation() as keyof typeof fluidRecommendations] : null;

  return (
    <Card className="border-cyan-500/20 bg-gradient-to-br from-cyan-500/5 to-blue-500/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Droplets className="w-5 h-5 text-cyan-500" />
          Fluid Selection Recommender
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!showResult ? (
          <>
            {/* Progress */}
            <div className="flex gap-1 mb-6">
              {questions.map((_, i) => (
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
              <div className="flex items-center gap-3 mb-4">
                {(() => {
                  const Icon = questions[currentQuestion].icon;
                  return <Icon className="w-6 h-6 text-cyan-500" />;
                })()}
                <h4 className="font-semibold text-foreground">
                  {questions[currentQuestion].question}
                </h4>
              </div>

              <div className="space-y-3">
                {questions[currentQuestion].options.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleAnswer(option.value)}
                    className="w-full text-left p-4 rounded-xl border border-border bg-card hover:border-cyan-500/50 hover:bg-cyan-500/5 transition-all group"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-foreground group-hover:text-cyan-500">
                          {option.label}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {option.description}
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-cyan-500 group-hover:translate-x-1 transition-all" />
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="text-center text-sm text-muted-foreground">
              Question {currentQuestion + 1} of {questions.length}
            </div>
          </>
        ) : recommendation && (
          <div className="space-y-6">
            {/* Recommendation */}
            <div className={`p-6 rounded-xl border-2 ${
              recommendation.color === 'amber' ? 'border-amber-500 bg-amber-500/10' :
              recommendation.color === 'cyan' ? 'border-cyan-500 bg-cyan-500/10' :
              'border-purple-500 bg-purple-500/10'
            }`}>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Recommended Fluid Type</div>
                  <h3 className={`text-2xl font-bold ${
                    recommendation.color === 'amber' ? 'text-amber-500' :
                    recommendation.color === 'cyan' ? 'text-cyan-500' :
                    'text-purple-500'
                  }`}>
                    {recommendation.name}
                  </h3>
                </div>
                <div className={`text-xl font-mono font-bold ${
                  recommendation.color === 'amber' ? 'text-amber-500' :
                  recommendation.color === 'cyan' ? 'text-cyan-500' :
                  'text-purple-500'
                }`}>
                  {recommendation.priceRange}
                </div>
              </div>

              <div className="text-sm text-muted-foreground mb-3">
                <span className="text-foreground font-medium">Examples:</span> {recommendation.examples.join(', ')}
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-green-500/10 rounded-lg p-3">
                  <div className="text-xs text-green-500 font-medium mb-2">Advantages</div>
                  <ul className="space-y-1">
                    {recommendation.pros.map((pro, i) => (
                      <li key={i} className="text-sm text-muted-foreground flex items-center gap-2">
                        <span className="text-green-500">✓</span> {pro}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="bg-red-500/10 rounded-lg p-3">
                  <div className="text-xs text-red-500 font-medium mb-2">Considerations</div>
                  <ul className="space-y-1">
                    {recommendation.cons.map((con, i) => (
                      <li key={i} className="text-sm text-muted-foreground flex items-center gap-2">
                        <span className="text-red-500">!</span> {con}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Your Answers Summary */}
            <div className="bg-card border border-border rounded-xl p-4">
              <div className="text-sm font-medium text-foreground mb-3">Based on your inputs:</div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                {Object.entries(answers).map(([key, value]) => (
                  <div key={key} className="flex justify-between">
                    <span className="text-muted-foreground capitalize">{key}:</span>
                    <span className="text-foreground capitalize">{value}</span>
                  </div>
                ))}
              </div>
            </div>

            <Button onClick={reset} variant="outline" className="w-full gap-2">
              <RotateCcw className="w-4 h-4" />
              Start Over
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default FluidRecommender;
