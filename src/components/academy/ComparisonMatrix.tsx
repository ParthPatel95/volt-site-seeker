import React from 'react';
import { motion } from 'framer-motion';
import { Check, X, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ComparisonOption {
  name: string;
  description?: string;
  features: Record<string, string | boolean | number>;
  highlighted?: boolean;
}

interface ComparisonMatrixProps {
  title: string;
  subtitle?: string;
  featureLabels: { key: string; label: string }[];
  options: ComparisonOption[];
  className?: string;
}

const renderValue = (value: string | boolean | number) => {
  if (typeof value === 'boolean') {
    return value ? (
      <Check className="w-5 h-5 text-emerald-500 mx-auto" />
    ) : (
      <X className="w-5 h-5 text-red-400 mx-auto" />
    );
  }
  if (value === 'N/A' || value === '-') {
    return <Minus className="w-4 h-4 text-muted-foreground mx-auto" />;
  }
  return <span className="text-sm text-foreground">{String(value)}</span>;
};

export const ComparisonMatrix: React.FC<ComparisonMatrixProps> = ({
  title,
  subtitle,
  featureLabels,
  options,
  className,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className={cn('bg-card rounded-xl border border-border overflow-hidden', className)}
    >
      <div className="p-6 border-b border-border">
        <h3 className="text-xl font-bold text-foreground">{title}</h3>
        {subtitle && <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left p-4 text-sm font-medium text-muted-foreground min-w-[160px]">Feature</th>
              {options.map((option, i) => (
                <th
                  key={i}
                  className={cn(
                    'p-4 text-center min-w-[130px]',
                    option.highlighted && 'bg-primary/5'
                  )}
                >
                  <div className="font-semibold text-foreground">{option.name}</div>
                  {option.description && (
                    <div className="text-xs text-muted-foreground mt-0.5">{option.description}</div>
                  )}
                  {option.highlighted && (
                    <span className="inline-block mt-1 text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                      Recommended
                    </span>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {featureLabels.map((feature, rowIndex) => (
              <tr
                key={feature.key}
                className={cn(
                  'border-b border-border last:border-0',
                  rowIndex % 2 === 0 ? 'bg-background' : 'bg-muted/20'
                )}
              >
                <td className="p-4 text-sm font-medium text-foreground">{feature.label}</td>
                {options.map((option, colIndex) => (
                  <td
                    key={colIndex}
                    className={cn(
                      'p-4 text-center',
                      option.highlighted && 'bg-primary/5'
                    )}
                  >
                    {renderValue(option.features[feature.key] ?? '-')}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
};

export default ComparisonMatrix;
