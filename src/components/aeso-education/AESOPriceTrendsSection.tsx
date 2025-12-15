import { useEffect, useState, useRef } from 'react';
import { LineChart, Calendar, TrendingUp, TrendingDown, Sun, Snowflake, Leaf, CloudSun } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';

// Historical yearly averages (real AESO data approximations)
const yearlyData = [
  { year: '2018', avgPrice: 50.12, peakPrice: 999.99, lowPrice: -30, volatility: 45 },
  { year: '2019', avgPrice: 54.87, peakPrice: 999.99, lowPrice: -40, volatility: 52 },
  { year: '2020', avgPrice: 38.23, peakPrice: 650.00, lowPrice: -60, volatility: 38 },
  { year: '2021', avgPrice: 101.45, peakPrice: 999.99, lowPrice: -60, volatility: 85 },
  { year: '2022', avgPrice: 145.67, peakPrice: 999.99, lowPrice: -45, volatility: 92 },
  { year: '2023', avgPrice: 98.34, peakPrice: 999.99, lowPrice: -55, volatility: 68 },
  { year: '2024', avgPrice: 72.15, peakPrice: 850.00, lowPrice: -40, volatility: 55 },
];

// Seasonal patterns
const seasonalData = [
  { month: 'Jan', price: 95, demand: 11500, season: 'winter' },
  { month: 'Feb', price: 88, demand: 11200, season: 'winter' },
  { month: 'Mar', price: 52, demand: 10000, season: 'shoulder' },
  { month: 'Apr', price: 45, demand: 9500, season: 'shoulder' },
  { month: 'May', price: 42, demand: 9200, season: 'shoulder' },
  { month: 'Jun', price: 55, demand: 9800, season: 'summer' },
  { month: 'Jul', price: 72, demand: 10500, season: 'summer' },
  { month: 'Aug', price: 68, demand: 10200, season: 'summer' },
  { month: 'Sep', price: 48, demand: 9600, season: 'shoulder' },
  { month: 'Oct', price: 55, demand: 10000, season: 'shoulder' },
  { month: 'Nov', price: 78, demand: 10800, season: 'winter' },
  { month: 'Dec', price: 92, demand: 11300, season: 'winter' },
];

// Hourly pattern (typical day)
const hourlyData = Array.from({ length: 24 }, (_, i) => ({
  hour: `${i}:00`,
  weekday: i < 6 ? 35 : i < 9 ? 65 : i < 17 ? 55 : i < 21 ? 80 : 45,
  weekend: i < 7 ? 30 : i < 10 ? 40 : i < 18 ? 45 : i < 22 ? 55 : 35,
}));

const priceDrivers = [
  { icon: Snowflake, title: 'Weather', description: 'Extreme cold/heat drives demand and generator outages' },
  { icon: TrendingUp, title: 'Natural Gas Prices', description: 'Gas generators set price ~60% of hours' },
  { icon: Leaf, title: 'Renewable Output', description: 'High wind = lower prices; low wind = price spikes' },
  { icon: CloudSun, title: 'Outages', description: 'Planned and unplanned generator outages reduce supply' },
];

