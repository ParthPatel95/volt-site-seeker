import React from 'react';
import { Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PlainEnglishIntroProps {
  children: React.ReactNode;
  /** Optional eyebrow label, defaults to "In plain English". */
  label?: string;
  /** Optional one-line "why it matters" sentence shown beneath the hook. */
  whyItMatters?: React.ReactNode;
  /** Use a light variant on dark module backgrounds. */
  theme?: 'light' | 'dark';
  className?: string;
}

/**
 * PlainEnglishIntro
 * A pedagogical callout that opens a section with a "explain like I'm new"
 * sentence, optionally followed by a one-line stake-setter ("why it matters").
 *
 * Usage:
 *   <PlainEnglishIntro whyItMatters="If this fails, the whole rack goes offline.">
 *     A transformer is just a device that changes one voltage into another.
 *   </PlainEnglishIntro>
 */
export const PlainEnglishIntro: React.FC<PlainEnglishIntroProps> = ({
  children,
  label = 'In plain English',
  whyItMatters,
  theme = 'light',
  className,
}) => {
  const isDark = theme === 'dark';
  return (
    <div
      className={cn(
        'rounded-xl border-l-4 p-5 mb-6',
        isDark
          ? 'bg-white/5 border-[hsl(var(--watt-success))] text-white/90'
          : 'bg-primary/5 border-primary text-foreground',
        className
      )}
    >
      <div
        className={cn(
          'flex items-center gap-2 text-xs font-semibold uppercase tracking-wide mb-2',
          isDark ? 'text-[hsl(var(--watt-success))]' : 'text-primary'
        )}
      >
        <Sparkles className="w-3.5 h-3.5" />
        <span>{label}</span>
      </div>
      <p className={cn('text-base leading-relaxed', isDark ? 'text-white/85' : 'text-foreground')}>
        {children}
      </p>
      {whyItMatters && (
        <p
          className={cn(
            'mt-3 pt-3 border-t text-sm leading-relaxed',
            isDark
              ? 'border-white/10 text-white/60'
              : 'border-border text-muted-foreground'
          )}
        >
          <span className="font-semibold">Why it matters: </span>
          {whyItMatters}
        </p>
      )}
    </div>
  );
};

export default PlainEnglishIntro;
