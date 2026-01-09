import React from 'react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search, Cpu, Zap, Flame, Droplets, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useASICDatabase, ASICMiner } from '../hooks/useASICDatabase';

interface ASICSelectorProps {
  selectedASIC: ASICMiner | null;
  onSelectASIC: (asic: ASICMiner) => void;
}

export const ASICSelector: React.FC<ASICSelectorProps> = ({
  selectedASIC,
  onSelectASIC
}) => {
  const { asics, isLoading } = useASICDatabase();
  const [search, setSearch] = React.useState('');
  const [activeFilter, setActiveFilter] = React.useState<'all' | 'air' | 'hydro' | 'immersion'>('all');

  const filteredASICs = React.useMemo(() => {
    return asics.filter(asic => {
      const matchesSearch = 
        asic.model.toLowerCase().includes(search.toLowerCase()) ||
        asic.manufacturer.toLowerCase().includes(search.toLowerCase());
      
      const matchesFilter = 
        activeFilter === 'all' || 
        asic.cooling_type.toLowerCase() === activeFilter;
      
      return matchesSearch && matchesFilter;
    });
  }, [asics, search, activeFilter]);

  const getCoolingIcon = (type: string) => {
    const iconClass = "w-3 h-3";
    switch (type.toLowerCase()) {
      case 'hydro': return <Droplets className={cn(iconClass, "text-blue-400")} />;
      case 'immersion': return <Flame className={cn(iconClass, "text-purple-400")} />;
      default: return <Zap className={cn(iconClass, "text-amber-400")} />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Cpu className="w-4 h-4 animate-pulse" />
          <span className="text-xs font-mono">LOADING HARDWARE...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search miners..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 h-9 text-sm bg-background border-border"
        />
      </div>

      {/* Filters */}
      <div className="flex gap-1.5 flex-wrap">
        {(['all', 'air', 'hydro', 'immersion'] as const).map((filter) => (
          <button
            key={filter}
            onClick={() => setActiveFilter(filter)}
            className={cn(
              "px-2.5 py-1 rounded text-[10px] sm:text-xs font-medium transition-all uppercase",
              activeFilter === filter
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:text-foreground"
            )}
          >
            {filter}
          </button>
        ))}
      </div>

      {/* ASIC List */}
      <ScrollArea className="h-[200px] sm:h-[240px]">
        <div className="space-y-1.5 pr-2">
          {filteredASICs.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground text-xs">
              No miners found
            </div>
          ) : (
            filteredASICs.map((asic) => (
              <ASICCard
                key={asic.id}
                asic={asic}
                isSelected={selectedASIC?.id === asic.id}
                onSelect={() => onSelectASIC(asic)}
                coolingIcon={getCoolingIcon(asic.cooling_type)}
              />
            ))
          )}
        </div>
      </ScrollArea>

      {/* Selected Summary */}
      {selectedASIC && (
        <div className="p-2.5 rounded-lg bg-primary/5 border border-primary/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 min-w-0">
              <Cpu className="w-3.5 h-3.5 text-primary flex-shrink-0" />
              <span className="text-xs font-medium text-foreground truncate">{selectedASIC.model}</span>
            </div>
            <div className="flex items-center gap-2 text-[10px] font-mono text-muted-foreground flex-shrink-0">
              <span>{selectedASIC.hashrate_th} TH/s</span>
              <span>•</span>
              <span>{selectedASIC.efficiency_jth} J/TH</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

interface ASICCardProps {
  asic: ASICMiner;
  isSelected: boolean;
  onSelect: () => void;
  coolingIcon: React.ReactNode;
}

const ASICCard: React.FC<ASICCardProps> = ({ asic, isSelected, onSelect, coolingIcon }) => (
  <button
    onClick={onSelect}
    className={cn(
      "w-full p-2.5 rounded-lg border transition-all text-left group",
      isSelected
        ? "bg-primary/10 border-primary"
        : "bg-background border-border hover:border-muted-foreground hover:bg-muted/30"
    )}
  >
    <div className="flex items-start justify-between gap-2">
      <div className="min-w-0 flex-1">
        {/* Model Name */}
        <div className="flex items-center gap-1.5 mb-0.5">
          <span className="text-xs sm:text-sm font-medium text-foreground truncate">
            {asic.model}
          </span>
          {coolingIcon}
        </div>
        
        {/* Manufacturer */}
        <div className="text-[10px] text-muted-foreground mb-1.5">
          {asic.manufacturer}
        </div>
        
        {/* Specs Row */}
        <div className="flex items-center gap-3 text-[10px] sm:text-xs font-mono">
          <div className="flex items-center gap-1">
            <span className="text-muted-foreground">Hash:</span>
            <span className="font-medium text-foreground">{asic.hashrate_th}</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-muted-foreground">Eff:</span>
            <span className="font-medium text-foreground">{asic.efficiency_jth}</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-muted-foreground">W:</span>
            <span className="font-medium text-foreground">{asic.power_watts}</span>
          </div>
        </div>
      </div>

      {/* Price & Arrow */}
      <div className="flex flex-col items-end gap-1 flex-shrink-0">
        {asic.market_price_usd && (
          <Badge variant="outline" className="text-[9px] px-1.5 py-0">
            ${asic.market_price_usd.toLocaleString()}
          </Badge>
        )}
        <ChevronRight className={cn(
          "w-4 h-4 transition-transform",
          isSelected ? "text-primary" : "text-muted-foreground group-hover:translate-x-0.5"
        )} />
      </div>
    </div>
  </button>
);

export default ASICSelector;
