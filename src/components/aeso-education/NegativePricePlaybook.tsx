import { useEffect, useState, useRef } from 'react';
import { TrendingDown, Zap, Clock, DollarSign, Wind, CheckCircle, AlertTriangle, BarChart3 } from 'lucide-react';

const negativeHoursData = [
  { year: '2020', hours: 89, avgPrice: -12 },
  { year: '2021', hours: 156, avgPrice: -18 },
  { year: '2022', hours: 203, avgPrice: -22 },
  { year: '2023', hours: 312, avgPrice: -25 },
  { year: '2024', hours: 387, avgPrice: -28 },
];

const typicalConditions = [
  { condition: 'High Wind Generation', icon: Wind, description: 'Wind output > 3,500 MW combined with low demand' },
  { condition: 'Overnight Hours (1-5 AM)', icon: Clock, description: 'Lowest demand period when base load exceeds needs' },
  { condition: 'Spring/Fall Mild Weather', icon: Zap, description: 'No heating or cooling load, minimal demand' },
  { condition: 'Weekend/Holiday', icon: BarChart3, description: 'Industrial load reduction amplifies oversupply' },
];

const strategies = [
  {
    title: 'Maximize Consumption',
    description: 'Run all available hashrate during negative price periods - you get paid to consume',
    savings: '+$2,800/MW',
    implementation: 'Easy',
    automation: 'Price trigger at $0, ramp to full load'
  },
  {
    title: 'Shift Maintenance Windows',
    description: 'Schedule maintenance during positive price periods, never during negative windows',
    savings: '+$1,500/MW',
    implementation: 'Medium',
    automation: 'Sync maintenance scheduler with price forecasts'
  },
  {
    title: 'Add Flexible Load',
    description: 'Deploy additional equipment (development miners, cooling) only during negative prices',
    savings: '+$4,200/MW',
    implementation: 'Complex',
    automation: 'Secondary load bank with automated dispatch'
  }
];

