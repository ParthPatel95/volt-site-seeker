import { Lightbulb, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ScalingSectionSummaryProps {
  keyTakeaways: string[];
  nextSectionId?: string;
  nextSectionTitle?: string;
}

export const ScalingSectionSummary = ({ 
  keyTakeaways, 
  nextSectionId, 
  nextSectionTitle 
}: ScalingSectionSummaryProps) => {
  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="bg-gradient-to-r from-watt-success/10 to-watt-blue/10 rounded-xl p-6 mt-8 border border-watt-success/20">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-watt-success/20 rounded-lg flex items-center justify-center">
          <Lightbulb className="w-5 h-5 text-watt-success" />
        </div>
        <h3 className="text-lg font-semibold text-foreground">Section Summary</h3>
      </div>
      
      <div className="space-y-2 mb-6">
        {keyTakeaways.map((takeaway, index) => (
          <div key={index} className="flex items-start gap-3">
            <div className="w-6 h-6 bg-watt-success/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-xs font-semibold text-watt-success">{index + 1}</span>
            </div>
            <span className="text-foreground">{takeaway}</span>
          </div>
        ))}
      </div>

      {nextSectionId && nextSectionTitle && (
        <Button 
          onClick={() => scrollToSection(nextSectionId)}
          className="w-full bg-watt-success hover:bg-watt-success/90 text-white"
        >
          Continue to {nextSectionTitle}
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      )}
    </div>
  );
};
