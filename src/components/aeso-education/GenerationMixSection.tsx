import { useEffect, useState, useRef } from 'react';
import { Wind, Sun, Droplet, Flame, Factory, TrendingUp, TrendingDown } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, AreaChart, Area, XAxis, YAxis, CartesianGrid } from 'recharts';
import aesoWindFarmImage from '@/assets/aeso-wind-farm.jpg';

const generationMix = [
  { name: 'Natural Gas', value: 58, color: '#F7931A', icon: Flame },
  { name: 'Wind', value: 22, color: '#10B981', icon: Wind },
  { name: 'Solar', value: 7, color: '#FBBF24', icon: Sun },
  { name: 'Hydro', value: 4, color: '#3B82F6', icon: Droplet },
  { name: 'Coal', value: 5, color: '#6B7280', icon: Factory },
  { name: 'Other', value: 4, color: '#8B5CF6', icon: TrendingUp },
];

const renewableGrowth = [
  { year: '2015', wind: 1500, solar: 50, coal: 6000 },
  { year: '2017', wind: 2500, solar: 150, coal: 5500 },
  { year: '2019', wind: 3200, solar: 500, coal: 4500 },
  { year: '2021', wind: 4000, solar: 1000, coal: 3000 },
  { year: '2023', wind: 4500, solar: 1500, coal: 1500 },
  { year: '2025', wind: 5500, solar: 2500, coal: 500 },
];

export const GenerationMixSection = () => {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

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

  return (
    <section ref={sectionRef} className="py-16 md:py-20 bg-watt-light">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className={`text-center mb-12 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-50 border border-green-200 mb-4">
            <Wind className="w-4 h-4 text-green-600" />
            <span className="text-sm font-medium text-green-700">Energy Transition</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-watt-navy mb-4">
            Generation <span className="text-watt-bitcoin">Mix</span> & Renewables
          </h2>
          <p className="text-lg text-watt-navy/70 max-w-3xl mx-auto">
            Alberta's electricity generation is rapidly transforming with increasing renewable penetration
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 mb-12">
          {/* Left - Pie Chart */}
          <div className={`transition-all duration-700 delay-200 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-6'}`}>
            <h3 className="text-xl font-bold text-watt-navy mb-6">Current Generation Mix (2024)</h3>
            
            <div className="bg-white rounded-2xl border border-watt-navy/10 p-6">
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={generationMix}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {generationMix.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value: number) => [`${value}%`, '']}
                      contentStyle={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Source Icons */}
              <div className="grid grid-cols-3 gap-3 mt-4">
                {generationMix.slice(0, 6).map((source, i) => (
                  <div key={i} className="flex items-center gap-2 p-2 rounded-lg bg-watt-light">
                    <div className="w-3 h-3 rounded" style={{ backgroundColor: source.color }} />
                    <span className="text-xs font-medium text-watt-navy">{source.name}</span>
                    <span className="text-xs text-watt-navy/50 ml-auto">{source.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right - Transition Chart */}
          <div className={`transition-all duration-700 delay-300 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-6'}`}>
            <h3 className="text-xl font-bold text-watt-navy mb-6">Alberta's Energy Transition</h3>
            
            <div className="bg-white rounded-2xl border border-watt-navy/10 p-6">
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={renewableGrowth}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="year" stroke="#6b7280" fontSize={12} />
                    <YAxis stroke="#6b7280" fontSize={12} tickFormatter={(v) => `${v/1000}GW`} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                      formatter={(value: number) => [`${value} MW`, '']}
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
                    <p className="text-sm font-bold text-green-800">+300% since 2015</p>
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-gray-50 border border-gray-200 flex items-center gap-2">
                  <TrendingDown className="w-5 h-5 text-gray-600" />
                  <div>
                    <p className="text-xs text-gray-600">Coal</p>
                    <p className="text-sm font-bold text-gray-800">-90% since 2015</p>
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
              <p className="font-bold text-lg">Alberta Wind Capacity: 4,500+ MW</p>
              <p className="text-sm text-white/80">2nd largest wind market in Canada</p>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-xl font-bold text-watt-navy">Impact on Pool Prices</h3>
            
            {[
              { title: 'High Wind = Low Prices', desc: 'When wind output exceeds 3,000 MW, pool prices often drop below $30/MWh', icon: Wind, color: 'green' },
              { title: 'Low Wind = Price Spikes', desc: 'Calm days require expensive gas generators, pushing prices to $100+/MWh', icon: TrendingUp, color: 'red' },
              { title: 'Duck Curve Emerging', desc: 'Solar peaks at midday, pushing prices down, then evening ramp requires fast gas plants', icon: Sun, color: 'amber' },
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
      </div>
    </section>
  );
};
