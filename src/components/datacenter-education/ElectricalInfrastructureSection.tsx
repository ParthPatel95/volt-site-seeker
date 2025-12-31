import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Zap, Gauge, Shield, AlertTriangle, CheckCircle, Cable, ArrowDown, 
  Sparkles, Activity, Cpu, BookOpen, ChevronDown, Calculator, Info,
  Flame, Settings, CircleDot, Layers
} from 'lucide-react';
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
  DCECallout,
  DCEDisclaimer,
  DataQualityBadge,
  SourceCitation
} from './shared';

// Import AI-generated 3D images
import electricalUtilityFeed from '@/assets/electrical-utility-feed.jpg';
import electricalPowerTransformer from '@/assets/electrical-power-transformer.jpg';
import electricalMvSwitchgear from '@/assets/electrical-mv-switchgear.jpg';
import electricalPduCluster from '@/assets/electrical-pdu-cluster.jpg';
import asicMinersPowered from '@/assets/asic-miners-powered.jpg';

const ElectricalInfrastructureSection = () => {
  const [showTransformerPhysics, setShowTransformerPhysics] = useState(false);
  const [showArcFlashDetails, setShowArcFlashDetails] = useState(false);
  const [activePowerFlowStep, setActivePowerFlowStep] = useState<number | null>(null);

  // Transformer physics explanation
  const transformerPhysics = {
    title: "How Transformers Work: Electromagnetic Induction",
    principle: `Transformers operate on Faraday's law of electromagnetic induction. When alternating current 
    flows through the primary winding, it creates a changing magnetic field in the iron core. This changing 
    magnetic field induces a voltage in the secondary winding proportional to the turns ratio.`,
    equation: "V₂/V₁ = N₂/N₁ (Voltage ratio equals turns ratio)",
    keyPoints: [
      {
        concept: "Turns Ratio",
        explanation: "A transformer with 1000 primary turns and 100 secondary turns steps 25kV down to 2.5kV"
      },
      {
        concept: "Power Conservation",
        explanation: "Input power ≈ Output power (minus losses). If voltage steps down, current must step up: P = V × I"
      },
      {
        concept: "Core Losses (Iron)",
        explanation: "Hysteresis and eddy current losses in the core. Present whenever transformer is energized, regardless of load."
      },
      {
        concept: "Winding Losses (Copper)",
        explanation: "I²R losses in the windings. Increase with the square of load current."
      }
    ],
    efficiencyNote: "Modern power transformers achieve 99%+ efficiency. A 50 MVA transformer with 99.5% efficiency still dissipates 250 kW as heat."
  };

  // Arc flash hazard explanation
  const arcFlashExplainer = {
    title: "Arc Flash Hazards: Why This Matters",
    description: `An arc flash is an electrical explosion caused by a fault condition that ionizes the air between 
    conductors. Temperatures can exceed 35,000°F (19,400°C) — hotter than the surface of the sun. The blast 
    pressure wave can throw personnel across rooms and cause severe burns, hearing loss, and fatalities.`,
    incidentEnergyLevels: [
      { category: 0, calPerCm2: "1.2", ppe: "Arc-rated clothing", risk: "Second-degree burns" },
      { category: 1, calPerCm2: "4", ppe: "Arc-rated FR shirt/pants", risk: "Survivable with PPE" },
      { category: 2, calPerCm2: "8", ppe: "Arc flash suit (8 cal)", risk: "Significant blast hazard" },
      { category: 3, calPerCm2: "25", ppe: "Arc flash suit (25 cal)", risk: "Life-threatening" },
      { category: 4, calPerCm2: "40", ppe: "Arc flash suit (40 cal)", risk: "Extreme danger zone" },
    ],
    mitigationStrategies: [
      "Arc-resistant switchgear (directs blast energy away from personnel)",
      "Differential protection (clears faults in <3 cycles, reducing incident energy)",
      "Remote racking and switching (no personnel in arc flash zone)",
      "Arc flash relay technology (detects light + current, trips in <1ms)",
      "Current-limiting fuses (limit let-through energy)"
    ],
    standards: "IEEE 1584-2018, NFPA 70E, CSA Z462"
  };

  const powerFlowSteps = [
    {
      id: 1,
      name: 'High-Voltage Utility Feed',
      voltage: '138kV (3-phase)',
      current: '418A @ 100MW',
      image: electricalUtilityFeed,
      icon: Zap,
      color: 'from-red-500 to-orange-500',
      description: 'High-voltage transmission lines deliver bulk power from the grid to the facility substation. At 138kV, current is minimized to reduce I²R transmission losses.',
      physicsNote: 'Current = Power / (√3 × Voltage) = 100MW / (1.732 × 138kV) = 418A',
      specs: [
        { label: 'Voltage Class', value: '138kV 3-phase', explanation: 'Standard transmission voltage; 345kV and 500kV also common' },
        { label: 'Fault Current', value: '20-50 kA', explanation: 'Available short-circuit current from the grid; determines protection ratings' },
        { label: 'Protection', value: 'Utility relay coordination', explanation: 'Overcurrent, distance, and differential protection schemes' },
        { label: 'Metering', value: 'Revenue-grade (0.2% accuracy)', explanation: 'Current and potential transformers for billing accuracy' },
      ],
      equipment: [
        { item: 'Dead-end structures', purpose: 'Anchor transmission conductors; withstand mechanical loads' },
        { item: 'ACSR conductors', purpose: 'Aluminum conductor steel reinforced; optimizes conductivity and strength' },
        { item: 'Lightning arresters', purpose: 'Divert lightning surge to ground; protect equipment' },
        { item: 'Disconnect switches', purpose: 'Visible isolation for maintenance; no load-breaking capability' },
      ],
      losses: '0.3-1.0%',
      lossExplanation: 'Primarily I²R losses in transmission line; minimized by high voltage operation',
      costRange: '$2-8M',
      costFactors: ['Line length', 'Utility upgrade requirements', 'Interconnection queue position'],
    },
    {
      id: 2,
      name: 'Main Power Transformer',
      voltage: '138kV → 25kV',
      current: '418A → 2,309A @ 100MW',
      image: electricalPowerTransformer,
      icon: Settings,
      color: 'from-orange-500 to-yellow-500',
      description: 'Oil-immersed power transformer steps down high voltage for facility distribution. The transformer is the heart of the electrical system — its size and configuration determine facility capacity.',
      physicsNote: 'Current increases by voltage ratio: 418A × (138/25) = 2,309A. Same power, lower voltage = higher current.',
      specs: [
        { label: 'Rating', value: '50-100 MVA', explanation: 'Apparent power capacity; real power depends on power factor' },
        { label: 'Impedance', value: '8-12%', explanation: 'Limits fault current; affects voltage regulation under load' },
        { label: 'Cooling', value: 'ONAN/ONAF', explanation: 'Oil Natural Air Natural / Oil Natural Air Forced — fan-assisted cooling' },
        { label: 'Efficiency', value: '99.3-99.7%', explanation: 'At full load; efficiency varies with loading' },
      ],
      equipment: [
        { item: 'Oil-filled tank', purpose: 'Dielectric insulation and heat transfer medium' },
        { item: 'Radiator banks', purpose: 'Heat dissipation via oil circulation; fans for forced cooling' },
        { item: 'Buchholz relay', purpose: 'Detects internal faults via gas accumulation in oil' },
        { item: 'Load tap changer (LTC)', purpose: 'Adjusts output voltage ±10% to maintain regulation' },
        { item: 'Conservator tank', purpose: 'Expansion reservoir; prevents moisture ingress' },
      ],
      losses: '0.3-0.7%',
      lossExplanation: 'Iron losses (constant) + Copper losses (vary with I²). No-load loss ~0.1%, full-load loss ~0.5%',
      costRange: '$1.5-4M',
      costFactors: ['MVA rating', 'Voltage class', 'Impedance requirements', 'Lead time (12-24 months typical)'],
    },
    {
      id: 3,
      name: 'Medium-Voltage Switchgear',
      voltage: '25kV',
      current: '1,200-2,500A bus',
      image: electricalMvSwitchgear,
      icon: Layers,
      color: 'from-yellow-500 to-green-500',
      description: 'Metal-enclosed switchgear distributes power to multiple unit substations across the facility. This is the primary distribution point and contains the main protective devices.',
      physicsNote: 'Switchgear must safely interrupt fault currents. At 25kV with 50kA fault duty, interrupting power = √3 × 25kV × 50kA = 2.16 GVA',
      specs: [
        { label: 'Type', value: 'Metal-enclosed', explanation: 'Personnel protection; contains arc within enclosure' },
        { label: 'Voltage Class', value: '25kV / 15kV', explanation: '25kV common in Canada; 15kV class in US' },
        { label: 'Bus Rating', value: '1200-2500A', explanation: 'Continuous current capacity of main bus' },
        { label: 'Short Circuit', value: '40-50 kA', explanation: 'Maximum fault current switchgear can safely interrupt' },
      ],
      equipment: [
        { item: 'Vacuum circuit breakers', purpose: 'Interrupt load and fault currents; arc extinguishes in vacuum' },
        { item: 'Protective relays (SEL, GE)', purpose: 'Digital multifunction relays for overcurrent, ground fault, differential' },
        { item: 'CTs/PTs', purpose: 'Scale current/voltage to relay input levels (5A, 120V nominal)' },
        { item: 'Control power transformers', purpose: 'Station service for relays, lights, motors' },
      ],
      losses: '0.05-0.1%',
      lossExplanation: 'Primarily contact resistance in breakers and bus joints; minimal at this stage',
      costRange: '$500K-2M',
      costFactors: ['Number of breaker positions', 'Arc-resistant design', 'Relay sophistication'],
    },
    {
      id: 4,
      name: 'Unit Substation & PDU Distribution',
      voltage: '25kV → 600V → 240V',
      current: '500-1,000A per PDU',
      image: electricalPduCluster,
      icon: CircleDot,
      color: 'from-green-500 to-cyan-500',
      description: 'Unit substations (dry-type transformers) step down to 600V, then Power Distribution Units (PDUs) with integral transformers deliver 240V to ASIC racks. This is where most of the distribution losses occur.',
      physicsNote: 'Multiple voltage transformations trade off simplicity vs. efficiency. Each step adds ~0.5-1% loss.',
      specs: [
        { label: 'Unit Sub Rating', value: '1500-3000 kVA', explanation: 'Dry-type preferred for indoor; oil-type for outdoor' },
        { label: 'PDU Rating', value: '225-500 kVA', explanation: 'Final step-down; matches ASIC voltage requirements' },
        { label: 'Output', value: '240V 1-phase or 208V 3-phase', explanation: 'ASIC PSUs designed for 200-240V input' },
        { label: 'Monitoring', value: 'Per-circuit metering', explanation: 'Track power per rack for efficiency and billing' },
      ],
      equipment: [
        { item: 'Dry-type transformers', purpose: 'No oil = reduced fire risk, indoor installation' },
        { item: 'Molded case breakers', purpose: 'Branch circuit protection; thermal-magnetic or electronic trip' },
        { item: 'Intelligent PDUs', purpose: 'Per-outlet monitoring, remote switching, environmental sensors' },
        { item: 'Busway/busduct', purpose: 'High-capacity power distribution along row; tap-off boxes' },
      ],
      losses: '1.5-3.0%',
      lossExplanation: 'Cumulative: unit sub ~1%, PDU transformer ~1%, cable/connections ~0.5%',
      costRange: '$30-60K per MW',
      costFactors: ['Transformer efficiency class', 'Monitoring features', 'Redundancy (N vs N+1)'],
    },
  ];

  const safetyEquipment = [
    {
      name: 'Protective Relays',
      description: 'Digital multifunction relays monitor current, voltage, frequency, and power. Detect faults (overcurrent, ground fault, arc flash) and trip breakers in milliseconds to isolate faults.',
      standards: 'IEEE C37.90, C37.111',
      icon: Shield,
      details: [
        '50/51 — Instantaneous/Time Overcurrent',
        '51N — Ground Fault (sensitive earth fault)',
        '87 — Differential (transformer/bus protection)',
        '27/59 — Under/Overvoltage',
      ]
    },
    {
      name: 'Arc Flash Mitigation',
      description: 'Systems to detect and rapidly clear arc flash events, minimizing incident energy exposure to personnel. Modern systems can clear faults in <2 cycles (33ms).',
      standards: 'IEEE 1584, NFPA 70E, CSA Z462',
      icon: Flame,
      details: [
        'Arc-resistant switchgear (Type 2B)',
        'Light-sensing arc flash relays',
        'Zone-selective interlocking (ZSI)',
        'Maintenance mode (reduces trip time)',
      ]
    },
    {
      name: 'Grounding System',
      description: 'Ground grid and equipment bonding system limits step and touch potentials during faults, provides low-impedance path for fault current, and ensures personnel safety.',
      standards: 'IEEE 80, IEEE 142 (Green Book)',
      icon: Zap,
      details: [
        'Ground grid (copper mesh below grade)',
        'Equipment grounding conductors',
        'Ground fault detection (GFI)',
        'Step/touch voltage limits per IEEE 80',
      ]
    },
    {
      name: 'Emergency Systems',
      description: 'Emergency power off (EPO), fire suppression coordination, and egress systems. Allows rapid de-energization of facility for emergency response.',
      standards: 'NFPA 110, NFPA 70, NEC 645',
      icon: AlertTriangle,
      details: [
        'Emergency disconnect (utility visible-break)',
        'Fire suppression interlock (VESDA)',
        'Emergency lighting (90-minute battery)',
        'EPO stations at exits',
      ]
    },
  ];

  const transformerSizing = [
    { kva: 1000, mw: 0.8, miners: 230, efficiency: '98.8%', noLoadLoss: '1.8 kW', fullLoadLoss: '10.2 kW', cost: '$45K' },
    { kva: 1500, mw: 1.2, miners: 345, efficiency: '99.0%', noLoadLoss: '2.4 kW', fullLoadLoss: '13.5 kW', cost: '$60K' },
    { kva: 2000, mw: 1.6, miners: 460, efficiency: '99.2%', noLoadLoss: '2.9 kW', fullLoadLoss: '15.8 kW', cost: '$75K' },
    { kva: 2500, mw: 2.0, miners: 575, efficiency: '99.3%', noLoadLoss: '3.3 kW', fullLoadLoss: '17.5 kW', cost: '$90K' },
    { kva: 3000, mw: 2.4, miners: 690, efficiency: '99.4%', noLoadLoss: '3.8 kW', fullLoadLoss: '19.2 kW', cost: '$110K' },
  ];

  const powerQualityConsiderations = [
    {
      issue: 'Harmonics (THD)',
      source: 'ASIC switching power supplies',
      impact: 'Overheating of transformers and cables; nuisance relay trips',
      threshold: 'IEEE 519: <5% THD voltage, <8% THD current at PCC',
      mitigation: 'K-rated transformers, harmonic filters, phase-shifting transformers'
    },
    {
      issue: 'Power Factor',
      source: 'Switch-mode power supplies (typically 0.95-0.99 PF)',
      impact: 'Utility power factor penalties; reduced system capacity',
      threshold: 'Most utilities require >0.90 PF to avoid penalties',
      mitigation: 'Modern ASIC PSUs have active PFC; capacitor banks if needed'
    },
    {
      issue: 'Voltage Sags/Swells',
      source: 'Grid disturbances, load switching, faults',
      impact: 'ASIC restarts, hash rate loss, potential equipment damage',
      threshold: 'ITIC curve: survive 0.5 cycle dropout, 10% sag for 10 seconds',
      mitigation: 'UPS for control systems; robust PSU design; utility coordination'
    },
    {
      issue: 'Transients/Surges',
      source: 'Lightning, switching operations, capacitor energization',
      impact: 'Equipment damage, semiconductor failure',
      threshold: 'IEEE C62.41: Category B3 for industrial',
      mitigation: 'SPDs at service entrance and PDU level; proper grounding'
    },
  ];

  return (
    <DCESectionWrapper theme="light" id="electrical">
      <LearningObjectives
        objectives={[
          "Understand transformer physics: turns ratio, losses, and efficiency",
          "Trace the complete voltage step-down chain: 138kV → 25kV → 600V → 240V → 12V DC",
          "Learn why arc flash is the #1 electrical safety hazard and how to mitigate it",
          "Understand power quality: harmonics, power factor, and voltage disturbances",
          "Calculate system losses and identify efficiency optimization opportunities"
        ]}
        estimatedTime="15 min"
        prerequisites={[
          { title: "Energy Source", href: "#energy-source" }
        ]}
      />
      
      <DCESectionHeader
        badge="Section 2 • Electrical Systems"
        badgeIcon={Zap}
        title="Electrical Infrastructure"
        description="From 138kV transmission to 12V DC at the hash board — understanding every voltage transformation"
      />

      {/* Transformer Physics Primer */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="mb-10"
      >
        <button
          onClick={() => setShowTransformerPhysics(!showTransformerPhysics)}
          className="w-full flex items-center justify-between p-5 bg-card border border-border rounded-2xl hover:border-[hsl(var(--watt-bitcoin)/0.5)] transition-all"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[hsl(var(--watt-bitcoin))] to-orange-600 flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <div className="text-left">
              <h3 className="font-bold text-foreground">First Principles: How Transformers Work</h3>
              <p className="text-sm text-muted-foreground">Electromagnetic induction, turns ratio, and efficiency losses</p>
            </div>
          </div>
          <ChevronDown className={`w-5 h-5 text-muted-foreground transition-transform ${showTransformerPhysics ? 'rotate-180' : ''}`} />
        </button>
        
        <AnimatePresence>
          {showTransformerPhysics && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="p-6 bg-card border-x border-b border-border rounded-b-2xl">
                <p className="text-muted-foreground mb-6 leading-relaxed">{transformerPhysics.principle}</p>
                
                {/* Core Equation */}
                <div className="p-4 bg-[hsl(var(--watt-bitcoin)/0.1)] rounded-xl mb-6 text-center">
                  <div className="text-2xl font-mono font-bold text-[hsl(var(--watt-bitcoin))]">
                    {transformerPhysics.equation}
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    The fundamental transformer equation — voltage ratio equals turns ratio
                  </p>
                </div>

                {/* Key Points Grid */}
                <div className="grid md:grid-cols-2 gap-4 mb-6">
                  {transformerPhysics.keyPoints.map((point, i) => (
                    <div key={i} className="p-4 bg-muted/50 rounded-lg">
                      <h4 className="font-semibold text-foreground mb-1">{point.concept}</h4>
                      <p className="text-sm text-muted-foreground">{point.explanation}</p>
                    </div>
                  ))}
                </div>

                <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                  <div className="flex items-start gap-3">
                    <Info className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-amber-700">{transformerPhysics.efficiencyNote}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Power Flow Diagram */}
      <div className="mb-12 md:mb-16">
        <DCEDisclaimer severity="informational">
          <strong>Equipment costs and specifications are representative values.</strong> Actual costs vary based on 
          manufacturer, lead time, voltage class, and project-specific requirements. Consult qualified electrical 
          engineers for project-specific designs.
        </DCEDisclaimer>

        <div className="space-y-8 mt-8">
          {powerFlowSteps.map((step, index) => (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="relative"
            >
              {/* Voltage Step-Down Indicator */}
              {index > 0 && (
                <div className="flex justify-center py-3 -mt-4">
                  <motion.div 
                    className="flex flex-col items-center"
                    animate={{ y: [0, 5, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <div className="w-10 h-10 rounded-full bg-[hsl(var(--watt-bitcoin)/0.2)] flex items-center justify-center">
                      <ArrowDown className="w-5 h-5 text-[hsl(var(--watt-bitcoin))]" />
                    </div>
                    <span className="text-xs text-muted-foreground mt-1">
                      {powerFlowSteps[index - 1].losses} loss
                    </span>
                  </motion.div>
                </div>
              )}

              {/* Main Step Card */}
              <div 
                className={`bg-card rounded-2xl border overflow-hidden transition-all duration-300 cursor-pointer ${
                  activePowerFlowStep === index 
                    ? 'border-[hsl(var(--watt-bitcoin))] shadow-lg shadow-[hsl(var(--watt-bitcoin)/0.1)]' 
                    : 'border-border hover:border-[hsl(var(--watt-bitcoin)/0.3)]'
                }`}
                onClick={() => setActivePowerFlowStep(activePowerFlowStep === index ? null : index)}
              >
                {/* Header */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 p-5 items-center">
                  {/* Image & Icon */}
                  <div className="lg:col-span-2 flex justify-center">
                    <div className="relative w-24 h-24 rounded-xl overflow-hidden border-2 border-border">
                      <img 
                        src={step.image} 
                        alt={step.name}
                        className="w-full h-full object-cover"
                      />
                      <div className={`absolute bottom-1 right-1 w-8 h-8 rounded-lg bg-gradient-to-br ${step.color} flex items-center justify-center`}>
                        <step.icon className="w-4 h-4 text-white" />
                      </div>
                    </div>
                  </div>

                  {/* Title & Voltage */}
                  <div className="lg:col-span-5">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs text-muted-foreground font-medium">Step {step.id}</span>
                      <DataQualityBadge quality="estimate" />
                    </div>
                    <h3 className="text-lg font-bold text-foreground mb-1">{step.name}</h3>
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className={`px-3 py-1 rounded-lg bg-gradient-to-r ${step.color} text-white text-sm font-bold`}>
                        {step.voltage}
                      </span>
                      <span className="text-xs text-muted-foreground font-mono">{step.current}</span>
                    </div>
                  </div>

                  {/* Quick Stats */}
                  <div className="lg:col-span-5 grid grid-cols-3 gap-3">
                    <div className="text-center p-2 bg-muted/50 rounded-lg">
                      <div className="text-xs text-muted-foreground">Loss</div>
                      <div className="font-bold text-[hsl(var(--watt-bitcoin))]">{step.losses}</div>
                    </div>
                    <div className="text-center p-2 bg-muted/50 rounded-lg">
                      <div className="text-xs text-muted-foreground">Cost</div>
                      <div className="font-bold text-foreground">{step.costRange}</div>
                    </div>
                    <div className="text-center p-2 bg-muted/50 rounded-lg flex items-center justify-center">
                      <ChevronDown className={`w-5 h-5 text-muted-foreground transition-transform ${activePowerFlowStep === index ? 'rotate-180' : ''}`} />
                    </div>
                  </div>
                </div>

                {/* Expanded Details */}
                <AnimatePresence>
                  {activePowerFlowStep === index && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="border-t border-border"
                    >
                      <div className="p-6">
                        {/* Description */}
                        <p className="text-muted-foreground mb-4">{step.description}</p>

                        {/* Physics Note */}
                        <div className="p-4 bg-[hsl(var(--watt-bitcoin)/0.1)] rounded-lg mb-6">
                          <div className="flex items-start gap-3">
                            <Calculator className="w-5 h-5 text-[hsl(var(--watt-bitcoin))] flex-shrink-0 mt-0.5" />
                            <div>
                              <h4 className="font-semibold text-foreground mb-1">Engineering Note</h4>
                              <p className="text-sm text-muted-foreground font-mono">{step.physicsNote}</p>
                            </div>
                          </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
                          {/* Specifications */}
                          <div>
                            <h4 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
                              <Gauge className="w-4 h-4 text-[hsl(var(--watt-bitcoin))]" />
                              Technical Specifications
                            </h4>
                            <div className="space-y-3">
                              {step.specs.map((spec, i) => (
                                <div key={i} className="p-3 bg-muted/30 rounded-lg">
                                  <div className="flex justify-between text-sm mb-1">
                                    <span className="text-muted-foreground">{spec.label}</span>
                                    <span className="font-medium text-foreground">{spec.value}</span>
                                  </div>
                                  <p className="text-xs text-muted-foreground">{spec.explanation}</p>
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
                            <div className="space-y-2">
                              {step.equipment.map((eq, i) => (
                                <div key={i} className="flex items-start gap-2">
                                  <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                                  <div>
                                    <span className="text-sm font-medium text-foreground">{eq.item}</span>
                                    <span className="text-sm text-muted-foreground"> — {eq.purpose}</span>
                                  </div>
                                </div>
                              ))}
                            </div>

                            {/* Loss Explanation */}
                            <div className="mt-4 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-xs font-medium text-amber-700">Power Loss at This Stage</span>
                                <span className="font-bold text-amber-700">{step.losses}</span>
                              </div>
                              <p className="text-xs text-amber-600">{step.lossExplanation}</p>
                            </div>
                          </div>
                        </div>

                        {/* Cost Factors */}
                        <div className="mt-4 p-3 bg-muted/30 rounded-lg">
                          <div className="text-xs text-muted-foreground mb-2">
                            <strong>Cost Range: {step.costRange}</strong> — Key factors:
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {step.costFactors.map((factor, i) => (
                              <span key={i} className="px-2 py-1 bg-background rounded text-xs text-foreground">
                                {factor}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
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
            <div className="flex justify-center py-3">
              <motion.div 
                className="flex flex-col items-center"
                animate={{ y: [0, 5, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <div className="w-10 h-10 rounded-full bg-[hsl(var(--watt-bitcoin)/0.2)] flex items-center justify-center">
                  <ArrowDown className="w-5 h-5 text-[hsl(var(--watt-bitcoin))]" />
                </div>
                <span className="text-xs text-muted-foreground mt-1">Final conversion</span>
              </motion.div>
            </div>

            <div className="relative overflow-hidden rounded-2xl border-2 border-[hsl(var(--watt-bitcoin)/0.3)] bg-gradient-to-br from-cyan-500/5 via-[hsl(var(--watt-bitcoin)/0.1)] to-cyan-500/5">
              <div className="grid md:grid-cols-2 gap-6 p-6 md:p-8 relative z-10">
                {/* Left: Miner Image */}
                <div className="relative">
                  <div className="relative rounded-xl overflow-hidden">
                    <img 
                      src={asicMinersPowered} 
                      alt="ASIC Bitcoin Mining Hardware"
                      className="w-full h-48 md:h-64 object-cover"
                    />
                    <div className="absolute -top-3 -right-3 px-3 py-1.5 bg-emerald-500 text-white text-xs font-bold rounded-full flex items-center gap-1.5 shadow-lg animate-pulse">
                      <Activity className="w-3 h-3" />
                      Hashing
                    </div>
                  </div>
                </div>

                {/* Right: Final Specs */}
                <div className="flex flex-col justify-center">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[hsl(var(--watt-bitcoin))] to-orange-600 flex items-center justify-center">
                      <Cpu className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h4 className="text-xl font-bold text-foreground">ASIC Power Supply Unit</h4>
                      <p className="text-sm text-muted-foreground">Final AC→DC Conversion</p>
                    </div>
                  </div>

                  <p className="text-sm text-muted-foreground mb-4">
                    High-efficiency switch-mode power supplies convert 240V AC to 12V DC. The PSU is 
                    integral to the ASIC and accounts for 5-7% of total unit power loss.
                  </p>

                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="p-3 bg-card rounded-lg border border-border">
                      <div className="text-xs text-muted-foreground mb-1">Input</div>
                      <div className="text-lg font-bold text-foreground">240V AC</div>
                    </div>
                    <div className="p-3 bg-card rounded-lg border border-border">
                      <div className="text-xs text-muted-foreground mb-1">Output</div>
                      <div className="text-lg font-bold text-[hsl(var(--watt-bitcoin))]">12V DC</div>
                    </div>
                    <div className="p-3 bg-card rounded-lg border border-border">
                      <div className="text-xs text-muted-foreground mb-1">Power</div>
                      <div className="text-lg font-bold text-foreground">3-5.5 kW</div>
                    </div>
                    <div className="p-3 bg-card rounded-lg border border-border">
                      <div className="text-xs text-muted-foreground mb-1">PSU Efficiency</div>
                      <div className="text-lg font-bold text-emerald-600">93-95%</div>
                    </div>
                  </div>

                  <div className="p-4 bg-gradient-to-r from-[hsl(var(--watt-navy))] to-[hsl(var(--watt-navy)/0.9)] rounded-xl text-white">
                    <div className="text-xs text-white/70 mb-1">Total System Efficiency (Grid to Hash Board)</div>
                    <div className="text-2xl font-bold">
                      <AnimatedCounter end={93} suffix="%" /> to <AnimatedCounter end={96} suffix="%" />
                    </div>
                    <p className="text-xs text-white/70 mt-1">
                      4-7% total loss from utility meter to SHA-256 computation
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Arc Flash Safety Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="mb-10"
      >
        <button
          onClick={() => setShowArcFlashDetails(!showArcFlashDetails)}
          className="w-full flex items-center justify-between p-5 bg-red-500/10 border border-red-500/30 rounded-2xl hover:border-red-500/50 transition-all"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center">
              <Flame className="w-6 h-6 text-white" />
            </div>
            <div className="text-left">
              <h3 className="font-bold text-red-700">Critical Safety: Arc Flash Hazards</h3>
              <p className="text-sm text-red-600">Understanding the #1 electrical safety risk in high-power facilities</p>
            </div>
          </div>
          <ChevronDown className={`w-5 h-5 text-red-500 transition-transform ${showArcFlashDetails ? 'rotate-180' : ''}`} />
        </button>
        
        <AnimatePresence>
          {showArcFlashDetails && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="p-6 bg-red-500/5 border-x border-b border-red-500/30 rounded-b-2xl">
                <p className="text-muted-foreground mb-6">{arcFlashExplainer.description}</p>

                {/* Incident Energy Categories */}
                <h4 className="font-bold text-foreground mb-4">Arc Flash PPE Categories (per NFPA 70E)</h4>
                <div className="overflow-x-auto mb-6">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-2 px-3 font-medium text-foreground">Category</th>
                        <th className="text-left py-2 px-3 font-medium text-foreground">Incident Energy</th>
                        <th className="text-left py-2 px-3 font-medium text-foreground">PPE Required</th>
                        <th className="text-left py-2 px-3 font-medium text-foreground">Risk Level</th>
                      </tr>
                    </thead>
                    <tbody>
                      {arcFlashExplainer.incidentEnergyLevels.map((level) => (
                        <tr key={level.category} className="border-b border-border/50">
                          <td className="py-2 px-3 font-bold">{level.category}</td>
                          <td className="py-2 px-3 font-mono">{level.calPerCm2} cal/cm²</td>
                          <td className="py-2 px-3">{level.ppe}</td>
                          <td className={`py-2 px-3 ${
                            level.category >= 3 ? 'text-red-600 font-semibold' : 
                            level.category >= 2 ? 'text-amber-600' : 'text-muted-foreground'
                          }`}>{level.risk}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mitigation Strategies */}
                <h4 className="font-bold text-foreground mb-3">Mitigation Strategies</h4>
                <div className="grid md:grid-cols-2 gap-3 mb-4">
                  {arcFlashExplainer.mitigationStrategies.map((strategy, i) => (
                    <div key={i} className="flex items-start gap-2 p-3 bg-card rounded-lg">
                      <Shield className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-foreground">{strategy}</span>
                    </div>
                  ))}
                </div>

                <div className="p-3 bg-muted/50 rounded-lg text-xs text-muted-foreground">
                  <strong>Applicable Standards:</strong> {arcFlashExplainer.standards}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Key Insight */}
      <DCEKeyInsight variant="insight" className="mb-8">
        Total system efficiency from utility meter to ASIC hash boards is 93-96%, with 4-7% lost as heat 
        across transformation stages. The largest single loss is the ASIC PSU (5-7%), followed by 
        unit substations and PDU transformers (1.5-3% combined).
      </DCEKeyInsight>

      {/* System Efficiency Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="mb-8 p-6 bg-gradient-to-r from-[hsl(var(--watt-navy))] to-[hsl(var(--watt-navy)/0.9)] rounded-2xl text-white"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Cumulative Efficiency Summary</h3>
          <DataQualityBadge quality="estimate" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-white">99.5%</div>
            <div className="text-xs text-white/70">HV Transformer</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-white">99.9%</div>
            <div className="text-xs text-white/70">MV Switchgear</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-white">98-99%</div>
            <div className="text-xs text-white/70">Unit Sub + PDU</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-white">93-95%</div>
            <div className="text-xs text-white/70">ASIC PSU</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-[hsl(var(--watt-bitcoin))]">93-96%</div>
            <div className="text-xs text-white/70">Total System</div>
          </div>
        </div>
      </motion.div>

      {/* Power Quality Considerations */}
      <DCEDeepDive title="Power Quality Considerations" icon={Activity} className="mb-8">
        <p className="text-sm text-muted-foreground mb-6">
          Bitcoin mining facilities present unique power quality challenges due to the non-linear loads 
          of switch-mode power supplies. Understanding these issues is essential for reliable operation.
        </p>
        
        <div className="space-y-4">
          {powerQualityConsiderations.map((item, i) => (
            <div key={i} className="p-4 bg-muted/30 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-foreground">{item.issue}</h4>
                <span className="text-xs px-2 py-1 bg-amber-100 text-amber-700 rounded">{item.threshold}</span>
              </div>
              <p className="text-sm text-muted-foreground mb-2">
                <strong>Source:</strong> {item.source}
              </p>
              <p className="text-sm text-muted-foreground mb-2">
                <strong>Impact:</strong> {item.impact}
              </p>
              <p className="text-sm text-emerald-600">
                <strong>Mitigation:</strong> {item.mitigation}
              </p>
            </div>
          ))}
        </div>
      </DCEDeepDive>

      {/* Transformer Sizing Guide */}
      <DCEDeepDive title="Dry-Type Transformer Sizing Guide" icon={Zap} className="mb-8">
        <p className="text-sm text-muted-foreground mb-4">
          Unit substation sizing for mining facilities (25kV → 600V, dry-type, indoor installation)
        </p>
        
        <div className="relative">
          <div className="overflow-x-auto pb-2 scrollbar-hide">
            <table className="w-full text-sm min-w-[650px]">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-3 font-medium text-foreground">kVA</th>
                <th className="text-left py-3 px-3 font-medium text-foreground">MW Cap*</th>
                <th className="text-left py-3 px-3 font-medium text-foreground">~Miners</th>
                <th className="text-left py-3 px-3 font-medium text-foreground">Efficiency</th>
                <th className="text-left py-3 px-3 font-medium text-foreground">No-Load Loss</th>
                <th className="text-left py-3 px-3 font-medium text-foreground">Full-Load Loss</th>
                <th className="text-left py-3 px-3 font-medium text-foreground">Est. Cost</th>
              </tr>
            </thead>
            <tbody>
              {transformerSizing.map((row) => (
                <tr key={row.kva} className="border-b border-border/50 hover:bg-muted/30">
                  <td className="py-3 px-3 font-medium text-foreground">{row.kva.toLocaleString()} kVA</td>
                  <td className="py-3 px-3 text-[hsl(var(--watt-bitcoin))] font-mono">{row.mw} MW</td>
                  <td className="py-3 px-3 text-muted-foreground">~{row.miners}</td>
                  <td className="py-3 px-3 text-emerald-600">{row.efficiency}</td>
                  <td className="py-3 px-3 text-muted-foreground">{row.noLoadLoss}</td>
                  <td className="py-3 px-3 text-muted-foreground">{row.fullLoadLoss}</td>
                  <td className="py-3 px-3 text-muted-foreground">{row.cost}</td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
          <div className="absolute right-0 top-0 bottom-2 w-8 bg-gradient-to-l from-card to-transparent pointer-events-none md:hidden" />
        </div>
        <p className="text-xs text-muted-foreground mt-3">
          *At 80% loading factor (continuous duty derating per NEC/CSA). Miners estimated at 3.5 kW each.
        </p>
      </DCEDeepDive>

      {/* Safety Equipment Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
      >
        <h3 className="text-xl font-bold text-foreground mb-6">Electrical Safety & Protection Systems</h3>
        <div className="grid md:grid-cols-2 gap-4">
          {safetyEquipment.map((item, index) => (
            <motion.div
              key={item.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="bg-card rounded-xl border border-border p-5 hover:border-[hsl(var(--watt-bitcoin)/0.5)] hover:shadow-lg transition-all duration-300"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-[hsl(var(--watt-bitcoin)/0.1)] flex items-center justify-center flex-shrink-0">
                  <item.icon className="w-6 h-6 text-[hsl(var(--watt-bitcoin))]" />
                </div>
                <div>
                  <h4 className="font-semibold text-foreground mb-1">{item.name}</h4>
                  <p className="text-sm text-muted-foreground mb-3">{item.description}</p>
                  
                  <div className="flex flex-wrap gap-1 mb-2">
                    {item.details.map((detail, i) => (
                      <span key={i} className="px-2 py-0.5 bg-muted rounded text-xs text-foreground">
                        {detail}
                      </span>
                    ))}
                  </div>
                  
                  <span className="text-xs px-2 py-1 bg-muted rounded text-muted-foreground">
                    {item.standards}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      <SectionSummary
        takeaways={[
          "Power transforms through 4-5 stages from 138kV to 12V DC, with ~4-7% total system loss",
          "Transformer efficiency follows P = I²R — larger transformers have lower losses per kW",
          "Arc flash is the #1 electrical safety hazard; modern mitigation can reduce incident energy 90%+",
          "Power quality (harmonics, power factor) is critical — ASIC switching PSUs create non-linear loads",
          "The ASIC PSU (93-95% efficient) is the largest single source of loss in the power chain"
        ]}
        nextSteps={[
          { title: "Facility Design", href: "#facility-design", description: "Explore warehouse, container, and modular building architectures" }
        ]}
        proTip="K-rated transformers (K-13 or K-20) are designed for harmonic-rich loads and run cooler than standard transformers in mining applications, potentially extending service life by 5-10 years."
      />
    </DCESectionWrapper>
  );
};

export default ElectricalInfrastructureSection;
