import React from 'react';
import { Activity, Award, Leaf, Shield, TrendingUp, Zap, CheckCircle2, Gauge } from 'lucide-react';
import { useAESOData } from '@/hooks/useAESOData';
import { Badge } from '@/components/ui/badge';

const metrics = [
  {
    icon: Zap,
    label: 'Power Consumption',
    value: '127 MW',
    status: 'Live',
    color: 'bg-neon-green/10 text-neon-green',
    trend: '85% capacity'
  },
  {
    icon: Gauge,
    label: 'PUE',
    value: '1.18',
    status: 'Optimal',
    color: 'bg-electric-blue/10 text-electric-blue',
    trend: 'Industry leading'
  },
  {
    icon: TrendingUp,
    label: 'Uptime YTD',
    value: '99.995%',
    status: 'Excellent',
    color: 'bg-neon-green/10 text-neon-green',
    trend: 'Zero outages'
  },
  {
    icon: Activity,
    label: 'Current AESO Rate',
    value: 'Live',
    status: 'Active',
    color: 'bg-electric-yellow/10 text-electric-yellow',
    trend: 'Real-time'
  }
];

const achievements = [
  {
    icon: Shield,
    title: 'ISO 27001',
    description: 'Information Security Management'
  },
  {
    icon: Leaf,
    title: 'LEED Gold',
    description: 'Sustainable Building Design'
  },
  {
    icon: Award,
    title: 'Uptime Institute',
    description: 'Tier III Certified Facility'
  },
  {
    icon: CheckCircle2,
    title: 'SOC 2 Type II',
    description: 'Security & Compliance'
  }
];

export const OperationalExcellence = () => {
  const aesoData = useAESOData();
  const currentPrice = aesoData?.pricing?.current_price || 0;

  // Update metrics with live AESO data
  const liveMetrics = metrics.map(metric => {
    if (metric.label === 'Current AESO Rate') {
      return {
        ...metric,
        value: `$${currentPrice.toFixed(2)}`,
        trend: 'per MWh'
      };
    }
    return metric;
  });

  return (
    <section className="relative py-16 sm:py-20 md:py-24 bg-gradient-to-b from-slate-900 to-slate-950">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4">
            Operational <span className="text-neon-green">Excellence</span>
          </h2>
          <p className="text-lg sm:text-xl text-slate-200 max-w-3xl mx-auto leading-relaxed">
            Real-time performance metrics from our <span className="text-electric-blue font-semibold">Alberta facility</span>
          </p>
        </div>

        {/* Live Metrics Dashboard */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {liveMetrics.map((metric, index) => (
            <div 
              key={index}
              className="group relative bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50 hover:border-electric-blue/50 transition-all duration-300 hover:scale-105 hover:bg-slate-800/70"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-electric-blue/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
              
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <metric.icon className="w-8 h-8 text-electric-blue" />
                  <Badge variant="outline" className={`${metric.color} border-none`}>
                    {metric.status}
                  </Badge>
                </div>
                
                <div className="text-3xl font-bold text-white mb-2">
                  {metric.value}
                </div>
                
                <div className="text-sm text-slate-300 mb-3">
                  {metric.label}
                </div>
                
                <div className="flex items-center text-xs text-neon-green">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  {metric.trend}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Achievements */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {achievements.map((achievement, index) => (
            <div 
              key={index}
              className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50 hover:border-neon-green/30 transition-all hover:bg-slate-800/70"
            >
              <div className="flex flex-col items-center text-center gap-4">
                <div className="p-3 bg-neon-green/10 rounded-lg">
                  <achievement.icon className="w-6 h-6 text-neon-green" />
                </div>
                <div>
                  <h4 className="font-bold text-white mb-2">{achievement.title}</h4>
                  <p className="text-sm text-slate-300">{achievement.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};