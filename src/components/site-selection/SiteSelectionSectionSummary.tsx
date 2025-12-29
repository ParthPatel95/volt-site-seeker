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
        ? 'bg-white/10 border border-white/20 backdrop-blur-md' 
        : 'bg-gradient-to-r from-watt-purple/10 to-watt-success/10 border border-watt-purple/20'
    }`}>
      <div className="flex items-start gap-4">
        <div className={`p-2 rounded-lg shrink-0 ${isDark ? 'bg-watt-success/20' : 'bg-watt-success/10'}`}>
          <CheckCircle2 className="w-5 h-5 text-watt-success" />
        </div>
        <div className="flex-1 space-y-4">
          <h4 className={`font-semibold ${isDark ? 'text-white' : 'text-watt-navy'}`}>{title}</h4>
          
          <ul className="space-y-2">
            {keyTakeaways.map((takeaway, index) => (
              <li key={index} className={`flex items-start gap-2 text-sm ${isDark ? 'text-white/80' : 'text-watt-navy/80'}`}>
                <span className="text-watt-success font-bold mt-0.5">•</span>
                {takeaway}
              </li>
            ))}
          </ul>
          
          {proTip && (
            <div className={`flex items-start gap-2 p-3 rounded-lg ${
              isDark ? 'bg-watt-bitcoin/20' : 'bg-watt-bitcoin/10'
            }`}>
              <Lightbulb className="w-4 h-4 text-watt-bitcoin flex-shrink-0 mt-0.5" />
              <p className={`text-sm ${isDark ? 'text-white/80' : 'text-watt-navy/80'}`}>
                <strong className="text-watt-bitcoin">Pro Tip:</strong> {proTip}
              </p>
            </div>
          )}
          
          {nextSection && (
            <button 
              onClick={() => scrollToSection(nextSection.id)}
              className={`inline-flex items-center gap-2 text-sm font-medium transition-colors ${
                isDark 
                  ? 'text-watt-purple hover:text-white' 
                  : 'text-watt-purple hover:text-watt-navy'
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
