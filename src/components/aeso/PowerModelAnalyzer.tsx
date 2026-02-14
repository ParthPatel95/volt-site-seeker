import React, { useState, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { RateSourceBadge } from '@/components/ui/rate-source-badge';
import { Upload, Database, Calculator, FileSpreadsheet, AlertTriangle, BarChart3, TrendingUp, Info, Sparkles, Settings2, BookOpen, Clock, Zap, HelpCircle } from 'lucide-react';
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
import { PowerModelDataSources } from './PowerModelDataSources';
import { PowerModelEditableRates } from './PowerModelEditableRates';
import { PowerModelAIAnalysis } from './PowerModelAIAnalysis';
import { PowerModelAssumptions } from './PowerModelAssumptions';
import { PowerModelShutdownLog } from './PowerModelShutdownLog';
import { PowerModelShutdownAnalytics } from './PowerModelShutdownAnalytics';
import { PowerModelRateExplainer } from './PowerModelRateExplainer';
import { DEFAULT_FACILITY_PARAMS } from '@/constants/tariff-rates';

export function PowerModelAnalyzer() {
  const { toast } = useToast();
  const [dataSource, setDataSource] = useState<'upload' | 'database'>('database');
  const [hourlyData, setHourlyData] = useState<HourlyRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedYear, setSelectedYear] = useState(2025);
  const [analyticsTab, setAnalyticsTab] = useState('charts');
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
        if (data.length < batchSize) break;
        offset += batchSize;
      }

      const records = convertTrainingDataToHourly(allData);
      setHourlyData(records);
      toast({ title: `Loaded ${records.length} records`, description: `From database for ${selectedYear}` });
    } catch (err: any) {
      toast({ title: 'Failed to load data', description: err.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, [selectedYear, toast]);

  const updateParam = (key: keyof FacilityParams, value: string) => {
    const num = parseFloat(value);
    if (!isNaN(num)) setParams(p => ({ ...p, [key]: num }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
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
        <RateSourceBadge
          source="AUC Decision 30427-D01-2025"
          effectiveDate="2026-01-01"
          sourceUrl="https://www.aeso.ca/rules-standards-and-tariff/tariff/rate-dts-demand-transmission-service/"
          lastVerified="2026-02-01"
          variant="detailed"
          className="ml-auto hidden lg:flex"
        />
      </div>

      {/* Input Parameters + Data Source */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Facility Parameters */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Facility Parameters</CardTitle>
            <CardDescription className="text-xs">{DEFAULT_FACILITY_PARAMS.podName}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
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
                      <p><strong>12CP Priority:</strong> Always avoids peak demand hours first. Safer for demand charge savings but may run through expensive energy hours.</p>
                      <p className="mt-1"><strong>Cost Optimized:</strong> Compares the dollar value of each curtailment decision. A $500/MWh price spike may beat a low-risk 12CP hour, maximizing total savings.</p>
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
          </CardContent>
        </Card>

        {/* Revenue Parameters */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Revenue Parameters</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
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
          </CardContent>
        </Card>

        {/* Data Source */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Data Source</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
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
              </TabsContent>
              <TabsContent value="upload" className="mt-2">
                <div>
                  <Label className="text-xs">Upload CSV (Date, HE, Pool Price, AIL)</Label>
                  <Input type="file" accept=".csv" onChange={handleCSVUpload} className="h-8 text-sm mt-1" />
                </div>
              </TabsContent>
            </Tabs>

            {hourlyData.length > 0 && (
              <div className="pt-2 border-t border-border/50">
                <Badge variant="outline" className="text-xs">
                  <FileSpreadsheet className="w-3 h-3 mr-1" />
                  {hourlyData.length.toLocaleString()} hourly records loaded
                </Badge>
              </div>
            )}
            {hourlyData.length === 0 && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2">
                <AlertTriangle className="w-3 h-3" />
                Load data to generate cost model
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Editable Tariff Rates */}
      <PowerModelEditableRates overrides={tariffOverrides} onChange={setTariffOverrides} />

      {/* Results */}
      {hourlyData.length > 0 && (
        <>
           <PowerModelSummaryCards annual={annual} breakeven={breakeven} hostingRateCAD={hostingRateCAD} totalShutdownHours={shutdownLog.length} totalShutdownSavings={shutdownLog.reduce((s, r) => s + r.costAvoided, 0)} curtailmentSavings={annual?.curtailmentSavings} fixedPriceCAD={params.fixedPriceCAD} cadUsdRate={params.cadUsdRate} />
          <PowerModelStrategyComparison annual={annual} cadUsdRate={params.cadUsdRate} />
          <PowerModelCostProgression annual={annual} cadUsdRate={params.cadUsdRate} fixedPriceCAD={params.fixedPriceCAD} />
          <PowerModelChargeBreakdown monthly={monthly} annual={annual} targetUptime={params.targetUptimePercent} fixedPriceCAD={params.fixedPriceCAD} cadUsdRate={params.cadUsdRate} />

          {/* Analytics Tabs */}
          <Tabs value={analyticsTab} onValueChange={setAnalyticsTab}>
            <TabsList className="flex-wrap h-auto gap-1">
              <TabsTrigger value="charts" className="text-xs"><BarChart3 className="w-3 h-3 mr-1" />Charts</TabsTrigger>
              <TabsTrigger value="revenue" className="text-xs"><TrendingUp className="w-3 h-3 mr-1" />Revenue</TabsTrigger>
              <TabsTrigger value="sensitivity" className="text-xs"><Settings2 className="w-3 h-3 mr-1" />Sensitivity</TabsTrigger>
              <TabsTrigger value="ai-analysis" className="text-xs"><Sparkles className="w-3 h-3 mr-1" />AI Analysis</TabsTrigger>
              <TabsTrigger value="shutdown-log" className="text-xs"><Clock className="w-3 h-3 mr-1" />Shutdown Log</TabsTrigger>
              <TabsTrigger value="shutdown-analytics" className="text-xs"><Zap className="w-3 h-3 mr-1" />Shutdown Analytics</TabsTrigger>
              <TabsTrigger value="assumptions" className="text-xs"><BookOpen className="w-3 h-3 mr-1" />Assumptions</TabsTrigger>
              <TabsTrigger value="rate-guide" className="text-xs"><FileSpreadsheet className="w-3 h-3 mr-1" />Rate Guide</TabsTrigger>
              <TabsTrigger value="sources" className="text-xs"><Info className="w-3 h-3 mr-1" />Data Sources</TabsTrigger>
            </TabsList>

            <TabsContent value="charts" className="mt-4">
              <PowerModelCharts monthly={monthly} breakeven={breakeven} hourlyPrices={hourlyPrices} />
            </TabsContent>

            <TabsContent value="revenue" className="mt-4">
              <PowerModelRevenueAnalysis monthly={monthly} params={params} />
            </TabsContent>

            <TabsContent value="sensitivity" className="mt-4">
              <PowerModelSensitivity baseCost={annual?.totalAmountDue ?? 0} params={params} monthly={monthly} />
            </TabsContent>

            <TabsContent value="ai-analysis" className="mt-4">
              <PowerModelAIAnalysis params={params} tariffOverrides={tariffOverrides} annual={annual} monthly={monthly} breakeven={breakeven} />
            </TabsContent>

            <TabsContent value="shutdown-log" className="mt-4">
              <PowerModelShutdownLog shutdownLog={shutdownLog} fixedPriceCAD={params.fixedPriceCAD} />
            </TabsContent>

            <TabsContent value="shutdown-analytics" className="mt-4">
              <PowerModelShutdownAnalytics shutdownLog={shutdownLog} breakeven={breakeven} />
            </TabsContent>

            <TabsContent value="assumptions" className="mt-4">
              <PowerModelAssumptions />
            </TabsContent>

            <TabsContent value="rate-guide" className="mt-4">
              <PowerModelRateExplainer />
            </TabsContent>

            <TabsContent value="sources" className="mt-4">
              <PowerModelDataSources recordCount={hourlyData.length} dataSource={dataSource} />
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
}
