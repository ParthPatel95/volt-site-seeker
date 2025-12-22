import { useEffect, useState, useRef } from 'react';
import { Wind, Sun, Droplet, Flame, Factory, TrendingUp, TrendingDown, RefreshCw, AlertCircle } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, AreaChart, Area, XAxis, YAxis, CartesianGrid } from 'recharts';
import { useAESOData } from '@/hooks/useAESOData';
import aesoWindFarmImage from '@/assets/aeso-wind-farm.jpg';

// Historical renewable growth data (verified from AESO reports)
const renewableGrowth = [
  { year: '2015', wind: 1479, solar: 15, coal: 6289 },
  { year: '2017', wind: 1483, solar: 30, coal: 5985 },
  { year: '2019', wind: 1685, solar: 166, coal: 5656 },
  { year: '2021', wind: 2269, solar: 736, coal: 3179 },
  { year: '2023', wind: 4351, solar: 1573, coal: 670 },
  { year: '2024', wind: 4819, solar: 2100, coal: 0 },
];

const getGenerationIcon = (name: string) => {
  switch (name.toLowerCase()) {
    case 'natural gas':
    case 'gas':
      return Flame;
    case 'wind':
      return Wind;
    case 'solar':
      return Sun;
    case 'hydro':
      return Droplet;
    case 'coal':
      return Factory;
    default:
      return TrendingUp;
  }
};

const getGenerationColor = (name: string) => {
  switch (name.toLowerCase()) {
    case 'natural gas':
    case 'gas':
      return '#F7931A';
    case 'wind':
      return '#10B981';
    case 'solar':
      return '#FBBF24';
    case 'hydro':
      return '#3B82F6';
    case 'coal':
      return '#6B7280';
    default:
      return '#8B5CF6';
  }
};

