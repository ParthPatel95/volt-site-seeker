import React from 'react';
import { ScenarioResult } from '../services/financialAnalysisService';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown, Minus, Target, AlertCircle, Check } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Cell
} from 'recharts';

interface BTCROIScenarioAnalysisProps {
  scenarios: ScenarioResult[];
  currentAnnualProfit: number;
}

export const BTCROIScenarioAnalysis: React.FC<BTCROIScenarioAnalysisProps> = ({
  scenarios,
  currentAnnualProfit
}) => {
  const formatCurrency = (value: number) => {
    const absValue = Math.abs(value);
    if (absValue >= 1000000) return `$${(value / 1000000).toFixed(2)}M`;
    if (absValue >= 1000) return `$${(value / 1000).toFixed(1)}K`;
    return `$${value.toFixed(0)}`;
  };

  const chartData = scenarios.map(s => ({
    name: s.name,
    year1: s.year1Profit,
    year2: s.year2Profit,
    year3: s.year3Profit,
    total: s.totalProfit,
    roi: s.roi
  }));

  const getProbabilityColor = (prob: string) => {
    switch (prob) {
      case 'High': return 'text-data-positive bg-data-positive/20';
      case 'Medium': return 'text-watt-bitcoin bg-watt-bitcoin/20';
      case 'Low': return 'text-muted-foreground bg-muted';
      default: return 'text-muted-foreground bg-muted';
    }
  };

  const getScenarioIcon = (name: string) => {
    if (name.includes('Bull') || name.includes('Super')) return <TrendingUp className="w-4 h-4 text-data-positive" />;
    if (name.includes('Bear') || name.includes('Exodus')) return <TrendingDown className="w-4 h-4 text-destructive" />;
    return <Minus className="w-4 h-4 text-muted-foreground" />;
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    
    const data = payload[0].payload;
    
    return (
      <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
        <div className="text-sm font-bold text-foreground mb-2">{data.name}</div>
        <div className="space-y-1 text-xs">
          <div className="flex justify-between gap-4">
            <span className="text-muted-foreground">Year 1:</span>
            <span className={cn("font-mono", data.year1 >= 0 ? "text-data-positive" : "text-destructive")}>
              {formatCurrency(data.year1)}
            </span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-muted-foreground">Year 2:</span>
            <span className={cn("font-mono", data.year2 >= 0 ? "text-data-positive" : "text-destructive")}>
              {formatCurrency(data.year2)}
            </span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-muted-foreground">Year 3:</span>
            <span className={cn("font-mono", data.year3 >= 0 ? "text-data-positive" : "text-destructive")}>
              {formatCurrency(data.year3)}
            </span>
          </div>
          <div className="flex justify-between gap-4 border-t border-border pt-1">
            <span className="text-muted-foreground">3-Year Total:</span>
            <span className={cn("font-mono font-bold", data.total >= 0 ? "text-data-positive" : "text-destructive")}>
              {formatCurrency(data.total)}
            </span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-muted-foreground">3-Year ROI:</span>
            <span className={cn("font-mono font-bold", data.roi >= 0 ? "text-data-positive" : "text-destructive")}>
              {data.roi.toFixed(0)}%
            </span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Scenario Chart */}
      <div className="bg-card border border-border rounded-lg p-4">
        <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-4">
          3-Year Profit by Scenario
        </h4>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="name" 
                stroke="hsl(var(--muted-foreground))"
                tick={{ fontSize: 10 }}
              />
              <YAxis 
                stroke="hsl(var(--muted-foreground))"
                tick={{ fontSize: 10 }}
                tickFormatter={formatCurrency}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="total" radius={[4, 4, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`}
                    fill={entry.total >= 0 ? "hsl(var(--data-positive))" : "hsl(var(--destructive))"}
                    fillOpacity={0.8}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Scenario Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {scenarios.map((scenario, index) => (
          <div 
            key={index}
            className={cn(
              "bg-card border rounded-lg p-4",
              scenario.totalProfit >= 0 ? "border-data-positive/30" : "border-destructive/30"
            )}
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                {getScenarioIcon(scenario.name)}
                <span className="text-sm font-bold text-foreground">{scenario.name}</span>
              </div>
              <span className={cn(
                "text-[10px] font-bold px-2 py-0.5 rounded-full",
                getProbabilityColor(scenario.probability)
              )}>
                {scenario.probability}
              </span>
            </div>
            
            {/* Description */}
            <p className="text-xs text-muted-foreground mb-3">{scenario.description}</p>
            
            {/* Assumptions */}
            <div className="space-y-1 text-xs mb-3 pb-3 border-b border-border">
              <div className="flex justify-between">
                <span className="text-muted-foreground">BTC Price:</span>
                <span className={cn(
                  "font-mono",
                  scenario.btcPriceGrowth >= 0 ? "text-data-positive" : "text-destructive"
                )}>
                  {scenario.btcPriceGrowth >= 0 ? '+' : ''}{scenario.btcPriceGrowth}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Difficulty:</span>
                <span className={cn(
                  "font-mono",
                  scenario.difficultyGrowth <= 0 ? "text-data-positive" : "text-destructive"
                )}>
                  +{scenario.difficultyGrowth}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Electricity:</span>
                <span className={cn(
                  "font-mono",
                  scenario.electricityChange <= 0 ? "text-data-positive" : "text-destructive"
                )}>
                  {scenario.electricityChange >= 0 ? '+' : ''}{scenario.electricityChange}%
                </span>
              </div>
            </div>
            
            {/* Results */}
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Year 1</span>
                <span className={cn(
                  "font-mono",
                  scenario.year1Profit >= 0 ? "text-data-positive" : "text-destructive"
                )}>
                  {formatCurrency(scenario.year1Profit)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Year 2</span>
                <span className={cn(
                  "font-mono",
                  scenario.year2Profit >= 0 ? "text-data-positive" : "text-destructive"
                )}>
                  {formatCurrency(scenario.year2Profit)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Year 3</span>
                <span className={cn(
                  "font-mono",
                  scenario.year3Profit >= 0 ? "text-data-positive" : "text-destructive"
                )}>
                  {formatCurrency(scenario.year3Profit)}
                </span>
              </div>
            </div>
            
            {/* Total */}
            <div className="mt-3 pt-3 border-t border-border flex justify-between items-center">
              <div>
                <div className="text-xs text-muted-foreground">3-Year Total</div>
                <div className={cn(
                  "text-lg font-mono font-bold",
                  scenario.totalProfit >= 0 ? "text-data-positive" : "text-destructive"
                )}>
                  {formatCurrency(scenario.totalProfit)}
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs text-muted-foreground">ROI</div>
                <div className={cn(
                  "text-lg font-mono font-bold",
                  scenario.roi >= 0 ? "text-data-positive" : "text-destructive"
                )}>
                  {scenario.roi.toFixed(0)}%
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Key Insights */}
      <div className="bg-muted/30 border border-border rounded-lg p-4">
        <h4 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
          <Target className="w-4 h-4 text-primary" />
          Key Insights
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InsightCard
            icon={<Check className="w-4 h-4" />}
            title="Most Likely Outcome"
            value={scenarios.find(s => s.probability === 'High')?.name || 'Consolidation'}
            description={`Expected profit: ${formatCurrency(scenarios.find(s => s.probability === 'High')?.totalProfit || 0)}`}
            positive
          />
          <InsightCard
            icon={<TrendingUp className="w-4 h-4" />}
            title="Best Case"
            value={scenarios.sort((a, b) => b.totalProfit - a.totalProfit)[0]?.name || '—'}
            description={`Potential profit: ${formatCurrency(Math.max(...scenarios.map(s => s.totalProfit)))}`}
            positive
          />
          <InsightCard
            icon={<TrendingDown className="w-4 h-4" />}
            title="Worst Case"
            value={scenarios.sort((a, b) => a.totalProfit - b.totalProfit)[0]?.name || '—'}
            description={`Potential loss: ${formatCurrency(Math.min(...scenarios.map(s => s.totalProfit)))}`}
            positive={Math.min(...scenarios.map(s => s.totalProfit)) >= 0}
          />
          <InsightCard
            icon={<AlertCircle className="w-4 h-4" />}
            title="Risk Assessment"
            value={`${scenarios.filter(s => s.totalProfit < 0).length}/${scenarios.length} scenarios unprofitable`}
            description={scenarios.filter(s => s.totalProfit < 0).length === 0 ? 'All scenarios show profit' : 'Monitor market conditions'}
            positive={scenarios.filter(s => s.totalProfit < 0).length <= 1}
          />
        </div>
      </div>
    </div>
  );
};

const InsightCard: React.FC<{
  icon: React.ReactNode;
  title: string;
  value: string;
  description: string;
  positive: boolean;
}> = ({ icon, title, value, description, positive }) => (
  <div className="bg-card border border-border rounded-lg p-3">
    <div className="flex items-center gap-2 text-muted-foreground mb-1">
      {icon}
      <span className="text-xs uppercase tracking-wider">{title}</span>
    </div>
    <div className={cn(
      "text-sm font-bold",
      positive ? "text-foreground" : "text-destructive"
    )}>
      {value}
    </div>
    <div className="text-xs text-muted-foreground">{description}</div>
  </div>
);

export default BTCROIScenarioAnalysis;
