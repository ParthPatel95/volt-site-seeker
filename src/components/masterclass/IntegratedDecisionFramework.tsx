import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, CheckCircle2, XCircle, AlertTriangle, ArrowLeft, RotateCcw, MapPin, ShieldAlert, TrendingUp, Zap, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface DecisionNode {
  id: string;
  question: string;
  context: string;
  track: 1 | 2 | 3 | 4 | 5;
  options: {
    label: string;
    value: string;
    next: string | null;
    impact: "positive" | "neutral" | "negative";
  }[];
}

const decisionTree: DecisionNode[] = [
  {
    id: "start",
    question: "What's your primary objective for this mining project?",
    context: "Understanding your goal helps determine the right approach across site selection, risk management, and scaling.",
    track: 1,
    options: [
      { label: "Launch first operation", value: "first", next: "power-access", impact: "neutral" },
      { label: "Expand existing capacity", value: "expand", next: "expansion-type", impact: "neutral" },
      { label: "Optimize current operations", value: "optimize", next: "optimize-focus", impact: "neutral" },
      { label: "Exit or sell operations", value: "exit", next: "exit-timeline", impact: "neutral" }
    ]
  },
  {
    id: "power-access",
    question: "Do you have access to sub-$0.04/kWh power?",
    context: "Power cost is the #1 determinant of mining profitability. Sites with power above $0.05/kWh struggle in bear markets.",
    track: 1,
    options: [
      { label: "Yes, confirmed access", value: "yes", next: "regulatory-check", impact: "positive" },
      { label: "In negotiation", value: "negotiating", next: "power-strategy", impact: "neutral" },
      { label: "No, still searching", value: "no", next: "power-strategy", impact: "negative" }
    ]
  },
  {
    id: "regulatory-check",
    question: "How is the regulatory environment in your target location?",
    context: "Regulatory risk can shut down operations entirely. This spans environmental permits, zoning, and utility regulations.",
    track: 2,
    options: [
      { label: "Mining-friendly jurisdiction", value: "friendly", next: "risk-tolerance", impact: "positive" },
      { label: "Neutral, no specific policies", value: "neutral", next: "risk-tolerance", impact: "neutral" },
      { label: "Uncertain or hostile", value: "hostile", next: "jurisdiction-reconsider", impact: "negative" }
    ]
  },
  {
    id: "risk-tolerance",
    question: "What's your risk tolerance for this project?",
    context: "This determines your approach to insurance, hedging, and operational redundancy.",
    track: 2,
    options: [
      { label: "Conservative - minimize all risk", value: "conservative", next: "funding-source", impact: "neutral" },
      { label: "Balanced - accept calculated risks", value: "balanced", next: "funding-source", impact: "positive" },
      { label: "Aggressive - maximize upside", value: "aggressive", next: "aggressive-warning", impact: "negative" }
    ]
  },
  {
    id: "funding-source",
    question: "How will you fund this project?",
    context: "Funding structure affects your flexibility, timeline, and long-term profitability.",
    track: 5,
    options: [
      { label: "Self-funded / bootstrapped", value: "self", next: "scale-recommendation", impact: "neutral" },
      { label: "Strategic partner", value: "partner", next: "partner-type", impact: "positive" },
      { label: "Debt financing", value: "debt", next: "debt-warning", impact: "neutral" },
      { label: "Equity raise", value: "equity", next: "scale-recommendation", impact: "neutral" }
    ]
  },
  {
    id: "scale-recommendation",
    question: "Based on your inputs, here's your recommended path:",
    context: "You're ready to proceed with a structured approach. Start with detailed site due diligence.",
    track: 4,
    options: [
      { label: "View detailed action plan", value: "plan", next: null, impact: "positive" },
      { label: "Start over", value: "restart", next: "start", impact: "neutral" }
    ]
  },
  {
    id: "power-strategy",
    question: "Which power strategy are you pursuing?",
    context: "Your power sourcing strategy determines site options and long-term economics.",
    track: 1,
    options: [
      { label: "Behind-the-meter renewables", value: "btm", next: "regulatory-check", impact: "positive" },
      { label: "Stranded gas / flare mitigation", value: "gas", next: "regulatory-check", impact: "positive" },
      { label: "Grid power with demand response", value: "grid", next: "regulatory-check", impact: "neutral" },
      { label: "Still evaluating options", value: "evaluating", next: "site-selection-needed", impact: "negative" }
    ]
  },
  {
    id: "expansion-type",
    question: "What type of expansion are you considering?",
    context: "Expansion strategy depends on your current operation's maturity and available capital.",
    track: 4,
    options: [
      { label: "Expand current site (brownfield)", value: "brownfield", next: "capacity-available", impact: "positive" },
      { label: "New site (greenfield)", value: "greenfield", next: "power-access", impact: "neutral" },
      { label: "Acquire existing operation", value: "acquire", next: "acquisition-target", impact: "neutral" }
    ]
  },
  {
    id: "jurisdiction-reconsider",
    question: "High regulatory risk detected. What's your approach?",
    context: "Operating in hostile jurisdictions requires significant risk mitigation or reconsideration.",
    track: 2,
    options: [
      { label: "Find alternative location", value: "relocate", next: "power-access", impact: "positive" },
      { label: "Proceed with risk mitigation", value: "mitigate", next: "risk-tolerance", impact: "neutral" },
      { label: "Exit this opportunity", value: "exit", next: "start", impact: "negative" }
    ]
  },
  {
    id: "aggressive-warning",
    question: "Aggressive approach carries significant risk. Confirm your strategy:",
    context: "Without proper risk management, aggressive strategies can lead to total capital loss.",
    track: 2,
    options: [
      { label: "Add basic risk controls", value: "add-controls", next: "funding-source", impact: "positive" },
      { label: "Proceed anyway", value: "proceed", next: "funding-source", impact: "negative" },
      { label: "Reconsider risk tolerance", value: "reconsider", next: "risk-tolerance", impact: "neutral" }
    ]
  },
  {
    id: "site-selection-needed",
    question: "You need to complete site selection first.",
    context: "Power access is foundational. Complete Track 1 (Site Selection) before proceeding.",
    track: 1,
    options: [
      { label: "Go to Site Selection content", value: "learn", next: null, impact: "positive" },
      { label: "Start over", value: "restart", next: "start", impact: "neutral" }
    ]
  },
  {
    id: "capacity-available",
    question: "Is additional power capacity available at your current site?",
    context: "Brownfield expansion is typically faster and cheaper if power is available.",
    track: 4,
    options: [
      { label: "Yes, can expand power", value: "yes", next: "risk-tolerance", impact: "positive" },
      { label: "No, maxed out", value: "no", next: "expansion-type", impact: "neutral" }
    ]
  },
  {
    id: "partner-type",
    question: "What type of strategic partner are you seeking?",
    context: "The right partner can provide capital, expertise, or operational support.",
    track: 5,
    options: [
      { label: "Capital partner (LP)", value: "capital", next: "scale-recommendation", impact: "positive" },
      { label: "Operational partner", value: "operational", next: "scale-recommendation", impact: "positive" },
      { label: "Technology partner", value: "tech", next: "scale-recommendation", impact: "neutral" }
    ]
  },
  {
    id: "debt-warning",
    question: "Debt financing in mining requires careful structuring.",
    context: "Revenue volatility makes debt service challenging. Ensure adequate cash reserves.",
    track: 5,
    options: [
      { label: "Understood, proceed carefully", value: "proceed", next: "scale-recommendation", impact: "neutral" },
      { label: "Consider equity instead", value: "equity", next: "funding-source", impact: "positive" }
    ]
  },
  {
    id: "acquisition-target",
    question: "What's the target's operational status?",
    context: "Acquisition due diligence varies significantly based on operational maturity.",
    track: 5,
    options: [
      { label: "Operating profitably", value: "profitable", next: "risk-tolerance", impact: "positive" },
      { label: "Operating but distressed", value: "distressed", next: "risk-tolerance", impact: "neutral" },
      { label: "Development stage", value: "development", next: "risk-tolerance", impact: "neutral" }
    ]
  },
  {
    id: "optimize-focus",
    question: "What's your optimization priority?",
    context: "Focus on highest-impact optimizations first.",
    track: 3,
    options: [
      { label: "Reduce operating costs", value: "costs", next: "scale-recommendation", impact: "positive" },
      { label: "Increase uptime / efficiency", value: "uptime", next: "scale-recommendation", impact: "positive" },
      { label: "Risk reduction", value: "risk", next: "risk-tolerance", impact: "neutral" }
    ]
  },
  {
    id: "exit-timeline",
    question: "What's your exit timeline?",
    context: "Exit strategy affects valuation and buyer pool.",
    track: 5,
    options: [
      { label: "Immediate (< 6 months)", value: "immediate", next: "scale-recommendation", impact: "negative" },
      { label: "Near-term (6-18 months)", value: "nearterm", next: "scale-recommendation", impact: "neutral" },
      { label: "Strategic (18+ months)", value: "strategic", next: "scale-recommendation", impact: "positive" }
    ]
  }
];

