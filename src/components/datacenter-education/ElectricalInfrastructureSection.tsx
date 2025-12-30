import React from 'react';
import { motion } from 'framer-motion';
import { Zap, Gauge, Shield, AlertTriangle, CheckCircle, Cable, ArrowDown, Sparkles, Activity, Cpu } from 'lucide-react';
import { AnimatedCounter } from '@/components/ui/AnimatedCounter';
import LearningObjectives from '@/components/academy/LearningObjectives';
import SectionSummary from '@/components/academy/SectionSummary';
import {
  DCESectionWrapper,
  DCESectionHeader,
  DCEContentCard,
  DCEStatCard,
  DCEKeyInsight,
  DCEDeepDive,
  DCECallout
} from './shared';

// Import AI-generated 3D images
import electricalUtilityFeed from '@/assets/electrical-utility-feed.jpg';
import electricalPowerTransformer from '@/assets/electrical-power-transformer.jpg';
import electricalMvSwitchgear from '@/assets/electrical-mv-switchgear.jpg';
import electricalPduCluster from '@/assets/electrical-pdu-cluster.jpg';
import asicMinersPowered from '@/assets/asic-miners-powered.jpg';

const ElectricalInfrastructureSection = () => {
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
      equipment: ['Transmission towers', 'ACSR conductors', 'Dead-end structures'],
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
    <DCESectionWrapper theme="light" id="electrical">
      <LearningObjectives
        objectives={[
          "Trace the complete voltage step-down chain: 138kV → 25kV → 600V → 240V → 12V DC",
          "Understand transformer sizing, protection coordination, and efficiency ratings",
          "Learn key electrical equipment: switchgear, PDUs, protective relays, arc flash mitigation",
          "Calculate power losses at each transformation stage (~2.5% total system loss)"
        ]}
        estimatedTime="10 min"
        prerequisites={[
          { title: "Energy Source", href: "#energy-source" }
        ]}
      />
      
      <DCESectionHeader
        badge="Section 2 • Electrical Systems"
        badgeIcon={Zap}
        title="Single-Line Diagram"
        description="Follow the power journey from 138kV utility feed down to 12V DC at the ASIC hash boards"
      />

      {/* Power Flow Diagram */}
      <div className="mb-12 md:mb-16">
        <div className="space-y-8">
          {powerFlowSteps.map((step, index) => (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="relative"
            >
              {/* Step Header */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* Left Content */}
                <div className={`lg:col-span-5 ${index % 2 === 0 ? 'lg:order-1' : 'lg:order-3 lg:text-right'}`}>
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-muted/50 rounded-full text-xs font-medium text-muted-foreground mb-2">
                    <Sparkles className="w-3 h-3" />
                    Step {step.id} of 4
                  </div>
                  <h3 className="text-xl md:text-2xl font-bold text-foreground mb-1">{step.name}</h3>
                  <div className="flex items-center gap-3 mb-2 flex-wrap lg:justify-start">
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
                <div className="lg:col-span-2 lg:order-2 flex justify-center relative">
                  {/* Voltage Step-Down Indicator */}
                  {index > 0 && (
                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 flex flex-col items-center">
                      <motion.div 
                        className="w-8 h-8 rounded-full bg-[hsl(var(--watt-bitcoin)/0.2)] flex items-center justify-center"
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        <ArrowDown className="w-4 h-4 text-[hsl(var(--watt-bitcoin))]" />
                      </motion.div>
                      <span className="text-[10px] text-muted-foreground mt-1">
                        {powerFlowSteps[index - 1].losses} loss
                      </span>
                    </div>
                  )}

                  <div className="relative w-28 h-28 md:w-32 md:h-32 rounded-2xl overflow-hidden border-4 border-border shadow-2xl hover:border-[hsl(var(--watt-bitcoin)/0.5)] transition-all duration-500">
                    <img 
                      src={step.image} 
                      alt={step.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-2 right-2 text-2xl">
                      {step.icon}
                    </div>
                  </div>
                </div>

                {/* Right Content - Brands & Cost */}
                <div className={`lg:col-span-5 ${index % 2 === 0 ? 'lg:order-3' : 'lg:order-1 lg:text-right'}`}>
                  <div className={`flex flex-wrap gap-2 mb-2 ${index % 2 === 0 ? 'justify-start' : 'lg:justify-end'}`}>
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

              {/* Details Panel */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 + 0.2 }}
                className="mt-4 ml-auto mr-auto max-w-4xl"
              >
                <div className="bg-card rounded-2xl border border-border p-4 md:p-6 shadow-lg hover:shadow-xl hover:border-[hsl(var(--watt-bitcoin)/0.2)] transition-all duration-300">
                  <div className="grid md:grid-cols-2 gap-4 md:gap-6">
                    {/* Specs */}
                    <div>
                      <h4 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
                        <Gauge className="w-4 h-4 text-[hsl(var(--watt-bitcoin))]" />
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
                        <Cable className="w-4 h-4 text-[hsl(var(--watt-bitcoin))]" />
                        Key Equipment
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {step.equipment.map((eq) => (
                          <span key={eq} className="px-3 py-1 bg-muted rounded-lg text-xs text-foreground">
                            {eq}
                          </span>
                        ))}
                      </div>

                      <div className="mt-4 p-3 bg-[hsl(var(--watt-bitcoin)/0.1)] rounded-lg">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">Power Loss</span>
                          <span className="text-sm font-bold text-[hsl(var(--watt-bitcoin))]">{step.losses}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          ))}

          {/* Final Output - ASIC Miners */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mt-8"
          >
            <div className="relative overflow-hidden rounded-2xl border-2 border-[hsl(var(--watt-bitcoin)/0.3)] bg-gradient-to-br from-cyan-500/5 via-[hsl(var(--watt-bitcoin)/0.1)] to-cyan-500/5">
              <div className="grid md:grid-cols-2 gap-6 p-6 md:p-8 relative z-10">
                {/* Left: Real Miner Image */}
                <div className="relative group">
                  <div className="relative rounded-xl overflow-hidden">
                    <img 
                      src={asicMinersPowered} 
                      alt="ASIC Bitcoin Mining Hardware with Power Connections"
                      className="w-full h-48 md:h-64 object-cover"
                    />
                    {/* Mining Active Badge */}
                    <div className="absolute -top-3 -right-3 px-3 py-1.5 bg-emerald-500 text-white text-xs font-bold rounded-full flex items-center gap-1.5 shadow-lg animate-pulse">
                      <Activity className="w-3 h-3" />
                      Mining Active
                    </div>
                  </div>
                </div>

                {/* Right: Specs and Stats */}
                <div className="flex flex-col justify-center">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[hsl(var(--watt-bitcoin))] to-orange-600 flex items-center justify-center">
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
                      <div className="text-lg font-bold text-[hsl(var(--watt-bitcoin))]">12V DC</div>
                    </div>
                    <div className="p-3 bg-card rounded-lg border border-border">
                      <div className="text-xs text-muted-foreground mb-1">Power Draw</div>
                      <div className="text-lg font-bold text-foreground">3-5.5 kW</div>
                    </div>
                    <div className="p-3 bg-card rounded-lg border border-border">
                      <div className="text-xs text-muted-foreground mb-1">PSU Efficiency</div>
                      <div className="text-lg font-bold text-emerald-600">93-95%</div>
                    </div>
                  </div>

                  {/* Live Hashrate */}
                  <div className="p-4 bg-gradient-to-r from-[hsl(var(--watt-navy))] to-[hsl(var(--watt-navy)/0.9)] rounded-xl text-white">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-xs text-white/70 mb-1">Hashrate Per Unit</div>
                        <div className="text-2xl font-bold font-mono">
                          <AnimatedCounter end={335} suffix=" TH/s" />
                        </div>
                      </div>
                      <motion.div 
                        className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                      >
                        <Activity className="w-6 h-6 text-[hsl(var(--watt-bitcoin))]" />
                      </motion.div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Key Insight */}
      <DCEKeyInsight variant="insight" className="mb-8">
        Total system efficiency from utility feed to ASIC hash boards is approximately 97.5%, with only 2.5% power 
        lost across the four transformation stages. Larger transformers have higher efficiency ratings.
      </DCEKeyInsight>

      {/* Total System Efficiency Banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="mb-8 md:mb-10 p-4 md:p-6 bg-gradient-to-r from-[hsl(var(--watt-navy))] to-[hsl(var(--watt-navy)/0.9)] rounded-xl md:rounded-2xl text-white"
      >
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 text-center">
          <div>
            <div className="text-2xl md:text-3xl font-bold text-[hsl(var(--watt-bitcoin))]">
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
      </motion.div>

      {/* Transformer Sizing Guide */}
      <DCEDeepDive title="Transformer Sizing Guide" icon={Zap} className="mb-8">
        <p className="text-sm text-muted-foreground mb-4">
          Typical dry-type unit substation ratings for mining facilities (600V output, Canada)
        </p>
        
        <div className="overflow-x-auto">
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
                  <td className="py-2 md:py-3 px-2 md:px-4 text-[hsl(var(--watt-bitcoin))] font-mono">{row.mw} MW</td>
                  <td className="py-2 md:py-3 px-2 md:px-4 text-muted-foreground">~{row.miners}</td>
                  <td className="py-2 md:py-3 px-2 md:px-4 text-emerald-600">{row.efficiency}</td>
                  <td className="py-2 md:py-3 px-2 md:px-4 text-muted-foreground">{row.cost}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-[10px] md:text-xs text-muted-foreground mt-3">
          *At 80% loading factor (continuous duty derating per NEC/CSA)
        </p>
      </DCEDeepDive>

      {/* Safety Equipment Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
      >
        <h3 className="text-lg md:text-xl font-bold text-foreground mb-4 md:mb-6">Electrical Safety Systems</h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          {safetyEquipment.map((item, index) => (
            <motion.div
              key={item.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="bg-card rounded-lg md:rounded-xl border border-border p-3 md:p-5 hover:border-[hsl(var(--watt-bitcoin)/0.5)] hover:shadow-lg transition-all duration-300"
            >
              <item.icon className="w-6 h-6 md:w-8 md:h-8 text-[hsl(var(--watt-bitcoin))] mb-2 md:mb-3" />
              <h4 className="font-semibold text-foreground text-sm md:text-base mb-1 md:mb-2">{item.name}</h4>
              <p className="text-[10px] md:text-xs text-muted-foreground mb-2 md:mb-3 line-clamp-3">{item.description}</p>
              <span className="text-[9px] md:text-[10px] px-1.5 md:px-2 py-0.5 md:py-1 bg-muted rounded text-muted-foreground">{item.standards}</span>
            </motion.div>
          ))}
        </div>
      </motion.div>

      <SectionSummary
        takeaways={[
          "Power flows through 4 transformation stages: utility feed → transformer → switchgear → PDU",
          "Total system efficiency is approximately 97.5% from grid to ASIC",
          "Larger transformers have better efficiency ratings (99%+ for 2000+ kVA)",
          "Proper safety systems including protective relays and arc flash mitigation are essential"
        ]}
        nextSteps={[
          { title: "Facility Design", href: "#facility-design", description: "Explore warehouse, container, and modular building options" }
        ]}
        proTip="Consider N+1 redundancy for transformers in mission-critical deployments to avoid single points of failure."
      />
    </DCESectionWrapper>
  );
};

export default ElectricalInfrastructureSection;
