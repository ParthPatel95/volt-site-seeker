import { useState } from 'react';
import { ScrollReveal } from '@/components/landing/ScrollAnimations';
import { Droplets, Flame, Check, X } from 'lucide-react';

const coolingTypes = [
  {
    id: 'single-phase',
    name: 'Single-Phase',
    icon: Droplets,
    description: 'Fluid remains liquid throughout - simpler, more common',
    color: 'cyan',
    pros: [
      'Lower fluid cost ($2-15/liter)',
      'Simpler tank design',
      'Easier maintenance',
      'No vapor management needed',
      'Well-established technology'
    ],
    cons: [
      'Lower heat transfer coefficient',
      'Requires pumps for circulation',
      'Higher fluid volume needed',
      'More temperature variation'
    ],
    specs: {
      'Heat Transfer': '300-1,000 W/m²·K',
      'Typical Fluids': 'Mineral oil, synthetic oils',
      'Max Chip Temp': '65-75°C',
      'System Complexity': 'Low-Medium',
      'Typical PUE': '1.03-1.08'
    },
    diagram: (
      <div className="relative h-48 bg-gradient-to-b from-cyan-900/20 to-cyan-950/40 rounded-xl border border-cyan-500/30 overflow-hidden">
        {/* Tank */}
        <div className="absolute inset-4 border-2 border-cyan-500/40 rounded-lg">
          {/* Fluid */}
          <div className="absolute bottom-0 left-0 right-0 h-3/4 bg-cyan-500/30 rounded-b-lg">
            {/* Flow arrows */}
            <div className="absolute left-2 top-1/2 text-cyan-400 animate-pulse">→</div>
            <div className="absolute right-2 top-1/2 text-cyan-400 animate-pulse">→</div>
          </div>
          {/* ASIC */}
          <div className="absolute bottom-1/4 left-1/2 -translate-x-1/2 w-20 h-8 bg-zinc-700 rounded border border-zinc-500 flex items-center justify-center">
            <span className="text-xs text-zinc-400">ASIC</span>
          </div>
          {/* Pump indicator */}
          <div className="absolute -right-8 top-1/2 -translate-y-1/2 w-6 h-6 bg-cyan-500/40 rounded-full flex items-center justify-center">
            <span className="text-xs">P</span>
          </div>
        </div>
        <div className="absolute bottom-2 left-4 text-xs text-cyan-400">Pump circulation</div>
      </div>
    )
  },
  {
    id: 'two-phase',
    name: 'Two-Phase',
    icon: Flame,
    description: 'Fluid boils at chip surface - maximum heat transfer',
    color: 'orange',
    pros: [
      'Superior heat transfer (5,000-25,000 W/m²·K)',
      'Passive circulation (no pumps)',
      'Uniform temperature distribution',
      'Best overclocking potential',
      'Lowest possible PUE'
    ],
    cons: [
      'Very expensive fluids ($100-300/liter)',
      'Requires sealed systems',
      'Vapor recovery complexity',
      'Environmental regulations (GWP)',
      'Specialized expertise needed'
    ],
    specs: {
      'Heat Transfer': '5,000-25,000 W/m²·K',
      'Typical Fluids': '3M Novec, Fluorinert',
      'Max Chip Temp': '50-60°C',
      'System Complexity': 'High',
      'Typical PUE': '1.01-1.03'
    },
    diagram: (
      <div className="relative h-48 bg-gradient-to-b from-orange-900/20 to-orange-950/40 rounded-xl border border-orange-500/30 overflow-hidden">
        {/* Tank */}
        <div className="absolute inset-4 border-2 border-orange-500/40 rounded-lg">
          {/* Fluid */}
          <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-orange-500/30 rounded-b-lg" />
          {/* Vapor space */}
          <div className="absolute top-0 left-0 right-0 h-1/2 bg-orange-300/10">
            {/* Rising bubbles/vapor */}
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="absolute w-1.5 h-1.5 bg-orange-400/60 rounded-full animate-bounce"
                style={{
                  left: `${20 + i * 15}%`,
                  bottom: '10%',
                  animationDelay: `${i * 0.2}s`,
                  animationDuration: '1.5s'
                }}
              />
            ))}
          </div>
          {/* ASIC */}
          <div className="absolute bottom-1/4 left-1/2 -translate-x-1/2 w-20 h-8 bg-zinc-700 rounded border border-zinc-500 flex items-center justify-center">
            <span className="text-xs text-zinc-400">ASIC</span>
          </div>
          {/* Condenser */}
          <div className="absolute top-2 left-1/2 -translate-x-1/2 w-16 h-3 bg-orange-500/40 rounded flex items-center justify-center">
            <span className="text-[10px]">Condenser</span>
          </div>
        </div>
        <div className="absolute bottom-2 left-4 text-xs text-orange-400">Boiling + condensation</div>
      </div>
    )
  }
];

