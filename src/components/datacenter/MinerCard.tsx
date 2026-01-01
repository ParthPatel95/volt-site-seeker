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
          color: 'bg-emerald-500', 
          textColor: 'text-emerald-500',
          label: 'Mining', 
          pulse: true,
          icon: Zap
        };
      case 'sleeping':
        return { 
          color: 'bg-blue-500', 
          textColor: 'text-blue-500',
          label: 'Sleeping', 
          pulse: false,
          icon: Moon
        };
      case 'idle':
        return { 
          color: 'bg-yellow-500', 
          textColor: 'text-yellow-500',
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
          color: 'bg-destructive', 
          textColor: 'text-destructive',
          label: 'Error', 
          pulse: true,
          icon: AlertTriangle
        };
      case 'rebooting':
        return { 
          color: 'bg-purple-500', 
          textColor: 'text-purple-500',
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

  const getPriorityConfig = (priority: string) => {
    switch (priority) {
      case 'critical':
        return { variant: 'destructive' as const, label: 'Critical' };
      case 'high':
        return { variant: 'default' as const, label: 'High', className: 'bg-orange-500 hover:bg-orange-500/90' };
      case 'medium':
        return { variant: 'secondary' as const, label: 'Medium' };
      case 'low':
        return { variant: 'outline' as const, label: 'Low' };
      case 'curtailable':
        return { variant: 'outline' as const, label: 'Curtailable', className: 'border-dashed' };
      default:
        return { variant: 'outline' as const, label: priority };
    }
  };

  const statusConfig = getStatusConfig(miner.current_status);
  const priorityConfig = getPriorityConfig(miner.priority_group);
  const StatusIcon = statusConfig.icon;
  
  const specs = MODEL_SPECS[miner.model] || { hashrate: 0, power: 0 };
  const hashratePercent = specs.hashrate > 0 
    ? ((miner.current_hashrate_th || 0) / specs.hashrate) * 100 
    : 0;
  
  // Calculate efficiency
  const efficiency = miner.current_hashrate_th && miner.power_consumption_w
    ? (miner.power_consumption_w / miner.current_hashrate_th).toFixed(1)
    : '--';

  // Temperature gradient calculation
  const maxTemp = Math.max(miner.inlet_temp_c || 0, miner.outlet_temp_c || 0);
  const tempColor = maxTemp > 55 ? 'text-destructive' : maxTemp > 45 ? 'text-yellow-500' : 'text-emerald-500';

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
        "group relative overflow-hidden transition-all duration-200 cursor-pointer",
        "hover:shadow-lg hover:shadow-primary/5",
        selected && "ring-2 ring-primary bg-primary/5",
        miner.current_status === 'error' && "border-destructive",
        miner.current_status === 'mining' && "border-emerald-500/50"
      )}
      onClick={handleCardClick}
    >
      {/* Selection checkbox overlay */}
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
        {/* Header: Status + Priority */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={cn(
              "w-2.5 h-2.5 rounded-full",
              statusConfig.color,
              statusConfig.pulse && "animate-pulse"
            )} />
            <span className={cn("text-sm font-medium", statusConfig.textColor)}>
              {statusConfig.label}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs font-normal">
              {miner.model}
            </Badge>
            <Badge 
              variant={priorityConfig.variant}
              className={cn("text-xs", priorityConfig.className)}
            >
              {priorityConfig.label}
            </Badge>
          </div>
        </div>

        {/* Miner Name */}
        <div>
          <h3 className="font-semibold text-lg truncate">{miner.name}</h3>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          {/* Hashrate */}
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Zap className="w-3.5 h-3.5" />
              <span className="text-xs">Hashrate</span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-bold font-mono">
                {miner.current_hashrate_th?.toFixed(1) || '0'}
              </span>
              <span className="text-xs text-muted-foreground">TH/s</span>
            </div>
            {specs.hashrate > 0 && (
              <div className="w-full bg-muted rounded-full h-1.5">
                <div 
                  className={cn(
                    "h-1.5 rounded-full transition-all",
                    hashratePercent >= 90 ? "bg-emerald-500" : 
                    hashratePercent >= 70 ? "bg-yellow-500" : "bg-destructive"
                  )}
                  style={{ width: `${Math.min(100, hashratePercent)}%` }}
                />
              </div>
            )}
          </div>

          {/* Power */}
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Power className="w-3.5 h-3.5" />
              <span className="text-xs">Power</span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-bold font-mono">
                {miner.power_consumption_w ? (miner.power_consumption_w / 1000).toFixed(2) : '0'}
              </span>
              <span className="text-xs text-muted-foreground">kW</span>
            </div>
          </div>

          {/* Temperature */}
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Thermometer className="w-3.5 h-3.5" />
              <span className="text-xs">Coolant</span>
            </div>
            <div className={cn("flex items-baseline gap-1", tempColor)}>
              <span className="text-sm font-mono">
                {miner.inlet_temp_c?.toFixed(0) || '--'}°
              </span>
              <span className="text-xs text-muted-foreground">→</span>
              <span className="text-sm font-mono">
                {miner.outlet_temp_c?.toFixed(0) || '--'}°C
              </span>
            </div>
          </div>

          {/* Efficiency */}
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Cpu className="w-3.5 h-3.5" />
              <span className="text-xs">Efficiency</span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-sm font-mono">{efficiency}</span>
              <span className="text-xs text-muted-foreground">J/TH</span>
            </div>
          </div>
        </div>

        {/* Footer: IP + Firmware + Last seen */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2 border-t border-border/50">
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

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2" onClick={(e) => e.stopPropagation()}>
          {isMining ? (
            <Button 
              variant="outline"
              size="sm" 
              className="flex-1 border-blue-500/50 text-blue-500 hover:bg-blue-500/10 hover:text-blue-500"
              onClick={() => onSleep?.(miner.id)}
              disabled={disabled || !canControl || miner.priority_group === 'critical'}
            >
              <Moon className="w-3.5 h-3.5 mr-1.5" />
              Sleep
            </Button>
          ) : isSleeping ? (
            <Button 
              variant="default"
              size="sm" 
              className="flex-1"
              onClick={() => onWake?.(miner.id)}
              disabled={disabled || miner.current_status === 'offline'}
            >
              <Power className="w-3.5 h-3.5 mr-1.5" />
              Wake
            </Button>
          ) : (
            <Button 
              variant="outline"
              size="sm" 
              className="flex-1"
              disabled={true}
            >
              <WifiOff className="w-3.5 h-3.5 mr-1.5" />
              Offline
            </Button>
          )}
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => onReboot?.(miner.id)}
            disabled={disabled || !canControl}
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => onViewDetails?.(miner)}
          >
            <Settings className="w-3.5 h-3.5" />
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
  
  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
}
