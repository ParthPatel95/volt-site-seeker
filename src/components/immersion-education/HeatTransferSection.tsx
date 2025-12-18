import { ScrollReveal } from '@/components/landing/ScrollAnimations';
import { Flame, ArrowRight, Info } from 'lucide-react';

const heatTransferMethods = [
  {
    name: 'Natural Convection',
    coefficient: '5-25 W/m²·K',
    description: 'Fluid movement from density differences (hot rises, cold sinks)',
    application: 'Backup/passive cooling',
    efficiency: 'Low'
  },
  {
    name: 'Forced Convection',
    coefficient: '300-1,000 W/m²·K',
    description: 'Pump-driven fluid circulation past heat sources',
    application: 'Single-phase immersion',
    efficiency: 'Medium'
  },
  {
    name: 'Nucleate Boiling',
    coefficient: '5,000-25,000 W/m²·K',
    description: 'Fluid boils at chip surface, vapor carries heat away',
    application: 'Two-phase immersion',
    efficiency: 'Very High'
  }
];

const formulas = [
  {
    name: "Newton's Law of Cooling",
    formula: 'Q = h × A × ΔT',
    variables: [
      { symbol: 'Q', desc: 'Heat transfer rate (W)' },
      { symbol: 'h', desc: 'Heat transfer coefficient (W/m²·K)' },
      { symbol: 'A', desc: 'Surface area (m²)' },
      { symbol: 'ΔT', desc: 'Temperature difference (K)' }
    ],
    example: 'For S21: Q=3500W, A=0.05m², ΔT=40K → h=1750 W/m²·K needed'
  },
  {
    name: 'Flow Rate Requirement',
    formula: 'ṁ = Q / (Cp × ΔT)',
    variables: [
      { symbol: 'ṁ', desc: 'Mass flow rate (kg/s)' },
      { symbol: 'Q', desc: 'Heat load (W)' },
      { symbol: 'Cp', desc: 'Specific heat capacity (J/kg·K)' },
      { symbol: 'ΔT', desc: 'Allowable temp rise (K)' }
    ],
    example: 'For 10 S21s: Q=35kW, Cp=2000, ΔT=10K → ṁ=1.75 kg/s (~6.3 m³/hr)'
  },
  {
    name: 'Heat Exchanger Sizing',
    formula: 'Q = U × A × LMTD',
    variables: [
      { symbol: 'Q', desc: 'Heat load (W)' },
      { symbol: 'U', desc: 'Overall HTC (W/m²·K)' },
      { symbol: 'A', desc: 'Exchange area (m²)' },
      { symbol: 'LMTD', desc: 'Log mean temp difference' }
    ],
    example: 'Design for 20% safety margin on calculated area'
  }
];

