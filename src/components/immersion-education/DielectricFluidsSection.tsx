import { useState } from 'react';
import { ScrollReveal } from '@/components/landing/ScrollAnimations';
import { Droplets, DollarSign, Thermometer, Shield, AlertTriangle } from 'lucide-react';

const fluidCategories = [
  {
    id: 'mineral',
    name: 'Mineral Oils',
    description: 'Most affordable single-phase option',
    fluids: [
      { name: 'White Mineral Oil', price: '$2-4/L', flashPoint: '150-200°C', viscosity: '15-30 cSt', gwp: '0', common: true },
      { name: 'Transformer Oil', price: '$3-5/L', flashPoint: '140-160°C', viscosity: '10-15 cSt', gwp: '0', common: true },
      { name: 'Paraffin Oil', price: '$2-3/L', flashPoint: '120-150°C', viscosity: '20-40 cSt', gwp: '0', common: false }
    ],
    pros: ['Very low cost', 'Widely available', 'Good thermal properties'],
    cons: ['Flammable', 'Can degrade over time', 'Messy extraction'],
    color: 'amber'
  },
  {
    id: 'synthetic',
    name: 'Synthetic Oils',
    description: 'Premium single-phase performance',
    fluids: [
      { name: 'Engineered Fluids BitCool', price: '$8-12/L', flashPoint: '250°C+', viscosity: '5-10 cSt', gwp: '0', common: true },
      { name: 'Shell Diala S4', price: '$10-15/L', flashPoint: '280°C', viscosity: '8 cSt', gwp: '0', common: true },
      { name: 'DCX ThermaSafe', price: '$12-18/L', flashPoint: '300°C+', viscosity: '6 cSt', gwp: '0', common: false }
    ],
    pros: ['High flash point (safer)', 'Better thermal stability', 'Longer lifespan'],
    cons: ['Higher cost', 'Still requires cleanup', 'Limited suppliers'],
    color: 'cyan'
  },
  {
    id: 'fluorocarbon',
    name: 'Fluorocarbons (Two-Phase)',
    description: 'Maximum performance, maximum cost',
    fluids: [
      { name: '3M Novec 7100', price: '$100-150/L', flashPoint: 'None', viscosity: '0.3 cSt', gwp: '297', common: true },
      { name: '3M Fluorinert FC-72', price: '$200-300/L', flashPoint: 'None', viscosity: '0.4 cSt', gwp: '9,300', common: true },
      { name: 'Solvay Galden HT', price: '$150-250/L', flashPoint: 'None', viscosity: '0.5 cSt', gwp: '~10,000', common: false }
    ],
    pros: ['Non-flammable', 'Boiling heat transfer', 'Clean evaporation'],
    cons: ['Extremely expensive', 'Environmental concerns (GWP)', 'Requires sealed systems'],
    color: 'purple'
  }
];

