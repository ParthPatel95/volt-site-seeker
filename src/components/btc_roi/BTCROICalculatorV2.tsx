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
  Cpu,
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
import { cn } from '@/lib/utils';

// Popular ASIC presets with current specs (2024)
const ASIC_PRESETS = [
  { name: 'S21 Hyd', hashrate: 335, power: 5360, price: 5800, efficiency: 16.0 },
  { name: 'S21 Pro', hashrate: 234, power: 3531, price: 4200, efficiency: 15.1 },
  { name: 'S21', hashrate: 200, power: 3500, price: 3500, efficiency: 17.5 },
  { name: 'M66S', hashrate: 298, power: 5347, price: 5500, efficiency: 17.9 },
  { name: 'M60S', hashrate: 186, power: 3422, price: 3200, efficiency: 18.4 },
  { name: 'S19 XP', hashrate: 140, power: 3010, price: 2200, efficiency: 21.5 },
  { name: 'S19 Pro', hashrate: 110, power: 3250, price: 1500, efficiency: 29.5 },
];

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
  const [selectedPreset, setSelectedPreset] = useState<string | null>('S21');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Refresh network data
  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    // Trigger a re-fetch by reloading the page data
    window.location.reload();
  }, []);

  // Save calculation
  const handleSave = useCallback(async () => {
    if (!networkData) {
      toast.error('No network data available');
      return;
    }
    
    setIsSaving(true);
    try {
      // Update form data with current values before saving
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

    const totalHashrate = hashrate * units * 1e12; // TH/s to H/s
    const networkHashrate = networkData.hashrate;
    const blockReward = networkData.blockReward;
    const blocksPerDay = 144;
    
    // Daily BTC mined
    const dailyBTC = (totalHashrate / networkHashrate) * blocksPerDay * blockReward;
    const dailyRevenue = dailyBTC * networkData.price;
    
    // Power costs
    const totalPowerKW = (powerDraw * units) / 1000;
    const dailyPowerKWh = totalPowerKW * 24;
    const effectiveRate = mode === 'hosting' ? hostingRate : electricityRate;
    const dailyPowerCost = dailyPowerKWh * effectiveRate;
    
    // Pool fees
    const dailyPoolFees = dailyRevenue * (poolFee / 100);
    
    // Net profit
    const dailyNetProfit = dailyRevenue - dailyPowerCost - dailyPoolFees;
    const monthlyNetProfit = dailyNetProfit * 30;
    const yearlyNetProfit = dailyNetProfit * 365;
    
    // Investment
    const totalInvestment = hardwareCost * units;
    const breakEvenDays = dailyNetProfit > 0 ? totalInvestment / dailyNetProfit : Infinity;
    const roi12Month = totalInvestment > 0 ? (yearlyNetProfit / totalInvestment) * 100 : 0;

    // Efficiency
    const efficiency = powerDraw / hashrate; // W/TH

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

  const loadPreset = useCallback((preset: typeof ASIC_PRESETS[0]) => {
    setHashrate(preset.hashrate);
    setPowerDraw(preset.power);
    setHardwareCost(preset.price);
    setSelectedPreset(preset.name);
  }, []);

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
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 text-orange-500 animate-spin mx-auto" />
          <p className="text-slate-400">Loading network data...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (!networkData && !networkLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
        <Card className="bg-slate-800/50 border-slate-700/50 max-w-md w-full">
          <CardContent className="p-6 text-center space-y-4">
            <AlertCircle className="w-12 h-12 text-red-400 mx-auto" />
            <h2 className="text-xl font-semibold text-white">Failed to Load Data</h2>
            <p className="text-slate-400 text-sm">Unable to fetch network data. Please try again.</p>
            <Button onClick={handleRefresh} className="bg-orange-500 hover:bg-orange-600">
              <RefreshCw className="w-4 h-4 mr-2" />
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-3 sm:p-4 lg:p-6">
      <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-orange-500 to-amber-600 rounded-xl shadow-lg shadow-orange-500/20">
              <Bitcoin className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-white">BTC Mining ROI Lab</h1>
              <p className="text-sm text-slate-400">Real-time profitability calculator</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="bg-transparent border-slate-600 text-slate-300 hover:bg-slate-700"
            >
              <RefreshCw className={cn("w-4 h-4 mr-2", isRefreshing && "animate-spin")} />
              Refresh
            </Button>
            {networkData && (
              <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                <span className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse" />
                Live Data
              </Badge>
            )}
          </div>
        </div>

        {/* Live Stats Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3">
          <StatsCard
            icon={<Bitcoin className="w-4 h-4" />}
            label="BTC Price"
            value={networkData ? `$${networkData.price.toLocaleString()}` : '...'}
            color="orange"
          />
          <StatsCard
            icon={<Hash className="w-4 h-4" />}
            label="Difficulty"
            value={networkData ? `${(networkData.difficulty / 1e12).toFixed(1)}T` : '...'}
            color="blue"
          />
          <StatsCard
            icon={<Zap className="w-4 h-4" />}
            label="Network"
            value={networkData ? `${(networkData.hashrate / 1e18).toFixed(0)} EH/s` : '...'}
            color="yellow"
          />
          <StatsCard
            icon={<Award className="w-4 h-4" />}
            label="Block Reward"
            value={networkData ? `${networkData.blockReward} BTC` : '...'}
            color="green"
          />
          <StatsCard
            icon={<Clock className="w-4 h-4" />}
            label="Block Time"
            value={networkData ? `${networkData.avgBlockTime}m` : '...'}
            color="purple"
          />
          <StatsCard
            icon={<TrendingUp className="w-4 h-4" />}
            label="Next Halving"
            value={networkData ? `${networkData.nextHalvingDays}d` : '...'}
            color="red"
          />
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
          {/* Left Panel - Configuration */}
          <div className="lg:col-span-4 space-y-4">
            {/* Mode Selector */}
            <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur">
              <CardContent className="p-4">
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant={mode === 'self' ? 'default' : 'outline'}
                    className={cn(
                      "h-auto py-3 flex flex-col items-center gap-1",
                      mode === 'self' 
                        ? "bg-orange-500 hover:bg-orange-600 text-white border-0" 
                        : "bg-transparent border-slate-600 text-slate-300 hover:bg-slate-700"
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
                        ? "bg-blue-500 hover:bg-blue-600 text-white border-0" 
                        : "bg-transparent border-slate-600 text-slate-300 hover:bg-slate-700"
                    )}
                    onClick={() => setMode('hosting')}
                  >
                    <Building2 className="w-5 h-5" />
                    <span className="text-sm font-medium">Hosting</span>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Quick ASIC Presets */}
            <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-slate-300 flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-orange-400" />
                  Quick Select ASIC
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 gap-2">
                  {ASIC_PRESETS.slice(0, 6).map((preset) => (
                    <Button
                      key={preset.name}
                      variant="outline"
                      size="sm"
                      className={cn(
                        "h-auto py-2 flex flex-col items-start text-left transition-all min-h-[44px]",
                        selectedPreset === preset.name
                          ? "bg-orange-500/20 border-orange-500/50 text-orange-400"
                          : "bg-slate-700/50 border-slate-600 text-slate-300 hover:bg-slate-700"
                      )}
                      onClick={() => loadPreset(preset)}
                    >
                      <span className="font-semibold text-xs">{preset.name}</span>
                      <span className="text-[10px] text-slate-400">{preset.hashrate} TH/s</span>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Configuration Form */}
            <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-slate-300 flex items-center gap-2">
                  <Settings className="w-4 h-4 text-blue-400" />
                  Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs text-slate-400">Hashrate (TH/s)</Label>
                    <Input
                      type="number"
                      value={hashrate}
                      onChange={(e) => {
                        setHashrate(Number(e.target.value));
                        setSelectedPreset(null);
                      }}
                      className="bg-slate-700/50 border-slate-600 text-white h-9"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-slate-400">Power (W)</Label>
                    <Input
                      type="number"
                      value={powerDraw}
                      onChange={(e) => {
                        setPowerDraw(Number(e.target.value));
                        setSelectedPreset(null);
                      }}
                      className="bg-slate-700/50 border-slate-600 text-white h-9"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs text-slate-400">Units</Label>
                    <Input
                      type="number"
                      value={units}
                      onChange={(e) => setUnits(Math.max(1, Number(e.target.value)))}
                      min={1}
                      className="bg-slate-700/50 border-slate-600 text-white h-9"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-slate-400">
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
                      className="bg-slate-700/50 border-slate-600 text-white h-9"
                    />
                  </div>
                </div>

                <Collapsible open={showAdvanced} onOpenChange={setShowAdvanced}>
                  <CollapsibleTrigger asChild>
                    <Button variant="ghost" className="w-full text-slate-400 hover:text-slate-200 h-8">
                      {showAdvanced ? <ChevronUp className="w-4 h-4 mr-2" /> : <ChevronDown className="w-4 h-4 mr-2" />}
                      Advanced Options
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="space-y-3 pt-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label className="text-xs text-slate-400">Hardware Cost ($)</Label>
                        <Input
                          type="number"
                          value={hardwareCost}
                          onChange={(e) => setHardwareCost(Number(e.target.value))}
                          className="bg-slate-700/50 border-slate-600 text-white h-9"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs text-slate-400">Pool Fee (%)</Label>
                        <Input
                          type="number"
                          step="0.1"
                          value={poolFee}
                          onChange={(e) => setPoolFee(Number(e.target.value))}
                          className="bg-slate-700/50 border-slate-600 text-white h-9"
                        />
                      </div>
                    </div>
                  </CollapsibleContent>
                </Collapsible>

                {/* Save Button */}
                <Button
                  onClick={handleSave}
                  disabled={isSaving || !results}
                  className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white"
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
            <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-slate-300 flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-green-400" />
                  Detailed Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="breakdown" className="space-y-4">
                  <TabsList className="bg-slate-700/50 p-1 w-full sm:w-auto">
                    <TabsTrigger value="breakdown" className="text-xs data-[state=active]:bg-slate-600 flex-1 sm:flex-none">Breakdown</TabsTrigger>
                    <TabsTrigger value="projections" className="text-xs data-[state=active]:bg-slate-600 flex-1 sm:flex-none">Projections</TabsTrigger>
                    <TabsTrigger value="scenarios" className="text-xs data-[state=active]:bg-slate-600 flex-1 sm:flex-none">Scenarios</TabsTrigger>
                  </TabsList>

                  <TabsContent value="breakdown" className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Revenue */}
                      <div className="bg-slate-700/30 rounded-lg p-4 space-y-3">
                        <h4 className="text-sm font-medium text-green-400 flex items-center gap-2">
                          <TrendingUp className="w-4 h-4" />
                          Revenue
                        </h4>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-slate-400">Daily BTC Mined</span>
                            <span className="text-white font-mono">{results ? formatBTC(results.dailyBTC) : '—'}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-slate-400">Daily Revenue</span>
                            <span className="text-green-400 font-mono">{results ? formatCurrency(results.dailyRevenue) : '—'}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-slate-400">Monthly Revenue</span>
                            <span className="text-green-400 font-mono">{results ? formatCurrency(results.dailyRevenue * 30) : '—'}</span>
                          </div>
                        </div>
                      </div>

                      {/* Costs */}
                      <div className="bg-slate-700/30 rounded-lg p-4 space-y-3">
                        <h4 className="text-sm font-medium text-red-400 flex items-center gap-2">
                          <Zap className="w-4 h-4" />
                          Costs
                        </h4>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-slate-400">Daily Power</span>
                            <span className="text-red-400 font-mono">-{results ? formatCurrency(results.dailyPowerCost) : '—'}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-slate-400">Daily Pool Fee</span>
                            <span className="text-red-400 font-mono">-{results ? formatCurrency(results.dailyPoolFees) : '—'}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-slate-400">Total Daily Cost</span>
                            <span className="text-red-400 font-mono">-{results ? formatCurrency(results.dailyPowerCost + results.dailyPoolFees) : '—'}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Summary Stats */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div className="bg-slate-700/30 rounded-lg p-3 text-center">
                        <div className="text-xs text-slate-400 mb-1">Total Power</div>
                        <div className="text-lg font-semibold text-white">{results ? `${results.totalPowerKW.toFixed(1)} kW` : '—'}</div>
                      </div>
                      <div className="bg-slate-700/30 rounded-lg p-3 text-center">
                        <div className="text-xs text-slate-400 mb-1">Daily kWh</div>
                        <div className="text-lg font-semibold text-white">{results ? `${results.dailyPowerKWh.toFixed(0)}` : '—'}</div>
                      </div>
                      <div className="bg-slate-700/30 rounded-lg p-3 text-center">
                        <div className="text-xs text-slate-400 mb-1">Efficiency</div>
                        <div className="text-lg font-semibold text-white">{results ? `${results.efficiency.toFixed(1)} W/TH` : '—'}</div>
                      </div>
                      <div className="bg-slate-700/30 rounded-lg p-3 text-center">
                        <div className="text-xs text-slate-400 mb-1">Investment</div>
                        <div className="text-lg font-semibold text-white">{results ? formatCurrency(results.totalInvestment) : '—'}</div>
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
                          <div key={months} className="bg-slate-700/30 rounded-lg p-4 flex items-center justify-between">
                            <div>
                              <div className="text-sm font-medium text-white">{months} Month{months > 1 ? 's' : ''}</div>
                              <div className="text-xs text-slate-400">Net Profit: {formatCurrency(profit)}</div>
                            </div>
                            <div className="text-right">
                              <div className={cn(
                                "text-lg font-bold",
                                isPositive ? "text-green-400" : "text-red-400"
                              )}>
                                {formatCurrency(totalReturn)}
                              </div>
                              <div className="text-xs text-slate-400">
                                {results ? `${((totalReturn / results.totalInvestment) * 100).toFixed(0)}% ROI` : '—'}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </TabsContent>

                  <TabsContent value="scenarios" className="space-y-4">
                    <div className="text-sm text-slate-400 mb-3">What if BTC price changes?</div>
                    <div className="space-y-2">
                      {networkData && results && [0.5, 0.75, 1, 1.25, 1.5, 2].map((multiplier) => {
                        const scenarioPrice = networkData.price * multiplier;
                        const scenarioDailyRevenue = results.dailyBTC * scenarioPrice;
                        // Fix: Recalculate pool fees based on scenario revenue
                        const scenarioPoolFees = scenarioDailyRevenue * (poolFee / 100);
                        const scenarioDailyProfit = scenarioDailyRevenue - results.dailyPowerCost - scenarioPoolFees;
                        
                        return (
                          <div key={multiplier} className="bg-slate-700/30 rounded-lg p-3 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <Badge variant="outline" className={cn(
                                "text-xs",
                                multiplier < 1 ? "border-red-500/50 text-red-400" : 
                                multiplier > 1 ? "border-green-500/50 text-green-400" : 
                                "border-slate-500 text-slate-300"
                              )}>
                                {multiplier < 1 ? `${((1-multiplier)*100).toFixed(0)}% Down` : 
                                 multiplier > 1 ? `${((multiplier-1)*100).toFixed(0)}% Up` : 'Current'}
                              </Badge>
                              <span className="text-white font-medium">${scenarioPrice.toLocaleString()}</span>
                            </div>
                            <div className={cn(
                              "font-mono font-medium",
                              scenarioDailyProfit > 0 ? "text-green-400" : "text-red-400"
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
        <div className="text-center text-xs text-slate-500 pt-4">
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
  color: 'orange' | 'blue' | 'yellow' | 'green' | 'purple' | 'red';
}

const StatsCard: React.FC<StatsCardProps> = ({ icon, label, value, color }) => {
  const colorClasses = {
    orange: 'text-orange-400 bg-orange-500/10',
    blue: 'text-blue-400 bg-blue-500/10',
    yellow: 'text-yellow-400 bg-yellow-500/10',
    green: 'text-green-400 bg-green-500/10',
    purple: 'text-purple-400 bg-purple-500/10',
    red: 'text-red-400 bg-red-500/10',
  };

  return (
    <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-3 backdrop-blur">
      <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center mb-2", colorClasses[color])}>
        {icon}
      </div>
      <div className="text-lg sm:text-xl font-bold text-white truncate">{value}</div>
      <div className="text-xs text-slate-400">{label}</div>
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
      ? "bg-gradient-to-br from-orange-500/20 to-amber-500/20 border border-orange-500/30" 
      : "bg-slate-800/50 border border-slate-700/50"
  )}>
    <div className="text-xs text-slate-400 mb-1">{label}</div>
    <div className={cn(
      "text-xl sm:text-2xl font-bold",
      positive ? "text-green-400" : "text-red-400"
    )}>
      {value}
    </div>
    <div className="text-xs text-slate-500 mt-1">{subValue}</div>
  </div>
);

export default BTCROICalculatorV2;