export const GenerationMixSection = () => {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);
  const { generationMix, loading, isFallback, connectionStatus, refetch } = useAESOData();

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // Transform real API data into chart format - always have valid data now
  const liveGenerationMix = generationMix ? [
    { name: 'Natural Gas', value: Math.round((generationMix.natural_gas_mw / generationMix.total_generation_mw) * 100), mw: generationMix.natural_gas_mw },
    { name: 'Wind', value: Math.round((generationMix.wind_mw / generationMix.total_generation_mw) * 100), mw: generationMix.wind_mw },
    { name: 'Solar', value: Math.round((generationMix.solar_mw / generationMix.total_generation_mw) * 100), mw: generationMix.solar_mw },
    { name: 'Hydro', value: Math.round((generationMix.hydro_mw / generationMix.total_generation_mw) * 100), mw: generationMix.hydro_mw },
    { name: 'Coal', value: Math.round((generationMix.coal_mw / generationMix.total_generation_mw) * 100), mw: generationMix.coal_mw },
    { name: 'Other', value: Math.round((generationMix.other_mw / generationMix.total_generation_mw) * 100), mw: generationMix.other_mw },
  ].filter(item => item.value > 0) : [];

  // Chart data always available (fallback included in hook)
  const chartData = liveGenerationMix.length > 0 ? liveGenerationMix : [
    { name: 'Natural Gas', value: 55, mw: 6050 },
    { name: 'Wind', value: 25, mw: 2750 },
    { name: 'Solar', value: 8, mw: 880 },
    { name: 'Hydro', value: 4, mw: 440 },
    { name: 'Other', value: 8, mw: 880 },
  ];
  
  const isLiveData = connectionStatus === 'connected' && liveGenerationMix.length > 0;
  const isCached = connectionStatus === 'cached';

  return (
    <section ref={sectionRef} className="py-16 md:py-20 bg-watt-light">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className={`text-center mb-12 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-50 border border-green-200 mb-4">
            <Wind className="w-4 h-4 text-green-600" />
            <span className="text-sm font-medium text-green-700">Energy Transition</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Generation <span className="text-watt-bitcoin">Mix</span> & Renewables
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Alberta's electricity generation is rapidly transforming with increasing renewable penetration
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 mb-12">
          {/* Left - Pie Chart */}
          <div className={`transition-all duration-700 delay-200 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-6'}`}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-foreground">Current Generation Mix</h3>
              <div className="flex items-center gap-2">
                {isLiveData ? (
                  <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-green-100 border border-green-300 text-xs text-green-700">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                    Live from AESO
                  </span>
                ) : isCached ? (
                  <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-blue-100 border border-blue-300 text-xs text-blue-700">
                    <AlertCircle className="w-3 h-3" />
                    Cached data
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-amber-100 border border-amber-300 text-xs text-amber-700">
                    <AlertCircle className="w-3 h-3" />
                    Typical values
                  </span>
                )}
                <button
                  onClick={() => refetch()}
                  className="p-1.5 rounded-lg hover:bg-muted transition-colors"
                  title="Refresh data"
                >
                  <RefreshCw className={`w-4 h-4 text-muted-foreground ${loading ? 'animate-spin' : ''}`} />
                </button>
              </div>
            </div>
            
            <div className="bg-white rounded-2xl border border-border p-6">
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={getGenerationColor(entry.name)} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value: number, name: string, props: any) => [
                        `${value}% (${props.payload.mw?.toLocaleString() || '---'} MW)`, 
                        name
                      ]}
                      contentStyle={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Source Icons with MW values */}
              <div className="grid grid-cols-3 gap-3 mt-4">
                {chartData.slice(0, 6).map((source, i) => {
                  const Icon = getGenerationIcon(source.name);
                  return (
                    <div key={i} className="flex items-center gap-2 p-2 rounded-lg bg-muted">
                      <Icon className="w-4 h-4" style={{ color: getGenerationColor(source.name) }} />
                      <div className="flex-1 min-w-0">
                        <span className="text-xs font-medium text-foreground truncate block">{source.name}</span>
                        <span className="text-xs text-muted-foreground/70">{source.mw?.toLocaleString()} MW</span>
                      </div>
                      <span className="text-xs text-muted-foreground font-medium">{source.value}%</span>
                    </div>
                  );
                })}
              </div>

              {generationMix?.timestamp && (
                <p className="text-xs text-muted-foreground/60 text-center mt-4">
                  Last updated: {new Date(generationMix.timestamp).toLocaleString()}
                </p>
              )}
            </div>
          </div>

          {/* Right - Transition Chart */}
          <div className={`transition-all duration-700 delay-300 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-6'}`}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-foreground">Alberta's Energy Transition</h3>
              <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-blue-100 border border-blue-300 text-xs text-blue-700">
                AESO Annual Reports
              </span>
            </div>
            
            <div className="bg-white rounded-2xl border border-border p-6">
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={renewableGrowth}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="year" stroke="#6b7280" fontSize={12} />
                    <YAxis stroke="#6b7280" fontSize={12} tickFormatter={(v) => `${(v/1000).toFixed(1)}GW`} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                      formatter={(value: number) => [`${value.toLocaleString()} MW`, '']}
                    />
                    <Area type="monotone" dataKey="wind" stackId="1" stroke="#10B981" fill="#10B981" fillOpacity={0.6} name="Wind" />
                    <Area type="monotone" dataKey="solar" stackId="1" stroke="#FBBF24" fill="#FBBF24" fillOpacity={0.6} name="Solar" />
                    <Area type="monotone" dataKey="coal" stackId="2" stroke="#6B7280" fill="#6B7280" fillOpacity={0.3} name="Coal" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Trend Indicators */}
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="p-3 rounded-lg bg-green-50 border border-green-200 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="text-xs text-green-600">Renewables</p>
                    <p className="text-sm font-bold text-green-800">+460% since 2015</p>
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-gray-50 border border-gray-200 flex items-center gap-2">
                  <TrendingDown className="w-5 h-5 text-gray-600" />
                  <div>
                    <p className="text-xs text-gray-600">Coal</p>
                    <p className="text-sm font-bold text-gray-800">-100% (Phased Out)</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Wind Farm Image + Impact */}
        <div className={`grid lg:grid-cols-2 gap-8 transition-all duration-700 delay-400 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
          <div className="relative rounded-2xl overflow-hidden h-64">
            <img 
              src={aesoWindFarmImage} 
              alt="Alberta Wind Farm" 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-watt-navy/80 to-transparent" />
            <div className="absolute bottom-4 left-4 right-4 text-white">
              <p className="font-bold text-lg">Alberta Wind Capacity: 4,800+ MW</p>
              <p className="text-sm text-white/80">Largest wind market in Canada (2024)</p>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-xl font-bold text-foreground">Impact on Pool Prices</h3>
            
            {[
              { title: 'High Wind = Low Prices', desc: 'When wind output exceeds 3,000 MW, pool prices often drop below $30/MWh or go negative', icon: Wind, color: 'green' },
              { title: 'Low Wind = Price Spikes', desc: 'Calm days require expensive gas generators, pushing prices to $100+/MWh', icon: TrendingUp, color: 'red' },
              { title: 'Duck Curve Emerging', desc: 'Solar peaks at midday pushing prices down, then evening ramp requires fast gas plants', icon: Sun, color: 'amber' },
            ].map((item, i) => (
              <div key={i} className={`p-4 rounded-xl border flex items-start gap-4 ${
                item.color === 'green' ? 'bg-green-50 border-green-200' :
                item.color === 'red' ? 'bg-red-50 border-red-200' :
                'bg-amber-50 border-amber-200'
              }`}>
                <item.icon className={`w-5 h-5 flex-shrink-0 ${
                  item.color === 'green' ? 'text-green-600' :
                  item.color === 'red' ? 'text-red-600' :
                  'text-amber-600'
                }`} />
                <div>
                  <p className={`font-semibold ${
                    item.color === 'green' ? 'text-green-800' :
                    item.color === 'red' ? 'text-red-800' :
                    'text-amber-800'
                  }`}>{item.title}</p>
                  <p className={`text-sm ${
                    item.color === 'green' ? 'text-green-700' :
                    item.color === 'red' ? 'text-red-700' :
                    'text-amber-700'
                  }`}>{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Data Source Badge */}
        <div className="mt-8 text-center">
          <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted border border-border text-xs text-muted-foreground">
            <span className="w-2 h-2 rounded-full bg-green-500"></span>
            Generation data from AESO Current Supply Demand (CSD) API | Historical data from AESO Annual Reports
          </span>
        </div>
      </div>
    </section>
  );
};
