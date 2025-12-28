import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  DollarSign, 
  TrendingUp,
  TrendingDown,
  Clock,
  Zap,
  BarChart3,
  RefreshCw,
  PiggyBank,
  Calendar
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { AutomationAnalytics, AutomationLog } from '@/hooks/useDatacenterAutomation';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  Cell,
  ComposedChart,
  Line
} from 'recharts';
import { cn } from '@/lib/utils';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';

interface RealTimeAnalyticsProps {
  analytics: AutomationAnalytics | null;
  onRefresh: (days: number) => void;
}

// Use actual database schema
interface CostSavingsDbRecord {
  id: string;
  period_start: string;
  period_end: string;
  total_savings_cad: number;
  shutdown_count: number;
  total_curtailment_hours: number;
  peak_price_avoided_cad: number;
  average_price_avoided_cad: number;
  uptime_percentage: number;
  created_at: string;
}

interface DailySavings {
  date: string;
  savings: number;
  shutdowns: number;
  curtailmentHours: number;
}

export function RealTimeAnalytics({ analytics, onRefresh }: RealTimeAnalyticsProps) {
  const [periodDays, setPeriodDays] = useState(30);
  const [savingsData, setSavingsData] = useState<DailySavings[]>([]);
  const [priceDistribution, setPriceDistribution] = useState<{range: string; hours: number; color: string}[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch real data from database
  useEffect(() => {
    fetchRealData();
  }, [periodDays]);

  const fetchRealData = async () => {
    setLoading(true);
    try {
      const startDate = subDays(new Date(), periodDays);
      
      // Fetch cost savings data
      const { data: costData, error: costError } = await supabase
        .from('datacenter_cost_savings')
        .select('*')
        .gte('period_start', startDate.toISOString())
        .order('period_start', { ascending: true });

      if (!costError && costData) {
        const dailyData: DailySavings[] = costData.map((record) => ({
          date: format(new Date(record.period_start), 'MMM dd'),
          savings: record.total_savings_cad || 0,
          shutdowns: record.shutdown_count || 0,
          curtailmentHours: record.total_curtailment_hours || 0,
        }));
        setSavingsData(dailyData);
      }

      // Fetch price distribution from training data
      const { data: priceData, error: priceError } = await supabase
        .from('aeso_training_data')
        .select('pool_price')
        .gte('timestamp', startDate.toISOString())
        .not('pool_price', 'is', null);

      if (!priceError && priceData) {
        const distribution = calculatePriceDistribution(priceData.map(p => p.pool_price));
        setPriceDistribution(distribution);
      }
    } catch (error) {
      console.error('Error fetching analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculatePriceDistribution = (prices: number[]) => {
    const ranges = [
      { min: 0, max: 50, label: '$0-50', color: 'hsl(var(--chart-1))' },
      { min: 50, max: 100, label: '$50-100', color: 'hsl(var(--chart-2))' },
      { min: 100, max: 150, label: '$100-150', color: 'hsl(var(--chart-3))' },
      { min: 150, max: 200, label: '$150-200', color: 'hsl(var(--chart-4))' },
      { min: 200, max: Infinity, label: '$200+', color: 'hsl(var(--destructive))' },
    ];

    return ranges.map(range => ({
      range: range.label,
      hours: prices.filter(p => p >= range.min && p < range.max).length,
      color: range.color,
    }));
  };

  const handlePeriodChange = (value: string) => {
    const days = parseInt(value);
    setPeriodDays(days);
    onRefresh(days);
  };

  // Calculate derived metrics
  const totalSavings = savingsData.reduce((sum, d) => sum + d.savings, 0);
  const totalShutdowns = savingsData.reduce((sum, d) => sum + d.shutdowns, 0);
  const avgSavingsPerShutdown = totalShutdowns > 0 ? totalSavings / totalShutdowns : 0;
  const totalCurtailmentHours = savingsData.reduce((sum, d) => sum + d.curtailmentHours, 0);
  const uptimePercentage = ((periodDays * 24 - totalCurtailmentHours) / (periodDays * 24)) * 100;

  // Use analytics for average price avoided if available
  const avgPriceAvoided = analytics?.average_price_avoided_cad || 0;

  return (
    <div className="space-y-6">
      {/* Period Selector */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Cost Savings Analytics</h3>
          <p className="text-sm text-muted-foreground">
            Real financial impact of automated load shedding
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={periodDays.toString()} onValueChange={handlePeriodChange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon" onClick={() => fetchRealData()} disabled={loading}>
            <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-green-500/10 to-green-600/5 border-green-500/20">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Savings</p>
                <p className="text-3xl font-bold text-green-500 mt-1">
                  CA${totalSavings.toFixed(0)}
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  {totalShutdowns} shutdown events
                </p>
              </div>
              <div className="p-3 rounded-full bg-green-500/10">
                <PiggyBank className="w-6 h-6 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Savings/Event</p>
                <p className="text-3xl font-bold mt-1">
                  CA${avgSavingsPerShutdown.toFixed(0)}
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  Per shutdown action
                </p>
              </div>
              <div className="p-3 rounded-full bg-primary/10">
                <DollarSign className="w-6 h-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">System Uptime</p>
                <p className={cn(
                  "text-3xl font-bold mt-1",
                  uptimePercentage >= 95 ? "text-green-500" : uptimePercentage >= 90 ? "text-yellow-500" : "text-destructive"
                )}>
                  {uptimePercentage.toFixed(1)}%
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  {totalCurtailmentHours.toFixed(1)}h curtailed
                </p>
              </div>
              <div className="p-3 rounded-full bg-muted">
                <Clock className="w-6 h-6 text-muted-foreground" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Price Avoided</p>
                <p className="text-3xl font-bold text-orange-500 mt-1">
                  CA${avgPriceAvoided.toFixed(0)}
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  Peak price mitigation
                </p>
              </div>
              <div className="p-3 rounded-full bg-orange-500/10">
                <TrendingDown className="w-6 h-6 text-orange-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Savings Over Time */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Savings Over Time
              {savingsData.length === 0 && <Badge variant="secondary">No data yet</Badge>}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              {savingsData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={savingsData}>
                    <defs>
                      <linearGradient id="savingsGradientReal" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} yAxisId="left" />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} yAxisId="right" orientation="right" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                      formatter={(value: number, name: string) => [
                        name === 'savings' ? `CA$${value}` : value,
                        name === 'savings' ? 'Savings' : 'Shutdowns'
                      ]}
                    />
                    <Area 
                      yAxisId="left"
                      type="monotone" 
                      dataKey="savings" 
                      stroke="hsl(var(--chart-1))" 
                      fill="url(#savingsGradientReal)" 
                      strokeWidth={2}
                    />
                    <Line 
                      yAxisId="right"
                      type="monotone" 
                      dataKey="shutdowns" 
                      stroke="#f59e0b" 
                      strokeWidth={2}
                      dot={{ r: 3 }}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground">
                  <div className="text-center">
                    <Calendar className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>No savings data recorded yet</p>
                    <p className="text-xs">Data will appear after automation events</p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Price Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Operating Hours by Price Range
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={priceDistribution}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="range" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} label={{ value: 'Hours', angle: -90, position: 'insideLeft' }} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                    formatter={(value: number) => [`${value} hours`, 'Operating Time']}
                  />
                  <Bar dataKey="hours" radius={[4, 4, 0, 0]}>
                    {priceDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ROI Summary */}
      <Card className="bg-gradient-to-r from-primary/5 via-transparent to-green-500/5">
        <CardHeader>
          <CardTitle className="text-base">Return on Investment Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-card rounded-lg border">
              <p className="text-sm text-muted-foreground mb-2">Revenue Impact</p>
              <p className="text-2xl font-bold">
                -{totalCurtailmentHours.toFixed(1)}h
              </p>
              <p className="text-xs text-muted-foreground">Reduced operating hours</p>
            </div>
            <div className="text-center p-4 bg-card rounded-lg border">
              <p className="text-sm text-muted-foreground mb-2">Cost Avoided</p>
              <p className="text-2xl font-bold text-green-500">
                +CA${totalSavings.toFixed(0)}
              </p>
              <p className="text-xs text-muted-foreground">High-price period savings</p>
            </div>
            <div className="text-center p-4 bg-card rounded-lg border">
              <p className="text-sm text-muted-foreground mb-2">Net Benefit</p>
              <p className="text-2xl font-bold text-primary">
                CA${(totalSavings * 0.85).toFixed(0)}
              </p>
              <p className="text-xs text-muted-foreground">Estimated after revenue loss</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