export const AESOPriceTrendsSection = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [activeView, setActiveView] = useState<'yearly' | 'seasonal' | 'hourly'>('yearly');
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
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-watt-navy/5 border border-watt-navy/10 mb-4">
            <LineChart className="w-4 h-4 text-watt-navy" />
            <span className="text-sm font-medium text-watt-navy">Historical Analysis</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-watt-navy mb-4">
            Price <span className="text-watt-bitcoin">Trends</span> & Patterns
          </h2>
          <p className="text-lg text-watt-navy/70 max-w-3xl mx-auto">
            Understanding historical price patterns helps optimize operations and maximize savings
          </p>
        </div>

        {/* View Toggle */}
        <div className={`flex justify-center gap-2 mb-8 transition-all duration-700 delay-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
          {[
            { key: 'yearly', label: 'Yearly Trends', icon: Calendar },
            { key: 'seasonal', label: 'Seasonal', icon: Sun },
            { key: 'hourly', label: 'Hourly', icon: LineChart },
          ].map((view) => (
            <button
              key={view.key}
              onClick={() => setActiveView(view.key as typeof activeView)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeView === view.key
                  ? 'bg-watt-bitcoin text-white'
                  : 'bg-white text-watt-navy/70 hover:bg-watt-navy/5 border border-watt-navy/10'
              }`}
            >
              <view.icon className="w-4 h-4" />
              {view.label}
            </button>
          ))}
        </div>

        {/* Charts */}
        <div className={`bg-white rounded-2xl border border-watt-navy/10 p-6 mb-12 transition-all duration-700 delay-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
          {activeView === 'yearly' && (
            <>
              <h3 className="text-lg font-bold text-watt-navy mb-4">AESO Pool Price: 7-Year History</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={yearlyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="year" stroke="#6b7280" fontSize={12} />
                    <YAxis stroke="#6b7280" fontSize={12} tickFormatter={(v) => `$${v}`} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                      formatter={(value: number) => [`$${value.toFixed(2)}/MWh`, '']}
                    />
                    <Legend />
                    <Bar dataKey="avgPrice" fill="#F7931A" name="Avg Price" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 p-4 rounded-lg bg-amber-50 border border-amber-200">
                <p className="text-sm text-amber-800">
                  📈 <strong>2021-2022 Spike:</strong> High natural gas prices + extreme weather drove record volatility. 
                  2024 shows normalization with increased renewable capacity.
                </p>
              </div>
            </>
          )}

          {activeView === 'seasonal' && (
            <>
              <h3 className="text-lg font-bold text-watt-navy mb-4">Seasonal Price Patterns</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={seasonalData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="month" stroke="#6b7280" fontSize={12} />
                    <YAxis stroke="#6b7280" fontSize={12} tickFormatter={(v) => `$${v}`} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                      formatter={(value: number, name: string) => [
                        name === 'price' ? `$${value}/MWh` : `${value} MW`,
                        name === 'price' ? 'Avg Price' : 'Demand'
                      ]}
                    />
                    <Area type="monotone" dataKey="price" stroke="#F7931A" fill="#F7931A" fillOpacity={0.3} name="price" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-4 gap-4 mt-4">
                <div className="p-3 rounded-lg bg-blue-50 border border-blue-200 text-center">
                  <Snowflake className="w-5 h-5 text-blue-600 mx-auto mb-1" />
                  <p className="text-sm font-medium text-blue-800">Winter</p>
                  <p className="text-xs text-blue-600">High prices</p>
                </div>
                <div className="p-3 rounded-lg bg-green-50 border border-green-200 text-center">
                  <Leaf className="w-5 h-5 text-green-600 mx-auto mb-1" />
                  <p className="text-sm font-medium text-green-800">Spring</p>
                  <p className="text-xs text-green-600">Lowest prices</p>
                </div>
                <div className="p-3 rounded-lg bg-orange-50 border border-orange-200 text-center">
                  <Sun className="w-5 h-5 text-orange-600 mx-auto mb-1" />
                  <p className="text-sm font-medium text-orange-800">Summer</p>
                  <p className="text-xs text-orange-600">AC spikes</p>
                </div>
                <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-center">
                  <CloudSun className="w-5 h-5 text-amber-600 mx-auto mb-1" />
                  <p className="text-sm font-medium text-amber-800">Fall</p>
                  <p className="text-xs text-amber-600">Moderate</p>
                </div>
              </div>
            </>
          )}

          {activeView === 'hourly' && (
            <>
              <h3 className="text-lg font-bold text-watt-navy mb-4">Hourly Price Pattern (Typical Day)</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={hourlyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="hour" stroke="#6b7280" fontSize={12} interval={3} />
                    <YAxis stroke="#6b7280" fontSize={12} tickFormatter={(v) => `$${v}`} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                      formatter={(value: number) => [`$${value}/MWh`, '']}
                    />
                    <Legend />
                    <Area type="monotone" dataKey="weekday" stroke="#F7931A" fill="#F7931A" fillOpacity={0.3} name="Weekday" />
                    <Area type="monotone" dataKey="weekend" stroke="#0052FF" fill="#0052FF" fillOpacity={0.3} name="Weekend" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-4">
                <div className="p-3 rounded-lg bg-red-50 border border-red-200">
                  <p className="text-sm font-semibold text-red-800">⚡ Peak Hours (5-9 PM)</p>
                  <p className="text-xs text-red-700">Highest prices — dinner time + business close</p>
                </div>
                <div className="p-3 rounded-lg bg-green-50 border border-green-200">
                  <p className="text-sm font-semibold text-green-800">💤 Off-Peak (11 PM - 6 AM)</p>
                  <p className="text-xs text-green-700">Lowest prices — often negative with wind</p>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Price Drivers */}
        <div className={`transition-all duration-700 delay-400 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
          <h3 className="text-xl font-bold text-watt-navy text-center mb-6">Key Price Drivers</h3>
          <div className="grid md:grid-cols-4 gap-4">
            {priceDrivers.map((driver, i) => (
              <div 
                key={i}
                className="p-5 rounded-xl bg-white border border-watt-navy/10 hover:border-watt-bitcoin/30 transition-all hover:shadow-md"
              >
                <div className="p-3 rounded-lg bg-watt-bitcoin/10 w-fit mb-3">
                  <driver.icon className="w-5 h-5 text-watt-bitcoin" />
                </div>
                <h4 className="font-semibold text-watt-navy mb-1">{driver.title}</h4>
                <p className="text-sm text-watt-navy/70">{driver.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
