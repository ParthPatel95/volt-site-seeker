import React, { useState } from 'react';
import { BookOpen, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

export interface KeyTerm {
  /** Display name of the term, e.g. "Hashrate". */
  term: string;
  /** Plain-English, one-or-two-sentence definition. */
  definition: string;
  /** Optional short tag like "Mining" or "Energy" shown next to the term. */
  tag?: string;
}

interface KeyTermsGlossaryProps {
  /** Module display title, used in the header e.g. "Bitcoin Fundamentals". */
  moduleTitle: string;
  /** 5–10 essential terms for the module. */
  terms: KeyTerm[];
  /** Default open state. Defaults to false (collapsed) to keep pages light. */
  defaultOpen?: boolean;
  className?: string;
}

/**
 * KeyTermsGlossary
 * A collapsible per-module key-terms panel placed near the top of each
 * Academy module. Designed for novices: short list, plain-English defs,
 * always one click away while reading.
 */
export const KeyTermsGlossary: React.FC<KeyTermsGlossaryProps> = ({
  moduleTitle,
  terms,
  defaultOpen = false,
  className,
}) => {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div
      className={cn(
        'rounded-2xl border border-border bg-card overflow-hidden',
        className
      )}
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between gap-3 px-5 py-4 text-left hover:bg-muted/30 transition-colors"
        aria-expanded={open}
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="p-2 rounded-lg bg-primary/10 flex-shrink-0">
            <BookOpen className="w-4 h-4 text-primary" />
          </div>
          <div className="min-w-0">
            <div className="text-xs font-semibold uppercase tracking-wide text-primary">
              Key Terms
            </div>
            <div className="text-sm text-muted-foreground truncate">
              {terms.length} essential terms for {moduleTitle}
            </div>
          </div>
        </div>
        {open ? (
          <ChevronUp className="w-4 h-4 text-muted-foreground flex-shrink-0" />
        ) : (
          <ChevronDown className="w-4 h-4 text-muted-foreground flex-shrink-0" />
        )}
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden border-t border-border"
          >
            <ul className="divide-y divide-border">
              {terms.map((t) => (
                <li key={t.term} className="px-5 py-3">
                  <div className="flex items-baseline gap-2 flex-wrap">
                    <span className="font-semibold text-foreground">{t.term}</span>
                    {t.tag && (
                      <span className="text-[10px] uppercase tracking-wide font-semibold px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                        {t.tag}
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
                    {t.definition}
                  </p>
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default KeyTermsGlossary;
