import React, { useState } from 'react';
import { Zap, Gauge, Shield, AlertTriangle, CheckCircle, Info, ChevronRight, Cable } from 'lucide-react';
import { ScrollReveal } from '@/components/landing/ScrollAnimations';
import substationDetail from '@/assets/datacenter-substation-detail.jpg';

const ElectricalInfrastructureSection = () => {
  const [activeComponent, setActiveComponent] = useState<string | null>(null);

  // Single-line diagram components with accurate engineering specs
  const singleLineComponents = [
    {
      id: 'utility-feed',
      name: 'Utility Feed',
      position: { top: '5%', left: '45%' },
      icon: '⚡',
      voltage: '138kV',
      description: 'High-voltage service entrance from transmission network',
      specs: [
        'Voltage: 138kV 3-phase',
        'Capacity: 100-200 MVA',
        'Protection: Utility relay coordination',
        'Metering: Revenue-grade CTs/PTs',
      ],
    },
    {
      id: 'main-breaker',
      name: 'Main Circuit Breaker',
      position: { top: '15%', left: '45%' },
      icon: '🔌',
      voltage: '138kV',
      description: 'Primary protection and disconnect for entire facility',
      specs: [
        'Type: SF6 gas-insulated',
        'Rating: 2000-3000A',
        'Interrupting: 40kA',
        'Operation: Motorized + manual',
      ],
    },
    {
      id: 'main-transformer',
      name: 'Main Power Transformer',
      position: { top: '28%', left: '45%' },
      icon: '🔄',
      voltage: '138kV → 25kV',
      description: 'Primary step-down transformer for facility distribution',
      specs: [
        'Rating: 50-100 MVA',
        'Impedance: 8-10%',
        'Cooling: ONAN/ONAF',
        'Efficiency: 99.5%',
        'Oil volume: 10,000+ gallons',
        'Lifespan: 30-40 years',
      ],
    },
    {
      id: 'mv-switchgear',
      name: 'MV Switchgear',
      position: { top: '42%', left: '45%' },
      icon: '📊',
      voltage: '25kV',
      description: 'Medium voltage distribution to unit substations',
      specs: [
        'Type: Metal-enclosed',
        'Voltage class: 25kV/15kV',
        'Bus rating: 1200-2000A',
        'BIL: 125kV',
        'Sections: 6-12 breakers',
      ],
    },
    {
      id: 'unit-substation-1',
      name: 'Unit Substation 1',
      position: { top: '58%', left: '25%' },
      icon: '⬇️',
      voltage: '25kV → 600V',
      description: 'Dry-type transformer serving Pod A mining floor',
      specs: [
        'Rating: 2500 kVA',
        'Type: Cast-resin dry',
        'Temp rise: 65°C',
        'Impedance: 5.75%',
        'Output: 600V 3-phase',
      ],
    },
    {
      id: 'unit-substation-2',
      name: 'Unit Substation 2',
      position: { top: '58%', left: '45%' },
      icon: '⬇️',
      voltage: '25kV → 600V',
      description: 'Dry-type transformer serving Pod B mining floor',
      specs: [
        'Rating: 2500 kVA',
        'Type: Cast-resin dry',
        'Temp rise: 65°C',
        'Impedance: 5.75%',
        'Output: 600V 3-phase',
      ],
    },
    {
      id: 'unit-substation-3',
      name: 'Unit Substation 3',
      position: { top: '58%', left: '65%' },
      icon: '⬇️',
      voltage: '25kV → 600V',
      description: 'Dry-type transformer serving Pod C mining floor',
      specs: [
        'Rating: 2500 kVA',
        'Type: Cast-resin dry',
        'Temp rise: 65°C',
        'Impedance: 5.75%',
        'Output: 600V 3-phase',
      ],
    },
    {
      id: 'pdu-1',
      name: 'PDU Cluster A',
      position: { top: '75%', left: '25%' },
      icon: '📦',
      voltage: '600V → 240V',
      description: 'Power Distribution Units for individual miner circuits',
      specs: [
        'Rating: 225-400 kVA each',
        'Output: 240V 1-phase',
        'Circuits: 42-84 per PDU',
        'Breakers: 30A-50A per miner',
        'Monitoring: Per-circuit metering',
      ],
    },
    {
      id: 'pdu-2',
      name: 'PDU Cluster B',
      position: { top: '75%', left: '45%' },
      icon: '📦',
      voltage: '600V → 240V',
      description: 'Power Distribution Units for individual miner circuits',
      specs: [
        'Rating: 225-400 kVA each',
        'Output: 240V 1-phase',
        'Circuits: 42-84 per PDU',
        'Breakers: 30A-50A per miner',
      ],
    },
    {
      id: 'pdu-3',
      name: 'PDU Cluster C',
      position: { top: '75%', left: '65%' },
      icon: '📦',
      voltage: '600V → 240V',
      description: 'Power Distribution Units for individual miner circuits',
      specs: [
        'Rating: 225-400 kVA each',
        'Output: 240V 1-phase',
        'Circuits: 42-84 per PDU',
        'Breakers: 30A-50A per miner',
      ],
    },
    {
      id: 'miners',
      name: 'ASIC Miners',
      position: { top: '90%', left: '45%' },
      icon: '💻',
      voltage: '240V AC → 12V DC',
      description: 'Bitcoin mining hardware with internal PSU conversion',
      specs: [
        'Input: 240V 1-phase',
        'Power: 3,000-5,500W each',
        'PSU efficiency: 93-95%',
        'Output: 12VDC to hash boards',
        'Power factor: 0.99 w/PFC',
      ],
    },
  ];

  const safetyEquipment = [
    {
      name: 'Protective Relays',
      description: 'Digital multifunction relays for overcurrent, ground fault, and differential protection',
      standards: 'IEEE C37, ANSI standards',
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

  const activeCompData = singleLineComponents.find(c => c.id === activeComponent);

  return (
    <section id="electrical" className="py-16 md:py-24 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <div className="text-center mb-12">
            <span className="inline-block px-4 py-1 rounded-full bg-watt-bitcoin/10 text-watt-bitcoin text-sm font-medium mb-4">
              Section 2 • Electrical Systems
            </span>
            <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
              Electrical Infrastructure
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
              Interactive single-line diagram showing the complete power distribution from utility to ASICs
            </p>
          </div>
        </ScrollReveal>

        {/* Substation Image Header */}
        <ScrollReveal delay={0.05}>
          <div className="relative rounded-2xl overflow-hidden mb-10 h-48 md:h-64">
            <img 
              src={substationDetail} 
              alt="High voltage electrical substation with transformers" 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-watt-navy/90 via-watt-navy/50 to-transparent" />
            <div className="absolute inset-0 flex items-center p-6 md:p-10">
              <div className="text-white max-w-lg">
                <h3 className="text-xl md:text-2xl font-bold mb-2">High Voltage Substation</h3>
                <p className="text-white/80 text-sm md:text-base">
                  138kV to 25kV step-down with SF6 breakers, protective relaying, and SCADA monitoring
                </p>
              </div>
            </div>
          </div>
        </ScrollReveal>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Interactive Single-Line Diagram */}
          <ScrollReveal delay={0.1} className="lg:col-span-2">
            <div className="bg-card rounded-2xl border border-border p-4 md:p-6">
              <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                <Cable className="w-5 h-5 text-watt-bitcoin" />
                Interactive Single-Line Diagram
              </h3>
              <p className="text-sm text-muted-foreground mb-4">Click any component to see detailed specifications</p>
              
              <div className="relative bg-muted/30 rounded-xl p-4 min-h-[500px]">
                {/* Diagram background with grid */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:20px_20px] rounded-xl" />
                
                {/* Connection lines (SVG) */}
                <svg className="absolute inset-0 w-full h-full" style={{ zIndex: 1 }}>
                  {/* Main vertical line */}
                  <line x1="50%" y1="8%" x2="50%" y2="45%" stroke="hsl(var(--watt-bitcoin))" strokeWidth="3" strokeOpacity="0.5" />
                  {/* Branch lines */}
                  <line x1="50%" y1="45%" x2="25%" y2="60%" stroke="hsl(var(--watt-bitcoin))" strokeWidth="2" strokeOpacity="0.4" />
                  <line x1="50%" y1="45%" x2="50%" y2="60%" stroke="hsl(var(--watt-bitcoin))" strokeWidth="2" strokeOpacity="0.4" />
                  <line x1="50%" y1="45%" x2="75%" y2="60%" stroke="hsl(var(--watt-bitcoin))" strokeWidth="2" strokeOpacity="0.4" />
                  {/* PDU lines */}
                  <line x1="25%" y1="62%" x2="25%" y2="78%" stroke="hsl(var(--watt-bitcoin))" strokeWidth="2" strokeOpacity="0.3" />
                  <line x1="50%" y1="62%" x2="50%" y2="78%" stroke="hsl(var(--watt-bitcoin))" strokeWidth="2" strokeOpacity="0.3" />
                  <line x1="75%" y1="62%" x2="75%" y2="78%" stroke="hsl(var(--watt-bitcoin))" strokeWidth="2" strokeOpacity="0.3" />
                  {/* Final to miners */}
                  <line x1="25%" y1="80%" x2="50%" y2="92%" stroke="hsl(var(--watt-bitcoin))" strokeWidth="1" strokeOpacity="0.3" />
                  <line x1="50%" y1="80%" x2="50%" y2="92%" stroke="hsl(var(--watt-bitcoin))" strokeWidth="1" strokeOpacity="0.3" />
                  <line x1="75%" y1="80%" x2="50%" y2="92%" stroke="hsl(var(--watt-bitcoin))" strokeWidth="1" strokeOpacity="0.3" />
                </svg>

                {/* Components */}
                {singleLineComponents.map((component) => (
                  <button
                    key={component.id}
                    onClick={() => setActiveComponent(activeComponent === component.id ? null : component.id)}
                    className={`absolute transform -translate-x-1/2 -translate-y-1/2 z-10 transition-all duration-200 ${
                      activeComponent === component.id
                        ? 'scale-110'
                        : 'hover:scale-105'
                    }`}
                    style={{ top: component.position.top, left: component.position.left }}
                  >
                    <div className={`px-2 py-1 rounded-lg text-xs font-medium whitespace-nowrap flex items-center gap-1 ${
                      activeComponent === component.id
                        ? 'bg-watt-bitcoin text-white shadow-lg shadow-watt-bitcoin/30'
                        : 'bg-card border border-border text-foreground hover:border-watt-bitcoin/50'
                    }`}>
                      <span>{component.icon}</span>
                      <span className="hidden sm:inline">{component.name}</span>
                      <span className="text-[10px] opacity-70 hidden md:inline">{component.voltage}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </ScrollReveal>

          {/* Component Details Panel */}
          <ScrollReveal delay={0.15}>
            <div className="bg-card rounded-2xl border border-border p-5 h-fit sticky top-24">
              <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                <Info className="w-5 h-5 text-watt-bitcoin" />
                Component Details
              </h3>
              
              {activeCompData ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{activeCompData.icon}</span>
                    <div>
                      <div className="font-semibold text-foreground">{activeCompData.name}</div>
                      <div className="text-xs text-watt-bitcoin font-mono">{activeCompData.voltage}</div>
                    </div>
                  </div>
                  
                  <p className="text-sm text-muted-foreground">{activeCompData.description}</p>
                  
                  <div className="space-y-2">
                    <h4 className="text-xs font-medium text-foreground uppercase tracking-wider">Specifications</h4>
                    {activeCompData.specs.map((spec, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs">
                        <ChevronRight className="w-3 h-3 text-watt-bitcoin flex-shrink-0" />
                        <span className="text-muted-foreground">{spec}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Gauge className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p className="text-sm">Click a component on the diagram to view its specifications</p>
                </div>
              )}
            </div>
          </ScrollReveal>
        </div>

        {/* Transformer Sizing Guide */}
        <ScrollReveal delay={0.2}>
          <div className="mt-10 bg-muted/30 rounded-2xl border border-border p-6">
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
          <div className="mt-10">
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
    </section>
  );
};

export default ElectricalInfrastructureSection;
