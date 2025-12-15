import { useEffect, useState, useRef } from 'react';
import { TrendingUp, Brain, Thermometer, Wind, Flame, Clock, Target, BarChart3 } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

// Simulated forecast data
const forecastData = Array.from({ length: 24 }, (_, i) => ({
  hour: `${i}:00`,
  predicted: 45 + Math.sin(i / 4) * 20 + Math.random() * 10,
  actual: i < 12 ? 45 + Math.sin(i / 4) * 20 + Math.random() * 5 : null,
  confidence_upper: 55 + Math.sin(i / 4) * 20 + Math.random() * 10,
  confidence_lower: 35 + Math.sin(i / 4) * 20 + Math.random() * 10,
}));

const forecastDrivers = [
  { icon: Thermometer, name: 'Temperature', impact: 'High', desc: 'Cold snaps = +$50-200/MWh' },
  { icon: Wind, name: 'Wind Forecast', impact: 'High', desc: 'Low wind = +$30-100/MWh' },
  { icon: Flame, name: 'Natural Gas Price', impact: 'Medium', desc: 'Gas sets marginal price 60% of hours' },
  { icon: Clock, name: 'Time of Day', impact: 'Medium', desc: 'Evening peak premium' },
];

export const EnergyForecastSection = () => {
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
    <section ref={sectionRef} className="py-16 md:py-20 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className={`text-center mb-12 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-50 border border-purple-200 mb-4">
            <Brain className="w-4 h-4 text-purple-600" />
            <span className="text-sm font-medium text-purple-700">AI-Powered Insights</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-watt-navy mb-4">
            Energy <span className="text-watt-bitcoin">Forecasting</span>
          </h2>
          <p className="text-lg text-watt-navy/70 max-w-3xl mx-auto">
            How WattByte uses machine learning to predict prices and optimize operations
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 mb-12">
          {/* Left - Forecast Chart */}
          <div className={`transition-all duration-700 delay-200 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-6'}`}>
            <h3 className="text-xl font-bold text-watt-navy mb-6 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-watt-bitcoin" />
              24-Hour Price Forecast
            </h3>

            <div className="bg-white rounded-2xl border border-watt-navy/10 p-6">
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={forecastData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="hour" stroke="#6b7280" fontSize={12} interval={3} />
                    <YAxis stroke="#6b7280" fontSize={12} tickFormatter={(v) => `$${v}`} domain={[20, 80]} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                      formatter={(value: number) => [`$${value?.toFixed(2)}/MWh`, '']}
                    />
                    <ReferenceLine y={50} stroke="#9CA3AF" strokeDasharray="3 3" label={{ value: 'Avg', position: 'right', fill: '#6b7280', fontSize: 10 }} />
                    <Line 
                      type="monotone" 
                      dataKey="predicted" 
                      stroke="#F7931A" 
                      strokeWidth={2}
                      dot={false}
                      name="Predicted"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="actual" 
                      stroke="#0052FF" 
                      strokeWidth={2}
                      dot={false}
                      name="Actual"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="confidence_upper" 
                      stroke="#F7931A" 
                      strokeWidth={1}
                      strokeDasharray="5 5"
                      dot={false}
                      opacity={0.3}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="confidence_lower" 
                      stroke="#F7931A" 
                      strokeWidth={1}
                      strokeDasharray="5 5"
                      dot={false}
                      opacity={0.3}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="flex justify-center gap-6 mt-4">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-1 bg-watt-bitcoin rounded" />
                  <span className="text-xs text-watt-navy/70">Predicted</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-1 bg-watt-coinbase rounded" />
                  <span className="text-xs text-watt-navy/70">Actual</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-1 bg-watt-bitcoin/30 rounded" style={{ borderTop: '1px dashed' }} />
                  <span className="text-xs text-watt-navy/70">Confidence Band</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right - Forecast Drivers */}
          <div className={`transition-all duration-700 delay-300 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-6'}`}>
            <h3 className="text-xl font-bold text-watt-navy mb-6 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-watt-bitcoin" />
              Key Forecast Drivers
            </h3>

            <div className="space-y-4 mb-6">
              {forecastDrivers.map((driver, i) => (
                <div key={i} className="p-4 rounded-xl bg-watt-light border border-watt-navy/10 flex items-center gap-4 hover:shadow-md transition-all">
                  <div className="p-3 rounded-lg bg-watt-bitcoin/10">
                    <driver.icon className="w-5 h-5 text-watt-bitcoin" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="font-semibold text-watt-navy">{driver.name}</p>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        driver.impact === 'High' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                      }`}>
                        {driver.impact} Impact
                      </span>
                    </div>
                    <p className="text-sm text-watt-navy/70">{driver.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Model Performance */}
            <div className="p-5 rounded-xl bg-gradient-to-br from-purple-50 to-indigo-50 border border-purple-200">
              <h4 className="font-semibold text-purple-800 mb-3 flex items-center gap-2">
                <Target className="w-5 h-5" />
                VoltScout Model Performance
              </h4>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-purple-700">92%</p>
                  <p className="text-xs text-purple-600">Direction Accuracy</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-purple-700">$8.50</p>
                  <p className="text-xs text-purple-600">Avg Error (MAE)</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-purple-700">85%</p>
                  <p className="text-xs text-purple-600">12CP Prediction</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* How WattByte Uses Forecasts */}
        <div className={`p-8 rounded-2xl bg-gradient-to-br from-watt-navy to-watt-navy/90 text-white transition-all duration-700 delay-400 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
          <h3 className="text-2xl font-bold mb-6 text-center">How WattByte Uses Forecasts</h3>
          
          <div className="grid md:grid-cols-4 gap-6">
            {[
              { step: '1', title: 'Predict', desc: 'AI models analyze weather, demand, gas prices, and historical patterns' },
              { step: '2', title: 'Alert', desc: 'Automated alerts when 12CP events or price spikes are likely' },
              { step: '3', title: 'Optimize', desc: 'Dynamically adjust mining load to avoid high-cost hours' },
              { step: '4', title: 'Profit', desc: 'Maximize hashrate during cheap hours, curtail during expensive ones' },
            ].map((item, i) => (
              <div key={i} className="text-center">
                <div className="w-12 h-12 rounded-full bg-watt-bitcoin text-white flex items-center justify-center mx-auto mb-3 text-xl font-bold">
                  {item.step}
                </div>
                <h4 className="font-semibold text-white mb-2">{item.title}</h4>
                <p className="text-sm text-white/70">{item.desc}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 p-4 rounded-xl bg-white/10 text-center">
            <p className="text-sm text-white/80">
              <strong className="text-watt-bitcoin">Result:</strong> WattByte's 135MW facility can save 
              <span className="font-bold text-watt-bitcoin"> $2-5M+ annually</span> through intelligent 
              load optimization powered by AI forecasting
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
