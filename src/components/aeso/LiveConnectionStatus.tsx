import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Wifi, 
  WifiOff, 
  RefreshCw, 
  Clock,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

interface LiveConnectionStatusProps {
  lastUpdated?: string | Date;
  onRefresh?: () => void;
  isRefreshing?: boolean;
  dataSource?: string;
}

export function LiveConnectionStatus({
  lastUpdated,
  onRefresh,
  isRefreshing = false,
  dataSource = 'AESO'
}: LiveConnectionStatusProps) {
  const [secondsAgo, setSecondsAgo] = useState(0);

  useEffect(() => {
    if (!lastUpdated) return;

    const updateSeconds = () => {
      const lastUpdateTime = new Date(lastUpdated).getTime();
      const now = Date.now();
      const diffSeconds = Math.floor((now - lastUpdateTime) / 1000);
      setSecondsAgo(diffSeconds);
    };

    updateSeconds();
    const interval = setInterval(updateSeconds, 1000);
    return () => clearInterval(interval);
  }, [lastUpdated]);

  const getConnectionStatus = () => {
    if (!lastUpdated) return { status: 'disconnected', color: 'text-red-500', bgColor: 'bg-red-500/10' };
    if (secondsAgo < 120) return { status: 'live', color: 'text-green-500', bgColor: 'bg-green-500/10' };
    if (secondsAgo < 300) return { status: 'delayed', color: 'text-yellow-500', bgColor: 'bg-yellow-500/10' };
    return { status: 'stale', color: 'text-orange-500', bgColor: 'bg-orange-500/10' };
  };

  const formatTimeAgo = (seconds: number): string => {
    if (seconds < 60) return `${seconds}s ago`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    return `${Math.floor(seconds / 3600)}h ago`;
  };

  const { status, color, bgColor } = getConnectionStatus();

  const StatusIcon = () => {
    switch (status) {
      case 'live':
        return <CheckCircle2 className={`w-3.5 h-3.5 ${color}`} />;
      case 'delayed':
        return <Clock className={`w-3.5 h-3.5 ${color}`} />;
      case 'stale':
        return <AlertCircle className={`w-3.5 h-3.5 ${color}`} />;
      default:
        return <WifiOff className={`w-3.5 h-3.5 ${color}`} />;
    }
  };

  return (
    <div className={`flex items-center justify-between gap-3 px-4 py-2 rounded-lg ${bgColor} border border-border/50`}>
      <div className="flex items-center gap-3">
        {/* Connection indicator */}
        <div className="flex items-center gap-2">
          <div className="relative">
            {status === 'live' && (
              <div className={`absolute inset-0 w-2 h-2 rounded-full ${color.replace('text-', 'bg-')} animate-ping`} />
            )}
            <div className={`w-2 h-2 rounded-full ${color.replace('text-', 'bg-')}`} />
          </div>
          <StatusIcon />
        </div>

        {/* Status text */}
        <div className="flex items-center gap-2 text-sm">
          <span className="text-muted-foreground">
            {dataSource}
          </span>
          <span className="text-muted-foreground">•</span>
          <span className={`font-medium ${color}`}>
            {status === 'live' && 'Connected'}
            {status === 'delayed' && 'Delayed'}
            {status === 'stale' && 'Stale Data'}
            {status === 'disconnected' && 'Disconnected'}
          </span>
        </div>

        {/* Last updated */}
        {lastUpdated && (
          <>
            <span className="text-muted-foreground">•</span>
            <span className="text-xs text-muted-foreground">
              Updated {formatTimeAgo(secondsAgo)}
            </span>
          </>
        )}
      </div>

      {/* Refresh button */}
      {onRefresh && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onRefresh}
          disabled={isRefreshing}
          className="h-7 px-2 hover:bg-background/50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
          <span className="ml-1.5 text-xs hidden sm:inline">Refresh</span>
        </Button>
      )}
    </div>
  );
}
