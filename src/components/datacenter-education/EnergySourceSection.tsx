import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, Zap, MapPin, FileText, ArrowRight, CheckCircle, Building2, DollarSign, Clock, TrendingUp, ArrowDown, Sparkles, Shield, AlertTriangle } from 'lucide-react';
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
import gridTransmissionSubstation from '@/assets/grid-transmission-substation.jpg';
import electricalMvSwitchgear from '@/assets/electrical-mv-switchgear.jpg';
import gridServiceEntrance from '@/assets/grid-service-entrance.jpg';

const EnergySourceSection = () => {
  const [activeTab, setActiveTab] = useState<'grid' | 'ppa' | 'site'>('grid');
  const [activeGridStep, setActiveGridStep] = useState<number | null>(null);
  const [hoveredStep, setHoveredStep] = useState<number | null>(null);

  const gridConnectionSteps = [
    {
      step: 1,
      title: 'Transmission Network',
      voltage: '138kV - 500kV',
      distance: '10-100+ km',
      image: electricalUtilityFeed,
      description: 'High-voltage bulk power transmission from generation sources across vast distances. Mining facilities tap into this network at strategic interconnection points.',
      icon: Zap,
      color: 'from-red-500 to-orange-500',
      details: [
        'Aluminum conductor steel reinforced (ACSR) cables',
        'Lattice steel or monopole tower structures',
        'Corona rings and vibration dampers',
        'SCADA monitoring and protection',
      ],
      cost: '$1-3M per km for new lines',
      timeline: '2-5 years for new construction',
    },
    {
      step: 2,
      title: 'Transmission Substation',
      voltage: '138kV → 69kV/25kV',
      distance: '1-10 km to facility',
      image: gridTransmissionSubstation,
      description: 'Large outdoor substations with power transformers, circuit breakers, and protective relaying. Mining facilities may connect directly at this level.',
      icon: Building2,
      color: 'from-orange-500 to-yellow-500',
      details: [
        'SF6 or vacuum circuit breakers',
        'Oil-filled power transformers',
        'Capacitor banks for power factor',
        'Revenue metering equipment',
      ],
      cost: '$5-20M for new substation',
      timeline: '18-36 months construction',
    },
    {
      step: 3,
      title: 'Distribution System',
      voltage: '25kV - 15kV',
      distance: '0.5-5 km',
      image: electricalMvSwitchgear,
      description: 'Medium voltage feeders deliver power to commercial and industrial customers. Smaller mining operations may connect at distribution level.',
      icon: MapPin,
      color: 'from-yellow-500 to-green-500',
      details: [
        'Underground or overhead feeders',
        'Sectionalizing switches',
        'Voltage regulators',
        'Reclosers and fuses',
      ],
      cost: '$100-500K per km',
      timeline: '6-18 months',
    },
    {
      step: 4,
      title: 'Customer Service Entrance',
      voltage: '600V (CAN) / 480V (US)',
      distance: 'On-site',
      image: gridServiceEntrance,
      description: 'Customer-owned pad-mounted transformer, main disconnect, and revenue metering. This is where facility ownership begins.',
      icon: Globe,
      color: 'from-green-500 to-cyan-500',
      details: [
        'Pad-mounted transformer',
        'Main service disconnect',
        'CT/PT metering cabinet',
        'Surge protection devices',
      ],
      cost: '$200-800K for 10MW service',
      timeline: '3-6 months installation',
    },
  ];

  const powerPurchaseTypes = [
    {
      type: 'Self-Retailer (Wholesale)',
      description: 'Direct pool access with no retailer markup. Purchase power at real-time market prices. Best for large loads with risk tolerance.',
      pros: ['Lowest average cost', 'Access to negative prices', 'Full market exposure'],
      cons: ['Price volatility risk', 'Requires 24/7 monitoring', 'Minimum load requirements'],
      typicalRate: '$40-80/MWh average',
      minLoad: '5+ MW typically',
      savings: '15-30% vs retail',
    },
    {
      type: 'Fixed PPA (Power Purchase Agreement)',
      description: 'Long-term contract with fixed or indexed pricing. Price certainty for project financing. Common for new builds.',
      pros: ['Price certainty', 'Bankable for financing', 'Hedge against volatility'],
      cons: ['May miss low prices', 'Contract obligations', 'Termination penalties'],
      typicalRate: '$50-70/MWh fixed',
      minLoad: '10+ MW typical',
      savings: '5-15% vs retail',
    },
    {
      type: 'Behind-the-Meter (BTM)',
      description: 'Co-located with generation source. No transmission/distribution charges. Stranded gas, hydro, solar, or curtailed wind.',
      pros: ['Lowest possible cost', 'No grid fees', 'Excess energy monetized'],
      cons: ['Site-specific', 'Generation variability', 'Remote locations often'],
      typicalRate: '$20-50/MWh',
      minLoad: 'Varies by source',
      savings: '40-60% vs retail',
    },
    {
      type: 'Regulated Retail',
      description: 'Standard utility rate. Simplest to implement. Higher cost but predictable. Suitable for smaller operations.',
      pros: ['Simple billing', 'Predictable', 'No minimum load'],
      cons: ['Highest cost', 'No optimization', 'Rate increases'],
      typicalRate: '$80-120/MWh',
      minLoad: 'Any size',
      savings: 'Baseline',
    },
  ];

  const siteSelectionCriteria = [
    {
      category: 'Power Infrastructure',
      weight: 35,
      factors: [
        { name: 'Substation proximity', detail: '<5 km to HV substation ideal' },
        { name: 'Available capacity', detail: 'MW headroom on existing circuits' },
        { name: 'Interconnection cost', detail: '$200-500/kW typical' },
        { name: 'Grid stability', detail: 'Frequency deviation history' },
      ],
    },
    {
      category: 'Energy Cost',
      weight: 30,
      factors: [
        { name: 'Wholesale market access', detail: 'Self-retailer eligibility' },
        { name: 'Average pool price', detail: 'Historical price analysis' },
        { name: 'Transmission charges', detail: '$10-15/MWh in AESO' },
        { name: 'Peak demand charges', detail: 'Can add $5-20/MWh' },
      ],
    },
    {
      category: 'Climate & Cooling',
      weight: 20,
      factors: [
        { name: 'Average temperature', detail: '<15°C avg = free cooling' },
        { name: 'Humidity levels', detail: '<60% RH optimal for evap' },
        { name: 'Heating degree days', detail: 'Cold climate advantage' },
        { name: 'Extreme weather risk', detail: 'Storms, floods, etc.' },
      ],
    },
    {
      category: 'Land & Logistics',
      weight: 15,
      factors: [
        { name: 'Land cost', detail: '$5-50K/acre varies widely' },
        { name: 'Zoning/permits', detail: 'Industrial or agricultural' },
        { name: 'Road access', detail: 'Heavy equipment delivery' },
        { name: 'Internet connectivity', detail: 'Fiber or fixed wireless' },
      ],
    },
  ];

  const interconnectionTimeline = [
    { phase: 'Application', duration: '1-2 months', description: 'Submit interconnection request, initial studies' },
    { phase: 'System Impact Study', duration: '2-4 months', description: 'Grid operator analyzes network effects' },
    { phase: 'Facilities Study', duration: '2-3 months', description: 'Detailed engineering and cost estimate' },
    { phase: 'Agreement & Permits', duration: '1-2 months', description: 'Sign agreements, obtain permits' },
    { phase: 'Construction', duration: '6-18 months', description: 'Build substation, run feeders' },
    { phase: 'Testing & Commissioning', duration: '1-2 months', description: 'Protection testing, energization' },
  ];

  const tabs = [
    { id: 'grid', label: 'Grid Connection', icon: Zap },
    { id: 'ppa', label: 'Power Purchasing', icon: DollarSign },
    { id: 'site', label: 'Site Selection', icon: MapPin },
  ];

  return (
    <DCESectionWrapper theme="accent" id="energy-source">
      <LearningObjectives
        objectives={[
          "Understand the power journey from transmission lines to your facility",
          "Compare power purchasing methods: wholesale, PPA, BTM, and retail",
          "Evaluate site selection criteria for optimal mining operations",
          "Navigate the utility interconnection process and timeline"
        ]}
        estimatedTime="8 min"
      />
      
      <DCESectionHeader
        badge="Section 1 • Grid Connection"
        badgeIcon={Zap}
        title="Energy Source to Facility"
        description="How Bitcoin mining facilities connect to the electrical grid and purchase power at wholesale rates"
      />

      {/* Tab Navigation */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="flex flex-wrap justify-center gap-2 mb-10"
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl font-medium transition-all ${
              activeTab === tab.id
                ? 'bg-[hsl(var(--watt-bitcoin))] text-white shadow-lg shadow-[hsl(var(--watt-bitcoin)/0.3)]'
                : 'bg-card border border-border text-muted-foreground hover:border-[hsl(var(--watt-bitcoin)/0.5)]'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </motion.div>

      {/* Grid Connection Tab */}
      <AnimatePresence mode="wait">
        {activeTab === 'grid' && (
          <motion.div
            key="grid"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {/* Immersive Hero Cards */}
            <div className="mb-12 space-y-6">
              {gridConnectionSteps.map((step, index) => (
                <motion.div
                  key={step.step}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <div
                    className={`relative overflow-hidden rounded-2xl cursor-pointer transition-all duration-500 group ${
                      activeGridStep === index 
                        ? 'ring-2 ring-[hsl(var(--watt-bitcoin))] shadow-2xl shadow-[hsl(var(--watt-bitcoin)/0.2)]' 
                        : 'hover:shadow-xl'
                    }`}
                    onClick={() => setActiveGridStep(activeGridStep === index ? null : index)}
                    onMouseEnter={() => setHoveredStep(index)}
                    onMouseLeave={() => setHoveredStep(null)}
                  >
                    {/* Full-width Background Image */}
                    <div className="relative h-64 md:h-80">
                      <img 
                        src={step.image} 
                        alt={step.title}
                        className={`w-full h-full object-cover transition-transform duration-700 ${
                          hoveredStep === index ? 'scale-110' : 'scale-100'
                        }`}
                      />
                      
                      {/* Gradient Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/60 to-transparent" />
                      
                      {/* Animated Power Flow Particles */}
                      <div className="absolute inset-0 overflow-hidden pointer-events-none">
                        <motion.div 
                          className="absolute w-2 h-2 rounded-full bg-[hsl(var(--watt-bitcoin))]"
                          style={{ top: '30%' }}
                          animate={{ left: ['0%', '100%'], opacity: [0, 1, 1, 0] }}
                          transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
                        />
                        <motion.div 
                          className="absolute w-2 h-2 rounded-full bg-[hsl(var(--watt-bitcoin))]"
                          style={{ top: '50%' }}
                          animate={{ left: ['0%', '100%'], opacity: [0, 1, 1, 0] }}
                          transition={{ duration: 4, repeat: Infinity, ease: 'linear', delay: 1 }}
                        />
                        <motion.div 
                          className="absolute w-2 h-2 rounded-full bg-[hsl(var(--watt-bitcoin))]"
                          style={{ top: '70%' }}
                          animate={{ left: ['0%', '100%'], opacity: [0, 1, 1, 0] }}
                          transition={{ duration: 4, repeat: Infinity, ease: 'linear', delay: 2 }}
                        />
                      </div>

                      {/* Content Overlay */}
                      <div className="absolute inset-0 flex items-center">
                        <div className="p-6 md:p-10 max-w-2xl">
                          {/* Step Badge */}
                          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-sm rounded-full text-xs font-medium text-white/80 mb-3">
                            <Sparkles className="w-3 h-3" />
                            Step {step.step} of 4
                          </div>
                          
                          {/* Title and Voltage */}
                          <h3 className="text-2xl md:text-3xl font-bold text-white mb-2">{step.title}</h3>
                          <div className="flex flex-wrap items-center gap-3 mb-3">
                            <span className={`px-3 py-1 rounded-lg bg-gradient-to-r ${step.color} text-white text-sm font-bold`}>
                              {step.voltage}
                            </span>
                            <span className="text-white/60 text-sm font-mono">
                              📍 {step.distance}
                            </span>
                          </div>
                          
                          {/* Description */}
                          <p className="text-white/80 text-sm md:text-base mb-4 max-w-lg">
                            {step.description}
                          </p>

                          {/* Quick Stats */}
                          <div className="flex flex-wrap gap-4">
                            <div className="px-3 py-2 bg-white/10 backdrop-blur-sm rounded-lg relative">
                              <span className="absolute -top-1 -right-1 px-1 py-0.5 bg-amber-500 text-white text-[8px] font-bold rounded">Est.</span>
                              <div className="text-xs text-white/60">Cost</div>
                              <div className="text-sm font-semibold text-white">{step.cost}</div>
                            </div>
                            <div className="px-3 py-2 bg-white/10 backdrop-blur-sm rounded-lg relative">
                              <span className="absolute -top-1 -right-1 px-1 py-0.5 bg-amber-500 text-white text-[8px] font-bold rounded">Est.</span>
                              <div className="text-xs text-white/60">Timeline</div>
                              <div className="text-sm font-semibold text-white">{step.timeline}</div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Step Number Badge */}
                      <div className="absolute top-6 right-6">
                        <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center shadow-xl`}>
                          <step.icon className="w-7 h-7 text-white" />
                        </div>
                      </div>

                      {/* Expand Indicator */}
                      <div className="absolute bottom-6 right-6">
                        <div className={`px-3 py-1 bg-white/10 backdrop-blur-sm rounded-full text-xs text-white/80 transition-all ${
                          hoveredStep === index ? 'opacity-100' : 'opacity-0'
                        }`}>
                          Click for details
                        </div>
                      </div>
                    </div>

                    {/* Expanded Details Panel */}
                    <AnimatePresence>
                      {activeGridStep === index && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          className="p-6 bg-card border-t border-border"
                        >
                          <h4 className="font-bold text-foreground mb-4 flex items-center gap-2">
                            <Shield className="w-4 h-4 text-[hsl(var(--watt-bitcoin))]" />
                            Key Equipment & Infrastructure
                          </h4>
                          <div className="grid md:grid-cols-2 gap-4">
                            {step.details.map((detail, i) => (
                              <div key={i} className="flex items-center gap-2 text-sm">
                                <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                                <span className="text-muted-foreground">{detail}</span>
                              </div>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Connection Arrow Between Steps */}
                  {index < gridConnectionSteps.length - 1 && (
                    <div className="flex justify-center py-2">
                      <motion.div 
                        className="w-10 h-10 rounded-full bg-[hsl(var(--watt-bitcoin)/0.2)] flex items-center justify-center"
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        <ArrowDown className="w-5 h-5 text-[hsl(var(--watt-bitcoin))]" />
                      </motion.div>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>

            {/* Key Insight */}
            <DCEKeyInsight variant="insight" className="mb-8">
              Large mining operations (10+ MW) typically connect at transmission or sub-transmission voltage levels 
              (25kV-138kV) to access wholesale power rates and avoid distribution charges that can add $15-25/MWh to costs.
            </DCEKeyInsight>

            {/* Total Journey Summary */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="p-6 bg-gradient-to-r from-[hsl(var(--watt-navy))] to-[hsl(var(--watt-navy)/0.9)] rounded-2xl text-white mb-8"
            >
              <h3 className="text-lg font-semibold mb-4 text-center">Complete Grid Journey</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
                <div>
                  <div className="text-2xl font-bold text-[hsl(var(--watt-bitcoin))]">
                    <AnimatedCounter end={500} suffix=" km+" />
                  </div>
                  <div className="text-xs text-white/70">Max Transmission Distance</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">138kV → 600V</div>
                  <div className="text-xs text-white/70">Voltage Step-Down</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">
                    <AnimatedCounter end={12} suffix="-30 mo" />
                  </div>
                  <div className="text-xs text-white/70">Interconnection Timeline</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">
                    $<AnimatedCounter end={10} suffix="-30M" />
                  </div>
                  <div className="text-xs text-white/70">Typical Project Cost</div>
                </div>
              </div>
            </motion.div>

            {/* Interconnection Timeline Deep Dive */}
            <DCEDeepDive title="Interconnection Timeline Details" icon={Clock}>
              <p className="text-sm text-muted-foreground mb-6">
                Typical timeline from application to energization: 12-30 months for large facilities
              </p>
              
              <div className="relative">
                {/* Timeline bar */}
                <div className="hidden md:block absolute top-6 left-0 right-0 h-1 bg-muted rounded-full" />
                
                <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                  {interconnectionTimeline.map((phase, i) => (
                    <div key={phase.phase} className="relative text-center">
                      <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-[hsl(var(--watt-bitcoin)/0.1)] border-2 border-[hsl(var(--watt-bitcoin))] flex items-center justify-center font-bold text-[hsl(var(--watt-bitcoin))]">
                        {i + 1}
                      </div>
                      <div className="font-semibold text-foreground text-xs mb-1">{phase.phase}</div>
                      <div className="text-xs text-[hsl(var(--watt-bitcoin))] font-medium mb-1">{phase.duration}</div>
                      <p className="text-[10px] text-muted-foreground">{phase.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </DCEDeepDive>
          </motion.div>
        )}

        {/* Power Purchasing Tab */}
        {activeTab === 'ppa' && (
          <motion.div
            key="ppa"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <DCEKeyInsight variant="info" className="mb-8">
              Power costs represent 70-80% of Bitcoin mining operational expenses. Choosing the right purchasing 
              strategy can mean the difference between profitability and losses during bear markets.
            </DCEKeyInsight>

            <div className="grid md:grid-cols-2 gap-4">
              {powerPurchaseTypes.map((ppa, index) => (
                <motion.div
                  key={ppa.type}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className="bg-card rounded-2xl border border-border p-5 hover:border-[hsl(var(--watt-bitcoin)/0.5)] hover:shadow-lg hover:shadow-[hsl(var(--watt-bitcoin)/0.1)] transition-all duration-300"
                >
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-bold text-foreground">{ppa.type}</h3>
                    <span className="px-2 py-1 bg-[hsl(var(--watt-bitcoin)/0.1)] text-[hsl(var(--watt-bitcoin))] rounded text-xs font-medium">
                      {ppa.typicalRate}
                    </span>
                  </div>
                  
                  <p className="text-sm text-muted-foreground mb-4">{ppa.description}</p>
                  
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <h4 className="text-xs font-medium text-emerald-600 mb-2 flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" /> Advantages
                      </h4>
                      <ul className="space-y-1">
                        {ppa.pros.map((pro, i) => (
                          <li key={i} className="text-xs text-muted-foreground">• {pro}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="text-xs font-medium text-amber-600 mb-2 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" /> Considerations
                      </h4>
                      <ul className="space-y-1">
                        {ppa.cons.map((con, i) => (
                          <li key={i} className="text-xs text-muted-foreground">• {con}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between pt-3 border-t border-border text-xs">
                    <span className="text-muted-foreground">Min Load: <span className="text-foreground font-medium">{ppa.minLoad}</span></span>
                    <span className={`font-medium ${ppa.savings === 'Baseline' ? 'text-muted-foreground' : 'text-emerald-600'}`}>
                      {ppa.savings !== 'Baseline' && <TrendingUp className="w-3 h-3 inline mr-1" />}
                      {ppa.savings}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>

            <DCEKeyInsight variant="pro-tip" className="mt-8">
              Behind-the-meter (BTM) arrangements with stranded gas or curtailed renewables offer the lowest 
              power costs ($20-50/MWh) but require co-location with the generation source, often in remote areas.
            </DCEKeyInsight>
          </motion.div>
        )}

        {/* Site Selection Tab */}
        {activeTab === 'site' && (
          <motion.div
            key="site"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {siteSelectionCriteria.map((category, index) => (
                <motion.div
                  key={category.category}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className="bg-card rounded-2xl border border-border p-5 hover:border-[hsl(var(--watt-bitcoin)/0.3)] transition-colors"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-foreground text-sm">{category.category}</h3>
                    <span className="px-2 py-1 bg-[hsl(var(--watt-bitcoin))] text-white rounded-full text-xs font-bold">
                      {category.weight}%
                    </span>
                  </div>
                  
                  {/* Weight bar */}
                  <div className="h-2 bg-muted rounded-full mb-4 overflow-hidden">
                    <motion.div 
                      className="h-full bg-[hsl(var(--watt-bitcoin))] rounded-full"
                      initial={{ width: 0 }}
                      whileInView={{ width: `${category.weight}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.8, delay: index * 0.1 }}
                    />
                  </div>
                  
                  <ul className="space-y-3">
                    {category.factors.map((factor, i) => (
                      <li key={i} className="text-sm">
                        <div className="font-medium text-foreground">{factor.name}</div>
                        <div className="text-xs text-muted-foreground">{factor.detail}</div>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              ))}
            </div>

            <DCEKeyInsight variant="success" className="mb-8">
              The ideal site combines low energy costs (under $40/MWh), cold climate for free cooling (8,000+ hours/year), 
              and proximity to existing grid infrastructure (under 5km to substation) to minimize interconnection costs.
            </DCEKeyInsight>
            
            {/* Key Metrics Banner */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="p-5 bg-gradient-to-r from-[hsl(var(--watt-navy))] to-[hsl(var(--watt-navy)/0.9)] rounded-2xl text-white"
            >
              <h3 className="text-lg font-semibold mb-4">WattByte Site Selection Metrics</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-[hsl(var(--watt-bitcoin))]">
                    <AnimatedCounter end={50} suffix="+" />
                  </div>
                  <div className="text-xs text-white/70">Sites Evaluated</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">
                    $<AnimatedCounter end={40} suffix="/MWh" />
                  </div>
                  <div className="text-xs text-white/70">Target All-In Cost</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">
                    <AnimatedCounter end={5} suffix=" km" />
                  </div>
                  <div className="text-xs text-white/70">Max Substation Distance</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">
                    <AnimatedCounter end={99.5} decimals={1} suffix="%" />
                  </div>
                  <div className="text-xs text-white/70">Target Uptime</div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <SectionSummary
        takeaways={[
          "Large mining ops connect at transmission/distribution level (25-138kV) for lowest rates",
          "Behind-the-meter (BTM) offers 40-60% savings but requires co-location with generation",
          "Interconnection takes 12-30 months — start the process early",
          "Site selection weighs power infrastructure (35%), energy cost (30%), climate (20%), and logistics (15%)"
        ]}
        nextSteps={[
          { title: "Electrical Infrastructure", href: "#electrical", description: "Learn about transformers, switchgear, and PDUs" }
        ]}
        proTip="Self-retailer status in AESO can save 15-30% vs regulated retail rates, but requires 24/7 market monitoring."
      />
    </DCESectionWrapper>
  );
};

export default EnergySourceSection;