export default function DielectricFluidsSection() {
  const [activeCategory, setActiveCategory] = useState('mineral');
  const category = fluidCategories.find(c => c.id === activeCategory)!;

  return (
    <section id="fluids" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <LearningObjectives
          objectives={[
            "Compare mineral oils, synthetic oils, and fluorocarbons",
            "Evaluate fluids by flash point, cost, GWP, and viscosity",
            "Calculate fluid cost for your tank size"
          ]}
          estimatedTime="7 min"
          prerequisites={[{ title: "Types of Immersion", href: "#types" }]}
        />

        <ScrollReveal>
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Dielectric Fluid Selection
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              The cooling fluid is the heart of any immersion system. Choose based on your 
              budget, safety requirements, and performance goals.
            </p>
          </div>
        </ScrollReveal>

        {/* Key Properties */}
        <ScrollReveal delay={100}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
            {[
              { icon: Thermometer, label: 'Flash Point', desc: 'Fire safety threshold' },
              { icon: Droplets, label: 'Viscosity', desc: 'Flow & heat transfer' },
              { icon: DollarSign, label: 'Cost/Liter', desc: 'Total fluid expense' },
              { icon: Shield, label: 'GWP', desc: 'Environmental impact' }
            ].map((prop) => (
              <div key={prop.label} className="bg-card border border-border rounded-xl p-4 text-center">
                <prop.icon className="w-6 h-6 text-cyan-500 mx-auto mb-2" />
                <div className="font-semibold text-foreground text-sm">{prop.label}</div>
                <div className="text-xs text-muted-foreground">{prop.desc}</div>
              </div>
            ))}
          </div>
        </ScrollReveal>

        {/* Category Tabs */}
        <ScrollReveal delay={150}>
          <div className="flex flex-wrap justify-center gap-3 mb-8">
            {fluidCategories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-5 py-3 rounded-xl border-2 transition-all ${
                  activeCategory === cat.id
                    ? cat.color === 'amber'
                      ? 'border-amber-500 bg-amber-500/10 text-foreground'
                      : cat.color === 'cyan'
                      ? 'border-cyan-500 bg-cyan-500/10 text-foreground'
                      : 'border-purple-500 bg-purple-500/10 text-foreground'
                    : 'border-border bg-card text-muted-foreground hover:border-muted-foreground/50'
                }`}
              >
                <div className="font-semibold">{cat.name}</div>
                <div className="text-xs opacity-70">{cat.description}</div>
              </button>
            ))}
          </div>
        </ScrollReveal>

        {/* Fluid Table */}
        <ScrollReveal delay={200}>
          <div className="bg-card border border-border rounded-xl overflow-hidden mb-8">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50 border-b border-border">
                  <tr>
                    <th className="text-left p-4 text-sm font-semibold text-foreground">Fluid</th>
                    <th className="text-left p-4 text-sm font-semibold text-foreground">Price/Liter</th>
                    <th className="text-left p-4 text-sm font-semibold text-foreground">Flash Point</th>
                    <th className="text-left p-4 text-sm font-semibold text-foreground">Viscosity</th>
                    <th className="text-left p-4 text-sm font-semibold text-foreground">GWP</th>
                  </tr>
                </thead>
                <tbody>
                  {category.fluids.map((fluid, i) => (
                    <tr key={fluid.name} className={`border-b border-border/50 ${i % 2 === 0 ? 'bg-background' : 'bg-muted/20'}`}>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-foreground">{fluid.name}</span>
                          {fluid.common && (
                            <span className="text-xs bg-green-500/20 text-green-500 px-2 py-0.5 rounded">Popular</span>
                          )}
                        </div>
                      </td>
                      <td className={`p-4 font-mono ${
                        category.color === 'amber' ? 'text-amber-500' :
                        category.color === 'cyan' ? 'text-cyan-500' : 'text-purple-500'
                      }`}>{fluid.price}</td>
                      <td className="p-4 text-muted-foreground">{fluid.flashPoint}</td>
                      <td className="p-4 text-muted-foreground">{fluid.viscosity}</td>
                      <td className="p-4">
                        {parseInt(fluid.gwp) > 1000 ? (
                          <span className="text-red-500 flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" />
                            {fluid.gwp}
                          </span>
                        ) : (
                          <span className="text-green-500">{fluid.gwp}</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </ScrollReveal>

        {/* Pros/Cons */}
        <ScrollReveal delay={250}>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-green-500/5 border border-green-500/20 rounded-xl p-6">
              <h4 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full" />
                Advantages of {category.name}
              </h4>
              <ul className="space-y-2">
                {category.pros.map((pro, i) => (
                  <li key={i} className="text-sm text-muted-foreground flex items-center gap-2">
                    <span className="text-green-500">✓</span> {pro}
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-6">
              <h4 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                <div className="w-2 h-2 bg-red-500 rounded-full" />
                Considerations
              </h4>
              <ul className="space-y-2">
                {category.cons.map((con, i) => (
                  <li key={i} className="text-sm text-muted-foreground flex items-center gap-2">
                    <span className="text-red-500">!</span> {con}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </ScrollReveal>

        {/* Cost Calculator */}
        <ScrollReveal delay={300}>
          <div className="mt-12 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 rounded-xl p-8">
            <h3 className="text-xl font-bold text-foreground mb-6 text-center">
              Fluid Cost Quick Reference
            </h3>
            <div className="grid md:grid-cols-3 gap-6 text-center">
              <div className="bg-card/50 rounded-xl p-6">
                <div className="text-3xl font-bold text-amber-500 mb-2">~$800</div>
                <div className="text-sm text-foreground font-medium">Mineral Oil</div>
                <div className="text-xs text-muted-foreground">Per S21 tank (~200L)</div>
              </div>
              <div className="bg-card/50 rounded-xl p-6">
                <div className="text-3xl font-bold text-cyan-500 mb-2">~$2,400</div>
                <div className="text-sm text-foreground font-medium">Synthetic Oil</div>
                <div className="text-xs text-muted-foreground">Per S21 tank (~200L)</div>
              </div>
              <div className="bg-card/50 rounded-xl p-6">
                <div className="text-3xl font-bold text-purple-500 mb-2">~$25,000</div>
                <div className="text-sm text-foreground font-medium">Fluorocarbon</div>
                <div className="text-xs text-muted-foreground">Per S21 tank (~200L)</div>
              </div>
            </div>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={350}>
          <div className="mt-12">
            <FluidRecommender />
          </div>
        </ScrollReveal>

        <SectionSummary
          takeaways={[
            "Mineral oil: $2-5/L, flammable but economical for most operations",
            "Synthetic oil: $8-18/L, higher flash point and longer lifespan",
            "Fluorocarbons: $100-300/L, non-flammable for two-phase systems"
          ]}
          nextSectionId="hardware-prep"
          nextSectionLabel="Continue to Hardware Prep"
        />
      </div>
    </section>
  );
}
