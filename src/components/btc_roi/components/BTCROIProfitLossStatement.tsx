import React from 'react';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface ProfitLossData {
  dailyRevenue: number;
  dailyPowerCost: number;
  dailyPoolFees: number;
  dailyNetProfit: number;
  monthlyRevenue: number;
  monthlyPowerCost: number;
  monthlyPoolFees: number;
  monthlyMaintenance: number;
  monthlyDepreciation: number;
  monthlyNetProfit: number;
  yearlyRevenue: number;
  yearlyPowerCost: number;
  yearlyPoolFees: number;
  yearlyMaintenance: number;
  yearlyDepreciation: number;
  yearlyNetProfit: number;
  grossMargin: number;
  operatingMargin: number;
  netMargin: number;
  ebitda: number;
}

interface BTCROIProfitLossStatementProps {
  data: ProfitLossData;
  period: 'daily' | 'monthly' | 'quarterly' | 'yearly';
}

export const BTCROIProfitLossStatement: React.FC<BTCROIProfitLossStatementProps> = ({ 
  data, 
  period 
}) => {
  const getMultiplier = () => {
    switch (period) {
      case 'daily': return 1;
      case 'monthly': return 30;
      case 'quarterly': return 90;
      case 'yearly': return 365;
    }
  };
  
  const multiplier = getMultiplier();
  
  const revenue = data.dailyRevenue * multiplier;
  const powerCost = data.dailyPowerCost * multiplier;
  const poolFees = data.dailyPoolFees * multiplier;
  const grossProfit = revenue - powerCost - poolFees;
  const maintenance = data.monthlyMaintenance * (period === 'daily' ? 1/30 : period === 'monthly' ? 1 : period === 'quarterly' ? 3 : 12);
  const ebitda = grossProfit - maintenance;
  const depreciation = data.monthlyDepreciation * (period === 'daily' ? 1/30 : period === 'monthly' ? 1 : period === 'quarterly' ? 3 : 12);
  // Net Income = EBITDA (depreciation is non-cash, shown for reference only)
  const netIncome = ebitda;
  
  const formatCurrency = (value: number) => {
    const absValue = Math.abs(value);
    if (absValue >= 1000000) return `$${(value / 1000000).toFixed(2)}M`;
    if (absValue >= 1000) return `$${(value / 1000).toFixed(2)}K`;
    return `$${value.toFixed(2)}`;
  };

  const formatPercent = (value: number) => `${value.toFixed(1)}%`;
  
  const periodLabels = {
    daily: 'Daily',
    monthly: 'Monthly',
    quarterly: 'Quarterly',
    yearly: 'Annual'
  };

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden">
      {/* Header */}
      <div className="bg-muted/30 border-b border-border px-4 py-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">
            Income Statement
          </h3>
          <span className="text-xs text-muted-foreground font-mono">
            {periodLabels[period]} Period
          </span>
        </div>
      </div>
      
      {/* Statement Body */}
      <div className="divide-y divide-border">
        {/* Revenue Section */}
        <PLSection title="Revenue">
          <PLRow label="Mining Revenue" value={formatCurrency(revenue)} type="revenue" />
          <PLTotalRow label="Total Revenue" value={formatCurrency(revenue)} />
        </PLSection>
        
        {/* Cost of Revenue */}
        <PLSection title="Cost of Revenue">
          <PLRow label="Electricity / Power" value={formatCurrency(powerCost)} type="cost" />
          <PLRow label="Mining Pool Fees" value={formatCurrency(poolFees)} type="cost" />
          <PLTotalRow label="Total Cost of Revenue" value={formatCurrency(powerCost + poolFees)} />
        </PLSection>
        
        {/* Gross Profit */}
        <div className="bg-muted/20 px-4 py-2">
          <PLMetricRow 
            label="Gross Profit" 
            value={formatCurrency(grossProfit)} 
            metric={`${formatPercent(data.grossMargin)} margin`}
            positive={grossProfit > 0}
          />
        </div>
        
        {/* Operating Expenses */}
        <PLSection title="Operating Expenses">
          <PLRow label="Maintenance & Repairs" value={formatCurrency(maintenance)} type="cost" />
          <PLTotalRow label="Total Operating Expenses" value={formatCurrency(maintenance)} />
        </PLSection>
        
        {/* EBITDA */}
        <div className="bg-muted/20 px-4 py-2">
          <PLMetricRow 
            label="EBITDA" 
            value={formatCurrency(ebitda)} 
            metric={`${formatPercent(data.operatingMargin)} margin`}
            positive={ebitda > 0}
          />
        </div>
        
        {/* Non-Cash Items (Reference Only - Not Deducted) */}
        <PLSection title="Non-Cash Items (Reference)">
          <PLRow label="Depreciation (3-yr SL)" value={formatCurrency(depreciation)} type="cost" />
          <div className="text-[10px] text-muted-foreground mt-1 italic">
            *For book value only; not deducted from cash profit
          </div>
        </PLSection>
        
        {/* Net Income */}
        <div className="bg-gradient-to-r from-background to-muted/30 px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {netIncome > 0 ? (
                <TrendingUp className="w-4 h-4 text-data-positive" />
              ) : netIncome < 0 ? (
                <TrendingDown className="w-4 h-4 text-destructive" />
              ) : (
                <Minus className="w-4 h-4 text-muted-foreground" />
              )}
              <span className="text-sm font-bold text-foreground">Net Income</span>
            </div>
            <div className="text-right">
              <span className={cn(
                "text-lg font-mono font-bold",
                netIncome > 0 ? "text-data-positive" : netIncome < 0 ? "text-destructive" : "text-foreground"
              )}>
                {formatCurrency(netIncome)}
              </span>
              <span className="text-xs text-muted-foreground ml-2">
                {formatPercent(data.netMargin)} margin
              </span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Margin Summary */}
      <div className="bg-muted/10 border-t border-border px-4 py-3 grid grid-cols-3 gap-4">
        <MarginIndicator label="Gross" value={data.grossMargin} />
        <MarginIndicator label="Operating" value={data.operatingMargin} />
        <MarginIndicator label="Net" value={data.netMargin} />
      </div>
    </div>
  );
};

