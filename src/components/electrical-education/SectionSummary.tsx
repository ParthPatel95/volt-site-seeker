import React from 'react';
import { Lightbulb, ArrowRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface SectionSummaryProps {
  title?: string;
  takeaways: string[];
  nextSectionId?: string;
  nextSectionLabel?: string;
  accentColor?: 'bitcoin' | 'success' | 'trust' | 'coinbase';
}

const colorClasses = {
  bitcoin: {
    bg: 'bg-gradient-to-br from-watt-bitcoin/5 to-watt-bitcoin/10',
    border: 'border-watt-bitcoin/20',
    icon: 'text-watt-bitcoin',
    bullet: 'bg-watt-bitcoin',
    button: 'bg-watt-bitcoin hover:bg-watt-bitcoin/90 text-white',
  },
  success: {
    bg: 'bg-gradient-to-br from-watt-success/5 to-watt-success/10',
    border: 'border-watt-success/20',
    icon: 'text-watt-success',
    bullet: 'bg-watt-success',
    button: 'bg-watt-success hover:bg-watt-success/90 text-white',
  },
  trust: {
    bg: 'bg-gradient-to-br from-watt-trust/5 to-watt-trust/10',
    border: 'border-watt-trust/20',
    icon: 'text-watt-trust',
    bullet: 'bg-watt-trust',
    button: 'bg-watt-trust hover:bg-watt-trust/90 text-white',
  },
  coinbase: {
    bg: 'bg-gradient-to-br from-watt-coinbase/5 to-watt-coinbase/10',
    border: 'border-watt-coinbase/20',
    icon: 'text-watt-coinbase',
    bullet: 'bg-watt-coinbase',
    button: 'bg-watt-coinbase hover:bg-watt-coinbase/90 text-white',
  },
};

export const SectionSummary: React.FC<SectionSummaryProps> = ({
  title = "Key Takeaways",
  takeaways,
  nextSectionId,
  nextSectionLabel,
  accentColor = 'bitcoin',
}) => {
  const colors = colorClasses[accentColor];

  const scrollToNext = () => {
    if (nextSectionId) {
      const element = document.getElementById(nextSectionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  return (
    <Card className={`mt-12 ${colors.border} ${colors.bg} border shadow-sm overflow-hidden`}>
      <CardContent className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className={`p-2 rounded-lg bg-background/50`}>
            <Lightbulb className={`w-5 h-5 ${colors.icon}`} />
          </div>
          <h4 className="font-bold text-lg text-foreground">{title}</h4>
        </div>
        
        <div className="space-y-3 mb-6">
          {takeaways.map((takeaway, index) => (
            <div key={index} className="flex items-start gap-3">
              <span className={`w-2 h-2 rounded-full ${colors.bullet} mt-2 shrink-0`} />
              <span className="text-sm text-foreground/90">{takeaway}</span>
            </div>
          ))}
        </div>

        {nextSectionId && nextSectionLabel && (
          <button
            onClick={scrollToNext}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${colors.button}`}
          >
            <span>Next: {nextSectionLabel}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </CardContent>
    </Card>
  );
};

export default SectionSummary;
