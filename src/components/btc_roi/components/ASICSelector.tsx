import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Cpu, Search, Droplets, Wind, Waves, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ASICMiner, CoolingType, Manufacturer, useASICDatabase } from '../hooks/useASICDatabase';

interface ASICSelectorProps {
  selectedASIC: ASICMiner | null;
  onSelectASIC: (asic: ASICMiner) => void;
}

export const ASICSelector: React.FC<ASICSelectorProps> = ({
  selectedASIC,
  onSelectASIC
}) => {
  const [manufacturer, setManufacturer] = React.useState<Manufacturer>('all');
  const [coolingType, setCoolingType] = React.useState<CoolingType>('all');
  const [searchQuery, setSearchQuery] = React.useState('');
  const [showAll, setShowAll] = React.useState(false);

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
      case 'hydro': return 'text-blue-500 bg-blue-50 border-blue-200';
      case 'immersion': return 'text-purple-500 bg-purple-50 border-purple-200';
      default: return 'text-muted-foreground bg-muted border-border';
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Cpu className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium text-foreground">Select Mining Hardware</span>
        </div>
        <Badge variant="outline" className="text-xs border-border text-muted-foreground">
          {asics.length} miners
        </Badge>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search models..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9 h-9 bg-background border-border text-foreground placeholder:text-muted-foreground"
        />
      </div>

      {/* Manufacturer Filters */}
      <div className="flex flex-wrap gap-1.5">
        {(['all', 'Bitmain', 'MicroBT', 'Canaan', 'Bitdeer'] as Manufacturer[]).map((mfr) => (
          <Button
            key={mfr}
            variant="outline"
            size="sm"
            className={cn(
              "h-7 px-2.5 text-xs transition-all",
              manufacturer === mfr
                ? "bg-primary text-primary-foreground border-primary hover:bg-primary/90"
                : "bg-background border-border text-muted-foreground hover:bg-muted hover:border-border"
            )}
            onClick={() => setManufacturer(mfr)}
          >
            {mfr === 'all' ? 'All' : mfr}
          </Button>
        ))}
      </div>

      {/* Cooling Type Filters */}
      <div className="flex gap-1.5">
        {(['all', 'air', 'hydro', 'immersion'] as CoolingType[]).map((type) => (
          <Button
            key={type}
            variant="outline"
            size="sm"
            className={cn(
              "h-7 px-2.5 text-xs transition-all flex items-center gap-1",
              coolingType === type
                ? "bg-secondary text-secondary-foreground border-secondary hover:bg-secondary/90"
                : "bg-background border-border text-muted-foreground hover:bg-muted"
            )}
            onClick={() => setCoolingType(type)}
          >
            {type !== 'all' && getCoolingIcon(type)}
            {type === 'all' ? 'All Cooling' : type.charAt(0).toUpperCase() + type.slice(1)}
          </Button>
        ))}
      </div>

      {/* ASIC Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 text-primary animate-spin" />
        </div>
      ) : asics.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground text-sm">
          No miners found matching your criteria
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2">
          {displayedASICs.map((asic) => (
            <button
              key={asic.id}
              className={cn(
                "p-3 rounded-lg border text-left transition-all hover:shadow-md",
                selectedASIC?.id === asic.id
                  ? "bg-primary/5 border-primary shadow-sm"
                  : "bg-card border-border hover:border-border"
              )}
              onClick={() => onSelectASIC(asic)}
            >
              <div className="flex items-start justify-between mb-1">
                <span className="font-semibold text-xs text-foreground truncate">
                  {asic.model}
                </span>
                <Badge 
                  variant="outline" 
                  className={cn("text-[10px] px-1.5 py-0", getCoolingColor(asic.cooling_type))}
                >
                  {getCoolingIcon(asic.cooling_type)}
                </Badge>
              </div>
              <div className="text-[10px] text-muted-foreground mb-1.5">{asic.manufacturer}</div>
              <div className="grid grid-cols-2 gap-x-2 text-[10px]">
                <div>
                  <span className="text-muted-foreground">Hashrate:</span>
                  <span className="text-foreground font-medium ml-1">{asic.hashrate_th} TH/s</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Efficiency:</span>
                  <span className="text-foreground font-medium ml-1">{asic.efficiency_jth} J/TH</span>
                </div>
              </div>
              {asic.market_price_usd && (
                <div className="mt-1.5 text-xs font-semibold text-market-positive">
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
          className="w-full text-muted-foreground hover:text-foreground hover:bg-muted"
          onClick={() => setShowAll(!showAll)}
        >
          {showAll ? `Show Less` : `Show All ${asics.length} ASICs`}
        </Button>
      )}
    </div>
  );
};
