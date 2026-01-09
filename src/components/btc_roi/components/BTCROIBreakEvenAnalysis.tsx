import React from 'react';
import { cn } from '@/lib/utils';
import { AlertTriangle, CheckCircle, XCircle, Target, DollarSign, Zap, Activity } from 'lucide-react';

interface BTCROIBreakEvenAnalysisProps {
  currentBTCPrice: number;
  breakEvenBTCPrice: number;
  currentElectricityRate: number;
  breakEvenElectricityRate: number;
  currentDifficulty: number;
  breakEvenDifficulty: number;
  safetyMargin: number;
}

export const BTCROIBreakEvenAnalysis: React.FC<BTCROIBreakEvenAnalysisProps> = ({
  currentBTCPrice,
  breakEvenBTCPrice,
  currentElectricityRate,
  breakEvenElectricityRate,
  currentDifficulty,
  breakEvenDifficulty,
  safetyMargin
}) => {
  const btcBuffer = ((currentBTCPrice - breakEvenBTCPrice) / currentBTCPrice) * 100;
  const elecBuffer = ((breakEvenElectricityRate - currentElectricityRate) / currentElectricityRate) * 100;
  const diffBuffer = ((breakEvenDifficulty - currentDifficulty) / currentDifficulty) * 100;

  const formatCurrency = (value: number) => {
    if (value >= 1000) return `$${(value / 1000).toFixed(1)}K`;
    return `$${value.toFixed(2)}`;
  };

  const formatDifficulty = (value: number) => {
    return `${(value / 1e12).toFixed(1)}T`;
  };

  const getHealthStatus = (buffer: number) => {
    if (buffer > 30) return { status: 'excellent', color: 'text-data-positive', bg: 'bg-data-positive/20' };
    if (buffer > 15) return { status: 'healthy', color: 'text-data-positive', bg: 'bg-data-positive/10' };
    if (buffer > 5) return { status: 'moderate', color: 'text-watt-bitcoin', bg: 'bg-watt-bitcoin/20' };
    if (buffer > 0) return { status: 'risky', color: 'text-destructive', bg: 'bg-destructive/20' };
    return { status: 'critical', color: 'text-destructive', bg: 'bg-destructive/30' };
  };

  const overallHealth = getHealthStatus(safetyMargin);

  return (
    <div className="space-y-4">
      {/* Overall Health Indicator */}
      <div className={cn(
        "rounded-lg p-4 border-2",
        overallHealth.bg,
        safetyMargin > 0 ? "border-data-positive/50" : "border-destructive/50"
      )}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {safetyMargin > 0 ? (
              <CheckCircle className="w-6 h-6 text-data-positive" />
            ) : (
              <XCircle className="w-6 h-6 text-destructive" />
            )}
            <div>
              <div className="text-sm font-bold text-foreground">
                {safetyMargin > 0 ? 'Operation is Profitable' : 'Operation is Unprofitable'}
              </div>
              <div className="text-xs text-muted-foreground">
                {safetyMargin > 30 ? 'Excellent safety margin - well protected from market swings' :
                 safetyMargin > 15 ? 'Healthy margin - moderate protection from volatility' :
                 safetyMargin > 5 ? 'Moderate margin - monitor market conditions closely' :
                 safetyMargin > 0 ? 'Risky - small buffer before unprofitability' :
                 'Below break-even - taking losses on operations'}
              </div>
            </div>
          </div>
          <div className={cn(
            "text-2xl font-mono font-bold",
            overallHealth.color
          )}>
            {safetyMargin.toFixed(1)}%
          </div>
        </div>
        
        {/* Safety margin bar */}
        <div className="mt-4">
          <div className="flex justify-between text-xs text-muted-foreground mb-1">
            <span>Safety Margin</span>
            <span>Break-even threshold</span>
          </div>
          <div className="h-3 bg-muted rounded-full overflow-hidden">
            <div 
              className={cn(
                "h-full rounded-full transition-all",
                safetyMargin > 0 ? "bg-data-positive" : "bg-destructive"
              )}
              style={{ width: `${Math.min(Math.max(safetyMargin, 0), 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Break-even Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* BTC Price Break-even */}
        <BreakEvenCard
          icon={<DollarSign className="w-5 h-5" />}
          title="BTC Price"
          current={formatCurrency(currentBTCPrice)}
          breakEven={formatCurrency(breakEvenBTCPrice)}
          buffer={btcBuffer}
          bufferLabel={`${btcBuffer > 0 ? '+' : ''}${btcBuffer.toFixed(1)}% buffer`}
          description="BTC can drop this much before break-even"
        />

        {/* Electricity Rate Break-even */}
        <BreakEvenCard
          icon={<Zap className="w-5 h-5" />}
          title="Electricity Rate"
          current={`$${currentElectricityRate.toFixed(4)}/kWh`}
          breakEven={`$${breakEvenElectricityRate.toFixed(4)}/kWh`}
          buffer={elecBuffer}
          bufferLabel={`${elecBuffer > 0 ? '+' : ''}${elecBuffer.toFixed(1)}% buffer`}
          description="Rate can increase this much before break-even"
          inverse
        />

        {/* Difficulty Break-even */}
        <BreakEvenCard
          icon={<Activity className="w-5 h-5" />}
          title="Network Difficulty"
          current={formatDifficulty(currentDifficulty)}
          breakEven={formatDifficulty(breakEvenDifficulty)}
          buffer={diffBuffer}
          bufferLabel={`${diffBuffer > 0 ? '+' : ''}${diffBuffer.toFixed(1)}% buffer`}
          description="Difficulty can increase this much before break-even"
          inverse
        />
      </div>

      {/* Risk Scenarios */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="bg-muted/30 border-b border-border px-4 py-3">
          <h4 className="text-sm font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-watt-bitcoin" />
            Risk Scenarios
          </h4>
        </div>
        <div className="p-4 space-y-3">
          <RiskScenario
            scenario="BTC drops 30%"
            btcPriceEffect={-30}
            result={btcBuffer > 30 ? 'profitable' : btcBuffer > 0 ? 'marginal' : 'loss'}
            description={btcBuffer > 30 ? 'Still profitable' : btcBuffer > 0 ? 'May approach break-even' : 'Would cause losses'}
          />
          <RiskScenario
            scenario="Electricity +50%"
            elecRateEffect={50}
            result={elecBuffer > 50 ? 'profitable' : elecBuffer > 0 ? 'marginal' : 'loss'}
            description={elecBuffer > 50 ? 'Still profitable' : elecBuffer > 0 ? 'May approach break-even' : 'Would cause losses'}
          />
          <RiskScenario
            scenario="Difficulty +100%"
            difficultyEffect={100}
            result={diffBuffer > 100 ? 'profitable' : diffBuffer > 0 ? 'marginal' : 'loss'}
            description={diffBuffer > 100 ? 'Still profitable' : diffBuffer > 0 ? 'Severely impacted' : 'Would cause losses'}
          />
          <RiskScenario
            scenario="Next halving (-50% reward)"
            halvingEffect={true}
            result={btcBuffer > 50 ? 'profitable' : 'loss'}
            description={btcBuffer > 50 ? 'May remain viable' : 'Requires BTC price appreciation'}
          />
        </div>
      </div>
    </div>
  );
};

const BreakEvenCard: React.FC<{
  icon: React.ReactNode;
  title: string;
  current: string;
  breakEven: string;
  buffer: number;
  bufferLabel: string;
  description: string;
  inverse?: boolean;
}> = ({ icon, title, current, breakEven, buffer, bufferLabel, description, inverse }) => {
  const healthColor = buffer > 30 ? 'text-data-positive' : 
                      buffer > 15 ? 'text-data-positive' : 
                      buffer > 5 ? 'text-watt-bitcoin' : 
                      buffer > 0 ? 'text-destructive' : 'text-destructive';

  return (
    <div className="bg-card border border-border rounded-lg p-4">
      <div className="flex items-center gap-2 text-muted-foreground mb-3">
        {icon}
        <span className="text-xs font-bold uppercase tracking-wider">{title}</span>
      </div>
      
      <div className="space-y-2">
        <div className="flex justify-between items-baseline">
          <span className="text-xs text-muted-foreground">Current</span>
          <span className="text-lg font-mono font-bold text-foreground">{current}</span>
        </div>
        <div className="flex justify-between items-baseline">
          <span className="text-xs text-muted-foreground">Break-even</span>
          <span className="text-sm font-mono text-muted-foreground">{breakEven}</span>
        </div>
      </div>
      
      <div className="mt-3 pt-3 border-t border-border">
        <div className={cn("text-lg font-mono font-bold", healthColor)}>
          {bufferLabel}
        </div>
        <div className="text-xs text-muted-foreground">{description}</div>
      </div>
      
      {/* Visual buffer indicator */}
      <div className="mt-2 h-2 bg-muted rounded-full overflow-hidden">
        <div 
          className={cn(
            "h-full rounded-full",
            buffer > 30 ? "bg-data-positive" : 
            buffer > 15 ? "bg-data-positive/70" : 
            buffer > 5 ? "bg-watt-bitcoin" : 
            buffer > 0 ? "bg-destructive/70" : "bg-destructive"
          )}
          style={{ width: `${Math.min(Math.max(buffer, 0), 100)}%` }}
        />
      </div>
    </div>
  );
};

const RiskScenario: React.FC<{
  scenario: string;
  btcPriceEffect?: number;
  elecRateEffect?: number;
  difficultyEffect?: number;
  halvingEffect?: boolean;
  result: 'profitable' | 'marginal' | 'loss';
  description: string;
}> = ({ scenario, result, description }) => {
  const resultConfig = {
    profitable: { icon: CheckCircle, color: 'text-data-positive', bg: 'bg-data-positive/10' },
    marginal: { icon: AlertTriangle, color: 'text-watt-bitcoin', bg: 'bg-watt-bitcoin/10' },
    loss: { icon: XCircle, color: 'text-destructive', bg: 'bg-destructive/10' }
  };
  
  const config = resultConfig[result];
  const Icon = config.icon;

  return (
    <div className={cn("flex items-center justify-between p-2 rounded-lg", config.bg)}>
      <div className="flex items-center gap-3">
        <Icon className={cn("w-4 h-4", config.color)} />
        <span className="text-sm text-foreground">{scenario}</span>
      </div>
      <span className={cn("text-sm", config.color)}>{description}</span>
    </div>
  );
};

export default BTCROIBreakEvenAnalysis;
