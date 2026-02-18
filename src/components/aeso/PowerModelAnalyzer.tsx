import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Progress } from '@/components/ui/progress';
import { RateSourceBadge } from '@/components/ui/rate-source-badge';
import { Upload, Database, Calculator, FileSpreadsheet, AlertTriangle, BarChart3, TrendingUp, Info, Sparkles, Settings2, BookOpen, Clock, Zap, HelpCircle, ChevronDown, ChevronUp, Thermometer, PowerOff } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { usePowerModelCalculator, type FacilityParams, type TariffOverrides, type HourlyRecord, type CurtailmentStrategy } from '@/hooks/usePowerModelCalculator';
import { parsePowerModelCSV, convertTrainingDataToHourly } from '@/lib/power-model-parser';
import { PowerModelSummaryCards } from './PowerModelSummaryCards';
import { PowerModelChargeBreakdown } from './PowerModelChargeBreakdown';
import { PowerModelCostProgression } from './PowerModelCostProgression';
import { PowerModelStrategyComparison } from './PowerModelStrategyComparison';
import { PowerModelCharts } from './PowerModelCharts';
import { PowerModelRevenueAnalysis } from './PowerModelRevenueAnalysis';
import { PowerModelSensitivity } from './PowerModelSensitivity';
import { PowerModelEditableRates } from './PowerModelEditableRates';
import { PowerModelAIAnalysis } from './PowerModelAIAnalysis';
// ShutdownLog is now rendered inside ShutdownAnalytics
import { PowerModelShutdownAnalytics } from './PowerModelShutdownAnalytics';
import { PowerModelWeatherDrivers } from './PowerModelWeatherDrivers';
import { PPAvsPoolAnalyzer } from './PPAvsPoolAnalyzer';
import { PowerModelReference } from './PowerModelReference';
import { DEFAULT_FACILITY_PARAMS } from '@/constants/tariff-rates';

