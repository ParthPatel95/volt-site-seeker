import React, { useState, useMemo, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { 
  Bitcoin, 
  Calculator, 
  TrendingUp, 
  Zap, 
  DollarSign,
  ChevronDown,
  ChevronUp,
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
  AlertCircle
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
    formData, 
    setFormData,
    saveCurrentCalculation,
    roiResults 
  } = useBTCROICalculator();
  
  // Local state for immediate UI updates
  const [mode, setMode] = useState<MiningMode>('self');
  const [hashrate, setHashrate] = useState(200);
  const [powerDraw, setPowerDraw] = useState(3500);
  const [units, setUnits] = useState(1);
  const [electricityRate, setElectricityRate] = useState(0.06);
  const [hardwareCost, setHardwareCost] = useState(3500);
  const [poolFee, setPoolFee] = useState(1.5);
  const [hostingRate, setHostingRate] = useState(0.08);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [selectedASIC, setSelectedASIC] = useState<ASICMiner | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Refresh network data
  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    window.location.reload();
  }, []);

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
      setFormData(prev => ({
        ...prev,
        hashrate,
        powerDraw,
        units,
        powerRate: electricityRate,
        hostingRate,
        hardwareCost,
        poolFee
      }));
      
      await saveCurrentCalculation(mode, `ROI Calculation ${new Date().toLocaleDateString()}`);
      toast.success('Calculation saved successfully!');
    } catch (error) {
      toast.error('Failed to save calculation');
    } finally {
      setIsSaving(false);
    }
  }, [networkData, hashrate, powerDraw, units, electricityRate, hostingRate, hardwareCost, poolFee, mode, setFormData, saveCurrentCalculation]);

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
      <div className="min-h-screen bg-watt-light flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 text-watt-bitcoin animate-spin mx-auto" />
          <p className="text-watt-navy/60">Loading network data...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (!networkData && !networkLoading) {
    return (
      <div className="min-h-screen bg-watt-light flex items-center justify-center p-4">
        <Card className="bg-white border-gray-200 shadow-institutional max-w-md w-full">
          <CardContent className="p-6 text-center space-y-4">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
            <h2 className="text-xl font-semibold text-watt-navy">Failed to Load Data</h2>
            <p className="text-watt-navy/60 text-sm">Unable to fetch network data. Please try again.</p>
            <Button onClick={handleRefresh} className="bg-watt-bitcoin hover:bg-watt-bitcoin/90 text-white">
              <RefreshCw className="w-4 h-4 mr-2" />
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-2 sm:p-4 lg:p-6">
      <div className="max-w-7xl mx-auto space-y-3 sm:space-y-4 lg:space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="p-2 sm:p-2.5 bg-primary rounded-lg sm:rounded-xl flex-shrink-0">
              <Bitcoin className="w-5 h-5 sm:w-6 sm:h-6 text-primary-foreground" />
            </div>
            <div className="min-w-0">
              <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-foreground truncate">Profitability Calculator</h1>
              <p className="text-xs sm:text-sm text-muted-foreground">Real-time Bitcoin mining analysis</p>
            </div>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="flex-1 sm:flex-none"
            >
              <RefreshCw className={cn("w-4 h-4 mr-2", isRefreshing && "animate-spin")} />
              <span className="sm:inline">Refresh</span>
            </Button>
            {networkData && (
              <Badge variant="outline" className="text-xs flex-shrink-0">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1.5 animate-pulse" />
                Live
              </Badge>
            )}
          </div>
        </div>

        {/* Live Stats Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          <StatsCard
            icon={<Bitcoin className="w-4 h-4" />}
            label="BTC Price"
            value={networkData ? `$${networkData.price.toLocaleString()}` : '...'}
            color="bitcoin"
          />
          <StatsCard
            icon={<Hash className="w-4 h-4" />}
            label="Difficulty"
            value={networkData ? `${(networkData.difficulty / 1e12).toFixed(1)}T` : '...'}
            color="trust"
          />
          <StatsCard
            icon={<Zap className="w-4 h-4" />}
            label="Network"
            value={networkData ? `${(networkData.hashrate / 1e18).toFixed(0)} EH/s` : '...'}
            color="warning"
          />
          <StatsCard
            icon={<Award className="w-4 h-4" />}
            label="Block Reward"
            value={networkData ? `${networkData.blockReward} BTC` : '...'}
            color="success"
          />
          <StatsCard
            icon={<Clock className="w-4 h-4" />}
            label="Block Time"
            value={networkData ? `${networkData.avgBlockTime}m` : '...'}
            color="navy"
          />
          <StatsCard
            icon={<TrendingUp className="w-4 h-4" />}
            label="Next Halving"
            value={networkData ? `${networkData.nextHalvingDays}d` : '...'}
            color="bitcoin"
          />
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
          {/* Left Panel - Configuration */}
          <div className="lg:col-span-4 space-y-4">
            {/* Mode Selector */}
            <Card className="bg-white border-gray-200 shadow-institutional">
              <CardContent className="p-4">
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant={mode === 'self' ? 'default' : 'outline'}
                    className={cn(
                      "h-auto py-3 flex flex-col items-center gap-1",
                      mode === 'self' 
                        ? "bg-watt-bitcoin hover:bg-watt-bitcoin/90 text-white border-0" 
                        : "bg-white border-gray-200 text-watt-navy hover:bg-gray-50"
                    )}
                    onClick={() => setMode('self')}
                  >
                    <Server className="w-5 h-5" />
                    <span className="text-sm font-medium">Self-Mining</span>
                  </Button>
                  <Button
                    variant={mode === 'hosting' ? 'default' : 'outline'}
                    className={cn(
                      "h-auto py-3 flex flex-col items-center gap-1",
                      mode === 'hosting' 
                        ? "bg-watt-trust hover:bg-watt-trust/90 text-white border-0" 
                        : "bg-white border-gray-200 text-watt-navy hover:bg-gray-50"
                    )}
                    onClick={() => setMode('hosting')}
                  >
                    <Building2 className="w-5 h-5" />
                    <span className="text-sm font-medium">Hosting</span>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* ASIC Selector */}
            <Card className="bg-white border-gray-200 shadow-institutional">
              <CardContent className="p-4">
                <ASICSelector
                  selectedASIC={selectedASIC}
                  onSelectASIC={handleSelectASIC}
                />
              </CardContent>
            </Card>

            {/* Configuration Form */}
            <Card className="bg-white border-gray-200 shadow-institutional">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-watt-navy flex items-center gap-2">
                  <Settings className="w-4 h-4 text-watt-trust" />
                  Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs text-watt-navy/60">Hashrate (TH/s)</Label>
                    <Input
                      type="number"
                      value={hashrate}
                      onChange={(e) => {
                        setHashrate(Number(e.target.value));
                        setSelectedASIC(null);
                      }}
                      className="bg-white border-gray-200 text-watt-navy h-9"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-watt-navy/60">Power (W)</Label>
                    <Input
                      type="number"
                      value={powerDraw}
                      onChange={(e) => {
                        setPowerDraw(Number(e.target.value));
                        setSelectedASIC(null);
                      }}
                      className="bg-white border-gray-200 text-watt-navy h-9"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs text-watt-navy/60">Units</Label>
                    <Input
                      type="number"
                      value={units}
                      onChange={(e) => setUnits(Math.max(1, Number(e.target.value)))}
                      min={1}
                      className="bg-white border-gray-200 text-watt-navy h-9"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-watt-navy/60">
                      {mode === 'hosting' ? 'Hosting Rate ($/kWh)' : 'Electric Rate ($/kWh)'}
                    </Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={mode === 'hosting' ? hostingRate : electricityRate}
                      onChange={(e) => mode === 'hosting' 
                        ? setHostingRate(Number(e.target.value))
                        : setElectricityRate(Number(e.target.value))
                      }
                      className="bg-white border-gray-200 text-watt-navy h-9"
                    />
                  </div>
                </div>

                <Collapsible open={showAdvanced} onOpenChange={setShowAdvanced}>
                  <CollapsibleTrigger asChild>
                    <Button variant="ghost" className="w-full text-watt-navy/60 hover:text-watt-navy hover:bg-gray-50 h-8">
                      {showAdvanced ? <ChevronUp className="w-4 h-4 mr-2" /> : <ChevronDown className="w-4 h-4 mr-2" />}
                      Advanced Options
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="space-y-3 pt-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label className="text-xs text-watt-navy/60">Hardware Cost ($)</Label>
                        <Input
                          type="number"
                          value={hardwareCost}
                          onChange={(e) => setHardwareCost(Number(e.target.value))}
                          className="bg-white border-gray-200 text-watt-navy h-9"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs text-watt-navy/60">Pool Fee (%)</Label>
                        <Input
                          type="number"
                          step="0.1"
                          value={poolFee}
                          onChange={(e) => setPoolFee(Number(e.target.value))}
                          className="bg-white border-gray-200 text-watt-navy h-9"
                        />
                      </div>
                    </div>
                  </CollapsibleContent>
                </Collapsible>

                {/* Save Button */}
                <Button
                  onClick={handleSave}
                  disabled={isSaving || !results}
                  className="w-full bg-watt-bitcoin hover:bg-watt-bitcoin/90 text-white"
                >
                  {isSaving ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4 mr-2" />
                  )}
                  Save Calculation
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Right Panel - Results */}
          <div className="lg:col-span-8 space-y-4">
            {/* Key Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <ResultCard
                label="Daily Profit"
                value={results ? formatCurrency(results.dailyNetProfit) : '$0'}
                subValue={results ? formatBTC(results.dailyBTC) : '0 sats'}
                positive={results ? results.dailyNetProfit > 0 : true}
                highlight
              />
              <ResultCard
                label="Monthly Profit"
                value={results ? formatCurrency(results.monthlyNetProfit) : '$0'}
                subValue="30 days"
                positive={results ? results.monthlyNetProfit > 0 : true}
              />
              <ResultCard
                label="12-Month ROI"
                value={results ? `${results.roi12Month.toFixed(1)}%` : '0%'}
                subValue={results ? formatCurrency(results.yearlyNetProfit) : '$0'}
                positive={results ? results.roi12Month > 0 : true}
              />
              <ResultCard
                label="Break-Even"
                value={results ? (results.breakEvenDays === Infinity ? 'Never' : `${Math.ceil(results.breakEvenDays)}d`) : '—'}
                subValue={results ? (results.breakEvenDays === Infinity ? 'N/A' : `${(results.breakEvenDays / 30).toFixed(1)} months`) : ''}
                positive={results ? results.breakEvenDays < 365 && results.breakEvenDays !== Infinity : true}
              />
            </div>

            {/* Detailed Results */}
            <Card className="bg-white border-gray-200 shadow-institutional">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-watt-navy flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-watt-success" />
                  Detailed Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="breakdown" className="space-y-4">
                  <TabsList className="bg-gray-100 p-1 w-full sm:w-auto">
                    <TabsTrigger value="breakdown" className="text-xs data-[state=active]:bg-white data-[state=active]:text-watt-navy flex-1 sm:flex-none">Breakdown</TabsTrigger>
                    <TabsTrigger value="projections" className="text-xs data-[state=active]:bg-white data-[state=active]:text-watt-navy flex-1 sm:flex-none">Projections</TabsTrigger>
                    <TabsTrigger value="scenarios" className="text-xs data-[state=active]:bg-white data-[state=active]:text-watt-navy flex-1 sm:flex-none">Scenarios</TabsTrigger>
                  </TabsList>

                  <TabsContent value="breakdown" className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Revenue */}
                      <div className="bg-watt-success/5 border border-watt-success/20 rounded-lg p-4 space-y-3">
                        <h4 className="text-sm font-medium text-watt-success flex items-center gap-2">
                          <TrendingUp className="w-4 h-4" />
                          Revenue
                        </h4>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-watt-navy/60">Daily BTC Mined</span>
                            <span className="text-watt-navy font-mono">{results ? formatBTC(results.dailyBTC) : '—'}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-watt-navy/60">Daily Revenue</span>
                            <span className="text-watt-success font-mono">{results ? formatCurrency(results.dailyRevenue) : '—'}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-watt-navy/60">Monthly Revenue</span>
                            <span className="text-watt-success font-mono">{results ? formatCurrency(results.dailyRevenue * 30) : '—'}</span>
                          </div>
                        </div>
                      </div>

                      {/* Costs */}
                      <div className="bg-red-50 border border-red-200 rounded-lg p-4 space-y-3">
                        <h4 className="text-sm font-medium text-red-600 flex items-center gap-2">
                          <Zap className="w-4 h-4" />
                          Costs
                        </h4>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-watt-navy/60">Daily Power</span>
                            <span className="text-red-600 font-mono">-{results ? formatCurrency(results.dailyPowerCost) : '—'}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-watt-navy/60">Daily Pool Fee</span>
                            <span className="text-red-600 font-mono">-{results ? formatCurrency(results.dailyPoolFees) : '—'}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-watt-navy/60">Total Daily Cost</span>
                            <span className="text-red-600 font-mono">-{results ? formatCurrency(results.dailyPowerCost + results.dailyPoolFees) : '—'}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Summary Stats */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-center">
                        <div className="text-xs text-watt-navy/60 mb-1">Total Power</div>
                        <div className="text-lg font-semibold text-watt-navy">{results ? `${results.totalPowerKW.toFixed(1)} kW` : '—'}</div>
                      </div>
                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-center">
                        <div className="text-xs text-watt-navy/60 mb-1">Daily kWh</div>
                        <div className="text-lg font-semibold text-watt-navy">{results ? `${results.dailyPowerKWh.toFixed(0)}` : '—'}</div>
                      </div>
                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-center">
                        <div className="text-xs text-watt-navy/60 mb-1">Efficiency</div>
                        <div className="text-lg font-semibold text-watt-navy">{results ? `${results.efficiency.toFixed(1)} W/TH` : '—'}</div>
                      </div>
                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-center">
                        <div className="text-xs text-watt-navy/60 mb-1">Investment</div>
                        <div className="text-lg font-semibold text-watt-navy">{results ? formatCurrency(results.totalInvestment) : '—'}</div>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="projections" className="space-y-4">
                    <div className="space-y-3">
                      {[1, 3, 6, 12, 24].map((months) => {
                        const profit = results ? results.monthlyNetProfit * months : 0;
                        const totalReturn = results ? profit - results.totalInvestment : 0;
                        const isPositive = totalReturn > 0;
                        
                        return (
                          <div key={months} className="bg-gray-50 border border-gray-200 rounded-lg p-4 flex items-center justify-between">
                            <div>
                              <div className="text-sm font-medium text-watt-navy">{months} Month{months > 1 ? 's' : ''}</div>
                              <div className="text-xs text-watt-navy/60">Net Profit: {formatCurrency(profit)}</div>
                            </div>
                            <div className="text-right">
                              <div className={cn(
                                "text-lg font-bold",
                                isPositive ? "text-watt-success" : "text-red-500"
                              )}>
                                {formatCurrency(totalReturn)}
                              </div>
                              <div className="text-xs text-watt-navy/60">
                                {results ? `${((totalReturn / results.totalInvestment) * 100).toFixed(0)}% ROI` : '—'}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </TabsContent>

                  <TabsContent value="scenarios" className="space-y-4">
                    <div className="text-sm text-watt-navy/60 mb-3">What if BTC price changes?</div>
                    <div className="space-y-2">
                      {networkData && results && [0.5, 0.75, 1, 1.25, 1.5, 2].map((multiplier) => {
                        const scenarioPrice = networkData.price * multiplier;
                        const scenarioDailyRevenue = results.dailyBTC * scenarioPrice;
                        const scenarioPoolFees = scenarioDailyRevenue * (poolFee / 100);
                        const scenarioDailyProfit = scenarioDailyRevenue - results.dailyPowerCost - scenarioPoolFees;
                        
                        return (
                          <div key={multiplier} className="bg-gray-50 border border-gray-200 rounded-lg p-3 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <Badge variant="outline" className={cn(
                                "text-xs",
                                multiplier < 1 ? "border-red-300 text-red-600 bg-red-50" : 
                                multiplier > 1 ? "border-watt-success/30 text-watt-success bg-watt-success/5" : 
                                "border-gray-300 text-watt-navy"
                              )}>
                                {multiplier < 1 ? `${((1-multiplier)*100).toFixed(0)}% Down` : 
                                 multiplier > 1 ? `${((multiplier-1)*100).toFixed(0)}% Up` : 'Current'}
                              </Badge>
                              <span className="text-watt-navy font-medium">${scenarioPrice.toLocaleString()}</span>
                            </div>
                            <div className={cn(
                              "font-mono font-medium",
                              scenarioDailyProfit > 0 ? "text-watt-success" : "text-red-500"
                            )}>
                              {formatCurrency(scenarioDailyProfit)}/day
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Footer Disclaimer */}
        <div className="text-center text-xs text-watt-navy/50 pt-4">
          <p>Calculations are estimates based on current network conditions. Actual results may vary due to difficulty adjustments and market volatility.</p>
        </div>
      </div>
    </div>
  );
};

// Sub-components
interface StatsCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  color: 'bitcoin' | 'trust' | 'warning' | 'success' | 'navy';
}

const StatsCard: React.FC<StatsCardProps> = ({ icon, label, value, color }) => {
  const colorClasses = {
    bitcoin: 'text-watt-bitcoin bg-watt-bitcoin/10',
    trust: 'text-watt-trust bg-watt-trust/10',
    warning: 'text-watt-warning bg-watt-warning/10',
    success: 'text-watt-success bg-watt-success/10',
    navy: 'text-watt-navy bg-watt-navy/10',
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-institutional">
      <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center mb-2", colorClasses[color])}>
        {icon}
      </div>
      <div className="text-lg sm:text-xl font-bold text-watt-navy truncate">{value}</div>
      <div className="text-xs text-watt-navy/60">{label}</div>
    </div>
  );
};

interface ResultCardProps {
  label: string;
  value: string;
  subValue: string;
  positive: boolean;
  highlight?: boolean;
}

const ResultCard: React.FC<ResultCardProps> = ({ label, value, subValue, positive, highlight }) => (
  <div className={cn(
    "rounded-lg p-4 transition-all",
    highlight 
      ? "bg-watt-bitcoin/5 border border-watt-bitcoin/20" 
      : "bg-white border border-gray-200 shadow-institutional"
  )}>
    <div className="text-xs text-watt-navy/60 mb-1">{label}</div>
    <div className={cn(
      "text-xl sm:text-2xl font-bold",
      positive ? "text-watt-success" : "text-red-500"
    )}>
      {value}
    </div>
    <div className="text-xs text-watt-navy/50 mt-1">{subValue}</div>
  </div>
);

export default BTCROICalculatorV2;
