import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Cpu, Search, Droplets, Wind, Waves, Loader2, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ASICMiner, CoolingType, Manufacturer, useASICDatabase } from '../hooks/useASICDatabase';
import { useIsMobile } from '@/hooks/use-mobile';

interface ASICSelectorProps {
  selectedASIC: ASICMiner | null;
  onSelectASIC: (asic: ASICMiner) => void;
}

export const ASICSelector: React.FC<ASICSelectorProps> = ({
  selectedASIC,
  onSelectASIC
}) => {
  const isMobile = useIsMobile();
  const [manufacturer, setManufacturer] = React.useState<Manufacturer>('all');
  const [coolingType, setCoolingType] = React.useState<CoolingType>('all');
  const [searchQuery, setSearchQuery] = React.useState('');
  const [showAll, setShowAll] = React.useState(false);
  const [isExpanded, setIsExpanded] = React.useState(!isMobile);

  const { asics, isLoading } = useASICDatabase({
    manufacturer,
    coolingType,
    sortBy: 'hashrate',
    searchQuery
  });

  const displayedASICs = showAll ? asics : asics.slice(0, 6);

  const getCoolingIcon = (type: string) => {
    switch (type) {
      case 'hydro': return <Droplets className="w-3 h-3" />;
      case 'immersion': return <Waves className="w-3 h-3" />;
      default: return <Wind className="w-3 h-3" />;
    }
  };

  const getCoolingColor = (type: string) => {
    switch (type) {
      case 'hydro': return 'bg-chart-1/10 text-chart-1 border-chart-1/30';
      case 'immersion': return 'bg-chart-2/10 text-chart-2 border-chart-2/30';
      default: return 'bg-muted text-muted-foreground border-border';
    }
  };

  const SelectorContent = () => (
    <div className="space-y-3">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
        <Input
          placeholder="Search models..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-8 h-8 sm:h-9 bg-background border-2 border-border text-sm placeholder:text-muted-foreground"
        />
      </div>

      {/* Manufacturer Filters */}
      <div className="flex flex-wrap gap-1">
        {(['all', 'Bitmain', 'MicroBT', 'Canaan', 'Bitdeer'] as Manufacturer[]).map((mfr) => (
          <Button
            key={mfr}
            variant="outline"
            size="sm"
            className={cn(
              "h-6 sm:h-7 px-2 text-[10px] sm:text-xs transition-all border-2",
              manufacturer === mfr
                ? "bg-primary text-primary-foreground border-primary hover:bg-primary/90"
                : "bg-background border-border text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
            onClick={() => setManufacturer(mfr)}
          >
            {mfr === 'all' ? 'All' : mfr}
          </Button>
        ))}
      </div>

      {/* Cooling Type Filters */}
      <div className="flex flex-wrap gap-1">
        {(['all', 'air', 'hydro', 'immersion'] as CoolingType[]).map((type) => (
          <Button
            key={type}
            variant="outline"
            size="sm"
            className={cn(
              "h-6 sm:h-7 px-2 text-[10px] sm:text-xs transition-all flex items-center gap-1 border-2",
              coolingType === type
                ? "bg-secondary text-secondary-foreground border-secondary hover:bg-secondary/90"
                : "bg-background border-border text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
            onClick={() => setCoolingType(type)}
          >
            {type !== 'all' && getCoolingIcon(type)}
            <span className="truncate">
              {type === 'all' ? 'All' : type.charAt(0).toUpperCase() + type.slice(1)}
            </span>
          </Button>
        ))}
      </div>

      {/* ASIC Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-6">
          <Loader2 className="w-5 h-5 text-primary animate-spin" />
        </div>
      ) : asics.length === 0 ? (
        <div className="text-center py-6 text-muted-foreground text-xs sm:text-sm">
          No miners found matching your criteria
        </div>
      ) : (
        <div className="grid grid-cols-1 xs:grid-cols-2 gap-1.5 sm:gap-2">
          {displayedASICs.map((asic) => (
            <button
              key={asic.id}
              className={cn(
                "p-2 sm:p-2.5 rounded-md border-2 text-left transition-all",
                "hover:shadow-md active:scale-[0.98] touch-target",
                selectedASIC?.id === asic.id
                  ? "bg-primary/10 border-primary"
                  : "bg-card border-border hover:border-muted-foreground"
              )}
              onClick={() => onSelectASIC(asic)}
            >
              {/* Model name with proper truncation */}
              <div className="flex items-start justify-between gap-1.5 mb-0.5 sm:mb-1">
                <span className="font-semibold text-[11px] sm:text-xs text-foreground truncate min-w-0 flex-1 leading-tight">
                  {asic.model}
                </span>
                <Badge 
                  variant="outline" 
                  className={cn(
                    "text-[8px] sm:text-[9px] px-1 py-0 h-4 flex-shrink-0",
                    getCoolingColor(asic.cooling_type)
                  )}
                >
                  {getCoolingIcon(asic.cooling_type)}
                </Badge>
              </div>
              
              {/* Manufacturer */}
              <div className="text-[9px] sm:text-[10px] text-muted-foreground mb-1 truncate">
                {asic.manufacturer}
              </div>
              
              {/* Specs Grid */}
              <div className="space-y-0.5">
                <div className="flex justify-between text-[9px] sm:text-[10px] gap-1">
                  <span className="text-muted-foreground">Hash:</span>
                  <span className="font-mono font-medium text-foreground">{asic.hashrate_th} TH/s</span>
                </div>
                <div className="flex justify-between text-[9px] sm:text-[10px] gap-1">
                  <span className="text-muted-foreground">Eff:</span>
                  <span className="font-mono font-medium text-foreground">{asic.efficiency_jth} J/TH</span>
                </div>
                <div className="flex justify-between text-[9px] sm:text-[10px] gap-1">
                  <span className="text-muted-foreground">Power:</span>
                  <span className="font-mono font-medium text-foreground">{asic.power_watts}W</span>
                </div>
              </div>
              
              {/* Price */}
              {asic.market_price_usd && (
                <div className="mt-1.5 text-[10px] sm:text-xs font-semibold text-data-positive">
                  ~${asic.market_price_usd.toLocaleString()}
                </div>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Show More/Less */}
      {asics.length > 6 && (
        <Button
          variant="ghost"
          size="sm"
          className="w-full text-xs text-muted-foreground hover:text-foreground hover:bg-muted h-7 sm:h-8"
          onClick={() => setShowAll(!showAll)}
        >
          {showAll ? 'Show Less' : `Show All ${asics.length} ASICs`}
        </Button>
      )}
    </div>
  );

  // Mobile: Collapsible version
  if (isMobile) {
    return (
      <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
        <CollapsibleTrigger asChild>
          <button className="w-full flex items-center justify-between p-2.5 rounded-md border-2 border-border hover:bg-muted/50 transition-colors">
            <div className="flex items-center gap-2">
              <Cpu className="w-4 h-4 text-primary" />
              <span className="font-medium text-sm text-foreground">
                {selectedASIC ? selectedASIC.model : 'Select Mining Hardware'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-[10px] border-border text-muted-foreground">
                {asics.length}
              </Badge>
              <ChevronDown className={cn(
                "w-4 h-4 text-muted-foreground transition-transform",
                isExpanded && "rotate-180"
              )} />
            </div>
          </button>
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-3">
          <SelectorContent />
        </CollapsibleContent>
      </Collapsible>
    );
  }

  // Desktop: Always visible
  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Cpu className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium text-foreground">Mining Hardware</span>
        </div>
        <Badge variant="outline" className="text-[10px] border-border text-muted-foreground">
          {asics.length} miners
        </Badge>
      </div>
      
      <SelectorContent />
    </div>
  );
};
