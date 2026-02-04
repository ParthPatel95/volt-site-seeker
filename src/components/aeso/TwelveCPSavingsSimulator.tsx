import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
  ComposedChart,
  Line
} from 'recharts';
import { 
  DollarSign, 
  TrendingDown, 
  Target,
  Zap,
  Calculator,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  RefreshCw,
  Lightbulb,
  Database,
  Calendar
} from 'lucide-react';
import { use12CPSavingsAnalytics, SavingsSimulatorResult } from '@/hooks/use12CPSavingsAnalytics';
import { format } from 'date-fns';
import { FortisAlbertaRate65Badge, AESOTransmissionBadge } from '@/components/ui/rate-source-badge';

export function TwelveCPSavingsSimulator() {
  const {
    savingsData,
    loading,
    fetch12CPSavingsData,
    calculateSavings,
    transmissionAdder,
    transmissionRatePerKW
  } = use12CPSavingsAnalytics();

  const [facilityMW, setFacilityMW] = useState('50');
  const [operatingHours, setOperatingHours] = useState('8000');
  const [strategy, setStrategy] = useState<'full' | 'partial' | 'none'>('full');
  const [savingsResult, setSavingsResult] = useState<SavingsSimulatorResult | null>(null);

  useEffect(() => {
    fetch12CPSavingsData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (savingsData) {
      const result = calculateSavings(
        parseFloat(facilityMW) || 0,
        parseFloat(operatingHours) || 0,
        strategy
      );
      setSavingsResult(result);
    }
  }, [savingsData, facilityMW, operatingHours, strategy, calculateSavings]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-CA', { 
      style: 'currency', 
      currency: 'CAD',
      maximumFractionDigits: 0
    }).format(value);
  };

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('en-CA').format(value);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <span className="ml-3 text-muted-foreground">Loading 12CP demand analysis...</span>
      </div>
    );
  }

  if (!savingsData && !loading) {
    return (
      <Card className="border-yellow-200">
        <CardContent className="py-8 text-center">
          <AlertTriangle className="w-8 h-8 text-yellow-600 mx-auto mb-3" />
          <p className="text-muted-foreground">No demand data available for 12CP analysis.</p>
          <Button onClick={fetch12CPSavingsData} variant="outline" className="mt-4">
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Calculate average price at peaks for display
  const avgPriceAtPeaks = savingsData 
    ? savingsData.monthlyPeaks.reduce((s, m) => s + m.priceAtPeak, 0) / savingsData.monthlyPeaks.length
    : 0;

  return (
    <div className="space-y-6">
      {/* Hero Savings Banner */}
      {savingsResult && savingsResult.savings.amount > 0 && (
        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 border-green-200 dark:border-green-800 overflow-hidden">
          <CardContent className="py-8">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
              <div className="text-center lg:text-left">
                <Badge className="mb-3 bg-green-600">
                  <DollarSign className="w-3 h-3 mr-1" />
                  12CP Savings Opportunity
                </Badge>
                <h2 className="text-2xl md:text-3xl font-bold text-green-800 dark:text-green-200">
                  Save Up To{' '}
                  <span className="text-green-600">
                    {formatCurrency(savingsResult.savings.amount)}
                  </span>
                  /Year
                </h2>
                <p className="text-green-700/80 dark:text-green-300/80 mt-1">
                  By avoiding just {savingsResult.withStrategy.hoursAvoided} hours during system <strong>demand</strong> peaks
                </p>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="text-center p-4 rounded-lg bg-white/60 dark:bg-white/10 border border-green-200/50">
                  <p className="text-xs text-muted-foreground mb-1">Transmission Savings</p>
                  <p className="text-xl font-bold text-green-700 dark:text-green-400">
                    {formatCurrency(savingsResult.savings.transmissionSavings)}
                  </p>
                </div>
                <div className="text-center p-4 rounded-lg bg-white/60 dark:bg-white/10 border border-green-200/50">
                  <p className="text-xs text-muted-foreground mb-1">Energy Savings</p>
                  <p className="text-xl font-bold text-green-700 dark:text-green-400">
                    {formatCurrency(savingsResult.savings.energySavings)}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Interactive Calculator */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CardTitle className="flex items-center gap-2">
                <Calculator className="w-5 h-5 text-primary" />
                12CP Savings Simulator
              </CardTitle>
              <Badge variant="outline" className="ml-2 bg-primary/10 text-primary border-primary/30">
                <Database className="w-3 h-3 mr-1" />
                Real AESO Data
              </Badge>
            </div>
            <Button
              onClick={fetch12CPSavingsData}
              variant="outline"
              size="sm"
              disabled={loading}
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Input Controls */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="facilityMW">Facility Size (MW)</Label>
              <Input
                id="facilityMW"
                type="number"
                value={facilityMW}
                onChange={(e) => setFacilityMW(e.target.value)}
                placeholder="50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="operatingHours">Annual Operating Hours</Label>
              <Input
                id="operatingHours"
                type="number"
                value={operatingHours}
                onChange={(e) => setOperatingHours(e.target.value)}
                placeholder="8000"
              />
            </div>
            <div className="space-y-2">
              <Label>12CP Avoidance Strategy</Label>
              <Select value={strategy} onValueChange={(v) => setStrategy(v as any)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="full">Full Avoidance (12 hours)</SelectItem>
                  <SelectItem value="partial">Partial Reduction (6 hours)</SelectItem>
                  <SelectItem value="none">No Strategy (baseline)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Comparison Cards */}
          {savingsResult && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Without Strategy */}
              <Card className="border-red-200 bg-red-50/50 dark:bg-red-950/20">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 mb-4">
                    <AlertTriangle className="w-5 h-5 text-red-600" />
                    <span className="font-semibold text-red-800 dark:text-red-200">Without Strategy</span>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-muted-foreground">Energy Cost</p>
                      <p className="text-lg font-bold">{formatCurrency(savingsResult.withoutStrategy.energyCost)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Transmission Cost (12CP)</p>
                      <p className="text-lg font-bold">{formatCurrency(savingsResult.withoutStrategy.transmissionCost)}</p>
                    </div>
                    <div className="pt-2 border-t border-red-200/50">
                      <p className="text-xs text-muted-foreground">Total Annual Cost</p>
                      <p className="text-2xl font-bold text-red-600">{formatCurrency(savingsResult.withoutStrategy.totalCost)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Arrow */}
              <div className="hidden lg:flex items-center justify-center">
                <div className="flex flex-col items-center gap-2">
                  <ArrowRight className="w-8 h-8 text-green-600" />
                  <Badge variant="outline" className="text-green-600 border-green-600">
                    {savingsResult.savings.percentage}% Savings
                  </Badge>
                </div>
              </div>

              {/* With Strategy */}
              <Card className="border-green-200 bg-green-50/50 dark:bg-green-950/20">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 mb-4">
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                    <span className="font-semibold text-green-800 dark:text-green-200">With 12CP Strategy</span>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-muted-foreground">Energy Cost</p>
                      <p className="text-lg font-bold">{formatCurrency(savingsResult.withStrategy.energyCost)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Transmission Cost (12CP)</p>
                      <p className="text-lg font-bold">{formatCurrency(savingsResult.withStrategy.transmissionCost)}</p>
                    </div>
                    <div className="pt-2 border-t border-green-200/50">
                      <p className="text-xs text-muted-foreground">Total Annual Cost</p>
                      <p className="text-2xl font-bold text-green-600">{formatCurrency(savingsResult.withStrategy.totalCost)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Transmission Rate Info */}
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 text-sm">
              <Lightbulb className="w-5 h-5 text-yellow-600 shrink-0" />
              <p className="text-muted-foreground">
                <strong>12CP Transmission:</strong> Rate 65 charges ${transmissionRatePerKW}/kW/month based on your load during 12 monthly system demand peaks (not price peaks). 
                Avoiding these peaks eliminates your 12CP contribution.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <FortisAlbertaRate65Badge variant="compact" />
              <AESOTransmissionBadge variant="compact" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Monthly Peak Demand Chart */}
      {savingsData && savingsData.monthlyPeaks.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <TrendingDown className="w-5 h-5 text-blue-600" />
                  12-Month Peak Demand Analysis
                </CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Monthly peak demand (MW) — 12CP is based on <strong>demand</strong>, not price
                </p>
              </div>
              <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30">
                <Database className="w-3 h-3 mr-1" />
                {formatNumber(savingsData.recordCount)} records
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={savingsData.monthlyPeaks}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis dataKey="monthLabel" fontSize={11} />
                  <YAxis 
                    yAxisId="demand"
                    fontSize={12} 
                    tickFormatter={(v) => `${(v/1000).toFixed(1)}k`}
                    label={{ value: 'MW', angle: -90, position: 'insideLeft', fontSize: 11 }}
                  />
                  <YAxis 
                    yAxisId="price"
                    orientation="right"
                    fontSize={12} 
                    tickFormatter={(v) => `$${v}`}
                    label={{ value: '$/MWh', angle: 90, position: 'insideRight', fontSize: 11 }}
                  />
                  <Tooltip 
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-popover border rounded-lg shadow-lg p-3">
                            <p className="font-semibold">{data.monthLabel}</p>
                            <div className="mt-2 space-y-1 text-sm">
                              <p>Peak Demand: <strong>{formatNumber(data.peakDemandMW)} MW</strong></p>
                              <p>Avg Demand: <strong>{formatNumber(data.avgDemandMW)} MW</strong></p>
                              <p>Price at Peak: <strong>${data.priceAtPeak}/MWh</strong></p>
                              <p>Peak Hour: <strong>HE{data.peakHour + 1}</strong></p>
                              <p className="text-xs text-muted-foreground pt-1">{data.dayOfWeek}</p>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Legend />
                  <Bar 
                    yAxisId="demand"
                    dataKey="avgDemandMW" 
                    name="Avg Demand (MW)" 
                    fill="hsl(var(--primary))" 
                    radius={[4, 4, 0, 0]}
                    opacity={0.6}
                  />
                  <Bar 
                    yAxisId="demand"
                    dataKey="peakDemandMW" 
                    name="Peak Demand (MW)" 
                    fill="hsl(0, 84%, 60%)" 
                    radius={[4, 4, 0, 0]}
                    opacity={0.8}
                  />
                  <Line 
                    yAxisId="price"
                    type="monotone" 
                    dataKey="priceAtPeak" 
                    name="Price at Peak ($/MWh)"
                    stroke="hsl(142, 76%, 36%)" 
                    strokeWidth={2}
                    dot={{ fill: 'hsl(142, 76%, 36%)', r: 4 }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-6 pt-4 border-t">
              <div className="text-center p-3 rounded-lg bg-muted/50">
                <p className="text-xs text-muted-foreground">Annual Avg Demand</p>
                <p className="text-xl font-bold">{formatNumber(savingsData.annualAvgDemandMW)} MW</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-muted/50">
                <p className="text-xs text-muted-foreground">Annual Peak Demand</p>
                <p className="text-xl font-bold text-red-600">{formatNumber(savingsData.annualPeakDemandMW)} MW</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-muted/50">
                <p className="text-xs text-muted-foreground">Avg Price at Peaks</p>
                <p className="text-xl font-bold">${avgPriceAtPeaks.toFixed(2)}/MWh</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-muted/50">
                <p className="text-xs text-muted-foreground">Demand Spread</p>
                <p className="text-xl font-bold text-green-600">
                  {formatNumber(savingsData.annualPeakDemandMW - savingsData.annualAvgDemandMW)} MW
                </p>
              </div>
              <div className="text-center p-3 rounded-lg bg-muted/50">
                <p className="text-xs text-muted-foreground">Months Analyzed</p>
                <p className="text-xl font-bold">{savingsData.monthlyPeaks.length}</p>
              </div>
            </div>

            {/* Data Source Footer */}
            {savingsData.dataDateRange && (
              <div className="flex items-center justify-between text-xs text-muted-foreground mt-4 pt-2 border-t">
                <div className="flex items-center gap-2">
                  <Database className="w-3 h-3" />
                  <span>AESO Historical Data ({format(new Date(savingsData.dataDateRange.start), 'MMM yyyy')} - {format(new Date(savingsData.dataDateRange.end), 'MMM yyyy')})</span>
                </div>
                <span>12CP peaks based on grid demand (AIL), not price</span>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
