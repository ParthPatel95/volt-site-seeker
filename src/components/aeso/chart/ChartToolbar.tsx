import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Zap, 
  ChevronDown, 
  LineChart, 
  TrendingUp, 
  Bell, 
  Settings,
  Layers,
  Save
} from 'lucide-react';

interface ChartToolbarProps {
  symbol?: string;
  timeInterval: string;
  onTimeIntervalChange: (interval: string) => void;
  onIndicatorsClick?: () => void;
  onAlertsClick?: () => void;
}

const TIME_INTERVALS = [
  { value: '1H', label: '1 Hour' },
  { value: '4H', label: '4 Hours' },
  { value: '24H', label: '1 Day' },
  { value: '48H', label: '2 Days' },
  { value: '72H', label: '3 Days' },
  { value: '1W', label: '1 Week' },
];

export function ChartToolbar({
  symbol = 'AESO/CAD',
  timeInterval,
  onTimeIntervalChange,
  onIndicatorsClick,
  onAlertsClick
}: ChartToolbarProps) {
  return (
    <div className="flex items-center justify-between px-3 py-2 border-b border-border bg-muted/30">
      {/* Left: Symbol + Interval */}
      <div className="flex items-center gap-2">
        {/* Symbol */}
        <div className="flex items-center gap-1.5 pr-3 border-r border-border">
          <Zap className="w-4 h-4 text-primary" />
          <span className="font-semibold text-sm text-foreground">{symbol}</span>
        </div>

        {/* Time Interval Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-7 gap-1 text-xs font-medium">
              {timeInterval}
              <ChevronDown className="w-3 h-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            {TIME_INTERVALS.map((interval) => (
              <DropdownMenuItem
                key={interval.value}
                onClick={() => onTimeIntervalChange(interval.value)}
                className={timeInterval === interval.value ? 'bg-muted' : ''}
              >
                <span className="font-mono text-xs mr-2">{interval.value}</span>
                <span className="text-muted-foreground text-xs">{interval.label}</span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="h-4 w-px bg-border" />

        {/* Chart Type (Future) */}
        <Button variant="ghost" size="sm" className="h-7 gap-1 text-xs">
          <LineChart className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Line</span>
        </Button>

        {/* Indicators */}
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-7 gap-1 text-xs"
          onClick={onIndicatorsClick}
        >
          <Layers className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Indicators</span>
        </Button>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-1">
        {/* Live Badge */}
        <Badge variant="outline" className="h-6 gap-1 text-[10px] font-medium border-emerald-500/50 text-emerald-600 bg-emerald-500/5">
          <span className="relative flex h-1.5 w-1.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
          </span>
          LIVE
        </Badge>

        <div className="h-4 w-px bg-border mx-1" />

        {/* Alerts */}
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-7 w-7 p-0"
          onClick={onAlertsClick}
        >
          <Bell className="w-3.5 h-3.5" />
        </Button>

        {/* Save */}
        <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
          <Save className="w-3.5 h-3.5" />
        </Button>

        {/* Settings */}
        <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
          <Settings className="w-3.5 h-3.5" />
        </Button>
      </div>
    </div>
  );
}
