import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Server, Zap, Wind, Shield, Gauge, Users, MapPin, CheckCircle, Droplets, Waves, Thermometer, Box, Building2, Fan, Cable, Monitor, Info } from 'lucide-react';
import LearningObjectives from '@/components/academy/LearningObjectives';
import SectionSummary from '@/components/academy/SectionSummary';
import { DCESectionWrapper, DCESectionHeader, DCEContentCard, DCEKeyInsight, DCEDeepDive } from './shared';
import warehouseAirCooled from '@/assets/warehouse-air-cooled-facility.jpg';
import containerHydro from '@/assets/container-hydro-facility.jpg';
import containerImmersion from '@/assets/container-immersion-facility.jpg';

type FacilityType = 'air' | 'hydro' | 'immersion';

interface FacilityZone {
  id: string;
  name: string;
  icon: React.ElementType;
  color: string;
  position: { left: string; top: string; width: string; height: string };
  description: string;
  specs: string[];
}

const InteractiveFacilityTour = () => {
  const [activeZone, setActiveZone] = useState<string | null>(null);
  const [exploredZones, setExploredZones] = useState<Set<string>>(new Set());
  const [facilityType, setFacilityType] = useState<FacilityType>('air');

  // Engineering-accurate facility configurations
  const facilityConfigs = {
    air: {
      name: 'Warehouse Air-Cooled Facility',
      subtitle: 'Alberta Heartland 135MW - 20,000 sqft Steel Building',
      image: warehouseAirCooled,
      layoutType: 'warehouse',
      pue: '1.15-1.25',
      capacity: '135 MW',
      uptime: '95%',
      cooling: 'Exhaust Fan Walls + Free Cooling',
      keyStats: [
        { label: 'Building Size', value: '20,000 sqft' },
        { label: 'Land', value: '26 acres' },
        { label: 'Miners', value: '~38,400' },
        { label: 'CAPEX', value: 'Lowest' },
      ],
      zones: [
        {
          id: 'main-substation',
          name: 'Main Substation',
          icon: Zap,
          color: 'bg-yellow-500',
          position: { left: '2%', top: '60%', width: '12%', height: '35%' },
          description: 'Primary 138kV to 25kV step-down transformer yard with SF6 breakers, protective relaying, and SCADA monitoring.',
          specs: ['138kV/25kV step-down', '100 MVA capacity', 'SF6 circuit breakers', 'SCADA monitored 24/7', 'N configuration', 'Metering class CTs/PTs'],
        },
        {
          id: 'unit-substations',
          name: 'Unit Substations',
          icon: Gauge,
          color: 'bg-orange-500',
          position: { left: '2%', top: '20%', width: '12%', height: '38%' },
          description: 'Dry-type cast-resin transformers stepping 25kV to 600V for distribution to mining pods.',
          specs: ['25kV/600V step-down', '2,500 kVA each', '18 units total', 'Cast-resin insulated', 'Less than 65°C rise', '99.2% efficiency'],
        },
        {
          id: 'mining-pod-a',
          name: 'Mining Pod A',
          icon: Server,
          color: 'bg-[hsl(var(--watt-bitcoin))]',
          position: { left: '16%', top: '10%', width: '22%', height: '75%' },
          description: 'Primary mining floor with hot/cold aisle containment. 12,800 ASICs at 150 TH/s each generating 1.92 EH/s.',
          specs: ['IT Load: 45 MW', 'Miners: ~12,800 units', 'Hot Aisle: 130-180°F', 'Cold Aisle: 65-80°F', 'Airflow: 1.05M CFM', 'Hashrate: 1.92 EH/s'],
        },
        {
          id: 'mining-pod-b',
          name: 'Mining Pod B',
          icon: Server,
          color: 'bg-[hsl(var(--watt-bitcoin))]',
          position: { left: '40%', top: '10%', width: '22%', height: '75%' },
          description: 'Secondary mining floor mirroring Pod A with independent power feeds and PDUs for fault isolation.',
          specs: ['IT Load: 45 MW', 'Miners: ~12,800 units', 'Independent PDU feeds', 'Separate electrical room', 'Load balanced with Pod A', 'Hashrate: 1.92 EH/s'],
        },
        {
          id: 'mining-pod-c',
          name: 'Mining Pod C',
          icon: Server,
          color: 'bg-[hsl(var(--watt-bitcoin))]',
          position: { left: '64%', top: '10%', width: '18%', height: '75%' },
          description: 'Tertiary mining floor completing the 135MW total capacity with expansion-ready infrastructure.',
          specs: ['IT Load: 45 MW', 'Miners: ~12,800 units', 'Expansion-ready conduits', 'Spare PDU capacity', 'Hashrate: 1.92 EH/s'],
        },
        {
          id: 'exhaust-fan-wall',
          name: 'Exhaust Fan Wall',
          icon: Fan,
          color: 'bg-cyan-500',
          position: { left: '84%', top: '10%', width: '14%', height: '50%' },
          description: 'Industrial exhaust fans sized for 3.412 BTU/hr per watt of IT load. VFD controlled for efficiency.',
          specs: ['Fan Count: 48× 72" fans', 'CFM Each: 65,000 CFM', 'Total: 3.12M CFM', 'VFD Controlled', 'Static Pressure: 0.5" WC', 'Evap Cooling: Optional'],
        },
        {
          id: 'noc-security',
          name: 'NOC & Security',
          icon: Monitor,
          color: 'bg-purple-500',
          position: { left: '84%', top: '62%', width: '14%', height: '33%' },
          description: '24/7 Network Operations Center with DCIM software monitoring power, temps, and hashrate.',
          specs: ['24/7 staffed (3 shifts)', 'DCIM: Vertiv/Nlyte', 'Fiber redundancy', '100+ CCTV cameras', 'Biometric + card access', 'Perimeter fence + guards'],
        },
      ] as FacilityZone[],
    },
    hydro: {
      name: 'Modular Container Hydro-Cooled',
      subtitle: '40ft Shipping Containers with RDHX Cooling',
      image: containerHydro,
      layoutType: 'container',
      pue: '1.15-1.30',
      capacity: '10-50 MW',
      uptime: '99%',
      cooling: 'Chilled Water + Rear-Door Heat Exchangers',
      keyStats: [
        { label: 'Container Size', value: '40ft ISO' },
        { label: 'Per Container', value: '1 MW / 280 miners' },
        { label: 'Scalable', value: '10-50 containers' },
        { label: 'Deploy Time', value: '4-6 weeks' },
      ],
      zones: [
        {
          id: 'container-row-1',
          name: 'Container Row 1',
          icon: Box,
          color: 'bg-[hsl(var(--watt-bitcoin))]',
          position: { left: '5%', top: '12%', width: '40%', height: '22%' },
          description: '40ft ISO containers with integrated RDHX cooling. Each container is a self-contained mining unit.',
          specs: ['Containers: 5× 40ft ISO', 'Per Container: 1 MW IT', 'Miners/Container: 280', 'RDHX: 40kW capacity each', 'Supply Water: 45°F', 'GPM per Container: 24'],
        },
        {
          id: 'container-row-2',
          name: 'Container Row 2',
          icon: Box,
          color: 'bg-[hsl(var(--watt-bitcoin))]',
          position: { left: '5%', top: '66%', width: '40%', height: '22%' },
          description: 'Second row of mining containers on independent chilled water loop for redundancy.',
          specs: ['Containers: 5× 40ft ISO', 'Total Row: 5 MW IT', 'Independent CW loop', 'Isolation valves per container', 'Manifold connection'],
        },
        {
          id: 'chilled-water-supply',
          name: 'Chilled Water Loop',
          icon: Droplets,
          color: 'bg-blue-500',
          position: { left: '5%', top: '36%', width: '40%', height: '12%' },
          description: 'Supply and return chilled water headers connecting containers to central cooling plant.',
          specs: ['Supply: 45°F (7°C)', 'Return: 55°F (13°C)', 'ΔT: 10°F design', 'Pipe Size: 8" headers', 'Insulated + jacketed', 'Flow meters per branch'],
        },
        {
          id: 'dry-coolers',
          name: 'Dry Cooler Array',
          icon: Wind,
          color: 'bg-cyan-500',
          position: { left: '50%', top: '12%', width: '22%', height: '76%' },
          description: 'Outdoor dry coolers rejecting heat from chilled water loop. Glycol mix for freeze protection.',
          specs: ['Units: 4× 2.5 MW each', 'Total Rejection: 10 MW', 'Fluid: 30% Glycol mix', 'Approach: 15°F to ambient', 'EC fans: VFD controlled', 'Winter Free Cooling: Yes'],
        },
        {
          id: 'power-substation',
          name: 'Power Substation',
          icon: Zap,
          color: 'bg-yellow-500',
          position: { left: '75%', top: '12%', width: '22%', height: '35%' },
          description: 'Compact outdoor substation sized for container deployment.',
          specs: ['15kV/480V step-down', '10 MVA capacity', 'Pad-mount transformer', 'Fused disconnect', 'Expansion to 25 MVA'],
        },
        {
          id: 'control-building',
          name: 'Control & NOC',
          icon: Monitor,
          color: 'bg-purple-500',
          position: { left: '75%', top: '53%', width: '22%', height: '35%' },
          description: 'Central control building housing NOC, electrical rooms, and security.',
          specs: ['20ft control container', 'MCC switchgear', 'BMS/DCIM systems', 'Remote monitoring', '24/7 staffed optional'],
        },
      ] as FacilityZone[],
    },
    immersion: {
      name: 'Modular Container Immersion',
      subtitle: '40ft Containers with Dielectric Fluid Cooling',
      image: containerImmersion,
      layoutType: 'container',
      pue: '1.02-1.08',
      capacity: '10-20 MW',
      uptime: '99.5%',
      cooling: 'Single-Phase Dielectric Immersion',
      keyStats: [
        { label: 'Container Size', value: '40ft ISO' },
        { label: 'Per Container', value: '1-2 MW' },
        { label: 'Overclock', value: '+30% hashrate' },
        { label: 'Water Usage', value: '0 L/kWh' },
      ],
      zones: [
        {
          id: 'immersion-row-a',
          name: 'Immersion Container Row A',
          icon: Waves,
          color: 'bg-purple-500',
          position: { left: '3%', top: '12%', width: '45%', height: '28%' },
          description: 'Immersion tanks filled with dielectric fluid. Miners fully submerged for direct liquid contact cooling.',
          specs: ['Containers: 5× 40ft', 'Tanks per Container: 4', 'Tank Volume: 2,000L each', 'Fluid: EC-110', 'Overclock: +30% hashrate', 'Fluid Temp: 104-122°F'],
        },
        {
          id: 'immersion-row-b',
          name: 'Immersion Container Row B',
          icon: Waves,
          color: 'bg-purple-500',
          position: { left: '3%', top: '60%', width: '45%', height: '28%' },
          description: 'Second row of immersion containers with independent cooling loop.',
          specs: ['Containers: 5× 40ft', 'Total Miners: 400 units', 'Independent CDU loop', 'Fluid fill: 40,000L total', 'Total: 5-10 MW'],
        },
        {
          id: 'cdu-array',
          name: 'Cooling Distribution Units',
          icon: Thermometer,
          color: 'bg-cyan-500',
          position: { left: '52%', top: '12%', width: '22%', height: '76%' },
          description: 'CDUs pump dielectric fluid through external heat exchangers. No water in cooling loop.',
          specs: ['CDUs: 4× 2.5 MW each', 'Fluid Flow: 200 GPM each', 'Heat Rejection: Dry coolers', 'Glycol Secondary Loop', 'WUE: 0.0 L/kWh', 'Zero evaporative loss'],
        },
        {
          id: 'fluid-management',
          name: 'Fluid Management',
          icon: Droplets,
          color: 'bg-blue-500',
          position: { left: '77%', top: '12%', width: '20%', height: '35%' },
          description: 'Dielectric fluid storage, filtration, and quality monitoring systems.',
          specs: ['Storage: 10,000L reserve', 'Filtration: 1 micron', 'Breakdown monitoring', 'Auto top-up system', 'Fluid life: 10+ years'],
        },
        {
          id: 'power-and-control',
          name: 'Power & Control',
          icon: Zap,
          color: 'bg-yellow-500',
          position: { left: '77%', top: '53%', width: '20%', height: '35%' },
          description: 'Electrical distribution and BMS controls for immersion facility.',
          specs: ['PDUs: 480V 3-phase', 'PLC controls', 'Leak detection system', 'Fire suppression: Inert gas', 'Remote DCIM monitoring'],
        },
      ] as FacilityZone[],
    },
  };

  // Commissioning Phases (Industry Standard)
  const commissioningPhases = [
    {
      phase: 'Phase 1: Pre-Commissioning',
      duration: '2-4 weeks',
      description: 'Verify all equipment installed per drawings, megger testing, visual inspection',
      activities: [
        'Punch list walkthrough with contractor',
        'Megger test all cables (>1 MΩ/kV)',
        'Torque check on all connections',
        'Clean equipment and remove debris',
        'Verify nameplate ratings match design',
      ],
      gatekeeper: 'All punch items resolved before energization',
    },
    {
      phase: 'Phase 2: Energization',
      duration: '1-2 weeks',
      description: 'Step-by-step energization from utility POI to distribution',
      activities: [
        'Utility interconnection agreement signed',
        'Energize main substation (under utility supervision)',
        'Test protective relays with secondary injection',
        'Energize unit subs one at a time',
        'Verify voltages at all distribution points',
      ],
      gatekeeper: 'All protective devices tested and set correctly',
    },
    {
      phase: 'Phase 3: Mechanical Commissioning',
      duration: '1-2 weeks',
      description: 'Start cooling systems, balance airflow, verify thermal performance',
      activities: [
        'Start pumps and fans on VFDs',
        'Balance water flow per design GPM',
        'Verify air velocities with anemometer',
        'Run heat load test (staged)',
        'Adjust VFD setpoints for efficiency',
      ],
      gatekeeper: 'Cooling capacity verified at design load',
    },
    {
      phase: 'Phase 4: IT Load Testing',
      duration: '2-4 weeks',
      description: 'Stage miner deployment, validate power and cooling at each step',
      activities: [
        'Deploy 25% load, run 48 hrs stable',
        'Deploy 50% load, verify temps',
        'Deploy 75% load, check for hot spots',
        'Deploy 100% load, 72-hr burn-in',
        'Document steady-state metrics',
      ],
      gatekeeper: 'All zones at design temperature under full load',
    },
    {
      phase: 'Phase 5: Handoff & Training',
      duration: '1 week',
      description: 'Transfer operations to site team, training and documentation',
      activities: [
        'O&M manual delivery',
        'Operator training (DCIM, BMS, safety)',
        'Emergency procedure walkthrough',
        'Spare parts inventory handoff',
        'Warranty documentation',
      ],
      gatekeeper: 'Site team signed off on training',
    },
  ];

  // Safety & Egress Considerations
  const safetyEgress = {
    exitRequirements: {
      name: 'Emergency Egress (IBC/NFPA 101)',
      requirements: [
        { rule: 'Max travel distance', spec: '200 ft (unsprinklered) / 250 ft (sprinklered) to nearest exit' },
        { rule: 'Exit width', spec: '0.2 in per occupant (min 32" clear)' },
        { rule: 'Two exits required', spec: 'If occupant load > 50 or travel distance > 75 ft' },
        { rule: 'Exit signage', spec: 'Illuminated EXIT signs, emergency lighting on battery backup' },
        { rule: 'Door swing', spec: 'Outward swing in direction of egress for high-occupancy areas' },
      ],
    },
    arcFlashZones: {
      name: 'Arc Flash Boundaries (NFPA 70E)',
      zones: [
        { boundary: 'Prohibited Approach', distance: '< 1 inch', ppe: 'PPE Cat 4 + specialized training' },
        { boundary: 'Restricted Approach', distance: '< 12 inches', ppe: 'PPE Cat 3-4, qualified only' },
        { boundary: 'Limited Approach', distance: '3.5 ft (480V)', ppe: 'PPE Cat 2, shock hazard training' },
        { boundary: 'Arc Flash Boundary', distance: 'Per study (6-20 ft typical)', ppe: 'Rated PPE required beyond' },
      ],
    },
    lockoutTagout: {
      name: 'LOTO Procedures (OSHA 1910.147)',
      steps: [
        'Notify affected employees of shutdown',
        'Identify all energy sources (electrical, mechanical, pneumatic)',
        'Isolate equipment from energy sources',
        'Apply lockout/tagout devices',
        'Verify zero energy state (try to start)',
        'Perform maintenance work',
        'Remove LOTO devices, notify personnel, restore power',
      ],
    },
    fireProtection: {
      name: 'Fire Protection Systems',
      systems: [
        { type: 'VESDA (Very Early Smoke Detection)', location: 'Mining floor, electrical rooms', response: 'Pre-alarm notification' },
        { type: 'Sprinkler (Wet/Dry)', location: 'General areas, offices', response: 'Water suppression' },
        { type: 'Clean Agent (FM-200/Novec)', location: 'Electrical rooms, immersion areas', response: 'Non-damaging suppression' },
        { type: 'Fire Extinguishers', location: 'Every 75 ft, CO2/dry chem near electrical', response: 'Manual suppression' },
      ],
    },
  };

  // Walkthrough Modes
  const walkthroughModes = [
    {
      mode: 'Investor Tour',
      duration: '30-45 min',
      focus: 'High-level overview, key metrics, security',
      path: ['NOC & Security', 'Main Substation', 'Mining Pod A (observation)', 'Cooling overview'],
      restrictions: 'No photography near equipment, hard hats required in active areas',
    },
    {
      mode: 'Technical Due Diligence',
      duration: '2-4 hours',
      focus: 'Detailed equipment inspection, documentation review',
      path: ['Full substation walkdown', 'All mining pods', 'Cooling plant', 'Electrical rooms', 'BMS/DCIM demo'],
      restrictions: 'NDA required, escort at all times, PPE required',
    },
    {
      mode: 'Operator Training',
      duration: '8+ hours (multi-day)',
      focus: 'Hands-on system operation, emergency procedures',
      path: ['All zones covered', 'Control room training', 'Emergency drills', 'LOTO practice'],
      restrictions: 'Full PPE, safety training prerequisite',
    },
  ];

  const currentFacility = facilityConfigs[facilityType];
  const facilityZones = currentFacility.zones;

  const handleZoneClick = (zoneId: string) => {
    setActiveZone(activeZone === zoneId ? null : zoneId);
    setExploredZones(prev => new Set([...prev, zoneId]));
  };

  const activeZoneData = facilityZones.find(z => z.id === activeZone);
  const explorationProgress = (exploredZones.size / facilityZones.length) * 100;

  return (
    <DCESectionWrapper theme="accent" id="facility-tour">
      <LearningObjectives
        objectives={[
          "Compare three facility types: warehouse air-cooled, container hydro, and container immersion",
          "Understand zone layouts: substation, mining floor, cooling, control room",
          "Learn capacity, PUE, and uptime characteristics of each architecture",
          "Know when to choose warehouse vs modular container deployment"
        ]}
        estimatedTime="10 min"
        prerequisites={[
          { title: "Cooling Systems", href: "#cooling" }
        ]}
      />
      
      <DCESectionHeader
        badge="Section 9 • Virtual Walkthrough"
        badgeIcon={Building2}
        title="Interactive Facility Tour"
        description="Explore warehouse-style and modular container datacenter architectures with professional engineering layouts"
        theme="light"
      />

      {/* Facility Type Selector */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="flex flex-wrap justify-center gap-3 mb-8"
      >
        {[
          { id: 'air' as FacilityType, name: 'Air-Cooled Warehouse', icon: Building2, desc: '135MW Steel Building' },
          { id: 'hydro' as FacilityType, name: 'Hydro Container', icon: Box, desc: '40ft RDHX Containers' },
          { id: 'immersion' as FacilityType, name: 'Immersion Container', icon: Waves, desc: '40ft Dielectric Tanks' },
        ].map((type) => (
          <button
            key={type.id}
            onClick={() => {
              setFacilityType(type.id);
              setActiveZone(null);
              setExploredZones(new Set());
            }}
            className={`flex items-center gap-3 px-5 py-3 rounded-xl border transition-all ${
              facilityType === type.id
                ? 'bg-[hsl(var(--watt-bitcoin))] text-white border-[hsl(var(--watt-bitcoin))] shadow-lg shadow-[hsl(var(--watt-bitcoin)/0.3)]'
                : 'bg-card border-border hover:border-[hsl(var(--watt-bitcoin)/0.5)]'
            }`}
          >
            <type.icon className="w-5 h-5" />
            <div className="text-left">
              <div className="font-semibold text-sm">{type.name}</div>
              <div className={`text-xs ${facilityType === type.id ? 'text-white/70' : 'text-muted-foreground'}`}>
                {type.desc}
              </div>
            </div>
          </button>
        ))}
      </motion.div>

      {/* Facility Image Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.15 }}
        className="relative rounded-2xl overflow-hidden mb-6 h-48 md:h-64 border border-border"
      >
        <img 
          src={currentFacility.image} 
          alt={currentFacility.name} 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[hsl(var(--watt-navy)/0.9)] via-[hsl(var(--watt-navy)/0.6)] to-transparent" />
        <div className="absolute inset-0 flex items-center p-6 md:p-8">
          <div className="text-white max-w-lg">
            <h3 className="text-xl md:text-2xl font-bold mb-2">{currentFacility.name}</h3>
            <p className="text-white/70 text-sm mb-4">{currentFacility.subtitle}</p>
            <div className="flex flex-wrap gap-3">
              <span className="px-3 py-1 bg-[hsl(var(--watt-bitcoin)/0.9)] text-white rounded-full text-xs font-medium">
                PUE: {currentFacility.pue}
              </span>
              <span className="px-3 py-1 bg-white/20 text-white rounded text-xs">
                {currentFacility.capacity}
              </span>
              <span className="px-3 py-1 bg-white/20 text-white rounded text-xs">
                {currentFacility.uptime} Uptime
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Key Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8"
      >
        {currentFacility.keyStats.map((stat) => (
          <div key={stat.label} className="bg-card rounded-xl border border-border p-4 text-center">
            <div className="text-lg font-bold text-[hsl(var(--watt-bitcoin))]">{stat.value}</div>
            <div className="text-xs text-muted-foreground">{stat.label}</div>
          </div>
        ))}
      </motion.div>

      {/* Exploration Progress */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.25 }}
        className="mb-6"
      >
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="text-muted-foreground">Exploration Progress</span>
          <span className="font-medium text-foreground">{exploredZones.size}/{facilityZones.length} zones</span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div 
            className="h-full bg-[hsl(var(--watt-bitcoin))] rounded-full transition-all duration-500"
            style={{ width: `${explorationProgress}%` }}
          />
        </div>
      </motion.div>

      {/* Interactive Layout */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="mb-8"
      >
        <DCEContentCard variant="elevated">
          <div className="flex items-center gap-2 mb-4">
            <Info className="w-4 h-4 text-[hsl(var(--watt-bitcoin))]" />
            <span className="text-sm text-muted-foreground">Click on zones to explore facility components</span>
          </div>
          
          {/* Layout Grid */}
          <div className="relative bg-muted/30 rounded-xl border border-border aspect-[16/9] overflow-hidden">
            {facilityZones.map((zone) => (
              <button
                key={zone.id}
                onClick={() => handleZoneClick(zone.id)}
                style={{
                  position: 'absolute',
                  left: zone.position.left,
                  top: zone.position.top,
                  width: zone.position.width,
                  height: zone.position.height,
                }}
                className={`rounded-lg border-2 transition-all flex flex-col items-center justify-center p-2 ${
                  activeZone === zone.id
                    ? 'border-[hsl(var(--watt-bitcoin))] bg-[hsl(var(--watt-bitcoin)/0.2)] shadow-lg'
                    : exploredZones.has(zone.id)
                    ? 'border-green-500/50 bg-green-500/10 hover:bg-green-500/20'
                    : 'border-border bg-background/80 hover:border-[hsl(var(--watt-bitcoin)/0.5)] hover:bg-muted/50'
                }`}
              >
                <zone.icon className={`w-4 h-4 md:w-6 md:h-6 mb-1 ${
                  activeZone === zone.id ? 'text-[hsl(var(--watt-bitcoin))]' : 'text-muted-foreground'
                }`} />
                <span className={`text-[8px] md:text-xs font-medium text-center leading-tight ${
                  activeZone === zone.id ? 'text-[hsl(var(--watt-bitcoin))]' : 'text-foreground'
                }`}>
                  {zone.name}
                </span>
                {exploredZones.has(zone.id) && activeZone !== zone.id && (
                  <CheckCircle className="w-3 h-3 text-green-500 absolute top-1 right-1" />
                )}
              </button>
            ))}
          </div>
        </DCEContentCard>
      </motion.div>

      {/* Active Zone Details */}
      {activeZoneData && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-8"
        >
          <DCEContentCard variant="bordered">
            <div className="flex items-start gap-4">
              <div className={`p-3 rounded-xl ${activeZoneData.color}/20`}>
                <activeZoneData.icon className={`w-6 h-6 ${activeZoneData.color.replace('bg-', 'text-').replace('[hsl(var(--watt-bitcoin))]', '[hsl(var(--watt-bitcoin))]')}`} />
              </div>
              <div className="flex-1">
                <h4 className="text-lg font-bold text-foreground mb-2">{activeZoneData.name}</h4>
                <p className="text-muted-foreground mb-4">{activeZoneData.description}</p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {activeZoneData.specs.map((spec, i) => (
                    <div key={i} className="px-3 py-2 bg-muted/50 rounded-lg text-xs text-foreground border border-border">
                      {spec}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </DCEContentCard>
        </motion.div>
      )}

      {/* Commissioning Phases */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.35 }}
        className="mb-8"
      >
        <DCEDeepDive title="Commissioning Phases (Industry Standard)" icon={CheckCircle}>
          <div className="space-y-4">
            {commissioningPhases.map((phase, index) => (
              <div key={phase.phase} className="bg-muted/30 rounded-xl p-4 border border-border">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-[hsl(var(--watt-bitcoin))] text-white flex items-center justify-center text-sm font-bold flex-shrink-0">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-bold text-foreground">{phase.phase}</h4>
                      <span className="text-xs px-2 py-0.5 bg-muted rounded text-muted-foreground">{phase.duration}</span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">{phase.description}</p>
                    <div className="space-y-1 mb-3">
                      {phase.activities.map((activity, i) => (
                        <div key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                          <span className="text-[hsl(var(--watt-bitcoin))]">•</span>
                          <span>{activity}</span>
                        </div>
                      ))}
                    </div>
                    <div className="text-xs bg-yellow-500/10 text-yellow-600 rounded-lg px-3 py-2 border border-yellow-500/20">
                      <strong>Gate:</strong> {phase.gatekeeper}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </DCEDeepDive>
      </motion.div>

      {/* Safety & Egress */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="mb-8"
      >
        <DCEContentCard variant="bordered">
          <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
            <Shield className="w-5 h-5 text-[hsl(var(--watt-bitcoin))]" />
            Safety & Egress Considerations
          </h3>
          
          <div className="space-y-4">
            {/* Exit Requirements */}
            <div className="bg-muted/30 rounded-xl p-4 border border-border">
              <h4 className="font-semibold text-foreground mb-3">{safetyEgress.exitRequirements.name}</h4>
              <div className="space-y-2">
                {safetyEgress.exitRequirements.requirements.map((req) => (
                  <div key={req.rule} className="flex items-start gap-3 text-xs">
                    <span className="font-medium text-foreground min-w-[140px]">{req.rule}:</span>
                    <span className="text-muted-foreground">{req.spec}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Arc Flash Zones */}
            <div className="bg-muted/30 rounded-xl p-4 border border-border">
              <h4 className="font-semibold text-foreground mb-3">{safetyEgress.arcFlashZones.name}</h4>
              <div className="space-y-2">
                {safetyEgress.arcFlashZones.zones.map((zone) => (
                  <div key={zone.boundary} className="flex items-center justify-between px-3 py-2 bg-background rounded-lg border border-border text-xs">
                    <div className="flex items-center gap-3">
                      <span className={`w-3 h-3 rounded-full ${
                        zone.boundary === 'Prohibited Approach' ? 'bg-red-500' :
                        zone.boundary === 'Restricted Approach' ? 'bg-orange-500' :
                        zone.boundary === 'Limited Approach' ? 'bg-yellow-500' : 'bg-blue-500'
                      }`} />
                      <span className="font-medium text-foreground">{zone.boundary}</span>
                    </div>
                    <span className="text-muted-foreground">{zone.distance}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* LOTO Procedure */}
            <div className="bg-muted/30 rounded-xl p-4 border border-border">
              <h4 className="font-semibold text-foreground mb-3">{safetyEgress.lockoutTagout.name}</h4>
              <div className="flex flex-wrap gap-2">
                {safetyEgress.lockoutTagout.steps.map((step, i) => (
                  <div key={i} className="flex items-center gap-2 px-3 py-1.5 bg-background rounded-lg border border-border text-xs">
                    <span className="w-5 h-5 rounded-full bg-[hsl(var(--watt-bitcoin))] text-white flex items-center justify-center text-[10px] font-bold">{i + 1}</span>
                    <span className="text-muted-foreground">{step}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Fire Protection */}
            <div className="bg-muted/30 rounded-xl p-4 border border-border">
              <h4 className="font-semibold text-foreground mb-3">{safetyEgress.fireProtection.name}</h4>
              <div className="grid md:grid-cols-2 gap-2">
                {safetyEgress.fireProtection.systems.map((system) => (
                  <div key={system.type} className="px-3 py-2 bg-background rounded-lg border border-border text-xs">
                    <div className="font-medium text-foreground mb-0.5">{system.type}</div>
                    <div className="text-muted-foreground">{system.location}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </DCEContentCard>
      </motion.div>

      {/* Walkthrough Modes */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.45 }}
        className="mb-8"
      >
        <DCEContentCard variant="elevated">
          <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-[hsl(var(--watt-bitcoin))]" />
            Walkthrough Modes
          </h3>
          <div className="grid md:grid-cols-3 gap-4">
            {walkthroughModes.map((mode) => (
              <div key={mode.mode} className="bg-muted/30 rounded-xl p-4 border border-border">
                <div className="text-center mb-3">
                  <div className="font-bold text-foreground mb-1">{mode.mode}</div>
                  <span className="text-xs px-2 py-0.5 bg-[hsl(var(--watt-bitcoin)/0.1)] text-[hsl(var(--watt-bitcoin))] rounded">
                    {mode.duration}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mb-3">{mode.focus}</p>
                <div className="text-xs space-y-1 mb-3">
                  <div className="font-medium text-foreground">Path:</div>
                  {mode.path.map((stop, i) => (
                    <div key={i} className="flex items-center gap-1 text-muted-foreground">
                      <span className="text-[hsl(var(--watt-bitcoin))]">→</span>
                      <span>{stop}</span>
                    </div>
                  ))}
                </div>
                <div className="text-[10px] text-muted-foreground bg-background rounded-lg p-2 border border-border">
                  ⚠️ {mode.restrictions}
                </div>
              </div>
            ))}
          </div>
        </DCEContentCard>
      </motion.div>

      {/* Key Insight */}
      <DCEKeyInsight variant="insight" title="Facility Architecture Decision" delay={0.5}>
        <p>
          <strong>Warehouse builds</strong> offer the lowest $/MW cost and scale to 100+ MW, but require 12-18 months 
          to construct. <strong>Container solutions</strong> deploy in weeks and can be relocated, but cost 30-50% more 
          per MW. Choose warehouse for permanent large-scale operations; containers for rapid deployment, 
          uncertain power contracts, or sites requiring flexibility.
        </p>
      </DCEKeyInsight>

      <SectionSummary
        takeaways={[
          "Warehouse air-cooled: Lowest cost, 135MW+ scale, 12-18 month build, PUE 1.15-1.25",
          "Container hydro: Modular 1MW units, 4-6 week deploy, PUE 1.15-1.30, relocatable",
          "5-phase commissioning: Pre-commission → Energization → Mechanical → IT Load → Handoff",
          "Safety critical: NFPA 70E arc flash boundaries, IBC egress codes, OSHA LOTO procedures"
        ]}
      />
    </DCESectionWrapper>
  );
};

export default InteractiveFacilityTour;
