import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Cpu, 
  Zap, 
  Thermometer,
  Moon,
  Power,
  RotateCcw,
  Settings,
  Wifi,
  WifiOff,
  AlertTriangle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { HydroMiner } from '@/hooks/useMinerController';

interface MinerCardProps {
  miner: HydroMiner;
  selected?: boolean;
  onSelect?: (id: string) => void;
  onSleep?: (id: string) => void;
  onWake?: (id: string) => void;
  onReboot?: (id: string) => void;
  onViewDetails?: (miner: HydroMiner) => void;
  disabled?: boolean;
}

const MODEL_SPECS: Record<string, { hashrate: number; power: number }> = {
  'S21 Hydro': { hashrate: 335, power: 5360 },
  'S21 XP Hydro': { hashrate: 473, power: 5676 },
  'S19 XP Hydro': { hashrate: 257, power: 5346 },
  'S19 Pro+ Hydro': { hashrate: 198, power: 5445 },
  'T21 Hydro': { hashrate: 190, power: 3610 },
};

export function MinerCard({
  miner,
  selected = false,
  onSelect,
  onSleep,
  onWake,
  onReboot,
  onViewDetails,
  disabled = false
}: MinerCardProps) {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'mining':
        return { 
          color: 'bg-data-positive', 
          textColor: 'text-data-positive',
          label: 'Mining', 
          pulse: true,
          icon: Zap
        };
      case 'sleeping':
        return { 
          color: 'bg-primary', 
          textColor: 'text-primary',
          label: 'Sleeping', 
          pulse: false,
          icon: Moon
        };
      case 'idle':
        return { 
          color: 'bg-data-warning', 
          textColor: 'text-data-warning',
          label: 'Idle', 
          pulse: false,
          icon: Power
        };
      case 'offline':
        return { 
          color: 'bg-muted-foreground', 
          textColor: 'text-muted-foreground',
          label: 'Offline', 
          pulse: false,
          icon: WifiOff
        };
      case 'error':
        return { 
          color: 'bg-data-negative', 
          textColor: 'text-data-negative',
          label: 'Error', 
          pulse: true,
          icon: AlertTriangle
        };
      case 'rebooting':
        return { 
          color: 'bg-primary', 
          textColor: 'text-primary',
          label: 'Rebooting', 
          pulse: true,
          icon: RotateCcw
        };
      default:
        return { 
          color: 'bg-muted', 
          textColor: 'text-muted-foreground',
          label: status, 
          pulse: false,
          icon: Cpu
        };
    }
  };

  const getPriorityVariant = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'error';
      case 'high':
        return 'warning';
      case 'medium':
        return 'info';
      case 'low':
      case 'curtailable':
      default:
        return 'muted';
    }
  };

  const statusConfig = getStatusConfig(miner.current_status);
  const StatusIcon = statusConfig.icon;
  
  const specs = MODEL_SPECS[miner.model] || { hashrate: 0, power: 0 };
  const hashratePercent = specs.hashrate > 0 
    ? ((miner.current_hashrate_th || 0) / specs.hashrate) * 100 
    : 0;
  
  const efficiency = miner.current_hashrate_th && miner.power_consumption_w
    ? (miner.power_consumption_w / miner.current_hashrate_th).toFixed(1)
    : '--';

  const maxTemp = Math.max(miner.inlet_temp_c || 0, miner.outlet_temp_c || 0);
  const tempColor = maxTemp > 55 ? 'text-data-negative' : maxTemp > 45 ? 'text-data-warning' : 'text-data-positive';

  const handleCardClick = () => {
    if (onSelect) {
      onSelect(miner.id);
    }
  };

  const isMining = miner.current_status === 'mining';
  const isSleeping = miner.current_status === 'sleeping' || miner.current_status === 'idle';
  const canControl = miner.current_status !== 'offline' && miner.current_status !== 'error';

  return (
    <Card 
      className={cn(
        "group relative transition-all duration-150 cursor-pointer",
        selected && "ring-1 ring-primary bg-primary/5",
        miner.current_status === 'error' && "border-data-negative/50",
        miner.current_status === 'mining' && "border-data-positive/30"
      )}
      onClick={handleCardClick}
    >
      {/* Selection checkbox */}
      <div 
        className={cn(
          "absolute top-3 left-3 z-10 transition-opacity",
          selected ? "opacity-100" : "opacity-0 group-hover:opacity-100"
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <Checkbox 
          checked={selected} 
          onCheckedChange={() => onSelect?.(miner.id)}
        />
      </div>

      <CardContent className="p-4 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={cn(
              "w-2 h-2 rounded-full",
              statusConfig.color,
              statusConfig.pulse && "animate-pulse"
            )} />
            <span className={cn("text-xs font-medium", statusConfig.textColor)}>
              {statusConfig.label}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <Badge variant="muted" className="text-[10px] font-mono">
              {miner.model}
            </Badge>
            <Badge 
              variant={getPriorityVariant(miner.priority_group) as any}
              className="text-[10px]"
            >
              {miner.priority_group}
            </Badge>
          </div>
        </div>

        {/* Miner Name */}
        <h3 className="font-semibold truncate">{miner.name}</h3>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          {/* Hashrate */}
          <div className="space-y-1">
            <div className="flex items-center gap-1 text-muted-foreground">
              <Zap className="w-3 h-3" />
              <span className="text-[10px] uppercase tracking-wide">Hashrate</span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-lg font-bold font-mono">
                {miner.current_hashrate_th?.toFixed(1) || '0'}
              </span>
              <span className="text-[10px] text-muted-foreground">TH/s</span>
            </div>
            {specs.hashrate > 0 && (
              <div className="w-full bg-muted rounded-full h-1">
                <div 
                  className={cn(
                    "h-1 rounded-full transition-all",
                    hashratePercent >= 90 ? "bg-data-positive" : 
                    hashratePercent >= 70 ? "bg-data-warning" : "bg-data-negative"
                  )}
                  style={{ width: `${Math.min(100, hashratePercent)}%` }}
                />
              </div>
            )}
          </div>

          {/* Power */}
          <div className="space-y-1">
            <div className="flex items-center gap-1 text-muted-foreground">
              <Power className="w-3 h-3" />
              <span className="text-[10px] uppercase tracking-wide">Power</span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-lg font-bold font-mono">
                {miner.power_consumption_w ? (miner.power_consumption_w / 1000).toFixed(2) : '0'}
              </span>
              <span className="text-[10px] text-muted-foreground">kW</span>
            </div>
          </div>

          {/* Temperature */}
          <div className="space-y-1">
            <div className="flex items-center gap-1 text-muted-foreground">
              <Thermometer className="w-3 h-3" />
              <span className="text-[10px] uppercase tracking-wide">Coolant</span>
            </div>
            <div className={cn("flex items-baseline gap-1 font-mono text-sm", tempColor)}>
              <span>{miner.inlet_temp_c?.toFixed(0) || '--'}°</span>
              <span className="text-muted-foreground">→</span>
              <span>{miner.outlet_temp_c?.toFixed(0) || '--'}°C</span>
            </div>
          </div>

          {/* Efficiency */}
          <div className="space-y-1">
            <div className="flex items-center gap-1 text-muted-foreground">
              <Cpu className="w-3 h-3" />
              <span className="text-[10px] uppercase tracking-wide">Efficiency</span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-sm font-mono">{efficiency}</span>
              <span className="text-[10px] text-muted-foreground">J/TH</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center gap-2 text-[10px] text-muted-foreground pt-2 border-t border-border">
          <Wifi className="w-3 h-3" />
          <span className="font-mono">{miner.ip_address}</span>
          <span>•</span>
          <span className="capitalize">{miner.firmware_type}</span>
          {miner.last_seen && (
            <>
              <span>•</span>
              <span>{getTimeAgo(miner.last_seen)}</span>
            </>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-2" onClick={(e) => e.stopPropagation()}>
          {isMining ? (
            <Button 
              variant="outline"
              size="sm" 
              className="flex-1 text-xs"
              onClick={() => onSleep?.(miner.id)}
              disabled={disabled || !canControl || miner.priority_group === 'critical'}
            >
              <Moon className="w-3 h-3 mr-1.5" />
              Sleep
            </Button>
          ) : isSleeping ? (
            <Button 
              variant="default"
              size="sm" 
              className="flex-1 text-xs"
              onClick={() => onWake?.(miner.id)}
              disabled={disabled || miner.current_status === 'offline'}
            >
              <Power className="w-3 h-3 mr-1.5" />
              Wake
            </Button>
          ) : (
            <Button 
              variant="outline"
              size="sm" 
              className="flex-1 text-xs"
              disabled={true}
            >
              <WifiOff className="w-3 h-3 mr-1.5" />
              Offline
            </Button>
          )}
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => onReboot?.(miner.id)}
            disabled={disabled || !canControl}
          >
            <RotateCcw className="w-3 h-3" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => onViewDetails?.(miner)}
          >
            <Settings className="w-3 h-3" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function getTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  
  if (diffMins < 1) return 'now';
  if (diffMins < 60) return `${diffMins}m`;
  
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h`;
  
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d`;
}