export const NegativePricePlaybook = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [negativeMW, setNegativeMW] = useState(25);
  const [hoursCapture, setHoursCapture] = useState(300);
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

  // Calculate annual opportunity
  const avgNegativePrice = -25; // $/MWh (you receive this)
  const annualRevenue = Math.abs(avgNegativePrice) * negativeMW * hoursCapture;

  return (
    <div ref={sectionRef} className={`mt-12 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
      {/* Header */}
      <div className="p-6 rounded-t-2xl bg-gradient-to-r from-green-600 to-emerald-600 text-white">
        <div className="flex items-center gap-3 mb-2">
          <TrendingDown className="w-6 h-6" />
          <h3 className="text-xl font-bold">Negative Price Playbook</h3>
        </div>
        <p className="text-green-100">
          When pool prices go negative, you get PAID to consume electricity. Here's how to maximize this opportunity.
        </p>
      </div>

      <div className="p-6 rounded-b-2xl bg-card border border-t-0 border-border">
        {/* Trend Data */}
        <div className="mb-8">
          <h4 className="font-bold text-foreground mb-4 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-primary" />
            Negative Price Hours Are Increasing
          </h4>
          
          <div className="grid grid-cols-5 gap-2 mb-4">
            {negativeHoursData.map((year, index) => (
              <div key={index} className="text-center">
                <div 
                  className="bg-green-500 rounded-t mx-auto mb-2 transition-all duration-500"
                  style={{ 
                    width: '40px', 
                    height: `${(year.hours / 400) * 100}px`,
                    opacity: isVisible ? 1 : 0,
                    transitionDelay: `${index * 100}ms`
                  }}
                />
                <p className="text-xs font-medium text-foreground">{year.year}</p>
                <p className="text-xs text-muted-foreground">{year.hours} hrs</p>
                <p className="text-xs text-green-600">${year.avgPrice}/MWh</p>
              </div>
            ))}
          </div>

          <p className="text-sm text-muted-foreground">
            As Alberta adds more wind capacity, negative price hours continue to grow. 2024 saw 387+ hours of negative prices - 
            that's over <span className="font-bold text-green-600">16 days</span> of being paid to run.
          </p>
        </div>

        {/* When to Expect Negative Prices */}
        <div className="mb-8">
          <h4 className="font-bold text-foreground mb-4">When to Expect Negative Prices</h4>
          <div className="grid md:grid-cols-2 gap-3">
            {typicalConditions.map((item, index) => (
              <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-background border border-border">
                <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0">
                  <item.icon className="w-4 h-4 text-green-600" />
                </div>
                <div>
                  <p className="font-medium text-foreground text-sm">{item.condition}</p>
                  <p className="text-xs text-muted-foreground">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Optimization Strategies */}
        <div className="mb-8">
          <h4 className="font-bold text-foreground mb-4">Optimization Strategies</h4>
          <div className="space-y-3">
            {strategies.map((strategy, index) => (
              <div key={index} className="p-4 rounded-xl bg-background border border-border">
                <div className="flex items-start justify-between mb-2">
                  <h5 className="font-medium text-foreground">{strategy.title}</h5>
                  <span className="px-2 py-1 rounded-full bg-green-100 text-green-700 text-xs font-bold">
                    {strategy.savings}/year
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mb-3">{strategy.description}</p>
                <div className="flex items-center gap-4 text-xs">
                  <span className="text-muted-foreground">
                    Implementation: <span className={`font-medium ${
                      strategy.implementation === 'Easy' ? 'text-green-600' :
                      strategy.implementation === 'Medium' ? 'text-yellow-600' : 'text-red-600'
                    }`}>{strategy.implementation}</span>
                  </span>
                  <span className="text-muted-foreground">
                    Automation: <span className="text-primary">{strategy.automation}</span>
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Revenue Calculator */}
        <div className="p-5 rounded-xl bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200">
          <h4 className="font-bold text-green-800 mb-4 flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            Annual Negative Price Opportunity
          </h4>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="text-sm text-green-700 mb-2 block">
                  Flexible Capacity: {negativeMW} MW
                </label>
                <input
                  type="range"
                  min={5}
                  max={100}
                  step={5}
                  value={negativeMW}
                  onChange={(e) => setNegativeMW(Number(e.target.value))}
                  className="w-full h-2 bg-green-200 rounded-lg appearance-none cursor-pointer accent-green-600"
                />
              </div>

              <div>
                <label className="text-sm text-green-700 mb-2 block">
                  Hours Captured: {hoursCapture} hrs/year
                </label>
                <input
                  type="range"
                  min={50}
                  max={400}
                  step={25}
                  value={hoursCapture}
                  onChange={(e) => setHoursCapture(Number(e.target.value))}
                  className="w-full h-2 bg-green-200 rounded-lg appearance-none cursor-pointer accent-green-600"
                />
                <div className="flex justify-between text-xs text-green-600 mt-1">
                  <span>Conservative</span>
                  <span>Maximum</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col justify-center">
              <p className="text-sm text-green-700 mb-1">Annual Revenue from Negative Prices</p>
              <p className="text-4xl font-bold text-green-800">${annualRevenue.toLocaleString()}</p>
              <p className="text-xs text-green-600 mt-2">
                Based on avg -$25/MWh × {negativeMW} MW × {hoursCapture} hours
              </p>
            </div>
          </div>
        </div>

        {/* Pro Tips */}
        <div className="mt-6 grid md:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-blue-50 border border-blue-200">
            <div className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-blue-800">Forecast Integration</p>
                <p className="text-xs text-blue-600">
                  WattByte's VoltScout predicts negative price windows 4-12 hours ahead, 
                  allowing you to prepare equipment and maximize consumption.
                </p>
              </div>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-yellow-50 border border-yellow-200">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-yellow-800">Watch Your PPA Terms</p>
                <p className="text-xs text-yellow-600">
                  Some PPAs don't pass through negative prices. Ensure your contract 
                  allows you to benefit from negative pool prices.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
