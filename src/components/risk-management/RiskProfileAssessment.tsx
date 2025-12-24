import { useState } from "react";
import { Shield, ChevronRight, RotateCcw, AlertTriangle, CheckCircle2, XCircle } from "lucide-react";
import { ScrollReveal } from "@/components/landing/ScrollAnimations";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { motion, AnimatePresence } from "framer-motion";

const questions = [
  {
    id: 1,
    question: "What is your current BTC break-even price?",
    options: [
      { value: 4, label: "Under $25,000", desc: "Highly efficient operation" },
      { value: 3, label: "$25,000 - $40,000", desc: "Competitive operation" },
      { value: 2, label: "$40,000 - $55,000", desc: "Average efficiency" },
      { value: 1, label: "Above $55,000", desc: "High-cost operation" },
    ]
  },
  {
    id: 2,
    question: "How many months of operating reserves do you maintain?",
    options: [
      { value: 4, label: "12+ months", desc: "Strong liquidity position" },
      { value: 3, label: "6-12 months", desc: "Adequate reserves" },
      { value: 2, label: "3-6 months", desc: "Limited runway" },
      { value: 1, label: "Less than 3 months", desc: "High liquidity risk" },
    ]
  },
  {
    id: 3,
    question: "What percentage of revenue depends on a single power source?",
    options: [
      { value: 4, label: "Under 25%", desc: "Well diversified" },
      { value: 3, label: "25% - 50%", desc: "Moderate concentration" },
      { value: 2, label: "50% - 75%", desc: "Significant dependency" },
      { value: 1, label: "Over 75%", desc: "High concentration risk" },
    ]
  },
  {
    id: 4,
    question: "Do you have documented crisis response plans?",
    options: [
      { value: 4, label: "Yes, tested regularly", desc: "Comprehensive preparedness" },
      { value: 3, label: "Yes, but not tested", desc: "Documented procedures" },
      { value: 2, label: "Informal plans only", desc: "Limited preparedness" },
      { value: 1, label: "No formal plans", desc: "Unprepared for crises" },
    ]
  },
  {
    id: 5,
    question: "What is your current debt-to-equity ratio?",
    options: [
      { value: 4, label: "Under 0.5x", desc: "Conservative leverage" },
      { value: 3, label: "0.5x - 1.0x", desc: "Moderate leverage" },
      { value: 2, label: "1.0x - 2.0x", desc: "High leverage" },
      { value: 1, label: "Over 2.0x", desc: "Excessive leverage" },
    ]
  }
];

const getProfileResult = (score: number) => {
  if (score >= 18) {
    return {
      level: "Low Risk",
      color: "text-watt-success",
      bg: "bg-watt-success/10",
      border: "border-watt-success/30",
      icon: CheckCircle2,
      description: "Your operation is well-positioned to survive market downturns. Continue monitoring key metrics and maintaining reserves.",
      recommendations: [
        "Consider opportunistic expansion during bear markets",
        "Evaluate acquiring distressed competitors",
        "Optimize efficiency further to increase margins"
      ]
    };
  } else if (score >= 14) {
    return {
      level: "Medium Risk",
      color: "text-yellow-500",
      bg: "bg-yellow-500/10",
      border: "border-yellow-500/30",
      icon: AlertTriangle,
      description: "Your operation has moderate risk exposure. Focus on improving weak areas before the next market downturn.",
      recommendations: [
        "Build operating reserves to 12+ months",
        "Reduce power source concentration",
        "Document and test crisis response plans"
      ]
    };
  } else if (score >= 10) {
    return {
      level: "High Risk",
      color: "text-orange-500",
      bg: "bg-orange-500/10",
      border: "border-orange-500/30",
      icon: AlertTriangle,
      description: "Your operation faces significant risk exposure. Immediate action is needed to improve resilience.",
      recommendations: [
        "Urgently reduce operating costs",
        "Deleverage balance sheet",
        "Secure backup power arrangements",
        "Build minimum 6-month cash reserves"
      ]
    };
  }
  return {
    level: "Critical Risk",
    color: "text-red-500",
    bg: "bg-red-500/10",
    border: "border-red-500/30",
    icon: XCircle,
    description: "Your operation is highly vulnerable to market downturns. Consider strategic alternatives including partnerships or exit.",
    recommendations: [
      "Immediately cut non-essential costs",
      "Explore strategic partnerships or sale",
      "Negotiate debt restructuring",
      "Consider hosting arrangements to reduce risk"
    ]
  };
};

