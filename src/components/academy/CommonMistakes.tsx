import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Mistake {
  title: string;
  description: string;
  consequence: string;
  prevention: string;
}

interface CommonMistakesProps {
  title?: string;
  mistakes: Mistake[];
  className?: string;
}

export const CommonMistakes: React.FC<CommonMistakesProps> = ({
  title = 'Common Mistakes to Avoid',
  mistakes,
  className,
}) => {
  return (
    <div className={cn('space-y-4', className)}>
      <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
        <AlertTriangle className="w-5 h-5 text-red-500" />
        {title}
      </h3>
      <div className="grid gap-4 md:grid-cols-2">
        {mistakes.map((mistake, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 }}
            className="bg-red-500/5 border border-red-500/20 rounded-xl p-5"
          >
            <h4 className="font-semibold text-foreground flex items-center gap-2 mb-2">
              <span className="w-6 h-6 rounded-full bg-red-500/15 flex items-center justify-center text-xs font-bold text-red-600">
                {index + 1}
              </span>
              {mistake.title}
            </h4>
            <p className="text-sm text-muted-foreground mb-3">{mistake.description}</p>
            <div className="space-y-2 text-sm">
              <div className="flex gap-2">
                <span className="text-red-500 font-medium shrink-0">⚠ Risk:</span>
                <span className="text-foreground/80">{mistake.consequence}</span>
              </div>
              <div className="flex gap-2">
                <span className="text-emerald-600 font-medium shrink-0">✓ Fix:</span>
                <span className="text-foreground/80">{mistake.prevention}</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default CommonMistakes;
