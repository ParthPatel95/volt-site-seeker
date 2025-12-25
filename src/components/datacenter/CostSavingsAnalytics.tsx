import React, { useState } from 'react';
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
  PiggyBank
} from 'lucide-react';
import { AutomationAnalytics } from '@/hooks/useDatacenterAutomation';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';
import { cn } from '@/lib/utils';

interface CostSavingsAnalyticsProps {
  analytics: AutomationAnalytics | null;
  onRefresh: (days: number) => void;
}

export function CostSavingsAnalytics({ analytics, onRefresh }: CostSavingsAnalyticsProps) {
  const [periodDays, setPeriodDays] = useState(30);

  const handlePeriodChange = (value: string) => {
    const days = parseInt(value);
    setPeriodDays(days);
    onRefresh(days);
  };

  // Calculate derived metrics
  const avgSavingsPerShutdown = analytics && analytics.total_shutdowns > 0 
    ? analytics.total_savings_cad / analytics.total_shutdowns 
    : 0;

  const uptimePercentage = analytics 
    ? ((periodDays * 24 - analytics.total_curtailment_hours) / (periodDays * 24)) * 100 
    : 100;

  // Mock data for charts (in production, this would come from the backend)
  const savingsOverTime = [
    { day: 'Mon', savings: 45, shutdowns: 1 },
    { day: 'Tue', savings: 120, shutdowns: 2 },
    { day: 'Wed', savings: 0, shutdowns: 0 },
    { day: 'Thu', savings: 85, shutdowns: 1 },
    { day: 'Fri', savings: 210, shutdowns: 3 },
    { day: 'Sat', savings: 35, shutdowns: 1 },
    { day: 'Sun', savings: 0, shutdowns: 0 },
  ];

  const priceDistribution = [
    { range: '$0-50', hours: 120, color: 'hsl(var(--chart-1))' },
    { range: '$50-100', hours: 85, color: 'hsl(var(--chart-2))' },
    { range: '$100-150', hours: 30, color: 'hsl(var(--chart-3))' },
    { range: '$150-200', hours: 12, color: 'hsl(var(--chart-4))' },
    { range: '$200+', hours: 5, color: 'hsl(var(--destructive))' },
  ];

  return (
    <div className="space-y-6">
      {/* Period Selector */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Cost Savings Analytics</h3>
          <p className="text-sm text-muted-foreground">
            Financial impact of automated load shedding
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
          <Button variant="outline" size="icon" onClick={() => onRefresh(periodDays)}>
            <RefreshCw className="w-4 h-4" />
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
                  CA${analytics?.total_savings_cad.toFixed(0) || '0'}
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  Estimated value retained
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
                  {analytics?.total_curtailment_hours.toFixed(1) || 0}h curtailed
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
                  CA${analytics?.average_price_avoided_cad.toFixed(0) || '0'}
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
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={savingsOverTime}>
                  <defs>
                    <linearGradient id="savingsGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                    formatter={(value: number) => [`CA$${value}`, 'Savings']}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="savings" 
                    stroke="hsl(var(--chart-1))" 
                    fill="url(#savingsGradient)" 
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
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
                -{analytics?.total_curtailment_hours.toFixed(1) || 0}h
              </p>
              <p className="text-xs text-muted-foreground">Reduced operating hours</p>
            </div>
            <div className="text-center p-4 bg-card rounded-lg border">
              <p className="text-sm text-muted-foreground mb-2">Cost Avoided</p>
              <p className="text-2xl font-bold text-green-500">
                +CA${analytics?.total_savings_cad.toFixed(0) || 0}
              </p>
              <p className="text-xs text-muted-foreground">High-price period savings</p>
            </div>
            <div className="text-center p-4 bg-card rounded-lg border">
              <p className="text-sm text-muted-foreground mb-2">Net Benefit</p>
              <p className="text-2xl font-bold text-primary">
                CA${((analytics?.total_savings_cad || 0) * 0.85).toFixed(0)}
              </p>
              <p className="text-xs text-muted-foreground">Estimated after revenue loss</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
