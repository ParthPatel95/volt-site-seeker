import React, { useState } from 'react';
import { CheckCircle2, XCircle, ChevronRight, Award, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { QuizQuestion } from '@/constants/quiz-data';
import { motion, AnimatePresence } from 'framer-motion';

interface KnowledgeCheckProps {
  title: string;
  questions: QuizQuestion[];
  onComplete?: (score: number, total: number) => void;
  className?: string;
}

export const KnowledgeCheck: React.FC<KnowledgeCheckProps> = ({
  title,
  questions,
  onComplete,
  className,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  const currentQuestion = questions[currentIndex];
  const isCorrect = selectedAnswer === currentQuestion?.correctIndex;

  const handleSelect = (index: number) => {
    if (showResult) return;
    setSelectedAnswer(index);
    setShowResult(true);
    if (index === currentQuestion.correctIndex) {
      setCorrectCount((prev) => prev + 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedAnswer(null);
      setShowResult(false);
    } else {
      setIsComplete(true);
      onComplete?.(correctCount + (isCorrect ? 0 : 0), questions.length);
    }
  };

  const handleReset = () => {
    setCurrentIndex(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setCorrectCount(0);
    setIsComplete(false);
  };

  const scorePercentage = Math.round((correctCount / questions.length) * 100);

  if (isComplete) {
    return (
      <div className={cn('bg-muted/30 rounded-xl p-6 border border-border', className)}>
        <div className="text-center space-y-4">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
          >
            <Award className={cn(
              'w-16 h-16 mx-auto',
              scorePercentage >= 80 ? 'text-green-500' : scorePercentage >= 50 ? 'text-yellow-500' : 'text-red-500'
            )} />
          </motion.div>
          
          <h3 className="text-xl font-semibold text-foreground">
            {scorePercentage >= 80 ? 'Excellent!' : scorePercentage >= 50 ? 'Good effort!' : 'Keep learning!'}
          </h3>
          
          <p className="text-muted-foreground">
            You scored <span className="font-bold text-foreground">{correctCount}</span> out of{' '}
            <span className="font-bold text-foreground">{questions.length}</span> ({scorePercentage}%)
          </p>
          
          <button
            onClick={handleReset}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white font-medium rounded-lg hover:bg-primary/90 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('bg-muted/30 rounded-xl p-6 border border-border', className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-primary" />
          {title}
        </h3>
        <span className="text-sm text-muted-foreground">
          {currentIndex + 1} of {questions.length}
        </span>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 bg-muted rounded-full mb-6 overflow-hidden">
        <motion.div
          className="h-full bg-primary"
          initial={{ width: 0 }}
          animate={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      {/* Question */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
        >
          <p className="text-foreground font-medium mb-4">{currentQuestion.question}</p>

          {/* Options */}
          <div className="space-y-2 mb-4">
            {currentQuestion.options.map((option, index) => {
              const isSelected = selectedAnswer === index;
              const isCorrectOption = index === currentQuestion.correctIndex;
              
              let optionClass = 'bg-background border-border text-foreground hover:border-primary/50 hover:bg-muted/30';
              if (showResult) {
                if (isCorrectOption) {
                  optionClass = 'bg-green-500/10 border-green-500 text-green-700 dark:text-green-300';
                } else if (isSelected && !isCorrectOption) {
                  optionClass = 'bg-red-500/10 border-red-500 text-red-700 dark:text-red-300';
                } else {
                  optionClass = 'bg-muted/50 border-border text-muted-foreground opacity-50';
                }
              } else if (isSelected) {
                optionClass = 'bg-primary/10 border-primary text-foreground';
              }

              return (
                <button
                  key={index}
                  onClick={() => handleSelect(index)}
                  onKeyDown={(e) => e.key === 'Enter' && !showResult && handleSelect(index)}
                  disabled={showResult}
                  className={cn(
                    'w-full text-left px-4 py-3 rounded-lg border transition-all flex items-center justify-between',
                    optionClass,
                    !showResult && 'cursor-pointer'
                  )}
                  role="radio"
                  aria-checked={isSelected}
                  aria-label={`Option ${index + 1}: ${option}`}
                >
                  <span>{option}</span>
                  {showResult && isCorrectOption && (
                    <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" aria-label="Correct answer" />
                  )}
                  {showResult && isSelected && !isCorrectOption && (
                    <XCircle className="w-5 h-5 text-red-500 flex-shrink-0" aria-label="Incorrect answer" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Explanation */}
          <AnimatePresence>
            {showResult && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className={cn(
                  'p-4 rounded-lg mb-4',
                  isCorrect ? 'bg-green-500/10 border border-green-500/30' : 'bg-amber-500/10 border border-amber-500/30'
                )}>
                  <p className="text-sm text-foreground">
                    <span className="font-semibold">{isCorrect ? '✓ Correct!' : '✗ Not quite.'}</span>{' '}
                    {currentQuestion.explanation}
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Next button */}
          {showResult && (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              onClick={handleNext}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
            >
              {currentIndex < questions.length - 1 ? (
                <>
                  Next Question
                  <ChevronRight className="w-4 h-4" />
                </>
              ) : (
                'See Results'
              )}
            </motion.button>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
