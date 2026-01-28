import React, { useState, useEffect } from 'react';
import { Clock, Radio } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface RefreshCountdownProps {
  nextRefresh: Date | null;
  isLoading: boolean;
  lastFetched: Date | null;
}

export function RefreshCountdown({ nextRefresh, isLoading, lastFetched }: RefreshCountdownProps) {
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    if (!nextRefresh) return;

    const tick = () => {
      const diff = nextRefresh.getTime() - Date.now();
      if (diff <= 0) {
        setTimeLeft('Refreshing...');
        return;
      }
      const mins = Math.floor(diff / 60000);
      const secs = Math.floor((diff % 60000) / 1000);
      setTimeLeft(`${mins}:${secs.toString().padStart(2, '0')}`);
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [nextRefresh]);

  const formatLastUpdated = (date: Date | null) => {
    if (!date) return 'Never';
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins === 1) return '1 min ago';
    if (diffMins < 60) return `${diffMins} mins ago`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours === 1) return '1 hour ago';
    return `${diffHours} hours ago`;
  };

  return (
    <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
      {/* Auto-refresh indicator */}
      <div className="flex items-center gap-1.5">
        <Radio className="w-3 h-3 text-green-500 animate-pulse" />
        <span>Auto-refresh</span>
        <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 bg-green-50 text-green-700 border-green-200">
          ON
        </Badge>
      </div>

      {/* Countdown */}
      <div className="flex items-center gap-1.5">
        <Clock className="w-3 h-3" />
        <span>Next: {isLoading ? 'Updating...' : timeLeft}</span>
      </div>

      {/* Last updated */}
      {lastFetched && (
        <div className="flex items-center gap-1.5">
          <span className="text-muted-foreground/60">•</span>
          <span>Updated {formatLastUpdated(lastFetched)}</span>
        </div>
      )}
    </div>
  );
}
