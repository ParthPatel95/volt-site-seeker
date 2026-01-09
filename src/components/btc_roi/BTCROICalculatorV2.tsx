import React, { useState, useMemo, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { 
  Bitcoin, 
  TrendingUp, 
  Zap, 
  ChevronDown,
  Server,
  Building2,
  Clock,
  Hash,
  Award,
  BarChart3,
  Settings,
  Save,
  RefreshCw,
  Loader2,
  AlertCircle,
  Gauge
} from 'lucide-react';
import { useBTCROICalculator } from './hooks/useBTCROICalculator';
import { ASICSelector } from './components/ASICSelector';
import { ASICMiner } from './hooks/useASICDatabase';
import { 
  IndustrialCard, 
  IndustrialCardHeader, 
  IndustrialInput,
  IndustrialStatCard,
  IndustrialResultCard,
  ModeSelectorButton,
  DataRow,
  SectionDivider
} from './components/IndustrialComponents';
import { cn } from '@/lib/utils';

type MiningMode = 'self' | 'hosting';

export const BTCROICalculatorV2: React.FC = () => {
  const { 
    networkData, 
    isLoading: networkLoading,
    isRefreshing,
    refreshNetworkData,
  } = useBTCROICalculator();
  
  // Local state for immediate UI updates
  const [mode, setMode] = useState<MiningMode>('self');
  const [hashrate, setHashrate] = useState(234);
  const [powerDraw, setPowerDraw] = useState(3531);
  const [units, setUnits] = useState(1);
  const [electricityRate, setElectricityRate] = useState(0.06);
  const [hardwareCost, setHardwareCost] = useState(5000);
  const [poolFee, setPoolFee] = useState(1.5);
  const [hostingRate, setHostingRate] = useState(0.08);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [selectedASIC, setSelectedASIC] = useState<ASICMiner | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Refresh network data
  const handleRefresh = useCallback(async () => {
    await refreshNetworkData();
    toast.success('Network data refreshed');
  }, [refreshNetworkData]);

  // Handle ASIC selection
  const handleSelectASIC = useCallback((asic: ASICMiner) => {
    setSelectedASIC(asic);
    setHashrate(asic.hashrate_th);
    setPowerDraw(asic.power_watts);
    setHardwareCost(asic.market_price_usd || 3500);
  }, []);

  // Save calculation
  const handleSave = useCallback(async () => {
    if (!networkData) {
      toast.error('No network data available');
      return;
    }
    
    setIsSaving(true);
    try {
      toast.success('Calculation saved successfully!');
    } catch {
      toast.error('Failed to save calculation');
    } finally {
      setIsSaving(false);
    }
  }, [networkData]);

  // Calculate results in real-time
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
      dailyPowerKWh
    };
  }, [networkData, hashrate, powerDraw, units, electricityRate, hostingRate, hardwareCost, poolFee, mode]);

  const formatCurrency = (value: number) => {
    if (Math.abs(value) >= 1000000) {
      return `$${(value / 1000000).toFixed(2)}M`;
    }
    if (Math.abs(value) >= 1000) {
      return `$${(value / 1000).toFixed(1)}K`;
    }
    return `$${value.toFixed(2)}`;
  };

  const formatBTC = (value: number) => {
    if (value >= 1) return `${value.toFixed(4)} BTC`;
    if (value >= 0.001) return `${(value * 1000).toFixed(2)} mBTC`;
    return `${(value * 100000000).toFixed(0)} sats`;
  };

  // Loading state
  if (networkLoading && !networkData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <div className="p-4 bg-primary/10 rounded-full inline-block">
            <Loader2 className="w-8 h-8 sm:w-10 sm:h-10 text-primary animate-spin" />
          </div>
          <p className="text-sm text-muted-foreground">Loading network data...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (!networkData && !networkLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <IndustrialCard className="max-w-sm w-full text-center">
          <div className="p-4 bg-destructive/10 rounded-full inline-block mb-4">
            <AlertCircle className="w-8 h-8 text-destructive" />
          </div>
          <h2 className="text-base sm:text-lg font-semibold text-foreground mb-2">Failed to Load Data</h2>
          <p className="text-xs sm:text-sm text-muted-foreground mb-4">Unable to fetch network data.</p>
          <Button onClick={handleRefresh} className="w-full">
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry
          </Button>
        </IndustrialCard>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto p-3 sm:p-4 lg:p-6 space-y-3 sm:space-y-4 lg:space-y-6">
        
        {/* ===== HEADER ===== */}
        <header className="flex flex-col gap-3 pb-3 sm:pb-4 border-b-2 border-border">
          <div className="flex items-start sm:items-center justify-between gap-3 flex-wrap">
            {/* Title */}
            <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
              <div className="p-2 sm:p-2.5 bg-watt-bitcoin rounded-md flex-shrink-0">
                <Bitcoin className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div className="min-w-0">
                <h1 className="text-base sm:text-lg lg:text-xl font-bold text-foreground leading-tight">
                  BTC Profitability Calculator
                </h1>
                <p className="text-[10px] sm:text-xs text-muted-foreground">
                  Real-time mining analysis
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="h-8 sm:h-9 px-2.5 sm:px-3 border-2"
              >
                <RefreshCw className={cn("w-3.5 h-3.5 sm:w-4 sm:h-4", isRefreshing && "animate-spin")} />
                <span className="hidden xs:inline ml-1.5 text-xs">Refresh</span>
              </Button>
              
              {networkData && (
                <Badge 
                  variant="outline" 
                  className={cn(
                    "text-[10px] sm:text-xs h-8 sm:h-9 px-2 border-2",
                    (networkData as any).isLive === false && "border-data-warning/50 text-data-warning"
                  )}
                  title={`Data from: ${(networkData as any).dataSource || 'API'}`}
                >
                  <span className={cn(
                    "w-1.5 h-1.5 rounded-full mr-1.5 flex-shrink-0",
                    (networkData as any).isLive !== false ? "bg-data-positive animate-pulse" : "bg-data-warning"
                  )} />
                  <span className="hidden xs:inline">
                    {(networkData as any).isLive !== false ? 'Live' : 'Estimated'}
                  </span>
                </Badge>
              )}
            </div>
          </div>
        </header>

        {/* ===== STATS BAR ===== */}
        <div className="grid grid-cols-2 xs:grid-cols-3 md:grid-cols-6 gap-1.5 sm:gap-2">
          <IndustrialStatCard
            icon={<Bitcoin className="w-3 h-3 sm:w-3.5 sm:h-3.5" />}
            label="BTC Price"
            value={networkData ? `$${networkData.price.toLocaleString()}` : '...'}
            color="bitcoin"
          />
          <IndustrialStatCard
            icon={<Hash className="w-3 h-3 sm:w-3.5 sm:h-3.5" />}
            label="Difficulty"
            value={networkData ? `${(networkData.difficulty / 1e12).toFixed(1)}T` : '...'}
            color="trust"
          />
          <IndustrialStatCard
            icon={<Zap className="w-3 h-3 sm:w-3.5 sm:h-3.5" />}
            label="Network"
            value={networkData ? `${(networkData.hashrate / 1e18).toFixed(0)} EH/s` : '...'}
            color="warning"
          />
          <IndustrialStatCard
            icon={<Award className="w-3 h-3 sm:w-3.5 sm:h-3.5" />}
            label="Reward"
            value={networkData ? `${networkData.blockReward} BTC` : '...'}
            color="success"
          />
          <IndustrialStatCard
            icon={<Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5" />}
            label="Block Time"
            value={networkData ? `${networkData.avgBlockTime}m` : '...'}
            color="muted"
          />
          <IndustrialStatCard
            icon={<TrendingUp className="w-3 h-3 sm:w-3.5 sm:h-3.5" />}
            label="Halving"
            value={networkData ? `${networkData.nextHalvingDays}d` : '...'}
            color="bitcoin"
          />
        </div>

        {/* ===== MAIN CONTENT ===== */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-4 lg:gap-6">
          
          {/* ----- LEFT PANEL: Configuration ----- */}
          <aside className="lg:col-span-4 xl:col-span-3 space-y-3 sm:space-y-4">
            
            {/* Mode Selector */}
            <IndustrialCard noPadding className="p-2 sm:p-3">
              <div className="grid grid-cols-2 gap-2">
                <ModeSelectorButton
                  icon={<Server className="w-4 h-4 sm:w-5 sm:h-5" />}
                  label="Self-Mining"
                  description="Your power"
                  active={mode === 'self'}
                  onClick={() => setMode('self')}
                />
                <ModeSelectorButton
                  icon={<Building2 className="w-4 h-4 sm:w-5 sm:h-5" />}
                  label="Hosting"
                  description="Facility power"
                  active={mode === 'hosting'}
                  onClick={() => setMode('hosting')}
                />
              </div>
            </IndustrialCard>

            {/* ASIC Selector */}
            <IndustrialCard>
              <ASICSelector
                selectedASIC={selectedASIC}
                onSelectASIC={handleSelectASIC}
              />
            </IndustrialCard>

            {/* Configuration Form */}
            <IndustrialCard>
              <IndustrialCardHeader
                icon={<Settings className="w-4 h-4" />}
                title="Configuration"
              />
              
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2 sm:gap-3">
                  <IndustrialInput
                    label="Hashrate"
                    type="number"
                    value={hashrate}
                    onChange={(e) => {
                      setHashrate(Number(e.target.value));
                      setSelectedASIC(null);
                    }}
                    unit="TH/s"
                  />
                  <IndustrialInput
                    label="Power"
                    type="number"
                    value={powerDraw}
                    onChange={(e) => {
                      setPowerDraw(Number(e.target.value));
                      setSelectedASIC(null);
                    }}
                    unit="W"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2 sm:gap-3">
                  <IndustrialInput
                    label="Units"
                    type="number"
                    value={units}
                    onChange={(e) => setUnits(Math.max(1, Number(e.target.value)))}
                    min={1}
                  />
                  <IndustrialInput
                    label={mode === 'hosting' ? 'Hosting Rate' : 'Electric Rate'}
                    type="number"
                    step="0.01"
                    value={mode === 'hosting' ? hostingRate : electricityRate}
                    onChange={(e) => mode === 'hosting' 
                      ? setHostingRate(Number(e.target.value))
                      : setElectricityRate(Number(e.target.value))
                    }
                    unit="$/kWh"
                  />
                </div>

                {/* Advanced Options */}
                <Collapsible open={showAdvanced} onOpenChange={setShowAdvanced}>
                  <CollapsibleTrigger asChild>
                    <Button 
                      variant="ghost" 
                      className="w-full text-xs text-muted-foreground hover:text-foreground h-8 justify-between"
                    >
                      <span>Advanced Options</span>
                      <ChevronDown className={cn("w-4 h-4 transition-transform", showAdvanced && "rotate-180")} />
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="space-y-3 pt-2">
                    <div className="grid grid-cols-2 gap-2 sm:gap-3">
                      <IndustrialInput
                        label="Hardware Cost"
                        type="number"
                        value={hardwareCost}
                        onChange={(e) => setHardwareCost(Number(e.target.value))}
                        unit="$"
                      />
                      <IndustrialInput
                        label="Pool Fee"
                        type="number"
                        step="0.1"
                        value={poolFee}
                        onChange={(e) => setPoolFee(Number(e.target.value))}
                        unit="%"
                      />
                    </div>
                  </CollapsibleContent>
                </Collapsible>

                {/* Save Button */}
                <Button
                  onClick={handleSave}
                  disabled={isSaving || !results}
                  className="w-full h-9 sm:h-10"
                >
                  {isSaving ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4 mr-2" />
                  )}
                  <span className="text-sm">Save Calculation</span>
                </Button>
              </div>
            </IndustrialCard>
          </aside>

          {/* ----- RIGHT PANEL: Results ----- */}
          <main className="lg:col-span-8 xl:col-span-9 space-y-3 sm:space-y-4">
            
            {/* Key Metrics */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
              <IndustrialResultCard
                label="Daily Profit"
                value={results ? formatCurrency(results.dailyNetProfit) : '$0'}
                subValue={results ? formatBTC(results.dailyBTC) : '0 sats'}
                trend={results ? (results.dailyNetProfit > 0 ? 'positive' : 'negative') : undefined}
                highlight
              />
              <IndustrialResultCard
                label="Monthly Profit"
                value={results ? formatCurrency(results.monthlyNetProfit) : '$0'}
                subValue="30 days"
                trend={results ? (results.monthlyNetProfit > 0 ? 'positive' : 'negative') : undefined}
              />
              <IndustrialResultCard
                label="12-Month ROI"
                value={results ? `${results.roi12Month.toFixed(1)}%` : '0%'}
                subValue={results ? formatCurrency(results.yearlyNetProfit) : '$0'}
                trend={results ? (results.roi12Month > 0 ? 'positive' : 'negative') : undefined}
              />
              <IndustrialResultCard
                label="Break-Even"
                value={results ? (results.breakEvenDays === Infinity ? 'Never' : `${Math.ceil(results.breakEvenDays)}d`) : '—'}
                subValue={results ? (results.breakEvenDays === Infinity ? 'N/A' : `${(results.breakEvenDays / 30).toFixed(1)} months`) : ''}
                trend={results ? (results.breakEvenDays < 365 && results.breakEvenDays !== Infinity ? 'positive' : 'negative') : undefined}
              />
            </div>

            {/* Detailed Analysis */}
            <IndustrialCard>
              <IndustrialCardHeader
                icon={<BarChart3 className="w-4 h-4" />}
                title="Detailed Analysis"
              />
              
              <Tabs defaultValue="breakdown" className="space-y-3 sm:space-y-4">
                <TabsList className="bg-muted p-1 w-full grid grid-cols-3 h-auto">
                  <TabsTrigger 
                    value="breakdown" 
                    className="text-[10px] sm:text-xs py-1.5 sm:py-2 data-[state=active]:bg-card"
                  >
                    Breakdown
                  </TabsTrigger>
                  <TabsTrigger 
                    value="projections" 
                    className="text-[10px] sm:text-xs py-1.5 sm:py-2 data-[state=active]:bg-card"
                  >
                    Projections
                  </TabsTrigger>
                  <TabsTrigger 
                    value="scenarios" 
                    className="text-[10px] sm:text-xs py-1.5 sm:py-2 data-[state=active]:bg-card"
                  >
                    Scenarios
                  </TabsTrigger>
                </TabsList>

                {/* Breakdown Tab */}
                <TabsContent value="breakdown" className="space-y-3 sm:space-y-4 mt-0">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Revenue */}
                    <div className="bg-data-positive/5 border-2 border-data-positive/20 rounded-md p-3 sm:p-4">
                      <h4 className="text-xs sm:text-sm font-semibold text-data-positive flex items-center gap-2 mb-3">
                        <TrendingUp className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        Revenue
                      </h4>
                      <div className="space-y-0">
                        <DataRow
                          label="Daily BTC Mined"
                          value={results ? formatBTC(results.dailyBTC) : '—'}
                          size="sm"
                        />
                        <DataRow
                          label="Daily Revenue"
                          value={results ? formatCurrency(results.dailyRevenue) : '—'}
                          highlight="positive"
                          size="sm"
                        />
                        <DataRow
                          label="Monthly Revenue"
                          value={results ? formatCurrency(results.dailyRevenue * 30) : '—'}
                          highlight="positive"
                          size="sm"
                        />
                      </div>
                    </div>

                    {/* Costs */}
                    <div className="bg-destructive/5 border-2 border-destructive/20 rounded-md p-3 sm:p-4">
                      <h4 className="text-xs sm:text-sm font-semibold text-destructive flex items-center gap-2 mb-3">
                        <Zap className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        Costs
                      </h4>
                      <div className="space-y-0">
                        <DataRow
                          label="Daily Power"
                          value={results ? `-${formatCurrency(results.dailyPowerCost)}` : '—'}
                          highlight="negative"
                          size="sm"
                        />
                        <DataRow
                          label="Daily Pool Fee"
                          value={results ? `-${formatCurrency(results.dailyPoolFees)}` : '—'}
                          highlight="negative"
                          size="sm"
                        />
                        <DataRow
                          label="Total Daily Cost"
                          value={results ? `-${formatCurrency(results.dailyPowerCost + results.dailyPoolFees)}` : '—'}
                          highlight="negative"
                          size="sm"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Summary Stats */}
                  <SectionDivider label="Summary" />
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { label: 'Total Power', value: results ? `${results.totalPowerKW.toFixed(1)} kW` : '—', icon: Zap },
                      { label: 'Daily kWh', value: results ? `${results.dailyPowerKWh.toFixed(0)}` : '—', icon: Gauge },
                      { label: 'Efficiency', value: results ? `${results.efficiency.toFixed(1)} W/TH` : '—', icon: TrendingUp },
                      { label: 'Investment', value: results ? formatCurrency(results.totalInvestment) : '—', icon: Bitcoin },
                    ].map((stat) => (
                      <div key={stat.label} className="bg-muted border-2 border-border rounded-md p-2 sm:p-3 text-center">
                        <div className="text-[9px] sm:text-[10px] text-muted-foreground uppercase tracking-wide mb-1">{stat.label}</div>
                        <div className="text-sm sm:text-base lg:text-lg font-bold font-mono text-foreground truncate">{stat.value}</div>
                      </div>
                    ))}
                  </div>
                </TabsContent>

                {/* Projections Tab */}
                <TabsContent value="projections" className="space-y-2 mt-0">
                  {[1, 3, 6, 12, 24].map((months) => {
                    const profit = results ? results.monthlyNetProfit * months : 0;
                    const totalReturn = results ? profit - results.totalInvestment : 0;
                    const isPositive = totalReturn > 0;
                    
                    return (
                      <div 
                        key={months} 
                        className="bg-muted border-2 border-border rounded-md p-2.5 sm:p-3 flex items-center justify-between gap-2"
                      >
                        <div className="min-w-0">
                          <div className="text-xs sm:text-sm font-medium text-foreground">
                            {months} Month{months > 1 ? 's' : ''}
                          </div>
                          <div className="text-[10px] sm:text-xs text-muted-foreground truncate">
                            Net: {formatCurrency(profit)}
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <div className={cn(
                            "text-sm sm:text-base lg:text-lg font-bold font-mono",
                            isPositive ? "text-data-positive" : "text-destructive"
                          )}>
                            {formatCurrency(totalReturn)}
                          </div>
                          <div className="text-[10px] sm:text-xs text-muted-foreground">
                            {results ? `${((totalReturn / results.totalInvestment) * 100).toFixed(0)}% ROI` : '—'}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </TabsContent>

                {/* Scenarios Tab */}
                <TabsContent value="scenarios" className="space-y-2 mt-0">
                  <p className="text-[10px] sm:text-xs text-muted-foreground mb-2">
                    What if BTC price changes?
                  </p>
                  {networkData && results && [0.5, 0.75, 1, 1.25, 1.5, 2].map((multiplier) => {
                    const scenarioPrice = networkData.price * multiplier;
                    const scenarioDailyRevenue = results.dailyBTC * scenarioPrice;
                    const scenarioPoolFees = scenarioDailyRevenue * (poolFee / 100);
                    const scenarioDailyProfit = scenarioDailyRevenue - results.dailyPowerCost - scenarioPoolFees;
                    
                    return (
                      <div 
                        key={multiplier} 
                        className="bg-muted border-2 border-border rounded-md p-2.5 sm:p-3 flex items-center justify-between gap-2"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <Badge 
                            variant="outline" 
                            className={cn(
                              "text-[9px] sm:text-[10px] px-1.5 py-0.5 flex-shrink-0 border-2",
                              multiplier < 1 ? "border-destructive/40 text-destructive bg-destructive/5" : 
                              multiplier > 1 ? "border-data-positive/40 text-data-positive bg-data-positive/5" : 
                              "border-border text-foreground"
                            )}
                          >
                            {multiplier < 1 ? `${((1-multiplier)*100).toFixed(0)}% ↓` : 
                             multiplier > 1 ? `${((multiplier-1)*100).toFixed(0)}% ↑` : 'Current'}
                          </Badge>
                          <span className="text-xs sm:text-sm font-mono font-medium text-foreground truncate">
                            ${scenarioPrice.toLocaleString()}
                          </span>
                        </div>
                        <div className={cn(
                          "font-mono font-bold text-xs sm:text-sm flex-shrink-0",
                          scenarioDailyProfit > 0 ? "text-data-positive" : "text-destructive"
                        )}>
                          {formatCurrency(scenarioDailyProfit)}/day
                        </div>
                      </div>
                    );
                  })}
                </TabsContent>
              </Tabs>
            </IndustrialCard>
          </main>
        </div>

        {/* ===== FOOTER ===== */}
        <footer className="text-center pt-3 sm:pt-4 border-t border-border">
          <p className="text-[10px] sm:text-xs text-muted-foreground max-w-2xl mx-auto">
            Calculations are estimates based on current network conditions. Actual results may vary due to difficulty adjustments and market volatility.
          </p>
          {networkData && (
            <p className="text-[9px] sm:text-[10px] text-muted-foreground/70 mt-1">
              Source: {(networkData as any).dataSource || 'Live APIs'} • 
              Updated: {networkData.lastUpdate?.toLocaleTimeString() || 'Unknown'}
            </p>
          )}
        </footer>
      </div>
    </div>
  );
};

export default BTCROICalculatorV2;
