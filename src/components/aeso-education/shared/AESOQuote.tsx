import { motion } from 'framer-motion';
import { Quote as QuoteIcon } from 'lucide-react';

interface AESOQuoteProps {
  quote: string;
  author?: string;
  role?: string;
  source?: string;
  theme?: 'light' | 'dark';
  className?: string;
}

export function AESOQuote({
  quote,
  author,
  role,
  source,
  theme = 'light',
  className = '',
}: AESOQuoteProps) {
  const isDark = theme === 'dark';

  return (
    <motion.blockquote
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
      className={`
        relative rounded-xl p-6 md:p-8 border-l-4 border-[hsl(var(--watt-bitcoin))]
        ${isDark 
          ? 'bg-white/5' 
          : 'bg-[hsl(var(--watt-bitcoin)/0.03)]'
        }
        ${className}
      `}
    >
      {/* Quote icon */}
      <div className="absolute -top-3 left-6">
        <div className={`
          w-8 h-8 rounded-full flex items-center justify-center
          ${isDark 
            ? 'bg-[hsl(var(--watt-bitcoin)/0.3)]' 
            : 'bg-[hsl(var(--watt-bitcoin)/0.15)]'
          }
        `}>
          <QuoteIcon className="w-4 h-4 text-[hsl(var(--watt-bitcoin))]" />
        </div>
      </div>

      {/* Quote text */}
      <p className={`
        text-lg md:text-xl leading-relaxed italic mb-4 pt-2
        ${isDark ? 'text-white/90' : 'text-foreground'}
      `}>
        "{quote}"
      </p>

      {/* Attribution */}
      {(author || source) && (
        <footer className="flex flex-col gap-0.5">
          {author && (
            <cite className={`not-italic font-semibold ${isDark ? 'text-white' : 'text-foreground'}`}>
              — {author}
            </cite>
          )}
          {role && (
            <span className={`text-sm ${isDark ? 'text-white/60' : 'text-muted-foreground'}`}>
              {role}
            </span>
          )}
          {source && (
            <span className={`text-xs ${isDark ? 'text-white/40' : 'text-muted-foreground/70'}`}>
              Source: {source}
            </span>
          )}
        </footer>
      )}
    </motion.blockquote>
  );
}
