import React, { useState, useEffect } from 'react';
import { useCurrencyConversion } from '@/hooks/useCurrencyConversion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  BarChart3,
  Calendar,
  Settings,
  TrendingUp,
  Clock,
  DollarSign,
  Activity
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export function AESOAnalyticsDashboard() {
  const { toast } = useToast();
  const { convertCADtoUSD, formatCurrency: formatCurrencyUSD, exchangeRate: liveExchangeRate } = useCurrencyConversion();
  
  // State for 5-year analytics
  const [fiveYearData, setFiveYearData] = useState<any | null>(null);
  const [loadingFiveYear, setLoadingFiveYear] = useState(false);
  const [analyticsViewPeriod, setAnalyticsViewPeriod] = useState<'monthly' | 'quarterly' | 'yearly' | 'all'>('yearly');
  const [globalUptime, setGlobalUptime] = useState('95.0');

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-CA', {
      style: 'currency',
      currency: 'CAD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  // Fetch 5-year historical data
  const fetchFiveYearData = async () => {
    setLoadingFiveYear(true);
    try {
      const { data, error } = await supabase.functions.invoke('aeso-historical-pricing', {
        body: { timeframe: 'fiveyear' }
      });

      if (error) throw error;

      if (data.error) {
        throw new Error(data.error);
      } else {
        setFiveYearData(data);
        
        toast({
          title: "5-year data loaded",
          description: "Historical pricing data for 5 years updated",
        });
      }
    } catch (error: any) {
      console.error('Error fetching 5-year data:', error);
      
      toast({
        title: "Error loading data",
        description: "Failed to fetch 5-year pricing data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoadingFiveYear(false);
    }
  };

  // Helper functions for analytics
  const calculateOptimizedPrice = (originalPrice: number) => {
    const downtimePercent = (100 - parseFloat(globalUptime)) / 100;
    // Simulate removing the most expensive hours
    return originalPrice * (1 - downtimePercent * 0.7); // Estimate 70% of downtime removes expensive hours
  };

  const calculateTotalHours = () => {
    return fiveYearData?.rawHourlyData?.length || 0;
  };

  const calculateDowntimeHours = () => {
    const totalHours = calculateTotalHours();
    return Math.floor(totalHours * (100 - parseFloat(globalUptime)) / 100);
  };

  const calculateTotalSavings = () => {
    if (!fiveYearData?.statistics?.average) return 0;
    const originalPrice = fiveYearData.statistics.average;
    const optimizedPrice = calculateOptimizedPrice(originalPrice);
    const totalHours = calculateTotalHours();
    return (originalPrice - optimizedPrice) * totalHours;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-blue-600" />
            5-Year Interactive Pricing Dashboard
          </h3>
          <p className="text-sm text-muted-foreground">
            Load and analyze up to 5 years of historical pricing data with uptime optimization
          </p>
        </div>
        <Button 
          onClick={fetchFiveYearData} 
          disabled={loadingFiveYear}
          variant="outline"
          size="sm"
        >
          <Calendar className="w-4 h-4 mr-2" />
          {loadingFiveYear ? 'Loading 5-Year Data...' : 'Load 5-Year Data'}
        </Button>
      </div>

      {fiveYearData ? (
        <div className="space-y-6">
          {/* Uptime Control */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-4 h-4 text-purple-600" />
                Global Uptime Optimization
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Adjust uptime target across the entire 5-year period
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Target Uptime (%)</label>
                  <input
                    type="number"
                    value={globalUptime}
                    onChange={(e) => setGlobalUptime(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="80"
                    max="99.9"
                    step="0.1"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Optimization applied across entire dataset
                  </p>
                </div>
                
                <div>
                  <label className="text-sm font-medium">Analysis Period</label>
                  <Select value={analyticsViewPeriod} onValueChange={(value: any) => setAnalyticsViewPeriod(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="yearly">Yearly Trends</SelectItem>
                      <SelectItem value="monthly">Monthly Patterns</SelectItem>
                      <SelectItem value="all">Complete 5-Year View</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Key Metrics Dashboard */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <TrendingUp className="w-4 h-4 text-green-600" />
                  Optimized Avg Price
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {fiveYearData?.statistics?.average ? formatCurrency(calculateOptimizedPrice(fiveYearData.statistics.average)) : '—'}
                </div>
                <p className="text-xs text-muted-foreground">
                  With {globalUptime}% uptime
                </p>
                <div className="text-sm text-muted-foreground mt-1">
                  Original: {fiveYearData?.statistics?.average ? formatCurrency(fiveYearData.statistics.average) : '—'}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Clock className="w-4 h-4 text-orange-600" />
                  Downtime Hours
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">
                  {calculateDowntimeHours().toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">
                  Total hours avoided
                </p>
                <div className="text-sm text-muted-foreground mt-1">
                  {((100 - parseFloat(globalUptime)) * 100 / 100).toFixed(1)}% downtime
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <DollarSign className="w-4 h-4 text-blue-600" />
                  Estimated Savings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {formatCurrency(calculateTotalSavings())}
                </div>
                <p className="text-xs text-muted-foreground">
                  5-year total savings
                </p>
                <div className="text-sm text-muted-foreground mt-1">
                  {liveExchangeRate ? formatCurrencyUSD(convertCADtoUSD(calculateTotalSavings()), 'USD') : 'Loading USD...'}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Activity className="w-4 h-4 text-purple-600" />
                  Data Points
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">
                  {calculateTotalHours().toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">
                  Hours of data analyzed
                </p>
                <div className="text-sm text-muted-foreground mt-1">
                  {fiveYearData?.statistics?.volatility ? `${fiveYearData.statistics.volatility.toFixed(1)}% volatility` : 'Processing...'}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Interactive Chart Placeholder */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-blue-600" />
                5-Year Price Analysis
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Interactive visualization showing original vs optimized pricing patterns
              </p>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center bg-muted/20 rounded-lg">
                <div className="text-center space-y-2">
                  <BarChart3 className="w-12 h-12 text-muted-foreground mx-auto" />
                  <p className="text-muted-foreground">Interactive charts coming soon</p>
                  <p className="text-sm text-muted-foreground">
                    Data loaded: {fiveYearData?.rawHourlyData?.length || 0} hourly data points
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <Card>
          <CardContent className="py-16">
            <div className="text-center space-y-4">
              <BarChart3 className="w-16 h-16 text-muted-foreground mx-auto" />
              <h3 className="text-lg font-semibold">5-Year Historical Data Not Loaded</h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                Click "Load 5-Year Data" to fetch comprehensive historical pricing data for advanced analytics and uptime optimization
              </p>
              <div className="text-sm text-muted-foreground">
                <p>• View pricing trends across years, months, and days</p>
                <p>• Optimize uptime across the entire time period</p>
                <p>• Interactive visualization and comparison tools</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default AESOAnalyticsDashboard;