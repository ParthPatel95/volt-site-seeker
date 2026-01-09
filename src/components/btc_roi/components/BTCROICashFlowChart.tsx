import React, { useMemo } from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  ReferenceLine, ComposedChart, Bar, Line
} from 'recharts';
import { CashFlowMonth } from '../services/financialAnalysisService';
import { cn } from '@/lib/utils';
import { TrendingUp, DollarSign, Calendar } from 'lucide-react';

interface BTCROICashFlowChartProps {
  projections: CashFlowMonth[];
  initialInvestment: number;
  showCumulative?: boolean;
}

export const BTCROICashFlowChart: React.FC<BTCROICashFlowChartProps> = ({
  projections,
  initialInvestment,
  showCumulative = true
}) => {
  const chartData = useMemo(() => {
    return projections.map(p => ({
      month: p.month,
      monthLabel: `M${p.month}`,
      revenue: p.revenue,
      costs: -(p.powerCost + p.poolFees + p.maintenance),
      netCashFlow: p.netCashFlow,
      cumulative: p.cumulativeCashFlow,
      btcMined: p.btcMined,
      btcPrice: p.btcPrice
    }));
  }, [projections]);

  const breakEvenMonth = useMemo(() => {
    for (let i = 0; i < projections.length; i++) {
      if (projections[i].cumulativeCashFlow >= 0) {
        return i + 1;
      }
    }
    return null;
  }, [projections]);

  const totalProfit = projections.length > 0 
    ? projections[projections.length - 1].cumulativeCashFlow 
    : 0;

  const avgMonthlyCashFlow = projections.length > 0
    ? projections.reduce((sum, p) => sum + p.netCashFlow, 0) / projections.length
    : 0;

  const formatCurrency = (value: number) => {
    const absValue = Math.abs(value);
    if (absValue >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
    if (absValue >= 1000) return `$${(value / 1000).toFixed(0)}K`;
    return `$${value.toFixed(0)}`;
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    
    const data = payload[0].payload;
    
    return (
      <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
        <div className="text-xs font-bold text-muted-foreground mb-2">Month {data.month}</div>
        <div className="space-y-1 text-sm">
          <div className="flex justify-between gap-4">
            <span className="text-muted-foreground">Revenue:</span>
            <span className="font-mono text-data-positive">{formatCurrency(data.revenue)}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-muted-foreground">Costs:</span>
            <span className="font-mono text-destructive">{formatCurrency(data.costs)}</span>
          </div>
          <div className="flex justify-between gap-4 border-t border-border pt-1">
            <span className="text-muted-foreground">Net:</span>
            <span className={cn(
              "font-mono font-bold",
              data.netCashFlow >= 0 ? "text-data-positive" : "text-destructive"
            )}>
              {formatCurrency(data.netCashFlow)}
            </span>
          </div>
          <div className="flex justify-between gap-4 border-t border-border pt-1">
            <span className="text-muted-foreground">Cumulative:</span>
            <span className={cn(
              "font-mono font-bold",
              data.cumulative >= 0 ? "text-data-positive" : "text-destructive"
            )}>
              {formatCurrency(data.cumulative)}
            </span>
          </div>
          <div className="flex justify-between gap-4 text-xs text-muted-foreground pt-1">
            <span>BTC Mined:</span>
            <span>{data.btcMined.toFixed(6)}</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Summary Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard
          icon={<DollarSign className="w-4 h-4" />}
          label="Initial Investment"
          value={formatCurrency(-initialInvestment)}
          color="neutral"
        />
        <StatCard
          icon={<TrendingUp className="w-4 h-4" />}
          label="Avg Monthly Cash Flow"
          value={formatCurrency(avgMonthlyCashFlow)}
          color={avgMonthlyCashFlow >= 0 ? "positive" : "negative"}
        />
        <StatCard
          icon={<Calendar className="w-4 h-4" />}
          label="Break-Even"
          value={breakEvenMonth ? `Month ${breakEvenMonth}` : 'Never'}
          color={breakEvenMonth ? "positive" : "negative"}
        />
        <StatCard
          icon={<TrendingUp className="w-4 h-4" />}
          label="36-Month Total"
          value={formatCurrency(totalProfit)}
          color={totalProfit >= 0 ? "positive" : "negative"}
        />
      </div>

      {/* Cumulative Cash Flow Chart */}
      {showCumulative && (
        <div className="bg-card border border-border rounded-lg p-4">
          <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-4">
            Cumulative Cash Flow Projection (36 Months)
          </h4>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="positiveGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--data-positive))" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(var(--data-positive))" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="negativeGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--destructive))" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(var(--destructive))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="monthLabel" 
                  stroke="hsl(var(--muted-foreground))"
                  tick={{ fontSize: 10 }}
                  interval={5}
                />
                <YAxis 
                  stroke="hsl(var(--muted-foreground))"
                  tick={{ fontSize: 10 }}
                  tickFormatter={formatCurrency}
                />
                <Tooltip content={<CustomTooltip />} />
                <ReferenceLine y={0} stroke="hsl(var(--border))" strokeWidth={2} />
                {breakEvenMonth && (
                  <ReferenceLine 
                    x={`M${breakEvenMonth}`} 
                    stroke="hsl(var(--watt-bitcoin))" 
                    strokeDasharray="5 5"
                    label={{ 
                      value: 'Break-even', 
                      position: 'top',
                      fill: 'hsl(var(--watt-bitcoin))',
                      fontSize: 10
                    }}
                  />
                )}
                <Area
                  type="monotone"
                  dataKey="cumulative"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  fill="url(#positiveGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Monthly Cash Flow Bar Chart */}
      <div className="bg-card border border-border rounded-lg p-4">
        <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-4">
          Monthly Cash Flow Breakdown
        </h4>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="monthLabel" 
                stroke="hsl(var(--muted-foreground))"
                tick={{ fontSize: 10 }}
                interval={5}
              />
              <YAxis 
                stroke="hsl(var(--muted-foreground))"
                tick={{ fontSize: 10 }}
                tickFormatter={formatCurrency}
              />
              <Tooltip content={<CustomTooltip />} />
              <ReferenceLine y={0} stroke="hsl(var(--border))" strokeWidth={1} />
              <Bar 
                dataKey="revenue" 
                fill="hsl(var(--data-positive))" 
                fillOpacity={0.6}
                radius={[2, 2, 0, 0]}
              />
              <Bar 
                dataKey="costs" 
                fill="hsl(var(--destructive))" 
                fillOpacity={0.6}
                radius={[2, 2, 0, 0]}
              />
              <Line 
                type="monotone" 
                dataKey="netCashFlow" 
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                dot={false}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
        <div className="flex items-center justify-center gap-6 mt-3 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-data-positive/60" />
            <span className="text-muted-foreground">Revenue</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-destructive/60" />
            <span className="text-muted-foreground">Costs</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-1 rounded bg-primary" />
            <span className="text-muted-foreground">Net Cash Flow</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: string;
  color: 'positive' | 'negative' | 'neutral';
}> = ({ icon, label, value, color }) => (
  <div className="bg-card border border-border rounded-lg p-3">
    <div className="flex items-center gap-2 text-muted-foreground mb-1">
      {icon}
      <span className="text-[10px] uppercase tracking-wider">{label}</span>
    </div>
    <div className={cn(
      "text-lg font-mono font-bold",
      color === 'positive' && "text-data-positive",
      color === 'negative' && "text-destructive",
      color === 'neutral' && "text-foreground"
    )}>
      {value}
    </div>
  </div>
);

export default BTCROICashFlowChart;
