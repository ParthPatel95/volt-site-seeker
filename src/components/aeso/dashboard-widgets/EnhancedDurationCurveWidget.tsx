import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, BarChart3 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { generateDurationCurve, DurationCurvePoint } from '@/utils/aggregations';
import { HourlyDataPoint } from '@/services/historicalDataService';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Legend } from 'recharts';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface EnhancedDurationCurveWidgetProps {
  config: {
    title: string;
    dataFilters?: {
      timeRange?: string;
    };
  };
}

export function EnhancedDurationCurveWidget({ config }: EnhancedDurationCurveWidgetProps) {
  const [currentCurve, setCurrentCurve] = useState<DurationCurvePoint[]>([]);
  const [comparisonCurve, setComparisonCurve] = useState<DurationCurvePoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [comparisonPeriod, setComparisonPeriod] = useState<string>('last_month');

  useEffect(() => {
    fetchData();
  }, [config.dataFilters?.timeRange, comparisonPeriod]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch current period data
      const currentDays = getTimeRangeDays(config.dataFilters?.timeRange || '30days');
      const currentStart = new Date();
      currentStart.setDate(currentStart.getDate() - currentDays);

      const { data: currentData, error: currentError } = await supabase
        .from('aeso_training_data')
        .select('timestamp, pool_price')
        .gte('timestamp', currentStart.toISOString())
        .order('timestamp', { ascending: true });

      if (currentError) throw currentError;

      const currentHourlyData: HourlyDataPoint[] = (currentData || []).map(d => ({
        ts: d.timestamp,
        price: d.pool_price,
        generation: 0,
        ail: 0,
      }));

      const currentCurveData = generateDurationCurve(currentHourlyData);
      setCurrentCurve(currentCurveData);

      // Fetch comparison period data
      const comparisonDays = getComparisonDays(comparisonPeriod, currentDays);
      const comparisonEnd = new Date(currentStart);
      const comparisonStart = new Date(comparisonEnd);
      comparisonStart.setDate(comparisonStart.getDate() - comparisonDays);

      const { data: comparisonData, error: comparisonError } = await supabase
        .from('aeso_training_data')
        .select('timestamp, pool_price')
        .gte('timestamp', comparisonStart.toISOString())
        .lt('timestamp', comparisonEnd.toISOString())
        .order('timestamp', { ascending: true });

      if (!comparisonError && comparisonData) {
        const comparisonHourlyData: HourlyDataPoint[] = comparisonData.map(d => ({
          ts: d.timestamp,
          price: d.pool_price,
          generation: 0,
          ail: 0,
        }));

        const comparisonCurveData = generateDurationCurve(comparisonHourlyData);
        setComparisonCurve(comparisonCurveData);
      }
    } catch (error) {
      console.error('Error fetching duration curve data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTimeRangeDays = (range: string): number => {
    switch (range) {
      case '24hours': return 1;
      case '7days': return 7;
      case '30days': return 30;
      case '90days': return 90;
      default: return 30;
    }
  };

  const getComparisonDays = (comparison: string, currentDays: number): number => {
    switch (comparison) {
      case 'last_week': return 7;
      case 'last_month': return 30;
      case 'last_year': return 365;
      case 'same_period': return currentDays;
      default: return 30;
    }
  };

  const mergeChartData = () => {
    const maxLength = Math.max(currentCurve.length, comparisonCurve.length);
    const sampleRate = Math.ceil(maxLength / 200); // Downsample to 200 points max

    const merged = [];
    for (let i = 0; i < maxLength; i += sampleRate) {
      const current = currentCurve[i];
      const comparison = comparisonCurve[i];

      merged.push({
        percentile: current?.percentile || comparison?.percentile || 0,
        currentPrice: current?.price,
        comparisonPrice: comparison?.price,
        hours: current?.hours || comparison?.hours || 0,
      });
    }

    return merged;
  };

  const calculatePercentiles = (curve: DurationCurvePoint[]) => {
    if (curve.length === 0) return { p50: 0, p90: 0, p95: 0, p99: 0 };

    const p50 = curve[Math.floor(curve.length * 0.5)]?.price || 0;
    const p90 = curve[Math.floor(curve.length * 0.1)]?.price || 0;
    const p95 = curve[Math.floor(curve.length * 0.05)]?.price || 0;
    const p99 = curve[Math.floor(curve.length * 0.01)]?.price || 0;

    return { p50, p90, p95, p99 };
  };

  if (loading) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle>{config.title}</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  const chartData = mergeChartData();
  const currentPercentiles = calculatePercentiles(currentCurve);
  const comparisonPercentiles = calculatePercentiles(comparisonCurve);

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            {config.title}
          </div>
          <Select value={comparisonPeriod} onValueChange={setComparisonPeriod}>
            <SelectTrigger className="w-40 h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="last_week">vs Last Week</SelectItem>
              <SelectItem value="last_month">vs Last Month</SelectItem>
              <SelectItem value="last_year">vs Last Year</SelectItem>
              <SelectItem value="same_period">vs Same Period</SelectItem>
            </SelectContent>
          </Select>
        </CardTitle>
        <CardDescription>
          Price distribution sorted by frequency - how often prices occur
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Percentile Stats */}
        <div className="grid grid-cols-4 gap-2">
          <div className="text-center p-2 bg-muted rounded-lg">
            <div className="text-xs text-muted-foreground mb-1">P50 (Median)</div>
            <div className="text-lg font-bold">${currentPercentiles.p50.toFixed(2)}</div>
            {comparisonCurve.length > 0 && (
              <div className="text-xs text-muted-foreground">
                was ${comparisonPercentiles.p50.toFixed(2)}
              </div>
            )}
          </div>
          <div className="text-center p-2 bg-blue-100 rounded-lg">
            <div className="text-xs text-blue-700 mb-1">P90</div>
            <div className="text-lg font-bold text-blue-800">${currentPercentiles.p90.toFixed(2)}</div>
            {comparisonCurve.length > 0 && (
              <div className="text-xs text-blue-600">
                was ${comparisonPercentiles.p90.toFixed(2)}
              </div>
            )}
          </div>
          <div className="text-center p-2 bg-orange-100 rounded-lg">
            <div className="text-xs text-orange-700 mb-1">P95</div>
            <div className="text-lg font-bold text-orange-800">${currentPercentiles.p95.toFixed(2)}</div>
            {comparisonCurve.length > 0 && (
              <div className="text-xs text-orange-600">
                was ${comparisonPercentiles.p95.toFixed(2)}
              </div>
            )}
          </div>
          <div className="text-center p-2 bg-red-100 rounded-lg">
            <div className="text-xs text-red-700 mb-1">P99</div>
            <div className="text-lg font-bold text-red-800">${currentPercentiles.p99.toFixed(2)}</div>
            {comparisonCurve.length > 0 && (
              <div className="text-xs text-red-600">
                was ${comparisonPercentiles.p99.toFixed(2)}
              </div>
            )}
          </div>
        </div>

        {/* Duration Curve Chart */}
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis 
                dataKey="percentile" 
                tick={{ fontSize: 10 }}
                label={{ value: 'Percentile (%)', position: 'insideBottom', offset: -5, fontSize: 12 }}
              />
              <YAxis 
                tick={{ fontSize: 10 }}
                label={{ value: 'Price ($/MWh)', angle: -90, position: 'insideLeft', fontSize: 12 }}
              />
              <Tooltip 
                formatter={(value: any) => `$${Number(value).toFixed(2)}`}
                labelFormatter={(label) => `Percentile: ${label}%`}
              />
              <Legend />
              <ReferenceLine y={currentPercentiles.p50} stroke="gray" strokeDasharray="3 3" />
              <Line 
                type="monotone" 
                dataKey="currentPrice" 
                stroke="hsl(var(--primary))" 
                strokeWidth={2}
                dot={false}
                name="Current Period"
              />
              {comparisonCurve.length > 0 && (
                <Line 
                  type="monotone" 
                  dataKey="comparisonPrice" 
                  stroke="hsl(var(--muted-foreground))" 
                  strokeWidth={1.5}
                  strokeDasharray="5 5"
                  dot={false}
                  name="Comparison Period"
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Interpretation */}
        <div className="text-xs text-muted-foreground pt-2 border-t">
          <p>
            <strong>Reading the curve:</strong> The curve shows prices sorted from highest to lowest.
            P90 means 90% of hours had prices at or below this level. Useful for understanding
            extreme price exposure and operating hours thresholds.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
