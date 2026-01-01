import { CheckCircle2, ArrowRight, Lightbulb } from 'lucide-react';

interface SiteSelectionSectionSummaryProps {
  title?: string;
  keyTakeaways: string[];
  proTip?: string;
  nextSection?: {
    title: string;
    id: string;
  };
  variant?: 'light' | 'dark';
}

const scrollToSection = (sectionId: string) => {
  const element = document.getElementById(sectionId);
  if (element) {
    element.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
};

const SiteSelectionSectionSummary = ({ 
  title = "Section Summary",
  keyTakeaways,
  proTip,
  nextSection,
  variant = 'light'
}: SiteSelectionSectionSummaryProps) => {
  const isDark = variant === 'dark';
  
  return (
    <div className={`rounded-xl p-6 mt-8 ${
      isDark 
        ? 'bg-card/70 border border-border/50 backdrop-blur-md' 
        : 'bg-gradient-to-r from-primary/10 to-market-positive/10 border border-primary/20'
    }`}>
      <div className="flex items-start gap-4">
        <div className={`p-2 rounded-lg shrink-0 ${isDark ? 'bg-market-positive/20' : 'bg-market-positive/10'}`}>
          <CheckCircle2 className="w-5 h-5 text-market-positive" />
        </div>
        <div className="flex-1 space-y-4">
          <h4 className={`font-semibold ${isDark ? 'text-foreground' : 'text-foreground'}`}>{title}</h4>
          
          <ul className="space-y-2">
            {keyTakeaways.map((takeaway, index) => (
              <li key={index} className={`flex items-start gap-2 text-sm ${isDark ? 'text-muted-foreground' : 'text-muted-foreground'}`}>
                <span className="text-market-positive font-bold mt-0.5">•</span>
                {takeaway}
              </li>
            ))}
          </ul>
          
          {proTip && (
            <div className={`flex items-start gap-2 p-3 rounded-lg ${
              isDark ? 'bg-secondary/20' : 'bg-secondary/10'
            }`}>
              <Lightbulb className="w-4 h-4 text-secondary flex-shrink-0 mt-0.5" />
              <p className={`text-sm ${isDark ? 'text-muted-foreground' : 'text-muted-foreground'}`}>
                <strong className="text-secondary">Pro Tip:</strong> {proTip}
              </p>
            </div>
          )}
          
          {nextSection && (
            <button 
              onClick={() => scrollToSection(nextSection.id)}
              className={`inline-flex items-center gap-2 text-sm font-medium transition-colors ${
                isDark 
                  ? 'text-primary hover:text-foreground' 
                  : 'text-primary hover:text-foreground'
              }`}
            >
              Next: {nextSection.title}
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default SiteSelectionSectionSummary;
