import { Quote } from 'lucide-react';

interface ExpertQuoteProps {
  quote: string;
  author: string;
  title?: string;
  organization?: string;
  imageUrl?: string;
  className?: string;
  variant?: 'default' | 'featured' | 'minimal';
}

export default function ExpertQuote({
  quote,
  author,
  title,
  organization,
  imageUrl,
  className = '',
  variant = 'default'
}: ExpertQuoteProps) {
  if (variant === 'minimal') {
    return (
      <blockquote className={`border-l-4 border-primary/30 pl-4 py-2 ${className}`}>
        <p className="text-muted-foreground italic">"{quote}"</p>
        <footer className="mt-2 text-sm">
          <span className="font-medium text-foreground">{author}</span>
          {organization && (
            <span className="text-muted-foreground">, {organization}</span>
          )}
        </footer>
      </blockquote>
    );
  }

  if (variant === 'featured') {
    return (
      <div className={`relative bg-gradient-to-br from-primary/10 via-primary/5 to-transparent 
        border border-primary/20 rounded-2xl p-8 ${className}`}>
        <Quote className="absolute top-4 left-4 w-12 h-12 text-primary/20" />
        <div className="relative">
          <blockquote className="text-xl font-medium text-foreground leading-relaxed mb-6 pl-8">
            "{quote}"
          </blockquote>
          <div className="flex items-center gap-4 pl-8">
            {imageUrl && (
              <img 
                src={imageUrl} 
                alt={author} 
                className="w-14 h-14 rounded-full object-cover border-2 border-primary/20"
              />
            )}
            <div>
              <div className="font-semibold text-foreground">{author}</div>
              {(title || organization) && (
                <div className="text-sm text-muted-foreground">
                  {title}
                  {title && organization && ' · '}
                  {organization}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Default variant
  return (
    <div className={`bg-card border border-border rounded-xl p-6 ${className}`}>
      <div className="flex gap-4">
        <Quote className="w-8 h-8 text-primary/40 flex-shrink-0" />
        <div>
          <blockquote className="text-foreground italic leading-relaxed mb-4">
            "{quote}"
          </blockquote>
          <div className="flex items-center gap-3">
            {imageUrl && (
              <img 
                src={imageUrl} 
                alt={author} 
                className="w-10 h-10 rounded-full object-cover"
              />
            )}
            <div>
              <div className="font-medium text-foreground text-sm">{author}</div>
              {(title || organization) && (
                <div className="text-xs text-muted-foreground">
                  {title}
                  {title && organization && ' · '}
                  {organization}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Common expert quotes for Bitcoin mining
export const expertQuotes = {
  energyGrid: {
    quote: "Bitcoin miners have become the most flexible load on the grid, providing demand response capabilities that traditional industrial consumers simply cannot match.",
    author: "Brad Jones",
    title: "Former Interim CEO",
    organization: "ERCOT",
  },
  miningEconomics: {
    quote: "The mining industry has a cost curve remarkably similar to commodity producers. When prices fall, high-cost operators are squeezed out, leaving more efficient miners to capture a larger share of rewards.",
    author: "Ethan Vera",
    title: "Co-Founder",
    organization: "Luxor Technologies",
  },
  efficiency: {
    quote: "Every halving is a forcing function for efficiency. Miners who survive are those who continuously optimize their operations and reduce their all-in costs.",
    author: "Amanda Fabiano",
    title: "VP of Operations",
    organization: "Galaxy Digital Mining",
  },
  sustainability: {
    quote: "Bitcoin mining is the only industry I know of that actively seeks out stranded and curtailed energy. This makes it a natural partner for renewable energy development.",
    author: "Daniel Batten",
    title: "ESG Analyst",
    organization: "Batcoinz",
  },
  riskManagement: {
    quote: "The miners who thrive through bear markets are those who treated risk management as a core competency, not an afterthought.",
    author: "Jaran Mellerud",
    title: "Mining Analyst",
    organization: "Hashrate Index",
  },
  capitalStructure: {
    quote: "Over-leveraging killed more miners in 2022 than low Bitcoin prices. Conservative capital structure isn't just prudent—it's existential.",
    author: "Colin Harper",
    title: "Head of Research",
    organization: "Luxor Technologies",
  },
};
