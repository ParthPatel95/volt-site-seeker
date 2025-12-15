import React, { useState } from 'react';
import { Zap, Gauge, Shield, AlertTriangle, CheckCircle, Info, ChevronRight, Cable, ArrowDown, Sparkles } from 'lucide-react';
import { ScrollReveal } from '@/components/landing/ScrollAnimations';
import { AnimatedCounter } from '@/components/ui/AnimatedCounter';

// Import AI-generated 3D images
import electricalUtilityFeed from '@/assets/electrical-utility-feed.jpg';
import electricalPowerTransformer from '@/assets/electrical-power-transformer.jpg';
import electricalMvSwitchgear from '@/assets/electrical-mv-switchgear.jpg';
import electricalPduCluster from '@/assets/electrical-pdu-cluster.jpg';

const ElectricalInfrastructureSection = () => {
  const [activeStep, setActiveStep] = useState<number | null>(null);
  const [hoveredStep, setHoveredStep] = useState<number | null>(null);

  // Enhanced single-line diagram with 3D images
  const powerFlowSteps = [
    {
      id: 1,
      name: 'Utility Feed',
      voltage: '138kV',
      current: '418A @ 100MW',
      image: electricalUtilityFeed,
      icon: '⚡',
      color: 'from-red-500 to-orange-500',
      description: 'High-voltage transmission lines deliver bulk power from the grid to the facility substation.',
      specs: [
        { label: 'Voltage Class', value: '138kV 3-phase' },
        { label: 'Capacity', value: '100-200 MVA' },
        { label: 'Protection', value: 'Utility relay coordination' },
        { label: 'Metering', value: 'Revenue-grade CTs/PTs' },
      ],
      equipment: ['Transmission towers', 'Aluminum conductor steel reinforced (ACSR)', 'Dead-end structures'],
      brands: ['ABB', 'GE Grid Solutions', 'Siemens'],
      costEstimate: '$2-5M for interconnection',
      losses: '0.5-1%',
    },
    {
      id: 2,
      name: 'Main Power Transformer',
      voltage: '138kV → 25kV',
      current: '2,300A @ 100MW',
      image: electricalPowerTransformer,
      icon: '🔄',
      color: 'from-orange-500 to-yellow-500',
      description: 'Oil-filled power transformer steps down high voltage for facility distribution.',
      specs: [
        { label: 'Rating', value: '50-100 MVA' },
        { label: 'Impedance', value: '8-10%' },
        { label: 'Cooling', value: 'ONAN/ONAF' },
        { label: 'Efficiency', value: '99.5%' },
        { label: 'Oil Volume', value: '10,000+ gallons' },
        { label: 'Lifespan', value: '30-40 years' },
      ],
      equipment: ['Oil-filled transformer', 'Radiator banks', 'Buchholz relay', 'Conservator tank'],
      brands: ['ABB', 'Siemens', 'Hitachi Energy', 'WEG'],
      costEstimate: '$1-3M per unit',
      losses: '0.5%',
    },
    {
      id: 3,
      name: 'MV Switchgear',
      voltage: '25kV',
      current: '1,200-2,000A',
      image: electricalMvSwitchgear,
      icon: '📊',
      color: 'from-yellow-500 to-green-500',
      description: 'Metal-enclosed switchgear distributes power to multiple unit substations across the facility.',
      specs: [
        { label: 'Type', value: 'Metal-enclosed' },
        { label: 'Voltage Class', value: '25kV / 15kV' },
        { label: 'Bus Rating', value: '1200-2000A' },
        { label: 'BIL', value: '125kV' },
        { label: 'Sections', value: '6-12 breakers' },
      ],
      equipment: ['SF6 circuit breakers', 'Vacuum contactors', 'CTs/PTs', 'Protective relays'],
      brands: ['Eaton', 'Schneider Electric', 'ABB', 'GE'],
      costEstimate: '$500K-1.5M',
      losses: '0.1%',
    },
    {
      id: 4,
      name: 'PDU Distribution',
      voltage: '600V → 240V',
      current: '500-800A per PDU',
      image: electricalPduCluster,
      icon: '📦',
      color: 'from-green-500 to-cyan-500',
      description: 'Power Distribution Units deliver final step-down power directly to ASIC mining equipment.',
      specs: [
        { label: 'Rating', value: '225-400 kVA each' },
        { label: 'Output', value: '240V 1-phase' },
        { label: 'Circuits', value: '42-84 per PDU' },
        { label: 'Breakers', value: '30A-50A per miner' },
        { label: 'Monitoring', value: 'Per-circuit metering' },
      ],
      equipment: ['Dry-type transformers', 'Molded case breakers', 'Busbar systems', 'Power meters'],
      brands: ['Eaton', 'Schneider', 'Siemens', 'Vertiv'],
      costEstimate: '$15-30K per PDU',
      losses: '1-2%',
    },
  ];

  const safetyEquipment = [
    {
      name: 'Protective Relays',
      description: 'Digital multifunction relays for overcurrent, ground fault, and differential protection',
      standards: 'IEEE C37, ANSI',
      icon: Shield,
    },
    {
      name: 'Arc Flash Mitigation',
      description: 'Arc-resistant switchgear, PPE requirements, incident energy calculations',
      standards: 'NFPA 70E, CSA Z462',
      icon: AlertTriangle,
    },
    {
      name: 'Grounding System',
      description: 'Ground grid, equipment bonding, surge protection, step/touch voltage limits',
      standards: 'IEEE 80, CSA C22.1',
      icon: Zap,
    },
    {
      name: 'Emergency Systems',
      description: 'Emergency disconnect, fire suppression tie-ins, egress lighting',
      standards: 'NFPA 110, local codes',
      icon: CheckCircle,
    },
  ];

  const transformerSizing = [
    { kva: 1000, mw: 0.8, miners: 230, efficiency: '98.8%', cost: '$45K' },
    { kva: 1500, mw: 1.2, miners: 345, efficiency: '99.0%', cost: '$60K' },
    { kva: 2000, mw: 1.6, miners: 460, efficiency: '99.2%', cost: '$75K' },
    { kva: 2500, mw: 2.0, miners: 575, efficiency: '99.3%', cost: '$90K' },
    { kva: 3000, mw: 2.4, miners: 690, efficiency: '99.4%', cost: '$110K' },
  ];

  const activeStepData = activeStep !== null ? powerFlowSteps[activeStep] : null;

  return (
    <section id="electrical" className="py-16 md:py-24 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <div className="text-center mb-12">
            <span className="inline-block px-4 py-1 rounded-full bg-watt-bitcoin/10 text-watt-bitcoin text-sm font-medium mb-4">
              Section 2 • Electrical Systems
            </span>
            <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
              Interactive Single-Line Diagram
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
              Follow the power journey from 138kV utility feed down to 12V DC at the ASIC hash boards
            </p>
          </div>
        </ScrollReveal>

        {/* Immersive 3D Power Flow Diagram */}
        <div className="mb-16">
          {/* Desktop View - Vertical Tower Layout */}
          <div className="hidden lg:block">
            <div className="relative">
              {/* Animated Power Flow Background */}
              <div className="absolute inset-0 flex justify-center">
                <div className="w-1 bg-gradient-to-b from-red-500 via-yellow-500 to-cyan-500 opacity-30 rounded-full" />
                {/* Animated particles flowing down */}
                <div className="absolute w-3 h-3 rounded-full bg-watt-bitcoin animate-[flowDown_3s_ease-in-out_infinite] shadow-lg shadow-watt-bitcoin/50" style={{ animationDelay: '0s' }} />
                <div className="absolute w-3 h-3 rounded-full bg-watt-bitcoin animate-[flowDown_3s_ease-in-out_infinite] shadow-lg shadow-watt-bitcoin/50" style={{ animationDelay: '0.75s' }} />
                <div className="absolute w-3 h-3 rounded-full bg-watt-bitcoin animate-[flowDown_3s_ease-in-out_infinite] shadow-lg shadow-watt-bitcoin/50" style={{ animationDelay: '1.5s' }} />
                <div className="absolute w-3 h-3 rounded-full bg-watt-bitcoin animate-[flowDown_3s_ease-in-out_infinite] shadow-lg shadow-watt-bitcoin/50" style={{ animationDelay: '2.25s' }} />
              </div>

              {/* Power Flow Steps */}
              <div className="relative z-10 space-y-6">
                {powerFlowSteps.map((step, index) => (
                  <ScrollReveal key={step.id} delay={index * 0.1}>
                    <div
                      className={`relative grid grid-cols-12 gap-6 items-center transition-all duration-500 cursor-pointer group ${
                        activeStep === index ? 'scale-[1.02]' : 'hover:scale-[1.01]'
                      }`}
                      onClick={() => setActiveStep(activeStep === index ? null : index)}
                      onMouseEnter={() => setHoveredStep(index)}
                      onMouseLeave={() => setHoveredStep(null)}
                    >
                      {/* Left Content (alternating sides) */}
                      <div className={`col-span-5 ${index % 2 === 0 ? 'order-1' : 'order-3 text-right'}`}>
                        <div className={`transition-all duration-300 ${
                          hoveredStep === index || activeStep === index ? 'opacity-100' : 'opacity-70'
                        }`}>
                          <div className="inline-flex items-center gap-2 px-3 py-1 bg-muted/50 rounded-full text-xs font-medium text-muted-foreground mb-2">
                            <Sparkles className="w-3 h-3" />
                            Step {step.id} of 4
                          </div>
                          <h3 className="text-2xl font-bold text-foreground mb-1">{step.name}</h3>
                          <div className="flex items-center gap-3 mb-2 flex-wrap justify-start">
                            <span className={`px-3 py-1 rounded-lg bg-gradient-to-r ${step.color} text-white text-sm font-bold`}>
                              {step.voltage}
                            </span>
                            <span className="text-xs text-muted-foreground font-mono">
                              {step.current}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {step.description}
                          </p>
                        </div>
                      </div>

                      {/* Center Image Card */}
                      <div className="col-span-2 order-2 flex justify-center relative">
                        {/* Voltage Step-Down Indicator */}
                        {index > 0 && (
                          <div className="absolute -top-10 left-1/2 -translate-x-1/2 flex flex-col items-center">
                            <div className="w-8 h-8 rounded-full bg-watt-bitcoin/20 flex items-center justify-center animate-pulse">
                              <ArrowDown className="w-4 h-4 text-watt-bitcoin" />
                            </div>
                            <span className="text-[10px] text-muted-foreground mt-1">
                              {powerFlowSteps[index - 1].losses} loss
                            </span>
                          </div>
                        )}

                        <div className={`relative w-32 h-32 rounded-2xl overflow-hidden border-4 transition-all duration-500 shadow-2xl ${
                          activeStep === index 
                            ? 'border-watt-bitcoin scale-110 shadow-watt-bitcoin/30' 
                            : 'border-border group-hover:border-watt-bitcoin/50'
                        }`}>
                          <img 
                            src={step.image} 
                            alt={step.name}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                          />
                          {/* Glowing overlay on active/hover */}
                          <div className={`absolute inset-0 bg-gradient-to-t from-black/60 to-transparent transition-opacity ${
                            hoveredStep === index || activeStep === index ? 'opacity-100' : 'opacity-0'
                          }`} />
                          {/* Icon overlay */}
                          <div className="absolute bottom-2 right-2 text-2xl">
                            {step.icon}
                          </div>
                        </div>
                      </div>

                      {/* Right Content (alternating sides) */}
                      <div className={`col-span-5 ${index % 2 === 0 ? 'order-3' : 'order-1 text-right'}`}>
                        <div className={`transition-all duration-300 ${
                          hoveredStep === index || activeStep === index ? 'opacity-100' : 'opacity-50'
                        }`}>
                          {/* Equipment brands */}
                          <div className="flex flex-wrap gap-2 mb-2 justify-start">
                            {step.brands.slice(0, 3).map((brand) => (
                              <span key={brand} className="px-2 py-0.5 bg-card border border-border rounded text-[10px] text-muted-foreground">
                                {brand}
                              </span>
                            ))}
                          </div>
                          <div className="text-sm text-foreground font-medium mb-1">
                            {step.costEstimate}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {step.equipment.slice(0, 2).join(' • ')}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Expanded Details Panel */}
                    {activeStep === index && (
                      <div className="mt-4 ml-auto mr-auto max-w-4xl animate-fade-in">
                        <div className="bg-card rounded-2xl border border-watt-bitcoin/30 p-6 shadow-xl shadow-watt-bitcoin/10">
                          <div className="grid md:grid-cols-2 gap-6">
                            {/* Specs */}
                            <div>
                              <h4 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
                                <Gauge className="w-4 h-4 text-watt-bitcoin" />
                                Technical Specifications
                              </h4>
                              <div className="space-y-2">
                                {step.specs.map((spec, i) => (
                                  <div key={i} className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">{spec.label}</span>
                                    <span className="font-medium text-foreground">{spec.value}</span>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Equipment */}
                            <div>
                              <h4 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
                                <Cable className="w-4 h-4 text-watt-bitcoin" />
                                Key Equipment
                              </h4>
                              <div className="flex flex-wrap gap-2">
                                {step.equipment.map((eq) => (
                                  <span key={eq} className="px-3 py-1 bg-muted rounded-lg text-xs text-foreground">
                                    {eq}
                                  </span>
                                ))}
                              </div>

                              <div className="mt-4 p-3 bg-watt-bitcoin/10 rounded-lg">
                                <div className="flex items-center justify-between">
                                  <span className="text-xs text-muted-foreground">Power Loss</span>
                                  <span className="text-sm font-bold text-watt-bitcoin">{step.losses}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </ScrollReveal>
                ))}

                {/* Final Output - Miners */}
                <ScrollReveal delay={0.4}>
                  <div className="text-center py-8">
                    <div className="inline-flex items-center gap-4 p-6 bg-gradient-to-r from-cyan-500/10 via-watt-bitcoin/10 to-cyan-500/10 rounded-2xl border border-watt-bitcoin/20">
                      <span className="text-4xl">💻</span>
                      <div className="text-left">
                        <h4 className="font-bold text-foreground">ASIC Miners</h4>
                        <p className="text-sm text-muted-foreground">240V AC → 12V DC • 3,000-5,500W each</p>
                        <p className="text-xs text-watt-bitcoin font-medium mt-1">PSU Efficiency: 93-95%</p>
                      </div>
                    </div>
                  </div>
                </ScrollReveal>
              </div>
            </div>
          </div>

          {/* Mobile View - Stacked Cards */}
          <div className="lg:hidden space-y-4">
            {powerFlowSteps.map((step, index) => (
              <ScrollReveal key={step.id} delay={index * 0.1}>
                <div 
                  className="relative overflow-hidden rounded-2xl border border-border bg-card cursor-pointer transition-all hover:border-watt-bitcoin/50"
                  onClick={() => setActiveStep(activeStep === index ? null : index)}
                >
                  {/* Image Header */}
                  <div className="relative h-40">
                    <img 
                      src={step.image} 
                      alt={step.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                    <div className="absolute bottom-4 left-4 right-4">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`px-2 py-1 rounded bg-gradient-to-r ${step.color} text-white text-xs font-bold`}>
                          Step {step.id}
                        </span>
                        <span className="text-white/80 text-xs font-mono">{step.voltage}</span>
                      </div>
                      <h3 className="text-lg font-bold text-white">{step.name}</h3>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    <p className="text-sm text-muted-foreground mb-3">{step.description}</p>
                    
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">{step.costEstimate}</span>
                      <span className="text-watt-bitcoin font-medium">Loss: {step.losses}</span>
                    </div>

                    {/* Expanded Content */}
                    {activeStep === index && (
                      <div className="mt-4 pt-4 border-t border-border space-y-3 animate-fade-in">
                        {step.specs.map((spec, i) => (
                          <div key={i} className="flex justify-between text-sm">
                            <span className="text-muted-foreground">{spec.label}</span>
                            <span className="font-medium text-foreground">{spec.value}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Arrow indicator between steps */}
                  {index < powerFlowSteps.length - 1 && (
                    <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 z-10">
                      <div className="w-6 h-6 rounded-full bg-watt-bitcoin flex items-center justify-center">
                        <ArrowDown className="w-4 h-4 text-white" />
                      </div>
                    </div>
                  )}
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>

        {/* Total System Efficiency Banner */}
        <ScrollReveal delay={0.3}>
          <div className="mb-10 p-6 bg-gradient-to-r from-watt-navy to-watt-navy/90 rounded-2xl text-white">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              <div>
                <div className="text-3xl font-bold text-watt-bitcoin">
                  <AnimatedCounter end={97.5} decimals={1} suffix="%" />
                </div>
                <div className="text-xs text-white/70">Total System Efficiency</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-white">
                  <AnimatedCounter end={2.5} decimals={1} suffix="%" />
                </div>
                <div className="text-xs text-white/70">Total Power Loss</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-white">
                  138kV → 12V
                </div>
                <div className="text-xs text-white/70">Voltage Range</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-white">
                  <AnimatedCounter end={4} suffix=" steps" />
                </div>
                <div className="text-xs text-white/70">Transformation Stages</div>
              </div>
            </div>
          </div>
        </ScrollReveal>

        {/* Transformer Sizing Guide */}
        <ScrollReveal delay={0.2}>
          <div className="bg-muted/30 rounded-2xl border border-border p-6 mb-10">
            <h3 className="text-xl font-bold text-foreground mb-2">Transformer Sizing Guide</h3>
            <p className="text-sm text-muted-foreground mb-6">
              Typical dry-type unit substation ratings for mining facilities (600V output, Canada)
            </p>
            
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 font-medium text-foreground">kVA Rating</th>
                    <th className="text-left py-3 px-4 font-medium text-foreground">MW Capacity*</th>
                    <th className="text-left py-3 px-4 font-medium text-foreground">Miners (~3.5kW)</th>
                    <th className="text-left py-3 px-4 font-medium text-foreground">Efficiency</th>
                    <th className="text-left py-3 px-4 font-medium text-foreground">Est. Cost</th>
                  </tr>
                </thead>
                <tbody>
                  {transformerSizing.map((row) => (
                    <tr key={row.kva} className="border-b border-border/50 hover:bg-muted/30">
                      <td className="py-3 px-4 font-medium text-foreground">{row.kva.toLocaleString()} kVA</td>
                      <td className="py-3 px-4 text-watt-bitcoin font-mono">{row.mw} MW</td>
                      <td className="py-3 px-4 text-muted-foreground">~{row.miners}</td>
                      <td className="py-3 px-4 text-green-600">{row.efficiency}</td>
                      <td className="py-3 px-4 text-muted-foreground">{row.cost}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-muted-foreground mt-3">
              *At 80% loading factor (continuous duty derating per NEC/CSA)
            </p>
          </div>
        </ScrollReveal>

        {/* Safety Equipment Grid */}
        <ScrollReveal delay={0.25}>
          <div>
            <h3 className="text-xl font-bold text-foreground mb-6">Electrical Safety Systems</h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {safetyEquipment.map((item) => (
                <div key={item.name} className="bg-card rounded-xl border border-border p-5 hover:border-watt-bitcoin/50 transition-colors">
                  <item.icon className="w-8 h-8 text-watt-bitcoin mb-3" />
                  <h4 className="font-semibold text-foreground mb-2">{item.name}</h4>
                  <p className="text-xs text-muted-foreground mb-3">{item.description}</p>
                  <span className="text-[10px] px-2 py-1 bg-muted rounded text-muted-foreground">{item.standards}</span>
                </div>
              ))}
            </div>
          </div>
        </ScrollReveal>
      </div>

      {/* CSS for animations */}
      <style>{`
        @keyframes flowDown {
          0% {
            top: 0%;
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          90% {
            opacity: 1;
          }
          100% {
            top: 100%;
            opacity: 0;
          }
        }
      `}</style>
    </section>
  );
};

export default ElectricalInfrastructureSection;
