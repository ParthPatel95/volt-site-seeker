import React, { useState, useMemo, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { toast } from 'sonner';
import { 
  Bitcoin, 
  TrendingUp, 
  TrendingDown,
  Zap, 
  Server,
  Building2,
  RefreshCw,
  Loader2,
  AlertCircle,
  Activity,
  Cpu,
  DollarSign,
  Clock,
  Target,
  ChevronRight,
  CircleDot,
  Wallet,
  BarChart2,
  Gauge
} from 'lucide-react';
import { useBTCROICalculator } from './hooks/useBTCROICalculator';
import { ASICSelector } from './components/ASICSelector';
import { ASICMiner } from './hooks/useASICDatabase';
import { cn } from '@/lib/utils';

type MiningMode = 'self' | 'hosting';

export const BTCROICalculatorV2: React.FC = () => {
  const { 
    networkData, 
    isLoading: networkLoading,
    isRefreshing,
    refreshNetworkData,
  } = useBTCROICalculator();
  
  const [mode, setMode] = useState<MiningMode>('self');
  const [hashrate, setHashrate] = useState(234);
  const [powerDraw, setPowerDraw] = useState(3531);
  const [units, setUnits] = useState(1);
  const [electricityRate, setElectricityRate] = useState(0.06);
  const [hardwareCost, setHardwareCost] = useState(5000);
  const [poolFee, setPoolFee] = useState(1.5);
  const [hostingRate, setHostingRate] = useState(0.08);
  const [selectedASIC, setSelectedASIC] = useState<ASICMiner | null>(null);

  const handleRefresh = useCallback(async () => {
    await refreshNetworkData();
    toast.success('Network data refreshed');
  }, [refreshNetworkData]);

  const handleSelectASIC = useCallback((asic: ASICMiner) => {
    setSelectedASIC(asic);
    setHashrate(asic.hashrate_th);
    setPowerDraw(asic.power_watts);
    setHardwareCost(asic.market_price_usd || 3500);
  }, []);

  const results = useMemo(() => {
    if (!networkData) return null;

    const totalHashrate = hashrate * units * 1e12;
    const networkHashrate = networkData.hashrate;
    const blockReward = networkData.blockReward;
    const blocksPerDay = 144;
    
    const dailyBTC = (totalHashrate / networkHashrate) * blocksPerDay * blockReward;
    const dailyRevenue = dailyBTC * networkData.price;
    
    const totalPowerKW = (powerDraw * units) / 1000;
    const dailyPowerKWh = totalPowerKW * 24;
    const effectiveRate = mode === 'hosting' ? hostingRate : electricityRate;
    const dailyPowerCost = dailyPowerKWh * effectiveRate;
    
    const dailyPoolFees = dailyRevenue * (poolFee / 100);
    
    const dailyNetProfit = dailyRevenue - dailyPowerCost - dailyPoolFees;
    const monthlyNetProfit = dailyNetProfit * 30;
    const yearlyNetProfit = dailyNetProfit * 365;
    
    const totalInvestment = hardwareCost * units;
    const breakEvenDays = dailyNetProfit > 0 ? totalInvestment / dailyNetProfit : Infinity;
    const roi12Month = totalInvestment > 0 ? (yearlyNetProfit / totalInvestment) * 100 : 0;

    const efficiency = powerDraw / hashrate;
    const profitMargin = dailyRevenue > 0 ? (dailyNetProfit / dailyRevenue) * 100 : 0;

    return {
      dailyBTC,
      dailyRevenue,
      dailyPowerCost,
      dailyPoolFees,
      dailyNetProfit,
      monthlyNetProfit,
      yearlyNetProfit,
      totalInvestment,
      breakEvenDays,
      roi12Month,
      efficiency,
      totalPowerKW,
      dailyPowerKWh,
      profitMargin
    };
  }, [networkData, hashrate, powerDraw, units, electricityRate, hostingRate, hardwareCost, poolFee, mode]);

  const formatLargeNumber = (value: number) => {
    if (Math.abs(value) >= 1000000) return `$${(value / 1000000).toFixed(2)}M`;
    if (Math.abs(value) >= 1000) return `$${(value / 1000).toFixed(1)}K`;
    return `$${value.toFixed(2)}`;
  };

  const formatBTC = (value: number) => {
    if (value >= 1) return `${value.toFixed(4)} BTC`;
    if (value >= 0.001) return `${(value * 1000).toFixed(2)} mBTC`;
    return `${Math.round(value * 100000000).toLocaleString()} sats`;
  };

  // Loading state
  if (networkLoading && !networkData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="relative">
            <div className="w-16 h-16 border-2 border-watt-bitcoin/30 rounded-full" />
            <div className="absolute inset-0 w-16 h-16 border-2 border-t-watt-bitcoin rounded-full animate-spin" />
            <Bitcoin className="absolute inset-0 m-auto w-6 h-6 text-watt-bitcoin" />
          </div>
          <p className="text-sm text-muted-foreground font-mono">LOADING NETWORK DATA...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (!networkData && !networkLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="bg-card border border-destructive/50 rounded-lg p-6 max-w-sm w-full text-center">
          <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
          <h2 className="text-lg font-bold text-foreground mb-2">CONNECTION FAILED</h2>
          <p className="text-sm text-muted-foreground mb-4">Unable to fetch network data</p>
          <Button onClick={handleRefresh} variant="outline" className="w-full">
            <RefreshCw className="w-4 h-4 mr-2" />
            RETRY CONNECTION
          </Button>
        </div>
      </div>
    );
  }

  const isProfitable = results && results.dailyNetProfit > 0;

  return (
    <div className="min-h-screen bg-background">
      {/* Top Bar - Network Status */}
      <div className="border-b border-border bg-card/50">
        <div className="max-w-[1800px] mx-auto px-3 sm:px-4 lg:px-6">
          <div className="flex items-center justify-between h-12 sm:h-14 gap-2 overflow-x-auto scrollbar-hide">
            {/* Logo & Title */}
            <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-gradient-to-br from-watt-bitcoin to-watt-bitcoin/70 flex items-center justify-center">
                <Bitcoin className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <div className="hidden xs:block">
                <div className="text-sm sm:text-base font-bold text-foreground leading-none">BTC MINING</div>
                <div className="text-[10px] text-muted-foreground font-mono">PROFITABILITY LAB</div>
              </div>
            </div>

            {/* Network Stats - Horizontal Ticker */}
            <div className="flex items-center gap-3 sm:gap-4 lg:gap-6 text-xs sm:text-sm font-mono overflow-x-auto scrollbar-hide">
              <NetworkStat 
                label="BTC" 
                value={networkData ? `$${networkData.price.toLocaleString()}` : '—'} 
                icon={<Bitcoin className="w-3 h-3" />}
                color="bitcoin"
              />
              <NetworkStat 
                label="HASH" 
                value={networkData ? `${(networkData.hashrate / 1e18).toFixed(0)} EH/s` : '—'} 
                icon={<Activity className="w-3 h-3" />}
                color="primary"
              />
              <NetworkStat 
                label="DIFF" 
                value={networkData ? `${(networkData.difficulty / 1e12).toFixed(1)}T` : '—'} 
                icon={<Gauge className="w-3 h-3" />}
                color="trust"
                className="hidden sm:flex"
              />
              <NetworkStat 
                label="REWARD" 
                value={networkData ? `${networkData.blockReward} BTC` : '—'} 
                icon={<Wallet className="w-3 h-3" />}
                color="success"
                className="hidden md:flex"
              />
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="h-8 w-8 p-0"
              >
                <RefreshCw className={cn("w-4 h-4", isRefreshing && "animate-spin")} />
              </Button>
              <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-data-positive/10 border border-data-positive/20">
                <CircleDot className="w-2.5 h-2.5 text-data-positive animate-pulse" />
                <span className="text-[10px] sm:text-xs font-mono text-data-positive">LIVE</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-[1800px] mx-auto p-3 sm:p-4 lg:p-6">
        
        {/* Hero Results Panel */}
        <div className="mb-4 sm:mb-6">
          <div className={cn(
            "relative overflow-hidden rounded-xl border-2 p-4 sm:p-6 lg:p-8",
            isProfitable 
              ? "bg-gradient-to-br from-data-positive/5 to-data-positive/10 border-data-positive/30" 
              : "bg-gradient-to-br from-destructive/5 to-destructive/10 border-destructive/30"
          )}>
            {/* Background Pattern */}
            <div className="absolute inset-0 bg-grid-pattern opacity-30 pointer-events-none" />
            
            <div className="relative">
              {/* Status Badge */}
              <div className={cn(
                "inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold mb-4",
                isProfitable 
                  ? "bg-data-positive/20 text-data-positive" 
                  : "bg-destructive/20 text-destructive"
              )}>
                {isProfitable ? (
                  <>
                    <TrendingUp className="w-3.5 h-3.5" />
                    PROFITABLE OPERATION
                  </>
                ) : (
                  <>
                    <TrendingDown className="w-3.5 h-3.5" />
                    UNPROFITABLE OPERATION
                  </>
                )}
              </div>

              {/* Main Stats Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
                <HeroStat
                  label="Daily Profit"
                  value={results ? formatLargeNumber(results.dailyNetProfit) : '$0'}
                  subValue={results ? formatBTC(results.dailyBTC) : '0 sats'}
                  trend={isProfitable ? 'up' : 'down'}
                  primary
                />
                <HeroStat
                  label="Monthly Profit"
                  value={results ? formatLargeNumber(results.monthlyNetProfit) : '$0'}
                  subValue="30-day projection"
                  trend={isProfitable ? 'up' : 'down'}
                />
                <HeroStat
                  label="Annual ROI"
                  value={results ? `${results.roi12Month.toFixed(0)}%` : '0%'}
                  subValue={results ? formatLargeNumber(results.yearlyNetProfit) : '$0'}
                  trend={results && results.roi12Month > 0 ? 'up' : 'down'}
                />
                <HeroStat
                  label="Break-Even"
                  value={results ? (results.breakEvenDays === Infinity ? '∞' : `${Math.ceil(results.breakEvenDays)}d`) : '—'}
                  subValue={results && results.breakEvenDays !== Infinity ? `${(results.breakEvenDays / 30).toFixed(1)} months` : 'Never'}
                  trend={results && results.breakEvenDays < 365 && results.breakEvenDays !== Infinity ? 'up' : 'down'}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Configuration Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          
          {/* Column 1: Mining Mode & ASIC Selection */}
          <div className="space-y-4">
            {/* Mining Mode Toggle */}
            <div className="bg-card border border-border rounded-lg p-3 sm:p-4">
              <SectionLabel icon={<Server className="w-3.5 h-3.5" />} label="MINING MODE" />
              <div className="grid grid-cols-2 gap-2 mt-3">
                <ModeButton
                  icon={<Server className="w-4 h-4" />}
                  label="Self-Mining"
                  sublabel="Own facility"
                  active={mode === 'self'}
                  onClick={() => setMode('self')}
                />
                <ModeButton
                  icon={<Building2 className="w-4 h-4" />}
                  label="Hosted"
                  sublabel="Co-location"
                  active={mode === 'hosting'}
                  onClick={() => setMode('hosting')}
                />
              </div>
            </div>

            {/* ASIC Selector */}
            <div className="bg-card border border-border rounded-lg p-3 sm:p-4">
              <SectionLabel icon={<Cpu className="w-3.5 h-3.5" />} label="SELECT HARDWARE" />
              <div className="mt-3">
                <ASICSelector
                  selectedASIC={selectedASIC}
                  onSelectASIC={handleSelectASIC}
                />
              </div>
            </div>
          </div>

          {/* Column 2: Parameters */}
          <div className="bg-card border border-border rounded-lg p-3 sm:p-4">
            <SectionLabel icon={<Zap className="w-3.5 h-3.5" />} label="PARAMETERS" />
            
            <div className="space-y-4 mt-4">
              {/* Hashrate Slider */}
              <ParameterSlider
                label="Hashrate"
                value={hashrate}
                min={1}
                max={500}
                unit="TH/s"
                onChange={(v) => { setHashrate(v); setSelectedASIC(null); }}
              />

              {/* Power Draw Slider */}
              <ParameterSlider
                label="Power Draw"
                value={powerDraw}
                min={500}
                max={10000}
                step={100}
                unit="W"
                onChange={(v) => { setPowerDraw(v); setSelectedASIC(null); }}
              />

              {/* Units Input */}
              <ParameterInput
                label="Number of Units"
                value={units}
                min={1}
                max={10000}
                onChange={setUnits}
              />

              {/* Power Rate */}
              <ParameterSlider
                label={mode === 'hosting' ? 'Hosting Rate' : 'Electricity Rate'}
                value={mode === 'hosting' ? hostingRate : electricityRate}
                min={0.01}
                max={0.20}
                step={0.005}
                unit="$/kWh"
                decimals={3}
                onChange={(v) => mode === 'hosting' ? setHostingRate(v) : setElectricityRate(v)}
              />

              {/* Hardware Cost */}
              <ParameterInput
                label="Hardware Cost per Unit"
                value={hardwareCost}
                min={0}
                max={50000}
                prefix="$"
                onChange={setHardwareCost}
              />

              {/* Pool Fee */}
              <ParameterSlider
                label="Pool Fee"
                value={poolFee}
                min={0}
                max={5}
                step={0.1}
                unit="%"
                decimals={1}
                onChange={setPoolFee}
              />
            </div>
          </div>

          {/* Column 3: Financial Breakdown */}
          <div className="space-y-4">
            {/* Revenue Breakdown */}
            <div className="bg-card border border-border rounded-lg p-3 sm:p-4">
              <SectionLabel icon={<DollarSign className="w-3.5 h-3.5" />} label="DAILY BREAKDOWN" />
              
              <div className="space-y-2 mt-4">
                <BreakdownRow 
                  label="Gross Revenue" 
                  value={results ? formatLargeNumber(results.dailyRevenue) : '$0'} 
                  type="revenue"
                />
                <BreakdownRow 
                  label="Power Cost" 
                  value={results ? `-${formatLargeNumber(results.dailyPowerCost)}` : '$0'} 
                  type="cost"
                />
                <BreakdownRow 
                  label="Pool Fees" 
                  value={results ? `-${formatLargeNumber(results.dailyPoolFees)}` : '$0'} 
                  type="cost"
                />
                <div className="border-t border-border my-2" />
                <BreakdownRow 
                  label="Net Profit" 
                  value={results ? formatLargeNumber(results.dailyNetProfit) : '$0'} 
                  type={isProfitable ? 'profit' : 'loss'}
                  bold
                />
              </div>
            </div>

            {/* Operation Metrics */}
            <div className="bg-card border border-border rounded-lg p-3 sm:p-4">
              <SectionLabel icon={<BarChart2 className="w-3.5 h-3.5" />} label="OPERATION METRICS" />
              
              <div className="grid grid-cols-2 gap-3 mt-4">
                <MetricBox
                  label="Efficiency"
                  value={results ? `${results.efficiency.toFixed(1)}` : '—'}
                  unit="J/TH"
                />
                <MetricBox
                  label="Power Load"
                  value={results ? `${results.totalPowerKW.toFixed(1)}` : '—'}
                  unit="kW"
                />
                <MetricBox
                  label="Daily kWh"
                  value={results ? `${results.dailyPowerKWh.toFixed(0)}` : '—'}
                  unit="kWh"
                />
                <MetricBox
                  label="Margin"
                  value={results ? `${results.profitMargin.toFixed(0)}` : '—'}
                  unit="%"
                  highlight={results && results.profitMargin > 0}
                />
              </div>
            </div>

            {/* Investment Summary */}
            <div className="bg-card border border-border rounded-lg p-3 sm:p-4">
              <SectionLabel icon={<Target className="w-3.5 h-3.5" />} label="INVESTMENT" />
              
              <div className="space-y-2 mt-4">
                <BreakdownRow 
                  label="Total Hardware" 
                  value={results ? formatLargeNumber(results.totalInvestment) : '$0'} 
                  type="neutral"
                />
                <BreakdownRow 
                  label="Monthly Return" 
                  value={results ? formatLargeNumber(results.monthlyNetProfit) : '$0'} 
                  type={isProfitable ? 'profit' : 'loss'}
                />
                <BreakdownRow 
                  label="Annual Return" 
                  value={results ? formatLargeNumber(results.yearlyNetProfit) : '$0'} 
                  type={isProfitable ? 'profit' : 'loss'}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Sub-components

interface NetworkStatProps {
  label: string;
  value: string;
  icon: React.ReactNode;
  color: 'bitcoin' | 'primary' | 'trust' | 'success';
  className?: string;
}

const NetworkStat: React.FC<NetworkStatProps> = ({ label, value, icon, color, className }) => {
  const colorClasses = {
    bitcoin: 'text-watt-bitcoin',
    primary: 'text-primary',
    trust: 'text-watt-trust',
    success: 'text-data-positive',
  };

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <span className={cn("opacity-70", colorClasses[color])}>{icon}</span>
      <span className="text-muted-foreground">{label}</span>
      <span className={cn("font-bold", colorClasses[color])}>{value}</span>
    </div>
  );
};

interface HeroStatProps {
  label: string;
  value: string;
  subValue: string;
  trend: 'up' | 'down';
  primary?: boolean;
}

const HeroStat: React.FC<HeroStatProps> = ({ label, value, subValue, trend, primary }) => (
  <div className={cn(
    "p-3 sm:p-4 rounded-lg border",
    primary ? "bg-background/80 border-border" : "bg-background/50 border-border/50"
  )}>
    <div className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wider mb-1">{label}</div>
    <div className={cn(
      "font-mono font-bold mb-0.5",
      primary ? "text-xl sm:text-2xl lg:text-3xl" : "text-lg sm:text-xl lg:text-2xl",
      trend === 'up' ? "text-data-positive" : "text-destructive"
    )}>
      {value}
    </div>
    <div className="text-[10px] sm:text-xs text-muted-foreground font-mono">{subValue}</div>
  </div>
);

interface SectionLabelProps {
  icon: React.ReactNode;
  label: string;
}

const SectionLabel: React.FC<SectionLabelProps> = ({ icon, label }) => (
  <div className="flex items-center gap-2 text-muted-foreground">
    {icon}
    <span className="text-[10px] sm:text-xs font-bold tracking-wider">{label}</span>
  </div>
);

interface ModeButtonProps {
  icon: React.ReactNode;
  label: string;
  sublabel: string;
  active: boolean;
  onClick: () => void;
}

const ModeButton: React.FC<ModeButtonProps> = ({ icon, label, sublabel, active, onClick }) => (
  <button
    onClick={onClick}
    className={cn(
      "p-3 rounded-lg border-2 transition-all text-left",
      active 
        ? "bg-primary border-primary text-primary-foreground" 
        : "bg-background border-border hover:border-muted-foreground text-foreground"
    )}
  >
    <div className="mb-1.5">{icon}</div>
    <div className="text-xs sm:text-sm font-bold">{label}</div>
    <div className={cn(
      "text-[10px]",
      active ? "text-primary-foreground/70" : "text-muted-foreground"
    )}>{sublabel}</div>
  </button>
);

interface ParameterSliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit: string;
  decimals?: number;
  onChange: (value: number) => void;
}

const ParameterSlider: React.FC<ParameterSliderProps> = ({ 
  label, value, min, max, step = 1, unit, decimals = 0, onChange 
}) => (
  <div className="space-y-2">
    <div className="flex items-center justify-between">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-sm font-mono font-bold text-foreground">
        {value.toFixed(decimals)} <span className="text-muted-foreground text-xs">{unit}</span>
      </span>
    </div>
    <Slider
      value={[value]}
      min={min}
      max={max}
      step={step}
      onValueChange={(v) => onChange(v[0])}
      className="w-full"
    />
  </div>
);

interface ParameterInputProps {
  label: string;
  value: number;
  min?: number;
  max?: number;
  prefix?: string;
  onChange: (value: number) => void;
}

const ParameterInput: React.FC<ParameterInputProps> = ({ 
  label, value, min, max, prefix, onChange 
}) => (
  <div className="space-y-2">
    <span className="text-xs text-muted-foreground">{label}</span>
    <div className="relative">
      {prefix && (
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">{prefix}</span>
      )}
      <Input
        type="number"
        value={value}
        min={min}
        max={max}
        onChange={(e) => onChange(Number(e.target.value))}
        className={cn(
          "h-10 font-mono text-sm bg-background border-border",
          prefix && "pl-7"
        )}
      />
    </div>
  </div>
);

interface BreakdownRowProps {
  label: string;
  value: string;
  type: 'revenue' | 'cost' | 'profit' | 'loss' | 'neutral';
  bold?: boolean;
}

const BreakdownRow: React.FC<BreakdownRowProps> = ({ label, value, type, bold }) => {
  const valueColor = {
    revenue: 'text-foreground',
    cost: 'text-muted-foreground',
    profit: 'text-data-positive',
    loss: 'text-destructive',
    neutral: 'text-foreground',
  };

  return (
    <div className="flex items-center justify-between">
      <span className={cn("text-xs sm:text-sm", bold ? "font-medium text-foreground" : "text-muted-foreground")}>
        {label}
      </span>
      <span className={cn(
        "font-mono text-sm sm:text-base",
        bold && "font-bold",
        valueColor[type]
      )}>
        {value}
      </span>
    </div>
  );
};

interface MetricBoxProps {
  label: string;
  value: string;
  unit: string;
  highlight?: boolean;
}

const MetricBox: React.FC<MetricBoxProps> = ({ label, value, unit, highlight }) => (
  <div className="bg-background border border-border rounded-lg p-2.5 sm:p-3">
    <div className="text-[9px] sm:text-[10px] text-muted-foreground uppercase tracking-wide mb-1">{label}</div>
    <div className="flex items-baseline gap-1">
      <span className={cn(
        "font-mono font-bold text-sm sm:text-base",
        highlight ? "text-data-positive" : "text-foreground"
      )}>
        {value}
      </span>
      <span className="text-[10px] text-muted-foreground">{unit}</span>
    </div>
  </div>
);

export default BTCROICalculatorV2;
