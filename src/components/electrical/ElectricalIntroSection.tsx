import React from 'react';
import { Zap, Activity, Gauge, TrendingUp } from 'lucide-react';
import { ScrollReveal } from '@/components/landing/ScrollAnimations';

const ElectricalIntroSection = () => {
  const keyMetrics = [
    {
      icon: Zap,
      label: "Power Capacity",
      value: "MW",
      description: "Total available electrical capacity for mining operations"
    },
    {
      icon: Activity,
      label: "Utilization Rate",
      value: "95%+",
      description: "Target equipment utilization for optimal ROI"
    },
    {
      icon: Gauge,
      label: "Power Factor",
      value: "0.95+",
      description: "Efficiency of power delivery to equipment"
    },
    {
      icon: TrendingUp,
      label: "Uptime Target",
      value: "99.9%",
      description: "Electrical system reliability goal"
    }
  ];

  return (
    <section id="intro" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <ScrollReveal>
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-2 bg-watt-bitcoin/10 text-watt-bitcoin rounded-full text-sm font-medium mb-4">
              Module 5: Electrical Infrastructure
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6">
              Electrical Infrastructure 101
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Master the complete electrical pathway from utility grid connection to mining equipment—
              the backbone of every successful mining operation.
            </p>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={100}>
          <div className="bg-card border border-border rounded-2xl p-8 mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-4">Why Electrical Infrastructure Matters</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <p className="text-muted-foreground mb-4">
                  Electrical infrastructure represents <span className="text-watt-bitcoin font-semibold">40-60% of total facility capital costs</span> and 
                  directly determines operational capacity, efficiency, and safety. Poor electrical design leads to:
                </p>
                <ul className="space-y-2 text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-destructive">•</span>
                    Equipment damage from voltage fluctuations
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-destructive">•</span>
                    Unplanned downtime from breaker trips
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-destructive">•</span>
                    Higher electricity costs from poor power factor
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-destructive">•</span>
                    Safety hazards including arc flash incidents
                  </li>
                </ul>
              </div>
              <div className="bg-muted/50 rounded-xl p-6">
                <h3 className="font-semibold text-foreground mb-3">The Power Journey</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-watt-bitcoin/20 rounded-full flex items-center justify-center text-watt-bitcoin font-bold">1</div>
                    <span className="text-muted-foreground">Utility Grid (138kV - 500kV)</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-watt-bitcoin/20 rounded-full flex items-center justify-center text-watt-bitcoin font-bold">2</div>
                    <span className="text-muted-foreground">Substation (25kV - 69kV)</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-watt-bitcoin/20 rounded-full flex items-center justify-center text-watt-bitcoin font-bold">3</div>
                    <span className="text-muted-foreground">Site Transformer (480V/600V)</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-watt-bitcoin/20 rounded-full flex items-center justify-center text-watt-bitcoin font-bold">4</div>
                    <span className="text-muted-foreground">Distribution (208V/240V)</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-watt-bitcoin/20 rounded-full flex items-center justify-center text-watt-bitcoin font-bold">5</div>
                    <span className="text-muted-foreground">Mining Equipment (12VDC)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={200}>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {keyMetrics.map((metric, index) => (
              <div key={index} className="bg-card border border-border rounded-xl p-6 text-center hover:border-watt-bitcoin/50 transition-colors">
                <div className="w-12 h-12 bg-watt-bitcoin/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <metric.icon className="w-6 h-6 text-watt-bitcoin" />
                </div>
                <div className="text-2xl font-bold text-foreground mb-1">{metric.value}</div>
                <div className="text-sm font-medium text-foreground mb-2">{metric.label}</div>
                <p className="text-xs text-muted-foreground">{metric.description}</p>
              </div>
            ))}
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
};

export default ElectricalIntroSection;
