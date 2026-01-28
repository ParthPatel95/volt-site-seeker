import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  ReferenceArea,
  Cell,
  Legend,
} from 'recharts';
import { Thermometer, TrendingDown, Database, Loader2, Snowflake, AlertTriangle } from 'lucide-react';
import { useWeatherDemandCorrelation } from '@/hooks/useWeatherDemandCorrelation';
import { cn } from '@/lib/utils';

interface WeatherDemandCorrelationChartProps {
  className?: string;
}

// Static year color map to avoid dynamic Tailwind classes
const YEAR_COLORS: Record<number, string> = {
  2022: 'hsl(210, 70%, 50%)',
  2023: 'hsl(280, 70%, 50%)',
  2024: 'hsl(160, 70%, 40%)',
  2025: 'hsl(35, 90%, 50%)',
  2026: 'hsl(0, 75%, 55%)',
};

const getYearColor = (year: number): string => {
  return YEAR_COLORS[year] || 'hsl(var(--primary))';
};

export function WeatherDemandCorrelationChart({ className }: WeatherDemandCorrelationChartProps) {
  const { data, loading, error, correlation, correlationStrength, trendline, stats } = useWeatherDemandCorrelation();

  // Generate trendline points for the chart
  const trendlineData = useMemo(() => {
    if (!stats.tempRange.min || !stats.tempRange.max) return [];
    const minTemp = stats.tempRange.min;
    const maxTemp = stats.tempRange.max;
    return [
      { x: minTemp, y: trendline.intercept + trendline.slope * minTemp },
      { x: maxTemp, y: trendline.intercept + trendline.slope * maxTemp },
    ];
  }, [trendline, stats.tempRange]);

  // Group data by year for coloring
  const yearGroups = useMemo(() => {
    const groups: Record<number, typeof data> = {};
    data.forEach((point) => {
      if (!groups[point.year]) groups[point.year] = [];
      groups[point.year].push(point);
    });
    return groups;
  }, [data]);

  const getCorrelationBadgeStyle = () => {
    if (correlationStrength === 'strong') {
      return 'bg-red-100 text-red-700 border-red-300 dark:bg-red-950 dark:text-red-400 dark:border-red-800';
    }
    if (correlationStrength === 'moderate') {
      return 'bg-yellow-100 text-yellow-700 border-yellow-300 dark:bg-yellow-950 dark:text-yellow-400 dark:border-yellow-800';
    }
    return 'bg-muted text-muted-foreground';
  };

  const formatNumber = (value: number) => new Intl.NumberFormat('en-CA').format(value);

  if (loading) {
    return (
      <Card className={cn('', className)}>
        <CardContent className="py-12 flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-primary mr-2" />
          <span className="text-muted-foreground">Loading correlation data...</span>
        </CardContent>
      </Card>
    );
  }

  if (error || data.length === 0) {
    return (
      <Card className={cn('', className)}>
        <CardContent className="py-8 text-center">
          <AlertTriangle className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-muted-foreground">{error || 'No correlation data available'}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn('', className)}>
      <CardHeader className="pb-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-950/50">
              <Thermometer className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <CardTitle className="text-base sm:text-lg">Temperature vs Peak Demand Correlation</CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                Edmonton temperature impact on grid load during high-demand periods
              </CardDescription>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className={getCorrelationBadgeStyle()}>
              <TrendingDown className="w-3 h-3 mr-1" />
              Pearson r = {correlation.toFixed(3)}
            </Badge>
            <Badge variant="secondary" className="text-xs">
              <Database className="w-3 h-3 mr-1" />
              {formatNumber(stats.totalRecords)} records
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Scatter Chart */}
        <div className="h-80 sm:h-96">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 20, right: 20, bottom: 40, left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              
              {/* Temperature zone backgrounds */}
              <ReferenceArea
                x1={stats.tempRange.min}
                x2={-15}
                fill="hsl(280, 70%, 50%)"
                fillOpacity={0.08}
              />
              <ReferenceArea
                x1={-15}
                x2={0}
                fill="hsl(210, 70%, 50%)"
                fillOpacity={0.06}
              />
              <ReferenceArea
                x1={0}
                x2={stats.tempRange.max}
                fill="hsl(142, 70%, 45%)"
                fillOpacity={0.06}
              />

              <XAxis
                type="number"
                dataKey="temperature"
                name="Temperature"
                domain={[stats.tempRange.min - 2, stats.tempRange.max + 2]}
                tickFormatter={(v) => `${v}°C`}
                fontSize={11}
                label={{
                  value: 'Edmonton Temperature (°C)',
                  position: 'bottom',
                  offset: 25,
                  fontSize: 12,
                  className: 'fill-muted-foreground',
                }}
              />
              <YAxis
                type="number"
                dataKey="demand"
                name="Demand"
                domain={['auto', 'auto']}
                tickFormatter={(v) => `${(v / 1000).toFixed(1)}k`}
                fontSize={11}
                label={{
                  value: 'Peak Demand (MW)',
                  angle: -90,
                  position: 'insideLeft',
                  offset: 10,
                  fontSize: 12,
                  className: 'fill-muted-foreground',
                }}
              />

              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const point = payload[0].payload;
                    return (
                      <div className="bg-popover border rounded-lg shadow-lg p-3 text-sm">
                        <p className="font-semibold mb-2">{new Date(point.timestamp).toLocaleDateString('en-CA', { 
                          year: 'numeric', 
                          month: 'short', 
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}</p>
                        <div className="space-y-1">
                          <p>
                            <span className="text-muted-foreground">Temperature:</span>{' '}
                            <strong className={point.temperature < -15 ? 'text-purple-600 dark:text-purple-400' : ''}>
                              {point.temperature}°C
                            </strong>
                          </p>
                          <p>
                            <span className="text-muted-foreground">Demand:</span>{' '}
                            <strong>{formatNumber(point.demand)} MW</strong>
                          </p>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />

              <Legend
                verticalAlign="top"
                height={36}
                content={() => (
                  <div className="flex flex-wrap justify-center gap-3 text-xs mb-2">
                    {Object.keys(yearGroups).sort().map((year) => (
                      <div key={year} className="flex items-center gap-1">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: getYearColor(Number(year)) }}
                        />
                        <span className="text-muted-foreground">{year}</span>
                      </div>
                    ))}
                  </div>
                )}
              />

              {/* Scatter points by year */}
              {Object.entries(yearGroups).map(([year, points]) => (
                <Scatter
                  key={year}
                  name={year}
                  data={points}
                  fill={getYearColor(Number(year))}
                  fillOpacity={0.6}
                >
                  {points.map((_, index) => (
                    <Cell key={`cell-${year}-${index}`} />
                  ))}
                </Scatter>
              ))}

              {/* Trendline */}
              {trendlineData.length === 2 && (
                <ReferenceLine
                  segment={[
                    { x: trendlineData[0].x, y: trendlineData[0].y },
                    { x: trendlineData[1].x, y: trendlineData[1].y },
                  ]}
                  stroke="hsl(var(--destructive))"
                  strokeWidth={2}
                  strokeDasharray="6 4"
                  label={{
                    value: 'Trendline',
                    position: 'insideBottomRight',
                    fontSize: 10,
                    className: 'fill-destructive',
                  }}
                />
              )}
            </ScatterChart>
          </ResponsiveContainer>
        </div>

        {/* Key Insights */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          <div className="p-3 rounded-lg bg-purple-50 dark:bg-purple-950/30 border border-purple-200/50 dark:border-purple-800/50">
            <div className="flex items-center gap-2 mb-1">
              <Snowflake className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              <span className="text-xs font-medium text-purple-700 dark:text-purple-300">Extreme Cold (&lt;-20°C)</span>
            </div>
            <p className="text-lg font-bold text-purple-700 dark:text-purple-300">
              {formatNumber(stats.avgDemandAtExtremeCold)} MW
            </p>
            <p className="text-[10px] text-muted-foreground">avg demand</p>
          </div>

          <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200/50 dark:border-blue-800/50">
            <div className="flex items-center gap-2 mb-1">
              <TrendingDown className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span className="text-xs font-medium text-blue-700 dark:text-blue-300">Per 10°C Drop</span>
            </div>
            <p className="text-lg font-bold text-blue-700 dark:text-blue-300">
              +{formatNumber(Math.round(stats.demandIncreasePerDegree * 10))} MW
            </p>
            <p className="text-[10px] text-muted-foreground">demand increase</p>
          </div>

          <div className="p-3 rounded-lg bg-green-50 dark:bg-green-950/30 border border-green-200/50 dark:border-green-800/50">
            <div className="flex items-center gap-2 mb-1">
              <Thermometer className="w-4 h-4 text-green-600 dark:text-green-400" />
              <span className="text-xs font-medium text-green-700 dark:text-green-300">Mild Weather (&gt;0°C)</span>
            </div>
            <p className="text-lg font-bold text-green-700 dark:text-green-300">
              {formatNumber(stats.avgDemandAtMild)} MW
            </p>
            <p className="text-[10px] text-muted-foreground">avg demand</p>
          </div>
        </div>

        {/* Investor Insight Callout */}
        <div className="p-4 rounded-lg bg-muted/50 border border-border">
          <p className="text-sm text-muted-foreground">
            <strong className="text-foreground">Key Insight:</strong> Strong negative correlation (r = {correlation.toFixed(2)}) confirms 
            that extreme cold drives peak demand. Each 10°C temperature drop correlates with approximately {formatNumber(Math.round(stats.demandIncreasePerDegree * 10))} MW 
            additional grid load—critical for 12CP transmission cost allocation during winter heating events.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
