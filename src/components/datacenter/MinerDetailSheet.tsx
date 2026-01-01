import React from 'react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Cpu,
  Zap,
  Thermometer,
  Gauge,
  Wifi,
  Calendar,
  Moon,
  Power,
  RotateCcw,
  Settings,
  History,
  Trash2,
  Globe,
  Server,
  Activity
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Miner {
  id: string;
  name: string;
  ip_address: string;
  mac_address?: string;
  model: string;
  firmware_type: string;
  api_port: number;
  http_port: number;
  priority_group: string;
  location?: string;
  target_hashrate_th?: number;
  current_hashrate_th?: number;
  current_power_watts?: number;
  inlet_temp_c?: number;
  outlet_temp_c?: number;
  status: string;
  last_seen?: string;
}

interface ControlLogEntry {
  id: string;
  action: string;
  success: boolean;
  timestamp: string;
  response_message?: string;
}

interface MinerDetailSheetProps {
  miner: Miner | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSleep: (ids: string[]) => void;
  onWake: (ids: string[]) => void;
  onReboot: (ids: string[]) => void;
  onDelete: (id: string) => void;
  controlLogs?: ControlLogEntry[];
  isLoading?: boolean;
}

export function MinerDetailSheet({
  miner,
  open,
  onOpenChange,
  onSleep,
  onWake,
  onReboot,
  onDelete,
  controlLogs = [],
  isLoading = false
}: MinerDetailSheetProps) {
  if (!miner) return null;

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'mining':
        return { label: 'Mining', color: 'bg-green-500', textColor: 'text-green-500' };
      case 'sleeping':
        return { label: 'Sleeping', color: 'bg-blue-500', textColor: 'text-blue-500' };
      case 'idle':
        return { label: 'Idle', color: 'bg-yellow-500', textColor: 'text-yellow-500' };
      case 'offline':
        return { label: 'Offline', color: 'bg-muted', textColor: 'text-muted-foreground' };
      case 'error':
        return { label: 'Error', color: 'bg-destructive', textColor: 'text-destructive' };
      case 'rebooting':
        return { label: 'Rebooting', color: 'bg-purple-500', textColor: 'text-purple-500' };
      default:
        return { label: status, color: 'bg-muted', textColor: 'text-muted-foreground' };
    }
  };

  const statusConfig = getStatusConfig(miner.status);
  const efficiency = miner.current_power_watts && miner.current_hashrate_th
    ? (miner.current_power_watts / miner.current_hashrate_th / 1000).toFixed(1)
    : null;

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'Never';
    return new Date(dateStr).toLocaleString();
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg">
        <SheetHeader>
          <div className="flex items-center gap-3">
            <div className={cn(
              "p-2.5 rounded-xl",
              miner.status === 'mining' ? "bg-green-500/20" : "bg-muted"
            )}>
              <Cpu className={cn("w-5 h-5", statusConfig.textColor)} />
            </div>
            <div>
              <SheetTitle className="text-left">{miner.name}</SheetTitle>
              <SheetDescription className="text-left">
                {miner.model} • {miner.firmware_type}
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-180px)] mt-6 pr-4">
          <div className="space-y-6">
            {/* Status Section */}
            <div className="flex items-center gap-3">
              <Badge className={cn("px-3 py-1", statusConfig.color, "text-white")}>
                <span className={cn(
                  "w-2 h-2 rounded-full mr-2 bg-white",
                  miner.status === 'mining' && "animate-pulse"
                )} />
                {statusConfig.label}
              </Badge>
              <Badge variant="outline">{miner.priority_group} Priority</Badge>
            </div>

            {/* Live Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-muted/50 rounded-lg p-4 space-y-1">
                <div className="flex items-center gap-2 text-muted-foreground text-sm">
                  <Zap className="w-4 h-4" />
                  Hashrate
                </div>
                <p className="text-2xl font-bold font-mono">
                  {miner.current_hashrate_th?.toFixed(1) || '--'}
                  <span className="text-sm font-normal text-muted-foreground ml-1">TH/s</span>
                </p>
                {miner.target_hashrate_th && (
                  <p className="text-xs text-muted-foreground">
                    Target: {miner.target_hashrate_th} TH/s
                  </p>
                )}
              </div>

              <div className="bg-muted/50 rounded-lg p-4 space-y-1">
                <div className="flex items-center gap-2 text-muted-foreground text-sm">
                  <Power className="w-4 h-4" />
                  Power
                </div>
                <p className="text-2xl font-bold font-mono">
                  {miner.current_power_watts?.toLocaleString() || '--'}
                  <span className="text-sm font-normal text-muted-foreground ml-1">W</span>
                </p>
                {efficiency && (
                  <p className="text-xs text-muted-foreground">
                    Efficiency: {efficiency} J/TH
                  </p>
                )}
              </div>

              <div className="bg-muted/50 rounded-lg p-4 space-y-1">
                <div className="flex items-center gap-2 text-muted-foreground text-sm">
                  <Thermometer className="w-4 h-4" />
                  Inlet Temp
                </div>
                <p className="text-2xl font-bold font-mono">
                  {miner.inlet_temp_c?.toFixed(0) || '--'}
                  <span className="text-sm font-normal text-muted-foreground ml-1">°C</span>
                </p>
              </div>

              <div className="bg-muted/50 rounded-lg p-4 space-y-1">
                <div className="flex items-center gap-2 text-muted-foreground text-sm">
                  <Thermometer className="w-4 h-4 text-orange-500" />
                  Outlet Temp
                </div>
                <p className="text-2xl font-bold font-mono">
                  {miner.outlet_temp_c?.toFixed(0) || '--'}
                  <span className="text-sm font-normal text-muted-foreground ml-1">°C</span>
                </p>
              </div>
            </div>

            <Separator />

            {/* Network Info */}
            <div className="space-y-3">
              <h4 className="font-semibold flex items-center gap-2">
                <Wifi className="w-4 h-4" />
                Network Configuration
              </h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">IP Address</p>
                  <p className="font-mono">{miner.ip_address}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">MAC Address</p>
                  <p className="font-mono">{miner.mac_address || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">API Port</p>
                  <p className="font-mono">{miner.api_port}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">HTTP Port</p>
                  <p className="font-mono">{miner.http_port}</p>
                </div>
              </div>
            </div>

            <Separator />

            {/* Hardware Info */}
            <div className="space-y-3">
              <h4 className="font-semibold flex items-center gap-2">
                <Server className="w-4 h-4" />
                Hardware Details
              </h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Model</p>
                  <p>{miner.model}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Firmware</p>
                  <p>{miner.firmware_type}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Location</p>
                  <p>{miner.location || 'Not set'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Last Seen</p>
                  <p>{formatDate(miner.last_seen)}</p>
                </div>
              </div>
            </div>

            {/* Control History */}
            {controlLogs.length > 0 && (
              <>
                <Separator />
                <div className="space-y-3">
                  <h4 className="font-semibold flex items-center gap-2">
                    <History className="w-4 h-4" />
                    Recent Control History
                  </h4>
                  <div className="space-y-2">
                    {controlLogs.slice(0, 5).map((log) => (
                      <div key={log.id} className="flex items-center justify-between text-sm bg-muted/50 rounded-lg p-3">
                        <div className="flex items-center gap-2">
                          <span className={cn(
                            "w-2 h-2 rounded-full",
                            log.success ? "bg-green-500" : "bg-destructive"
                          )} />
                          <span className="capitalize">{log.action}</span>
                        </div>
                        <span className="text-muted-foreground text-xs">
                          {formatDate(log.timestamp)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            <Separator />

            {/* Actions */}
            <div className="space-y-3">
              <h4 className="font-semibold flex items-center gap-2">
                <Activity className="w-4 h-4" />
                Quick Actions
              </h4>
              <div className="grid grid-cols-2 gap-3">
                {miner.status === 'mining' ? (
                  <Button
                    variant="outline"
                    onClick={() => onSleep([miner.id])}
                    disabled={isLoading}
                    className="flex items-center gap-2"
                  >
                    <Moon className="w-4 h-4" />
                    Sleep
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    onClick={() => onWake([miner.id])}
                    disabled={isLoading || miner.status === 'offline'}
                    className="flex items-center gap-2"
                  >
                    <Power className="w-4 h-4" />
                    Wake
                  </Button>
                )}
                <Button
                  variant="outline"
                  onClick={() => onReboot([miner.id])}
                  disabled={isLoading || miner.status === 'offline'}
                  className="flex items-center gap-2"
                >
                  <RotateCcw className="w-4 h-4" />
                  Reboot
                </Button>
              </div>
            </div>

            <Separator />

            {/* Danger Zone */}
            <div className="space-y-3">
              <h4 className="font-semibold text-destructive flex items-center gap-2">
                <Trash2 className="w-4 h-4" />
                Danger Zone
              </h4>
              <Button
                variant="destructive"
                onClick={() => {
                  if (confirm('Are you sure you want to remove this miner from the fleet?')) {
                    onDelete(miner.id);
                    onOpenChange(false);
                  }
                }}
                disabled={isLoading}
                className="w-full"
              >
                Remove from Fleet
              </Button>
            </div>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
