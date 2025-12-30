import React, { useState } from 'react';
import { ScrollReveal } from '@/components/landing/ScrollAnimations';
import { 
  Wind, Droplets, Waves, Thermometer, DollarSign, Zap, 
  CheckCircle2, XCircle, ArrowRight, Server, Gauge, 
  Snowflake, Factory, Settings, Shield
} from 'lucide-react';
import { AnimatedCounter } from '@/components/ui/AnimatedCounter';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BitcoinSectionWrapper, BitcoinSectionHeader, BitcoinKeyInsight } from './shared';

const DatacenterCoolingSection: React.FC = () => {
  const [selectedCooling, setSelectedCooling] = useState<'air' | 'hydro' | 'immersion'>('air');

  const coolingMethods = {
    air: {
      name: 'Air-Cooled',
      icon: Wind,
      color: 'hsl(var(--watt-trust))',
      pue: '1.3-1.5',
      density: '5-10 kW/rack',
      upfrontCost: 'Low',
      opCost: 'High',
      description: 'Traditional HVAC systems using fans and air circulation to dissipate heat from mining equipment.',
      howItWorks: [
        'Hot air is extracted from mining equipment via exhaust fans',
        'Cold air intake from outside (or chilled) replaces hot air',
        'Heat exchangers transfer thermal energy to ambient air',
        'In cold climates, free cooling reduces or eliminates HVAC costs'
      ],
      pros: [
        'Lowest upfront capital investment',
        'Simple installation and maintenance',
        'Well-understood technology',
        'Easy hardware access for repairs',
        'No specialized fluids required'
      ],
      cons: [
        'Highest energy consumption for cooling',
        'Limited power density per square foot',
        'Weather dependent (less efficient in hot climates)',
        'Higher noise levels from fans',
        'Dust and humidity concerns'
      ],
      bestFor: 'Cold climate locations (like Alberta), small to medium operations, budget-conscious deployments',
      wattbyteNote: 'WattByte\'s Alberta facility leverages cold climate air cooling, achieving PUE of 1.2-1.3 during winter months with minimal HVAC costs.'
    },
    hydro: {
      name: 'Hydro Cooling',
      icon: Droplets,
      color: 'hsl(var(--watt-bitcoin))',
      pue: '1.2-1.4',
      density: '15-25 kW/rack',
      upfrontCost: 'Medium',
      opCost: 'Medium',
      description: 'Liquid-to-air heat exchangers using water or glycol solutions to transfer heat more efficiently than air alone.',
      howItWorks: [
        'Coolant circulates through pipes near heat-generating components',
        'Heat is absorbed by the liquid (water or water-glycol mix)',
        'Hot liquid flows to cooling towers or dry coolers',
        'Cooled liquid returns to absorb more heat'
      ],
      pros: [
        'More efficient than pure air cooling',
        'Higher power density possible',
        'More consistent cooling regardless of weather',
        'Can utilize waste heat for building heating',
        'Quieter than high-volume air systems'
      ],
      cons: [
        'Higher upfront costs than air cooling',
        'Risk of leaks damaging equipment',
        'Requires water infrastructure and treatment',
        'More complex maintenance requirements',
        'Water consumption in evaporative systems'
      ],
      bestFor: 'Medium to large operations, locations with water access, facilities wanting balance of efficiency and cost',
      wattbyteNote: 'Rear-door heat exchangers and in-row cooling units are common hybrid approaches, combining water efficiency with air-cooled hardware compatibility.'
    },
    immersion: {
      name: 'Immersion Cooling',
      icon: Waves,
      color: 'hsl(var(--watt-success))',
      pue: '1.02-1.10',
      density: '100+ kW/rack',
      upfrontCost: 'High',
      opCost: 'Low',
      description: 'Mining hardware is fully submerged in specially engineered dielectric fluid that absorbs and transfers heat.',
      howItWorks: [
        'Hardware is submerged in non-conductive dielectric fluid',
        'Heat transfers directly from chips to surrounding liquid',
        'Single-phase: fluid remains liquid, pumped to heat exchangers',
        'Two-phase: fluid boils at chip surface, vapor condenses and returns'
      ],
      pros: [
        'Near-perfect energy efficiency (PUE close to 1.0)',
        'Enables overclocking for 20-30% more hashrate',
        'Extends hardware lifespan (no dust, humidity, thermal cycling)',
        'Maximum power density (smallest physical footprint)',
        'Silent operation (no fans needed)',
        'Can operate in extreme environments'
      ],
      cons: [
        'Highest upfront capital investment',
        'Specialized dielectric fluids are expensive ($15-50/liter)',
        'Complex maintenance procedures',
        'Hardware modifications may void warranties',
        'Training required for technicians',
        'Fluid disposal/recycling considerations'
      ],
      bestFor: 'Large-scale industrial operations, hot climates, operations prioritizing maximum hashrate per square foot',
      wattbyteNote: 'Two-phase immersion (where fluid boils at ~50°C) offers the highest efficiency, with some operators reporting 25% hashrate gains from overclocking.'
    }
  };

  const comparisonData = [
    { metric: 'Power Usage Effectiveness', air: '1.3-1.5', hydro: '1.2-1.4', immersion: '1.02-1.10', winner: 'immersion' },
    { metric: 'Power Density (kW/rack)', air: '5-10', hydro: '15-25', immersion: '100+', winner: 'immersion' },
    { metric: 'Upfront Cost', air: 'Low', hydro: 'Medium', immersion: 'High', winner: 'air' },
    { metric: 'Operating Cost', air: 'High', hydro: 'Medium', immersion: 'Low', winner: 'immersion' },
    { metric: 'Maintenance Complexity', air: 'Simple', hydro: 'Moderate', immersion: 'Complex', winner: 'air' },
    { metric: 'Hardware Lifespan', air: '3-4 years', hydro: '4-5 years', immersion: '5-7 years', winner: 'immersion' },
    { metric: 'Overclocking Potential', air: 'Limited', hydro: 'Moderate', immersion: 'Maximum', winner: 'immersion' },
    { metric: 'Climate Dependency', air: 'High', hydro: 'Low', immersion: 'None', winner: 'immersion' }
  ];

  const infrastructureRequirements = [
    { 
      category: 'Power Infrastructure', 
      icon: Zap,
      items: ['Substation capacity (minimum 10MW for scale)', 'Redundant power feeds (N+1 or 2N)', 'High-efficiency transformers', 'Power factor correction systems', 'Emergency backup generators']
    },
    { 
      category: 'Network & Connectivity', 
      icon: Server,
      items: ['Low-latency internet (<10ms to mining pool)', 'Redundant fiber connections', 'On-site network operations center', 'Stratum proxy servers', 'Real-time monitoring systems']
    },
    { 
      category: 'Physical Security', 
      icon: Shield,
      items: ['24/7 security personnel', 'Perimeter fencing and access control', 'Video surveillance with retention', 'Biometric access to sensitive areas', 'Fire suppression systems']
    },
    { 
      category: 'Environmental Controls', 
      icon: Thermometer,
      items: ['Temperature and humidity monitoring', 'Air quality management (dust filtration)', 'Water treatment (for liquid cooling)', 'Noise mitigation (for neighbors)', 'Environmental compliance systems']
    }
  ];

  const selectedMethod = coolingMethods[selectedCooling];
  const IconComponent = selectedMethod.icon;

  return (
    <BitcoinSectionWrapper theme="light" id="datacenter-cooling">
      <ScrollReveal direction="up">
        <BitcoinSectionHeader
          badge="Infrastructure Deep Dive"
          badgeIcon={Factory}
          title="Datacenter Cooling Technologies"
          description="Cooling is the second-largest cost in Bitcoin mining after electricity. Understanding cooling technologies is crucial for optimizing profitability."
          theme="light"
        />
      </ScrollReveal>

      {/* Cooling Method Selector */}
      <ScrollReveal direction="up" delay={0.1}>
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          {(Object.keys(coolingMethods) as Array<keyof typeof coolingMethods>).map((key) => {
            const method = coolingMethods[key];
            const Icon = method.icon;
            const isSelected = selectedCooling === key;
            return (
              <button
                key={key}
                onClick={() => setSelectedCooling(key)}
                className={`p-6 rounded-2xl border-2 transition-all text-left ${
                  isSelected 
                    ? 'border-[hsl(var(--watt-bitcoin))] bg-card shadow-lg' 
                    : 'border-transparent bg-muted hover:bg-card hover:shadow-md'
                }`}
              >
                <div 
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                  style={{ backgroundColor: `${method.color}20` }}
                >
                  <Icon className="w-6 h-6" style={{ color: method.color }} />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">{method.name}</h3>
                <div className="flex gap-4 text-base">
                  <span className="text-muted-foreground">PUE: <span className="font-semibold text-foreground">{method.pue}</span></span>
                  <span className="text-muted-foreground">Density: <span className="font-semibold text-foreground">{method.density}</span></span>
                </div>
              </button>
            );
          })}
        </div>
      </ScrollReveal>

      {/* Selected Method Details */}
      <ScrollReveal direction="up" delay={0.2}>
        <div className="bg-card rounded-2xl p-6 md:p-8 border border-border mb-8">
          <div className="flex items-center gap-4 mb-6">
            <div 
              className="w-16 h-16 rounded-2xl flex items-center justify-center"
              style={{ backgroundColor: `${selectedMethod.color}20` }}
            >
              <IconComponent className="w-8 h-8" style={{ color: selectedMethod.color }} />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-foreground">{selectedMethod.name}</h3>
              <p className="text-base text-muted-foreground">{selectedMethod.description}</p>
            </div>
          </div>

          <Tabs defaultValue="how" className="w-full">
            <TabsList className="grid w-full grid-cols-4 mb-6">
              <TabsTrigger value="how">How It Works</TabsTrigger>
              <TabsTrigger value="pros">Advantages</TabsTrigger>
              <TabsTrigger value="cons">Challenges</TabsTrigger>
              <TabsTrigger value="use">Best Use Cases</TabsTrigger>
            </TabsList>

            <TabsContent value="how" className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                {selectedMethod.howItWorks.map((step, index) => (
                  <div key={index} className="flex gap-3 p-4 bg-muted rounded-xl">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[hsl(var(--watt-bitcoin)/0.1)] flex items-center justify-center">
                      <span className="text-sm font-bold text-[hsl(var(--watt-bitcoin))]">{index + 1}</span>
                    </div>
                    <p className="text-base text-foreground">{step}</p>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="pros" className="space-y-3">
              {selectedMethod.pros.map((pro, index) => (
                <div key={index} className="flex items-center gap-3 p-3 bg-[hsl(var(--watt-success)/0.05)] rounded-xl border border-[hsl(var(--watt-success)/0.2)]">
                  <CheckCircle2 className="w-5 h-5 text-[hsl(var(--watt-success))] flex-shrink-0" />
                  <span className="text-base text-foreground">{pro}</span>
                </div>
              ))}
            </TabsContent>

            <TabsContent value="cons" className="space-y-3">
              {selectedMethod.cons.map((con, index) => (
                <div key={index} className="flex items-center gap-3 p-3 bg-destructive/5 rounded-xl border border-destructive/20">
                  <XCircle className="w-5 h-5 text-destructive flex-shrink-0" />
                  <span className="text-base text-foreground">{con}</span>
                </div>
              ))}
            </TabsContent>

            <TabsContent value="use">
              <div className="space-y-4">
                <div className="p-4 bg-muted rounded-xl">
                  <h4 className="font-bold text-foreground mb-2">Ideal Scenarios</h4>
                  <p className="text-base text-foreground">{selectedMethod.bestFor}</p>
                </div>
                <div 
                  className="p-4 rounded-xl border"
                  style={{ 
                    backgroundColor: `${selectedMethod.color}10`, 
                    borderColor: `${selectedMethod.color}30` 
                  }}
                >
                  <h4 className="font-bold mb-2" style={{ color: selectedMethod.color }}>WattByte Insight</h4>
                  <p className="text-base text-foreground">{selectedMethod.wattbyteNote}</p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </ScrollReveal>

      {/* Comparison Table */}
      <ScrollReveal direction="up" delay={0.3}>
        <div className="bg-card rounded-2xl p-6 md:p-8 border border-border mb-8 overflow-x-auto">
          <h3 className="text-2xl font-bold text-foreground mb-6">Cooling Method Comparison</h3>
          <table className="w-full min-w-[600px]">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 text-foreground font-bold">Metric</th>
                <th className="text-center py-3 px-4 text-[hsl(var(--watt-trust))] font-bold">
                  <Wind className="w-5 h-5 inline mr-2" />Air-Cooled
                </th>
                <th className="text-center py-3 px-4 text-[hsl(var(--watt-bitcoin))] font-bold">
                  <Droplets className="w-5 h-5 inline mr-2" />Hydro
                </th>
                <th className="text-center py-3 px-4 text-[hsl(var(--watt-success))] font-bold">
                  <Waves className="w-5 h-5 inline mr-2" />Immersion
                </th>
              </tr>
            </thead>
            <tbody>
              {comparisonData.map((row, index) => (
                <tr key={index} className="border-b border-border/50 hover:bg-muted/30">
                  <td className="py-3 px-4 font-medium text-foreground">{row.metric}</td>
                  <td className={`py-3 px-4 text-center ${row.winner === 'air' ? 'bg-[hsl(var(--watt-success)/0.1)] font-bold text-[hsl(var(--watt-success))]' : 'text-muted-foreground'}`}>
                    {row.air}
                  </td>
                  <td className={`py-3 px-4 text-center ${row.winner === 'hydro' ? 'bg-[hsl(var(--watt-success)/0.1)] font-bold text-[hsl(var(--watt-success))]' : 'text-muted-foreground'}`}>
                    {row.hydro}
                  </td>
                  <td className={`py-3 px-4 text-center ${row.winner === 'immersion' ? 'bg-[hsl(var(--watt-success)/0.1)] font-bold text-[hsl(var(--watt-success))]' : 'text-muted-foreground'}`}>
                    {row.immersion}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </ScrollReveal>

      {/* PUE Explanation */}
      <ScrollReveal direction="up" delay={0.4}>
        <div className="bg-gradient-to-br from-[hsl(var(--watt-navy))] via-[hsl(var(--watt-navy)/0.95)] to-[hsl(var(--watt-navy)/0.9)] rounded-2xl p-6 md:p-8 mb-8">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[hsl(var(--watt-bitcoin)/0.2)] border border-[hsl(var(--watt-bitcoin)/0.4)] mb-4">
                <Gauge className="w-4 h-4 text-[hsl(var(--watt-bitcoin))]" />
                <span className="text-sm font-medium text-[hsl(var(--watt-bitcoin))]">Key Metric</span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Understanding PUE</h3>
              <p className="text-white/90 text-base leading-relaxed mb-4">
                <strong className="text-white">Power Usage Effectiveness (PUE)</strong> measures datacenter energy efficiency. 
                It's the ratio of total facility power to IT equipment power.
              </p>
              <div className="bg-white/10 rounded-xl p-4 border border-white/20 mb-4">
                <code className="text-[hsl(var(--watt-bitcoin))] font-mono text-lg">
                  PUE = Total Facility Power ÷ IT Equipment Power
                </code>
              </div>
              <p className="text-white/80 text-base">
                A PUE of 1.0 is perfect (impossible in practice). A PUE of 2.0 means you're using 
                as much power for cooling as for computing. Lower is better.
              </p>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white/10 rounded-xl p-4 text-center border border-white/20">
                <div className="text-3xl font-bold text-[hsl(var(--watt-trust))] mb-1">1.5</div>
                <div className="text-white/80 text-sm">Typical Air</div>
                <div className="text-white/60 text-xs mt-2">50% overhead</div>
              </div>
              <div className="bg-white/10 rounded-xl p-4 text-center border border-white/20">
                <div className="text-3xl font-bold text-[hsl(var(--watt-bitcoin))] mb-1">1.25</div>
                <div className="text-white/80 text-sm">Good Hydro</div>
                <div className="text-white/60 text-xs mt-2">25% overhead</div>
              </div>
              <div className="bg-white/10 rounded-xl p-4 text-center border border-white/20">
                <div className="text-3xl font-bold text-[hsl(var(--watt-success))] mb-1">1.05</div>
                <div className="text-white/80 text-sm">Best Immersion</div>
                <div className="text-white/60 text-xs mt-2">5% overhead</div>
              </div>
            </div>
          </div>
        </div>
      </ScrollReveal>

      {/* Infrastructure Requirements */}
      <ScrollReveal direction="up" delay={0.5}>
        <div className="mb-8">
          <h3 className="text-2xl font-bold text-foreground mb-6 text-center">Mining Facility Infrastructure</h3>
          <div className="grid md:grid-cols-2 gap-6">
            {infrastructureRequirements.map((req, index) => (
              <div key={index} className="bg-card rounded-2xl p-6 border border-border">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-[hsl(var(--watt-bitcoin)/0.1)] flex items-center justify-center">
                    <req.icon className="w-5 h-5 text-[hsl(var(--watt-bitcoin))]" />
                  </div>
                  <h4 className="font-bold text-foreground">{req.category}</h4>
                </div>
                <ul className="space-y-2">
                  {req.items.map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-base text-muted-foreground">
                      <CheckCircle2 className="w-4 h-4 text-[hsl(var(--watt-success))] flex-shrink-0 mt-0.5" />
                      <span className="text-foreground">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </ScrollReveal>
    </BitcoinSectionWrapper>
  );
};

export default DatacenterCoolingSection;
