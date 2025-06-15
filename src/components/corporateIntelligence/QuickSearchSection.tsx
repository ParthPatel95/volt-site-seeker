
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface QuickSearchSectionProps {
  quickSearchTerm: string;
  onQuickSearchChange: (value: string) => void;
}

export function QuickSearchSection({ quickSearchTerm, onQuickSearchChange }: QuickSearchSectionProps) {
  return (
    <div className="text-center space-y-3 sm:space-y-4">
      <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 dark:text-white">
        Corporate Intelligence Hub
      </h1>
      <p className="text-sm sm:text-base lg:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto px-4">
        AI-powered insights for corporate analysis, investment decisions, and market intelligence
      </p>
      
      {/* Quick Search */}
      <div className="max-w-sm sm:max-w-md mx-auto px-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
          <Input
            placeholder="Quick search companies, news, or insights..."
            value={quickSearchTerm}
            onChange={(e) => onQuickSearchChange(e.target.value)}
            className="pl-10 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-sm"
          />
        </div>
      </div>
    </div>
  );
}