const PLSection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="px-4 py-3">
    <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">
      {title}
    </div>
    <div className="space-y-1">
      {children}
    </div>
  </div>
);

const PLRow: React.FC<{ label: string; value: string; type: 'revenue' | 'cost' }> = ({ label, value, type }) => (
  <div className="flex items-center justify-between py-0.5">
    <span className="text-sm text-muted-foreground">{label}</span>
    <span className={cn(
      "text-sm font-mono",
      type === 'revenue' ? "text-foreground" : "text-muted-foreground"
    )}>
      {type === 'cost' && value !== '$0.00' ? `(${value})` : value}
    </span>
  </div>
);

const PLTotalRow: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="flex items-center justify-between py-1 border-t border-border/50 mt-1">
    <span className="text-sm font-medium text-foreground">{label}</span>
    <span className="text-sm font-mono font-medium text-foreground">{value}</span>
  </div>
);

const PLMetricRow: React.FC<{ 
  label: string; 
  value: string; 
  metric: string;
  positive: boolean;
}> = ({ label, value, metric, positive }) => (
  <div className="flex items-center justify-between">
    <span className="text-sm font-bold text-foreground">{label}</span>
    <div className="text-right">
      <span className={cn(
        "text-base font-mono font-bold",
        positive ? "text-data-positive" : "text-destructive"
      )}>
        {value}
      </span>
      <span className="text-xs text-muted-foreground ml-2">{metric}</span>
    </div>
  </div>
);

const MarginIndicator: React.FC<{ label: string; value: number }> = ({ label, value }) => (
  <div className="text-center">
    <div className="text-[10px] text-muted-foreground uppercase tracking-wide">{label}</div>
    <div className={cn(
      "text-lg font-mono font-bold",
      value > 30 ? "text-data-positive" : value > 10 ? "text-watt-bitcoin" : "text-destructive"
    )}>
      {value.toFixed(1)}%
    </div>
  </div>
);

export default BTCROIProfitLossStatement;
