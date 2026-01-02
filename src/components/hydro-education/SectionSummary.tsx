import { CheckCircle, ArrowRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface SectionSummaryProps {
  title?: string;
  takeaways: string[];
  nextSectionId?: string;
  nextSectionLabel?: string;
}

const SectionSummary = ({ 
  title = "Key Takeaways",
  takeaways, 
  nextSectionId,
  nextSectionLabel
}: SectionSummaryProps) => {
  const scrollToNext = () => {
    if (nextSectionId) {
      const element = document.getElementById(nextSectionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <Card className="mt-8 border-primary/20 bg-gradient-to-r from-primary/5 to-accent/5">
      <CardContent className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <CheckCircle className="w-5 h-5 text-primary" />
          <h4 className="font-semibold text-foreground">{title}</h4>
        </div>
        
        <ul className="space-y-2 mb-6">
          {takeaways.map((takeaway, index) => (
            <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
              <span className="text-primary mt-1">•</span>
              {takeaway}
            </li>
          ))}
        </ul>
        
        {nextSectionId && nextSectionLabel && (
          <Button 
            onClick={scrollToNext}
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            {nextSectionLabel}
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default SectionSummary;
