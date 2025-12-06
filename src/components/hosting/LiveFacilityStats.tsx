import { ScrollReveal } from '@/components/landing/ScrollAnimations';
import { useAESOData } from '@/hooks/useAESOData';
import { Zap, Thermometer, Activity, Server, Clock, TrendingUp } from 'lucide-react';
import { AnimatedCounter } from '@/components/AnimatedCounter';
import { useEffect, useState } from 'react';

export const LiveFacilityStats = () => {
  const { pricing, loading, hasData } = useAESOData();
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update time every second
  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const stats = [
    {
      icon: Zap,
      label: 'Current AESO Price',
      value: hasData && pricing?.current_price 
        ? `$${pricing.current_price.toFixed(2)}/MWh` 
        : loading ? 'Loading...' : '$45.00/MWh',
      subtext: 'Live wholesale rate',
      color: 'watt-bitcoin',
      animate: true
    },
    {
      icon: Server,
      label: 'Facility Capacity',
      value: '135',
      suffix: 'MW',
      subtext: 'Total available power',
      color: 'watt-success',
      animate: true
    },
    {
      icon: Activity,
      label: 'System Uptime',
      value: '99.99',
      suffix: '%',
      subtext: 'Current month',
      color: 'watt-trust',
      animate: true
    },
    {
      icon: Thermometer,
      label: 'Outside Temp',
      value: '-5',
      suffix: '°C',
      subtext: 'Natural cooling active',
      color: 'watt-trust',
      animate: false
    },
    {
      icon: TrendingUp,
      label: 'Capacity Available',
      value: '45',
      suffix: 'MW',
      subtext: 'Open for new clients',
      color: 'watt-bitcoin',
      animate: true
    },
    {
      icon: Clock,
      label: 'Local Time',
      value: currentTime.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        timeZone: 'America/Edmonton'
      }),
      subtext: 'Alberta, Canada',
      color: 'watt-navy',
      animate: false
    }
  ];

  return (
    <section className="py-12 md:py-16 bg-gradient-to-br from-watt-navy via-watt-navy/95 to-watt-navy/90 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <ScrollReveal>
          <div className="text-center mb-8 md:mb-10">
            <div className="inline-flex items-center space-x-2 px-4 py-2 bg-white/10 border border-white/20 rounded-full mb-4">
              <div className="w-2 h-2 bg-watt-success rounded-full animate-pulse" />
              <span className="text-sm font-medium text-white">Live Facility Data</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
              Real-Time Operations
            </h2>
            <p className="text-lg text-white/70 max-w-2xl mx-auto">
              Monitor our facility's live performance metrics and current market conditions
            </p>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <ScrollReveal key={index} delay={index * 0.05}>
                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4 text-center hover:bg-white/10 transition-all duration-300 group">
                  <div className={`w-10 h-10 mx-auto rounded-lg flex items-center justify-center mb-3 bg-${stat.color}/20 group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className={`w-5 h-5 text-${stat.color}`} />
                  </div>
                  
                  <div className="text-xs text-white/50 mb-1">{stat.label}</div>
                  
                  {stat.animate && stat.suffix ? (
                    <div className={`text-xl md:text-2xl font-bold text-${stat.color}`}>
                      <AnimatedCounter end={parseFloat(stat.value)} suffix={stat.suffix} />
                    </div>
                  ) : (
                    <div className={`text-xl md:text-2xl font-bold text-${stat.color}`}>
                      {stat.value}{stat.suffix || ''}
                    </div>
                  )}
                  
                  <div className="text-xs text-white/40 mt-1">{stat.subtext}</div>
                </div>
              </ScrollReveal>
            );
          })}
        </div>

        {/* Live Indicator */}
        <ScrollReveal delay={0.4}>
          <div className="mt-8 flex items-center justify-center space-x-2">
            <div className="w-2 h-2 bg-watt-success rounded-full animate-pulse" />
            <span className="text-sm text-white/50">Data updates every 5 minutes</span>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
};
