import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Zap, Wind, DollarSign, Activity, MapPin, Snowflake, Cable, Globe } from 'lucide-react';
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

const locationBenefits = [
  {
    icon: DollarSign,
    title: 'Competitive Energy Pricing',
    description: 'Deregulated market with wholesale rates',
    color: 'watt-success'
  },
  {
    icon: Snowflake,
    title: 'Cold Climate Advantage',
    description: 'Natural cooling reduces operational costs',
    color: 'watt-trust'
  },
  {
    icon: Cable,
    title: 'Fiber Connectivity',
    description: 'Trans-continental fiber route access',
    color: 'watt-bitcoin'
  },
  {
    icon: Globe,
    title: 'Political Stability',
    description: 'Canadian jurisdiction with strong rule of law',
    color: 'watt-trust'
  }
];

export const StrategicMarketAnalytics = () => {
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
      startDate.setFullYear(endDate.getFullYear() - 1);

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
    <Card className="border-gray-200 bg-white backdrop-blur-sm hover:border-watt-trust/40 transition-all hover:shadow-institutional-lg">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-watt-trust/10 rounded-lg">
            <Icon className="w-4 h-4 text-watt-trust" />
          </div>
          <CardTitle className="text-xs sm:text-sm text-watt-navy/70 font-medium">{title}</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        {analytics.loading ? (
          <div className="h-8 bg-watt-light animate-pulse rounded" />
        ) : analytics.error ? (
          <p className="text-xs sm:text-sm text-red-500">Error</p>
        ) : (
          <div className="space-y-1">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-semibold text-watt-navy">
                {value !== null ? value.toFixed(2) : '—'}
              </span>
              <span className="text-xs sm:text-sm text-watt-navy/60">{unit}</span>
            </div>
            {subtitle && (
              <p className="text-[11px] sm:text-xs text-watt-navy/60">{subtitle}</p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-12">
      {/* Section Header */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-3">
          <MapPin className="w-7 h-7 text-watt-success" />
          <h3 className="text-2xl sm:text-3xl font-semibold text-watt-navy">
            Strategic Market Analytics
          </h3>
        </div>
        <p className="text-xs sm:text-sm text-watt-navy/70 max-w-2xl mx-auto">
          Alberta's competitive advantages combined with real-time energy market intelligence
        </p>
      </div>

      {/* Location Benefits */}
      <div>
        <div className="flex items-center justify-center gap-2 mb-6">
          <Badge
            variant="outline"
            className="bg-watt-success/10 text-watt-success border-watt-success/30 text-[11px] sm:text-xs font-medium px-3 sm:px-4 py-1 rounded-full"
          >
            Location Advantages
          </Badge>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {locationBenefits.map((benefit, index) => {
            const colorClasses = {
              'watt-success': 'text-watt-success bg-watt-success/10 hover:border-watt-success/60',
              'watt-trust': 'text-watt-trust bg-watt-trust/10 hover:border-watt-trust/60',
              'watt-bitcoin': 'text-watt-bitcoin bg-watt-bitcoin/10 hover:border-watt-bitcoin/60'
            };
            
            return (
              <div 
                key={index} 
                className={`
                  group relative p-5 rounded-2xl 
                  bg-white
                  border border-gray-200
                  ${colorClasses[benefit.color as keyof typeof colorClasses]?.split(' ')[2]}
                  backdrop-blur-sm
                  transition-all duration-300
                  hover:-translate-y-1 hover:shadow-institutional-lg
                `}
                style={{
                  animationDelay: `${index * 100}ms`
                }}
              >
                <div className={`inline-flex items-center justify-center p-3 rounded-xl mb-3 ${colorClasses[benefit.color as keyof typeof colorClasses]?.split(' ')[1]}`}>
                  <benefit.icon className={`w-5 h-5 ${colorClasses[benefit.color as keyof typeof colorClasses]?.split(' ')[0]}`} />
                </div>
                
                <h4 className="text-base sm:text-lg font-semibold text-watt-navy mb-1.5">{benefit.title}</h4>
                <p className="text-xs sm:text-sm text-watt-navy/70 leading-relaxed">{benefit.description}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Energy Market Analytics */}
      <div>
        <div className="flex items-center justify-center gap-2 mb-5">
          <Badge
            variant="outline"
            className="bg-watt-trust/10 text-watt-trust border-watt-trust/30 text-[11px] sm:text-xs font-medium px-3 sm:px-4 py-1 rounded-full"
          >
            Past 12 Months
          </Badge>
          <Badge
            variant="outline"
            className="bg-watt-success/10 text-watt-success border-watt-success/30 text-[11px] sm:text-xs font-medium px-3 sm:px-4 py-1 rounded-full"
          >
            95% Uptime Filter
          </Badge>
        </div>
        
        <p className="text-[11px] sm:text-xs text-watt-navy/70 text-center mb-7">
          Real-time data from Alberta Electric System Operator (AESO)
        </p>

        {analytics.error && (
          <Card className="border-red-500/30 bg-red-50 mb-6">
            <CardContent className="py-4">
              <p className="text-xs sm:text-sm text-red-600 text-center">{analytics.error}</p>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
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

        <div className="relative bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 hover:border-watt-trust/30 transition-all">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-watt-trust/10 rounded-lg flex-shrink-0">
              <Activity className="w-6 h-6 text-watt-trust" />
            </div>
            <div className="space-y-3 flex-1">
              <h4 className="text-lg font-bold text-white">
                Live Market Data Integration
              </h4>
              <p className="text-sm text-white/70 leading-relaxed">
                Our facility leverages Alberta's deregulated energy market to optimize operations in real-time. 
                The 95% uptime calculation removes the highest 5% of price spikes, providing a realistic baseline 
                for operational cost planning. With an average price of <span className="text-watt-success font-semibold">${analytics.averagePrice?.toFixed(2) || '—'} CAD/MWh</span> over the past year, Alberta offers competitive energy rates for high-performance computing workloads.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};