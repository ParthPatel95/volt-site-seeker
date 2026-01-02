import React from 'react';
import { 
  Thermometer, 
  Droplets, 
  Volume2, 
  Shield, 
  Leaf, 
  Zap,
  CheckCircle,
  TrendingUp
} from 'lucide-react';
import { ScrollReveal } from '@/components/landing/ScrollAnimations';
import { Card, CardContent } from '@/components/ui/card';
import LearningObjectives from './LearningObjectives';
import SectionSummary from './SectionSummary';
import InteractivePUEComparison from './InteractivePUEComparison';

const advantages = [
  {
    icon: Thermometer,
    title: 'Extreme Temperature Operation',
    description: 'Operate efficiently in environments up to 45°C ambient temperature, enabling deployment in hot climates like Middle East and Southeast Asia.',
    stats: '45°C Max',
    color: 'from-orange-500 to-red-500'
  },
  {
    icon: Droplets,
    title: 'Superior Energy Efficiency',
    description: 'Achieve PUE ratings of 1.02-1.08, significantly lower than air-cooled systems (1.3-1.6), reducing operational costs.',
    stats: '1.02-1.08 PUE',
    color: 'from-blue-500 to-cyan-500'
  },
  {
    icon: Volume2,
    title: 'Reduced Noise Pollution',
    description: 'Eliminate high-speed fans, reducing noise by up to 70%. Essential for regulatory compliance in populated areas.',
    stats: '70% Quieter',
    color: 'from-green-500 to-emerald-500'
  },
  {
    icon: Shield,
    title: 'Environmental Protection',
    description: 'Closed-loop systems protect mining hardware from dust, humidity, salt air, and corrosive environments.',
    stats: 'Full Seal',
    color: 'from-purple-500 to-violet-500'
  },
  {
    icon: Leaf,
    title: 'Sustainable Operations',
    description: 'Lower energy consumption and waste heat recovery potential make hydro-cooling the most environmentally responsible choice.',
    stats: 'Eco-Friendly',
    color: 'from-teal-500 to-green-500'
  },
  {
    icon: Zap,
    title: 'Higher Hash Density',
    description: 'Better thermal management allows for higher compute density per square meter compared to air-cooled facilities.',
    stats: '2x Density',
    color: 'from-yellow-500 to-orange-500'
  }
];

const caseStudies = [
  {
    region: 'Middle East',
    capacity: '240 MW',
    climate: 'Hot & Dusty',
    solution: 'Dry-Wet Tower Cooling',
    result: 'Successful year-round operation at 45°C ambient'
  },
  {
    region: 'Southeast Asia',
    capacity: '150 MW',
    climate: 'Hot & Humid',
    solution: 'Plate Heat Exchanger',
    result: 'PUE of 1.05 achieved with river water cooling'
  },
  {
    region: 'Northern Europe',
    capacity: '100 MW',
    climate: 'Cold',
    solution: 'Dry Tower Only',
    result: 'Zero water consumption, 1.02 PUE'
  }
];

const HydroAdvantagesSection = () => {
  return (
    <section id="advantages" className="py-20 bg-gradient-to-b from-background to-muted/50">
      <div className="max-w-7xl mx-auto px-6">
        <ScrollReveal>
          <div className="text-center mb-16">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 text-blue-700 text-sm font-medium mb-4">
              <Droplets className="w-4 h-4" />
              Why Hydro-Cooling?
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Superior Cooling Technology
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Hydro-cooling enables mining operations in environments where traditional 
              air-cooling would fail, while delivering unprecedented efficiency.
            </p>
          </div>
        </ScrollReveal>

        <LearningObjectives
          objectives={[
            "Understand the 6 key advantages of hydro-cooling over air-cooling",
            "Compare PUE ratings and operational metrics between cooling methods",
            "Analyze real-world deployment case studies across different climates"
          ]}
          estimatedTime="8 min"
        />

        {/* Advantages Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-20">
          {advantages.map((advantage, index) => (
            <ScrollReveal key={index} delay={index * 100}>
              <Card className="h-full bg-card border-border hover:shadow-lg hover:border-blue-300 transition-all duration-300 group overflow-hidden">
                <CardContent className="p-6">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${advantage.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <advantage.icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-semibold text-foreground">{advantage.title}</h3>
                    <span className="text-xs font-bold px-2 py-1 rounded-full bg-blue-100 text-blue-700">
                      {advantage.stats}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">{advantage.description}</p>
                </CardContent>
              </Card>
            </ScrollReveal>
          ))}
        </div>

        {/* Comparison Chart */}
        <ScrollReveal>
          <div className="bg-card rounded-2xl border border-border p-8 mb-20">
            <h3 className="text-2xl font-bold text-foreground mb-6 text-center">
              Hydro vs Air Cooling Comparison
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-4 px-4 font-semibold text-foreground">Metric</th>
                    <th className="text-center py-4 px-4 font-semibold text-blue-600">Hydro-Cooling</th>
                    <th className="text-center py-4 px-4 font-semibold text-muted-foreground">Air-Cooling</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { metric: 'PUE Rating', hydro: '1.02 - 1.08', air: '1.30 - 1.60' },
                    { metric: 'Max Ambient Temp', hydro: '45°C', air: '35°C' },
                    { metric: 'Noise Level', hydro: '60-70 dB', air: '85-95 dB' },
                    { metric: 'Dust Protection', hydro: 'Complete', air: 'Partial' },
                    { metric: 'Compute Density', hydro: 'High', air: 'Medium' },
                    { metric: 'Maintenance Frequency', hydro: 'Lower', air: 'Higher' },
                  ].map((row, index) => (
                    <tr key={index} className="border-b border-border/50 last:border-0">
                      <td className="py-4 px-4 font-medium text-foreground">{row.metric}</td>
                      <td className="py-4 px-4 text-center">
                        <span className="inline-flex items-center gap-1 text-blue-600 font-semibold">
                          <CheckCircle className="w-4 h-4" />
                          {row.hydro}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-center text-muted-foreground">{row.air}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </ScrollReveal>

        {/* Case Studies */}
        <ScrollReveal>
          <h3 className="text-2xl font-bold text-foreground mb-6 text-center">
            Real-World Deployments
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {caseStudies.map((study, index) => (
              <Card key={index} className="bg-gradient-to-br from-watt-navy to-blue-900 text-white border-0">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-2xl font-bold">{study.capacity}</span>
                    <span className="px-3 py-1 rounded-full bg-white/20 text-sm">{study.climate}</span>
                  </div>
                  <h4 className="text-lg font-semibold mb-2">{study.region}</h4>
                  <p className="text-sm text-white/70 mb-4">
                    <span className="text-blue-300">Solution:</span> {study.solution}
                  </p>
                  <div className="flex items-center gap-2 text-sm text-green-300">
                    <TrendingUp className="w-4 h-4" />
                    {study.result}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollReveal>

        {/* Interactive PUE Comparison */}
        <ScrollReveal delay={100}>
          <InteractivePUEComparison />
        </ScrollReveal>

        <SectionSummary
          takeaways={[
            "Hydro-cooling achieves PUE of 1.02-1.08 vs 1.3-1.6 for air-cooling",
            "Enables operation in up to 45°C ambient temperatures",
            "Reduces noise by up to 70% compared to air-cooled systems",
            "Proven deployments across Middle East, Southeast Asia, and Northern Europe"
          ]}
          nextSectionId="container-products"
          nextSectionLabel="Explore Container Products"
        />
      </div>
    </section>
  );
};

export default HydroAdvantagesSection;
