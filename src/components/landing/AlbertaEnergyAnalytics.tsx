import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Zap, Wind, DollarSign, Activity } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { applyMonthlyUptimeFilter } from '@/utils/uptimeFilter';

interface YearAnalytics {
  averagePrice: number | null;
  minPrice: number | null;
  maxPrice: number | null;
  medianPrice: number | null;
  totalHours: number;
  loading: boolean;
  error: string | null;
}

export const AlbertaEnergyAnalytics = () => {
  const [analytics, setAnalytics] = useState<YearAnalytics>({
    averagePrice: null,
    minPrice: null,
    maxPrice: null,
    medianPrice: null,
    totalHours: 0,
    loading: true,
    error: null
  });

  useEffect(() => {
    fetchYearData();
  }, []);

  const fetchYearData = async () => {
    setAnalytics(prev => ({ ...prev, loading: true, error: null }));

    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setFullYear(endDate.getFullYear() - 1); // Past 1 year

      console.log(`Fetching Alberta energy data for past year (${startDate.toISOString().split('T')[0]} to ${endDate.toISOString().split('T')[0]})`);

      const { data, error } = await supabase.functions.invoke('aeso-historical-pricing', {
        body: {
          timeframe: 'custom',
          startDate: startDate.toISOString().split('T')[0],
          endDate: endDate.toISOString().split('T')[0]
        }
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      const hourlyData = data?.rawHourlyData || data?.chartData || [];
      
      if (hourlyData.length === 0) {
        throw new Error('No data available for this period');
      }

      const formattedData = hourlyData.map((item: any) => ({
        ts: item.datetime || item.date,
        price: item.price
      }));

      // Apply 95% uptime filter
      const filtered = applyMonthlyUptimeFilter(formattedData, 95);
      
      const prices = filtered.filteredData.map(d => d.price);
      const sortedPrices = [...prices].sort((a, b) => a - b);
      
      const average = prices.length > 0
        ? prices.reduce((sum, p) => sum + p, 0) / prices.length
        : null;

      setAnalytics({
        averagePrice: average,
        minPrice: Math.min(...prices),
        maxPrice: Math.max(...prices),
        medianPrice: sortedPrices[Math.floor(sortedPrices.length / 2)] || null,
        totalHours: filtered.filteredData.length,
        loading: false,
        error: null
      });

      console.log(`Analytics loaded: Avg $${average?.toFixed(2)}, ${filtered.filteredData.length} hours`);

    } catch (error: any) {
      console.error('Error fetching Alberta energy data:', error);
      setAnalytics(prev => ({
        ...prev,
        loading: false,
        error: error.message || 'Failed to load data'
      }));
    }
  };

  const StatCard = ({ 
    icon: Icon, 
    title, 
    value, 
    unit, 
    subtitle 
  }: { 
    icon: any; 
    title: string; 
    value: number | null; 
    unit: string;
    subtitle?: string;
  }) => (
    <Card className="border-slate-700/50 bg-slate-800/30 backdrop-blur-sm hover:border-electric-blue/50 transition-all hover:shadow-lg hover:shadow-electric-blue/10">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-electric-blue/10 rounded-lg">
            <Icon className="w-4 h-4 text-electric-blue" />
          </div>
          <CardTitle className="text-sm text-slate-300">{title}</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        {analytics.loading ? (
          <div className="h-8 bg-slate-700/30 animate-pulse rounded"></div>
        ) : analytics.error ? (
          <p className="text-sm text-red-400">Error</p>
        ) : (
          <div className="space-y-1">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-bold text-white">
                {value !== null ? value.toFixed(2) : '—'}
              </span>
              <span className="text-sm text-slate-400">{unit}</span>
            </div>
            {subtitle && (
              <p className="text-xs text-slate-500">{subtitle}</p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-4">
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2">
          <Activity className="w-5 h-5 text-electric-blue" />
          <h3 className="text-xl sm:text-2xl font-bold text-white">
            Alberta Energy Market Analytics
          </h3>
        </div>
        <div className="flex items-center justify-center gap-2">
          <Badge variant="outline" className="bg-electric-blue/10 text-electric-blue border-electric-blue/30">
            Past 12 Months
          </Badge>
          <Badge variant="outline" className="bg-neon-green/10 text-neon-green border-neon-green/30">
            95% Uptime Filter
          </Badge>
        </div>
        <p className="text-sm text-slate-400">
          Real-time data from Alberta Electric System Operator (AESO)
        </p>
      </div>

      {analytics.error && (
        <Card className="border-red-500/30 bg-red-950/20">
          <CardContent className="py-4">
            <p className="text-sm text-red-400 text-center">{analytics.error}</p>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={DollarSign}
          title="Average Pool Price"
          value={analytics.averagePrice}
          unit="CAD/MWh"
          subtitle={analytics.totalHours > 0 ? `${analytics.totalHours.toLocaleString()} hours analyzed` : undefined}
        />
        
        <StatCard
          icon={TrendingUp}
          title="Median Price"
          value={analytics.medianPrice}
          unit="CAD/MWh"
          subtitle="Middle value of dataset"
        />
        
        <StatCard
          icon={Zap}
          title="Peak Price"
          value={analytics.maxPrice}
          unit="CAD/MWh"
          subtitle="Highest recorded price"
        />
        
        <StatCard
          icon={Wind}
          title="Base Price"
          value={analytics.minPrice}
          unit="CAD/MWh"
          subtitle="Lowest recorded price"
        />
      </div>

      <Card className="border-slate-700/50 bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm">
        <CardContent className="py-4">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-electric-blue/10 rounded-lg flex-shrink-0">
              <Activity className="w-5 h-5 text-electric-blue" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-white">
                Live Market Data Integration
              </p>
              <p className="text-xs text-slate-400 leading-relaxed">
                Our facility leverages Alberta's deregulated energy market to optimize operations in real-time. 
                The 95% uptime calculation removes the highest 5% of price spikes, providing a realistic baseline 
                for operational cost planning. With an average price of ${analytics.averagePrice?.toFixed(2) || '—'} CAD/MWh 
                over the past year, Alberta offers competitive energy rates for high-performance computing workloads.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
