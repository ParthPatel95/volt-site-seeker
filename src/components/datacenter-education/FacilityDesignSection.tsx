import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Building2, Box, Grid, Ruler, CheckCircle, ArrowRight, Zap, Wind, 
  Shield, DollarSign, Clock, AlertTriangle, BookOpen, ChevronDown,
  Thermometer, FileText, HardHat, MapPin, Truck
} from 'lucide-react';
import { AnimatedCounter } from '@/components/ui/AnimatedCounter';
import LearningObjectives from '@/components/academy/LearningObjectives';
import SectionSummary from '@/components/academy/SectionSummary';
import {
  DCESectionWrapper,
  DCESectionHeader,
  DCEContentCard,
  DCEKeyInsight,
  DCEDeepDive,
  DCEDisclaimer,
  DataQualityBadge
} from './shared';
import datacenter3dExterior from '@/assets/datacenter-3d-exterior.jpg';
import containerDeployment from '@/assets/datacenter-container-deployment.jpg';

const FacilityDesignSection = () => {
  const [activeFacilityType, setActiveFacilityType] = useState<'warehouse' | 'container' | 'modular'>('warehouse');
  const [showStructuralDetails, setShowStructuralDetails] = useState(false);
  const [showPermittingDetails, setShowPermittingDetails] = useState(false);

  // Structural engineering considerations
  const structuralConsiderations = {
    title: "Structural Engineering for Mining Facilities",
    introduction: `Mining facilities face unique structural challenges: extreme floor loads from dense ASIC 
    deployments, vibration from thousands of fans, and environmental loads that vary dramatically by location. 
    Understanding these factors prevents costly retrofits and ensures long-term structural integrity.`,
    loadTypes: [
      {
        type: "Dead Load",
        description: "Weight of building structure, roofing, fixed equipment",
        typical: "15-25 psf for steel structure",
        mining: "Standard — nothing unusual for mining"
      },
      {
        type: "Live Load (Floor)",
        description: "Weight of miners, racks, personnel, mobile equipment",
        typical: "50-100 psf for industrial",
        mining: "100-150 psf recommended — ASICs are dense (40-50 lbs each, closely packed)"
      },
      {
        type: "Equipment Load",
        description: "Concentrated loads from transformers, switchgear",
        typical: "Varies by equipment",
        mining: "Pad-mount transformers: 10,000-30,000 lbs each; need reinforced pads"
      },
      {
        type: "Environmental Loads",
        description: "Wind, snow, seismic based on location",
        typical: "Per ASCE 7 / NBC",
        mining: "Cold climates = high snow loads (50-100 psf); consider drift at equipment"
      }
    ],
    foundationTypes: [
      {
        type: "Slab-on-Grade",
        description: "Reinforced concrete slab directly on prepared soil",
        pros: ["Cost-effective", "Fast construction", "Good for flat sites"],
        cons: ["Requires good soil bearing", "Frost heave risk in cold climates"],
        typical: "6-8 inch thick, 4000 psi concrete, #4 rebar @ 12\" o.c."
      },
      {
        type: "Pier and Grade Beam",
        description: "Deep piers connected by grade beams supporting slab",
        pros: ["Works on poor soil", "Resists frost heave", "Stable on slopes"],
        cons: ["Higher cost", "Longer construction", "Needs geotechnical study"],
        typical: "Piers to 10-30 ft depth, depending on frost line and bearing stratum"
      },
      {
        type: "Precast Foundations",
        description: "Factory-built concrete elements assembled on-site",
        pros: ["Fast installation", "Quality control", "Cold weather friendly"],
        cons: ["Transportation costs", "Limited customization", "Crane required"],
        typical: "Common for modular deployments; 2-4 weeks from order to install"
      }
    ]
  };

  // Permitting and regulatory considerations
  const permittingConsiderations = {
    title: "Permitting & Regulatory Pathway",
    reality: `Permitting timelines vary dramatically by jurisdiction — from 3 months in mining-friendly rural 
    counties to 3+ years in restrictive urban areas. Early engagement with authorities having jurisdiction 
    (AHJ) is critical to avoid delays.`,
    typicalPermits: [
      {
        permit: "Building Permit",
        authority: "Local Building Department",
        timeline: "2-6 months",
        requirements: "Engineered drawings, structural calcs, code compliance",
        challenges: "Some jurisdictions unfamiliar with datacenter codes"
      },
      {
        permit: "Electrical Permit",
        authority: "Local/State Electrical Authority",
        timeline: "1-3 months",
        requirements: "Single-line diagrams, load calcs, equipment specs",
        challenges: "Large services may require utility coordination"
      },
      {
        permit: "Environmental/NEPA",
        authority: "State/Federal EPA",
        timeline: "3-24 months",
        requirements: "Environmental impact assessment, noise studies, stormwater",
        challenges: "Endangered species, wetlands, historical sites can add years"
      },
      {
        permit: "Fire Department Approval",
        authority: "Local Fire Marshal",
        timeline: "1-2 months",
        requirements: "Fire suppression, egress, access roads, hazmat storage",
        challenges: "High-density electronics may trigger special requirements"
      },
      {
        permit: "Zoning/Land Use",
        authority: "Planning/Zoning Board",
        timeline: "1-12 months",
        requirements: "Conditional use permit, variance if needed",
        challenges: "Public hearings, neighbor opposition, noise concerns"
      }
    ],
    codeCompliance: [
      { code: "IBC (International Building Code)", relevance: "Structural, fire, occupancy classification" },
      { code: "NEC/CEC (Electrical Code)", relevance: "All electrical systems, NEC 645 for IT equipment" },
      { code: "NFPA 855", relevance: "Energy storage systems (if batteries present)" },
      { code: "ASHRAE 90.1", relevance: "Energy efficiency requirements (may apply)" },
      { code: "Local Amendments", relevance: "Vary widely — always verify local requirements" }
    ]
  };

  const facilityTypes = {
    warehouse: {
      name: 'Purpose-Built Steel Building',
      subtitle: 'Large-Scale Permanent Deployment',
      image: datacenter3dExterior,
      description: 'Pre-engineered metal building (PEMB) with high ceilings for optimal airflow and overhead distribution. Most cost-effective for deployments above 25 MW where long-term operation is expected.',
      buildTime: {
        design: '3-4 months',
        permitting: '2-6 months',
        construction: '8-14 months',
        total: '13-24 months'
      },
      scalability: 'Fixed capacity; expansion requires new construction',
      capex: {
        low: '$150/kW',
        high: '$300/kW',
        typical: '$180-220/kW',
        factors: ['Site conditions', 'Building size', 'Electrical complexity', 'Labor market']
      },
      bestFor: 'Operators with long-term power contracts (5+ years), seeking lowest $/kW at scale',
      specs: {
        structure: 'Pre-engineered metal building (PEMB)',
        clearHeight: '24-32 ft eave height',
        foundation: '6-8" reinforced concrete, 100+ psf capacity',
        insulation: 'R-19 walls, R-30+ roof (climate dependent)',
        doors: '12×14 ft roll-up doors for equipment delivery',
        electrical: 'Overhead busway or cable tray distribution',
        fire: 'VESDA early warning, dry chemical or clean agent'
      },
      layout: [
        { name: 'Mining Floor (White Space)', percentage: 60, description: 'ASIC racks with hot/cold aisle containment' },
        { name: 'Electrical Rooms', percentage: 15, description: 'Unit substations, switchgear, PDUs' },
        { name: 'Mechanical/Cooling', percentage: 10, description: 'Dry coolers, fans, pumps (if applicable)' },
        { name: 'Substation Area (Outdoor)', percentage: 10, description: 'HV transformers, switchgear yard' },
        { name: 'NOC/Support', percentage: 5, description: 'Control room, storage, break room, restrooms' },
      ],
      advantages: [
        'Lowest cost per kW at scale ($150-200/kW achievable)',
        'Best PUE potential (1.05-1.15 with proper design)',
        'Maximum operational flexibility and customization',
        'Permanent facility = easier financing, insurance'
      ],
      disadvantages: [
        'Long lead time (18-24 months typical)',
        'Fixed location — cannot relocate if power economics change',
        'High upfront capital commitment',
        'Complex permitting process'
      ]
    },
    container: {
      name: 'Modular Mining Container',
      subtitle: 'Rapid Deployment Solution',
      image: containerDeployment,
      description: 'Factory-built, fully integrated mining containers (typically 40-ft ISO form factor). Pre-wired with power distribution, cooling, and network infrastructure. Delivered ready to energize.',
      buildTime: {
        design: '2-4 weeks',
        manufacturing: '4-8 weeks',
        permitting: '1-3 months',
        deployment: '1-2 weeks',
        total: '3-5 months'
      },
      scalability: 'Highly scalable — add containers as power becomes available',
      capex: {
        low: '$280/kW',
        high: '$500/kW',
        typical: '$350-450/kW',
        factors: ['Manufacturer', 'Cooling type', 'Monitoring features', 'Volume discount']
      },
      bestFor: 'BTM/stranded energy sites, uncertain power timelines, distributed deployments, fast market entry',
      specs: {
        structure: '40-ft ISO shipping container (modified)',
        dimensions: '40 × 8 × 9.5 ft (12.2 × 2.4 × 2.9 m)',
        weight: '~30,000-40,000 lbs loaded',
        cooling: 'Integrated (air exhaust, RDHX, or immersion)',
        electrical: 'Pre-wired PDUs, 480V (US) or 600V (CA) input',
        capacity: '200-350 miners per container (1-2.5 MW each)',
        fire: 'Integrated fire detection and suppression'
      },
      layout: [
        { name: 'Mining Racks', percentage: 75, description: '4-8 rows of ASICs, 48-64 per row' },
        { name: 'Cooling Equipment', percentage: 15, description: 'RDHX/fan wall, or immersion tanks' },
        { name: 'Electrical/PDU', percentage: 10, description: 'Main breaker, PDUs, monitoring' },
      ],
      advantages: [
        'Fastest time to hash (8-16 weeks typical)',
        'Relocatable — move to better power if needed',
        'Scalable — add units as power permits',
        'Factory quality control and testing',
        'Simplified permitting (often classified as equipment)'
      ],
      disadvantages: [
        'Higher cost per kW ($350-500/kW)',
        'Higher PUE (1.15-1.40 typical)',
        'Limited customization after purchase',
        'Space constraints for maintenance',
        'Transportation costs to remote sites'
      ]
    },
    modular: {
      name: 'Prefab Modular Data Center',
      subtitle: 'Factory-Built Large Modules',
      image: datacenter3dExterior,
      description: 'Large prefabricated modules (50×20 ft or larger) manufactured off-site and assembled on prepared foundation. Combines factory quality with building-like scale and efficiency.',
      buildTime: {
        design: '2-3 months',
        manufacturing: '3-6 months',
        permitting: '2-4 months',
        sitePrep: '2-3 months',
        assembly: '2-4 weeks',
        total: '6-12 months'
      },
      scalability: 'Modular expansion — add capacity in 5-10 MW increments',
      capex: {
        low: '$200/kW',
        high: '$400/kW',
        typical: '$250-350/kW',
        factors: ['Module size', 'Cooling system', 'Electrical config', 'Site work']
      },
      bestFor: 'Medium-scale operators (10-50 MW) wanting balance of speed and efficiency, phased expansion',
      specs: {
        structure: 'Steel-framed prefab modules (shop-welded)',
        moduleSize: '50 × 20 × 12 ft typical; can be larger',
        foundation: 'Concrete piers or slab (site-built)',
        cooling: 'Integrated air handling or centralized plant',
        electrical: 'Module includes internal distribution; external substation',
        capacity: '5-15 MW per IT hall module',
        fire: 'Building-code compliant systems'
      },
      layout: [
        { name: 'IT Hall Module', percentage: 65, description: 'Mining hardware rows with containment' },
        { name: 'Power Module', percentage: 15, description: 'Transformers, switchgear, PDUs' },
        { name: 'Cooling Module', percentage: 15, description: 'Dry coolers, pumps, economizer' },
        { name: 'Support/Access', percentage: 5, description: 'Entry, NOC, storage' },
      ],
      advantages: [
        'Faster than traditional construction (30-50% faster)',
        'Factory QC reduces on-site defects',
        'Phased deployment matches capital availability',
        'Better PUE than containers (1.1-1.25)',
        'Expandable infrastructure strategy'
      ],
      disadvantages: [
        'Higher cost than warehouse at large scale',
        'Transportation logistics for large modules',
        'Site preparation still required',
        'Less flexible than purpose-built for custom requirements'
      ]
    },
  };

  const currentFacility = facilityTypes[activeFacilityType];

  const civilRequirements = [
    { 
      name: 'Site Grading', 
      description: '1-2% slope for positive drainage', 
      icon: Ruler,
      detail: 'Direct water away from buildings and equipment; avoid ponding',
      code: 'Local drainage requirements'
    },
    { 
      name: 'Foundation Design', 
      description: '100+ psf floor loading capacity', 
      icon: Grid,
      detail: '6-8" reinforced slab typical; verify soil bearing capacity',
      code: 'IBC Chapter 18, ASCE 7'
    },
    { 
      name: 'Stormwater Management', 
      description: 'Retention/detention per local code', 
      icon: Wind,
      detail: 'May require pond, underground storage, or permeable surfaces',
      code: 'EPA SWPPP, local MS4 permit'
    },
    { 
      name: 'Access Roads', 
      description: '24 ft wide, 8" aggregate minimum', 
      icon: Truck,
      detail: 'Support 80,000 lb gross vehicle weight for transformer delivery',
      code: 'Fire code, utility requirements'
    },
    { 
      name: 'Security Fencing', 
      description: '8 ft chain-link with barbed wire', 
      icon: Shield,
      detail: 'Anti-climb features, locked gates, camera coverage',
      code: 'Insurance requirements, NEC 110.31'
    },
    { 
      name: 'Fire Access', 
      description: '26 ft fire lane, 13\'6" clearance', 
      icon: Building2,
      detail: 'All-weather surface, turning radius for fire apparatus',
      code: 'IFC Appendix D'
    },
  ];

  const comparisonMetrics = [
    { 
      metric: 'Time to Operation', 
      warehouse: '18-24 months', 
      container: '3-5 months', 
      modular: '6-12 months', 
      best: 'container',
      note: 'From decision to first hash'
    },
    { 
      metric: 'CapEx ($/kW)', 
      warehouse: '$150-300', 
      container: '$280-500', 
      modular: '$200-400', 
      best: 'warehouse',
      note: 'Installed cost, including site work'
    },
    { 
      metric: 'Achievable PUE', 
      warehouse: '1.05-1.15', 
      container: '1.15-1.40', 
      modular: '1.10-1.25', 
      best: 'warehouse',
      note: 'Climate-dependent; cold climate advantage'
    },
    { 
      metric: 'Scalability', 
      warehouse: 'Fixed', 
      container: 'Excellent', 
      modular: 'Good', 
      best: 'container',
      note: 'Ability to add capacity incrementally'
    },
    { 
      metric: 'Relocatability', 
      warehouse: 'None', 
      container: 'High', 
      modular: 'Low', 
      best: 'container',
      note: 'Can asset follow better power?'
    },
    { 
      metric: 'Max Practical Capacity', 
      warehouse: '200+ MW', 
      container: '30-50 MW', 
      modular: '50-100 MW', 
      best: 'warehouse',
      note: 'Per site; logistics limit containers'
    },
    { 
      metric: 'Financing Ease', 
      warehouse: 'Best', 
      container: 'Challenging', 
      modular: 'Good', 
      best: 'warehouse',
      note: 'Lenders prefer permanent structures'
    },
  ];

  const facilityButtons = [
    { id: 'warehouse' as const, name: 'Steel Building', shortName: 'Steel', icon: Building2, capacity: '25-200+ MW' },
    { id: 'container' as const, name: 'Container', shortName: 'Container', icon: Box, capacity: '1-2 MW each' },
    { id: 'modular' as const, name: 'Prefab Modular', shortName: 'Modular', icon: Grid, capacity: '5-15 MW each' },
  ];

  return (
    <DCESectionWrapper theme="accent" id="facility-design">
      <LearningObjectives
        objectives={[
          "Compare three facility archetypes: steel building, container, and prefab modular",
          "Understand structural engineering requirements for high-density mining loads",
          "Navigate the permitting process and identify timeline risks",
          "Evaluate trade-offs: speed vs. cost vs. efficiency vs. flexibility",
          "Select the optimal facility type based on project constraints"
        ]}
        estimatedTime="12 min"
        prerequisites={[
          { title: "Electrical Infrastructure", href: "#electrical" }
        ]}
      />

      <DCESectionHeader
        badge="Section 3 • Building Types"
        badgeIcon={Building2}
        title="Facility Design & Construction"
        description="Choosing the right physical infrastructure: steel buildings, containers, and modular systems"
      />

      {/* Data Quality Disclaimer */}
      <DCEDisclaimer severity="caution">
        <strong>Cost and timeline estimates are representative ranges.</strong> Actual values depend on location, 
        labor market, material costs, site conditions, and regulatory environment. Obtain project-specific 
        quotes from qualified contractors.
      </DCEDisclaimer>

      {/* Structural Engineering Primer */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="mb-10 mt-8"
      >
        <button
          onClick={() => setShowStructuralDetails(!showStructuralDetails)}
          className="w-full flex items-center justify-between p-5 bg-card border border-border rounded-2xl hover:border-[hsl(var(--watt-bitcoin)/0.5)] transition-all"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[hsl(var(--watt-bitcoin))] to-orange-600 flex items-center justify-center">
              <HardHat className="w-6 h-6 text-white" />
            </div>
            <div className="text-left">
              <h3 className="font-bold text-foreground">Structural Engineering Fundamentals</h3>
              <p className="text-sm text-muted-foreground">Load types, foundation options, and design considerations</p>
            </div>
          </div>
          <ChevronDown className={`w-5 h-5 text-muted-foreground transition-transform ${showStructuralDetails ? 'rotate-180' : ''}`} />
        </button>
        
        <AnimatePresence>
          {showStructuralDetails && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="p-6 bg-card border-x border-b border-border rounded-b-2xl">
                <p className="text-muted-foreground mb-6">{structuralConsiderations.introduction}</p>

                {/* Load Types */}
                <h4 className="font-bold text-foreground mb-4">Design Load Considerations</h4>
                <div className="grid md:grid-cols-2 gap-4 mb-6">
                  {structuralConsiderations.loadTypes.map((load, i) => (
                    <div key={i} className="p-4 bg-muted/50 rounded-lg">
                      <h5 className="font-semibold text-foreground mb-1">{load.type}</h5>
                      <p className="text-sm text-muted-foreground mb-2">{load.description}</p>
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">Typical: {load.typical}</span>
                      </div>
                      <p className="text-xs text-[hsl(var(--watt-bitcoin))] mt-1">{load.mining}</p>
                    </div>
                  ))}
                </div>

                {/* Foundation Types */}
                <h4 className="font-bold text-foreground mb-4">Foundation Options</h4>
                <div className="space-y-4">
                  {structuralConsiderations.foundationTypes.map((foundation, i) => (
                    <div key={i} className="p-4 bg-muted/30 rounded-lg">
                      <h5 className="font-semibold text-foreground mb-1">{foundation.type}</h5>
                      <p className="text-sm text-muted-foreground mb-3">{foundation.description}</p>
                      <div className="grid md:grid-cols-2 gap-4 mb-2">
                        <div>
                          <span className="text-xs font-medium text-emerald-600">Advantages:</span>
                          <ul className="text-xs text-muted-foreground">
                            {foundation.pros.map((pro, j) => (
                              <li key={j}>• {pro}</li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <span className="text-xs font-medium text-amber-600">Considerations:</span>
                          <ul className="text-xs text-muted-foreground">
                            {foundation.cons.map((con, j) => (
                              <li key={j}>• {con}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground italic">Typical: {foundation.typical}</p>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Permitting Primer */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="mb-10"
      >
        <button
          onClick={() => setShowPermittingDetails(!showPermittingDetails)}
          className="w-full flex items-center justify-between p-5 bg-card border border-border rounded-2xl hover:border-[hsl(var(--watt-bitcoin)/0.5)] transition-all"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div className="text-left">
              <h3 className="font-bold text-foreground">Permitting & Regulatory Pathway</h3>
              <p className="text-sm text-muted-foreground">Navigating approvals — the often-overlooked timeline risk</p>
            </div>
          </div>
          <ChevronDown className={`w-5 h-5 text-muted-foreground transition-transform ${showPermittingDetails ? 'rotate-180' : ''}`} />
        </button>
        
        <AnimatePresence>
          {showPermittingDetails && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="p-6 bg-card border-x border-b border-border rounded-b-2xl">
                <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg mb-6">
                  <p className="text-sm text-amber-700">{permittingConsiderations.reality}</p>
                </div>

                {/* Permit Types */}
                <h4 className="font-bold text-foreground mb-4">Typical Permit Requirements</h4>
                <div className="space-y-3 mb-6">
                  {permittingConsiderations.typicalPermits.map((permit, i) => (
                    <div key={i} className="p-4 bg-muted/30 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h5 className="font-semibold text-foreground">{permit.permit}</h5>
                        <span className="text-sm font-medium text-[hsl(var(--watt-bitcoin))]">{permit.timeline}</span>
                      </div>
                      <p className="text-xs text-muted-foreground mb-1">
                        <strong>Authority:</strong> {permit.authority}
                      </p>
                      <p className="text-xs text-muted-foreground mb-1">
                        <strong>Requirements:</strong> {permit.requirements}
                      </p>
                      <p className="text-xs text-amber-600">
                        <strong>Watch out:</strong> {permit.challenges}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Code Compliance */}
                <h4 className="font-bold text-foreground mb-3">Key Building Codes</h4>
                <div className="flex flex-wrap gap-2">
                  {permittingConsiderations.codeCompliance.map((code, i) => (
                    <div key={i} className="px-3 py-2 bg-muted rounded-lg">
                      <div className="text-xs font-medium text-foreground">{code.code}</div>
                      <div className="text-[10px] text-muted-foreground">{code.relevance}</div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Facility Type Selector */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="mb-10"
      >
        <div className="flex overflow-x-auto pb-2 gap-2 sm:gap-3 scrollbar-hide snap-x snap-mandatory md:flex-wrap md:justify-center md:overflow-visible md:pb-0">
          {facilityButtons.map((type) => (
            <button
              key={type.id}
              onClick={() => setActiveFacilityType(type.id)}
              className={`flex-shrink-0 snap-start flex items-center gap-2 sm:gap-3 px-3 sm:px-5 py-3 rounded-xl transition-all min-w-[120px] ${
                activeFacilityType === type.id
                  ? 'bg-[hsl(var(--watt-bitcoin))] text-white shadow-lg shadow-[hsl(var(--watt-bitcoin)/0.3)]'
                  : 'bg-card border border-border hover:border-[hsl(var(--watt-bitcoin)/0.5)]'
              }`}
            >
              <type.icon className="w-5 h-5 flex-shrink-0" />
              <div className="text-left">
                <div className="font-semibold text-sm whitespace-nowrap">
                  <span className="sm:hidden">{type.shortName}</span>
                  <span className="hidden sm:inline">{type.name}</span>
                </div>
                <div className={`text-xs whitespace-nowrap ${activeFacilityType === type.id ? 'text-white/70' : 'text-muted-foreground'}`}>
                  {type.capacity}
                </div>
              </div>
            </button>
          ))}
        </div>
      </motion.div>

      {/* Active Facility Details */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeFacilityType}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="grid lg:grid-cols-2 gap-6 mb-12"
        >
          {/* Image */}
          <div className="relative aspect-video md:h-96 md:aspect-auto rounded-2xl overflow-hidden">
            <img 
              src={currentFacility.image} 
              alt={currentFacility.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-6">
              <h3 className="text-2xl font-bold text-white mb-1">{currentFacility.name}</h3>
              <p className="text-white/70 text-sm mb-3">{currentFacility.subtitle}</p>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 bg-[hsl(var(--watt-bitcoin)/0.9)] text-white rounded text-sm font-medium">
                  {currentFacility.buildTime.total} total
                </span>
                <span className="px-3 py-1 bg-white/20 text-white rounded text-sm">
                  {currentFacility.capex.typical}
                </span>
              </div>
            </div>
          </div>

          {/* Details Panel */}
          <div className="bg-card rounded-2xl border border-border p-6 overflow-auto max-h-[400px] md:max-h-none">
            <p className="text-muted-foreground mb-4">{currentFacility.description}</p>
            
            {/* Timeline Breakdown */}
            <div className="mb-6">
              <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                <Clock className="w-4 h-4 text-[hsl(var(--watt-bitcoin))]" />
                Timeline Breakdown
              </h4>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(currentFacility.buildTime).filter(([key]) => key !== 'total').map(([phase, duration]) => (
                  <div key={phase} className="p-2 bg-muted/50 rounded text-sm">
                    <span className="text-muted-foreground capitalize">{phase}: </span>
                    <span className="text-foreground font-medium">{duration}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Cost Range */}
            <div className="mb-6 p-4 bg-[hsl(var(--watt-bitcoin)/0.1)] rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-foreground">CapEx Range</span>
                <DataQualityBadge quality="estimate" />
              </div>
              <div className="text-2xl font-bold text-[hsl(var(--watt-bitcoin))]">
                {currentFacility.capex.low} – {currentFacility.capex.high}
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Typical: {currentFacility.capex.typical}
              </p>
              <div className="flex flex-wrap gap-1 mt-2">
                {currentFacility.capex.factors.map((factor, i) => (
                  <span key={i} className="px-2 py-0.5 bg-background rounded text-xs text-muted-foreground">
                    {factor}
                  </span>
                ))}
              </div>
            </div>

            {/* Best For */}
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg mb-4">
              <span className="text-sm font-medium text-emerald-700">Best for: </span>
              <span className="text-sm text-emerald-600">{currentFacility.bestFor}</span>
            </div>

            {/* Advantages/Disadvantages */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="text-xs font-semibold text-emerald-600 mb-2">Advantages</h4>
                <ul className="space-y-1">
                  {currentFacility.advantages.map((adv, i) => (
                    <li key={i} className="text-xs text-muted-foreground flex items-start gap-1">
                      <CheckCircle className="w-3 h-3 text-emerald-500 flex-shrink-0 mt-0.5" />
                      {adv}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="text-xs font-semibold text-amber-600 mb-2">Considerations</h4>
                <ul className="space-y-1">
                  {currentFacility.disadvantages.map((dis, i) => (
                    <li key={i} className="text-xs text-muted-foreground flex items-start gap-1">
                      <AlertTriangle className="w-3 h-3 text-amber-500 flex-shrink-0 mt-0.5" />
                      {dis}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Space Allocation Layout */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="bg-card rounded-2xl border border-border p-6 mb-12"
      >
        <h3 className="text-xl font-bold text-foreground mb-6">Space Allocation: {currentFacility.name}</h3>
        <div className="space-y-4">
          {currentFacility.layout.map((area, i) => (
            <div key={area.name} className="flex items-center gap-4">
              <div className="w-36 text-sm font-medium text-foreground">{area.name}</div>
              <div className="flex-1">
                <div className="relative h-8 bg-muted rounded-full overflow-hidden">
                  <motion.div 
                    className="absolute inset-y-0 left-0 bg-gradient-to-r from-[hsl(var(--watt-bitcoin))] to-[hsl(var(--watt-bitcoin)/0.7)] rounded-full flex items-center justify-end pr-3"
                    initial={{ width: 0 }}
                    whileInView={{ width: `${area.percentage}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, delay: i * 0.1 }}
                  >
                    <span className="text-xs font-bold text-white">{area.percentage}%</span>
                  </motion.div>
                </div>
              </div>
              <div className="w-48 text-xs text-muted-foreground hidden md:block">{area.description}</div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Key Insight */}
      <DCEKeyInsight variant="insight" className="mb-8">
        The optimal facility type depends on your constraints: if time-to-market is critical, containers 
        deploy 5× faster; if $/kW matters most, steel buildings cost 40-50% less at scale; if you need 
        flexibility to relocate, only containers make sense.
      </DCEKeyInsight>

      {/* Comparison Table */}
      <DCEDeepDive title="Facility Type Comparison Matrix" icon={Building2} className="mb-12">
        <div className="relative">
          <div className="overflow-x-auto pb-2 scrollbar-hide">
            <table className="w-full text-sm min-w-[600px]">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-3 font-medium text-foreground min-w-[140px]">Metric</th>
                  <th className="text-center py-3 px-3 font-medium text-foreground min-w-[100px]">Steel Building</th>
                  <th className="text-center py-3 px-3 font-medium text-foreground min-w-[100px]">Container</th>
                  <th className="text-center py-3 px-3 font-medium text-foreground min-w-[100px]">Prefab Modular</th>
                </tr>
              </thead>
              <tbody>
                {comparisonMetrics.map((row) => (
                  <tr key={row.metric} className="border-b border-border/50 hover:bg-muted/30">
                    <td className="py-3 px-3">
                      <div className="font-medium text-foreground">{row.metric}</div>
                      <div className="text-xs text-muted-foreground">{row.note}</div>
                    </td>
                    <td className={`py-3 px-3 text-center ${row.best === 'warehouse' ? 'text-[hsl(var(--watt-bitcoin))] font-semibold' : 'text-muted-foreground'}`}>
                      {row.best === 'warehouse' && <CheckCircle className="w-4 h-4 inline mr-1" />}
                      {row.warehouse}
                    </td>
                    <td className={`py-3 px-3 text-center ${row.best === 'container' ? 'text-[hsl(var(--watt-bitcoin))] font-semibold' : 'text-muted-foreground'}`}>
                      {row.best === 'container' && <CheckCircle className="w-4 h-4 inline mr-1" />}
                      {row.container}
                    </td>
                    <td className={`py-3 px-3 text-center ${row.best === 'modular' ? 'text-[hsl(var(--watt-bitcoin))] font-semibold' : 'text-muted-foreground'}`}>
                      {row.best === 'modular' && <CheckCircle className="w-4 h-4 inline mr-1" />}
                      {row.modular}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="absolute top-0 right-0 bottom-2 w-8 bg-gradient-to-l from-card to-transparent pointer-events-none md:hidden" />
        </div>
      </DCEDeepDive>

      {/* Civil Requirements */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
      >
        <h3 className="text-xl font-bold text-foreground mb-6">Site Civil Requirements</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {civilRequirements.map((req, index) => (
            <motion.div
              key={req.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
              className="bg-card rounded-xl border border-border p-4 hover:border-[hsl(var(--watt-bitcoin)/0.5)] hover:shadow-lg transition-all duration-300"
            >
              <req.icon className="w-8 h-8 text-[hsl(var(--watt-bitcoin))] mb-3" />
              <div className="font-semibold text-foreground text-sm mb-1">{req.name}</div>
              <div className="text-xs text-muted-foreground mb-2">{req.description}</div>
              <div className="text-[10px] text-muted-foreground italic">{req.detail}</div>
              <div className="text-[9px] text-muted-foreground mt-2 px-2 py-1 bg-muted rounded inline-block">
                {req.code}
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      <SectionSummary
        takeaways={[
          "Steel buildings offer lowest $/kW ($150-300) but require 18-24 months lead time",
          "Containers deploy in 3-5 months but cost 40-60% more per kW",
          "Floor loads of 100+ psf are required for high-density ASIC deployments",
          "Permitting can add 2-12+ months depending on jurisdiction — start early",
          "Facility choice depends on constraints: time, capital, flexibility, and power certainty"
        ]}
        nextSteps={[
          { title: "Airflow & Containment", href: "#airflow", description: "Learn hot/cold aisle strategies and thermal management" }
        ]}
        proTip="For uncertain power situations (new PPA negotiations, BTM sites), start with containers. You can always build permanent infrastructure once power is locked in — but you can't unbuild a warehouse if the power deal falls through."
      />
    </DCESectionWrapper>
  );
};

export default FacilityDesignSection;
