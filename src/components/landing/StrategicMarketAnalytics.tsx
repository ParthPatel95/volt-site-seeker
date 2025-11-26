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
    color: 'neon-green'
  },
  {
    icon: Snowflake,
    title: 'Cold Climate Advantage',
    description: 'Natural cooling reduces operational costs',
    color: 'electric-blue'
  },
  {
    icon: Cable,
    title: 'Fiber Connectivity',
    description: 'Trans-continental fiber route access',
    color: 'electric-purple'
  },
  {
    icon: Globe,
    title: 'Political Stability',
    description: 'Canadian jurisdiction with strong rule of law',
    color: 'electric-yellow'
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
    <div className="space-y-12">
      {/* Section Header */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-3">
          <MapPin className="w-8 h-8 text-neon-green" />
          <h3 className="text-3xl font-bold text-white">
            Strategic Market Analytics
          </h3>
        </div>
        <p className="text-sm text-slate-400 max-w-2xl mx-auto">
          Alberta's competitive advantages combined with real-time energy market intelligence
        </p>
      </div>

      {/* Location Benefits */}
      <div>
        <div className="flex items-center justify-center gap-2 mb-6">
          <Badge variant="outline" className="bg-neon-green/10 text-neon-green border-neon-green/30">
            Location Advantages
          </Badge>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {locationBenefits.map((benefit, index) => {
            const colorClasses = {
              'neon-green': 'text-neon-green bg-neon-green/10 hover:border-neon-green/50',
              'electric-blue': 'text-electric-blue bg-electric-blue/10 hover:border-electric-blue/50',
              'electric-purple': 'text-electric-purple bg-electric-purple/10 hover:border-electric-purple/50',
              'electric-yellow': 'text-electric-yellow bg-electric-yellow/10 hover:border-electric-yellow/50'
            };
            
            return (
              <div 
                key={index} 
                className={`
                  group relative p-6 rounded-2xl 
                  bg-gradient-to-br from-slate-800/50 to-slate-900/50
                  border border-slate-700/50
                  ${colorClasses[benefit.color as keyof typeof colorClasses]?.split(' ')[2]}
                  backdrop-blur-sm
                  transition-all duration-300
                  hover:-translate-y-2 hover:shadow-xl
                `}
                style={{
                  animationDelay: `${index * 100}ms`
                }}
              >
                <div className={`inline-flex items-center justify-center p-3 rounded-xl mb-4 ${colorClasses[benefit.color as keyof typeof colorClasses]?.split(' ')[1]}`}>
                  <benefit.icon className={`w-6 h-6 ${colorClasses[benefit.color as keyof typeof colorClasses]?.split(' ')[0]}`} />
                </div>
                
                <h4 className="text-lg font-bold text-white mb-2">{benefit.title}</h4>
                <p className="text-sm text-slate-400 leading-relaxed">{benefit.description}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Energy Market Analytics */}
      <div>
        <div className="flex items-center justify-center gap-2 mb-6">
          <Badge variant="outline" className="bg-electric-blue/10 text-electric-blue border-electric-blue/30">
            Past 12 Months
          </Badge>
          <Badge variant="outline" className="bg-neon-green/10 text-neon-green border-neon-green/30">
            95% Uptime Filter
          </Badge>
        </div>
        
        <p className="text-sm text-slate-400 text-center mb-8">
          Real-time data from Alberta Electric System Operator (AESO)
        </p>

        {analytics.error && (
          <Card className="border-red-500/30 bg-red-950/20 mb-6">
            <CardContent className="py-4">
              <p className="text-sm text-red-400 text-center">{analytics.error}</p>
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

        <div className="relative bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50 hover:border-electric-blue/30 transition-all">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-electric-blue/10 rounded-lg flex-shrink-0">
              <Activity className="w-6 h-6 text-electric-blue" />
            </div>
            <div className="space-y-3 flex-1">
              <h4 className="text-lg font-bold text-white">
                Live Market Data Integration
              </h4>
              <p className="text-sm text-slate-300 leading-relaxed">
                Our facility leverages Alberta's deregulated energy market to optimize operations in real-time. 
                The 95% uptime calculation removes the highest 5% of price spikes, providing a realistic baseline 
                for operational cost planning. With an average price of <span className="text-neon-green font-semibold">${analytics.averagePrice?.toFixed(2) || '—'} CAD/MWh</span> over the past year, Alberta offers competitive energy rates for high-performance computing workloads.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