export default function ImmersionTypesSection() {
  const [activeType, setActiveType] = useState('single-phase');
  const active = coolingTypes.find(t => t.id === activeType)!;

  return (
    <section id="types" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <LearningObjectives
          objectives={[
            "Differentiate single-phase vs two-phase immersion cooling mechanisms",
            "Compare heat transfer coefficients (300-1K vs 5K-25K W/m²·K)",
            "Evaluate cost vs performance trade-offs for each approach"
          ]}
          estimatedTime="6 min"
        />

        <ScrollReveal>
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Single-Phase vs Two-Phase Cooling
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Two fundamentally different approaches to immersion cooling, each with distinct 
              trade-offs in cost, complexity, and performance.
            </p>
          </div>
        </ScrollReveal>

        {/* Type Selector */}
        <ScrollReveal delay={100}>
          <div className="flex justify-center gap-4 mb-12">
            {coolingTypes.map((type) => (
              <button
                key={type.id}
                onClick={() => setActiveType(type.id)}
                className={`flex items-center gap-3 px-6 py-4 rounded-xl border-2 transition-all ${
                  activeType === type.id
                    ? type.color === 'cyan'
                      ? 'border-cyan-500 bg-cyan-500/10'
                      : 'border-orange-500 bg-orange-500/10'
                    : 'border-border bg-card hover:border-muted-foreground/50'
                }`}
              >
                <type.icon className={`w-6 h-6 ${
                  activeType === type.id
                    ? type.color === 'cyan' ? 'text-cyan-500' : 'text-orange-500'
                    : 'text-muted-foreground'
                }`} />
                <div className="text-left">
                  <div className={`font-semibold ${activeType === type.id ? 'text-foreground' : 'text-muted-foreground'}`}>
                    {type.name}
                  </div>
                  <div className="text-xs text-muted-foreground">{type.description}</div>
                </div>
              </button>
            ))}
          </div>
        </ScrollReveal>

        {/* Detailed Comparison */}
        <ScrollReveal delay={150}>
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Diagram */}
            <div className="lg:col-span-1">
              <h3 className="text-lg font-semibold text-foreground mb-4">How It Works</h3>
              {active.diagram}
              <div className="mt-4 space-y-2">
                {Object.entries(active.specs).map(([key, value]) => (
                  <div key={key} className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{key}</span>
                    <span className={`font-medium ${active.color === 'cyan' ? 'text-cyan-500' : 'text-orange-500'}`}>
                      {value}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Pros */}
            <div className="bg-card border border-border rounded-xl p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <Check className="w-5 h-5 text-green-500" />
                Advantages
              </h3>
              <ul className="space-y-3">
                {active.pros.map((pro, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                    <span className="text-muted-foreground">{pro}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Cons */}
            <div className="bg-card border border-border rounded-xl p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <X className="w-5 h-5 text-red-500" />
                Disadvantages
              </h3>
              <ul className="space-y-3">
                {active.cons.map((con, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm">
                    <div className="w-1.5 h-1.5 bg-red-500 rounded-full mt-2 flex-shrink-0" />
                    <span className="text-muted-foreground">{con}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </ScrollReveal>

        {/* Comparison Table */}
        <ScrollReveal delay={200}>
          <div className="mt-12 bg-card border border-border rounded-xl overflow-hidden">
            <div className="p-4 border-b border-border bg-muted/50">
              <h3 className="font-semibold text-foreground">Heat Transfer Coefficient Comparison</h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <span className="w-32 text-sm text-muted-foreground">Air Cooling</span>
                  <div className="flex-1 bg-muted rounded-full h-6 overflow-hidden">
                    <div className="h-full bg-zinc-500 rounded-full flex items-center justify-end pr-2" style={{ width: '2%' }}>
                      <span className="text-xs text-white font-medium">10-50</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="w-32 text-sm text-muted-foreground">Single-Phase</span>
                  <div className="flex-1 bg-muted rounded-full h-6 overflow-hidden">
                    <div className="h-full bg-cyan-500 rounded-full flex items-center justify-end pr-2" style={{ width: '4%' }}>
                      <span className="text-xs text-white font-medium">300-1K</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="w-32 text-sm text-muted-foreground">Two-Phase</span>
                  <div className="flex-1 bg-muted rounded-full h-6 overflow-hidden">
                    <div className="h-full bg-orange-500 rounded-full flex items-center justify-end pr-2" style={{ width: '100%' }}>
                      <span className="text-xs text-white font-medium">5K-25K W/m²·K</span>
                    </div>
                  </div>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-4">
                Two-phase cooling achieves 50-500x better heat transfer than air, enabling aggressive overclocking
              </p>
            </div>
          </div>
        </ScrollReveal>

        <SectionSummary
          takeaways={[
            "Single-phase: simpler, cheaper ($2-15/L), well-suited for most operations",
            "Two-phase: maximum heat transfer but 10-50x fluid cost and complexity",
            "Two-phase achieves 50-500x better heat transfer than air cooling"
          ]}
          nextSectionId="fluids"
          nextSectionLabel="Continue to Fluid Selection"
        />
      </div>
    </section>
  );
}
