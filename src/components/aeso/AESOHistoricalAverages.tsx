import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, TrendingUp, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { applyMonthlyUptimeFilter } from '@/utils/uptimeFilter';
import { AESOHistoricalDetailDialog } from './AESOHistoricalDetailDialog';

interface PeriodData {
  period: string;
  days: number;
  average: number | null;
  dataPoints: number;
  loading: boolean;
  error: string | null;
  detailedData?: {
    allHourlyData: Array<{ ts: string; price: number }>;
    removedHours: Array<{ ts: string; price: number }>;
    stats: {
      min: number;
      max: number;
      median: number;
      stdDev: number;
      totalMWh: number;
    };
  };
}

export function AESOHistoricalAverages() {
  const [periods, setPeriods] = useState<PeriodData[]>([
    { period: '90 Days', days: 90, average: null, dataPoints: 0, loading: false, error: null },
    { period: '180 Days', days: 180, average: null, dataPoints: 0, loading: false, error: null },
    { period: '1 Year', days: 365, average: null, dataPoints: 0, loading: false, error: null },
    { period: '2 Years', days: 730, average: null, dataPoints: 0, loading: false, error: null },
  ]);
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodData | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const fetchPeriodData = async (index: number) => {
    const period = periods[index];
    
    // Update loading state
    setPeriods(prev => prev.map((p, i) => 
      i === index ? { ...p, loading: true, error: null } : p
    ));

    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - period.days);

      console.log(`Fetching ${period.period} data (${startDate.toISOString().split('T')[0]} to ${endDate.toISOString().split('T')[0]})`);

      const { data, error } = await supabase.functions.invoke('aeso-historical-pricing', {
        body: {
          timeframe: 'custom',
          startDate: startDate.toISOString().split('T')[0],
          endDate: endDate.toISOString().split('T')[0]
        }
      });

      if (error) throw error;

      if (data?.error) {
        throw new Error(data.error);
      }

      // Extract hourly data
      const hourlyData = data?.rawHourlyData || data?.chartData || [];
      
      if (hourlyData.length === 0) {
        throw new Error('No data available for this period');
      }

      // Convert to format expected by uptime filter
      const formattedData = hourlyData.map((item: any) => ({
        ts: item.datetime || item.date,
        price: item.price
      }));

      console.log(`Received ${formattedData.length} data points for ${period.period}`);

      // Apply 95% uptime filter
      const filtered = applyMonthlyUptimeFilter(formattedData, 95);
      
      // Calculate average
      const average = filtered.filteredData.length > 0
        ? filtered.filteredData.reduce((sum, d) => sum + d.price, 0) / filtered.filteredData.length
        : null;

      // Calculate statistics
      const prices = filtered.filteredData.map(d => d.price);
      const sortedPrices = [...prices].sort((a, b) => a - b);
      const median = sortedPrices[Math.floor(sortedPrices.length / 2)] || 0;
      const mean = average || 0;
      const variance = prices.reduce((sum, p) => sum + Math.pow(p - mean, 2), 0) / prices.length;
      const stdDev = Math.sqrt(variance);

      console.log(`${period.period}: Average with 95% uptime = $${average?.toFixed(2)}, Data points: ${filtered.filteredData.length}, Removed: ${filtered.removedCount}`);

      // Update state with detailed data
      setPeriods(prev => prev.map((p, i) => 
        i === index ? { 
          ...p, 
          average, 
          dataPoints: filtered.filteredData.length,
          loading: false, 
          error: null,
          detailedData: {
            allHourlyData: filtered.filteredData,
            removedHours: filtered.removedData,
            stats: {
              min: Math.min(...prices),
              max: Math.max(...prices),
              median,
              stdDev,
              totalMWh: filtered.filteredData.length
            }
          }
        } : p
      ));

    } catch (error: any) {
      console.error(`Error fetching ${period.period} data:`, error);
      setPeriods(prev => prev.map((p, i) => 
        i === index ? { 
          ...p, 
          loading: false, 
          error: error.message || 'Failed to fetch data' 
        } : p
      ));
    }
  };

  const fetchAllPeriods = async () => {
    // Fetch all periods sequentially to avoid overwhelming the API
    for (let i = 0; i < periods.length; i++) {
      await fetchPeriodData(i);
    }
  };

  useEffect(() => {
    // Fetch all data on component mount
    fetchAllPeriods();
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            Historical Price Averages (95% Uptime)
          </h3>
          <p className="text-sm text-muted-foreground">
            Average pool prices with highest 5% of hours excluded
          </p>
        </div>
        <Button
          onClick={fetchAllPeriods}
          disabled={periods.some(p => p.loading)}
          variant="outline"
          size="sm"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${periods.some(p => p.loading) ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {periods.map((period, index) => (
          <Card 
            key={period.period}
            className="group relative overflow-hidden border hover:border-primary/30 transition-all duration-300 hover:shadow-lg cursor-pointer"
            onClick={() => {
              if (period.detailedData && !period.loading && !period.error) {
                setSelectedPeriod(period);
                setDialogOpen(true);
              }
            }}
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-primary/10 to-transparent rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <CardHeader className="relative pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold">{period.period}</CardTitle>
                {period.loading ? (
                  <Badge variant="outline" className="text-[10px] px-2 py-0.5">
                    <RefreshCw className="w-3 h-3 animate-spin" />
                  </Badge>
                ) : period.error ? (
                  <Badge variant="destructive" className="text-[10px] px-2 py-0.5">Error</Badge>
                ) : (
                  <Badge variant="outline" className="text-[10px] px-2 py-0.5">95%</Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="relative space-y-3">
              {period.loading ? (
                <div className="space-y-2">
                  <div className="h-8 bg-muted animate-pulse rounded"></div>
                  <div className="h-4 bg-muted animate-pulse rounded w-2/3"></div>
                </div>
              ) : period.error ? (
                <div className="space-y-2">
                  <p className="text-sm text-destructive">{period.error}</p>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-baseline gap-2">
                    <p className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                      ${period.average?.toFixed(2) || '—'}
                    </p>
                    <span className="text-sm text-muted-foreground">CAD/MWh</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <TrendingUp className="w-3 h-3" />
                    <span>{period.dataPoints.toLocaleString()} hours analyzed</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <AESOHistoricalDetailDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        data={selectedPeriod ? {
          period: selectedPeriod.period,
          days: selectedPeriod.days,
          average: selectedPeriod.average || 0,
          dataPoints: selectedPeriod.dataPoints,
          allHourlyData: selectedPeriod.detailedData?.allHourlyData || [],
          removedHours: selectedPeriod.detailedData?.removedHours || [],
          stats: selectedPeriod.detailedData?.stats || {
            min: 0,
            max: 0,
            median: 0,
            stdDev: 0,
            totalMWh: 0
          }
        } : null}
      />
    </div>
  );
}
