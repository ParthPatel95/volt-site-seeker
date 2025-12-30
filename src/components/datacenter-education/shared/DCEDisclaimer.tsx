import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, Info, AlertCircle, ExternalLink, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { DISCLAIMERS, DATA_QUALITY_LEVELS, STANDARD_REFERENCES } from '@/constants/educational-constants';

type DisclaimerSeverity = 'informational' | 'caution' | 'critical';
type DataQualityLevel = 'verified' | 'estimate' | 'example' | 'variable';

interface DCEDisclaimerProps {
  /** Severity level of the disclaimer */
  severity?: DisclaimerSeverity;
  /** Custom message (overrides template if provided) */
  message?: string;
  /** Use a predefined template from educational-constants */
  template?: keyof typeof DISCLAIMERS;
  /** Data quality level badge */
  quality?: DataQualityLevel;
  /** Show factors that affect variability */
  showFactors?: boolean;
  /** Reference standard (e.g., 'ASHRAE', 'IEEE') */
  reference?: keyof typeof STANDARD_REFERENCES;
  /** Additional className */
  className?: string;
  /** Compact mode for inline use */
  compact?: boolean;
  /** Children content */
  children?: React.ReactNode;
}

const severityConfig = {
  informational: {
    icon: Info,
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/30',
    textColor: 'text-blue-600',
    iconColor: 'text-blue-500',
  },
  caution: {
    icon: AlertTriangle,
    bgColor: 'bg-amber-500/10',
    borderColor: 'border-amber-500/30',
    textColor: 'text-amber-700',
    iconColor: 'text-amber-500',
  },
  critical: {
    icon: AlertCircle,
    bgColor: 'bg-red-500/10',
    borderColor: 'border-red-500/30',
    textColor: 'text-red-700',
    iconColor: 'text-red-500',
  },
};

const qualityConfig = {
  verified: {
    label: 'Verified',
    bgColor: 'bg-emerald-500/20',
    textColor: 'text-emerald-700',
  },
  estimate: {
    label: 'Industry Est.',
    bgColor: 'bg-amber-500/20',
    textColor: 'text-amber-700',
  },
  example: {
    label: 'Example',
    bgColor: 'bg-blue-500/20',
    textColor: 'text-blue-700',
  },
  variable: {
    label: 'Variable',
    bgColor: 'bg-orange-500/20',
    textColor: 'text-orange-700',
  },
};

export const DCEDisclaimer: React.FC<DCEDisclaimerProps> = ({
  severity = 'informational',
  message,
  template,
  quality,
  showFactors = false,
  reference,
  className,
  compact = false,
  children,
}) => {
  const [expanded, setExpanded] = React.useState(false);
  
  // Get template data if specified
  const templateData = template ? DISCLAIMERS[template] : null;
  const effectiveSeverity = templateData?.severity as DisclaimerSeverity || severity;
  const effectiveMessage = message || templateData?.template || '';
  const factors = templateData?.factors || [];
  
  const config = severityConfig[effectiveSeverity];
  const Icon = config.icon;
  
  // Get reference data if specified
  const referenceData = reference ? STANDARD_REFERENCES[reference] : null;
  
  if (compact) {
    return (
      <span 
        className={cn(
          'inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium',
          config.bgColor,
          config.textColor,
          className
        )}
      >
        <Icon className="w-3 h-3" />
        {quality && (
          <span className={cn('px-1 rounded', qualityConfig[quality].bgColor, qualityConfig[quality].textColor)}>
            {qualityConfig[quality].label}
          </span>
        )}
        {effectiveMessage || children}
      </span>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className={cn(
        'rounded-xl border p-4',
        config.bgColor,
        config.borderColor,
        className
      )}
    >
      <div className="flex items-start gap-3">
        <div className={cn('p-1.5 rounded-lg', config.bgColor)}>
          <Icon className={cn('w-4 h-4', config.iconColor)} />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            {quality && (
              <span className={cn(
                'px-2 py-0.5 rounded text-[10px] font-medium',
                qualityConfig[quality].bgColor,
                qualityConfig[quality].textColor
              )}>
                {qualityConfig[quality].label}
              </span>
            )}
            {referenceData && (
              <a
                href={referenceData.url}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  'inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium',
                  'bg-muted/50 text-muted-foreground hover:text-foreground transition-colors'
                )}
              >
                <ExternalLink className="w-3 h-3" />
                {referenceData.name}
              </a>
            )}
          </div>
          
          <p className={cn('text-sm leading-relaxed', config.textColor)}>
            {effectiveMessage}
            {children}
          </p>
          
          {/* Expandable factors section */}
          {showFactors && factors.length > 0 && (
            <div className="mt-2">
              <button
                onClick={() => setExpanded(!expanded)}
                className={cn(
                  'flex items-center gap-1 text-xs font-medium',
                  config.textColor,
                  'hover:underline'
                )}
              >
                <ChevronDown className={cn('w-3 h-3 transition-transform', expanded && 'rotate-180')} />
                {expanded ? 'Hide factors' : 'What affects this?'}
              </button>
              
              {expanded && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-2 flex flex-wrap gap-1"
                >
                  {factors.map((factor) => (
                    <span
                      key={factor}
                      className="px-2 py-0.5 bg-background/50 rounded text-[10px] text-muted-foreground"
                    >
                      {factor}
                    </span>
                  ))}
                </motion.div>
              )}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

/**
 * Inline data quality badge for use within text or tables
 */
interface DataQualityBadgeProps {
  quality: DataQualityLevel;
  className?: string;
}

export const DataQualityBadge: React.FC<DataQualityBadgeProps> = ({ quality, className }) => {
  const config = qualityConfig[quality];
  const qualityData = DATA_QUALITY_LEVELS[quality.toUpperCase() as keyof typeof DATA_QUALITY_LEVELS];
  
  return (
    <span 
      className={cn(
        'inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-medium',
        config.bgColor,
        config.textColor,
        className
      )}
      title={qualityData?.description}
    >
      {config.label}
    </span>
  );
};

/**
 * Standard source citation component
 */
interface SourceCitationProps {
  source: keyof typeof STANDARD_REFERENCES;
  standard?: string;
  className?: string;
}

export const SourceCitation: React.FC<SourceCitationProps> = ({ source, standard, className }) => {
  const data = STANDARD_REFERENCES[source];
  
  return (
    <a
      href={data.url}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        'inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors',
        className
      )}
    >
      <ExternalLink className="w-3 h-3" />
      <span>{standard || data.name}</span>
    </a>
  );
};

export default DCEDisclaimer;
