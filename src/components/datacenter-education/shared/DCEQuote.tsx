import React from 'react';
import { motion } from 'framer-motion';
import { Quote, LucideIcon } from 'lucide-react';

interface DCEQuoteProps {
  quote: string;
  author?: string;
  role?: string;
  className?: string;
  theme?: 'light' | 'dark';
}

export const DCEQuote: React.FC<DCEQuoteProps> = ({
  quote,
  author,
  role,
  className = '',
  theme = 'light',
}) => {
  const isDark = theme === 'dark';

  return (
    <motion.blockquote
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className={`relative p-6 md:p-8 rounded-2xl ${className}
        ${isDark 
          ? 'bg-white/5 border border-white/10' 
          : 'bg-[hsl(var(--watt-bitcoin)/0.05)] border border-[hsl(var(--watt-bitcoin)/0.15)]'
        }`}
    >
      <Quote className={`w-8 h-8 mb-4 ${isDark ? 'text-[hsl(var(--watt-bitcoin))]' : 'text-[hsl(var(--watt-bitcoin)/0.5)]'}`} />
      
      <p className={`text-lg md:text-xl leading-relaxed italic mb-4
        ${isDark ? 'text-white/90' : 'text-foreground'}`}
      >
        "{quote}"
      </p>
      
      {(author || role) && (
        <footer className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[hsl(var(--watt-bitcoin))] flex items-center justify-center text-white font-bold">
            {author?.charAt(0) || '?'}
          </div>
          <div>
            {author && (
              <div className={`font-semibold ${isDark ? 'text-white' : 'text-foreground'}`}>
                {author}
              </div>
            )}
            {role && (
              <div className={`text-sm ${isDark ? 'text-white/60' : 'text-muted-foreground'}`}>
                {role}
              </div>
            )}
          </div>
        </footer>
      )}
    </motion.blockquote>
  );
};

interface DCECalloutProps {
  title: string;
  icon?: LucideIcon;
  children: React.ReactNode;
  variant?: 'default' | 'formula' | 'definition' | 'example';
  className?: string;
}

export const DCECallout: React.FC<DCECalloutProps> = ({
  title,
  icon: Icon,
  children,
  variant = 'default',
  className = '',
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'formula':
        return {
          bg: 'bg-[hsl(var(--watt-navy)/0.05)]',
          border: 'border-[hsl(var(--watt-navy)/0.2)]',
          titleColor: 'text-[hsl(var(--watt-navy))]',
          contentClass: 'font-mono text-sm bg-[hsl(var(--watt-navy)/0.08)] p-4 rounded-lg',
        };
      case 'definition':
        return {
          bg: 'bg-blue-500/5',
          border: 'border-blue-500/20',
          titleColor: 'text-blue-600',
          contentClass: '',
        };
      case 'example':
        return {
          bg: 'bg-emerald-500/5',
          border: 'border-emerald-500/20',
          titleColor: 'text-emerald-600',
          contentClass: 'text-sm',
        };
      default:
        return {
          bg: 'bg-[hsl(var(--watt-bitcoin)/0.05)]',
          border: 'border-[hsl(var(--watt-bitcoin)/0.2)]',
          titleColor: 'text-[hsl(var(--watt-bitcoin))]',
          contentClass: '',
        };
    }
  };

  const styles = getVariantStyles();

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className={`${styles.bg} ${styles.border} border rounded-xl p-5 md:p-6 ${className}`}
    >
      <div className="flex items-center gap-3 mb-3">
        {Icon && <Icon className={`w-5 h-5 ${styles.titleColor}`} />}
        <h4 className={`font-semibold ${styles.titleColor}`}>{title}</h4>
      </div>
      <div className={`text-foreground/80 leading-relaxed ${styles.contentClass}`}>
        {children}
      </div>
    </motion.div>
  );
};

export default DCEQuote;
