import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, DollarSign, TrendingUp, TrendingDown, PieChart } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, Area, AreaChart } from 'recharts';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface RevenueData {
  date: string;
  revenue: number;
  cost: number;
  profit: number;
  margin: number;
}

interface CategoryBreakdown {
  category: string;
  value: number;
  percentage: number;
}

export function RevenueCostAnalysisWidget() {
  const [loading, setLoading] = useState(true);
  const [revenueData, setRevenueData] = useState<RevenueData[]>([]);
  const [revenueBreakdown, setRevenueBreakdown] = useState<CategoryBreakdown[]>([]);
  const [costBreakdown, setCostBreakdown] = useState<CategoryBreakdown[]>([]);
  const [metrics, setMetrics] = useState({
    totalRevenue: 0,
    totalCost: 0,
    totalProfit: 0,
    avgMargin: 0,
    trend: 0,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);

    // Fetch last 30 days of pricing data
    const { data: priceData } = await supabase
      .from('aeso_training_data')
      .select('pool_price, ail_mw, timestamp')
      .order('timestamp', { ascending: false })
      .limit(720);

    if (priceData && priceData.length > 0) {
      // Assume 100 MW capacity and $45/MWh operating cost
      const capacity = 100;
      const operatingCost = 45;

      // Group by day
      const dailyData: Record<string, { revenue: number; cost: number; hours: number }> = {};

      priceData.forEach((record) => {
        const date = new Date(record.timestamp).toISOString().split('T')[0];
        if (!dailyData[date]) {
          dailyData[date] = { revenue: 0, cost: 0, hours: 0 };
        }

        const price = record.pool_price || 0;
        if (price > operatingCost) {
          dailyData[date].revenue += price * capacity;
          dailyData[date].cost += operatingCost * capacity;
          dailyData[date].hours++;
        }
      });

      const chartData: RevenueData[] = Object.entries(dailyData)
        .map(([date, data]) => ({
          date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          revenue: Math.round(data.revenue),
          cost: Math.round(data.cost),
          profit: Math.round(data.revenue - data.cost),
          margin: data.revenue > 0 ? Math.round(((data.revenue - data.cost) / data.revenue) * 100) : 0,
        }))
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        .slice(-30);

      setRevenueData(chartData);

      // Calculate metrics
      const totalRev = chartData.reduce((sum, d) => sum + d.revenue, 0);
      const totalCst = chartData.reduce((sum, d) => sum + d.cost, 0);
      const totalPft = totalRev - totalCst;
      const avgMgn = chartData.length > 0 ? chartData.reduce((sum, d) => sum + d.margin, 0) / chartData.length : 0;

      // Calculate trend (simple: last week vs previous week)
      const lastWeek = chartData.slice(-7);
      const prevWeek = chartData.slice(-14, -7);
      const lastWeekProfit = lastWeek.reduce((sum, d) => sum + d.profit, 0);
      const prevWeekProfit = prevWeek.reduce((sum, d) => sum + d.profit, 0);
      const trend = prevWeekProfit > 0 ? ((lastWeekProfit - prevWeekProfit) / prevWeekProfit) * 100 : 0;

      setMetrics({
        totalRevenue: totalRev,
        totalCost: totalCst,
        totalProfit: totalPft,
        avgMargin: Math.round(avgMgn),
        trend: Math.round(trend),
      });

      // Revenue breakdown by time of day
      const hourlyRevenue: Record<string, number> = {};
      priceData.forEach((record) => {
        const hour = new Date(record.timestamp).getHours();
        const period = hour >= 6 && hour < 18 ? 'Daytime (6am-6pm)' : 
                      hour >= 18 && hour < 22 ? 'Peak Evening (6pm-10pm)' : 'Overnight';
        if (!hourlyRevenue[period]) hourlyRevenue[period] = 0;
        if ((record.pool_price || 0) > operatingCost) {
          hourlyRevenue[period] += (record.pool_price || 0) * capacity;
        }
      });

      const totalHourlyRev = Object.values(hourlyRevenue).reduce((sum, v) => sum + v, 0);
      const revBreakdown: CategoryBreakdown[] = Object.entries(hourlyRevenue).map(([category, value]) => ({
        category,
        value: Math.round(value),
        percentage: totalHourlyRev > 0 ? Math.round((value / totalHourlyRev) * 100) : 0,
      }));
      setRevenueBreakdown(revBreakdown);

      // Cost breakdown
      const costBreakdown: CategoryBreakdown[] = [
        { category: 'Operating Costs', value: Math.round(totalCst * 0.7), percentage: 70 },
        { category: 'Maintenance', value: Math.round(totalCst * 0.15), percentage: 15 },
        { category: 'Grid Fees', value: Math.round(totalCst * 0.10), percentage: 10 },
        { category: 'Other', value: Math.round(totalCst * 0.05), percentage: 5 },
      ];
      setCostBreakdown(costBreakdown);
    }

    setLoading(false);
  };

  if (loading) {
    return (
      <Card className="h-full flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5" />
          Revenue & Cost Analysis
        </CardTitle>
        <CardDescription>
          Financial performance overview for the last 30 days
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs text-muted-foreground">Total Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-500">
                ${(metrics.totalRevenue / 1000).toFixed(1)}k
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs text-muted-foreground">Total Cost</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-500">
                ${(metrics.totalCost / 1000).toFixed(1)}k
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs text-muted-foreground">Net Profit</CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${metrics.totalProfit > 0 ? 'text-green-500' : 'text-red-500'}`}>
                ${(metrics.totalProfit / 1000).toFixed(1)}k
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs text-muted-foreground">Avg Margin</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold">{metrics.avgMargin}%</span>
                {metrics.trend !== 0 && (
                  <span className={`text-xs flex items-center ${metrics.trend > 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {metrics.trend > 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                    {Math.abs(metrics.trend)}%
                  </span>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="trends" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="trends">Trends</TabsTrigger>
            <TabsTrigger value="revenue">Revenue</TabsTrigger>
            <TabsTrigger value="costs">Costs</TabsTrigger>
          </TabsList>

          <TabsContent value="trends" className="space-y-4">
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorCost" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--destructive))" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="hsl(var(--destructive))" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="date" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '6px',
                  }}
                />
                <Legend />
                <Area type="monotone" dataKey="revenue" stroke="hsl(var(--chart-1))" fillOpacity={1} fill="url(#colorRevenue)" name="Revenue" />
                <Area type="monotone" dataKey="cost" stroke="hsl(var(--destructive))" fillOpacity={1} fill="url(#colorCost)" name="Cost" />
              </AreaChart>
            </ResponsiveContainer>

            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="date" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '6px',
                  }}
                />
                <Legend />
                <Line type="monotone" dataKey="profit" stroke="hsl(var(--chart-2))" strokeWidth={2} name="Daily Profit" />
              </LineChart>
            </ResponsiveContainer>
          </TabsContent>

          <TabsContent value="revenue" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <h4 className="text-sm font-semibold">Revenue by Time Period</h4>
                {revenueBreakdown.map((item) => (
                  <div key={item.category} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>{item.category}</span>
                      <span className="font-semibold">${(item.value / 1000).toFixed(1)}k ({item.percentage}%)</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary transition-all"
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={revenueBreakdown}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="category" className="text-xs" angle={-45} textAnchor="end" height={80} />
                  <YAxis className="text-xs" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '6px',
                    }}
                  />
                  <Bar dataKey="value" fill="hsl(var(--primary))" name="Revenue ($)" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>

          <TabsContent value="costs" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <h4 className="text-sm font-semibold">Cost Breakdown</h4>
                {costBreakdown.map((item) => (
                  <div key={item.category} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>{item.category}</span>
                      <span className="font-semibold">${(item.value / 1000).toFixed(1)}k ({item.percentage}%)</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-destructive transition-all"
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={costBreakdown}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="category" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '6px',
                    }}
                  />
                  <Bar dataKey="value" fill="hsl(var(--destructive))" name="Cost ($)" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
