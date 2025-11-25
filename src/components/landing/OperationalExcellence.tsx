import React from 'react';
import { Activity, Award, Leaf, Shield, TrendingUp, Users, Zap, CheckCircle2 } from 'lucide-react';
import { useAESOData } from '@/hooks/useAESOData';

const achievements = [
  {
    icon: Shield,
    title: 'ISO 27001',
    description: 'Information Security'
  },
  {
    icon: Leaf,
    title: 'LEED Gold',
    description: 'Sustainable Building'
  },
  {
    icon: Award,
    title: 'Uptime Institute',
    description: 'Tier III Certified'
  },
  {
    icon: CheckCircle2,
    title: 'SOC 2 Type II',
    description: 'Security & Compliance'
  }
];

const timeline = [
  { date: 'Q2 2023', event: 'Site Acquisition', status: 'completed' },
  { date: 'Q4 2023', event: 'Construction Start', status: 'completed' },
  { date: 'Q2 2024', event: 'Phase 1 Operational', status: 'completed' },
  { date: 'Q4 2024', event: 'Full Capacity', status: 'current' },
  { date: 'Q2 2025', event: 'Phase 2 Construction', status: 'upcoming' },
  { date: 'Q4 2026', event: '300 MW Total Capacity', status: 'upcoming' }
];

export const OperationalExcellence = () => {
  const aesoData = useAESOData();
  const currentPrice = aesoData?.pricing?.current_price || 0;

  return (
    <section className="py-12 sm:py-16 md:py-20 bg-background">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="text-center mb-8 sm:mb-12 space-y-3 sm:space-y-4">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-foreground">
            Operational Excellence
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
            Real-time metrics demonstrating our commitment to reliability and performance
          </p>
        </div>

        {/* Live Metrics Dashboard */}
        <div className="max-w-5xl mx-auto mb-12 sm:mb-16">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <div className="bg-gradient-to-br from-card to-slate-950 border border-border rounded-xl p-5 sm:p-6">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="w-5 h-5 text-yellow-500" />
                <span className="text-sm text-muted-foreground">Power Load</span>
              </div>
              <div className="text-2xl sm:text-3xl font-bold text-foreground mb-1">127 MW</div>
              <div className="text-xs text-muted-foreground">85% capacity utilization</div>
            </div>

            <div className="bg-gradient-to-br from-card to-slate-950 border border-border rounded-xl p-5 sm:p-6">
              <div className="flex items-center gap-2 mb-2">
                <Activity className="w-5 h-5 text-green-500" />
                <span className="text-sm text-muted-foreground">PUE</span>
              </div>
              <div className="text-2xl sm:text-3xl font-bold text-foreground mb-1">1.18</div>
              <div className="text-xs text-muted-foreground">Best-in-class efficiency</div>
            </div>

            <div className="bg-gradient-to-br from-card to-slate-950 border border-border rounded-xl p-5 sm:p-6">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-5 h-5 text-blue-500" />
                <span className="text-sm text-muted-foreground">Uptime YTD</span>
              </div>
              <div className="text-2xl sm:text-3xl font-bold text-foreground mb-1">99.995%</div>
              <div className="text-xs text-muted-foreground">Zero unplanned outages</div>
            </div>

            <div className="bg-gradient-to-br from-card to-slate-950 border border-border rounded-xl p-5 sm:p-6">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="w-5 h-5 text-primary" />
                <span className="text-sm text-muted-foreground">Current AESO Rate</span>
              </div>
              <div className="text-2xl sm:text-3xl font-bold text-foreground mb-1">
                ${currentPrice.toFixed(2)}
              </div>
              <div className="text-xs text-muted-foreground">per MWh live pricing</div>
            </div>
          </div>
        </div>

        {/* Achievements */}
        <div className="max-w-4xl mx-auto mb-12 sm:mb-16">
          <h3 className="text-xl sm:text-2xl font-bold text-foreground mb-6 sm:mb-8 text-center">
            Certifications & Achievements
          </h3>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {achievements.map((achievement, index) => {
              const Icon = achievement.icon;
              return (
                <div 
                  key={index}
                  className="bg-card border border-border rounded-xl p-4 sm:p-6 text-center hover:border-primary/50 transition-all duration-300 group"
                >
                  <div className="inline-flex p-3 rounded-full bg-primary/10 mb-3 group-hover:bg-primary/20 transition-colors">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <h4 className="text-sm sm:text-base font-semibold text-foreground mb-1">
                    {achievement.title}
                  </h4>
                  <p className="text-xs text-muted-foreground">{achievement.description}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Timeline */}
        <div className="max-w-4xl mx-auto">
          <h3 className="text-xl sm:text-2xl font-bold text-foreground mb-6 sm:mb-8 text-center">
            Facility Development Timeline
          </h3>
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-4 sm:left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary via-primary/50 to-muted"></div>
            
            <div className="space-y-6 sm:space-y-8">
              {timeline.map((item, index) => (
                <div key={index} className="relative pl-12 sm:pl-20">
                  {/* Timeline dot */}
                  <div className={`absolute left-2.5 sm:left-5.5 w-3 h-3 rounded-full border-2 ${
                    item.status === 'completed' 
                      ? 'bg-primary border-primary' 
                      : item.status === 'current'
                      ? 'bg-primary border-primary animate-pulse'
                      : 'bg-muted border-muted'
                  }`}></div>
                  
                  <div className="bg-card border border-border rounded-lg p-4 sm:p-5 hover:border-primary/50 transition-all">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                      <h4 className="text-base sm:text-lg font-semibold text-foreground">{item.event}</h4>
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                        item.status === 'completed'
                          ? 'bg-green-500/10 text-green-500'
                          : item.status === 'current'
                          ? 'bg-primary/10 text-primary'
                          : 'bg-muted/50 text-muted-foreground'
                      }`}>
                        {item.status === 'completed' ? '✓ Completed' : item.status === 'current' ? '● In Progress' : '○ Planned'}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">{item.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Environmental Impact */}
        <div className="mt-12 sm:mt-16 text-center max-w-3xl mx-auto">
          <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-xl p-6 sm:p-8">
            <Leaf className="w-10 h-10 sm:w-12 sm:h-12 text-green-500 mx-auto mb-4" />
            <h3 className="text-xl sm:text-2xl font-bold text-foreground mb-3">
              Environmental Commitment
            </h3>
            <p className="text-sm sm:text-base text-muted-foreground mb-4">
              Our Alberta facility is powered by 85%+ renewable energy, utilizing Alberta's abundant wind and 
              hydroelectric resources. The cold climate reduces cooling requirements, achieving a PUE of 1.18—
              among the most efficient data centers globally.
            </p>
            <div className="flex flex-wrap justify-center gap-4 sm:gap-6 text-sm">
              <div>
                <span className="font-bold text-green-500">42,000 tons</span>
                <span className="text-muted-foreground"> CO₂ avoided annually</span>
              </div>
              <div>
                <span className="font-bold text-green-500">30%</span>
                <span className="text-muted-foreground"> less water usage</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
