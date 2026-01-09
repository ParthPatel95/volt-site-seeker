import React, { useState, useMemo } from 'react';
import { ASICMiner } from '../hooks/useASICDatabase';
import { BTCNetworkData } from '../types/btc_roi_types';
import { cn } from '@/lib/utils';
import { 
  Cpu, Zap, DollarSign, TrendingUp, Award, 
  CheckCircle, XCircle, Clock, Minus, Plus, X
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface BTCROIASICComparisonProps {
  miners: ASICMiner[];
  networkData: BTCNetworkData;
  electricityRate: number;
  poolFee: number;
  onRemoveMiner: (index: number) => void;
}

interface MinerAnalysis {
  miner: ASICMiner;
  dailyBTC: number;
  dailyRevenue: number;
  dailyPowerCost: number;
  dailyProfit: number;
  monthlyProfit: number;
  yearlyProfit: number;
  roi12Month: number;
  breakEvenDays: number;
  efficiency: number;
  profitPerTH: number;
  costPerTH: number;
}

export const BTCROIASICComparison: React.FC<BTCROIASICComparisonProps> = ({
  miners,
  networkData,
  electricityRate,
  poolFee,
  onRemoveMiner
}) => {
  const analyses = useMemo((): MinerAnalysis[] => {
    return miners.map(miner => {
      const hashrateTH = miner.hashrate_th * 1e12;
      const dailyBTC = (hashrateTH / networkData.hashrate) * 144 * networkData.blockReward;
      const dailyRevenue = dailyBTC * networkData.price;
      const dailyPowerCost = (miner.power_watts / 1000) * 24 * electricityRate;
      const dailyPoolFees = dailyRevenue * (poolFee / 100);
      const dailyProfit = dailyRevenue - dailyPowerCost - dailyPoolFees;
      const monthlyProfit = dailyProfit * 30;
      const yearlyProfit = dailyProfit * 365;
      const price = miner.market_price_usd || 3000;
      const roi12Month = (yearlyProfit / price) * 100;
      const breakEvenDays = dailyProfit > 0 ? price / dailyProfit : Infinity;
      const profitPerTH = dailyProfit / miner.hashrate_th;
      const costPerTH = price / miner.hashrate_th;

      return {
        miner,
        dailyBTC,
        dailyRevenue,
        dailyPowerCost,
        dailyProfit,
        monthlyProfit,
        yearlyProfit,
        roi12Month,
        breakEvenDays,
        efficiency: miner.efficiency_jth,
        profitPerTH,
        costPerTH
      };
    });
  }, [miners, networkData, electricityRate, poolFee]);

  const getBestIndex = (metric: keyof MinerAnalysis, higherIsBetter: boolean = true) => {
    if (analyses.length === 0) return -1;
    let bestIdx = 0;
    for (let i = 1; i < analyses.length; i++) {
      const current = analyses[i][metric] as number;
      const best = analyses[bestIdx][metric] as number;
      if (higherIsBetter ? current > best : current < best) {
        bestIdx = i;
      }
    }
    return bestIdx;
  };

  const formatCurrency = (value: number) => {
    if (Math.abs(value) >= 1000) return `$${(value / 1000).toFixed(2)}K`;
    return `$${value.toFixed(2)}`;
  };

  const formatBTC = (value: number) => {
    if (value >= 1) return `${value.toFixed(4)} BTC`;
    return `${Math.round(value * 100000000).toLocaleString()} sats`;
  };

  if (miners.length === 0) {
    return (
      <div className="bg-card border border-border rounded-lg p-8 text-center">
        <Cpu className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-bold text-foreground mb-2">No Miners Selected</h3>
        <p className="text-sm text-muted-foreground">
          Select up to 4 miners from the catalog to compare their performance and profitability.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Miner Cards Header */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {analyses.map((analysis, index) => (
          <div 
            key={analysis.miner.id} 
            className={cn(
              "relative bg-card border-2 rounded-lg p-4",
              analysis.dailyProfit > 0 ? "border-data-positive/50" : "border-destructive/50"
            )}
          >
            {/* Remove button */}
            <button
              onClick={() => onRemoveMiner(index)}
              className="absolute top-2 right-2 p-1 rounded-full hover:bg-muted transition-colors"
            >
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
            
            {/* Best badge */}
            {getBestIndex('roi12Month') === index && (
              <div className="absolute -top-2 left-4 px-2 py-0.5 bg-watt-bitcoin text-white text-[10px] font-bold rounded">
                BEST ROI
              </div>
            )}
            
            <div className="text-xs text-muted-foreground uppercase tracking-wider">
              {analysis.miner.manufacturer}
            </div>
            <div className="text-base font-bold text-foreground mb-3 line-clamp-1">
              {analysis.miner.model}
            </div>
            
            {/* Key specs */}
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Hashrate</span>
                <span className="font-mono font-bold">{analysis.miner.hashrate_th} TH/s</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Power</span>
                <span className="font-mono">{analysis.miner.power_watts}W</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Efficiency</span>
                <span className={cn(
                  "font-mono",
                  getBestIndex('efficiency', false) === index && "text-data-positive font-bold"
                )}>
                  {analysis.efficiency.toFixed(1)} J/TH
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Price</span>
                <span className="font-mono">${analysis.miner.market_price_usd?.toLocaleString()}</span>
              </div>
            </div>
            
            {/* Profitability indicator */}
            <div className={cn(
              "mt-3 pt-3 border-t border-border text-center",
              analysis.dailyProfit > 0 ? "text-data-positive" : "text-destructive"
            )}>
              <div className="text-lg font-mono font-bold">
                {formatCurrency(analysis.dailyProfit)}/day
              </div>
              <div className="text-xs text-muted-foreground">
                {analysis.dailyProfit > 0 ? 'Profitable' : 'Unprofitable'}
              </div>
            </div>
          </div>
        ))}
        
        {/* Add more slot */}
        {miners.length < 4 && (
          <div className="border-2 border-dashed border-border rounded-lg p-4 flex items-center justify-center min-h-[200px]">
            <div className="text-center text-muted-foreground">
              <Plus className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <span className="text-sm">Add miner to compare</span>
            </div>
          </div>
        )}
      </div>

      {/* Comparison Table */}
      {analyses.length > 1 && (
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <div className="bg-muted/30 border-b border-border px-4 py-3">
            <h4 className="text-sm font-bold text-foreground uppercase tracking-wider">
              Side-by-Side Comparison
            </h4>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/20">
                  <th className="text-left px-4 py-2 text-muted-foreground font-medium">Metric</th>
                  {analyses.map((a, i) => (
                    <th key={i} className="text-right px-4 py-2 text-muted-foreground font-medium">
                      {a.miner.model.split(' ').slice(0, 2).join(' ')}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                <ComparisonRow 
                  label="Daily BTC Mined" 
                  values={analyses.map(a => formatBTC(a.dailyBTC))}
                  bestIndex={getBestIndex('dailyBTC')}
                />
                <ComparisonRow 
                  label="Daily Revenue" 
                  values={analyses.map(a => formatCurrency(a.dailyRevenue))}
                  bestIndex={getBestIndex('dailyRevenue')}
                />
                <ComparisonRow 
                  label="Daily Power Cost" 
                  values={analyses.map(a => formatCurrency(a.dailyPowerCost))}
                  bestIndex={getBestIndex('dailyPowerCost', false)}
                  inverse
                />
                <ComparisonRow 
                  label="Daily Profit" 
                  values={analyses.map(a => formatCurrency(a.dailyProfit))}
                  bestIndex={getBestIndex('dailyProfit')}
                  highlight
                />
                <ComparisonRow 
                  label="Monthly Profit" 
                  values={analyses.map(a => formatCurrency(a.monthlyProfit))}
                  bestIndex={getBestIndex('monthlyProfit')}
                />
                <ComparisonRow 
                  label="Yearly Profit" 
                  values={analyses.map(a => formatCurrency(a.yearlyProfit))}
                  bestIndex={getBestIndex('yearlyProfit')}
                />
                <ComparisonRow 
                  label="12-Month ROI" 
                  values={analyses.map(a => `${a.roi12Month.toFixed(0)}%`)}
                  bestIndex={getBestIndex('roi12Month')}
                  highlight
                />
                <ComparisonRow 
                  label="Break-Even" 
                  values={analyses.map(a => 
                    a.breakEvenDays === Infinity ? 'Never' : `${Math.ceil(a.breakEvenDays)} days`
                  )}
                  bestIndex={getBestIndex('breakEvenDays', false)}
                />
                <ComparisonRow 
                  label="Efficiency" 
                  values={analyses.map(a => `${a.efficiency.toFixed(1)} J/TH`)}
                  bestIndex={getBestIndex('efficiency', false)}
                />
                <ComparisonRow 
                  label="Profit per TH" 
                  values={analyses.map(a => formatCurrency(a.profitPerTH))}
                  bestIndex={getBestIndex('profitPerTH')}
                />
                <ComparisonRow 
                  label="Cost per TH" 
                  values={analyses.map(a => formatCurrency(a.costPerTH))}
                  bestIndex={getBestIndex('costPerTH', false)}
                  inverse
                />
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Winner Summary */}
      {analyses.length > 1 && (
        <div className="bg-card border border-border rounded-lg p-4">
          <h4 className="text-sm font-bold text-foreground mb-3">Recommendation</h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <WinnerCard 
              title="Best ROI"
              winner={analyses[getBestIndex('roi12Month')]}
              value={`${analyses[getBestIndex('roi12Month')]?.roi12Month.toFixed(0)}%`}
              icon={<TrendingUp className="w-4 h-4" />}
            />
            <WinnerCard 
              title="Most Efficient"
              winner={analyses[getBestIndex('efficiency', false)]}
              value={`${analyses[getBestIndex('efficiency', false)]?.efficiency.toFixed(1)} J/TH`}
              icon={<Zap className="w-4 h-4" />}
            />
            <WinnerCard 
              title="Fastest Payback"
              winner={analyses[getBestIndex('breakEvenDays', false)]}
              value={`${Math.ceil(analyses[getBestIndex('breakEvenDays', false)]?.breakEvenDays || 0)} days`}
              icon={<Clock className="w-4 h-4" />}
            />
          </div>
        </div>
      )}
    </div>
  );
};

const ComparisonRow: React.FC<{
  label: string;
  values: string[];
  bestIndex: number;
  highlight?: boolean;
  inverse?: boolean;
}> = ({ label, values, bestIndex, highlight, inverse }) => (
  <tr className={cn(highlight && "bg-muted/20")}>
    <td className={cn(
      "px-4 py-2 text-muted-foreground",
      highlight && "font-medium text-foreground"
    )}>
      {label}
    </td>
    {values.map((value, i) => (
      <td 
        key={i} 
        className={cn(
          "text-right px-4 py-2 font-mono",
          i === bestIndex && !inverse && "text-data-positive font-bold",
          i === bestIndex && inverse && "text-data-positive font-bold",
          highlight && "font-medium"
        )}
      >
        {i === bestIndex && <Award className="w-3 h-3 inline mr-1 text-watt-bitcoin" />}
        {value}
      </td>
    ))}
  </tr>
);

const WinnerCard: React.FC<{
  title: string;
  winner: MinerAnalysis | undefined;
  value: string;
  icon: React.ReactNode;
}> = ({ title, winner, value, icon }) => (
  <div className="bg-muted/20 rounded-lg p-3">
    <div className="flex items-center gap-2 text-muted-foreground mb-1">
      {icon}
      <span className="text-xs uppercase tracking-wider">{title}</span>
    </div>
    {winner ? (
      <>
        <div className="text-sm font-bold text-foreground">{winner.miner.model}</div>
        <div className="text-lg font-mono text-data-positive font-bold">{value}</div>
      </>
    ) : (
      <div className="text-sm text-muted-foreground">No data</div>
    )}
  </div>
);

export default BTCROIASICComparison;
