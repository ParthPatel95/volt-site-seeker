import { Wind, Sun, Droplet, Flame, Factory, TrendingUp, TrendingDown, RefreshCw, AlertCircle } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, AreaChart, Area, XAxis, YAxis, CartesianGrid } from 'recharts';
import { motion } from 'framer-motion';
import { useAESOData } from '@/hooks/useAESOData';
import aesoWindFarmImage from '@/assets/aeso-wind-farm.jpg';
import { 
  AESOSectionWrapper, 
  AESOSectionHeader, 
  AESOContentCard, 
  AESOKeyInsight,
  AESODeepDive
} from './shared';

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
      return 'hsl(var(--watt-bitcoin))';
    case 'wind':
      return 'hsl(var(--watt-success))';
    case 'solar':
      return '#FBBF24';
    case 'hydro':
      return 'hsl(var(--watt-trust))';
    case 'coal':
      return '#6B7280';
    default:
      return '#8B5CF6';
  }
};

const priceImpacts = [
  { title: 'High Wind = Low Prices', desc: 'When wind output exceeds 3,000 MW, pool prices often drop below $30/MWh or go negative', icon: Wind, color: 'success' },
  { title: 'Low Wind = Price Spikes', desc: 'Calm days require expensive gas generators, pushing prices to $100+/MWh', icon: TrendingUp, color: 'destructive' },
  { title: 'Duck Curve Emerging', desc: 'Solar peaks at midday pushing prices down, then evening ramp requires fast gas plants', icon: Sun, color: 'warning' },
];

