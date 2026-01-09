import React from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Cell, ReferenceLine
} from 'recharts';
import { TornadoItem } from '../services/financialAnalysisService';
import { cn } from '@/lib/utils';
import { AlertTriangle, TrendingUp, TrendingDown } from 'lucide-react';

interface BTCROITornadoChartProps {
  data: TornadoItem[];
  baseCase: number;
}

export const BTCROITornadoChart: React.FC<BTCROITornadoChartProps> = ({
  data,
  baseCase
}) => {
  const formatCurrency = (value: number) => {
    const absValue = Math.abs(value);
    if (absValue >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
    if (absValue >= 1000) return `$${(value / 1000).toFixed(0)}K`;
    return `$${value.toFixed(0)}`;
  };

  // Transform data for tornado visualization
  const chartData = data.map(item => ({
    variable: item.variable,
    lowDelta: item.lowCase - item.baseCase,
    highDelta: item.highCase - item.baseCase,
    lowCase: item.lowCase,
    highCase: item.highCase,
    baseCase: item.baseCase,
    impact: item.impact,
    sensitivity: item.sensitivity
  }));

  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload?.length) return null;
    
    const data = payload[0].payload;
    
    return (
      <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
        <div className="text-sm font-bold text-foreground mb-2">{data.variable}</div>
        <div className="space-y-1 text-xs">
          <div className="flex justify-between gap-4">
            <span className="text-muted-foreground">-20% Scenario:</span>
            <span className={cn(
              "font-mono",
              data.lowCase >= data.baseCase ? "text-data-positive" : "text-destructive"
            )}>
              {formatCurrency(data.lowCase)}
            </span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-muted-foreground">Base Case:</span>
            <span className="font-mono text-foreground">{formatCurrency(data.baseCase)}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-muted-foreground">+20% Scenario:</span>
            <span className={cn(
              "font-mono",
              data.highCase >= data.baseCase ? "text-data-positive" : "text-destructive"
            )}>
              {formatCurrency(data.highCase)}
            </span>
          </div>
          <div className="border-t border-border pt-1 mt-1">
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Total Impact:</span>
              <span className="font-mono font-bold text-watt-bitcoin">{formatCurrency(data.impact)}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Sensitivity:</span>
              <span className="font-mono">{data.sensitivity.toFixed(2)}%/1%</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Find max absolute value for symmetric scale
  const maxDelta = Math.max(
    ...chartData.flatMap(d => [Math.abs(d.lowDelta), Math.abs(d.highDelta)])
  );

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-sm font-bold text-foreground">Sensitivity Analysis</h4>
          <p className="text-xs text-muted-foreground">Impact of ±20% change in each variable</p>
        </div>
        <div className="text-right">
          <div className="text-xs text-muted-foreground">Base Annual Profit</div>
          <div className="text-lg font-mono font-bold text-foreground">{formatCurrency(baseCase)}</div>
        </div>
      </div>

      {/* Tornado Chart */}
      <div className="bg-card border border-border rounded-lg p-4">
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              layout="vertical"
              margin={{ top: 10, right: 30, left: 100, bottom: 10 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                type="number" 
                domain={[-maxDelta * 1.1, maxDelta * 1.1]}
                tickFormatter={formatCurrency}
                stroke="hsl(var(--muted-foreground))"
                tick={{ fontSize: 10 }}
              />
              <YAxis 
                type="category" 
                dataKey="variable" 
                stroke="hsl(var(--muted-foreground))"
                tick={{ fontSize: 11 }}
                width={90}
              />
              <Tooltip content={<CustomTooltip />} />
              <ReferenceLine x={0} stroke="hsl(var(--border))" strokeWidth={2} />
              <Bar dataKey="lowDelta" stackId="stack" barSize={20}>
                {chartData.map((entry, index) => (
                  <Cell 
                    key={`low-${index}`} 
                    fill={entry.lowDelta >= 0 ? "hsl(var(--data-positive))" : "hsl(var(--destructive))"} 
                    fillOpacity={0.7}
                  />
                ))}
              </Bar>
              <Bar dataKey="highDelta" stackId="stack" barSize={20}>
                {chartData.map((entry, index) => (
                  <Cell 
                    key={`high-${index}`} 
                    fill={entry.highDelta >= 0 ? "hsl(var(--data-positive))" : "hsl(var(--destructive))"} 
                    fillOpacity={0.7}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        
        {/* Legend */}
        <div className="flex items-center justify-center gap-6 mt-3 text-xs">
          <div className="flex items-center gap-2">
            <TrendingDown className="w-3 h-3 text-destructive" />
            <span className="text-muted-foreground">Negative Impact</span>
          </div>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-3 h-3 text-data-positive" />
            <span className="text-muted-foreground">Positive Impact</span>
          </div>
        </div>
      </div>

      {/* Variable Impact Table */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="bg-muted/30 border-b border-border px-4 py-2">
          <h5 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
            Impact Ranking
          </h5>
        </div>
        <div className="divide-y divide-border">
          {data.map((item, index) => (
            <div key={item.variable} className="px-4 py-2 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={cn(
                  "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold",
                  index === 0 && "bg-destructive/20 text-destructive",
                  index === 1 && "bg-watt-bitcoin/20 text-watt-bitcoin",
                  index > 1 && "bg-muted text-muted-foreground"
                )}>
                  {index + 1}
                </div>
                <div>
                  <div className="text-sm font-medium text-foreground">{item.variable}</div>
                  <div className="text-xs text-muted-foreground">
                    {item.sensitivity.toFixed(2)}% profit change per 1% variable change
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-1">
                  <AlertTriangle className={cn(
                    "w-3 h-3",
                    index === 0 ? "text-destructive" : "text-muted-foreground"
                  )} />
                  <span className={cn(
                    "text-sm font-mono font-bold",
                    index === 0 ? "text-destructive" : "text-foreground"
                  )}>
                    {formatCurrency(item.impact)}
                  </span>
                </div>
                <div className="text-xs text-muted-foreground">total swing</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BTCROITornadoChart;
