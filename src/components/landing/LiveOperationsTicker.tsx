import React from 'react';
import { useAESOData } from '@/hooks/useAESOData';
import { useBitcoinNetworkStats } from '@/hooks/useBitcoinNetworkStats';

const Dot: React.FC<{ live: boolean }> = ({ live }) => (
  <span className="relative inline-flex h-1.5 w-1.5">
    {live && (
      <span className="absolute inline-flex h-full w-full rounded-full bg-watt-success opacity-75 animate-ping" />
    )}
    <span
      className={`relative inline-flex rounded-full h-1.5 w-1.5 ${
        live ? 'bg-watt-success' : 'bg-muted-foreground/50'
      }`}
    />
  </span>
);

const Cell: React.FC<{
  label: string;
  value: string;
  live?: boolean;
}> = ({ label, value, live }) => (
  <div className="flex items-center gap-2.5 whitespace-nowrap">
    <span className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground font-semibold">
      {label}
    </span>
    <span className="font-mono text-xs sm:text-sm text-foreground tabular-nums font-medium">
      {value}
    </span>
    {live !== undefined && <Dot live={live} />}
  </div>
);

export const LiveOperationsTicker: React.FC = () => {
  const { pricing, loadData, isLoading } = useAESOData();
  const { stats: btc, isLoading: btcLoading } = useBitcoinNetworkStats();

  const aesoLive = !!pricing && !isLoading;
  const btcLive = !!btc && !btcLoading && btc.dataSource !== 'fallback';

  const poolPrice = pricing ? `$${pricing.current_price.toFixed(2)}/MWh` : '—';
  const demand = loadData ? `${(loadData.current_demand_mw / 1000).toFixed(2)} GW` : '—';
  const btcPrice = btc ? `$${Math.round(btc.price).toLocaleString('en-US')}` : '—';
  const hashrate = btc ? btc.hashrateFormatted : '—';
  const hashPrice = btc ? `$${btc.hashPrice.toFixed(4)}/TH/d` : '—';

  return (
    <div
      aria-label="Live operations data"
      className="border-y border-border bg-card/60 backdrop-blur-sm"
    >
      <div className="max-w-7xl mx-auto px-6 py-2.5 flex items-center gap-6 overflow-x-auto scrollbar-none">
        <span className="text-[10px] uppercase tracking-[0.18em] text-watt-bitcoin font-bold shrink-0">
          Live · Markets
        </span>
        <div className="flex items-center gap-x-7 gap-y-1 flex-wrap min-w-0">
          <Cell label="AESO Pool" value={poolPrice} live={aesoLive} />
          <Cell label="AB Demand" value={demand} live={aesoLive} />
          <Cell label="BTC" value={btcPrice} live={btcLive} />
          <Cell label="Hashrate" value={hashrate} live={btcLive} />
          <Cell label="Hashprice" value={hashPrice} live={btcLive} />
        </div>
      </div>
    </div>
  );
};

export default LiveOperationsTicker;