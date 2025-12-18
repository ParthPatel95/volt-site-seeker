import { ScrollReveal } from '@/components/landing/ScrollAnimations';
import { Droplets, Thermometer, Zap, Volume2 } from 'lucide-react';

const benefits = [
  {
    icon: Thermometer,
    title: "Superior Heat Transfer",
    description: "Liquid conducts heat 25x more efficiently than air, enabling optimal chip temperatures",
    stat: "25x",
    statLabel: "Better cooling"
  },
  {
    icon: Zap,
    title: "Overclocking Potential",
    description: "Run ASICs 20-30% above stock hashrate with stable thermals",
    stat: "+30%",
    statLabel: "Hashrate gains"
  },
  {
    icon: Volume2,
    title: "Near-Silent Operation",
    description: "Eliminate all fan noise - ideal for noise-sensitive locations",
    stat: "<55dB",
    statLabel: "Noise level"
  },
  {
    icon: Droplets,
    title: "Extended Hardware Life",
    description: "No dust, humidity, or thermal cycling extends ASIC lifespan significantly",
    stat: "5-7yr",
    statLabel: "ASIC lifespan"
  }
];

export default function ImmersionIntroSection() {
  return (
    <section id="introduction" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <ScrollReveal>
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-2 bg-cyan-500/10 text-cyan-500 rounded-full text-sm font-medium mb-4">
              Module 7: Immersion Cooling
            </span>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              Immersion Cooling 101
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              The most advanced cooling technology for Bitcoin mining - submerge ASICs in 
              dielectric fluid to achieve unprecedented efficiency, silence, and longevity.
            </p>
          </div>
        </ScrollReveal>

        {/* Visual Hero */}
        <ScrollReveal delay={100}>
          <div className="relative bg-gradient-to-br from-cyan-500/10 via-background to-blue-500/10 rounded-3xl p-8 md:p-12 mb-16 border border-cyan-500/20 overflow-hidden">
            <div className="absolute inset-0 opacity-30">
              <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl animate-pulse" />
              <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
            </div>
            
            <div className="relative z-10 grid md:grid-cols-2 gap-8 items-center">
              <div>
                <h2 className="text-3xl font-bold text-foreground mb-4">
                  Why Immersion Cooling?
                </h2>
                <p className="text-muted-foreground mb-6">
                  Traditional air cooling struggles with the 3-5kW heat output of modern ASICs. 
                  Immersion cooling submerges mining hardware in non-conductive dielectric fluid, 
                  directly absorbing heat from every component simultaneously.
                </p>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-cyan-500 rounded-full" />
                    <span className="text-foreground">PUE as low as 1.02 (vs 1.3-1.6 air-cooled)</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-cyan-500 rounded-full" />
                    <span className="text-foreground">Zero fan failures - no moving parts in cooling system</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-cyan-500 rounded-full" />
                    <span className="text-foreground">Deploy in any climate without ambient temp concerns</span>
                  </div>
                </div>
              </div>
              
              {/* Animated Immersion Tank Diagram */}
              <div className="relative h-80 bg-gradient-to-b from-cyan-900/30 to-cyan-950/50 rounded-2xl border border-cyan-500/30 overflow-hidden">
                {/* Fluid Level */}
                <div className="absolute bottom-0 left-0 right-0 h-3/4 bg-gradient-to-t from-cyan-500/40 to-cyan-400/20">
                  {/* Bubbles */}
                  {[...Array(8)].map((_, i) => (
                    <div
                      key={i}
                      className="absolute w-2 h-2 bg-cyan-300/60 rounded-full animate-bounce"
                      style={{
                        left: `${15 + i * 10}%`,
                        bottom: `${10 + (i % 3) * 20}%`,
                        animationDelay: `${i * 0.3}s`,
                        animationDuration: '2s'
                      }}
                    />
                  ))}
                </div>
                
                {/* ASIC Representation */}
                <div className="absolute bottom-1/4 left-1/2 -translate-x-1/2 w-32 h-16 bg-zinc-800 rounded border border-zinc-600 flex items-center justify-center">
                  <div className="text-xs text-zinc-400 font-mono">S21 ASIC</div>
                  <div className="absolute -top-1 left-1/4 w-1 h-3 bg-orange-500/80 rounded animate-pulse" />
                  <div className="absolute -top-1 right-1/4 w-1 h-3 bg-orange-500/80 rounded animate-pulse" style={{ animationDelay: '0.5s' }} />
                </div>
                
                {/* Labels */}
                <div className="absolute top-4 left-4 text-xs text-cyan-400 font-medium">Dielectric Fluid</div>
                <div className="absolute bottom-4 right-4 text-xs text-cyan-400 font-medium">Heat Extraction →</div>
              </div>
            </div>
          </div>
        </ScrollReveal>

        {/* Benefits Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {benefits.map((benefit, index) => (
            <ScrollReveal key={benefit.title} delay={150 + index * 50}>
              <div className="bg-card border border-border rounded-xl p-6 hover:border-cyan-500/50 transition-colors group">
                <div className="w-12 h-12 bg-cyan-500/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-cyan-500/20 transition-colors">
                  <benefit.icon className="w-6 h-6 text-cyan-500" />
                </div>
                <div className="text-3xl font-bold text-cyan-500 mb-1">{benefit.stat}</div>
                <div className="text-xs text-muted-foreground mb-3">{benefit.statLabel}</div>
                <h3 className="text-lg font-semibold text-foreground mb-2">{benefit.title}</h3>
                <p className="text-sm text-muted-foreground">{benefit.description}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
