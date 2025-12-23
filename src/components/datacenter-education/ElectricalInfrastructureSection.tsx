import React from 'react';
import { Zap, Gauge, Shield, AlertTriangle, CheckCircle, Cable, ArrowDown, Sparkles, Activity, Cpu } from 'lucide-react';
import { ScrollReveal } from '@/components/landing/ScrollAnimations';
import { AnimatedCounter } from '@/components/ui/AnimatedCounter';
import LearningObjectives from '@/components/academy/LearningObjectives';
import SectionSummary from '@/components/academy/SectionSummary';

// Import AI-generated 3D images
import electricalUtilityFeed from '@/assets/electrical-utility-feed.jpg';
import electricalPowerTransformer from '@/assets/electrical-power-transformer.jpg';
import electricalMvSwitchgear from '@/assets/electrical-mv-switchgear.jpg';
import electricalPduCluster from '@/assets/electrical-pdu-cluster.jpg';
import asicMinersPowered from '@/assets/asic-miners-powered.jpg';

const ElectricalInfrastructureSection = () => {
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

  return (
    <section id="electrical" className="py-12 md:py-20 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <div className="text-center mb-8 md:mb-12">
            <span className="inline-block px-4 py-1 rounded-full bg-watt-bitcoin/10 text-watt-bitcoin text-sm font-medium mb-4">
              Section 2 • Electrical Systems
            </span>
            <h2 className="text-2xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
              Single-Line Diagram
            </h2>
            <p className="text-base md:text-lg lg:text-xl text-muted-foreground max-w-3xl mx-auto px-4">
              Follow the power journey from 138kV utility feed down to 12V DC at the ASIC hash boards
            </p>
          </div>
        </ScrollReveal>

        {/* Power Flow Diagram - All Content Pre-Opened */}
        <div className="mb-12 md:mb-16">
          {/* Desktop View - Vertical Tower Layout with All Content Visible */}
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

              {/* Power Flow Steps - All Pre-Opened */}
              <div className="relative z-10 space-y-8">
                {powerFlowSteps.map((step, index) => (
                  <ScrollReveal key={step.id} delay={index * 0.1}>
                    <div className="relative">
                      {/* Step Header */}
                      <div className="grid grid-cols-12 gap-6 items-start">
                        {/* Left Content */}
                        <div className={`col-span-5 ${index % 2 === 0 ? 'order-1' : 'order-3 text-right'}`}>
                          <div className="inline-flex items-center gap-2 px-3 py-1 bg-muted/50 rounded-full text-xs font-medium text-muted-foreground mb-2">
                            <Sparkles className="w-3 h-3" />
                            Step {step.id} of 4
                          </div>
                          <h3 className="text-xl md:text-2xl font-bold text-foreground mb-1">{step.name}</h3>
                          <div className="flex items-center gap-3 mb-2 flex-wrap">
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

                          <div className="relative w-28 h-28 md:w-32 md:h-32 rounded-2xl overflow-hidden border-4 border-border shadow-2xl hover:border-watt-bitcoin/50 transition-all duration-500">
                            <img 
                              src={step.image} 
                              alt={step.name}
                              className="w-full h-full object-cover"
                            />
                            {/* Icon overlay */}
                            <div className="absolute bottom-2 right-2 text-2xl">
                              {step.icon}
                            </div>
                          </div>
                        </div>

                        {/* Right Content - Brands & Cost */}
                        <div className={`col-span-5 ${index % 2 === 0 ? 'order-3' : 'order-1 text-right'}`}>
                          <div className="flex flex-wrap gap-2 mb-2 justify-start">
                            <span className="px-1.5 py-0.5 bg-amber-100 text-amber-700 rounded text-[9px] font-medium">
                              Est.
                            </span>
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

                      {/* Always Visible Details Panel */}
                      <div className="mt-4 ml-auto mr-auto max-w-4xl">
                        <div className="bg-card rounded-2xl border border-border p-4 md:p-6 shadow-lg">
                          <div className="grid md:grid-cols-2 gap-4 md:gap-6">
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
                    </div>
                  </ScrollReveal>
                ))}

                {/* Final Output - ASIC Miners with Real Images and Animations */}
                <ScrollReveal delay={0.4}>
                  <div className="mt-8">
                    <div className="relative overflow-hidden rounded-2xl border-2 border-watt-bitcoin/30 bg-gradient-to-br from-cyan-500/5 via-watt-bitcoin/10 to-cyan-500/5">
                      {/* Animated Power Flow Lines */}
                      <div className="absolute inset-0 overflow-hidden pointer-events-none">
                        {/* Horizontal power cables animation */}
                        <div className="absolute top-1/4 left-0 w-full h-1 bg-gradient-to-r from-transparent via-watt-bitcoin/40 to-transparent animate-[powerFlow_2s_linear_infinite]" />
                        <div className="absolute top-1/2 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-500/40 to-transparent animate-[powerFlow_2s_linear_infinite]" style={{ animationDelay: '0.5s' }} />
                        <div className="absolute top-3/4 left-0 w-full h-1 bg-gradient-to-r from-transparent via-watt-bitcoin/40 to-transparent animate-[powerFlow_2s_linear_infinite]" style={{ animationDelay: '1s' }} />
                      </div>

                      <div className="grid md:grid-cols-2 gap-6 p-6 md:p-8 relative z-10">
                        {/* Left: Real Miner Image with Animated Effects */}
                        <div className="relative group">
                          <div className="relative rounded-xl overflow-hidden">
                            <img 
                              src={asicMinersPowered} 
                              alt="ASIC Bitcoin Mining Hardware with Power Connections"
                              className="w-full h-48 md:h-64 object-cover"
                            />
                            {/* Pulsing LED overlay effects */}
                            <div className="absolute inset-0 pointer-events-none">
                              {/* Simulated LED status lights */}
                              <div className="absolute top-4 left-4 w-2 h-2 rounded-full bg-green-500 animate-[ledPulse_1s_ease-in-out_infinite] shadow-lg shadow-green-500/50" />
                              <div className="absolute top-4 left-8 w-2 h-2 rounded-full bg-green-500 animate-[ledPulse_1s_ease-in-out_infinite] shadow-lg shadow-green-500/50" style={{ animationDelay: '0.2s' }} />
                              <div className="absolute top-4 left-12 w-2 h-2 rounded-full bg-green-500 animate-[ledPulse_1s_ease-in-out_infinite] shadow-lg shadow-green-500/50" style={{ animationDelay: '0.4s' }} />
                              <div className="absolute top-8 left-4 w-2 h-2 rounded-full bg-yellow-500 animate-[ledPulse_1.5s_ease-in-out_infinite] shadow-lg shadow-yellow-500/50" />
                              <div className="absolute top-8 left-8 w-2 h-2 rounded-full bg-green-500 animate-[ledPulse_1s_ease-in-out_infinite] shadow-lg shadow-green-500/50" style={{ animationDelay: '0.6s' }} />
                              
                              {/* Heat shimmer effect on exhaust side */}
                              <div className="absolute right-0 top-0 bottom-0 w-1/4 bg-gradient-to-l from-orange-500/10 to-transparent animate-[heatWave_3s_ease-in-out_infinite]" />
                            </div>
                            
                            {/* Power cable glow effect */}
                            <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-watt-bitcoin/30 to-transparent animate-[powerGlow_2s_ease-in-out_infinite]" />
                          </div>

                          {/* Mining Active Badge */}
                          <div className="absolute -top-3 -right-3 px-3 py-1.5 bg-green-500 text-white text-xs font-bold rounded-full flex items-center gap-1.5 shadow-lg animate-pulse">
                            <Activity className="w-3 h-3" />
                            Mining Active
                          </div>
                        </div>

                        {/* Right: Specs and Animated Stats */}
                        <div className="flex flex-col justify-center">
                          <div className="flex items-center gap-3 mb-4">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-watt-bitcoin to-orange-600 flex items-center justify-center">
                              <Cpu className="w-6 h-6 text-white" />
                            </div>
                            <div>
                              <h4 className="text-xl md:text-2xl font-bold text-foreground">ASIC Miners</h4>
                              <p className="text-sm text-muted-foreground">Final Power Destination</p>
                            </div>
                          </div>

                          <p className="text-sm text-muted-foreground mb-4">
                            High-efficiency power supplies convert 240V AC to 12V DC, delivering clean power directly to ASIC hash boards for maximum mining performance.
                          </p>

                          <div className="grid grid-cols-2 gap-3 mb-4">
                            <div className="p-3 bg-card rounded-lg border border-border">
                              <div className="text-xs text-muted-foreground mb-1">Input Power</div>
                              <div className="text-lg font-bold text-foreground">240V AC</div>
                            </div>
                            <div className="p-3 bg-card rounded-lg border border-border">
                              <div className="text-xs text-muted-foreground mb-1">Output Power</div>
                              <div className="text-lg font-bold text-watt-bitcoin">12V DC</div>
                            </div>
                            <div className="p-3 bg-card rounded-lg border border-border">
                              <div className="text-xs text-muted-foreground mb-1">Power Draw</div>
                              <div className="text-lg font-bold text-foreground">3-5.5 kW</div>
                            </div>
                            <div className="p-3 bg-card rounded-lg border border-border">
                              <div className="text-xs text-muted-foreground mb-1">PSU Efficiency</div>
                              <div className="text-lg font-bold text-green-600">93-95%</div>
                            </div>
                          </div>

                          {/* Live Hashrate Animation */}
                          <div className="p-4 bg-gradient-to-r from-watt-navy to-watt-navy/90 rounded-xl text-white">
                            <div className="flex items-center justify-between">
                              <div>
                                <div className="text-xs text-white/70 mb-1">Hashrate Per Unit</div>
                                <div className="text-2xl font-bold font-mono">
                                  <AnimatedCounter end={335} suffix=" TH/s" />
                                </div>
                              </div>
                              <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center animate-spin" style={{ animationDuration: '3s' }}>
                                <Activity className="w-6 h-6 text-watt-bitcoin" />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </ScrollReveal>
              </div>
            </div>
          </div>

          {/* Mobile View - Stacked Cards with All Content Pre-Opened */}
          <div className="lg:hidden space-y-6">
            {powerFlowSteps.map((step, index) => (
              <ScrollReveal key={step.id} delay={index * 0.1}>
                <div className="relative overflow-hidden rounded-xl border border-border bg-card">
                  {/* Image Header */}
                  <div className="relative h-36 sm:h-44">
                    <img 
                      src={step.image} 
                      alt={step.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                    <div className="absolute bottom-3 left-3 right-3">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`px-2 py-0.5 rounded bg-gradient-to-r ${step.color} text-white text-xs font-bold`}>
                          Step {step.id}
                        </span>
                        <span className="text-white/80 text-xs font-mono">{step.voltage}</span>
                      </div>
                      <h3 className="text-base sm:text-lg font-bold text-white">{step.name}</h3>
                    </div>
                  </div>

                  {/* Content - Always Visible */}
                  <div className="p-4">
                    <p className="text-sm text-muted-foreground mb-3">{step.description}</p>
                    
                    <div className="flex items-center justify-between text-xs mb-4">
                      <span className="text-muted-foreground">{step.costEstimate}</span>
                      <span className="text-watt-bitcoin font-medium">Loss: {step.losses}</span>
                    </div>

                    {/* Always Visible Specs */}
                    <div className="pt-3 border-t border-border space-y-2">
                      {step.specs.slice(0, 4).map((spec, i) => (
                        <div key={i} className="flex justify-between text-sm">
                          <span className="text-muted-foreground">{spec.label}</span>
                          <span className="font-medium text-foreground">{spec.value}</span>
                        </div>
                      ))}
                    </div>

                    {/* Equipment Tags */}
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {step.equipment.slice(0, 3).map((eq) => (
                        <span key={eq} className="px-2 py-1 bg-muted rounded text-[10px] text-foreground">
                          {eq}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Arrow indicator between steps */}
                  {index < powerFlowSteps.length - 1 && (
                    <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 z-10">
                      <div className="w-6 h-6 rounded-full bg-watt-bitcoin flex items-center justify-center shadow-lg">
                        <ArrowDown className="w-3 h-3 text-white" />
                      </div>
                    </div>
                  )}
                </div>
              </ScrollReveal>
            ))}

            {/* Mobile ASIC Miners Section */}
            <ScrollReveal delay={0.4}>
              <div className="relative overflow-hidden rounded-xl border-2 border-watt-bitcoin/30 bg-gradient-to-br from-cyan-500/5 via-watt-bitcoin/10 to-cyan-500/5">
                {/* Animated Power Flow Lines */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                  <div className="absolute top-1/3 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-watt-bitcoin/40 to-transparent animate-[powerFlow_2s_linear_infinite]" />
                  <div className="absolute top-2/3 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-cyan-500/40 to-transparent animate-[powerFlow_2s_linear_infinite]" style={{ animationDelay: '0.5s' }} />
                </div>

                {/* Image */}
                <div className="relative h-40 sm:h-48">
                  <img 
                    src={asicMinersPowered} 
                    alt="ASIC Bitcoin Mining Hardware"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  
                  {/* LED effects */}
                  <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-3 left-3 w-2 h-2 rounded-full bg-green-500 animate-[ledPulse_1s_ease-in-out_infinite] shadow-lg shadow-green-500/50" />
                    <div className="absolute top-3 left-6 w-2 h-2 rounded-full bg-green-500 animate-[ledPulse_1s_ease-in-out_infinite] shadow-lg shadow-green-500/50" style={{ animationDelay: '0.3s' }} />
                    <div className="absolute top-3 left-9 w-2 h-2 rounded-full bg-green-500 animate-[ledPulse_1s_ease-in-out_infinite] shadow-lg shadow-green-500/50" style={{ animationDelay: '0.6s' }} />
                  </div>

                  {/* Mining Active Badge */}
                  <div className="absolute top-3 right-3 px-2 py-1 bg-green-500 text-white text-[10px] font-bold rounded-full flex items-center gap-1 shadow-lg animate-pulse">
                    <Activity className="w-2.5 h-2.5" />
                    Active
                  </div>

                  <div className="absolute bottom-3 left-3">
                    <h4 className="text-lg font-bold text-white flex items-center gap-2">
                      <Cpu className="w-5 h-5 text-watt-bitcoin" />
                      ASIC Miners
                    </h4>
                    <p className="text-xs text-white/70">Final Power Destination</p>
                  </div>
                </div>

                {/* Mobile Stats Grid */}
                <div className="p-4">
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    <div className="p-2.5 bg-card rounded-lg border border-border text-center">
                      <div className="text-[10px] text-muted-foreground">Input</div>
                      <div className="text-sm font-bold text-foreground">240V AC</div>
                    </div>
                    <div className="p-2.5 bg-card rounded-lg border border-border text-center">
                      <div className="text-[10px] text-muted-foreground">Output</div>
                      <div className="text-sm font-bold text-watt-bitcoin">12V DC</div>
                    </div>
                    <div className="p-2.5 bg-card rounded-lg border border-border text-center">
                      <div className="text-[10px] text-muted-foreground">Power</div>
                      <div className="text-sm font-bold text-foreground">3-5.5 kW</div>
                    </div>
                    <div className="p-2.5 bg-card rounded-lg border border-border text-center">
                      <div className="text-[10px] text-muted-foreground">Efficiency</div>
                      <div className="text-sm font-bold text-green-600">93-95%</div>
                    </div>
                  </div>

                  {/* Hashrate */}
                  <div className="p-3 bg-watt-navy rounded-lg text-white flex items-center justify-between">
                    <div>
                      <div className="text-[10px] text-white/70">Hashrate/Unit</div>
                      <div className="text-lg font-bold font-mono">
                        <AnimatedCounter end={335} suffix=" TH/s" />
                      </div>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center animate-spin" style={{ animationDuration: '3s' }}>
                      <Activity className="w-4 h-4 text-watt-bitcoin" />
                    </div>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>

        {/* Total System Efficiency Banner */}
        <ScrollReveal delay={0.3}>
          <div className="mb-8 md:mb-10 p-4 md:p-6 bg-gradient-to-r from-watt-navy to-watt-navy/90 rounded-xl md:rounded-2xl text-white">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 text-center">
              <div>
                <div className="text-2xl md:text-3xl font-bold text-watt-bitcoin">
                  <AnimatedCounter end={97.5} decimals={1} suffix="%" />
                </div>
                <div className="text-[10px] md:text-xs text-white/70">Total System Efficiency</div>
              </div>
              <div>
                <div className="text-2xl md:text-3xl font-bold text-white">
                  <AnimatedCounter end={2.5} decimals={1} suffix="%" />
                </div>
                <div className="text-[10px] md:text-xs text-white/70">Total Power Loss</div>
              </div>
              <div>
                <div className="text-2xl md:text-3xl font-bold text-white">
                  138kV → 12V
                </div>
                <div className="text-[10px] md:text-xs text-white/70">Voltage Range</div>
              </div>
              <div>
                <div className="text-2xl md:text-3xl font-bold text-white">
                  <AnimatedCounter end={4} suffix=" steps" />
                </div>
                <div className="text-[10px] md:text-xs text-white/70">Transformation Stages</div>
              </div>
            </div>
          </div>
        </ScrollReveal>

        {/* Transformer Sizing Guide */}
        <ScrollReveal delay={0.2}>
          <div className="bg-muted/30 rounded-xl md:rounded-2xl border border-border p-4 md:p-6 mb-8 md:mb-10">
            <h3 className="text-lg md:text-xl font-bold text-foreground mb-2">Transformer Sizing Guide</h3>
            <p className="text-xs md:text-sm text-muted-foreground mb-4 md:mb-6">
              Typical dry-type unit substation ratings for mining facilities (600V output, Canada)
            </p>
            
            <div className="overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0">
              <table className="w-full text-xs md:text-sm min-w-[500px]">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2 md:py-3 px-2 md:px-4 font-medium text-foreground">kVA Rating</th>
                    <th className="text-left py-2 md:py-3 px-2 md:px-4 font-medium text-foreground">MW Capacity*</th>
                    <th className="text-left py-2 md:py-3 px-2 md:px-4 font-medium text-foreground">Miners (~3.5kW)</th>
                    <th className="text-left py-2 md:py-3 px-2 md:px-4 font-medium text-foreground">Efficiency</th>
                    <th className="text-left py-2 md:py-3 px-2 md:px-4 font-medium text-foreground">Est. Cost</th>
                  </tr>
                </thead>
                <tbody>
                  {transformerSizing.map((row) => (
                    <tr key={row.kva} className="border-b border-border/50 hover:bg-muted/30">
                      <td className="py-2 md:py-3 px-2 md:px-4 font-medium text-foreground">{row.kva.toLocaleString()} kVA</td>
                      <td className="py-2 md:py-3 px-2 md:px-4 text-watt-bitcoin font-mono">{row.mw} MW</td>
                      <td className="py-2 md:py-3 px-2 md:px-4 text-muted-foreground">~{row.miners}</td>
                      <td className="py-2 md:py-3 px-2 md:px-4 text-green-600">{row.efficiency}</td>
                      <td className="py-2 md:py-3 px-2 md:px-4 text-muted-foreground">{row.cost}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-[10px] md:text-xs text-muted-foreground mt-3">
              *At 80% loading factor (continuous duty derating per NEC/CSA)
            </p>
          </div>
        </ScrollReveal>

        {/* Safety Equipment Grid */}
        <ScrollReveal delay={0.25}>
          <div>
            <h3 className="text-lg md:text-xl font-bold text-foreground mb-4 md:mb-6">Electrical Safety Systems</h3>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
              {safetyEquipment.map((item) => (
                <div key={item.name} className="bg-card rounded-lg md:rounded-xl border border-border p-3 md:p-5 hover:border-watt-bitcoin/50 transition-colors">
                  <item.icon className="w-6 h-6 md:w-8 md:h-8 text-watt-bitcoin mb-2 md:mb-3" />
                  <h4 className="font-semibold text-foreground text-sm md:text-base mb-1 md:mb-2">{item.name}</h4>
                  <p className="text-[10px] md:text-xs text-muted-foreground mb-2 md:mb-3 line-clamp-3">{item.description}</p>
                  <span className="text-[9px] md:text-[10px] px-1.5 md:px-2 py-0.5 md:py-1 bg-muted rounded text-muted-foreground">{item.standards}</span>
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
        
        @keyframes powerFlow {
          0% {
            transform: translateX(-100%);
            opacity: 0;
          }
          50% {
            opacity: 1;
          }
          100% {
            transform: translateX(100%);
            opacity: 0;
          }
        }
        
        @keyframes ledPulse {
          0%, 100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.6;
            transform: scale(0.9);
          }
        }
        
        @keyframes heatWave {
          0%, 100% {
            opacity: 0.3;
            transform: translateY(0);
          }
          50% {
            opacity: 0.6;
            transform: translateY(-5px);
          }
        }
        
        @keyframes powerGlow {
          0%, 100% {
            opacity: 0.3;
          }
          50% {
            opacity: 0.7;
          }
        }
      `}</style>
    </section>
  );
};

export default ElectricalInfrastructureSection;
