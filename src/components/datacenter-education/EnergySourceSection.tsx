import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Globe, Zap, MapPin, FileText, ArrowRight, CheckCircle, Building2, 
  DollarSign, Clock, TrendingUp, ArrowDown, Sparkles, Shield, 
  AlertTriangle, BookOpen, Calculator, Info, ChevronDown
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
import { ElectricalPrimer } from './primers';

// Import AI-generated 3D images
import electricalUtilityFeed from '@/assets/electrical-utility-feed.jpg';
import gridTransmissionSubstation from '@/assets/grid-transmission-substation.jpg';
import electricalMvSwitchgear from '@/assets/electrical-mv-switchgear.jpg';
import gridServiceEntrance from '@/assets/grid-service-entrance.jpg';

const EnergySourceSection = () => {
  const [activeTab, setActiveTab] = useState<'grid' | 'ppa' | 'site'>('grid');
  const [activeGridStep, setActiveGridStep] = useState<number | null>(null);
  const [hoveredStep, setHoveredStep] = useState<number | null>(null);
  const [showTransmissionPhysics, setShowTransmissionPhysics] = useState(false);

  // Educational content for transmission physics
  const transmissionPhysicsExplainer = {
    title: "Why High Voltage? The Physics of Power Transmission",
    content: `When electricity flows through a conductor, some energy is inevitably lost as heat. This loss 
    follows a fundamental law of physics: P = I²R, where power loss equals current squared times resistance.
    
    The key insight is that losses scale with the SQUARE of current. Double the current, quadruple the losses.
    
    Since Power = Voltage × Current (P = V × I), we can transmit the same power using either:
    • High voltage / Low current (efficient)
    • Low voltage / High current (inefficient)
    
    This is why transmission lines operate at 138kV-500kV: by increasing voltage 100×, we reduce current 
    100× and losses by 10,000×.`,
    example: {
      scenario: "Transmitting 100 MW over 100 km",
      highVoltage: {
        voltage: "345 kV",
        current: "167 A",
        resistance: "5 Ω (typical for 100km)",
        loss: "139 kW (0.14%)"
      },
      lowVoltage: {
        voltage: "12.47 kV (distribution)",
        current: "4,620 A",
        resistance: "5 Ω",
        loss: "107 MW (107%!) — impossible"
      }
    }
  };

  const gridConnectionSteps = [
    {
      step: 1,
      title: 'High-Voltage Transmission Network',
      voltage: '138kV - 500kV',
      voltageExplanation: 'Extra-high voltage (EHV) for bulk power transfer. 500kV is the highest common voltage in North America.',
      distance: '50-500+ km from generation',
      image: electricalUtilityFeed,
      description: 'Bulk power transmission from generating stations to load centers. These tower lines form the backbone of the electrical grid, carrying power from remote hydro dams, coal plants, and wind farms to population centers.',
      icon: Zap,
      color: 'from-red-500 to-orange-500',
      physicsNote: 'At 345kV, current is reduced 29× compared to 12kV distribution, reducing I²R losses by 841×',
      details: [
        { item: 'Conductor: ACSR (Aluminum Conductor Steel Reinforced)', explanation: 'Aluminum for conductivity, steel core for tensile strength' },
        { item: 'Tower structures: Lattice steel (100-200 ft tall)', explanation: 'Height provides safety clearance and reduces right-of-way width' },
        { item: 'Corona rings & grading rings', explanation: 'Prevents corona discharge at high voltage stress points' },
        { item: 'SCADA monitoring & protection', explanation: 'Real-time monitoring, automatic fault isolation' },
      ],
      costRange: {
        low: '$1M/km',
        high: '$5M/km',
        factors: ['Terrain (mountain vs. flat)', 'Urban vs. rural right-of-way', 'Environmental permitting', 'Conductor size (ampacity)']
      },
      timeline: {
        typical: '3-7 years',
        explanation: 'Environmental assessment, land acquisition, and regulatory approval dominate timeline'
      },
      standards: ['IEEE C2 (NESC)', 'NERC Reliability Standards', 'CEC/NEC'],
    },
    {
      step: 2,
      title: 'Transmission Substation',
      voltage: '138kV → 69kV or 25kV',
      voltageExplanation: 'Step-down to sub-transmission or primary distribution voltage. Large mining facilities may connect directly at this level.',
      distance: '5-50 km to major loads',
      image: gridTransmissionSubstation,
      description: 'Power transformers convert high transmission voltage to distribution voltage. These outdoor yards contain circuit breakers, disconnect switches, instrument transformers, and protective relaying to monitor and control power flow.',
      icon: Building2,
      color: 'from-orange-500 to-yellow-500',
      physicsNote: 'Transformer efficiency typically 99.5%+ — losses are primarily iron core (magnetization) and copper winding (I²R)',
      details: [
        { item: 'Power transformers (50-200 MVA)', explanation: 'Oil-immersed for cooling; tap changers adjust voltage ±10%' },
        { item: 'SF6 or oil circuit breakers', explanation: 'Interrupt fault currents up to 63kA in milliseconds' },
        { item: 'Capacitor banks', explanation: 'Correct power factor, reduce reactive power charges' },
        { item: 'Revenue metering (CT/PT)', explanation: 'Accuracy class 0.2 for billing-grade measurement' },
      ],
      costRange: {
        low: '$8M',
        high: '$50M+',
        factors: ['Voltage class', 'Number of feeders', 'Redundancy (N+1 vs N)', 'Land cost in urban areas']
      },
      timeline: {
        typical: '24-48 months',
        explanation: 'Engineering, procurement, construction, and commissioning phases'
      },
      standards: ['IEEE C57 (Transformers)', 'IEEE C37 (Switchgear)', 'ANSI/NETA'],
    },
    {
      step: 3,
      title: 'Distribution System',
      voltage: '25kV - 12.47kV',
      voltageExplanation: 'Primary distribution voltage. 25kV common in Canada, 12.47kV common in US.',
      distance: '1-10 km to end customers',
      image: electricalMvSwitchgear,
      description: 'Medium-voltage feeders deliver power to commercial and industrial customers. Smaller mining operations (under 10 MW) may connect at this distribution level, though costs per kW are typically higher than transmission-level connection.',
      icon: MapPin,
      color: 'from-yellow-500 to-green-500',
      physicsNote: 'Distribution losses average 2-6% due to longer distances at lower voltage and many transformation points',
      details: [
        { item: 'Underground or overhead feeders', explanation: 'Underground costs 5-10× more but has fewer outages' },
        { item: 'Sectionalizing switches', explanation: 'Isolate faulted sections, restore service to healthy segments' },
        { item: 'Voltage regulators', explanation: 'Maintain voltage within ±5% of nominal (ANSI C84.1)' },
        { item: 'Reclosers and fuses', explanation: 'Automatic fault clearing; 80% of faults are temporary' },
      ],
      costRange: {
        low: '$100K/km',
        high: '$800K/km',
        factors: ['Overhead vs. underground', 'Conductor sizing', 'Urban vs. rural', 'Trenching conditions']
      },
      timeline: {
        typical: '6-18 months',
        explanation: 'Shorter engineering cycle, fewer permits than transmission'
      },
      standards: ['IEEE 1547 (Interconnection)', 'NEC Article 230', 'Local utility standards'],
    },
    {
      step: 4,
      title: 'Customer Service Entrance',
      voltage: '600V (Canada) / 480V (US)',
      voltageExplanation: 'Secondary voltage for facility distribution. Canada uses 600V for industrial; US uses 480V (NEMA standards).',
      distance: 'On customer premises',
      image: gridServiceEntrance,
      description: 'The point of demarcation between utility and customer ownership. Includes pad-mounted transformer, main disconnect switch, and revenue-grade metering. For mining facilities, this typically ranges from 5-25 MW per service entrance.',
      icon: Globe,
      color: 'from-green-500 to-cyan-500',
      physicsNote: 'Final transformation from MV to LV. Pad-mount transformers are typically 500-2500 kVA.',
      details: [
        { item: 'Pad-mounted transformer', explanation: 'Oil-filled or dry-type; sized for 80% continuous loading' },
        { item: 'Main service disconnect', explanation: 'Utility-accessible, lockable in OFF position per code' },
        { item: 'CT/PT metering cabinet', explanation: 'Revenue-grade accuracy for billing; demand metering for industrial' },
        { item: 'Surge protection devices (SPD)', explanation: 'Type 1 at service entrance per NEC 242' },
      ],
      costRange: {
        low: '$150K',
        high: '$1M+',
        factors: ['Service size (kW)', 'Distance from distribution line', 'Transformer type', 'Metering requirements']
      },
      timeline: {
        typical: '3-6 months',
        explanation: 'Standard utility process for commercial/industrial customers'
      },
      standards: ['NEC 230', 'CSA C22.1 Section 6', 'Utility interconnection tariff'],
    },
  ];

  const powerPurchaseTypes = [
    {
      type: 'Self-Retailer (Wholesale Market)',
      marketExample: 'AESO (Alberta), ERCOT (Texas), PJM (Eastern US)',
      description: 'Direct participation in the wholesale electricity market. Purchase power at real-time or day-ahead market prices without a retail intermediary. Available only in deregulated markets.',
      howItWorks: [
        'Register as a self-retailer with the system operator (e.g., AESO, ERCOT)',
        'Submit load forecasts and receive hourly/sub-hourly settlement',
        'Pay pool price + transmission + ancillary charges',
        'Manage price risk through financial hedges or physical PPAs'
      ],
      pros: ['Lowest average cost in stable markets', 'Access to negative price periods (pay to consume!)', 'No retail margin (5-15% savings)', 'Full transparency into pricing'],
      cons: ['Extreme price volatility (AESO reached $999/MWh in 2022)', 'Requires 24/7 operations monitoring', 'Minimum load requirements (typically 5+ MW)', 'Financial hedging expertise needed'],
      priceRange: {
        low: '$25/MWh',
        high: '$150/MWh',
        typical: '$40-70/MWh average (varies by market and year)',
        note: 'Pool prices can spike to $1,000+/MWh during shortages or drop below $0 during oversupply'
      },
      minLoad: '5+ MW (varies by market)',
      suitableFor: 'Large operators with risk management capability and 24/7 operations teams',
    },
    {
      type: 'Fixed Power Purchase Agreement (PPA)',
      marketExample: 'Available in all markets',
      description: 'Long-term bilateral contract with a power generator or retailer for fixed or indexed pricing. Provides price certainty for project financing and shields from market volatility.',
      howItWorks: [
        'Negotiate term (5-20 years), volume, and price structure',
        'Physical PPA: actual electrons delivered to your meter',
        'Virtual PPA: financial contract for difference, often with renewables',
        'Sleeved PPA: third party handles scheduling and imbalance'
      ],
      pros: ['Price certainty for financial modeling', 'Bankable for project/debt financing', 'Hedge against price spikes', 'Potential green energy claims (with renewables)'],
      cons: ['May miss low market price periods', 'Long-term contractual obligations', 'Termination penalties can be substantial', 'Creditworthiness requirements'],
      priceRange: {
        low: '$45/MWh',
        high: '$85/MWh',
        typical: '$55-70/MWh (2024 market)',
        note: 'Indexed PPAs may track natural gas prices + fixed adder'
      },
      minLoad: '10+ MW typical (smaller available at premium)',
      suitableFor: 'Operators seeking predictable costs for 5+ year horizons, project finance requirements',
    },
    {
      type: 'Behind-the-Meter (BTM) / Co-Location',
      marketExample: 'Stranded gas wells (West Texas, Bakken), curtailed wind/solar, stranded hydro',
      description: 'Co-locate mining facility directly at or near generation source. Power is consumed before reaching the grid, avoiding transmission/distribution charges entirely. Often involves stranded or curtailed energy resources.',
      howItWorks: [
        'Identify stranded generation asset (flared gas, curtailed renewables)',
        'Negotiate direct offtake agreement with generator owner',
        'Install mining equipment on-site or adjacent',
        'Power flows directly from generator to load, bypassing grid'
      ],
      pros: ['Lowest possible energy cost ($15-40/MWh)', 'No transmission or distribution charges', 'Often remote = lower land costs', 'Potential emissions reduction credit (flare gas)'],
      cons: ['Site-specific availability and capacity', 'Generation variability (especially renewables)', 'Remote locations = logistics challenges', 'Equipment mobility may be required'],
      priceRange: {
        low: '$15/MWh',
        high: '$50/MWh',
        typical: '$20-35/MWh',
        note: 'Stranded gas can be as low as $10-15/MWh; curtailed solar/wind $15-25/MWh'
      },
      minLoad: 'Varies widely (500 kW mobile to 50+ MW permanent)',
      suitableFor: 'Operators with logistical capabilities, tolerance for remote operations, flexible equipment',
    },
    {
      type: 'Regulated Retail Rate',
      marketExample: 'Vertically integrated utilities (most of US, regulated provinces)',
      description: 'Standard utility service under regulated tariff. Simplest arrangement with predictable monthly bills, but typically highest all-in cost. No market participation or volume commitment required.',
      howItWorks: [
        'Apply for commercial/industrial service with local utility',
        'Rate class determined by demand level and voltage',
        'Monthly bill = energy charges + demand charges + riders',
        'Limited optimization opportunity beyond time-of-use rates'
      ],
      pros: ['Simple and predictable billing', 'No minimum load commitment', 'No market risk or monitoring required', 'Reliable utility service'],
      cons: ['Highest all-in cost typically', 'Limited optimization potential', 'Subject to periodic rate increases', 'Demand charges can add significantly to cost'],
      priceRange: {
        low: '$60/MWh',
        high: '$150/MWh',
        typical: '$80-120/MWh all-in',
        note: 'Demand charges ($5-20/kW-month) can add $10-30/MWh equivalent'
      },
      minLoad: 'Any size',
      suitableFor: 'Small operators (<5 MW), proof-of-concept deployments, regulated markets with no alternatives',
    },
  ];

  const siteSelectionCriteria = [
    {
      category: 'Power Infrastructure',
      weight: 35,
      rationale: 'Interconnection costs and timeline often determine project viability. Proximity to existing infrastructure is paramount.',
      factors: [
        { 
          name: 'Substation proximity', 
          detail: 'Ideally <5 km to HV substation',
          impact: 'Each km of new line adds $100K-500K cost and 1-2 months timeline'
        },
        { 
          name: 'Available capacity (headroom)', 
          detail: 'MW available on existing circuits',
          impact: 'Capacity-constrained areas require network upgrades, adding years to timeline'
        },
        { 
          name: 'Interconnection cost estimate', 
          detail: '$150-500/kW typical, varies widely',
          impact: 'For 100 MW: $15M-50M interconnection budget'
        },
        { 
          name: 'Grid reliability history', 
          detail: 'SAIDI/SAIFI metrics, frequency stability',
          impact: 'Poor reliability = lost mining time = lost revenue'
        },
      ],
    },
    {
      category: 'Energy Cost',
      weight: 30,
      rationale: 'Energy is 70-80% of operating cost. Even $5/MWh difference equals $4.4M/year for 100 MW facility.',
      factors: [
        { 
          name: 'Wholesale market access', 
          detail: 'Self-retailer eligibility, market structure',
          impact: 'Wholesale access typically saves 10-25% vs regulated retail'
        },
        { 
          name: 'Historical average pool price', 
          detail: 'Multi-year price data and volatility',
          impact: 'AESO averages $60-80/MWh; ERCOT can average $40-60/MWh'
        },
        { 
          name: 'Transmission charges', 
          detail: 'Varies by zone and utility',
          impact: 'Can add $8-25/MWh depending on congestion and distance from generation'
        },
        { 
          name: 'Demand charges', 
          detail: 'Peak demand pricing structure',
          impact: 'Flat 24/7 load like mining helps minimize demand charge impact'
        },
      ],
    },
    {
      category: 'Climate & Cooling',
      weight: 20,
      rationale: 'Cooling is the second largest operating cost. Cold climates enable free-air cooling 70-90% of the year.',
      factors: [
        { 
          name: 'Annual average temperature', 
          detail: '<10°C avg enables high free-cooling hours',
          impact: 'Cold climate can reduce PUE from 1.4 to 1.1, saving 20%+ on cooling'
        },
        { 
          name: 'Humidity levels', 
          detail: '<60% RH optimal for evaporative cooling',
          impact: 'High humidity limits evaporative cooling effectiveness'
        },
        { 
          name: 'Free cooling hours', 
          detail: 'Hours below 15°C (ASHRAE economizer threshold)',
          impact: 'Northern Alberta: 7,500+ hours; Houston: 1,500 hours'
        },
        { 
          name: 'Extreme weather risk', 
          detail: 'Tornado, flood, wildfire, ice storm exposure',
          impact: 'Insurance cost and potential operational disruption'
        },
      ],
    },
    {
      category: 'Land & Logistics',
      weight: 15,
      rationale: 'Physical site requirements for construction, operations, and equipment delivery.',
      factors: [
        { 
          name: 'Land cost and availability', 
          detail: '$5-50K/acre depending on location',
          impact: 'Industrial-zoned land with power access commands premium'
        },
        { 
          name: 'Zoning and permitting', 
          detail: 'Industrial, agricultural, or special use',
          impact: 'Some jurisdictions require conditional use permits, adding 6-12 months'
        },
        { 
          name: 'Road access', 
          detail: 'County/highway access for heavy equipment',
          impact: 'Transformers can weigh 50+ tons; road upgrades may be required'
        },
        { 
          name: 'Internet connectivity', 
          detail: 'Fiber or fixed wireless with redundancy',
          impact: 'Mining requires low-latency, high-availability internet'
        },
      ],
    },
  ];

  const interconnectionTimeline = [
    { 
      phase: 'Pre-Application', 
      duration: '1-3 months', 
      description: 'Site selection, load study, initial utility discussions',
      activities: ['Load characterization', 'Preliminary engineering', 'Utility pre-consultation'],
      risk: 'Low — mostly internal planning'
    },
    { 
      phase: 'Application & Screening', 
      duration: '1-2 months', 
      description: 'Submit formal interconnection request, initial feasibility screening',
      activities: ['Application fee ($1K-50K)', 'Load data submission', 'Queue position assignment'],
      risk: 'Low — procedural'
    },
    { 
      phase: 'System Impact Study', 
      duration: '3-6 months', 
      description: 'Utility models network effects of proposed load',
      activities: ['Power flow analysis', 'Short circuit study', 'Thermal loading assessment'],
      risk: 'Medium — may identify required network upgrades'
    },
    { 
      phase: 'Facilities Study', 
      duration: '2-4 months', 
      description: 'Detailed engineering and binding cost estimate',
      activities: ['Detailed design', 'Material procurement specs', 'Cost allocation'],
      risk: 'Medium — final cost numbers; may differ significantly from estimates'
    },
    { 
      phase: 'Agreements & Permits', 
      duration: '2-4 months', 
      description: 'Execute interconnection agreement, obtain permits',
      activities: ['Legal review', 'Construction permits', 'Environmental clearances'],
      risk: 'Variable — jurisdiction-dependent'
    },
    { 
      phase: 'Construction', 
      duration: '6-18 months', 
      description: 'Build customer substation, utility upgrades if required',
      activities: ['Substation construction', 'Feeder installation', 'Protection coordination'],
      risk: 'High — supply chain, weather, labor availability'
    },
    { 
      phase: 'Testing & Commissioning', 
      duration: '1-2 months', 
      description: 'Protection testing, utility witness testing, energization',
      activities: ['Relay testing', 'Insulation testing', 'Utility inspection', 'Meter sealing'],
      risk: 'Low if construction completed properly'
    },
  ];

  const tabs = [
    { id: 'grid', label: 'Grid Connection', icon: Zap, description: 'Power journey to facility' },
    { id: 'ppa', label: 'Power Purchasing', icon: DollarSign, description: 'Wholesale vs retail' },
    { id: 'site', label: 'Site Selection', icon: MapPin, description: 'Criteria and trade-offs' },
  ];

  return (
    <DCESectionWrapper theme="accent" id="energy-source">
      <LearningObjectives
        objectives={[
          "Understand WHY transmission uses high voltage (P = I²R losses)",
          "Trace power from generation to facility across 4 voltage transformation stages",
          "Compare 4 power purchasing strategies: self-retailer, PPA, BTM, and regulated retail",
          "Evaluate site selection criteria using a weighted scoring framework",
          "Estimate interconnection timelines and identify critical path activities"
        ]}
        estimatedTime="12 min"
      />
      
      <DCESectionHeader
        badge="Section 1 • Grid Connection"
        badgeIcon={Zap}
        title="Energy Source to Facility"
        description="How Bitcoin mining facilities connect to the electrical grid and secure competitive power rates"
      />

      {/* Physics Primer Callout */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="mb-10"
      >
        <button
          onClick={() => setShowTransmissionPhysics(!showTransmissionPhysics)}
          className="w-full flex items-center justify-between p-5 bg-card border border-border rounded-2xl hover:border-[hsl(var(--watt-bitcoin)/0.5)] transition-all"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[hsl(var(--watt-bitcoin))] to-orange-600 flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <div className="text-left">
              <h3 className="font-bold text-foreground">First Principles: Why High Voltage?</h3>
              <p className="text-sm text-muted-foreground">Understanding P = I²R — the physics of efficient power transmission</p>
            </div>
          </div>
          <ChevronDown className={`w-5 h-5 text-muted-foreground transition-transform ${showTransmissionPhysics ? 'rotate-180' : ''}`} />
        </button>
        
        <AnimatePresence>
          {showTransmissionPhysics && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="p-6 bg-card border-x border-b border-border rounded-b-2xl">
                <ElectricalPrimer />
                
                {/* Additional worked example */}
                <div className="mt-6 p-4 bg-muted/50 rounded-xl">
                  <h4 className="font-bold text-foreground mb-3 flex items-center gap-2">
                    <Calculator className="w-4 h-4 text-[hsl(var(--watt-bitcoin))]" />
                    Worked Example: 100 MW Transmission
                  </h4>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-lg">
                      <div className="text-sm font-semibold text-emerald-700 mb-2">At 345 kV (Transmission)</div>
                      <div className="space-y-1 text-sm">
                        <p>Current = 100 MW ÷ (345 kV × √3) = <strong>167 A</strong></p>
                        <p>Loss over 100 km (5Ω) = 167² × 5 = <strong>139 kW</strong></p>
                        <p className="text-emerald-600 font-semibold">Loss rate: 0.14%</p>
                      </div>
                    </div>
                    <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                      <div className="text-sm font-semibold text-red-700 mb-2">At 12.47 kV (Distribution)</div>
                      <div className="space-y-1 text-sm">
                        <p>Current = 100 MW ÷ (12.47 kV × √3) = <strong>4,620 A</strong></p>
                        <p>Loss over 100 km (5Ω) = 4620² × 5 = <strong>107 MW</strong></p>
                        <p className="text-red-600 font-semibold">Loss rate: 107% — more than 100% of power!</p>
                      </div>
                    </div>
                  </div>
                  <p className="mt-4 text-sm text-muted-foreground">
                    This example illustrates why bulk power is always transmitted at high voltage. The squared relationship 
                    between current and losses (P = I²R) makes low-voltage transmission of large power quantities physically impractical.
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Tab Navigation */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="mb-10"
      >
        <div className="flex overflow-x-auto pb-2 gap-3 scrollbar-hide snap-x snap-mandatory md:flex-wrap md:justify-center md:overflow-visible md:pb-0">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-shrink-0 snap-start flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all min-w-[140px] md:min-w-0 ${
                activeTab === tab.id
                  ? 'bg-[hsl(var(--watt-bitcoin))] text-white shadow-lg shadow-[hsl(var(--watt-bitcoin)/0.3)]'
                  : 'bg-card border border-border text-muted-foreground hover:border-[hsl(var(--watt-bitcoin)/0.5)]'
              }`}
            >
              <tab.icon className="w-5 h-5 flex-shrink-0" />
              <div className="text-left">
                <div className="text-sm font-semibold whitespace-nowrap">{tab.label}</div>
                <div className={`text-xs whitespace-nowrap ${activeTab === tab.id ? 'text-white/70' : 'text-muted-foreground'}`}>
                  {tab.description}
                </div>
              </div>
            </button>
          ))}
        </div>
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
            {/* Variability Disclaimer */}
            <DCEDisclaimer severity="caution">
              <strong>Cost and Timeline Variability:</strong> Infrastructure costs and timelines vary significantly based on location, existing grid conditions, 
              utility policies, and market conditions. Ranges provided reflect industry experience across 
              North American markets as of 2024. Actual project costs may fall outside these ranges.
            </DCEDisclaimer>

            {/* Grid Connection Steps */}
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
                        {[30, 50, 70].map((top, i) => (
                          <motion.div 
                            key={i}
                            className="absolute w-2 h-2 rounded-full bg-[hsl(var(--watt-bitcoin))]"
                            style={{ top: `${top}%` }}
                            animate={{ left: ['0%', '100%'], opacity: [0, 1, 1, 0] }}
                            transition={{ duration: 4, repeat: Infinity, ease: 'linear', delay: i }}
                          />
                        ))}
                      </div>

                      {/* Content Overlay */}
                      <div className="absolute inset-0 flex items-center">
                        <div className="p-4 sm:p-6 md:p-8 lg:p-10 w-full max-w-[90%] sm:max-w-[80%] lg:max-w-[70%]">
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
                          
                          {/* Voltage Explanation */}
                          <p className="text-white/70 text-xs mb-2 italic">
                            {step.voltageExplanation}
                          </p>
                          
                          {/* Description */}
                          <p className="text-white/80 text-sm md:text-base mb-4">
                            {step.description}
                          </p>

                          {/* Quick Stats with Range Indicators */}
                          <div className="flex flex-wrap gap-4">
                            <div className="px-3 py-2 bg-white/10 backdrop-blur-sm rounded-lg relative">
                              <DataQualityBadge quality="estimate" />
                              <div className="text-xs text-white/60 mt-2">Cost Range</div>
                              <div className="text-sm font-semibold text-white">
                                {step.costRange.low} - {step.costRange.high}
                              </div>
                            </div>
                            <div className="px-3 py-2 bg-white/10 backdrop-blur-sm rounded-lg relative">
                              <DataQualityBadge quality="estimate" />
                              <div className="text-xs text-white/60 mt-2">Timeline</div>
                              <div className="text-sm font-semibold text-white">{step.timeline.typical}</div>
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
                          Click for technical details
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
                          className="bg-card border-t border-border"
                        >
                          <div className="p-6">
                            {/* Physics Note */}
                            <div className="mb-6 p-4 bg-[hsl(var(--watt-bitcoin)/0.1)] rounded-lg border border-[hsl(var(--watt-bitcoin)/0.2)]">
                              <h4 className="font-semibold text-foreground mb-1 flex items-center gap-2">
                                <Calculator className="w-4 h-4 text-[hsl(var(--watt-bitcoin))]" />
                                Engineering Context
                              </h4>
                              <p className="text-sm text-muted-foreground">{step.physicsNote}</p>
                            </div>

                            {/* Equipment Details */}
                            <h4 className="font-bold text-foreground mb-4 flex items-center gap-2">
                              <Shield className="w-4 h-4 text-[hsl(var(--watt-bitcoin))]" />
                              Key Equipment & Infrastructure
                            </h4>
                            <div className="grid md:grid-cols-2 gap-4 mb-6">
                              {step.details.map((detail, i) => (
                                <div key={i} className="p-3 bg-muted/50 rounded-lg">
                                  <div className="flex items-start gap-2">
                                    <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                                    <div>
                                      <div className="text-sm font-medium text-foreground">{detail.item}</div>
                                      <div className="text-xs text-muted-foreground">{detail.explanation}</div>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>

                            {/* Cost Factors */}
                            <div className="mb-6">
                              <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                                <DollarSign className="w-4 h-4 text-[hsl(var(--watt-bitcoin))]" />
                                Cost Factors ({step.costRange.low} - {step.costRange.high})
                              </h4>
                              <div className="flex flex-wrap gap-2">
                                {step.costRange.factors.map((factor, i) => (
                                  <span key={i} className="px-3 py-1 bg-muted rounded-full text-xs text-muted-foreground">
                                    {factor}
                                  </span>
                                ))}
                              </div>
                            </div>

                            {/* Standards Reference */}
                            <div className="p-3 bg-muted/30 rounded-lg">
                              <div className="text-xs text-muted-foreground">
                                <strong>Applicable Standards:</strong> {step.standards.join(' • ')}
                              </div>
                            </div>
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
              (25kV-138kV) to access wholesale power rates. Distribution-level connection adds $15-25/MWh in 
              charges that transmission customers avoid.
            </DCEKeyInsight>

            {/* Summary Statistics */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="p-6 bg-gradient-to-r from-[hsl(var(--watt-navy))] to-[hsl(var(--watt-navy)/0.9)] rounded-2xl text-white mb-8"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Typical Large Facility Grid Connection</h3>
                <DataQualityBadge quality="estimate" />
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
                <div>
                  <div className="text-2xl font-bold text-[hsl(var(--watt-bitcoin))]">138-500 kV</div>
                  <div className="text-xs text-white/70">Transmission Voltage</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">600-480 V</div>
                  <div className="text-xs text-white/70">Service Voltage</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">12-36 mo</div>
                  <div className="text-xs text-white/70">Interconnection Timeline</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">$10-50M</div>
                  <div className="text-xs text-white/70">Infrastructure Cost (50+ MW)</div>
                </div>
              </div>
            </motion.div>

            {/* Interconnection Timeline Deep Dive */}
            <DCEDeepDive title="Interconnection Timeline: Critical Path Analysis" icon={Clock}>
              <p className="text-sm text-muted-foreground mb-6">
                Interconnection is typically the longest lead-time activity for new mining facilities. 
                Understanding the process helps identify opportunities to accelerate and risks to mitigate.
              </p>
              
              <div className="space-y-4">
                {interconnectionTimeline.map((phase, i) => (
                  <div key={phase.phase} className="flex gap-4 items-start">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[hsl(var(--watt-bitcoin)/0.1)] border-2 border-[hsl(var(--watt-bitcoin))] flex items-center justify-center font-bold text-[hsl(var(--watt-bitcoin))] text-sm">
                      {i + 1}
                    </div>
                    <div className="flex-1 pb-4 border-b border-border last:border-0">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-semibold text-foreground">{phase.phase}</h4>
                        <span className="text-sm font-medium text-[hsl(var(--watt-bitcoin))]">{phase.duration}</span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{phase.description}</p>
                      <div className="flex flex-wrap gap-2 mb-2">
                        {phase.activities.map((activity, j) => (
                          <span key={j} className="px-2 py-0.5 bg-muted rounded text-xs text-foreground">{activity}</span>
                        ))}
                      </div>
                      <div className={`text-xs px-2 py-1 rounded inline-block ${
                        phase.risk.includes('Low') ? 'bg-emerald-100 text-emerald-700' :
                        phase.risk.includes('Medium') ? 'bg-amber-100 text-amber-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        Risk: {phase.risk}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 p-4 bg-muted/50 rounded-lg">
                <h4 className="font-semibold text-foreground mb-2">Total Timeline: 16-39 months</h4>
                <p className="text-sm text-muted-foreground">
                  The most variable phases are System Impact Study and Construction. Network upgrade requirements 
                  discovered during studies can add 12-24 months and $5-20M to project scope.
                </p>
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
            <DCEDisclaimer severity="informational">
              <strong>Market-Specific Information:</strong> Power purchasing structures and availability vary significantly by jurisdiction. 
              Self-retailer options require deregulated markets (Alberta, Texas, parts of Midwest). 
              Price ranges reflect 2023-2024 market conditions and will vary with natural gas prices and market dynamics.
            </DCEDisclaimer>

            <DCEKeyInsight variant="info" className="mb-8">
              Energy costs represent 70-80% of Bitcoin mining operational expenses. A $10/MWh 
              improvement on a 100 MW facility equals $8.8M annual savings — often the difference 
              between profit and loss during bear markets.
            </DCEKeyInsight>

            <div className="grid md:grid-cols-2 gap-6">
              {powerPurchaseTypes.map((ppa, index) => (
                <motion.div
                  key={ppa.type}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className="bg-card rounded-2xl border border-border overflow-hidden hover:border-[hsl(var(--watt-bitcoin)/0.5)] hover:shadow-lg transition-all duration-300"
                >
                  {/* Header */}
                  <div className="p-5 border-b border-border bg-muted/30">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-bold text-foreground text-lg">{ppa.type}</h3>
                    </div>
                    <p className="text-xs text-muted-foreground italic">{ppa.marketExample}</p>
                  </div>

                  {/* Content */}
                  <div className="p-5">
                    <p className="text-sm text-muted-foreground mb-4">{ppa.description}</p>
                    
                    {/* How It Works */}
                    <div className="mb-4">
                      <h4 className="text-xs font-semibold text-foreground mb-2 uppercase tracking-wide">How It Works</h4>
                      <ol className="space-y-1">
                        {ppa.howItWorks.map((step, i) => (
                          <li key={i} className="text-xs text-muted-foreground flex items-start gap-2">
                            <span className="text-[hsl(var(--watt-bitcoin))] font-bold">{i + 1}.</span>
                            {step}
                          </li>
                        ))}
                      </ol>
                    </div>

                    {/* Price Range */}
                    <div className="mb-4 p-3 bg-[hsl(var(--watt-bitcoin)/0.1)] rounded-lg">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-muted-foreground">Price Range</span>
                        <DataQualityBadge quality="estimate" />
                      </div>
                      <div className="text-lg font-bold text-[hsl(var(--watt-bitcoin))]">
                        {ppa.priceRange.low} - {ppa.priceRange.high}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        Typical: {ppa.priceRange.typical}
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-2 italic">{ppa.priceRange.note}</p>
                    </div>
                    
                    {/* Pros/Cons Grid */}
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
                    
                    {/* Footer */}
                    <div className="pt-3 border-t border-border">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">
                          Min Load: <span className="text-foreground font-medium">{ppa.minLoad}</span>
                        </span>
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-2 italic">
                        Best for: {ppa.suitableFor}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            <DCEKeyInsight variant="pro-tip" className="mt-8">
              Behind-the-meter (BTM) arrangements with stranded gas or curtailed renewables offer the lowest 
              power costs ($15-40/MWh) but require co-location with the generation source, specialized 
              equipment for mobility, and tolerance for operational complexity in remote locations.
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
            <DCEDisclaimer severity="informational">
              <strong>Weighting Framework:</strong> The weights shown (35%, 30%, 20%, 15%) represent a typical prioritization for large-scale 
              Bitcoin mining. Actual weights should be adjusted based on operator priorities, capital 
              constraints, and risk tolerance.
            </DCEDisclaimer>

            <div className="grid md:grid-cols-2 gap-6 mb-8">
              {siteSelectionCriteria.map((category, index) => (
                <motion.div
                  key={category.category}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className="bg-card rounded-2xl border border-border p-5 hover:border-[hsl(var(--watt-bitcoin)/0.3)] transition-colors"
                >
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-bold text-foreground">{category.category}</h3>
                    <span className="px-3 py-1 bg-[hsl(var(--watt-bitcoin))] text-white rounded-full text-sm font-bold">
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

                  <p className="text-xs text-muted-foreground italic mb-4">{category.rationale}</p>
                  
                  <ul className="space-y-4">
                    {category.factors.map((factor, i) => (
                      <li key={i} className="text-sm border-l-2 border-[hsl(var(--watt-bitcoin)/0.3)] pl-3">
                        <div className="font-medium text-foreground">{factor.name}</div>
                        <div className="text-xs text-muted-foreground mb-1">{factor.detail}</div>
                        <div className="text-xs text-[hsl(var(--watt-bitcoin))]">Impact: {factor.impact}</div>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              ))}
            </div>

            <DCEKeyInsight variant="success" className="mb-8">
              The ideal site combines low energy costs (under $45/MWh all-in), cold climate for free cooling 
              (7,000+ hours/year below 15°C), and proximity to existing HV infrastructure (under 5km to 
              substation) to minimize interconnection costs and timeline.
            </DCEKeyInsight>
            
            {/* Trade-off Matrix */}
            <DCEDeepDive title="Common Site Trade-offs" icon={MapPin}>
              <div className="space-y-4">
                <div className="p-4 bg-muted/50 rounded-lg">
                  <h4 className="font-semibold text-foreground mb-2">Remote BTM vs. Grid-Connected</h4>
                  <div className="grid md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="font-medium text-emerald-600 mb-1">Remote BTM Advantage</div>
                      <p className="text-muted-foreground">40-60% lower energy cost, no grid dependency</p>
                    </div>
                    <div>
                      <div className="font-medium text-amber-600 mb-1">Remote BTM Challenge</div>
                      <p className="text-muted-foreground">Higher logistics cost, limited growth capacity, staff challenges</p>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-muted/50 rounded-lg">
                  <h4 className="font-semibold text-foreground mb-2">Cold Climate vs. Low Energy Cost</h4>
                  <div className="grid md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="font-medium text-emerald-600 mb-1">Cold Climate Advantage</div>
                      <p className="text-muted-foreground">PUE 1.05-1.15 achievable, lower cooling CapEx</p>
                    </div>
                    <div>
                      <div className="font-medium text-amber-600 mb-1">Cold Climate Challenge</div>
                      <p className="text-muted-foreground">May have higher energy prices, seasonal construction limits</p>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-muted/50 rounded-lg">
                  <h4 className="font-semibold text-foreground mb-2">Speed vs. Scale</h4>
                  <div className="grid md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="font-medium text-emerald-600 mb-1">Fast Deployment</div>
                      <p className="text-muted-foreground">Containers at existing substation: 8-16 weeks</p>
                    </div>
                    <div>
                      <div className="font-medium text-amber-600 mb-1">Large Scale</div>
                      <p className="text-muted-foreground">New 100+ MW greenfield: 24-48 months</p>
                    </div>
                  </div>
                </div>
              </div>
            </DCEDeepDive>
          </motion.div>
        )}
      </AnimatePresence>

      <SectionSummary
        takeaways={[
          "High voltage transmission (138-500kV) reduces I²R losses exponentially — essential physics for bulk power",
          "Large mining facilities connect at transmission/sub-transmission level to access wholesale rates",
          "Power purchasing options range from $15/MWh (BTM) to $120/MWh (regulated retail) — a 8× cost difference",
          "Interconnection typically takes 16-36 months — early engagement with utility is critical path",
          "Site selection balances power infrastructure (35%), energy cost (30%), climate (20%), and logistics (15%)"
        ]}
        nextSteps={[
          { title: "Electrical Infrastructure", href: "#electrical", description: "Explore transformer physics, switchgear, and PDU systems" }
        ]}
        proTip="Self-retailer status in deregulated markets (AESO, ERCOT) can save 15-25% vs regulated retail rates, but requires sophisticated price risk management and 24/7 market monitoring capability."
      />
    </DCESectionWrapper>
  );
};

export default EnergySourceSection;
