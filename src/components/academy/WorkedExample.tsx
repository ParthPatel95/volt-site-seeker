import React from 'react';
import { Calculator, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface WorkedExampleStep {
  /** Short label for the step (e.g. "Daily revenue"). */
  label: string;
  /** The math or substitution shown to the learner. */
  math: string;
  /** Optional short note explaining the step. */
  note?: string;
}

interface WorkedExampleProps {
  /** Title for the worked example, e.g. "Calculating Break-Even Power Cost". */
  title: string;
  /** Optional formula shown above the steps, e.g. "Profit = Revenue − Cost". */
  formula?: string;
  /** Ordered steps that walk through the calculation. */
  steps: WorkedExampleStep[];
  /** Final result string, e.g. "$0.062 / kWh". */
  result: string;
  /** Optional one-line takeaway shown after the result. */
  takeaway?: React.ReactNode;
  /** Use the dark variant on dark section backgrounds. */
  theme?: 'light' | 'dark';
  className?: string;
}

/**
 * WorkedExample
 * A boxed, scannable math walkthrough so learners can see the numbers
 * behind a result instead of just being told the answer.
 */
export const WorkedExample: React.FC<WorkedExampleProps> = ({
  title,
  formula,
  steps,
  result,
  takeaway,
  theme = 'light',
  className,
}) => {
  const isDark = theme === 'dark';
  return (
    <div
      className={cn(
        'rounded-2xl border p-6 my-6',
        isDark
          ? 'bg-white/5 border-white/10 text-white'
          : 'bg-card border-border text-foreground',
        className
      )}
    >
      <div className="flex items-center gap-2 mb-4">
        <div
          className={cn(
            'p-2 rounded-lg',
            isDark ? 'bg-[hsl(var(--watt-success)/0.15)]' : 'bg-primary/10'
          )}
        >
          <Calculator
            className={cn(
              'w-4 h-4',
              isDark ? 'text-[hsl(var(--watt-success))]' : 'text-primary'
            )}
          />
        </div>
        <div>
          <div
            className={cn(
              'text-xs font-semibold uppercase tracking-wide',
              isDark ? 'text-[hsl(var(--watt-success))]' : 'text-primary'
            )}
          >
            Worked Example
          </div>
          <h4 className={cn('text-lg font-bold', isDark ? 'text-white' : 'text-foreground')}>
            {title}
          </h4>
        </div>
      </div>

      {formula && (
        <div
          className={cn(
            'rounded-lg p-3 mb-4 font-mono text-sm',
            isDark ? 'bg-black/30 text-white/90' : 'bg-muted text-foreground'
          )}
        >
          {formula}
        </div>
      )}

      <ol className="space-y-3 mb-4">
        {steps.map((step, i) => (
          <li key={i} className="flex gap-3">
            <span
              className={cn(
                'flex-shrink-0 w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center',
                isDark
                  ? 'bg-[hsl(var(--watt-success)/0.2)] text-[hsl(var(--watt-success))]'
                  : 'bg-primary/10 text-primary'
              )}
            >
              {i + 1}
            </span>
            <div className="flex-1 min-w-0">
              <div
                className={cn(
                  'text-sm font-semibold',
                  isDark ? 'text-white' : 'text-foreground'
                )}
              >
                {step.label}
              </div>
              <div
                className={cn(
                  'mt-0.5 font-mono text-sm break-words',
                  isDark ? 'text-white/80' : 'text-muted-foreground'
                )}
              >
                {step.math}
              </div>
              {step.note && (
                <div
                  className={cn(
                    'mt-1 text-xs',
                    isDark ? 'text-white/50' : 'text-muted-foreground'
                  )}
                >
                  {step.note}
                </div>
              )}
            </div>
          </li>
        ))}
      </ol>

      <div
        className={cn(
          'flex items-center gap-2 rounded-lg p-3',
          isDark
            ? 'bg-[hsl(var(--watt-success)/0.12)] text-white'
            : 'bg-primary/10 text-foreground'
        )}
      >
        <ArrowRight
          className={cn(
            'w-4 h-4 flex-shrink-0',
            isDark ? 'text-[hsl(var(--watt-success))]' : 'text-primary'
          )}
        />
        <div className="text-sm">
          <span className="font-semibold">Result: </span>
          <span className="font-mono">{result}</span>
        </div>
      </div>

      {takeaway && (
        <p
          className={cn(
            'mt-3 text-sm leading-relaxed',
            isDark ? 'text-white/70' : 'text-muted-foreground'
          )}
        >
          <span className="font-semibold">Takeaway: </span>
          {takeaway}
        </p>
      )}
    </div>
  );
};

export default WorkedExample;
