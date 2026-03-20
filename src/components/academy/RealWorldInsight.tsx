import React from 'react';
import { motion } from 'framer-motion';
import { Briefcase } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RealWorldInsightProps {
  title?: string;
  insight: string;
  source?: string;
  className?: string;
}

export const RealWorldInsight: React.FC<RealWorldInsightProps> = ({
  title = 'Real-World Insight',
  insight,
  source,
  className,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      className={cn(
        'bg-primary/5 border-l-4 border-primary rounded-r-xl p-5 md:p-6',
        className
      )}
    >
      <div className="flex items-start gap-4">
        <div className="bg-primary/15 p-2.5 rounded-lg shrink-0">
          <Briefcase className="w-5 h-5 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold mb-2 text-primary">{title}</h4>
          <p className="text-foreground/80 leading-relaxed text-sm italic">"{insight}"</p>
          {source && (
            <p className="text-xs text-muted-foreground mt-2">— {source}</p>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default RealWorldInsight;
