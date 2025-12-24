import { ScrollReveal } from "@/components/landing/ScrollAnimations";
import { Lightbulb, ArrowRight } from "lucide-react";

interface RiskSectionSummaryProps {
  title: string;
  keyTakeaways: string[];
  nextSection?: {
    name: string;
    href: string;
  };
}

export const RiskSectionSummary = ({ title, keyTakeaways, nextSection }: RiskSectionSummaryProps) => {
  return (
    <ScrollReveal>
      <div className="mt-12 bg-gradient-to-br from-card via-card to-red-500/5 border border-border rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-red-500/20 rounded-xl flex items-center justify-center">
            <Lightbulb className="w-5 h-5 text-red-500" />
          </div>
          <h3 className="text-lg font-semibold text-foreground">{title} - Key Takeaways</h3>
        </div>
        
        <ul className="space-y-2 mb-6">
          {keyTakeaways.map((takeaway, index) => (
            <li key={index} className="flex items-start gap-2 text-muted-foreground">
              <span className="text-red-500 font-bold">•</span>
              <span>{takeaway}</span>
            </li>
          ))}
        </ul>

        {nextSection && (
          <a 
            href={nextSection.href}
            className="inline-flex items-center gap-2 text-red-500 hover:text-red-400 transition-colors font-medium"
          >
            Continue to {nextSection.name}
            <ArrowRight className="w-4 h-4" />
          </a>
        )}
      </div>
    </ScrollReveal>
  );
};
