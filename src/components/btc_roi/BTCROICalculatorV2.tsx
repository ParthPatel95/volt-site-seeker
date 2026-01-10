import React, { useState, useMemo, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { 
  Bitcoin, TrendingUp, TrendingDown, Zap, Server, Building2, RefreshCw,
  AlertCircle, Activity, Cpu, DollarSign, Clock, Target, CircleDot, Wallet,
  BarChart2, Gauge, FileText, Download, PieChart, LineChart, Shield,
  Calculator, Plus, ChevronDown, ChevronUp
} from 'lucide-react';
import { BTCROIPDFGenerator } from './reporting/BTCROIPDFGenerator';
import { useBTCROICalculator } from './hooks/useBTCROICalculator';
import { ASICSelector } from './components/ASICSelector';
import { ASICMiner } from './hooks/useASICDatabase';
import { FinancialAnalysisService, FinancialMetrics } from './services/financialAnalysisService';
import { BTCROIProfitLossStatement } from './components/BTCROIProfitLossStatement';
import { BTCROICashFlowChart } from './components/BTCROICashFlowChart';
import { BTCROITornadoChart } from './components/BTCROITornadoChart';
import { BTCROIASICComparison } from './components/BTCROIASICComparison';
import { BTCROIBreakEvenAnalysis } from './components/BTCROIBreakEvenAnalysis';
import { BTCROIScenarioAnalysis } from './components/BTCROIScenarioAnalysis';
import { cn } from '@/lib/utils';

type MiningMode = 'self' | 'hosting';
type PLPeriod = 'daily' | 'monthly' | 'quarterly' | 'yearly';

export const BTCROICalculatorV2: React.FC = () => {
  const { networkData, isLoading: networkLoading, isRefreshing, refreshNetworkData } = useBTCROICalculator();
  
  const [mode, setMode] = useState<MiningMode>('self');
  const [hashrate, setHashrate] = useState(234);
  const [powerDraw, setPowerDraw] = useState(3531);
  const [units, setUnits] = useState(1);
  const [electricityRate, setElectricityRate] = useState(0.06);
  const [hardwareCost, setHardwareCost] = useState(5000);
  const [poolFee, setPoolFee] = useState(1.5);
  const [hostingRate, setHostingRate] = useState(0.08);
  const [maintenancePercent, setMaintenancePercent] = useState(2);
  const [selectedASIC, setSelectedASIC] = useState<ASICMiner | null>(null);
  const [compareMiners, setCompareMiners] = useState<ASICMiner[]>([]);
  const [plPeriod, setPLPeriod] = useState<PLPeriod>('monthly');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [showPDFGenerator, setShowPDFGenerator] = useState(false);

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

  const handleAddToCompare = useCallback((asic: ASICMiner) => {
    if (compareMiners.length < 4 && !compareMiners.find(m => m.id === asic.id)) {
      setCompareMiners([...compareMiners, asic]);
      toast.success(`Added ${asic.model} to comparison`);
    }
  }, [compareMiners]);

  const handleRemoveFromCompare = useCallback((index: number) => {
    setCompareMiners(compareMiners.filter((_, i) => i !== index));
  }, [compareMiners]);

  const effectiveRate = mode === 'hosting' ? hostingRate : electricityRate;

  // Core calculations
  const results = useMemo(() => {
    if (!networkData) return null;

    const totalHashrate = hashrate * units * 1e12;
    const blocksPerDay = 144;
    const dailyBTC = (totalHashrate / networkData.hashrate) * blocksPerDay * networkData.blockReward;
    const dailyRevenue = dailyBTC * networkData.price;
    
    const totalPowerKW = (powerDraw * units) / 1000;
    const dailyPowerKWh = totalPowerKW * 24;
    const dailyPowerCost = dailyPowerKWh * effectiveRate;
    const dailyPoolFees = dailyRevenue * (poolFee / 100);
    const dailyNetProfit = dailyRevenue - dailyPowerCost - dailyPoolFees;
    
    const totalInvestment = hardwareCost * units;
    const monthlyMaintenance = totalInvestment * (maintenancePercent / 100) / 12;
    const monthlyDepreciation = totalInvestment / 36;
    const breakEvenDays = dailyNetProfit > 0 ? totalInvestment / dailyNetProfit : Infinity;
    const roi12Month = totalInvestment > 0 ? ((dailyNetProfit * 365) / totalInvestment) * 100 : 0;
    const efficiency = powerDraw / hashrate;
    const profitMargin = dailyRevenue > 0 ? (dailyNetProfit / dailyRevenue) * 100 : 0;

    return {
      dailyBTC, dailyRevenue, dailyPowerCost, dailyPoolFees, dailyNetProfit,
      monthlyNetProfit: dailyNetProfit * 30, yearlyNetProfit: dailyNetProfit * 365,
      totalInvestment, breakEvenDays, roi12Month, efficiency, totalPowerKW,
      dailyPowerKWh, profitMargin, monthlyMaintenance, monthlyDepreciation
    };
  }, [networkData, hashrate, powerDraw, units, effectiveRate, hardwareCost, poolFee, maintenancePercent]);

  // Advanced financial analysis
  const financialMetrics = useMemo((): FinancialMetrics | null => {
    if (!networkData || !results) return null;
    
    const formData = {
      asicModel: selectedASIC?.model || 'Custom',
      hashrate, powerDraw, units, hardwareCost,
      hostingRate, powerRate: electricityRate, hostingFee: 0,
      poolFee, coolingOverhead: 15, efficiencyOverride: 100,
      resaleValue: 20, maintenancePercent,
      hostingFeeRate: 0.08, region: 'ERCOT' as const, customElectricityCost: 0.05,
      totalLoadKW: 325, infrastructureCost: 500000, monthlyOverhead: 15000,
      powerOverheadPercent: 10, expectedUptimePercent: 98,
      useManualEnergyCosts: false, manualEnergyRate: 0.04,
      manualTransmissionRate: 0.01, manualDistributionRate: 0.005,
      manualAncillaryRate: 0.003, manualRegulatoryRate: 0.002
    };
    
    return FinancialAnalysisService.calculateFullAnalysis(formData, networkData, mode);
  }, [networkData, results, hashrate, powerDraw, units, hardwareCost, poolFee, maintenancePercent, mode, electricityRate, hostingRate, selectedASIC]);

  // P&L Statement data
  const plData = useMemo(() => {
    if (!results || !financialMetrics) return null;
    return {
      dailyRevenue: results.dailyRevenue,
      dailyPowerCost: results.dailyPowerCost,
      dailyPoolFees: results.dailyPoolFees,
      dailyNetProfit: results.dailyNetProfit,
      monthlyRevenue: results.dailyRevenue * 30,
      monthlyPowerCost: results.dailyPowerCost * 30,
      monthlyPoolFees: results.dailyPoolFees * 30,
      monthlyMaintenance: results.monthlyMaintenance,
      monthlyDepreciation: results.monthlyDepreciation,
      monthlyNetProfit: results.monthlyNetProfit,
      yearlyRevenue: results.dailyRevenue * 365,
      yearlyPowerCost: results.dailyPowerCost * 365,
      yearlyPoolFees: results.dailyPoolFees * 365,
      yearlyMaintenance: results.monthlyMaintenance * 12,
      yearlyDepreciation: results.monthlyDepreciation * 12,
      yearlyNetProfit: results.yearlyNetProfit,
      grossMargin: financialMetrics.grossMargin,
      operatingMargin: financialMetrics.operatingMargin,
      netMargin: financialMetrics.netMargin,
      ebitda: financialMetrics.ebitda
    };
  }, [results, financialMetrics]);

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

  // Loading/Error states
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

  if (!networkData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="bg-card border border-destructive/50 rounded-lg p-6 max-w-sm w-full text-center">
          <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
          <h2 className="text-lg font-bold text-foreground mb-2">CONNECTION FAILED</h2>
          <p className="text-sm text-muted-foreground mb-4">Unable to fetch network data</p>
          <Button onClick={handleRefresh} variant="outline" className="w-full">
            <RefreshCw className="w-4 h-4 mr-2" />RETRY
          </Button>
        </div>
      </div>
    );
  }

  const isProfitable = results && results.dailyNetProfit > 0;

  return (
    <div className="min-h-screen bg-background">
      {/* Network Status Bar */}
      <div className="border-b border-border bg-card/50 sticky top-0 z-50">
        <div className="max-w-[1800px] mx-auto px-3 sm:px-4 lg:px-6">
          <div className="flex items-center justify-between h-12 sm:h-14 gap-2 overflow-x-auto">
            <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-gradient-to-br from-watt-bitcoin to-watt-bitcoin/70 flex items-center justify-center">
                <Bitcoin className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <div className="hidden xs:block">
                <div className="text-sm sm:text-base font-bold text-foreground leading-none">BTC MINING</div>
                <div className="text-[10px] text-muted-foreground font-mono">ANALYTICS LAB</div>
              </div>
            </div>

            <div className="flex items-center gap-3 sm:gap-4 lg:gap-6 text-xs sm:text-sm font-mono overflow-x-auto">
              <NetworkStat label="BTC" value={`$${networkData.price.toLocaleString()}`} icon={<Bitcoin className="w-3 h-3" />} color="bitcoin" />
              <NetworkStat label="HASH" value={`${(networkData.hashrate / 1e18).toFixed(0)} EH/s`} icon={<Activity className="w-3 h-3" />} color="primary" />
              <NetworkStat label="DIFF" value={`${(networkData.difficulty / 1e12).toFixed(1)}T`} icon={<Gauge className="w-3 h-3" />} color="trust" className="hidden sm:flex" />
              <NetworkStat label="REWARD" value={`${networkData.blockReward} BTC`} icon={<Wallet className="w-3 h-3" />} color="success" className="hidden md:flex" />
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              <Button variant="ghost" size="sm" onClick={handleRefresh} disabled={isRefreshing} className="h-8 w-8 p-0">
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
      <div className="max-w-[1800px] mx-auto p-3 sm:p-4 lg:p-6 space-y-4 sm:space-y-6">
        {/* Executive Summary Panel */}
        <div className={cn(
          "relative overflow-hidden rounded-xl border-2 p-4 sm:p-6",
          isProfitable ? "bg-gradient-to-br from-data-positive/5 to-data-positive/10 border-data-positive/30" : "bg-gradient-to-br from-destructive/5 to-destructive/10 border-destructive/30"
        )}>
          <div className="absolute inset-0 bg-grid-pattern opacity-30 pointer-events-none" />
          <div className="relative">
            <div className={cn("inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold mb-4", isProfitable ? "bg-data-positive/20 text-data-positive" : "bg-destructive/20 text-destructive")}>
              {isProfitable ? <><TrendingUp className="w-3.5 h-3.5" />PROFITABLE</> : <><TrendingDown className="w-3.5 h-3.5" />UNPROFITABLE</>}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
              <HeroStat label="Daily Profit" value={results ? formatLargeNumber(results.dailyNetProfit) : '$0'} subValue={results ? formatBTC(results.dailyBTC) : '0 sats'} trend={isProfitable ? 'up' : 'down'} />
              <HeroStat label="Monthly" value={results ? formatLargeNumber(results.monthlyNetProfit) : '$0'} subValue="30-day" trend={isProfitable ? 'up' : 'down'} />
              <HeroStat label="Annual ROI" value={results ? `${results.roi12Month.toFixed(0)}%` : '0%'} subValue={results ? formatLargeNumber(results.yearlyNetProfit) : '$0'} trend={results && results.roi12Month > 0 ? 'up' : 'down'} />
              <HeroStat label="Break-Even" value={results ? (results.breakEvenDays === Infinity ? '∞' : `${Math.ceil(results.breakEvenDays)}d`) : '—'} subValue={results && results.breakEvenDays !== Infinity ? `${(results.breakEvenDays / 30).toFixed(1)} mo` : 'Never'} trend={results && results.breakEvenDays < 365 ? 'up' : 'down'} />
              <HeroStat label="NPV (10%)" value={financialMetrics ? formatLargeNumber(financialMetrics.npv) : '$0'} subValue="36-month" trend={financialMetrics && financialMetrics.npv > 0 ? 'up' : 'down'} className="hidden sm:block" />
              <HeroStat label="IRR" value={financialMetrics ? `${financialMetrics.irr.toFixed(1)}%` : '0%'} subValue="Annualized" trend={financialMetrics && financialMetrics.irr > 10 ? 'up' : 'down'} className="hidden sm:block" />
            </div>
          </div>
        </div>

        {/* Main Grid: Configuration + Tabs */}
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-4 sm:gap-6">
          {/* Left Sidebar: Configuration */}
          <div className="xl:col-span-1 space-y-4">
            {/* Mode Toggle */}
            <div className="bg-card border border-border rounded-lg p-3 sm:p-4">
              <SectionLabel icon={<Server className="w-3.5 h-3.5" />} label="MINING MODE" />
              <div className="grid grid-cols-2 gap-2 mt-3">
                <ModeButton icon={<Server className="w-4 h-4" />} label="Self-Mining" active={mode === 'self'} onClick={() => setMode('self')} />
                <ModeButton icon={<Building2 className="w-4 h-4" />} label="Hosted" active={mode === 'hosting'} onClick={() => setMode('hosting')} />
              </div>
            </div>

            {/* ASIC Selector */}
            <div className="bg-card border border-border rounded-lg p-3 sm:p-4">
              <SectionLabel icon={<Cpu className="w-3.5 h-3.5" />} label="HARDWARE" />
              <div className="mt-3">
                <ASICSelector selectedASIC={selectedASIC} onSelectASIC={handleSelectASIC} />
              </div>
            </div>

            {/* Parameters */}
            <div className="bg-card border border-border rounded-lg p-3 sm:p-4">
              <SectionLabel icon={<Zap className="w-3.5 h-3.5" />} label="PARAMETERS" />
              <div className="space-y-4 mt-4">
                <ParameterSlider label="Hashrate" value={hashrate} min={1} max={500} unit="TH/s" onChange={(v) => { setHashrate(v); setSelectedASIC(null); }} />
                <ParameterSlider label="Power Draw" value={powerDraw} min={500} max={10000} step={100} unit="W" onChange={(v) => { setPowerDraw(v); setSelectedASIC(null); }} />
                <ParameterInput label="Units" value={units} min={1} max={10000} onChange={setUnits} />
                <ParameterSlider label={mode === 'hosting' ? 'Hosting Rate' : 'Electricity'} value={mode === 'hosting' ? hostingRate : electricityRate} min={0.01} max={0.20} step={0.005} unit="$/kWh" decimals={3} onChange={(v) => mode === 'hosting' ? setHostingRate(v) : setElectricityRate(v)} />
                <ParameterInput label="Hardware Cost" value={hardwareCost} min={0} max={50000} prefix="$" onChange={setHardwareCost} />
                <ParameterSlider label="Pool Fee" value={poolFee} min={0} max={5} step={0.1} unit="%" decimals={1} onChange={setPoolFee} />
                
                <button onClick={() => setShowAdvanced(!showAdvanced)} className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors">
                  {showAdvanced ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                  Advanced Options
                </button>
                
                {showAdvanced && (
                  <div className="space-y-4 pt-2 border-t border-border">
                    <ParameterSlider label="Maintenance" value={maintenancePercent} min={0} max={10} step={0.5} unit="%" decimals={1} onChange={setMaintenancePercent} />
                  </div>
                )}
              </div>
            </div>

            {/* Export Actions */}
            <div className="bg-card border border-border rounded-lg p-3 sm:p-4">
              <SectionLabel icon={<FileText className="w-3.5 h-3.5" />} label="EXPORT" />
              <div className="grid grid-cols-2 gap-2 mt-3">
                <Button variant="outline" size="sm" className="text-xs" onClick={() => setShowPDFGenerator(true)} disabled={!financialMetrics || !results}>
                  <Download className="w-3 h-3 mr-1" />PDF
                </Button>
                <Button variant="outline" size="sm" className="text-xs" onClick={() => toast.info('CSV export coming soon')}>
                  <Download className="w-3 h-3 mr-1" />CSV
                </Button>
              </div>
            </div>
          </div>

          {/* Right: Tabbed Analysis */}
          <div className="xl:col-span-3">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="w-full flex flex-wrap h-auto gap-1 bg-muted/50 p-1 rounded-lg">
                <TabsTrigger value="overview" className="flex-1 min-w-[80px] text-xs"><Calculator className="w-3 h-3 mr-1" />Overview</TabsTrigger>
                <TabsTrigger value="pnl" className="flex-1 min-w-[80px] text-xs"><DollarSign className="w-3 h-3 mr-1" />P&L</TabsTrigger>
                <TabsTrigger value="cashflow" className="flex-1 min-w-[80px] text-xs"><LineChart className="w-3 h-3 mr-1" />Cash Flow</TabsTrigger>
                <TabsTrigger value="sensitivity" className="flex-1 min-w-[80px] text-xs"><BarChart2 className="w-3 h-3 mr-1" />Sensitivity</TabsTrigger>
                <TabsTrigger value="scenarios" className="flex-1 min-w-[80px] text-xs"><Target className="w-3 h-3 mr-1" />Scenarios</TabsTrigger>
                <TabsTrigger value="risk" className="flex-1 min-w-[80px] text-xs"><Shield className="w-3 h-3 mr-1" />Risk</TabsTrigger>
                <TabsTrigger value="compare" className="flex-1 min-w-[80px] text-xs"><Plus className="w-3 h-3 mr-1" />Compare</TabsTrigger>
              </TabsList>

              <div className="mt-4">
                <TabsContent value="overview" className="mt-0 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-card border border-border rounded-lg p-4">
                      <SectionLabel icon={<DollarSign className="w-3.5 h-3.5" />} label="DAILY BREAKDOWN" />
                      <div className="space-y-2 mt-4">
                        <BreakdownRow label="Gross Revenue" value={results ? formatLargeNumber(results.dailyRevenue) : '$0'} type="revenue" />
                        <BreakdownRow label="Power Cost" value={results ? `-${formatLargeNumber(results.dailyPowerCost)}` : '$0'} type="cost" />
                        <BreakdownRow label="Pool Fees" value={results ? `-${formatLargeNumber(results.dailyPoolFees)}` : '$0'} type="cost" />
                        <div className="border-t border-border my-2" />
                        <BreakdownRow label="Net Profit" value={results ? formatLargeNumber(results.dailyNetProfit) : '$0'} type={isProfitable ? 'profit' : 'loss'} bold />
                      </div>
                    </div>

                    <div className="bg-card border border-border rounded-lg p-4">
                      <SectionLabel icon={<BarChart2 className="w-3.5 h-3.5" />} label="KEY METRICS" />
                      <div className="grid grid-cols-2 gap-3 mt-4">
                        <MetricBox label="Efficiency" value={results ? `${results.efficiency.toFixed(1)}` : '—'} unit="J/TH" />
                        <MetricBox label="Power Load" value={results ? `${results.totalPowerKW.toFixed(1)}` : '—'} unit="kW" />
                        <MetricBox label="Gross Margin" value={financialMetrics ? `${financialMetrics.grossMargin.toFixed(0)}` : '—'} unit="%" highlight={financialMetrics && financialMetrics.grossMargin > 30} />
                        <MetricBox label="Cash on Cash" value={financialMetrics ? `${financialMetrics.cashOnCashReturn.toFixed(0)}` : '—'} unit="%" highlight={financialMetrics && financialMetrics.cashOnCashReturn > 50} />
                      </div>
                    </div>
                  </div>

                  {financialMetrics && (
                    <div className="bg-card border border-border rounded-lg p-4">
                      <SectionLabel icon={<Target className="w-3.5 h-3.5" />} label="FINANCIAL SUMMARY" />
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
                        <FinancialMetricCard label="NPV (10%)" value={formatLargeNumber(financialMetrics.npv)} positive={financialMetrics.npv > 0} />
                        <FinancialMetricCard label="IRR" value={`${financialMetrics.irr.toFixed(1)}%`} positive={financialMetrics.irr > 10} />
                        <FinancialMetricCard label="Payback" value={financialMetrics.paybackPeriodMonths === Infinity ? 'Never' : `${financialMetrics.paybackPeriodMonths.toFixed(1)} mo`} positive={financialMetrics.paybackPeriodMonths < 24} />
                        <FinancialMetricCard label="Profit Index" value={financialMetrics.profitabilityIndex.toFixed(2)} positive={financialMetrics.profitabilityIndex > 1} />
                      </div>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="pnl" className="mt-0">
                  <div className="space-y-4">
                    <div className="flex gap-2">
                      {(['daily', 'monthly', 'quarterly', 'yearly'] as PLPeriod[]).map(p => (
                        <Button key={p} variant={plPeriod === p ? 'default' : 'outline'} size="sm" onClick={() => setPLPeriod(p)} className="capitalize text-xs">
                          {p}
                        </Button>
                      ))}
                    </div>
                    {plData && <BTCROIProfitLossStatement data={plData} period={plPeriod} />}
                  </div>
                </TabsContent>

                <TabsContent value="cashflow" className="mt-0">
                  {financialMetrics && results && (
                    <BTCROICashFlowChart projections={financialMetrics.cashFlowProjections} initialInvestment={results.totalInvestment} />
                  )}
                </TabsContent>

                <TabsContent value="sensitivity" className="mt-0">
                  {financialMetrics && results && (
                    <BTCROITornadoChart data={financialMetrics.tornadoData} baseCase={results.yearlyNetProfit} />
                  )}
                </TabsContent>

                <TabsContent value="scenarios" className="mt-0">
                  {financialMetrics && results && (
                    <BTCROIScenarioAnalysis scenarios={financialMetrics.scenarios} currentAnnualProfit={results.yearlyNetProfit} />
                  )}
                </TabsContent>

                <TabsContent value="risk" className="mt-0">
                  {financialMetrics && networkData && (
                    <BTCROIBreakEvenAnalysis
                      currentBTCPrice={networkData.price}
                      breakEvenBTCPrice={financialMetrics.breakEvenBTCPrice}
                      currentElectricityRate={effectiveRate}
                      breakEvenElectricityRate={financialMetrics.breakEvenElectricityRate}
                      currentDifficulty={networkData.difficulty}
                      breakEvenDifficulty={financialMetrics.breakEvenDifficulty}
                      safetyMargin={financialMetrics.safetyMargin}
                    />
                  )}
                </TabsContent>

                <TabsContent value="compare" className="mt-0">
                  {networkData && (
                    <BTCROIASICComparison miners={compareMiners} networkData={networkData} electricityRate={effectiveRate} poolFee={poolFee} onRemoveMiner={handleRemoveFromCompare} />
                  )}
                </TabsContent>
              </div>
            </Tabs>
          </div>
        </div>
      </div>

      {/* PDF Generator Modal */}
      {networkData && financialMetrics && results && (
        <BTCROIPDFGenerator
          networkData={networkData}
          financialMetrics={financialMetrics}
          results={results}
          parameters={{
            hashrate,
            powerDraw,
            units,
            electricityRate,
            hardwareCost,
            poolFee,
            maintenancePercent,
            mode,
            hostingRate
          }}
          selectedASIC={selectedASIC}
          isOpen={showPDFGenerator}
          onClose={() => setShowPDFGenerator(false)}
        />
      )}
    </div>
  );
};

// Sub-components
const NetworkStat: React.FC<{ label: string; value: string; icon: React.ReactNode; color: 'bitcoin' | 'primary' | 'trust' | 'success'; className?: string }> = ({ label, value, icon, color, className }) => {
  const colorClasses = { bitcoin: 'text-watt-bitcoin', primary: 'text-primary', trust: 'text-watt-trust', success: 'text-data-positive' };
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <span className={cn("opacity-70", colorClasses[color])}>{icon}</span>
      <span className="text-muted-foreground">{label}</span>
      <span className={cn("font-bold", colorClasses[color])}>{value}</span>
    </div>
  );
};

const HeroStat: React.FC<{ label: string; value: string; subValue: string; trend: 'up' | 'down'; className?: string }> = ({ label, value, subValue, trend, className }) => (
  <div className={cn("p-3 rounded-lg border bg-background/50 border-border/50", className)}>
    <div className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wider mb-1">{label}</div>
    <div className={cn("font-mono font-bold text-lg sm:text-xl", trend === 'up' ? "text-data-positive" : "text-destructive")}>{value}</div>
    <div className="text-[10px] text-muted-foreground font-mono">{subValue}</div>
  </div>
);

const SectionLabel: React.FC<{ icon: React.ReactNode; label: string }> = ({ icon, label }) => (
  <div className="flex items-center gap-2 text-muted-foreground">
    {icon}
    <span className="text-[10px] sm:text-xs font-bold tracking-wider">{label}</span>
  </div>
);

const ModeButton: React.FC<{ icon: React.ReactNode; label: string; active: boolean; onClick: () => void }> = ({ icon, label, active, onClick }) => (
  <button onClick={onClick} className={cn("p-3 rounded-lg border-2 transition-all text-left", active ? "bg-primary border-primary text-primary-foreground" : "bg-background border-border hover:border-muted-foreground text-foreground")}>
    <div className="mb-1">{icon}</div>
    <div className="text-xs font-bold">{label}</div>
  </button>
);

const ParameterSlider: React.FC<{ label: string; value: number; min: number; max: number; step?: number; unit: string; decimals?: number; onChange: (value: number) => void }> = ({ label, value, min, max, step = 1, unit, decimals = 0, onChange }) => (
  <div className="space-y-2">
    <div className="flex items-center justify-between">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-sm font-mono font-bold text-foreground">{value.toFixed(decimals)} <span className="text-muted-foreground text-xs">{unit}</span></span>
    </div>
    <Slider value={[value]} min={min} max={max} step={step} onValueChange={(v) => onChange(v[0])} className="w-full" />
  </div>
);

const ParameterInput: React.FC<{ label: string; value: number; min?: number; max?: number; prefix?: string; onChange: (value: number) => void }> = ({ label, value, min, max, prefix, onChange }) => (
  <div className="space-y-2">
    <span className="text-xs text-muted-foreground">{label}</span>
    <div className="relative">
      {prefix && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">{prefix}</span>}
      <Input type="number" value={value} min={min} max={max} onChange={(e) => onChange(Number(e.target.value))} className={cn("h-10 font-mono text-sm bg-background border-border", prefix && "pl-7")} />
    </div>
  </div>
);

const BreakdownRow: React.FC<{ label: string; value: string; type: 'revenue' | 'cost' | 'profit' | 'loss'; bold?: boolean }> = ({ label, value, type, bold }) => {
  const valueColor = { revenue: 'text-foreground', cost: 'text-muted-foreground', profit: 'text-data-positive', loss: 'text-destructive' };
  return (
    <div className="flex items-center justify-between">
      <span className={cn("text-xs sm:text-sm", bold ? "font-medium text-foreground" : "text-muted-foreground")}>{label}</span>
      <span className={cn("font-mono text-sm", bold && "font-bold", valueColor[type])}>{value}</span>
    </div>
  );
};

const MetricBox: React.FC<{ label: string; value: string; unit: string; highlight?: boolean }> = ({ label, value, unit, highlight }) => (
  <div className="bg-background border border-border rounded-lg p-2.5">
    <div className="text-[9px] text-muted-foreground uppercase tracking-wide mb-1">{label}</div>
    <div className="flex items-baseline gap-1">
      <span className={cn("font-mono font-bold text-sm", highlight ? "text-data-positive" : "text-foreground")}>{value}</span>
      <span className="text-[10px] text-muted-foreground">{unit}</span>
    </div>
  </div>
);

const FinancialMetricCard: React.FC<{ label: string; value: string; positive: boolean }> = ({ label, value, positive }) => (
  <div className="bg-muted/30 rounded-lg p-3 text-center">
    <div className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">{label}</div>
    <div className={cn("text-lg font-mono font-bold", positive ? "text-data-positive" : "text-destructive")}>{value}</div>
  </div>
);

export default BTCROICalculatorV2;
