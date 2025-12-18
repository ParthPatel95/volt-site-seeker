import { CheckCircle2, ArrowRight, Lightbulb } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

interface NextStep {
  title: string;
  href: string;
  description?: string;
}

interface SectionSummaryProps {
  title?: string;
  takeaways: string[];
  nextSteps?: NextStep[];
  proTip?: string;
}

const SectionSummary = ({ 
  title = "Key Takeaways",
  takeaways, 
  nextSteps,
  proTip
}: SectionSummaryProps) => {
  return (
    <div className="mt-12 border-t border-watt-navy/10 pt-8">
      <div className="bg-gradient-to-br from-watt-success/5 to-watt-blue/5 border border-watt-success/20 rounded-xl p-6 space-y-6">
        {/* Takeaways */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle2 className="w-5 h-5 text-watt-success" />
            <h4 className="font-semibold text-watt-navy">{title}</h4>
          </div>
          <ul className="space-y-2">
            {takeaways.map((takeaway, index) => (
              <li key={index} className="flex items-start gap-2 text-sm text-watt-navy/80">
                <span className="text-watt-success font-bold mt-0.5">•</span>
                {takeaway}
              </li>
            ))}
          </ul>
        </div>
        
        {/* Pro Tip */}
        {proTip && (
          <div className="bg-watt-bitcoin/10 border border-watt-bitcoin/20 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Lightbulb className="w-5 h-5 text-watt-bitcoin shrink-0 mt-0.5" />
              <div>
                <span className="text-xs font-semibold text-watt-bitcoin uppercase tracking-wide">Pro Tip</span>
                <p className="text-sm text-watt-navy/80 mt-1">{proTip}</p>
              </div>
            </div>
          </div>
        )}
        
        {/* Next Steps */}
        {nextSteps && nextSteps.length > 0 && (
          <div className="pt-4 border-t border-watt-navy/10">
            <h5 className="text-sm font-medium text-watt-navy/60 mb-3">Continue Learning:</h5>
            <div className="flex flex-wrap gap-3">
              {nextSteps.map((step, index) => (
                <Link key={index} to={step.href}>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="bg-white hover:bg-watt-blue/5 border-watt-navy/20 hover:border-watt-blue text-watt-navy hover:text-watt-blue group"
                  >
                    {step.title}
                    <ArrowRight className="w-3 h-3 ml-1 group-hover:translate-x-0.5 transition-transform" />
                  </Button>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SectionSummary;
