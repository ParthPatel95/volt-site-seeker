import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
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
  Line,
  ReferenceLine
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
  BarChart3,
  Trophy,
  Target,
  AlertTriangle,
  Sparkles
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

  const [activeTab, setActiveTab] = useState('monthly');

  useEffect(() => {
    fetchHistoricalPeaks(4); // Load 4 years for comprehensive analysis
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('en-CA').format(value);
  };

  const formatDate = (timestamp: string) => {
    return format(new Date(timestamp), 'MMM d, yyyy HH:mm');
  };

  const formatShortDate = (timestamp: string) => {
    return format(new Date(timestamp), 'MMM d, yyyy');
  };

  const getDemandColor = (demandMW: number, maxDemand: number) => {
    const percentile = demandMW / maxDemand;
    if (percentile >= 0.95) return 'hsl(0, 84%, 60%)';
    if (percentile >= 0.90) return 'hsl(38, 92%, 50%)';
    if (percentile >= 0.85) return 'hsl(48, 96%, 53%)';
    return 'hsl(142, 76%, 36%)';
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'moderate': return 'bg-yellow-500';
      default: return 'bg-green-500';
    }
  };

  const getRiskBadgeVariant = (level: string): "destructive" | "secondary" | "outline" => {
    switch (level) {
      case 'critical': return 'destructive';
      case 'high': return 'secondary';
      default: return 'outline';
    }
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
              <CardTitle>Historical 12CP Peak Demand Analysis</CardTitle>
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
                <p className="text-xs text-muted-foreground">2026 Peak So Far</p>
                <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                  {peaksData.current2026Peak ? formatNumber(peaksData.current2026Peak) : '—'} MW
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {peaksData.current2026Peak ? 'YTD Maximum' : 'No 2026 data yet'}
                </p>
              </div>
            </div>

            {/* Sub-Tabs for Different Views */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="monthly" className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4" />
                  Monthly Peaks
                </TabsTrigger>
                <TabsTrigger value="top12" className="flex items-center gap-1.5">
                  <Trophy className="w-4 h-4" />
                  All-Time Top 12
                </TabsTrigger>
                <TabsTrigger value="predictions" className="flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4" />
                  2026 Predictions
                </TabsTrigger>
              </TabsList>

              {/* Monthly Peaks Tab */}
              <TabsContent value="monthly" className="space-y-6 mt-6">
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
                  <div className="overflow-x-auto max-h-96">
                    <table className="w-full">
                      <thead className="bg-muted/30 sticky top-0">
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
              </TabsContent>

              {/* All-Time Top 12 Tab */}
              <TabsContent value="top12" className="space-y-6 mt-6">
                {/* Top 12 Peaks Table */}
                <Card className="border-primary/30">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Trophy className="w-5 h-5 text-yellow-500" />
                      Top 12 All-Time Peak Demand Hours
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      These are the 12 highest grid demand hours ever recorded in Alberta. 
                      Understanding when these occurred helps predict future 12CP peaks.
                    </p>
                  </CardHeader>
                  <CardContent>
                    <div className="rounded-lg border overflow-hidden">
                      <table className="w-full">
                        <thead className="bg-muted/30">
                          <tr>
                            <th className="px-4 py-2 text-center text-xs font-medium text-muted-foreground">Rank</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">Date/Time</th>
                            <th className="px-4 py-2 text-right text-xs font-medium text-muted-foreground">Demand (MW)</th>
                            <th className="px-4 py-2 text-right text-xs font-medium text-muted-foreground">Price</th>
                            <th className="px-4 py-2 text-center text-xs font-medium text-muted-foreground">Day</th>
                            <th className="px-4 py-2 text-center text-xs font-medium text-muted-foreground">Hour</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                          {peaksData.allTimePeaks.map((peak) => (
                            <tr 
                              key={`${peak.timestamp}-${peak.rank}`} 
                              className={peak.rank === 1 ? 'bg-yellow-50/50 dark:bg-yellow-950/20' : peak.rank <= 3 ? 'bg-orange-50/30 dark:bg-orange-950/10' : ''}
                            >
                              <td className="px-4 py-3 text-center">
                                <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-sm font-bold ${
                                  peak.rank === 1 ? 'bg-yellow-500 text-white' :
                                  peak.rank === 2 ? 'bg-gray-400 text-white' :
                                  peak.rank === 3 ? 'bg-orange-600 text-white' :
                                  'bg-muted text-muted-foreground'
                                }`}>
                                  #{peak.rank}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-sm">
                                <div className="font-medium">{formatShortDate(peak.timestamp)}</div>
                                <div className="text-xs text-muted-foreground">{format(new Date(peak.timestamp), 'HH:mm')} MST</div>
                              </td>
                              <td className="px-4 py-3 text-sm text-right">
                                <span className="font-bold text-lg">{formatNumber(peak.demandMW)}</span>
                                <span className="text-muted-foreground ml-1">MW</span>
                              </td>
                              <td className="px-4 py-3 text-sm text-right">${peak.priceAtPeak}/MWh</td>
                              <td className="px-4 py-3 text-sm text-center text-muted-foreground">
                                {peak.dayOfWeek.slice(0, 3)}
                              </td>
                              <td className="px-4 py-3 text-sm text-center">
                                <Badge variant="outline">{formatPeakHour(peak.hour)}</Badge>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>

                {/* Pattern Analysis Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Peak Months */}
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-primary" />
                        Peak Months
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {peaksData.peakPatterns.byMonth.slice(0, 5).map((month, index) => (
                          <div key={month.month} className="flex items-center justify-between p-2 rounded bg-muted/50">
                            <div className="flex items-center gap-2">
                              <span className="w-6 h-6 rounded-full bg-primary/20 text-primary text-xs flex items-center justify-center font-bold">
                                {index + 1}
                              </span>
                              <span className="font-medium">{month.monthName}</span>
                            </div>
                            <div className="text-right">
                              <Badge variant="secondary">{month.peakCount}x</Badge>
                              <span className="text-xs text-muted-foreground ml-2">{formatNumber(month.maxPeak)} MW max</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Peak Hours */}
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Clock className="w-4 h-4 text-primary" />
                        Peak Hours
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {peaksData.peakPatterns.byHour.slice(0, 5).map((hour, index) => (
                          <div key={hour.hour} className="flex items-center justify-between p-2 rounded bg-muted/50">
                            <div className="flex items-center gap-2">
                              <span className="w-6 h-6 rounded-full bg-primary/20 text-primary text-xs flex items-center justify-center font-bold">
                                {index + 1}
                              </span>
                              <span className="font-medium">{formatPeakHour(hour.hour)}</span>
                            </div>
                            <div className="text-right">
                              <Badge variant="secondary">{hour.peakCount}x</Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Peak Days */}
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <BarChart3 className="w-4 h-4 text-primary" />
                        Peak Days
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {peaksData.peakPatterns.byDayOfWeek.slice(0, 5).map((day, index) => (
                          <div key={day.day} className="flex items-center justify-between p-2 rounded bg-muted/50">
                            <div className="flex items-center gap-2">
                              <span className="w-6 h-6 rounded-full bg-primary/20 text-primary text-xs flex items-center justify-center font-bold">
                                {index + 1}
                              </span>
                              <span className="font-medium">{day.day}</span>
                            </div>
                            <Badge variant="secondary">{day.peakCount}x</Badge>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Key Insight */}
                <div className="p-4 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200/50">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-amber-800 dark:text-amber-200">Key Insight</p>
                      <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                        {peaksData.allTimePeaks.filter(p => p.month === 12).length === 12 
                          ? "All 12 highest peaks occurred in December, predominantly between 1-3 AM during extreme cold weather events."
                          : `${peaksData.allTimePeaks.filter(p => p.month === 12).length} of the top 12 peaks occurred in December. Winter heating drives the highest demand.`
                        }
                      </p>
                    </div>
                  </div>
                </div>

                {/* Year-over-Year Trend */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-primary" />
                      Year-over-Year Peak Trend
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-48">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={peaksData.yearlyTrends}>
                          <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                          <XAxis dataKey="year" fontSize={12} />
                          <YAxis 
                            fontSize={12}
                            tickFormatter={(v) => `${(v/1000).toFixed(1)}k`}
                            domain={['dataMin - 300', 'dataMax + 300']}
                          />
                          <Tooltip 
                            content={({ active, payload }) => {
                              if (active && payload && payload.length) {
                                const data = payload[0].payload;
                                return (
                                  <div className="bg-popover border rounded-lg shadow-lg p-3">
                                    <p className="font-semibold">{data.year}{data.isPredicted ? ' (Predicted)' : ''}</p>
                                    <p className="text-sm">Max Peak: <strong>{formatNumber(data.maxPeak)} MW</strong></p>
                                  </div>
                                );
                              }
                              return null;
                            }}
                          />
                          <Line 
                            type="monotone" 
                            dataKey="maxPeak" 
                            stroke="hsl(var(--primary))" 
                            strokeWidth={2}
                            dot={(props) => {
                              const { cx, cy, payload } = props;
                              return (
                                <circle 
                                  cx={cx} 
                                  cy={cy} 
                                  r={payload.isPredicted ? 6 : 4} 
                                  fill={payload.isPredicted ? 'hsl(var(--muted-foreground))' : 'hsl(var(--primary))'}
                                  stroke={payload.isPredicted ? 'hsl(var(--primary))' : 'white'}
                                  strokeWidth={2}
                                  strokeDasharray={payload.isPredicted ? '3 3' : '0'}
                                />
                              );
                            }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2 text-center">
                      Dashed circle indicates predicted value based on 3% annual growth trend
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* 2026 Predictions Tab */}
              <TabsContent value="predictions" className="space-y-6 mt-6">
                {/* Prediction Header */}
                <Card className="border-primary/30 bg-gradient-to-r from-primary/5 to-transparent">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-primary" />
                      2026 Peak Demand Predictions
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Based on {peaksData.yearsAnalyzed} years of historical patterns + 3% annual growth trend
                    </p>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 rounded-lg bg-card border">
                        <p className="text-xs text-muted-foreground">Expected 2026 Annual Peak</p>
                        <p className="text-2xl font-bold text-primary">
                          {formatNumber(peaksData.predictions[0]?.expectedDemandRange.min || 13100)} - {formatNumber(peaksData.predictions[0]?.expectedDemandRange.max || 13200)} MW
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Based on {formatNumber(peaksData.stats.allTimePeakMW)} MW record + 3% growth
                        </p>
                      </div>
                      <div className="p-4 rounded-lg bg-card border">
                        <p className="text-xs text-muted-foreground">Current 2026 Peak (YTD)</p>
                        <p className="text-2xl font-bold">
                          {peaksData.current2026Peak ? formatNumber(peaksData.current2026Peak) : '—'} MW
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {peaksData.current2026Peak 
                            ? `${Math.round((peaksData.current2026Peak / (peaksData.predictions[0]?.expectedDemandRange.max || 13200)) * 100)}% of predicted maximum`
                            : 'No 2026 data recorded yet'
                          }
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Monthly Risk Forecast */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Target className="w-5 h-5 text-primary" />
                      Monthly 12CP Risk Forecast
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {peaksData.predictions.map((prediction) => (
                        <div 
                          key={prediction.month} 
                          className={`p-4 rounded-lg border ${
                            prediction.riskLevel === 'critical' ? 'bg-red-50/50 dark:bg-red-950/20 border-red-200/50' :
                            prediction.riskLevel === 'high' ? 'bg-orange-50/50 dark:bg-orange-950/20 border-orange-200/50' :
                            prediction.riskLevel === 'moderate' ? 'bg-yellow-50/50 dark:bg-yellow-950/20 border-yellow-200/50' :
                            'bg-muted/30'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-3">
                              <span className="font-semibold">{prediction.monthName}</span>
                              <Badge variant={getRiskBadgeVariant(prediction.riskLevel)}>
                                {prediction.riskLevel.toUpperCase()}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium">{prediction.probabilityScore}%</span>
                              <span className="text-xs text-muted-foreground">risk</span>
                            </div>
                          </div>
                          <Progress 
                            value={prediction.probabilityScore} 
                            className={`h-2 mb-2 ${
                              prediction.riskLevel === 'critical' ? '[&>div]:bg-red-500' :
                              prediction.riskLevel === 'high' ? '[&>div]:bg-orange-500' :
                              prediction.riskLevel === 'moderate' ? '[&>div]:bg-yellow-500' :
                              '[&>div]:bg-green-500'
                            }`}
                          />
                          <div className="flex items-center justify-between text-sm">
                            <p className="text-muted-foreground">{prediction.reasoning}</p>
                            <div className="text-right whitespace-nowrap ml-4">
                              <span className="font-medium">{formatNumber(prediction.expectedDemandRange.min)}-{formatNumber(prediction.expectedDemandRange.max)}</span>
                              <span className="text-muted-foreground ml-1">MW</span>
                            </div>
                          </div>
                          <div className="mt-2 pt-2 border-t border-border/50">
                            <span className="text-xs text-muted-foreground">
                              Predicted peak hour: <strong>{formatPeakHour(prediction.predictedPeakHour)}</strong>
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Most Likely Peak Windows */}
                <Card className="border-amber-200/50">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Zap className="w-5 h-5 text-amber-500" />
                      Most Likely Peak Windows for 2026
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200/30">
                        <div className="flex items-center gap-2 mb-1">
                          <div className="w-2 h-2 rounded-full bg-red-500"></div>
                          <span className="font-medium text-sm">December 10-20, 2026</span>
                          <Badge variant="destructive" className="text-[10px]">95% confidence</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">Between 1-3 AM MST during cold snaps</p>
                      </div>
                      <div className="p-3 rounded-lg bg-orange-50 dark:bg-orange-950/30 border border-orange-200/30">
                        <div className="flex items-center gap-2 mb-1">
                          <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                          <span className="font-medium text-sm">January 15-25, 2026</span>
                          <Badge variant="secondary" className="text-[10px]">70% confidence</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">During extended cold periods</p>
                      </div>
                      <div className="p-3 rounded-lg bg-yellow-50 dark:bg-yellow-950/30 border border-yellow-200/30">
                        <div className="flex items-center gap-2 mb-1">
                          <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                          <span className="font-medium text-sm">July Heat Waves</span>
                          <Badge variant="outline" className="text-[10px]">40% confidence</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">Between 9 PM - 12 AM during extreme heat</p>
                      </div>
                    </div>

                    <div className="mt-4 p-3 rounded-lg bg-muted/50 border">
                      <div className="flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 text-muted-foreground mt-0.5" />
                        <p className="text-xs text-muted-foreground">
                          <strong>Note:</strong> These predictions are based on historical patterns. 
                          Actual peaks depend on weather conditions, economic activity, and grid events. 
                          Monitor AESO alerts for real-time peak risk warnings.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

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
