import { useState } from 'react';
import { ExternalLink, BookOpen, FileText, Database, Building2 } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export type CitationType = 'academic' | 'report' | 'data' | 'filing' | 'book';

export interface Citation {
  id: string;
  authors?: string;
  title: string;
  source: string;
  year: number | string;
  url?: string;
  type: CitationType;
  accessDate?: string;
}

interface AcademicCitationProps {
  citation: Citation;
  index?: number;
  className?: string;
}

const typeIcons: Record<CitationType, React.ReactNode> = {
  academic: <BookOpen className="w-3 h-3" />,
  report: <FileText className="w-3 h-3" />,
  data: <Database className="w-3 h-3" />,
  filing: <Building2 className="w-3 h-3" />,
  book: <BookOpen className="w-3 h-3" />,
};

const typeLabels: Record<CitationType, string> = {
  academic: 'Academic Paper',
  report: 'Industry Report',
  data: 'Data Source',
  filing: 'Regulatory Filing',
  book: 'Book',
};

export default function AcademicCitation({ citation, index, className = '' }: AcademicCitationProps) {
  const formatCitation = () => {
    const parts = [];
    if (citation.authors) parts.push(citation.authors);
    parts.push(`(${citation.year})`);
    parts.push(`"${citation.title}"`);
    parts.push(citation.source);
    if (citation.accessDate) parts.push(`Accessed ${citation.accessDate}`);
    return parts.join('. ');
  };

  return (
    <TooltipProvider>
      <Tooltip delayDuration={200}>
        <TooltipTrigger asChild>
          <sup 
            className={`inline-flex items-center justify-center min-w-[1.25rem] h-5 px-1 
              text-xs font-medium bg-primary/10 text-primary rounded cursor-help 
              hover:bg-primary/20 transition-colors ${className}`}
          >
            {index !== undefined ? index : citation.id}
          </sup>
        </TooltipTrigger>
        <TooltipContent 
          side="top" 
          className="max-w-sm p-3 bg-card border border-border shadow-lg"
        >
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              {typeIcons[citation.type]}
              <span>{typeLabels[citation.type]}</span>
            </div>
            <p className="text-sm text-foreground leading-relaxed">
              {formatCitation()}
            </p>
            {citation.url && (
              <a 
                href={citation.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
              >
                <ExternalLink className="w-3 h-3" />
                View Source
              </a>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

// References section component for end of sections
interface ReferencesSectionProps {
  citations: Citation[];
  title?: string;
  className?: string;
}

export function ReferencesSection({ citations, title = "References", className = '' }: ReferencesSectionProps) {
  return (
    <div className={`mt-8 pt-6 border-t border-border ${className}`}>
      <h4 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
        <BookOpen className="w-5 h-5 text-primary" />
        {title}
      </h4>
      <ol className="space-y-3 list-decimal list-inside">
        {citations.map((citation, index) => (
          <li key={citation.id} className="text-sm text-muted-foreground leading-relaxed">
            <span className="inline-flex items-center gap-1.5 mr-2">
              {typeIcons[citation.type]}
            </span>
            {citation.authors && <span className="font-medium">{citation.authors}</span>}
            {citation.authors && ". "}
            ({citation.year}). "{citation.title}". <em>{citation.source}</em>.
            {citation.url && (
              <a 
                href={citation.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 ml-2 text-primary hover:underline"
              >
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </li>
        ))}
      </ol>
    </div>
  );
}

// Common citations for Bitcoin mining
export const commonCitations: Record<string, Citation> = {
  cbeci: {
    id: 'cbeci',
    title: 'Cambridge Bitcoin Electricity Consumption Index',
    source: 'Cambridge Centre for Alternative Finance',
    year: 2024,
    url: 'https://ccaf.io/cbeci/index',
    type: 'data',
  },
  hashrateIndex: {
    id: 'hashrate-index',
    title: 'Hashrate Index Quarterly Report',
    source: 'Luxor Technologies',
    year: 2024,
    url: 'https://hashrateindex.com',
    type: 'report',
  },
  ercotDemandResponse: {
    id: 'ercot-dr',
    title: 'Demand Response in ERCOT',
    source: 'Electric Reliability Council of Texas',
    year: 2024,
    url: 'https://www.ercot.com',
    type: 'data',
  },
  bitcoinMiningCouncil: {
    id: 'bmc',
    authors: 'Bitcoin Mining Council',
    title: 'Global Bitcoin Mining Data Review',
    source: 'Bitcoin Mining Council',
    year: 2024,
    url: 'https://bitcoinminingcouncil.com',
    type: 'report',
  },
  realOptionsTheory: {
    id: 'real-options',
    authors: 'Dixit, A. K., & Pindyck, R. S.',
    title: 'Investment Under Uncertainty',
    source: 'Princeton University Press',
    year: 1994,
    type: 'book',
  },
  mptMarkowitz: {
    id: 'mpt',
    authors: 'Markowitz, H.',
    title: 'Portfolio Selection',
    source: 'The Journal of Finance, 7(1), 77-91',
    year: 1952,
    type: 'academic',
  },
  modiglianiMiller: {
    id: 'mm-theorem',
    authors: 'Modigliani, F., & Miller, M. H.',
    title: 'The Cost of Capital, Corporation Finance and the Theory of Investment',
    source: 'American Economic Review, 48(3), 261-297',
    year: 1958,
    type: 'academic',
  },
  porterFiveForces: {
    id: 'porter',
    authors: 'Porter, M. E.',
    title: 'Competitive Strategy: Techniques for Analyzing Industries and Competitors',
    source: 'Free Press',
    year: 1980,
    type: 'book',
  },
};
