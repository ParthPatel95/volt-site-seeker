import { useState, useMemo } from 'react';
import { Table, Grid3X3, TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface SensitivityTableProps {
  title: string;
  description?: string;
  rowVariable: {
    name: string;
    values: number[];
    format?: (v: number) => string;
  };
  colVariable: {
    name: string;
    values: number[];
    format?: (v: number) => string;
  };
  calculateValue: (rowVal: number, colVal: number) => number;
  formatResult?: (v: number) => string;
  baseRowIndex?: number;
  baseColIndex?: number;
  colorScale?: 'profitability' | 'roi' | 'neutral';
  className?: string;
}

export default function SensitivityTable({
  title,
  description,
  rowVariable,
  colVariable,
  calculateValue,
  formatResult = (v) => v.toFixed(1),
  baseRowIndex,
  baseColIndex,
  colorScale = 'neutral',
  className = '',
}: SensitivityTableProps) {
  const [hoveredCell, setHoveredCell] = useState<{row: number, col: number} | null>(null);

  const results = useMemo(() => {
    return rowVariable.values.map(rowVal =>
      colVariable.values.map(colVal => calculateValue(rowVal, colVal))
    );
  }, [rowVariable.values, colVariable.values, calculateValue]);

  const { min, max } = useMemo(() => {
    const flat = results.flat();
    return { min: Math.min(...flat), max: Math.max(...flat) };
  }, [results]);

  const getCellColor = (value: number, rowIdx: number, colIdx: number) => {
    const isBase = rowIdx === baseRowIndex && colIdx === baseColIndex;
    
    if (colorScale === 'neutral') {
      if (isBase) return 'bg-primary/20 border-primary';
      return 'bg-muted/30';
    }

    const normalized = max !== min ? (value - min) / (max - min) : 0.5;
    
    if (colorScale === 'profitability') {
      // Red for negative, green for positive
      if (value < 0) {
        const intensity = Math.abs(value / min);
        return `bg-red-500/${Math.round(intensity * 30 + 10)}`;
      } else {
        const intensity = value / max;
        return `bg-green-500/${Math.round(intensity * 30 + 10)}`;
      }
    }

    if (colorScale === 'roi') {
      // Gradient from red (low) to green (high)
      if (normalized < 0.33) {
        return `bg-red-500/${Math.round((1 - normalized * 3) * 30 + 10)}`;
      } else if (normalized < 0.66) {
        return `bg-amber-500/${Math.round(30)}`;
      } else {
        return `bg-green-500/${Math.round((normalized - 0.33) * 1.5 * 30 + 10)}`;
      }
    }

    return 'bg-muted/30';
  };

  const getTextColor = (value: number) => {
    if (colorScale === 'profitability' || colorScale === 'roi') {
      if (value < 0) return 'text-red-600 dark:text-red-400';
      if (value > 0) return 'text-green-600 dark:text-green-400';
    }
    return 'text-foreground';
  };

  return (
    <div className={`bg-card border border-border rounded-2xl overflow-hidden ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-border bg-gradient-to-r from-primary/5 to-transparent">
        <div className="flex items-center gap-2 mb-1">
          <Grid3X3 className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-foreground">{title}</h3>
        </div>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr>
              <th className="p-3 text-left text-sm font-medium text-muted-foreground bg-muted/30 border-b border-r border-border">
                {rowVariable.name} ↓ / {colVariable.name} →
              </th>
              {colVariable.values.map((val, idx) => (
                <th 
                  key={idx}
                  className={`p-3 text-center text-sm font-medium border-b border-border ${
                    idx === baseColIndex ? 'bg-primary/10 text-primary' : 'bg-muted/30 text-muted-foreground'
                  }`}
                >
                  {colVariable.format ? colVariable.format(val) : val}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rowVariable.values.map((rowVal, rowIdx) => (
              <tr key={rowIdx}>
                <td className={`p-3 text-sm font-medium border-r border-b border-border ${
                  rowIdx === baseRowIndex ? 'bg-primary/10 text-primary' : 'bg-muted/30 text-muted-foreground'
                }`}>
                  {rowVariable.format ? rowVariable.format(rowVal) : rowVal}
                </td>
                {colVariable.values.map((_, colIdx) => {
                  const value = results[rowIdx][colIdx];
                  const isHovered = hoveredCell?.row === rowIdx && hoveredCell?.col === colIdx;
                  const isBase = rowIdx === baseRowIndex && colIdx === baseColIndex;
                  
                  return (
                    <td
                      key={colIdx}
                      onMouseEnter={() => setHoveredCell({ row: rowIdx, col: colIdx })}
                      onMouseLeave={() => setHoveredCell(null)}
                      className={`p-3 text-center text-sm font-mono border-b border-border transition-all cursor-default
                        ${getCellColor(value, rowIdx, colIdx)}
                        ${isHovered ? 'ring-2 ring-primary ring-inset' : ''}
                        ${isBase ? 'ring-2 ring-primary font-bold' : ''}
                      `}
                    >
                      <span className={getTextColor(value)}>
                        {formatResult(value)}
                      </span>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Legend */}
      {colorScale !== 'neutral' && (
        <div className="px-4 py-3 bg-muted/20 border-t border-border flex items-center justify-between">
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <TrendingDown className="w-3 h-3 text-red-500" />
              <span>Lower</span>
            </div>
            <div className="flex items-center gap-1">
              <Minus className="w-3 h-3 text-amber-500" />
              <span>Neutral</span>
            </div>
            <div className="flex items-center gap-1">
              <TrendingUp className="w-3 h-3 text-green-500" />
              <span>Higher</span>
            </div>
          </div>
          {baseRowIndex !== undefined && baseColIndex !== undefined && (
            <div className="text-xs text-muted-foreground">
              <span className="inline-block w-3 h-3 bg-primary/20 border border-primary rounded mr-1" />
              Base case
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Pre-built sensitivity tables for common mining scenarios
export function MiningProfitabilitySensitivity({ className = '' }: { className?: string }) {
  const btcPrices = [40000, 50000, 60000, 70000, 80000, 90000, 100000];
  const powerCosts = [0.03, 0.04, 0.05, 0.06, 0.07, 0.08];

  const calculateMonthlyProfit = (btcPrice: number, powerCost: number) => {
    // Assumptions: 100 TH/s, 20 J/TH, 600 EH/s network, 3.125 BTC/block
    const hashrate = 100; // TH/s
    const efficiency = 20; // J/TH
    const networkHashrate = 600_000_000; // TH/s
    const blocksPerMonth = 4320;
    const blockReward = 3.125;
    
    const hashShare = hashrate / networkHashrate;
    const btcPerMonth = hashShare * blocksPerMonth * blockReward;
    const revenue = btcPerMonth * btcPrice;
    
    const powerWatts = hashrate * efficiency;
    const kwhPerMonth = (powerWatts * 730) / 1000;
    const powerCostMonthly = kwhPerMonth * powerCost;
    
    return revenue - powerCostMonthly;
  };

  return (
    <SensitivityTable
      title="Monthly Profit Sensitivity"
      description="Profit per 100 TH/s based on BTC price and power cost"
      rowVariable={{
        name: 'Power Cost',
        values: powerCosts,
        format: (v) => `$${v.toFixed(2)}/kWh`,
      }}
      colVariable={{
        name: 'BTC Price',
        values: btcPrices,
        format: (v) => `$${(v/1000).toFixed(0)}k`,
      }}
      calculateValue={calculateMonthlyProfit}
      formatResult={(v) => v >= 0 ? `$${Math.round(v).toLocaleString()}` : `-$${Math.abs(Math.round(v)).toLocaleString()}`}
      baseRowIndex={2}
      baseColIndex={3}
      colorScale="profitability"
      className={className}
    />
  );
}

export function BreakEvenSensitivity({ className = '' }: { className?: string }) {
  const efficiencies = [15, 18, 21, 24, 27, 30];
  const powerCosts = [0.03, 0.04, 0.05, 0.06, 0.07, 0.08];

  const calculateBreakEvenBtc = (efficiency: number, powerCost: number) => {
    // Break-even BTC price formula
    // Revenue per BTC = (kWh per BTC * power cost)
    // At $65k BTC, 600 EH/s network, 100 TH/s mines ~0.00047 BTC/day
    // kWh per day = (100 * efficiency * 24) / 1000
    const hashrateRatio = 100 / 600_000_000;
    const btcPerDay = hashrateRatio * 144 * 3.125;
    const kwhPerDay = (100 * efficiency * 24) / 1000;
    const breakEven = (kwhPerDay * powerCost) / btcPerDay;
    return breakEven;
  };

  return (
    <SensitivityTable
      title="Break-Even BTC Price"
      description="Minimum BTC price for profitability by efficiency and power cost"
      rowVariable={{
        name: 'Efficiency',
        values: efficiencies,
        format: (v) => `${v} J/TH`,
      }}
      colVariable={{
        name: 'Power Cost',
        values: powerCosts,
        format: (v) => `$${v.toFixed(2)}`,
      }}
      calculateValue={calculateBreakEvenBtc}
      formatResult={(v) => `$${Math.round(v/1000)}k`}
      baseRowIndex={2}
      baseColIndex={2}
      colorScale="roi"
      className={className}
    />
  );
}
