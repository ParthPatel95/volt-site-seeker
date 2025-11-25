import React from 'react';
import { Zap, Wind, TrendingUp, Gauge } from 'lucide-react';

const highlights = [
  {
    icon: Zap,
    title: 'Power Infrastructure',
    metric: '150 MW Capacity',
    description: 'Redundant electrical distribution with N+1 backup systems ensuring 99.99% uptime',
    color: 'from-yellow-500 to-orange-500'
  },
  {
    icon: Gauge,
    title: 'Cooling Systems',
    metric: 'PUE < 1.2',
    description: 'Advanced hybrid cooling combining immersion and air-cooled systems for maximum efficiency',
    color: 'from-blue-500 to-cyan-500'
  },
  {
    icon: Wind,
    title: 'Renewable Integration',
    metric: '85%+ Green Energy',
    description: 'Direct connection to Alberta\'s renewable grid with wind and hydro power sourcing',
    color: 'from-green-500 to-emerald-500'
  },
  {
    icon: TrendingUp,
    title: 'Scalability',
    metric: '300 MW Expansion',
    description: 'Expansion-ready design with pre-approved permits for doubling capacity by 2026',
    color: 'from-purple-500 to-pink-500'
  }
];

export const InfrastructureHighlights = () => {
  return (
    <section className="py-12 sm:py-16 md:py-20 bg-background">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="text-center mb-8 sm:mb-12 space-y-3 sm:space-y-4">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-foreground">
            World-Class Infrastructure
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
            Purpose-built facility designed for the most demanding computational workloads
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {highlights.map((highlight, index) => {
            const Icon = highlight.icon;
            return (
              <div 
                key={index}
                className="group relative bg-card border border-border rounded-xl p-5 sm:p-6 hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10"
              >
                {/* Icon with gradient background */}
                <div className={`inline-flex p-3 rounded-lg bg-gradient-to-br ${highlight.color} mb-4`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>

                {/* Content */}
                <h3 className="text-lg sm:text-xl font-bold text-foreground mb-2">
                  {highlight.title}
                </h3>
                
                <div className="text-xl sm:text-2xl font-bold text-primary mb-3">
                  {highlight.metric}
                </div>
                
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {highlight.description}
                </p>

                {/* Hover effect gradient */}
                <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-primary/0 to-primary/0 group-hover:from-primary/5 group-hover:to-transparent transition-all duration-300 pointer-events-none"></div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
