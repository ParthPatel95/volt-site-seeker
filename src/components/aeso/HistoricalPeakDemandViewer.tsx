import React, { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  LineChart,
  Line
} from 'recharts';
import { 
  History, 
  TrendingUp,
  Calendar,
  Clock,
  Zap,
  Database,
  Loader2,
  RefreshCw,
  BarChart3
} from 'lucide-react';
import { useHistorical12CPPeaks } from '@/hooks/useHistorical12CPPeaks';
import { format } from 'date-fns';

export function HistoricalPeakDemandViewer() {
  const {
    peaksData,
    loading,
    selectedRange,
    fetchHistoricalPeaks,
    formatPeakHour
  } = useHistorical12CPPeaks();

  useEffect(() => {
    fetchHistoricalPeaks(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('en-CA').format(value);
  };

  const formatDate = (timestamp: string) => {
    return format(new Date(timestamp), 'MMM d, yyyy HH:mm');
  };

  const getDemandColor = (demandMW: number, maxDemand: number) => {
    const percentile = demandMW / maxDemand;
    if (percentile >= 0.95) return 'hsl(0, 84%, 60%)'; // Red - very high
    if (percentile >= 0.90) return 'hsl(38, 92%, 50%)'; // Orange - high
    if (percentile >= 0.85) return 'hsl(48, 96%, 53%)'; // Yellow - moderate-high
    return 'hsl(142, 76%, 36%)'; // Green - moderate
  };

  if (loading && !peaksData) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <span className="ml-3 text-muted-foreground">Loading historical peak demand data...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Range Selector */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <History className="w-5 h-5 text-primary" />
              <CardTitle>Historical 12CP Peak Demand</CardTitle>
              <Badge variant="outline" className="ml-2 bg-primary/10 text-primary border-primary/30">
                <Database className="w-3 h-3 mr-1" />
                Real AESO Data
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">View Range:</span>
              <div className="flex gap-1">
                {([1, 2, 4] as const).map(years => (
                  <Button
                    key={years}
                    variant={selectedRange === years ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => fetchHistoricalPeaks(years)}
                    disabled={loading}
                  >
                    {years} {years === 1 ? 'Year' : 'Years'}
                  </Button>
                ))}
              </div>
              <Button
                onClick={() => fetchHistoricalPeaks(selectedRange)}
                variant="ghost"
                size="icon"
                disabled={loading}
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
              </Button>
            </div>
          </div>
        </CardHeader>
        
        {peaksData && (
          <CardContent className="space-y-6">
            {/* Key Statistics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200/50">
                <p className="text-xs text-muted-foreground">All-Time Peak (Period)</p>
                <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                  {formatNumber(peaksData.stats.allTimePeakMW)} MW
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {peaksData.stats.allTimePeakDate && formatDate(peaksData.stats.allTimePeakDate)}
                </p>
              </div>
              <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200/50">
                <p className="text-xs text-muted-foreground">Avg Monthly Peak</p>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {formatNumber(peaksData.stats.avgMonthlyPeakMW)} MW
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Across {peaksData.peaks.length} months
                </p>
              </div>
              <div className="p-4 rounded-lg bg-purple-50 dark:bg-purple-950/30 border border-purple-200/50">
                <p className="text-xs text-muted-foreground">Winter Avg Peak</p>
                <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {formatNumber(peaksData.stats.winterAvgPeakMW)} MW
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Nov-Feb (Heating demand)
                </p>
              </div>
              <div className="p-4 rounded-lg bg-orange-50 dark:bg-orange-950/30 border border-orange-200/50">
                <p className="text-xs text-muted-foreground">Summer Avg Peak</p>
                <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                  {formatNumber(peaksData.stats.summerAvgPeakMW)} MW
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Jun-Aug (Cooling demand)
                </p>
              </div>
            </div>

            {/* Peak Demand Trend Chart */}
            <div className="rounded-lg border bg-card p-4">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="w-4 h-4 text-primary" />
                <span className="font-medium">Monthly Peak Demand Trend</span>
              </div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={peaksData.peaks}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis 
                      dataKey="monthLabel" 
                      fontSize={10}
                      angle={-45}
                      textAnchor="end"
                      height={60}
                      interval={peaksData.peaks.length > 12 ? 1 : 0}
                    />
                    <YAxis 
                      fontSize={12}
                      tickFormatter={(v) => `${(v/1000).toFixed(1)}k`}
                      domain={['dataMin - 500', 'dataMax + 500']}
                      label={{ value: 'MW', angle: -90, position: 'insideLeft', fontSize: 11 }}
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
                                <p>Price at Peak: <strong>${data.priceAtPeak}/MWh</strong></p>
                                <p>Peak Hour: <strong>{formatPeakHour(data.peakHour)}</strong></p>
                                <p>Day: <strong>{data.dayOfWeek}</strong></p>
                                <p className="text-xs text-muted-foreground pt-1">
                                  {formatDate(data.peakTimestamp)}
                                </p>
                              </div>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Bar dataKey="peakDemandMW" radius={[4, 4, 0, 0]}>
                      {peaksData.peaks.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={getDemandColor(entry.peakDemandMW, peaksData.stats.allTimePeakMW)} 
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Monthly Peaks Table */}
            <div className="rounded-lg border overflow-hidden">
              <div className="bg-muted/50 px-4 py-3 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span className="font-medium">Monthly 12CP Peaks Detail</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted/30">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">Month</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">Peak Date/Time</th>
                      <th className="px-4 py-2 text-right text-xs font-medium text-muted-foreground">Demand (MW)</th>
                      <th className="px-4 py-2 text-right text-xs font-medium text-muted-foreground">Price at Peak</th>
                      <th className="px-4 py-2 text-center text-xs font-medium text-muted-foreground">Hour</th>
                      <th className="px-4 py-2 text-center text-xs font-medium text-muted-foreground">Day</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {peaksData.peaks.slice().reverse().map((peak, index) => (
                      <tr key={peak.month} className={index === 0 ? 'bg-red-50/50 dark:bg-red-950/20' : ''}>
                        <td className="px-4 py-3 text-sm font-medium">{peak.monthLabel}</td>
                        <td className="px-4 py-3 text-sm text-muted-foreground">
                          {formatDate(peak.peakTimestamp)}
                        </td>
                        <td className="px-4 py-3 text-sm text-right">
                          <span className="font-bold">{formatNumber(peak.peakDemandMW)}</span>
                          {peak.peakDemandMW === peaksData.stats.allTimePeakMW && (
                            <Badge className="ml-2 bg-red-600 text-[10px] py-0">MAX</Badge>
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm text-right">${peak.priceAtPeak}/MWh</td>
                        <td className="px-4 py-3 text-sm text-center">
                          <Badge variant="outline">{formatPeakHour(peak.peakHour)}</Badge>
                        </td>
                        <td className="px-4 py-3 text-sm text-center text-muted-foreground">
                          {peak.dayOfWeek.slice(0, 3)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Common Peak Hours */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="border-primary/20">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Clock className="w-4 h-4 text-primary" />
                    Most Common Peak Hours
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {peaksData.stats.commonPeakHours.map(({ hour, count }, index) => (
                      <div key={hour} className="flex items-center justify-between p-2 rounded bg-muted/50">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-full bg-primary/20 text-primary text-xs flex items-center justify-center font-bold">
                            {index + 1}
                          </span>
                          <span className="font-medium">{formatPeakHour(hour)}</span>
                        </div>
                        <Badge variant="secondary">{count} peaks</Badge>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground mt-3">
                    Historical 12CP peaks most frequently occur during these hours
                  </p>
                </CardContent>
              </Card>

              <Card className="border-primary/20">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-primary" />
                    12CP Insights
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="p-3 rounded bg-blue-50 dark:bg-blue-950/30 border border-blue-200/30">
                      <div className="flex items-center gap-2 mb-1">
                        <Zap className="w-4 h-4 text-blue-600" />
                        <span className="font-medium text-sm">Peak Season</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Winter peaks average <strong>{formatNumber(peaksData.stats.winterAvgPeakMW)} MW</strong> vs 
                        summer <strong>{formatNumber(peaksData.stats.summerAvgPeakMW)} MW</strong>
                        {peaksData.stats.winterAvgPeakMW > peaksData.stats.summerAvgPeakMW && (
                          <span className="text-blue-600"> (+{formatNumber(peaksData.stats.winterAvgPeakMW - peaksData.stats.summerAvgPeakMW)} MW)</span>
                        )}
                      </p>
                    </div>
                    <div className="p-3 rounded bg-green-50 dark:bg-green-950/30 border border-green-200/30">
                      <div className="flex items-center gap-2 mb-1">
                        <TrendingUp className="w-4 h-4 text-green-600" />
                        <span className="font-medium text-sm">Avoidance Strategy</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Focus curtailment during winter months and hours {peaksData.stats.commonPeakHours.slice(0, 3).map(h => formatPeakHour(h.hour)).join(', ')} for maximum 12CP savings.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Data Source Footer */}
            <div className="flex items-center justify-between text-xs text-muted-foreground pt-4 border-t">
              <div className="flex items-center gap-2">
                <Database className="w-3 h-3" />
                <span>AESO Historical Data ({format(new Date(peaksData.dateRange.start), 'MMM yyyy')} - {format(new Date(peaksData.dateRange.end), 'MMM yyyy')})</span>
              </div>
              <span>{formatNumber(peaksData.recordCount)} demand records analyzed</span>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
}
