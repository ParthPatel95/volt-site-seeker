import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  AreaChart,
  Area
} from 'recharts';
import { 
  Target, 
  TrendingUp, 
  TrendingDown, 
  Minus,
  Zap, 
  DollarSign, 
  Clock, 
  Calendar,
  RefreshCw,
  Calculator,
  Activity,
  AlertTriangle,
  Loader2,
  Radio,
  Shield,
  CheckCircle2
} from 'lucide-react';
import { useAESO12CPAnalytics } from '@/hooks/useAESO12CPAnalytics';
import { useAESORealtimeReserves } from '@/hooks/useAESORealtimeReserves';
import { format } from 'date-fns';

export function TwelveCPAnalyticsTab() {
  const {
    twelveCPData,
    reservesData,
    loading12CP,
    loadingReserves,
    fetch12CPData,
    fetchOperatingReservesData,
    calculateTransmissionChargeImpact
  } = useAESO12CPAnalytics();

  const {
    reserves: realtimeReserves,
    loading: loadingRealtime,
    error: realtimeError,
    lastFetched,
    fetchRealtimeReserves,
    getMarginStatus
  } = useAESORealtimeReserves();

  const [months12CP, setMonths12CP] = useState('24');
  const [reservesDays, setReservesDays] = useState('30');
  const [demandMW, setDemandMW] = useState('50');
  const [transmissionChargeResult, setTransmissionChargeResult] = useState<any>(null);

  useEffect(() => {
    fetch12CPData(parseInt(months12CP));
    fetchOperatingReservesData(parseInt(reservesDays));
    fetchRealtimeReserves();
  }, []);

  const handleRefresh12CP = () => {
    fetch12CPData(parseInt(months12CP));
  };

  const handleRefreshReserves = () => {
    fetchOperatingReservesData(parseInt(reservesDays));
  };

  const handleCalculateTransmission = () => {
    const result = calculateTransmissionChargeImpact(parseFloat(demandMW));
    setTransmissionChargeResult(result);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-CA', { style: 'currency', currency: 'CAD' }).format(value);
  };

  const formatNumber = (value: number, decimals: number = 0) => {
    return new Intl.NumberFormat('en-CA', { maximumFractionDigits: decimals }).format(value);
  };

  const getTrendIcon = (trend: 'improving' | 'declining' | 'stable') => {
    switch (trend) {
      case 'improving':
        return <TrendingUp className="w-4 h-4 text-green-600" />;
      case 'declining':
        return <TrendingDown className="w-4 h-4 text-red-600" />;
      default:
        return <Minus className="w-4 h-4 text-muted-foreground" />;
    }
  };

  // Prepare chart data for reserves
  const reservesChartData = reservesData?.historicalData
    .filter((_, i) => i % 24 === 0) // Sample daily for cleaner chart
    .map(d => ({
      date: format(new Date(d.timestamp), 'MMM dd'),
      total: Math.round(d.totalReserve),
      spinning: Math.round(d.spinningReserve),
      supplemental: Math.round(d.supplementalReserve),
      price: d.reservePrice
    })) || [];

  return (
    <div className="space-y-6">
      {/* 12CP Section */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Target className="w-5 h-5 text-blue-600" />
              12 Coincident Peak (12CP) Analysis
            </h3>
            <p className="text-sm text-muted-foreground">
              Monthly system peaks that determine transmission charges
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Select value={months12CP} onValueChange={setMonths12CP}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="12">12 months</SelectItem>
                <SelectItem value="24">24 months</SelectItem>
                <SelectItem value="36">36 months</SelectItem>
              </SelectContent>
            </Select>
            <Button 
              onClick={handleRefresh12CP} 
              disabled={loading12CP}
              variant="outline"
              size="sm"
            >
              {loading12CP ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
            </Button>
          </div>
        </div>

        {/* 12CP Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Avg Monthly Peak</p>
                  <p className="text-2xl font-bold">
                    {loading12CP ? '—' : `${formatNumber(twelveCPData?.averageMonthlyPeak || 0)} MW`}
                  </p>
                </div>
                <Zap className="w-8 h-8 text-yellow-500 opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Peak Hour</p>
                  <p className="text-2xl font-bold">
                    {loading12CP || !twelveCPData?.peakHourDistribution?.[0] 
                      ? '—' 
                      : `HE ${twelveCPData.peakHourDistribution[0].hour}`}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {twelveCPData?.peakHourDistribution?.[0]?.count 
                      ? `${twelveCPData.peakHourDistribution[0].count} occurrences` 
                      : ''}
                  </p>
                </div>
                <Clock className="w-8 h-8 text-blue-500 opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">YoY Change</p>
                  <p className={`text-2xl font-bold ${(twelveCPData?.yearOverYearChange || 0) > 0 ? 'text-red-600' : 'text-green-600'}`}>
                    {loading12CP ? '—' : `${twelveCPData?.yearOverYearChange?.toFixed(1) || 0}%`}
                  </p>
                </div>
                {(twelveCPData?.yearOverYearChange || 0) > 0 
                  ? <TrendingUp className="w-8 h-8 text-red-500 opacity-50" />
                  : <TrendingDown className="w-8 h-8 text-green-500 opacity-50" />}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Trans. Adder</p>
                  <p className="text-2xl font-bold">
                    $11.73/MWh
                  </p>
                </div>
                <DollarSign className="w-8 h-8 text-green-500 opacity-50" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 12CP Monthly Peaks Table */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Monthly Coincident Peaks</CardTitle>
          </CardHeader>
          <CardContent>
            {loading12CP ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Month</TableHead>
                      <TableHead className="text-right">Peak Demand</TableHead>
                      <TableHead>Date & Time</TableHead>
                      <TableHead className="text-right">Pool Price</TableHead>
                      <TableHead>Hour</TableHead>
                      <TableHead>Day</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {twelveCPData?.monthlyPeaks.slice(0, 12).map((peak, index) => (
                      <TableRow key={peak.month}>
                        <TableCell className="font-medium">{peak.month}</TableCell>
                        <TableCell className="text-right font-semibold">
                          {formatNumber(peak.peakDemandMW)} MW
                        </TableCell>
                        <TableCell className="text-sm">
                          {format(new Date(peak.peakTimestamp), 'MMM dd, yyyy HH:mm')}
                        </TableCell>
                        <TableCell className="text-right">
                          <span className={peak.poolPriceAtPeak > 100 ? 'text-red-600 font-medium' : ''}>
                            ${peak.poolPriceAtPeak.toFixed(2)}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">HE {peak.hourOfDay}</Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {peak.dayOfWeek}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Peak Hour Distribution Chart */}
        {twelveCPData && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Peak Hour Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={twelveCPData.peakHourDistribution}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis 
                      dataKey="hour" 
                      tickFormatter={(h) => `HE${h}`}
                      fontSize={12}
                    />
                    <YAxis fontSize={12} />
                    <Tooltip 
                      formatter={(value: number) => [`${value} peaks`, 'Count']}
                      labelFormatter={(hour) => `Hour Ending ${hour}`}
                    />
                    <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Operating Reserves Section */}
      <div className="space-y-4 pt-6 border-t">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Activity className="w-5 h-5 text-green-600" />
              Operating Reserves Analysis
            </h3>
            <p className="text-sm text-muted-foreground">
              Grid reliability reserves and pricing analytics
            </p>
          </div>
        </div>

        {/* Real-Time Reserves Card - Always shown */}
        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 border-green-200 dark:border-green-800">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <Radio className="w-4 h-4 text-green-600 animate-pulse" />
                Real-Time Operating Reserves
                <Badge variant="outline" className="ml-2 text-xs bg-green-100 text-green-700 border-green-300">
                  Live
                </Badge>
              </CardTitle>
              <Button
                onClick={fetchRealtimeReserves}
                disabled={loadingRealtime}
                variant="ghost"
                size="sm"
                className="h-8"
              >
                {loadingRealtime ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {loadingRealtime ? (
              <div className="flex items-center justify-center py-6">
                <Loader2 className="w-6 h-6 animate-spin text-green-600" />
                <span className="ml-2 text-sm text-muted-foreground">Fetching live reserves...</span>
              </div>
            ) : realtimeReserves ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="p-3 rounded-lg bg-white/60 dark:bg-white/5 border border-green-200/50">
                    <p className="text-xs text-muted-foreground">Total Reserve</p>
                    <p className="text-xl font-bold text-green-700 dark:text-green-400">
                      {formatNumber(realtimeReserves.total_mw)} MW
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-white/60 dark:bg-white/5 border border-green-200/50">
                    <p className="text-xs text-muted-foreground">Spinning (Contingency)</p>
                    <p className="text-xl font-bold">
                      {formatNumber(realtimeReserves.spinning_mw)} MW
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-white/60 dark:bg-white/5 border border-green-200/50">
                    <p className="text-xs text-muted-foreground">Required Reserve</p>
                    <p className="text-xl font-bold">
                      {formatNumber(realtimeReserves.required_mw)} MW
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-white/60 dark:bg-white/5 border border-green-200/50">
                    <p className="text-xs text-muted-foreground">Reserve Margin</p>
                    <div className="flex items-center gap-2">
                      <p className={`text-xl font-bold ${getMarginStatus(realtimeReserves.margin_percent).color}`}>
                        {realtimeReserves.margin_percent > 0 ? '+' : ''}{realtimeReserves.margin_percent}%
                      </p>
                      {realtimeReserves.margin_percent >= 5 ? (
                        <CheckCircle2 className="w-5 h-5 text-green-600" />
                      ) : (
                        <AlertTriangle className="w-5 h-5 text-orange-500" />
                      )}
                    </div>
                    <p className={`text-xs ${getMarginStatus(realtimeReserves.margin_percent).color}`}>
                      {getMarginStatus(realtimeReserves.margin_percent).status}
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t border-green-200/50">
                  <span>Source: {realtimeReserves.source || 'AESO CSD API'}</span>
                  <span>
                    Last updated: {lastFetched ? format(lastFetched, 'HH:mm:ss') : '—'} MST
                  </span>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-6 text-center">
                <Shield className="w-8 h-8 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">
                  {realtimeError || 'Real-time reserve data temporarily unavailable'}
                </p>
                <Button
                  onClick={fetchRealtimeReserves}
                  variant="outline"
                  size="sm"
                  className="mt-3"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Retry
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Check if reserves data is available */}
        {!loadingReserves && (!reservesData || reservesData.avgTotalReserve === 0) ? (
          /* Empty State - No Reserves Data */
          <Card className="border-dashed border-2 border-muted">
            <CardContent className="py-12">
              <div className="flex flex-col items-center justify-center text-center space-y-4">
                <div className="p-4 rounded-full bg-muted/50">
                  <Activity className="w-10 h-10 text-muted-foreground" />
                </div>
                <div className="space-y-2">
                  <h4 className="text-lg font-semibold">Historical Reserves Data Coming Soon</h4>
                  <p className="text-sm text-muted-foreground max-w-md">
                    We're actively collecting operating reserves data from the AESO grid. 
                    Historical analytics will be available once sufficient data is gathered.
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                  <Badge variant="outline" className="gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    Data collection in progress
                  </Badge>
                  <a 
                    href="/app/aeso-market" 
                    className="text-sm text-primary hover:underline flex items-center gap-1"
                  >
                    View real-time reserves in Market Hub →
                  </a>
                </div>
                <div className="pt-4 grid grid-cols-2 sm:grid-cols-4 gap-4 w-full max-w-2xl">
                  <div className="p-3 rounded-lg bg-muted/30 text-center">
                    <p className="text-xs text-muted-foreground">Spinning Reserve</p>
                    <p className="text-sm font-medium text-muted-foreground">Pending</p>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/30 text-center">
                    <p className="text-xs text-muted-foreground">Supplemental</p>
                    <p className="text-sm font-medium text-muted-foreground">Pending</p>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/30 text-center">
                    <p className="text-xs text-muted-foreground">Reserve Price</p>
                    <p className="text-sm font-medium text-muted-foreground">Pending</p>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/30 text-center">
                    <p className="text-xs text-muted-foreground">Trend Analysis</p>
                    <p className="text-sm font-medium text-muted-foreground">Pending</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          /* Reserves Data Available */
          <>
            {/* Reserves Controls */}
            <div className="flex items-center gap-2 justify-end">
              <Select value={reservesDays} onValueChange={setReservesDays}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">7 days</SelectItem>
                  <SelectItem value="30">30 days</SelectItem>
                  <SelectItem value="90">90 days</SelectItem>
                </SelectContent>
              </Select>
              <Button 
                onClick={handleRefreshReserves} 
                disabled={loadingReserves}
                variant="outline"
                size="sm"
              >
                {loadingReserves ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
              </Button>
            </div>

            {/* Reserves Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Avg Total Reserve</p>
                      <p className="text-2xl font-bold">
                        {loadingReserves ? '—' : `${formatNumber(reservesData?.avgTotalReserve || 0)} MW`}
                      </p>
                    </div>
                    <Zap className="w-8 h-8 text-green-500 opacity-50" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Spinning Reserve</p>
                      <p className="text-2xl font-bold">
                        {loadingReserves ? '—' : `${formatNumber(reservesData?.avgSpinningReserve || 0)} MW`}
                      </p>
                    </div>
                    <Activity className="w-8 h-8 text-blue-500 opacity-50" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Avg Reserve Price</p>
                      <p className="text-2xl font-bold">
                        {loadingReserves ? '—' : `$${(reservesData?.avgReservePrice || 0).toFixed(2)}`}
                      </p>
                    </div>
                    <DollarSign className="w-8 h-8 text-yellow-500 opacity-50" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Reserve Trend</p>
                      <div className="flex items-center gap-2">
                        <p className="text-2xl font-bold capitalize">
                          {loadingReserves ? '—' : reservesData?.reserveMarginTrend || 'stable'}
                        </p>
                        {reservesData && getTrendIcon(reservesData.reserveMarginTrend)}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Min/Max Reserve Events */}
            {reservesData && (reservesData.minReserveEvent || reservesData.maxReserveEvent) && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {reservesData.minReserveEvent && (
                  <Card className="border-red-200 bg-red-50/50 dark:bg-red-950/20">
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-3">
                        <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
                        <div>
                          <p className="font-medium text-red-800 dark:text-red-200">Minimum Reserve Event</p>
                          <p className="text-2xl font-bold text-red-600">
                            {formatNumber(reservesData.minReserveEvent.reserve)} MW
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {format(new Date(reservesData.minReserveEvent.timestamp), 'MMM dd, yyyy HH:mm')}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
                {reservesData.maxReserveEvent && (
                  <Card className="border-green-200 bg-green-50/50 dark:bg-green-950/20">
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-3">
                        <Zap className="w-5 h-5 text-green-600 mt-0.5" />
                        <div>
                          <p className="font-medium text-green-800 dark:text-green-200">Maximum Reserve Event</p>
                          <p className="text-2xl font-bold text-green-600">
                            {formatNumber(reservesData.maxReserveEvent.reserve)} MW
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {format(new Date(reservesData.maxReserveEvent.timestamp), 'MMM dd, yyyy HH:mm')}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

            {/* Reserves Historical Chart */}
            {reservesChartData.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Operating Reserves Trend</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={reservesChartData}>
                        <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                        <XAxis dataKey="date" fontSize={12} />
                        <YAxis fontSize={12} />
                        <Tooltip 
                          formatter={(value: number, name: string) => [
                            `${formatNumber(value)} MW`,
                            name === 'spinning' ? 'Spinning' : name === 'supplemental' ? 'Supplemental' : 'Total'
                          ]}
                        />
                        <Legend />
                        <Area 
                          type="monotone" 
                          dataKey="spinning" 
                          stackId="1"
                          stroke="hsl(var(--primary))" 
                          fill="hsl(var(--primary))" 
                          fillOpacity={0.6}
                          name="Spinning"
                        />
                        <Area 
                          type="monotone" 
                          dataKey="supplemental" 
                          stackId="1"
                          stroke="hsl(217, 91%, 60%)" 
                          fill="hsl(217, 91%, 60%)" 
                          fillOpacity={0.4}
                          name="Supplemental"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>

      {/* Transmission Charge Calculator */}
      <div className="space-y-4 pt-6 border-t">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Calculator className="w-5 h-5 text-purple-600" />
          Transmission Charge Calculator
        </h3>

        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label htmlFor="demandMW">Your Peak Demand (MW)</Label>
                <div className="flex gap-2">
                  <Input
                    id="demandMW"
                    type="number"
                    value={demandMW}
                    onChange={(e) => setDemandMW(e.target.value)}
                    placeholder="e.g., 50"
                    className="flex-1"
                  />
                  <Button onClick={handleCalculateTransmission}>
                    Calculate
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Enter your facility's expected demand during system peak hours
                </p>
              </div>

              {transmissionChargeResult && (
                <>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-muted-foreground">Per MWh Cost</p>
                      <p className="text-xl font-bold">{formatCurrency(transmissionChargeResult.perMWhCost)}/MWh</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Monthly Estimate</p>
                      <p className="text-xl font-bold">{formatCurrency(transmissionChargeResult.monthlyCost)}</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-muted-foreground">Annual Estimate</p>
                      <p className="text-xl font-bold text-primary">{formatCurrency(transmissionChargeResult.annualCost)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">12CP Demand Charges</p>
                      <p className="text-xl font-bold">{formatCurrency(transmissionChargeResult.demandCharge)}</p>
                    </div>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