// Static color mappings for tracks
const trackInfo = {
  1: { icon: MapPin, label: "Site Selection", lightBg: "bg-purple-500/10", text: "text-purple-600" },
  2: { icon: ShieldAlert, label: "Risk Assessment", lightBg: "bg-orange-500/10", text: "text-orange-600" },
  3: { icon: Zap, label: "Execution", lightBg: "bg-blue-500/10", text: "text-blue-600" },
  4: { icon: TrendingUp, label: "Scaling", lightBg: "bg-green-500/10", text: "text-green-600" },
  5: { icon: DollarSign, label: "Capital", lightBg: "bg-pink-500/10", text: "text-pink-600" }
};

export const IntegratedDecisionFramework = () => {
  const [currentNodeId, setCurrentNodeId] = useState("start");
  const [history, setHistory] = useState<string[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const currentNode = decisionTree.find(n => n.id === currentNodeId);
  const track = currentNode ? trackInfo[currentNode.track] : null;

  const handleSelect = (option: typeof decisionTree[0]["options"][0]) => {
    setAnswers(prev => ({ ...prev, [currentNodeId]: option.value }));
    
    if (option.next === null) {
      return;
    }
    
    if (option.next === "start") {
      setHistory([]);
      setAnswers({});
      setCurrentNodeId("start");
      return;
    }
    
    setHistory(prev => [...prev, currentNodeId]);
    setCurrentNodeId(option.next);
  };

  const goBack = () => {
    if (history.length > 0) {
      const prevId = history[history.length - 1];
      setHistory(prev => prev.slice(0, -1));
      setCurrentNodeId(prevId);
    }
  };

  const restart = () => {
    setHistory([]);
    setAnswers({});
    setCurrentNodeId("start");
  };

  if (!currentNode) return null;

  const isComplete = currentNode.options.every(o => o.next === null || o.next === "start");

  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-lg">
      {/* Header */}
      <div className="bg-muted p-4 border-b border-border">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-foreground">Strategic Decision Framework</h3>
            <p className="text-sm text-muted-foreground">Interactive guide integrating site selection, risk, and scaling</p>
          </div>
          <div className="flex items-center gap-2">
            {history.length > 0 && (
              <Button variant="ghost" size="sm" onClick={goBack}>
                <ArrowLeft className="w-4 h-4 mr-1" />
                Back
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={restart}>
              <RotateCcw className="w-4 h-4 mr-1" />
              Restart
            </Button>
          </div>
        </div>
        
        {/* Progress Indicator */}
        <div className="flex items-center gap-2 mt-4">
          {[1, 2, 3, 4, 5].map((t) => {
            const info = trackInfo[t as keyof typeof trackInfo];
            const isActive = currentNode.track === t;
            const isPast = history.some(h => decisionTree.find(n => n.id === h)?.track === t);
            
            return (
              <div
                key={t}
                className={cn(
                  "flex items-center gap-1 px-2 py-1 rounded-full text-xs transition-colors",
                  isActive ? `${info.lightBg} ${info.text}` : 
                  isPast ? "bg-muted text-muted-foreground" : "text-muted-foreground"
                )}
              >
                <info.icon className="w-3 h-3" />
                <span className="hidden sm:inline">{info.label}</span>
                <span className="sm:hidden">{t}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Question Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentNodeId}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="p-6"
        >
          {/* Current Track Badge */}
          {track && (
            <div className={cn(
              "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm mb-4",
              track.lightBg, track.text
            )}>
              <track.icon className="w-4 h-4" />
              Track {currentNode.track}: {track.label}
            </div>
          )}

          <h4 className="text-xl font-bold text-foreground mb-2">{currentNode.question}</h4>
          <p className="text-muted-foreground mb-6">{currentNode.context}</p>

          {/* Options */}
          <div className="space-y-3">
            {currentNode.options.map((option) => (
              <motion.button
                key={option.value}
                onClick={() => handleSelect(option)}
                className={cn(
                  "w-full flex items-center justify-between p-4 rounded-xl border transition-all text-left",
                  "border-border hover:border-primary hover:bg-primary/5",
                  answers[currentNodeId] === option.value && "border-primary bg-primary/5"
                )}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
              >
                <div className="flex items-center gap-3">
                  {option.impact === "positive" && <CheckCircle2 className="w-5 h-5 text-green-500" />}
                  {option.impact === "negative" && <XCircle className="w-5 h-5 text-red-500" />}
                  {option.impact === "neutral" && <AlertTriangle className="w-5 h-5 text-yellow-500" />}
                  <span className="font-medium text-foreground">{option.label}</span>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              </motion.button>
            ))}
          </div>

          {/* Summary if complete */}
          {isComplete && Object.keys(answers).length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-8 p-6 bg-green-50 border border-green-200 rounded-xl"
            >
              <h5 className="font-bold text-foreground mb-4">Your Decision Path Summary</h5>
              <div className="space-y-2">
                {history.map((nodeId, index) => {
                  const node = decisionTree.find(n => n.id === nodeId);
                  const answer = answers[nodeId];
                  const selectedOption = node?.options.find(o => o.value === answer);
                  
                  return (
                    <div key={nodeId} className="flex items-start gap-2 text-sm">
                      <span className="text-muted-foreground">{index + 1}.</span>
                      <span className="text-foreground">{selectedOption?.label}</span>
                    </div>
                  );
                })}
              </div>
              <p className="mt-4 text-sm text-muted-foreground">
                Based on your selections, proceed through the masterclass tracks in order, 
                focusing on the areas highlighted by your decision path.
              </p>
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
