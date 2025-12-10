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
  Lightbulb
} from 'lucide-react';
import { use12CPSavingsAnalytics, SavingsSimulatorResult } from '@/hooks/use12CPSavingsAnalytics';

export function TwelveCPSavingsSimulator() {
  const {
    savingsData,
    loading,
    fetch12CPSavingsData,
    calculateSavings,
    transmissionAdder
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
        <span className="ml-3 text-muted-foreground">Loading savings analysis...</span>
      </div>
    );
  }

  if (!savingsData && !loading) {
    return (
      <Card className="border-yellow-200">
        <CardContent className="py-8 text-center">
          <AlertTriangle className="w-8 h-8 text-yellow-600 mx-auto mb-3" />
          <p className="text-muted-foreground">No pricing data available for savings analysis.</p>
          <Button onClick={fetch12CPSavingsData} variant="outline" className="mt-4">
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

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
                  By avoiding just {savingsResult.withStrategy.hoursAvoided} hours during system peaks
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
            <CardTitle className="flex items-center gap-2">
              <Calculator className="w-5 h-5 text-primary" />
              12CP Savings Simulator
            </CardTitle>
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
                      <p className="text-xs text-muted-foreground">Transmission Cost</p>
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
                      <p className="text-xs text-muted-foreground">Transmission Cost</p>
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

          {/* Transmission Adder Info */}
          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 text-sm">
            <Lightbulb className="w-5 h-5 text-yellow-600 shrink-0" />
            <p className="text-muted-foreground">
              <strong>Transmission Adder:</strong> ${transmissionAdder}/MWh CAD is added to all energy costs. 
              12CP avoidance can significantly reduce this charge by lowering your contribution to system peak.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Monthly Price Comparison Chart */}
      {savingsData && savingsData.monthlyComparisons.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingDown className="w-5 h-5 text-blue-600" />
              12-Month Price Comparison
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Average price vs peak hour price — the gap is your savings opportunity
            </p>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={savingsData.monthlyComparisons}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis dataKey="monthLabel" fontSize={11} />
                  <YAxis 
                    fontSize={12} 
                    tickFormatter={(v) => `$${v}`}
                    label={{ value: '$/MWh', angle: -90, position: 'insideLeft', fontSize: 11 }}
                  />
                  <Tooltip 
                    formatter={(value: number, name: string) => [
                      `$${value.toFixed(2)}/MWh`,
                      name === 'avgPrice' ? 'Average Price' : name === 'peakHourPrice' ? 'Peak Hour Price' : 'Savings Opportunity'
                    ]}
                  />
                  <Legend />
                  <Bar 
                    dataKey="avgPrice" 
                    name="Average Price" 
                    fill="hsl(var(--primary))" 
                    radius={[4, 4, 0, 0]}
                    opacity={0.8}
                  />
                  <Bar 
                    dataKey="peakHourPrice" 
                    name="Peak Hour Price" 
                    fill="hsl(0, 84%, 60%)" 
                    radius={[4, 4, 0, 0]}
                    opacity={0.8}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="savingsOpportunity" 
                    name="Savings Gap"
                    stroke="hsl(142, 76%, 36%)" 
                    strokeWidth={2}
                    dot={{ fill: 'hsl(142, 76%, 36%)', r: 4 }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-4 border-t">
              <div className="text-center p-3 rounded-lg bg-muted/50">
                <p className="text-xs text-muted-foreground">Annual Avg Price</p>
                <p className="text-xl font-bold">${savingsData.annualAvgPrice}/MWh</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-muted/50">
                <p className="text-xs text-muted-foreground">Annual Peak Price</p>
                <p className="text-xl font-bold text-red-600">${savingsData.annualPeakPrice}/MWh</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-muted/50">
                <p className="text-xs text-muted-foreground">Price Spread</p>
                <p className="text-xl font-bold text-green-600">
                  ${(savingsData.annualPeakPrice - savingsData.annualAvgPrice).toFixed(2)}/MWh
                </p>
              </div>
              <div className="text-center p-3 rounded-lg bg-muted/50">
                <p className="text-xs text-muted-foreground">Months Analyzed</p>
                <p className="text-xl font-bold">{savingsData.monthlyComparisons.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