export default function HeatTransferSection() {
  return (
    <section id="heat-transfer" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <ScrollReveal>
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Heat Transfer Engineering
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Understanding the physics of heat transfer is essential for designing 
              effective immersion cooling systems.
            </p>
          </div>
        </ScrollReveal>

        {/* Heat Transfer Methods */}
        <ScrollReveal delay={100}>
          <div className="grid md:grid-cols-3 gap-6 mb-16">
            {heatTransferMethods.map((method, i) => (
              <div 
                key={method.name}
                className={`bg-card border rounded-xl p-6 ${
                  method.efficiency === 'Very High' 
                    ? 'border-orange-500/50 bg-gradient-to-br from-orange-500/5 to-transparent' 
                    : 'border-border'
                }`}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    method.efficiency === 'Very High' ? 'bg-orange-500/20' : 'bg-cyan-500/10'
                  }`}>
                    <Flame className={`w-5 h-5 ${method.efficiency === 'Very High' ? 'text-orange-500' : 'text-cyan-500'}`} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">{method.name}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded ${
                      method.efficiency === 'Very High' 
                        ? 'bg-orange-500/20 text-orange-500'
                        : method.efficiency === 'Medium'
                        ? 'bg-cyan-500/20 text-cyan-500'
                        : 'bg-muted text-muted-foreground'
                    }`}>
                      {method.efficiency} efficiency
                    </span>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="text-2xl font-mono font-bold text-foreground">{method.coefficient}</div>
                  <p className="text-sm text-muted-foreground">{method.description}</p>
                  <div className="pt-3 border-t border-border">
                    <span className="text-xs text-muted-foreground">Best for: </span>
                    <span className="text-xs text-foreground">{method.application}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollReveal>

        {/* Heat Flow Diagram */}
        <ScrollReveal delay={150}>
          <div className="bg-card border border-border rounded-2xl p-8 mb-16">
            <h3 className="text-xl font-bold text-foreground mb-6 text-center">Heat Transfer Path</h3>
            <div className="flex flex-wrap items-center justify-center gap-4">
              {[
                { label: 'ASIC Chip', temp: '85-95°C', color: 'bg-red-500' },
                { label: 'Heatsink', temp: '75-85°C', color: 'bg-orange-500' },
                { label: 'Fluid', temp: '45-55°C', color: 'bg-amber-500' },
                { label: 'Heat Exchanger', temp: '35-45°C', color: 'bg-cyan-500' },
                { label: 'Dry Cooler', temp: '25-35°C', color: 'bg-blue-500' },
                { label: 'Ambient Air', temp: 'Variable', color: 'bg-zinc-500' }
              ].map((stage, i, arr) => (
                <div key={stage.label} className="flex items-center gap-4">
                  <div className="text-center">
                    <div className={`w-16 h-16 ${stage.color} rounded-xl flex items-center justify-center mb-2`}>
                      <span className="text-white text-xs font-bold">{stage.temp}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">{stage.label}</span>
                  </div>
                  {i < arr.length - 1 && (
                    <ArrowRight className="w-5 h-5 text-muted-foreground" />
                  )}
                </div>
              ))}
            </div>
            <p className="text-center text-sm text-muted-foreground mt-6">
              Heat flows from high temperature (chip) to low temperature (ambient) through each stage
            </p>
          </div>
        </ScrollReveal>

        {/* Engineering Formulas */}
        <ScrollReveal delay={200}>
          <h3 className="text-2xl font-bold text-foreground mb-6 text-center">Key Engineering Formulas</h3>
          <div className="grid md:grid-cols-3 gap-6">
            {formulas.map((formula) => (
              <div key={formula.name} className="bg-card border border-border rounded-xl overflow-hidden">
                <div className="p-4 bg-muted/50 border-b border-border">
                  <h4 className="font-semibold text-foreground">{formula.name}</h4>
                </div>
                <div className="p-4">
                  <div className="bg-zinc-900 rounded-lg p-4 mb-4 text-center">
                    <code className="text-cyan-400 text-lg font-mono">{formula.formula}</code>
                  </div>
                  <div className="space-y-2 mb-4">
                    {formula.variables.map((v) => (
                      <div key={v.symbol} className="flex items-start gap-2 text-sm">
                        <code className="text-cyan-500 font-mono bg-cyan-500/10 px-1.5 py-0.5 rounded">
                          {v.symbol}
                        </code>
                        <span className="text-muted-foreground">{v.desc}</span>
                      </div>
                    ))}
                  </div>
                  <div className="bg-blue-500/5 border border-blue-500/20 rounded-lg p-3">
                    <div className="flex items-start gap-2">
                      <Info className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                      <p className="text-xs text-muted-foreground">{formula.example}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollReveal>

        {/* Fluid Properties Reference */}
        <ScrollReveal delay={250}>
          <div className="mt-12 bg-card border border-border rounded-xl overflow-hidden">
            <div className="p-4 border-b border-border bg-muted/50">
              <h3 className="font-semibold text-foreground">Common Fluid Thermal Properties</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-border">
                  <tr>
                    <th className="text-left p-4 text-sm font-semibold text-foreground">Fluid</th>
                    <th className="text-left p-4 text-sm font-semibold text-foreground">Density (kg/m³)</th>
                    <th className="text-left p-4 text-sm font-semibold text-foreground">Cp (J/kg·K)</th>
                    <th className="text-left p-4 text-sm font-semibold text-foreground">Thermal Conductivity</th>
                    <th className="text-left p-4 text-sm font-semibold text-foreground">Boiling Point</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { fluid: 'Mineral Oil', density: '850-880', cp: '1,900-2,100', k: '0.13-0.15', bp: '280-320°C' },
                    { fluid: 'Synthetic Oil', density: '800-850', cp: '2,000-2,200', k: '0.14-0.16', bp: '300-350°C' },
                    { fluid: '3M Novec 7100', density: '1,510', cp: '1,180', k: '0.069', bp: '61°C' },
                    { fluid: 'Fluorinert FC-72', density: '1,680', cp: '1,100', k: '0.057', bp: '56°C' },
                    { fluid: 'Water (reference)', density: '1,000', cp: '4,186', k: '0.60', bp: '100°C' }
                  ].map((row, i) => (
                    <tr key={row.fluid} className={`border-b border-border/50 ${i % 2 === 0 ? 'bg-background' : 'bg-muted/20'}`}>
                      <td className="p-4 font-medium text-foreground">{row.fluid}</td>
                      <td className="p-4 text-muted-foreground font-mono">{row.density}</td>
                      <td className="p-4 text-muted-foreground font-mono">{row.cp}</td>
                      <td className="p-4 text-muted-foreground font-mono">{row.k} W/m·K</td>
                      <td className="p-4 text-muted-foreground font-mono">{row.bp}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
