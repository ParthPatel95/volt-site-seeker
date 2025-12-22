import React from 'react';
import { ScrollReveal } from '@/components/landing/ScrollAnimations';
import { 
  Leaf, Zap, Wind, Sun, Droplets, Factory, 
  TrendingDown, ArrowRight, CheckCircle2, Globe,
  Flame, Timer, DollarSign
} from 'lucide-react';
import { AnimatedCounter } from '@/components/ui/AnimatedCounter';

const MiningSustainabilitySection: React.FC = () => {
  const energySources = [
    { 
      source: 'Hydroelectric', 
      percentage: 23, 
      icon: Droplets, 
      color: 'watt-trust',
      description: 'Abundant in Quebec, Norway, Paraguay, and Pacific Northwest',
      locations: ['Quebec, Canada', 'Norway', 'Paraguay', 'Iceland']
    },
    { 
      source: 'Wind', 
      percentage: 12, 
      icon: Wind, 
      color: 'watt-success',
      description: 'Growing in Texas (ERCOT) and Northern Europe',
      locations: ['Texas, USA', 'Denmark', 'Germany']
    },
    { 
      source: 'Solar', 
      percentage: 8, 
      icon: Sun, 
      color: 'watt-warning',
      description: 'Expanding in sunny regions with cheap land',
      locations: ['California', 'Australia', 'UAE']
    },
    { 
      source: 'Nuclear', 
      percentage: 5, 
      icon: Zap, 
      color: 'watt-bitcoin',
      description: 'Baseload power with zero emissions',
      locations: ['Pennsylvania', 'France', 'Ontario']
    },
    { 
      source: 'Natural Gas', 
      percentage: 38, 
      icon: Flame, 
      color: 'watt-navy',
      description: 'Often using stranded or flared gas that would be wasted',
      locations: ['Texas', 'Alberta', 'North Dakota']
    },
    { 
      source: 'Other/Mixed', 
      percentage: 14, 
      icon: Factory, 
      color: 'watt-navy',
      description: 'Grid mix varies by location and time',
      locations: ['Various']
    }
  ];

  const sustainabilityBenefits = [
    {
      title: 'Stranded Energy Monetization',
      icon: Zap,
      description: 'Bitcoin mining can utilize energy in remote locations where building transmission lines is uneconomical. Hydroelectric dams, remote wind farms, and stranded natural gas become profitable.',
      example: 'A hydroelectric dam in rural Congo can mine Bitcoin instead of letting energy go unused, funding local development.'
    },
    {
      title: 'Flared Gas Capture',
      icon: Flame,
      description: 'Oil wells produce associated natural gas that\'s often burned (flared) due to lack of pipeline infrastructure. Bitcoin mining converts this waste into value while reducing methane emissions.',
      example: 'Texas and North Dakota operations capture gas that would otherwise be burned, reducing emissions by 63% compared to flaring.'
    },
    {
      title: 'Grid Stabilization',
      icon: TrendingDown,
      description: 'Bitcoin miners can instantly reduce power consumption during peak demand, acting as a "buyer of last resort" for excess renewable energy and stabilizing volatile grids.',
      example: 'ERCOT (Texas) miners curtail operations during heat waves, adding grid stability. AESO (Alberta) offers demand response programs.'
    },
    {
      title: 'Renewable Energy Financing',
      icon: Sun,
      description: 'Mining provides guaranteed revenue for renewable projects, making solar and wind farms economically viable even before grid connections are complete.',
      example: 'Solar farms in West Texas mine Bitcoin during construction, generating revenue before the grid connection is finished.'
    }
  ];

  const demandResponseInfo = {
    title: 'Demand Response Programs',
    description: 'Grid operators pay miners to reduce consumption during peak demand periods. This creates additional revenue streams while supporting grid stability.',
    programs: [
      { grid: 'ERCOT (Texas)', program: '4CP / Ancillary Services', benefit: 'Reduce peak demand charges, earn ancillary revenue' },
      { grid: 'AESO (Alberta)', program: 'Operating Reserves', benefit: 'Earn revenue for curtailment during grid stress' },
      { grid: 'PJM (Eastern US)', program: 'Demand Response', benefit: 'Capacity payments for interruptible loads' },
      { grid: 'NYISO (New York)', program: 'Special Case Resources', benefit: 'Revenue for load reduction during emergencies' }
    ]
  };

  const renewablePercentage = 48; // Approximate sustainable energy mix in Bitcoin mining

  return (
    <section className="py-12 md:py-16 px-4 sm:px-6 bg-gradient-to-br from-watt-success/5 via-background to-watt-trust/5">
      <div className="max-w-6xl mx-auto">
        <ScrollReveal direction="up">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-watt-success/10 border border-watt-success/20 mb-4">
              <Leaf className="w-4 h-4 text-watt-success" />
              <span className="text-sm font-medium text-watt-success">Energy & Sustainability</span>
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
              Bitcoin Mining & Energy
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Bitcoin mining is uniquely positioned to support renewable energy adoption 
              and grid stability. Here's how the industry is evolving.
            </p>
          </div>
        </ScrollReveal>

        {/* Sustainable Energy Stat */}
        <ScrollReveal direction="up" delay={0.1}>
          <div className="bg-gradient-to-r from-watt-success to-watt-success/80 rounded-2xl p-6 md:p-8 mb-8">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <h3 className="text-2xl font-bold text-white mb-2">Sustainable Energy Mix</h3>
                <p className="text-white/80 mb-4">
                  According to the Bitcoin Mining Council, approximately half of Bitcoin mining 
                  now uses sustainable energy sources.
                </p>
                <div className="flex items-center gap-4">
                  <div className="text-5xl font-bold text-white">
                    <AnimatedCounter end={renewablePercentage} suffix="%" />
                  </div>
                  <div className="text-white/70 text-sm">
                    of Bitcoin mining uses<br/>sustainable energy
                  </div>
                </div>
              </div>
              <div className="bg-white/10 rounded-xl p-4 border border-white/20">
                <h4 className="font-bold text-white mb-3">Energy Source Breakdown</h4>
                <div className="space-y-2">
                  {energySources.slice(0, 4).map((source) => (
                    <div key={source.source} className="flex items-center gap-3">
                      <source.icon className="w-4 h-4 text-white/80" />
                      <span className="text-white/80 text-sm flex-1">{source.source}</span>
                      <span className="font-bold text-white">{source.percentage}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </ScrollReveal>

        {/* Energy Sources Grid */}
        <ScrollReveal direction="up" delay={0.2}>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {energySources.map((source, index) => (
              <div key={source.source} className="bg-card rounded-xl p-5 shadow-institutional hover:shadow-institutional-lg transition-shadow">
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-10 h-10 rounded-lg bg-${source.color}/10 flex items-center justify-center`}>
                    <source.icon className={`w-5 h-5 text-${source.color}`} />
                  </div>
                  <div>
                    <h4 className="font-bold text-foreground">{source.source}</h4>
                    <span className={`text-lg font-bold text-${source.color}`}>{source.percentage}%</span>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mb-3">{source.description}</p>
                <div className="flex flex-wrap gap-1">
                  {source.locations.slice(0, 3).map((loc, i) => (
                    <span key={i} className="text-xs px-2 py-1 bg-muted rounded-full text-muted-foreground">
                      {loc}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </ScrollReveal>

        {/* Sustainability Benefits */}
        <ScrollReveal direction="up" delay={0.3}>
          <div className="mb-8">
            <h3 className="text-2xl font-bold text-foreground mb-6 text-center">
              How Bitcoin Mining Supports Clean Energy
            </h3>
            <div className="grid md:grid-cols-2 gap-6">
              {sustainabilityBenefits.map((benefit, index) => (
                <div key={index} className="bg-card rounded-2xl p-6 shadow-institutional">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-watt-success/10 flex items-center justify-center">
                      <benefit.icon className="w-6 h-6 text-watt-success" />
                    </div>
                    <h4 className="text-xl font-bold text-foreground">{benefit.title}</h4>
                  </div>
                  <p className="text-muted-foreground mb-4">{benefit.description}</p>
                  <div className="p-3 bg-muted rounded-xl">
                    <p className="text-sm text-foreground/80">
                      <strong className="text-watt-success">Example:</strong> {benefit.example}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </ScrollReveal>

        {/* Demand Response */}
        <ScrollReveal direction="up" delay={0.4}>
          <div className="bg-gradient-to-br from-watt-navy via-watt-navy/95 to-watt-navy/90 rounded-2xl p-6 md:p-8">
            <div className="flex items-center gap-3 mb-4">
              <Timer className="w-6 h-6 text-watt-bitcoin" />
              <h3 className="text-2xl font-bold text-white">{demandResponseInfo.title}</h3>
            </div>
            <p className="text-white/80 mb-6">{demandResponseInfo.description}</p>
            
            <div className="grid md:grid-cols-2 gap-4">
              {demandResponseInfo.programs.map((program, index) => (
                <div key={index} className="bg-white/5 rounded-xl p-4 border border-white/10">
                  <div className="flex items-center gap-2 mb-2">
                    <Globe className="w-4 h-4 text-watt-bitcoin" />
                    <h4 className="font-bold text-white">{program.grid}</h4>
                  </div>
                  <p className="text-watt-bitcoin text-sm mb-1">{program.program}</p>
                  <p className="text-white/60 text-sm">{program.benefit}</p>
                </div>
              ))}
            </div>

            <div className="mt-6 p-4 bg-watt-bitcoin/20 rounded-xl border border-watt-bitcoin/30">
              <div className="flex items-start gap-3">
                <DollarSign className="w-5 h-5 text-watt-bitcoin flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-white mb-1">WattByte's Alberta Advantage</h4>
                  <p className="text-white/70 text-sm">
                    Our Alberta facilities participate in AESO's Operating Reserve program, earning additional 
                    revenue while supporting grid stability. During price spikes, we can curtail operations 
                    to capture the highest-value hours.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
};

export default MiningSustainabilitySection;
