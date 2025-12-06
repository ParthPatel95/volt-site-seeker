import { useState, useEffect } from 'react';
import { RefreshCw, Wifi, WifiOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollReveal } from './ScrollAnimations';
import { LiveERCOTData } from './LiveERCOTData';
import { LiveAESOData } from './LiveAESOData';
import { useUnifiedEnergyData } from '@/hooks/useUnifiedEnergyData';

export const LiveMarketsSection = () => {
  const { refetch, isFetching, dataUpdatedAt, isError, isSuccess } = useUnifiedEnergyData();
  const [lastUpdated, setLastUpdated] = useState<string>('');

  useEffect(() => {
    if (dataUpdatedAt) {
      const updateTimeAgo = () => {
        const diff = Date.now() - dataUpdatedAt;
        const minutes = Math.floor(diff / 60000);
        if (minutes < 1) {
          setLastUpdated('Just now');
        } else if (minutes === 1) {
          setLastUpdated('1 min ago');
        } else {
          setLastUpdated(`${minutes} mins ago`);
        }
      };
      updateTimeAgo();
      const interval = setInterval(updateTimeAgo, 30000);
      return () => clearInterval(interval);
    }
  }, [dataUpdatedAt]);

  const handleRefresh = () => {
    refetch();
  };

  const getConnectionStatus = () => {
    if (isFetching && !dataUpdatedAt) {
      return { label: 'Connecting...', color: 'bg-watt-bitcoin/20 text-watt-bitcoin border-watt-bitcoin/30', icon: Wifi };
    }
    if (isError && !dataUpdatedAt) {
      return { label: 'Offline', color: 'bg-red-500/20 text-red-600 border-red-500/30', icon: WifiOff };
    }
    if (isSuccess || dataUpdatedAt) {
      return { label: 'Live', color: 'bg-watt-success/20 text-watt-success border-watt-success/30', icon: Wifi };
    }
    return { label: 'Connecting...', color: 'bg-watt-bitcoin/20 text-watt-bitcoin border-watt-bitcoin/30', icon: Wifi };
  };

  const status = getConnectionStatus();
  const StatusIcon = status.icon;

  return (
    <section className="relative z-10 py-12 md:py-16 px-3 sm:px-4 md:px-6 bg-white">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <ScrollReveal delay={100}>
          <div className="text-center mb-8 md:mb-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-watt-success/10 border border-watt-success/20 mb-4">
              <div className="w-2 h-2 bg-watt-success rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-watt-success">Real-Time Market Data</span>
            </div>
            
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-watt-navy mb-3 sm:mb-4 leading-tight">
              Live Energy Markets
            </h2>
            <p className="text-base sm:text-lg text-watt-navy/70 max-w-2xl mx-auto leading-relaxed px-2 mb-6">
              Track real-time electricity prices and grid conditions across North American markets
            </p>

            {/* Status Bar */}
            <div className="flex items-center justify-center gap-4 flex-wrap">
              <Badge className={`${status.color} text-xs gap-1.5`}>
                <StatusIcon className="w-3 h-3" />
                {status.label}
              </Badge>
              
              {lastUpdated && (
                <span className="text-xs text-watt-navy/60">
                  Updated: {lastUpdated}
                </span>
              )}

              <Button
                variant="ghost"
                size="sm"
                onClick={handleRefresh}
                disabled={isFetching}
                className="text-watt-navy/60 hover:text-watt-navy hover:bg-watt-light text-xs gap-1.5"
              >
                <RefreshCw className={`w-3 h-3 ${isFetching ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </div>
        </ScrollReveal>

        {/* Market Cards */}
        <ScrollReveal delay={200}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            <LiveERCOTData />
            <LiveAESOData />
          </div>
        </ScrollReveal>

        {/* Footer */}
        <ScrollReveal delay={300}>
          <div className="mt-6 p-4 bg-watt-light border border-gray-200 rounded-lg">
            <div className="text-sm text-watt-navy/70 text-center flex items-center justify-center gap-2">
              <span className="w-2 h-2 bg-watt-success rounded-full animate-pulse"></span>
              <span>Data refreshes every 5 minutes from ERCOT and AESO official sources</span>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
};

export default LiveMarketsSection;
