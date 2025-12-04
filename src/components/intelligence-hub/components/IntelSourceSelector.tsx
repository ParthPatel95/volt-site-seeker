
import React from 'react';
import { Factory, TrendingDown, Satellite, Newspaper, FileText, Scale, Building, Database } from 'lucide-react';
import { cn } from '@/lib/utils';

interface IntelSource {
  id: string;
  label: string;
  description: string;
  icon: React.ElementType;
  color: string;
}

const sources: IntelSource[] = [
  { id: 'idle', label: 'Idle Facilities', description: 'EPA & property records', icon: Factory, color: 'yellow' },
  { id: 'distress', label: 'Corporate Distress', description: 'Financial stress signals', icon: TrendingDown, color: 'red' },
  { id: 'satellite', label: 'Satellite Analysis', description: 'Visual infrastructure data', icon: Satellite, color: 'blue' },
  { id: 'news', label: 'News Intelligence', description: 'Real-time news monitoring', icon: Newspaper, color: 'purple' },
  { id: 'sec', label: 'SEC Filings', description: '10-K, 8-K, proxy statements', icon: FileText, color: 'green' },
  { id: 'bankruptcy', label: 'Bankruptcy Data', description: 'Chapter 11 & restructuring', icon: Scale, color: 'orange' },
  { id: 'ferc', label: 'FERC Database', description: 'Power plant registry', icon: Building, color: 'cyan' },
  { id: 'epa', label: 'EPA Registry', description: 'Environmental permits', icon: Database, color: 'emerald' },
];

interface IntelSourceSelectorProps {
  selected: string[];
  onChange: (selected: string[]) => void;
  disabled?: boolean;
}

export function IntelSourceSelector({ selected, onChange, disabled }: IntelSourceSelectorProps) {
  const toggleSource = (id: string) => {
    if (disabled) return;
    if (selected.includes(id)) {
      onChange(selected.filter(s => s !== id));
    } else {
      onChange([...selected, id]);
    }
  };

  const colorClasses: Record<string, { bg: string; border: string; text: string }> = {
    yellow: { bg: 'bg-yellow-500/10', border: 'border-yellow-500/50', text: 'text-yellow-600' },
    red: { bg: 'bg-red-500/10', border: 'border-red-500/50', text: 'text-red-600' },
    blue: { bg: 'bg-blue-500/10', border: 'border-blue-500/50', text: 'text-blue-600' },
    purple: { bg: 'bg-purple-500/10', border: 'border-purple-500/50', text: 'text-purple-600' },
    green: { bg: 'bg-green-500/10', border: 'border-green-500/50', text: 'text-green-600' },
    orange: { bg: 'bg-orange-500/10', border: 'border-orange-500/50', text: 'text-orange-600' },
    cyan: { bg: 'bg-cyan-500/10', border: 'border-cyan-500/50', text: 'text-cyan-600' },
    emerald: { bg: 'bg-emerald-500/10', border: 'border-emerald-500/50', text: 'text-emerald-600' },
  };

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
      {sources.map((source) => {
        const isSelected = selected.includes(source.id);
        const colors = colorClasses[source.color];
        const Icon = source.icon;

        return (
          <button
            key={source.id}
            onClick={() => toggleSource(source.id)}
            disabled={disabled}
            className={cn(
              "p-3 rounded-xl border-2 transition-all duration-200 text-left",
              "hover:scale-[1.02] active:scale-[0.98]",
              disabled && "opacity-50 cursor-not-allowed",
              isSelected 
                ? `${colors.bg} ${colors.border} ring-2 ring-offset-2 ring-offset-background ring-primary/20` 
                : "bg-muted/30 border-border hover:border-primary/30"
            )}
          >
            <div className="flex items-center gap-2 mb-1">
              <div className={cn(
                "w-7 h-7 rounded-lg flex items-center justify-center",
                isSelected ? colors.bg : "bg-muted"
              )}>
                <Icon className={cn("w-4 h-4", isSelected ? colors.text : "text-muted-foreground")} />
              </div>
            </div>
            <p className={cn(
              "text-xs font-medium",
              isSelected ? "text-foreground" : "text-muted-foreground"
            )}>
              {source.label}
            </p>
            <p className="text-[10px] text-muted-foreground line-clamp-1">{source.description}</p>
          </button>
        );
      })}
    </div>
  );
}
