import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, RotateCcw, TreePine, LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface DecisionNode {
  id: string;
  question: string;
  icon?: LucideIcon;
  options: {
    label: string;
    description?: string;
    nextId?: string; // if undefined, this is a terminal node
    result?: {
      title: string;
      description: string;
      recommendation: string;
      confidence: 'high' | 'medium' | 'low';
    };
  }[];
}

interface DecisionTreeProps {
  title: string;
  subtitle?: string;
  nodes: DecisionNode[];
  className?: string;
}

export const DecisionTree: React.FC<DecisionTreeProps> = ({
  title,
  subtitle,
  nodes,
  className,
}) => {
  const [currentNodeId, setCurrentNodeId] = useState(nodes[0]?.id);
  const [history, setHistory] = useState<string[]>([]);
  const [result, setResult] = useState<{
    title: string;
    description: string;
    recommendation: string;
    confidence: 'high' | 'medium' | 'low';
  } | null>(null);

  const currentNode = nodes.find(n => n.id === currentNodeId);

  const handleSelect = (option: DecisionNode['options'][0]) => {
    if (option.result) {
      setResult(option.result);
    } else if (option.nextId) {
      setHistory(prev => [...prev, currentNodeId]);
      setCurrentNodeId(option.nextId);
    }
  };

  const handleReset = () => {
    setCurrentNodeId(nodes[0]?.id);
    setHistory([]);
    setResult(null);
  };

  const handleBack = () => {
    if (result) {
      setResult(null);
      return;
    }
    const prev = history[history.length - 1];
    if (prev) {
      setHistory(h => h.slice(0, -1));
      setCurrentNodeId(prev);
    }
  };

  const confidenceColors = {
    high: 'text-emerald-600 bg-emerald-500/10 border-emerald-500/30',
    medium: 'text-amber-600 bg-amber-500/10 border-amber-500/30',
    low: 'text-red-600 bg-red-500/10 border-red-500/30',
  };

  return (
    <div className={cn('bg-card rounded-xl border border-border p-6 md:p-8', className)}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
            <TreePine className="w-5 h-5 text-primary" />
            {title}
          </h3>
          {subtitle && <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>}
        </div>
        {(history.length > 0 || result) && (
          <button
            onClick={handleReset}
            className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Start Over
          </button>
        )}
      </div>

      {/* Progress indicator */}
      <div className="flex gap-1 mb-6">
        {nodes.map((_, i) => (
          <div
            key={i}
            className={cn(
              'h-1 rounded-full flex-1',
              i <= history.length ? 'bg-primary' : 'bg-muted'
            )}
          />
        ))}
      </div>

      <AnimatePresence mode="wait">
        {result ? (
          <motion.div
            key="result"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            <div className={cn('p-5 rounded-lg border', confidenceColors[result.confidence])}>
              <div className="text-xs font-medium uppercase tracking-wide mb-1">
                Recommendation ({result.confidence} confidence)
              </div>
              <h4 className="text-lg font-bold">{result.title}</h4>
              <p className="text-sm mt-2 opacity-80">{result.description}</p>
            </div>
            <div className="p-4 rounded-lg bg-muted/50 border border-border">
              <p className="text-sm text-foreground font-medium">💡 {result.recommendation}</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleBack}
                className="px-4 py-2 text-sm border border-border rounded-lg hover:bg-muted/50 transition-colors text-foreground"
              >
                Go Back
              </button>
              <button
                onClick={handleReset}
                className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
              >
                Try Different Answers
              </button>
            </div>
            <p className="text-xs text-muted-foreground italic">
              * This is an illustrative decision aid. Always consult with qualified professionals for your specific situation.
            </p>
          </motion.div>
        ) : currentNode ? (
          <motion.div
            key={currentNodeId}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            <p className="text-foreground font-medium text-lg">{currentNode.question}</p>
            <div className="space-y-2">
              {currentNode.options.map((option, i) => (
                <button
                  key={i}
                  onClick={() => handleSelect(option)}
                  className="w-full text-left p-4 rounded-lg border border-border bg-background hover:border-primary/50 hover:bg-muted/30 transition-all flex items-center justify-between group"
                >
                  <div>
                    <div className="font-medium text-foreground">{option.label}</div>
                    {option.description && (
                      <div className="text-sm text-muted-foreground mt-0.5">{option.description}</div>
                    )}
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
                </button>
              ))}
            </div>
            {history.length > 0 && (
              <button
                onClick={handleBack}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                ← Back
              </button>
            )}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
};

export default DecisionTree;
