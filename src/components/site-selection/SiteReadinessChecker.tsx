import { useState } from 'react';
import { CheckCircle2, AlertTriangle, ArrowRight, Target, Zap, DollarSign, Clock, Shield } from 'lucide-react';

interface Answer {
  text: string;
  score: number;
  recommendation: string;
}

interface Question {
  id: string;
  question: string;
  icon: typeof Target;
  answers: Answer[];
}

const SiteReadinessChecker = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [showResults, setShowResults] = useState(false);

  const questions: Question[] = [
    {
      id: 'capacity',
      question: 'What is your target MW capacity?',
      icon: Zap,
      answers: [
        { text: 'Small (< 10 MW)', score: 25, recommendation: 'Container-based or colocation' },
        { text: 'Medium (10-50 MW)', score: 50, recommendation: 'Brownfield or purpose-built' },
        { text: 'Large (50-100 MW)', score: 75, recommendation: 'Dedicated facility required' },
        { text: 'Very Large (100+ MW)', score: 100, recommendation: 'Greenfield development' }
      ]
    },
    {
      id: 'budget',
      question: 'What is your budget for site acquisition?',
      icon: DollarSign,
      answers: [
        { text: 'Under $500K', score: 20, recommendation: 'Lease or colocation' },
        { text: '$500K - $2M', score: 40, recommendation: 'Land lease + containers' },
        { text: '$2M - $10M', score: 70, recommendation: 'Land purchase + build' },
        { text: '$10M+', score: 100, recommendation: 'Greenfield development' }
      ]
    },
    {
      id: 'timeline',
      question: 'How quickly do you need to be operational?',
      icon: Clock,
      answers: [
        { text: 'ASAP (< 3 months)', score: 20, recommendation: 'Colocation only option' },
        { text: '3-6 months', score: 40, recommendation: 'Container + existing power' },
        { text: '6-12 months', score: 70, recommendation: 'Brownfield possible' },
        { text: '12+ months', score: 100, recommendation: 'All options available' }
      ]
    },
    {
      id: 'risk',
      question: 'What is your risk tolerance?',
      icon: Shield,
      answers: [
        { text: 'Very Low - Need proven sites', score: 25, recommendation: 'Colocation or turnkey' },
        { text: 'Moderate - Some development ok', score: 50, recommendation: 'Brownfield sites' },
        { text: 'High - Greenfield acceptable', score: 75, recommendation: 'Greenfield with DD' },
        { text: 'Very High - Frontier markets ok', score: 100, recommendation: 'International expansion' }
      ]
    }
  ];

  const handleAnswer = (questionId: string, score: number) => {
    const newAnswers = { ...answers, [questionId]: score };
    setAnswers(newAnswers);
    
    if (currentStep < questions.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setShowResults(true);
    }
  };

  const calculateReadiness = () => {
    const scores = Object.values(answers);
    if (scores.length === 0) return 0;
    return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
  };

  const getRecommendation = (score: number) => {
    if (score >= 80) {
      return {
        approach: 'Greenfield Development',
        description: 'You have the capacity, budget, timeline, and risk tolerance for greenfield site development. Focus on finding optimal power and regulatory conditions.',
        color: 'text-market-positive',
        bgColor: 'bg-market-positive/20'
      };
    }
    if (score >= 60) {
      return {
        approach: 'Brownfield Acquisition',
        description: 'Consider brownfield sites with existing infrastructure. Look for former industrial facilities, data centers, or sites with power already in place.',
        color: 'text-blue-500',
        bgColor: 'bg-blue-500/20'
      };
    }
    if (score >= 40) {
      return {
        approach: 'Container + Land Lease',
        description: 'A modular approach using containers on leased land with existing power infrastructure offers good balance of speed and cost.',
        color: 'text-secondary',
        bgColor: 'bg-secondary/20'
      };
    }
    return {
      approach: 'Colocation / Hosting',
      description: 'Given your parameters, colocation or hosting services provide the fastest, lowest-risk path to operation. Build capital for future expansion.',
      color: 'text-primary',
      bgColor: 'bg-primary/20'
    };
  };

  const resetChecker = () => {
    setCurrentStep(0);
    setAnswers({});
    setShowResults(false);
  };

  const readinessScore = calculateReadiness();
  const recommendation = getRecommendation(readinessScore);

  if (showResults) {
    return (
      <div className="bg-card rounded-2xl shadow-lg border border-border p-6">
        <h3 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
          <Target className="w-5 h-5 text-primary" />
          Your Site Readiness Assessment
        </h3>

        <div className="text-center mb-8">
          <div className={`inline-flex items-center justify-center w-32 h-32 rounded-full ${recommendation.bgColor} mb-4`}>
            <span className={`text-4xl font-bold ${recommendation.color}`}>{readinessScore}%</span>
          </div>
          <h4 className={`text-2xl font-bold ${recommendation.color} mb-2`}>
            {recommendation.approach}
          </h4>
          <p className="text-muted-foreground max-w-lg mx-auto">
            {recommendation.description}
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-4 mb-6">
          {questions.map((q) => {
            const selectedAnswer = q.answers.find(a => a.score === answers[q.id]);
            return (
              <div key={q.id} className="p-4 bg-muted rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <q.icon className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium text-foreground">{q.question}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">{selectedAnswer?.text}</span>
                  <CheckCircle2 className="w-4 h-4 text-market-positive" />
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex justify-center gap-4">
          <button
            onClick={resetChecker}
            className="px-6 py-3 bg-muted text-foreground rounded-xl font-medium hover:bg-muted/80 transition-colors"
          >
            Start Over
          </button>
          <a
            href="#power-infrastructure"
            className="px-6 py-3 bg-primary text-primary-foreground rounded-xl font-medium hover:bg-primary/90 transition-colors flex items-center gap-2"
          >
            Continue Learning <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentStep];

  return (
    <div className="bg-card rounded-2xl shadow-lg border border-border p-6">
      <h3 className="text-xl font-bold text-foreground mb-2 flex items-center gap-2">
        <Target className="w-5 h-5 text-primary" />
        Site Readiness Checker
      </h3>
      <p className="text-sm text-muted-foreground mb-6">
        Answer a few questions to get personalized site acquisition recommendations.
      </p>

      {/* Progress */}
      <div className="flex items-center gap-2 mb-6">
        {questions.map((_, idx) => (
          <div
            key={idx}
            className={`flex-1 h-2 rounded-full transition-colors ${
              idx < currentStep ? 'bg-market-positive' :
              idx === currentStep ? 'bg-primary' :
              'bg-muted'
            }`}
          />
        ))}
      </div>

      {/* Question */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center">
            <currentQuestion.icon className="w-5 h-5 text-primary" />
          </div>
          <div>
            <span className="text-xs text-primary font-medium">Question {currentStep + 1} of {questions.length}</span>
            <h4 className="text-lg font-semibold text-foreground">{currentQuestion.question}</h4>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {currentQuestion.answers.map((answer, idx) => (
            <button
              key={idx}
              onClick={() => handleAnswer(currentQuestion.id, answer.score)}
              className="p-4 border-2 border-border rounded-xl hover:border-primary hover:bg-primary/5 transition-all text-left group"
            >
              <div className="font-medium text-foreground group-hover:text-primary">
                {answer.text}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {answer.recommendation}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SiteReadinessChecker;