export function PowerModelAnalyzer() {
  const { toast } = useToast();
  const [dataSource, setDataSource] = useState<'upload' | 'database'>('database');
  const [hourlyData, setHourlyData] = useState<HourlyRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadProgress, setLoadProgress] = useState(0);
  const [selectedYear, setSelectedYear] = useState(2025);
  const [analyticsTab, setAnalyticsTab] = useState('cost-analysis');
  const [configOpen, setConfigOpen] = useState(true);
  const [autoTriggerAI, setAutoTriggerAI] = useState(false);
  const resultsRef = useRef<HTMLDivElement>(null);
  const [params, setParams] = useState<FacilityParams>({
    contractedCapacityMW: DEFAULT_FACILITY_PARAMS.contractedCapacityMW,
    substationFraction: DEFAULT_FACILITY_PARAMS.substationFraction,
    twelveCP_AvoidanceHours: DEFAULT_FACILITY_PARAMS.twelveCP_AvoidanceHours,
    hostingRateUSD: DEFAULT_FACILITY_PARAMS.hostingRateUSD,
    cadUsdRate: DEFAULT_FACILITY_PARAMS.cadUsdRate,
    targetUptimePercent: 95,
    curtailmentStrategy: '12cp-priority',
    fixedPriceCAD: 0,
  });
  const [tariffOverrides, setTariffOverrides] = useState<TariffOverrides>({});

  const { monthly, annual, breakeven, shutdownLog } = usePowerModelCalculator(hourlyData, params, tariffOverrides);

  const hostingRateCAD = params.hostingRateUSD / params.cadUsdRate;

  const hourlyPrices = useMemo(() => hourlyData.map(r => r.poolPrice), [hourlyData]);

  // Auto-collapse config and scroll to results after data loads
  useEffect(() => {
    if (hourlyData.length > 0) {
      setConfigOpen(false);
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 300);
    }
  }, [hourlyData.length]);

  const handleCSVUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      const records = parsePowerModelCSV(text);
      if (records.length === 0) {
        toast({ title: 'No valid data found', description: 'Ensure CSV has Date, HE, Pool Price, AIL columns', variant: 'destructive' });
        return;
      }
      setHourlyData(records);
      toast({ title: `Loaded ${records.length} hourly records`, description: `From uploaded CSV` });
    };
    reader.readAsText(file);
  }, [toast]);

  const loadFromDatabase = useCallback(async () => {
    setLoading(true);
    setLoadProgress(10);
    try {
      const startDate = `${selectedYear}-01-01`;
      const endDate = `${selectedYear}-12-31T23:59:59`;
      
      let allData: Array<{ timestamp: string; pool_price: number; ail_mw: number | null }> = [];
      let offset = 0;
      const batchSize = 1000;
      
      while (true) {
        const { data, error } = await supabase
          .from('aeso_training_data')
          .select('timestamp, pool_price, ail_mw')
          .gte('timestamp', startDate)
          .lte('timestamp', endDate)
          .not('ail_mw', 'is', null)
          .order('timestamp', { ascending: true })
          .range(offset, offset + batchSize - 1);
        
        if (error) throw error;
        if (!data || data.length === 0) break;
        allData = allData.concat(data);
        // Estimate progress (assume ~9000 records for a full year)
        setLoadProgress(Math.min(90, 10 + (allData.length / 9000) * 80));
        if (data.length < batchSize) break;
        offset += batchSize;
      }

      setLoadProgress(95);
      const records = convertTrainingDataToHourly(allData);
      setHourlyData(records);
      setLoadProgress(100);
      setAutoTriggerAI(true); // Auto-trigger AI analysis
      toast({ title: `Loaded ${records.length} records`, description: `From database for ${selectedYear}` });
    } catch (err: any) {
      toast({ title: 'Failed to load data', description: err.message, variant: 'destructive' });
    } finally {
      setLoading(false);
      setTimeout(() => setLoadProgress(0), 500);
    }
  }, [selectedYear, toast]);

  const updateParam = (key: keyof FacilityParams, value: string) => {
    const num = parseFloat(value);
    if (!isNaN(num)) setParams(p => ({ ...p, [key]: num }));
  };

  // Data summary for badge
  const dataSummary = useMemo(() => {
    if (hourlyData.length === 0) return null;
    const avgPool = hourlyData.reduce((s, r) => s + r.poolPrice, 0) / hourlyData.length;
    return { count: hourlyData.length, avgPool: avgPool.toFixed(0) };
  }, [hourlyData]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Calculator className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">Power Model Cost Analyzer</h2>
            <p className="text-sm text-muted-foreground">
              Full Rate DTS cost modeling with 15+ charge components
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {dataSummary && (
            <Badge variant="outline" className="text-xs">
              <FileSpreadsheet className="w-3 h-3 mr-1" />
              {dataSummary.count.toLocaleString()} hrs · Avg Pool: ${dataSummary.avgPool}/MWh
            </Badge>
          )}
          <RateSourceBadge
            source="AUC Decision 30427-D01-2025"
            effectiveDate="2026-01-01"
            sourceUrl="https://www.aeso.ca/rules-standards-and-tariff/tariff/rate-dts-demand-transmission-service/"
            lastVerified="2026-02-01"
            variant="detailed"
            className="hidden lg:flex"
          />
        </div>
      </div>

      {/* PHASE 1: Configuration (collapsible) */}
      <Collapsible open={configOpen} onOpenChange={setConfigOpen}>
        <Card>
          <CollapsibleTrigger className="w-full">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div className="flex items-center gap-2">
                <Settings2 className="w-4 h-4 text-muted-foreground" />
                <CardTitle className="text-sm">Configuration</CardTitle>
                {hourlyData.length > 0 && (
                  <Badge variant="success" className="text-[9px] px-1.5 h-4">Data Loaded</Badge>
                )}
              </div>
              {configOpen ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="pt-0 space-y-4">
              {/* Input Parameters + Data Source */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Facility Parameters */}
                <div className="space-y-3 p-4 rounded-lg border border-border/50 bg-muted/20">
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Facility Parameters</h3>
                  <p className="text-[10px] text-muted-foreground">{DEFAULT_FACILITY_PARAMS.podName}</p>
                  <div>
                    <Label className="text-xs">Contracted Capacity (MW)</Label>
                    <Input type="number" value={params.contractedCapacityMW} onChange={e => updateParam('contractedCapacityMW', e.target.value)} className="h-8 text-sm" />
                  </div>
                  <div>
                    <Label className="text-xs">Substation Fraction</Label>
                    <Input type="number" step="0.1" value={params.substationFraction} onChange={e => updateParam('substationFraction', e.target.value)} className="h-8 text-sm" />
                  </div>
                  <div>
                    <Label className="text-xs">12CP Avoidance Window (hrs/month)</Label>
                    <Input type="number" value={params.twelveCP_AvoidanceHours} onChange={e => updateParam('twelveCP_AvoidanceHours', e.target.value)} className="h-8 text-sm" />
                  </div>
                  <div>
                    <Label className="text-xs">Target Uptime (%)</Label>
                    <Input type="number" step="0.5" min="50" max="100" value={params.targetUptimePercent} onChange={e => updateParam('targetUptimePercent', e.target.value)} className="h-8 text-sm" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1">
                      <Label className="text-xs">Curtailment Strategy</Label>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <HelpCircle className="h-3 w-3 text-muted-foreground" />
                          </TooltipTrigger>
                          <TooltipContent className="max-w-xs">
                            <p><strong>12CP Priority:</strong> Always avoids peak demand hours first.</p>
                            <p className="mt-1"><strong>Cost Optimized:</strong> Compares dollar value of each curtailment decision.</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    <Select value={params.curtailmentStrategy} onValueChange={(v) => setParams(p => ({ ...p, curtailmentStrategy: v as CurtailmentStrategy }))}>
                      <SelectTrigger className="h-8 text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="12cp-priority">12CP Priority</SelectItem>
                        <SelectItem value="cost-optimized">Cost Optimized</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Revenue Parameters */}
                <div className="space-y-3 p-4 rounded-lg border border-border/50 bg-muted/20">
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Revenue Parameters</h3>
                  <div>
                    <Label className="text-xs">Hosting Rate (USD/kWh)</Label>
                    <Input type="number" step="0.001" value={params.hostingRateUSD} onChange={e => updateParam('hostingRateUSD', e.target.value)} className="h-8 text-sm" />
                  </div>
                  <div>
                    <Label className="text-xs">CAD/USD Exchange Rate</Label>
                    <Input type="number" step="0.0001" value={params.cadUsdRate} onChange={e => updateParam('cadUsdRate', e.target.value)} className="h-8 text-sm" />
                  </div>
                  <div>
                    <Label className="text-xs">Energy Pricing Mode</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <button
                        type="button"
                        onClick={() => setParams(p => ({ ...p, fixedPriceCAD: 0 }))}
                        className={`flex-1 h-8 rounded-md text-xs font-medium border transition-colors ${
                          params.fixedPriceCAD === 0
                            ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/50'
                            : 'bg-background text-muted-foreground border-border hover:bg-secondary'
                        }`}
                      >
                        Floating (Pool)
                      </button>
                      <button
                        type="button"
                        onClick={() => setParams(p => ({ ...p, fixedPriceCAD: p.fixedPriceCAD || 52 }))}
                        className={`flex-1 h-8 rounded-md text-xs font-medium border transition-colors ${
                          params.fixedPriceCAD > 0
                            ? 'bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-500/50'
                            : 'bg-background text-muted-foreground border-border hover:bg-secondary'
                        }`}
                      >
                        Fixed Contract
                      </button>
                    </div>
                    {params.fixedPriceCAD > 0 && (
                      <div className="mt-2">
                        <Label className="text-xs">Fixed Price (CAD/MWh)</Label>
                        <Input type="number" step="1" value={params.fixedPriceCAD} onChange={e => updateParam('fixedPriceCAD', e.target.value)} className="h-8 text-sm" />
                      </div>
                    )}
                    <div className="mt-1.5">
                      <Badge variant={params.fixedPriceCAD > 0 ? 'info' : 'success'} size="sm">
                        {params.fixedPriceCAD > 0 ? `Fixed @ $${params.fixedPriceCAD}/MWh` : 'Floating Pool Price'}
                      </Badge>
                    </div>
                  </div>
                  <div className="pt-2 border-t border-border/50">
                    <p className="text-xs text-muted-foreground">Breakeven Pool Price</p>
                    <p className="text-lg font-bold text-foreground">CA${breakeven.toFixed(2)}/MWh</p>
                    <p className="text-xs text-muted-foreground">Curtail when pool exceeds this</p>
                  </div>
                </div>

                {/* Data Source */}
                <div className="space-y-3 p-4 rounded-lg border border-border/50 bg-muted/20">
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Data Source</h3>
                  <Tabs value={dataSource} onValueChange={(v) => setDataSource(v as 'upload' | 'database')}>
                    <TabsList className="w-full">
                      <TabsTrigger value="database" className="flex-1 text-xs"><Database className="w-3 h-3 mr-1" />Database</TabsTrigger>
                      <TabsTrigger value="upload" className="flex-1 text-xs"><Upload className="w-3 h-3 mr-1" />CSV Upload</TabsTrigger>
                    </TabsList>
                    <TabsContent value="database" className="space-y-2 mt-2">
                      <div>
                        <Label className="text-xs">Year</Label>
                        <Input type="number" value={selectedYear} onChange={e => setSelectedYear(parseInt(e.target.value) || 2025)} className="h-8 text-sm" />
                      </div>
                      <Button onClick={loadFromDatabase} disabled={loading} size="sm" className="w-full">
                        {loading ? 'Loading...' : 'Load from Database'}
                      </Button>
                      {loading && loadProgress > 0 && (
                        <Progress value={loadProgress} className="h-1.5 mt-1" />
                      )}
                    </TabsContent>
                    <TabsContent value="upload" className="mt-2">
                      <div>
                        <Label className="text-xs">Upload CSV (Date, HE, Pool Price, AIL)</Label>
                        <Input type="file" accept=".csv" onChange={handleCSVUpload} className="h-8 text-sm mt-1" />
                      </div>
                    </TabsContent>
                  </Tabs>

                  {hourlyData.length === 0 && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2">
                      <AlertTriangle className="w-3 h-3" />
                      Load data to generate cost model
                    </div>
                  )}
                </div>
              </div>

              {/* Editable Tariff Rates */}
              <PowerModelEditableRates overrides={tariffOverrides} onChange={setTariffOverrides} />
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      {/* PHASE 2: Results */}
      {hourlyData.length > 0 && (
        <div ref={resultsRef} className="space-y-6">
          {/* KPI Dashboard + AI Analysis Button */}
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Results Dashboard</h3>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="text-xs h-7" onClick={() => setConfigOpen(true)}>
                <Settings2 className="w-3 h-3 mr-1" />Edit Config
              </Button>
            </div>
          </div>

          <PowerModelSummaryCards annual={annual} breakeven={breakeven} hostingRateCAD={hostingRateCAD} totalShutdownHours={shutdownLog.length} totalShutdownSavings={shutdownLog.reduce((s, r) => s + r.costAvoided, 0)} curtailmentSavings={annual?.curtailmentSavings} fixedPriceCAD={params.fixedPriceCAD} cadUsdRate={params.cadUsdRate} />

          {/* AI Analysis - Promoted out of tabs */}
          <PowerModelAIAnalysis params={params} tariffOverrides={tariffOverrides} annual={annual} monthly={monthly} breakeven={breakeven} autoTrigger={autoTriggerAI} />

          {/* Strategy Comparison + Cost Progression */}
          <PowerModelStrategyComparison annual={annual} cadUsdRate={params.cadUsdRate} />
          <PowerModelCostProgression annual={annual} cadUsdRate={params.cadUsdRate} fixedPriceCAD={params.fixedPriceCAD} />
          
          {/* Charge Breakdown Table */}
          <PowerModelChargeBreakdown monthly={monthly} annual={annual} targetUptime={params.targetUptimePercent} fixedPriceCAD={params.fixedPriceCAD} cadUsdRate={params.cadUsdRate} capacityMW={params.contractedCapacityMW} />

          {/* Consolidated Analytics Tabs (5 instead of 9) */}
          <Tabs value={analyticsTab} onValueChange={setAnalyticsTab}>
            <TabsList className="overflow-x-auto flex h-auto gap-1 w-full justify-start">
              <TabsTrigger value="cost-analysis" className="text-xs"><BarChart3 className="w-3 h-3 mr-1" />Cost Analysis</TabsTrigger>
              <TabsTrigger value="revenue-sensitivity" className="text-xs"><TrendingUp className="w-3 h-3 mr-1" />Revenue & Sensitivity</TabsTrigger>
              <TabsTrigger value="curtailment" className="text-xs"><PowerOff className="w-3 h-3 mr-1" />Curtailment</TabsTrigger>
              <TabsTrigger value="ppa-vs-pool" className="text-xs"><TrendingUp className="w-3 h-3 mr-1" />PPA vs Pool</TabsTrigger>
              <TabsTrigger value="weather-drivers" className="text-xs"><Thermometer className="w-3 h-3 mr-1" />Weather & Drivers</TabsTrigger>
              <TabsTrigger value="reference" className="text-xs"><BookOpen className="w-3 h-3 mr-1" />Reference</TabsTrigger>
            </TabsList>

            <TabsContent value="cost-analysis" className="mt-4">
              <PowerModelCharts monthly={monthly} breakeven={breakeven} hourlyPrices={hourlyPrices} hourlyData={hourlyData} hostingRateCAD={hostingRateCAD} />
            </TabsContent>

            <TabsContent value="revenue-sensitivity" className="mt-4 space-y-4">
              <PowerModelRevenueAnalysis monthly={monthly} params={params} />
              <PowerModelSensitivity baseCost={annual?.totalAmountDue ?? 0} params={params} monthly={monthly} />
            </TabsContent>

            <TabsContent value="curtailment" className="mt-4 space-y-4">
              <PowerModelShutdownAnalytics shutdownLog={shutdownLog} breakeven={breakeven} hourlyData={hourlyData} params={params} fixedPriceCAD={params.fixedPriceCAD} />
            </TabsContent>

            <TabsContent value="ppa-vs-pool" className="mt-4">
              <PPAvsPoolAnalyzer hourlyData={hourlyData} capacityMW={params.contractedCapacityMW} />
            </TabsContent>

            <TabsContent value="weather-drivers" className="mt-4">
              <PowerModelWeatherDrivers selectedYear={selectedYear} />
            </TabsContent>

            <TabsContent value="reference" className="mt-4">
              <PowerModelReference recordCount={hourlyData.length} dataSource={dataSource} />
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  );
}