export const GenerationMixSection = () => {
  const { generationMix, loading, isFallback, connectionStatus, refetch } = useAESOData();

  const liveGenerationMix = generationMix ? [
    { name: 'Natural Gas', value: Math.round((generationMix.natural_gas_mw / generationMix.total_generation_mw) * 100), mw: generationMix.natural_gas_mw },
    { name: 'Wind', value: Math.round((generationMix.wind_mw / generationMix.total_generation_mw) * 100), mw: generationMix.wind_mw },
    { name: 'Solar', value: Math.round((generationMix.solar_mw / generationMix.total_generation_mw) * 100), mw: generationMix.solar_mw },
    { name: 'Hydro', value: Math.round((generationMix.hydro_mw / generationMix.total_generation_mw) * 100), mw: generationMix.hydro_mw },
    { name: 'Coal', value: Math.round((generationMix.coal_mw / generationMix.total_generation_mw) * 100), mw: generationMix.coal_mw },
    { name: 'Other', value: Math.round((generationMix.other_mw / generationMix.total_generation_mw) * 100), mw: generationMix.other_mw },
  ].filter(item => item.value > 0) : [];

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
    <AESOSectionWrapper theme="accent" id="generation-mix">
      <AESOSectionHeader
        badge="Energy Transition"
        badgeIcon={Wind}
        title="Generation Mix & Renewables"
        description="Alberta's electricity generation is rapidly transforming with increasing renewable penetration. Understanding the generation mix helps predict price patterns."
        theme="light"
        align="center"
      />

      {/* Understanding the Generation Mix */}
      <div className="mb-12">
        <AESODeepDive title="Why the Generation Mix Matters for Prices">
          <div className="space-y-4 text-muted-foreground">
            <p>
              The <strong className="text-foreground">generation mix</strong> — the combination of fuel sources producing 
              electricity at any given moment — directly determines pool prices. Different fuel sources have different 
              marginal costs, and the most expensive generator needed to meet demand sets the price for everyone.
            </p>
            <div className="grid md:grid-cols-2 gap-4 mt-4">
              <div className="p-4 rounded-xl bg-card border border-border">
                <h4 className="font-semibold text-foreground mb-2">Merit Order Effect</h4>
                <p className="text-sm">
                  Generators bid into the pool based on their marginal costs. Wind and solar bid $0 (no fuel cost), 
                  so when they're abundant, they push expensive gas plants off the merit order, lowering prices.
                </p>
              </div>
              <div className="p-4 rounded-xl bg-card border border-border">
                <h4 className="font-semibold text-foreground mb-2">Alberta's Transformation</h4>
                <p className="text-sm">
                  Alberta has gone from 45% coal in 2015 to <strong>0% coal in 2024</strong>. Wind capacity has 
                  tripled, and solar has grown 100x. This dramatically increases price volatility.
                </p>
              </div>
            </div>
          </div>
        </AESODeepDive>
      </div>

      <div className="grid lg:grid-cols-2 gap-8 mb-12">
        {/* Left - Pie Chart */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-foreground">Current Generation Mix</h3>
            <div className="flex items-center gap-2">
              {isLiveData ? (
                <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-[hsl(var(--watt-success)/0.1)] border border-[hsl(var(--watt-success)/0.3)] text-xs text-[hsl(var(--watt-success))]">
                  <span className="w-2 h-2 rounded-full bg-[hsl(var(--watt-success))] animate-pulse"></span>
                  Live from AESO
                </span>
              ) : isCached ? (
                <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-[hsl(var(--watt-trust)/0.1)] border border-[hsl(var(--watt-trust)/0.3)] text-xs text-[hsl(var(--watt-trust))]">
                  <AlertCircle className="w-3 h-3" />
                  Cached data
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-[hsl(var(--watt-bitcoin)/0.1)] border border-[hsl(var(--watt-bitcoin)/0.3)] text-xs text-[hsl(var(--watt-bitcoin))]">
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
          
          <div className="bg-card rounded-2xl border border-border p-6">
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
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }}
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
                      <span className="text-xs text-muted-foreground">{source.mw?.toLocaleString()} MW</span>
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
        <div>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-foreground">Alberta's Energy Transition</h3>
            <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-[hsl(var(--watt-trust)/0.1)] border border-[hsl(var(--watt-trust)/0.3)] text-xs text-[hsl(var(--watt-trust))]">
              AESO Annual Reports
            </span>
          </div>
          
          <div className="bg-card rounded-2xl border border-border p-6">
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={renewableGrowth}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="year" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickFormatter={(v) => `${(v/1000).toFixed(1)}GW`} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }}
                    formatter={(value: number) => [`${value.toLocaleString()} MW`, '']}
                  />
                  <Area type="monotone" dataKey="wind" stackId="1" stroke="hsl(var(--watt-success))" fill="hsl(var(--watt-success))" fillOpacity={0.6} name="Wind" />
                  <Area type="monotone" dataKey="solar" stackId="1" stroke="#FBBF24" fill="#FBBF24" fillOpacity={0.6} name="Solar" />
                  <Area type="monotone" dataKey="coal" stackId="2" stroke="#6B7280" fill="#6B7280" fillOpacity={0.3} name="Coal" />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Trend Indicators */}
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="p-3 rounded-lg bg-[hsl(var(--watt-success)/0.1)] border border-[hsl(var(--watt-success)/0.2)] flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-[hsl(var(--watt-success))]" />
                <div>
                  <p className="text-xs text-[hsl(var(--watt-success))]">Renewables</p>
                  <p className="text-sm font-bold text-foreground">+460% since 2015</p>
                </div>
              </div>
              <div className="p-3 rounded-lg bg-muted border border-border flex items-center gap-2">
                <TrendingDown className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Coal</p>
                  <p className="text-sm font-bold text-foreground">-100% (Phased Out)</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Wind Farm Image + Impact */}
      <div className="grid lg:grid-cols-2 gap-8 mb-12">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="relative rounded-2xl overflow-hidden h-64"
        >
          <img 
            src={aesoWindFarmImage} 
            alt="Alberta Wind Farm" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[hsl(var(--watt-navy)/0.8)] to-transparent" />
          <div className="absolute bottom-4 left-4 right-4 text-white">
            <p className="font-bold text-lg">Alberta Wind Capacity: 4,800+ MW</p>
            <p className="text-sm text-white/80">Largest wind market in Canada (2024)</p>
          </div>
        </motion.div>

        <div className="space-y-4">
          <h3 className="text-xl font-bold text-foreground">Impact on Pool Prices</h3>
          
          {priceImpacts.map((item, i) => (
            <motion.div 
              key={i} 
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className={`p-4 rounded-xl border flex items-start gap-4 ${
                item.color === 'success' ? 'bg-[hsl(var(--watt-success)/0.05)] border-[hsl(var(--watt-success)/0.2)]' :
                item.color === 'destructive' ? 'bg-destructive/5 border-destructive/20' :
                'bg-[hsl(var(--watt-bitcoin)/0.05)] border-[hsl(var(--watt-bitcoin)/0.2)]'
              }`}
            >
              <item.icon className={`w-5 h-5 flex-shrink-0 ${
                item.color === 'success' ? 'text-[hsl(var(--watt-success))]' :
                item.color === 'destructive' ? 'text-destructive' :
                'text-[hsl(var(--watt-bitcoin))]'
              }`} />
              <div>
                <p className={`font-semibold ${
                  item.color === 'success' ? 'text-[hsl(var(--watt-success))]' :
                  item.color === 'destructive' ? 'text-destructive' :
                  'text-[hsl(var(--watt-bitcoin))]'
                }`}>{item.title}</p>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Key Insight */}
      <AESOKeyInsight variant="insight" title="Renewable Integration Creates Opportunity" theme="light">
        <p>
          Alberta's rapid renewable buildout is creating <strong>unprecedented price volatility</strong>. For flexible 
          loads like Bitcoin mining, this is an opportunity: run at full capacity during abundant renewable periods 
          (often $0-30/MWh) and curtail during scarcity (often $100-999/MWh). The spread is growing every year.
        </p>
      </AESOKeyInsight>

      {/* Data Source Badge */}
      <div className="mt-8 text-center">
        <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted border border-border text-xs text-muted-foreground">
          <span className="w-2 h-2 rounded-full bg-[hsl(var(--watt-success))]"></span>
          Generation data from AESO Current Supply Demand (CSD) API | Historical data from AESO Annual Reports
        </span>
      </div>
    </AESOSectionWrapper>
  );
};