export const RiskProfileAssessment = () => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [showResults, setShowResults] = useState(false);

  const handleAnswer = (value: string) => {
    setAnswers({ ...answers, [questions[currentQuestion].id]: parseInt(value) });
  };

  const nextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      setShowResults(true);
    }
  };

  const reset = () => {
    setCurrentQuestion(0);
    setAnswers({});
    setShowResults(false);
  };

  const totalScore = Object.values(answers).reduce((sum, val) => sum + val, 0);
  const result = getProfileResult(totalScore);
  const ResultIcon = result.icon;

  return (
    <ScrollReveal>
      <div className="bg-card border border-border rounded-2xl p-6 my-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-red-500/10 rounded-xl flex items-center justify-center">
            <Shield className="w-6 h-6 text-red-500" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-foreground">Risk Profile Assessment</h3>
            <p className="text-sm text-muted-foreground">Evaluate your operation's risk exposure in 2 minutes</p>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {!showResults ? (
            <motion.div
              key={currentQuestion}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {/* Progress */}
              <div className="mb-6">
                <div className="flex justify-between text-sm text-muted-foreground mb-2">
                  <span>Question {currentQuestion + 1} of {questions.length}</span>
                  <span>{Math.round(((currentQuestion + 1) / questions.length) * 100)}%</span>
                </div>
                <div className="h-2 bg-background rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-red-500 transition-all duration-300"
                    style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
                  />
                </div>
              </div>

              {/* Question */}
              <h4 className="text-lg font-semibold text-foreground mb-4">
                {questions[currentQuestion].question}
              </h4>

              <RadioGroup
                value={answers[questions[currentQuestion].id]?.toString()}
                onValueChange={handleAnswer}
                className="space-y-3"
              >
                {questions[currentQuestion].options.map((option) => (
                  <div key={option.value} className="flex items-center space-x-3">
                    <RadioGroupItem value={option.value.toString()} id={`q${currentQuestion}-${option.value}`} />
                    <Label 
                      htmlFor={`q${currentQuestion}-${option.value}`}
                      className="flex-1 cursor-pointer"
                    >
                      <div className="font-medium text-foreground">{option.label}</div>
                      <div className="text-sm text-muted-foreground">{option.desc}</div>
                    </Label>
                  </div>
                ))}
              </RadioGroup>

              <Button
                onClick={nextQuestion}
                disabled={!answers[questions[currentQuestion].id]}
                className="mt-6 bg-red-500 hover:bg-red-600"
              >
                {currentQuestion < questions.length - 1 ? "Next Question" : "See Results"}
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              {/* Results */}
              <div className={`${result.bg} ${result.border} border rounded-xl p-6 text-center mb-6`}>
                <ResultIcon className={`w-12 h-12 ${result.color} mx-auto mb-3`} />
                <div className="text-sm text-muted-foreground mb-1">Your Risk Profile</div>
                <div className={`text-3xl font-bold ${result.color} mb-2`}>{result.level}</div>
                <div className="text-sm text-foreground">Score: {totalScore} / 20</div>
              </div>

              <p className="text-muted-foreground mb-6">{result.description}</p>

              <div className="bg-background rounded-xl p-4 mb-6">
                <h5 className="font-semibold text-foreground mb-3">Recommendations</h5>
                <ul className="space-y-2">
                  {result.recommendations.map((rec, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <ChevronRight className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <Button onClick={reset} variant="outline" className="w-full">
                <RotateCcw className="w-4 h-4 mr-2" />
                Retake Assessment
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </ScrollReveal>
  );
};
