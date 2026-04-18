import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Award, Clock, CheckCircle2, XCircle, ChevronRight, RotateCcw, Trophy, AlertTriangle, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { QuizQuestion } from '@/constants/quiz-data';
import { useGamification } from '@/hooks/useGamification';
import { useAcademyAuth } from '@/contexts/AcademyAuthContext';
import { supabase } from '@/integrations/supabase/client';
import { ACADEMY_CURRICULUM } from '@/constants/curriculum-data';
import { toast } from 'sonner';

interface ModuleExamProps {
  title: string;
  moduleId: string;
  questions: QuizQuestion[];
  passingScore?: number; // percentage, default 70
  timeLimit?: number; // seconds, optional
  className?: string;
  onComplete?: (passed: boolean, score: number, total: number) => void;
}

export const ModuleExam: React.FC<ModuleExamProps> = ({
  title,
  moduleId,
  questions,
  passingScore = 70,
  timeLimit,
  className,
  onComplete,
}) => {
  const [started, setStarted] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(timeLimit || 0);
  const [answers, setAnswers] = useState<(number | null)[]>(new Array(questions.length).fill(null));
  const [certId, setCertId] = useState<string | null>(null);
  const [issuingCert, setIssuingCert] = useState(false);

  const { user, academyUser } = useAcademyAuth();
  const { awardXp } = useGamification();

  const currentQuestion = questions[currentIndex];
  const isCorrect = selectedAnswer === currentQuestion?.correctIndex;
  const scorePercentage = Math.round((correctCount / questions.length) * 100);
  const passed = scorePercentage >= passingScore;

  // Award XP + issue certificate when exam completes successfully
  useEffect(() => {
    if (!isComplete || !user || !passed || certId || issuingCert) return;
    setIssuingCert(true);
    (async () => {
      try {
        await awardXp('exam_pass', { module_id: moduleId, xp: 100 + scorePercentage });
        const moduleTitle = ACADEMY_CURRICULUM.find(m => m.id === moduleId)?.title || title;
        const recipientName = academyUser?.full_name || user.email || 'Academy Learner';
        const { data: existing } = await supabase
          .from('academy_certificates')
          .select('id')
          .eq('user_id', user.id)
          .eq('module_id', moduleId)
          .maybeSingle();
        if (existing?.id) {
          setCertId(existing.id);
        } else {
          const { data: inserted } = await supabase
            .from('academy_certificates')
            .insert({
              user_id: user.id,
              module_id: moduleId,
              module_title: moduleTitle,
              recipient_name: recipientName,
              exam_score: scorePercentage,
            })
            .select('id')
            .single();
          if (inserted?.id) {
            setCertId(inserted.id);
            toast.success('Certificate issued! 🎓', { description: `+${100 + scorePercentage} XP earned` });
          }
        }
      } catch (err) {
        console.error('Failed to issue certificate:', err);
      } finally {
        setIssuingCert(false);
      }
    })();
  }, [isComplete, passed, user, moduleId, certId, issuingCert, awardXp, academyUser, scorePercentage, title]);

  // Timer
  useEffect(() => {
    if (!started || !timeLimit || isComplete) return;
    if (timeRemaining <= 0) {
      setIsComplete(true);
      onComplete?.(passed, correctCount, questions.length);
      return;
    }
    const timer = setInterval(() => setTimeRemaining(t => t - 1), 1000);
    return () => clearInterval(timer);
  }, [started, timeLimit, timeRemaining, isComplete]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const handleSelect = (index: number) => {
    if (showResult) return;
    setSelectedAnswer(index);
    setShowResult(true);
    const newAnswers = [...answers];
    newAnswers[currentIndex] = index;
    setAnswers(newAnswers);
    if (index === currentQuestion.correctIndex) {
      setCorrectCount(prev => prev + 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setShowResult(false);
    } else {
      setIsComplete(true);
      const finalCorrect = correctCount;
      onComplete?.(finalCorrect / questions.length >= passingScore / 100, finalCorrect, questions.length);
    }
  };

  const handleReset = () => {
    setStarted(false);
    setCurrentIndex(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setCorrectCount(0);
    setIsComplete(false);
    setTimeRemaining(timeLimit || 0);
    setAnswers(new Array(questions.length).fill(null));
  };

  // Pre-start screen
  if (!started) {
    return (
      <div className={cn('bg-card rounded-xl border border-border p-8', className)}>
        <div className="text-center space-y-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10">
            <Trophy className="w-8 h-8 text-primary" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-foreground mb-2">Module Exam</h3>
            <p className="text-lg text-muted-foreground">{title}</p>
          </div>
          <div className="flex flex-wrap justify-center gap-6 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" />
              {questions.length} questions
            </span>
            <span className="flex items-center gap-1.5">
              <Award className="w-4 h-4" />
              {passingScore}% to pass
            </span>
            {timeLimit && (
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4" />
                {Math.floor(timeLimit / 60)} min time limit
              </span>
            )}
          </div>
          <button
            onClick={() => { setStarted(true); setTimeRemaining(timeLimit || 0); }}
            className="px-8 py-3 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 transition-colors"
          >
            Start Exam
          </button>
          <p className="text-xs text-muted-foreground">
            Test your knowledge across all sections of this module
          </p>
        </div>
      </div>
    );
  }

  // Complete screen
  if (isComplete) {
    return (
      <div className={cn('bg-card rounded-xl border border-border p-8', className)}>
        <div className="text-center space-y-6">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
          >
            {passed ? (
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-emerald-500/10">
                <Trophy className="w-10 h-10 text-emerald-500" />
              </div>
            ) : (
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-amber-500/10">
                <AlertTriangle className="w-10 h-10 text-amber-500" />
              </div>
            )}
          </motion.div>

          <div>
            <h3 className="text-2xl font-bold text-foreground">
              {passed ? 'Congratulations! 🎉' : 'Keep Studying'}
            </h3>
            <p className="text-muted-foreground mt-2">
              {passed
                ? 'You passed the module exam!'
                : `You need ${passingScore}% to pass. Review the material and try again.`}
            </p>
          </div>

          <div className="inline-flex items-center justify-center w-32 h-32 rounded-full border-4 border-border">
            <div className="text-center">
              <div className={cn('text-3xl font-bold', passed ? 'text-emerald-500' : 'text-amber-500')}>
                {scorePercentage}%
              </div>
              <div className="text-xs text-muted-foreground">
                {correctCount}/{questions.length}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-3">
            <button
              onClick={handleReset}
              className="inline-flex items-center gap-2 px-6 py-3 border border-border rounded-lg hover:bg-muted/50 transition-colors text-foreground"
            >
              <RotateCcw className="w-4 h-4" />
              Retake Exam
            </button>
            {passed && certId && (
              <Link
                to={`/verify/${certId}`}
                className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
              >
                <Award className="w-4 h-4" />
                View Certificate
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Question screen
  return (
    <div className={cn('bg-card rounded-xl border border-border p-6', className)}>
      {/* Header with timer */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <Trophy className="w-5 h-5 text-primary" />
            Module Exam
          </h3>
          <p className="text-sm text-muted-foreground">{title}</p>
        </div>
        <div className="flex items-center gap-4 text-sm">
          {timeLimit && (
            <span className={cn(
              'flex items-center gap-1 font-mono',
              timeRemaining < 60 ? 'text-red-500' : 'text-muted-foreground'
            )}>
              <Clock className="w-4 h-4" />
              {formatTime(timeRemaining)}
            </span>
          )}
          <span className="text-muted-foreground">
            {currentIndex + 1} / {questions.length}
          </span>
        </div>
      </div>

      {/* Progress dots */}
      <div className="flex gap-1 mb-6 flex-wrap">
        {questions.map((_, i) => (
          <div
            key={i}
            className={cn(
              'h-1.5 rounded-full transition-all flex-1 min-w-[8px] max-w-[20px]',
              i < currentIndex ? (answers[i] === questions[i].correctIndex ? 'bg-emerald-500' : 'bg-red-400') :
              i === currentIndex ? 'bg-primary' : 'bg-muted'
            )}
          />
        ))}
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

          <div className="space-y-2 mb-4">
            {currentQuestion.options.map((option, index) => {
              const isSelected = selectedAnswer === index;
              const isCorrectOption = index === currentQuestion.correctIndex;

              let optionClass = 'bg-background border-border text-foreground hover:border-primary/50 hover:bg-muted/30';
              if (showResult) {
                if (isCorrectOption) {
                  optionClass = 'bg-emerald-500/10 border-emerald-500 text-emerald-700 dark:text-emerald-300';
                } else if (isSelected && !isCorrectOption) {
                  optionClass = 'bg-red-500/10 border-red-500 text-red-700 dark:text-red-300';
                } else {
                  optionClass = 'bg-muted/50 border-border text-muted-foreground opacity-50';
                }
              }

              return (
                <button
                  key={index}
                  onClick={() => handleSelect(index)}
                  disabled={showResult}
                  className={cn(
                    'w-full text-left px-4 py-3 rounded-lg border transition-all flex items-center justify-between',
                    optionClass,
                    !showResult && 'cursor-pointer'
                  )}
                >
                  <span>{option}</span>
                  {showResult && isCorrectOption && <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />}
                  {showResult && isSelected && !isCorrectOption && <XCircle className="w-5 h-5 text-red-500 flex-shrink-0" />}
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
                  isCorrect ? 'bg-emerald-500/10 border border-emerald-500/30' : 'bg-amber-500/10 border border-amber-500/30'
                )}>
                  <p className="text-sm text-foreground">
                    <span className="font-semibold">{isCorrect ? '✓ Correct!' : '✗ Not quite.'}</span>{' '}
                    {currentQuestion.explanation}
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {showResult && (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              onClick={handleNext}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
            >
              {currentIndex < questions.length - 1 ? (
                <>Next Question <ChevronRight className="w-4 h-4" /></>
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

export default ModuleExam;
