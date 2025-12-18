import React, { useState } from 'react';
import { Server, Zap, Wind, Shield, Gauge, Users, MapPin, CheckCircle, Droplets, Waves, Thermometer, Box, Building2, Fan, Cable, Monitor } from 'lucide-react';
import { ScrollReveal } from '@/components/landing/ScrollAnimations';
import LearningObjectives from '@/components/academy/LearningObjectives';
import SectionSummary from '@/components/academy/SectionSummary';
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

  // Engineering-accurate facility configurations with warehouse (air) vs container (hydro/immersion) layouts
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
          specs: [
            '138kV/25kV step-down',
            '100 MVA capacity',
            'SF6 circuit breakers',
            'SCADA monitored 24/7',
            'N configuration',
            'Metering class CTs/PTs'
          ],
        },
        {
          id: 'unit-substations',
          name: 'Unit Substations',
          icon: Gauge,
          color: 'bg-orange-500',
          position: { left: '2%', top: '20%', width: '12%', height: '38%' },
          description: 'Dry-type cast-resin transformers stepping 25kV to 600V for distribution to mining pods.',
          specs: [
            '25kV/600V step-down',
            '2,500 kVA each',
            '18 units total (1 per 7.5MW)',
            'Cast-resin insulated',
            '<65°C rise rating',
            '99.2% efficiency'
          ],
        },
        {
          id: 'mining-pod-a',
          name: 'Mining Pod A',
          icon: Server,
          color: 'bg-watt-bitcoin',
          position: { left: '16%', top: '10%', width: '22%', height: '75%' },
          description: 'Primary mining floor with hot/cold aisle containment. 12,800 ASICs at 150 TH/s each generating 1.92 EH/s.',
          specs: [
            'IT Load: 45 MW',
            'Miners: ~12,800 units',
            'Hot Aisle: 130-180°F (54-82°C)',
            'Cold Aisle: 65-80°F (18-27°C)',
            'Airflow: 1.05M CFM',
            'Rows: 16 double-sided',
            'Hashrate: 1.92 EH/s'
          ],
        },
        {
          id: 'mining-pod-b',
          name: 'Mining Pod B',
          icon: Server,
          color: 'bg-watt-bitcoin',
          position: { left: '40%', top: '10%', width: '22%', height: '75%' },
          description: 'Secondary mining floor mirroring Pod A with independent power feeds and PDUs for fault isolation.',
          specs: [
            'IT Load: 45 MW',
            'Miners: ~12,800 units',
            'Independent PDU feeds',
            'Separate electrical room',
            'Load balanced with Pod A',
            'Hashrate: 1.92 EH/s'
          ],
        },
        {
          id: 'mining-pod-c',
          name: 'Mining Pod C',
          icon: Server,
          color: 'bg-watt-bitcoin',
          position: { left: '64%', top: '10%', width: '18%', height: '75%' },
          description: 'Tertiary mining floor completing the 135MW total capacity with expansion-ready infrastructure.',
          specs: [
            'IT Load: 45 MW',
            'Miners: ~12,800 units',
            'Expansion-ready conduits',
            'Spare PDU capacity',
            'Hashrate: 1.92 EH/s'
          ],
        },
        {
          id: 'exhaust-fan-wall',
          name: 'Exhaust Fan Wall',
          icon: Fan,
          color: 'bg-cyan-500',
          position: { left: '84%', top: '10%', width: '14%', height: '50%' },
          description: 'Industrial exhaust fans sized for 3.412 BTU/hr per watt of IT load. VFD controlled for efficiency.',
          specs: [
            'Fan Count: 48× 72" fans',
            'CFM Each: 65,000 CFM',
            'Total: 3.12M CFM capacity',
            'VFD Controlled (0-100%)',
            'Static Pressure: 0.5" WC',
            'Evap Cooling: Optional'
          ],
        },
        {
          id: 'noc-security',
          name: 'NOC & Security',
          icon: Monitor,
          color: 'bg-purple-500',
          position: { left: '84%', top: '62%', width: '14%', height: '33%' },
          description: '24/7 Network Operations Center with DCIM software monitoring power, temps, and hashrate.',
          specs: [
            '24/7 staffed (3 shifts)',
            'DCIM: Vertiv/Nlyte',
            'Fiber redundancy',
            '100+ CCTV cameras',
            'Biometric + card access',
            'Perimeter fence + guards'
          ],
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
          name: 'Container Row 1 (1-5)',
          icon: Box,
          color: 'bg-watt-bitcoin',
          position: { left: '5%', top: '12%', width: '40%', height: '22%' },
          description: '40ft ISO containers with integrated RDHX cooling. Each container is a self-contained mining unit.',
          specs: [
            'Containers: 5× 40ft ISO',
            'Per Container: 1 MW IT',
            'Miners/Container: 280 units',
            'RDHX: 40kW capacity each',
            'Supply Water: 45°F (7°C)',
            'Return Water: 55°F (13°C)',
            'GPM per Container: 24'
          ],
        },
        {
          id: 'container-row-2',
          name: 'Container Row 2 (6-10)',
          icon: Box,
          color: 'bg-watt-bitcoin',
          position: { left: '5%', top: '66%', width: '40%', height: '22%' },
          description: 'Second row of mining containers on independent chilled water loop for redundancy.',
          specs: [
            'Containers: 5× 40ft ISO',
            'Total Row: 5 MW IT',
            'Independent CW loop',
            'Isolation valves per container',
            'Manifold connection'
          ],
        },
        {
          id: 'chilled-water-supply',
          name: 'Chilled Water Loop',
          icon: Droplets,
          color: 'bg-blue-500',
          position: { left: '5%', top: '36%', width: '40%', height: '12%' },
          description: 'Supply and return chilled water headers connecting containers to central cooling plant.',
          specs: [
            'Supply: 45°F (7°C)',
            'Return: 55°F (13°C)',
            'ΔT: 10°F design',
            'Pipe Size: 8" headers',
            'Insulated + jacketed',
            'Flow meters per branch'
          ],
        },
        {
          id: 'dry-coolers',
          name: 'Dry Cooler Array',
          icon: Wind,
          color: 'bg-cyan-500',
          position: { left: '50%', top: '12%', width: '22%', height: '76%' },
          description: 'Outdoor dry coolers rejecting heat from chilled water loop. Glycol mix for freeze protection.',
          specs: [
            'Units: 4× 2.5 MW each',
            'Total Rejection: 10 MW',
            'Fluid: 30% Glycol mix',
            'Approach: 15°F to ambient',
            'EC fans: VFD controlled',
            'Sound Level: <75 dBA',
            'Winter Free Cooling: Yes'
          ],
        },
        {
          id: 'power-substation',
          name: 'Power Substation',
          icon: Zap,
          color: 'bg-yellow-500',
          position: { left: '75%', top: '12%', width: '22%', height: '35%' },
          description: 'Compact outdoor substation sized for container deployment.',
          specs: [
            '15kV/480V step-down',
            '10 MVA capacity',
            'Pad-mount transformer',
            'Fused disconnect',
            'Expansion to 25 MVA'
          ],
        },
        {
          id: 'control-building',
          name: 'Control & NOC Building',
          icon: Monitor,
          color: 'bg-purple-500',
          position: { left: '75%', top: '53%', width: '22%', height: '35%' },
          description: 'Central control building housing NOC, electrical rooms, and security.',
          specs: [
            '20ft control container',
            'MCC switchgear',
            'BMS/DCIM systems',
            'Remote monitoring',
            '24/7 staffed optional'
          ],
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
          specs: [
            'Containers: 5× 40ft',
            'Tanks per Container: 4',
            'Tank Volume: 2,000L each',
            'Fluid: Engineered Fluids EC-110',
            'Miners per Tank: 20 units',
            'Overclock: +30% hashrate',
            'Fluid Temp: 104-122°F (40-50°C)'
          ],
        },
        {
          id: 'immersion-row-b',
          name: 'Immersion Container Row B',
          icon: Waves,
          color: 'bg-purple-500',
          position: { left: '3%', top: '60%', width: '45%', height: '28%' },
          description: 'Second row of immersion containers with independent cooling loop.',
          specs: [
            'Containers: 5× 40ft',
            'Total Miners: 400 units',
            'Independent CDU loop',
            'Fluid fill: 40,000L total',
            'Total: 5-10 MW'
          ],
        },
        {
          id: 'cdu-array',
          name: 'Cooling Distribution Units',
          icon: Thermometer,
          color: 'bg-cyan-500',
          position: { left: '52%', top: '12%', width: '22%', height: '76%' },
          description: 'CDUs pump dielectric fluid through external heat exchangers. No water in cooling loop.',
          specs: [
            'CDUs: 4× 2.5 MW each',
            'Fluid Flow: 200 GPM each',
            'Heat Rejection: Dry coolers',
            'Glycol Secondary Loop: 30%',
            'WUE: 0.0 L/kWh',
            'Zero evaporative loss'
          ],
        },
        {
          id: 'fluid-management',
          name: 'Fluid Management',
          icon: Droplets,
          color: 'bg-blue-500',
          position: { left: '77%', top: '12%', width: '20%', height: '35%' },
          description: 'Dielectric fluid storage, filtration, and quality monitoring systems.',
          specs: [
            'Storage: 10,000L reserve',
            'Filtration: 1 micron',
            'Breakdown monitoring',
            'Auto top-up system',
            'Fluid life: 10+ years'
          ],
        },
        {
          id: 'power-and-control',
          name: 'Power & Control',
          icon: Zap,
          color: 'bg-yellow-500',
          position: { left: '77%', top: '53%', width: '20%', height: '35%' },
          description: 'Electrical distribution and BMS controls for immersion facility.',
          specs: [
            'PDUs: 480V 3-phase',
            'PLC controls',
            'Leak detection system',
            'Fire suppression: Inert gas',
            'Remote DCIM monitoring'
          ],
        },
      ] as FacilityZone[],
    },
  };

  const currentFacility = facilityConfigs[facilityType];
  const facilityZones = currentFacility.zones;

  const handleZoneClick = (zoneId: string) => {
    setActiveZone(activeZone === zoneId ? null : zoneId);
    setExploredZones(prev => new Set([...prev, zoneId]));
  };

  const activeZoneData = facilityZones.find(z => z.id === activeZone);
  const explorationProgress = (exploredZones.size / facilityZones.length) * 100;

  return (
    <section id="facility-tour" className="py-16 md:py-24 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <LearningObjectives
          objectives={[
            "Compare three facility types: warehouse air-cooled, container hydro, and container immersion",
            "Understand zone layouts: substation, mining floor, cooling, control room",
            "Learn capacity, PUE, and uptime characteristics of each architecture",
            "Know when to choose warehouse vs modular container deployment"
          ]}
          estimatedTime="10 min"
          prerequisites={[
            { title: "Cooling Systems", href: "/datacenter-education#cooling" }
          ]}
        />
        
        <ScrollReveal>
          <div className="text-center mb-8">
            <span className="inline-block px-4 py-1 rounded-full bg-watt-bitcoin/10 text-watt-bitcoin text-sm font-medium mb-4">
              Section 4 • Virtual Walkthrough
            </span>
            <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
              Interactive Facility Tour
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
              Explore warehouse-style and modular container datacenter architectures with professional engineering layouts
            </p>
          </div>
        </ScrollReveal>

        {/* Facility Type Selector */}
        <ScrollReveal delay={0.05}>
          <div className="flex flex-wrap justify-center gap-3 mb-8">
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
                    ? 'bg-watt-bitcoin text-white border-watt-bitcoin shadow-lg shadow-watt-bitcoin/30'
                    : 'bg-card border-border hover:border-watt-bitcoin/50'
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
          </div>
        </ScrollReveal>

        {/* Facility Image Header */}
        <ScrollReveal delay={0.1}>
          <div className="relative rounded-2xl overflow-hidden mb-6 h-48 md:h-64">
            <img 
              src={currentFacility.image} 
              alt={currentFacility.name} 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-watt-navy/90 via-watt-navy/60 to-transparent" />
            <div className="absolute inset-0 flex items-center p-6 md:p-8">
              <div className="text-white max-w-lg">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                    currentFacility.layoutType === 'warehouse' ? 'bg-blue-500' : 'bg-purple-500'
                  }`}>
                    {currentFacility.layoutType === 'warehouse' ? 'Warehouse Layout' : 'Container Layout'}
                  </span>
                </div>
                <h3 className="text-xl md:text-3xl font-bold mb-1">{currentFacility.name}</h3>
                <p className="text-white/70 text-sm md:text-base mb-3">{currentFacility.subtitle}</p>
                <div className="flex flex-wrap gap-2 text-xs">
                  <span className="px-2 py-1 bg-white/20 rounded">PUE: {currentFacility.pue}</span>
                  <span className="px-2 py-1 bg-white/20 rounded">Capacity: {currentFacility.capacity}</span>
                  <span className="px-2 py-1 bg-white/20 rounded">Uptime: {currentFacility.uptime}</span>
                </div>
                <div className="flex flex-wrap gap-3 mt-3">
                  {currentFacility.keyStats.map((stat, i) => (
                    <div key={i} className="text-xs">
                      <span className="text-white/60">{stat.label}:</span>
                      <span className="ml-1 font-semibold text-watt-bitcoin">{stat.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </ScrollReveal>

        {/* Exploration Progress */}
        <ScrollReveal delay={0.15}>
          <div className="max-w-md mx-auto mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Exploration Progress</span>
              <span className="text-sm font-medium text-watt-bitcoin">
                {exploredZones.size}/{facilityZones.length} zones
              </span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-watt-bitcoin transition-all duration-500"
                style={{ width: `${explorationProgress}%` }}
              />
            </div>
          </div>
        </ScrollReveal>

        {/* Interactive Floor Plan */}
        <ScrollReveal delay={0.2}>
          <div className="grid lg:grid-cols-3 gap-6 mb-8">
            {/* Floor Plan */}
            <div className="lg:col-span-2">
              <div className="relative aspect-[16/10] bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 rounded-2xl border border-border overflow-hidden">
                {/* Grid overlay */}
                <div className="absolute inset-0 opacity-20">
                  <svg className="w-full h-full">
                    <defs>
                      <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                        <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-foreground" />
                      </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#grid)" />
                  </svg>
                </div>

                {/* Layout Label */}
                <div className="absolute top-2 left-2 z-10">
                  <span className={`px-2 py-1 rounded text-[10px] font-medium ${
                    currentFacility.layoutType === 'warehouse' 
                      ? 'bg-blue-500/20 text-blue-700 dark:text-blue-300' 
                      : 'bg-purple-500/20 text-purple-700 dark:text-purple-300'
                  }`}>
                    {currentFacility.layoutType === 'warehouse' 
                      ? '📐 Warehouse Floor Plan - 20,000 sqft' 
                      : '📦 Container Site Layout - Modular Array'}
                  </span>
                </div>

                {/* Zone blocks */}
                {facilityZones.map((zone) => (
                  <button
                    key={zone.id}
                    onClick={() => handleZoneClick(zone.id)}
                    className={`absolute rounded-lg border-2 transition-all duration-300 flex flex-col items-center justify-center p-1 ${
                      activeZone === zone.id
                        ? `${zone.color} border-white shadow-xl scale-105 z-20`
                        : exploredZones.has(zone.id)
                          ? `${zone.color}/70 border-transparent hover:border-white/50`
                          : `${zone.color}/40 border-dashed border-current hover:${zone.color}/60`
                    }`}
                    style={{
                      left: zone.position.left,
                      top: zone.position.top,
                      width: zone.position.width,
                      height: zone.position.height,
                    }}
                  >
                    <zone.icon className={`w-4 h-4 md:w-6 md:h-6 ${
                      activeZone === zone.id ? 'text-white' : 'text-white/80'
                    }`} />
                    <span className={`text-[7px] md:text-[9px] font-medium mt-0.5 text-center leading-tight ${
                      activeZone === zone.id ? 'text-white' : 'text-white/80'
                    }`}>
                      {zone.name}
                    </span>
                    {exploredZones.has(zone.id) && activeZone !== zone.id && (
                      <CheckCircle className="absolute top-0.5 right-0.5 w-3 h-3 text-white" />
                    )}
                  </button>
                ))}

                {/* Legend */}
                <div className="absolute bottom-2 left-2 flex items-center gap-3 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded border-2 border-dashed border-muted-foreground/50" />
                    <span>Unexplored</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded bg-watt-bitcoin/70" />
                    <span>Explored</span>
                  </div>
                </div>

                {/* Scale indicator */}
                <div className="absolute bottom-2 right-2 flex items-center gap-1 text-xs text-muted-foreground">
                  <div className="w-12 h-0.5 bg-muted-foreground/50" />
                  <span>{currentFacility.layoutType === 'warehouse' ? '~100 ft' : '~40 ft'}</span>
                </div>
              </div>
            </div>

            {/* Zone Details Panel */}
            <div className="lg:col-span-1">
              <div className="bg-card rounded-2xl border border-border p-5 h-full min-h-[280px]">
                {activeZoneData ? (
                  <div className="animate-in fade-in duration-300">
                    <div className="flex items-center gap-3 mb-4">
                      <div className={`p-2.5 rounded-xl ${activeZoneData.color}`}>
                        <activeZoneData.icon className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h4 className="font-bold text-foreground">{activeZoneData.name}</h4>
                        <p className="text-xs text-muted-foreground">Click zones to explore</p>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                      {activeZoneData.description}
                    </p>
                    <div className="space-y-2">
                      <h5 className="text-xs font-semibold text-foreground uppercase tracking-wider">
                        Engineering Specifications
                      </h5>
                      <ul className="space-y-1.5">
                        {activeZoneData.specs.map((spec, i) => (
                          <li key={i} className="flex items-start gap-2 text-xs">
                            <CheckCircle className="w-3.5 h-3.5 text-watt-bitcoin mt-0.5 flex-shrink-0" />
                            <span className="text-muted-foreground">{spec}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <div className="p-4 rounded-full bg-muted mb-4">
                      <MapPin className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <h4 className="font-semibold text-foreground mb-2">Select a Zone</h4>
                    <p className="text-sm text-muted-foreground">
                      Click on any highlighted zone in the {currentFacility.layoutType === 'warehouse' ? 'floor plan' : 'site layout'} to view engineering details
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </ScrollReveal>

        {/* Comparison Table */}
        <ScrollReveal delay={0.25}>
          <div className="bg-card rounded-2xl border border-border overflow-hidden">
            <div className="p-4 border-b border-border">
              <h3 className="font-bold text-foreground">Facility Type Comparison</h3>
              <p className="text-sm text-muted-foreground">Engineering specifications for each cooling architecture</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-left p-3 font-semibold text-foreground">Specification</th>
                    <th className="text-center p-3 font-semibold text-blue-600">Air-Cooled Warehouse</th>
                    <th className="text-center p-3 font-semibold text-cyan-600">Hydro Container</th>
                    <th className="text-center p-3 font-semibold text-purple-600">Immersion Container</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  <tr>
                    <td className="p-3 text-muted-foreground">Layout Type</td>
                    <td className="p-3 text-center">20,000 sqft steel building</td>
                    <td className="p-3 text-center">40ft ISO containers</td>
                    <td className="p-3 text-center">40ft ISO containers</td>
                  </tr>
                  <tr>
                    <td className="p-3 text-muted-foreground">Typical Capacity</td>
                    <td className="p-3 text-center">50-150 MW</td>
                    <td className="p-3 text-center">10-50 MW</td>
                    <td className="p-3 text-center">10-20 MW</td>
                  </tr>
                  <tr>
                    <td className="p-3 text-muted-foreground">PUE Range</td>
                    <td className="p-3 text-center">1.15-1.25</td>
                    <td className="p-3 text-center">1.15-1.30</td>
                    <td className="p-3 text-center font-semibold text-green-600">1.02-1.08</td>
                  </tr>
                  <tr>
                    <td className="p-3 text-muted-foreground">Cooling Method</td>
                    <td className="p-3 text-center">Exhaust fans + evap</td>
                    <td className="p-3 text-center">RDHX + chilled water</td>
                    <td className="p-3 text-center">Dielectric fluid</td>
                  </tr>
                  <tr>
                    <td className="p-3 text-muted-foreground">Hot Aisle Temp</td>
                    <td className="p-3 text-center">130-180°F</td>
                    <td className="p-3 text-center">85-95°F</td>
                    <td className="p-3 text-center">N/A (submerged)</td>
                  </tr>
                  <tr>
                    <td className="p-3 text-muted-foreground">Water Usage</td>
                    <td className="p-3 text-center">Low (evap optional)</td>
                    <td className="p-3 text-center">Moderate (cooling towers)</td>
                    <td className="p-3 text-center font-semibold text-green-600">Zero</td>
                  </tr>
                  <tr>
                    <td className="p-3 text-muted-foreground">Overclock Potential</td>
                    <td className="p-3 text-center">Limited</td>
                    <td className="p-3 text-center">+10-15%</td>
                    <td className="p-3 text-center font-semibold text-green-600">+30%</td>
                  </tr>
                  <tr>
                    <td className="p-3 text-muted-foreground">CAPEX ($/MW)</td>
                    <td className="p-3 text-center font-semibold text-green-600">$500K-800K</td>
                    <td className="p-3 text-center">$800K-1.2M</td>
                    <td className="p-3 text-center">$1.5M-2.5M</td>
                  </tr>
                  <tr>
                    <td className="p-3 text-muted-foreground">Deploy Time</td>
                    <td className="p-3 text-center">12-18 months</td>
                    <td className="p-3 text-center font-semibold text-green-600">4-6 weeks</td>
                    <td className="p-3 text-center font-semibold text-green-600">4-6 weeks</td>
                  </tr>
                  <tr>
                    <td className="p-3 text-muted-foreground">Best For</td>
                    <td className="p-3 text-center">Large permanent sites</td>
                    <td className="p-3 text-center">Rapid deployment</td>
                    <td className="p-3 text-center">Max efficiency</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </ScrollReveal>
        
        <SectionSummary
          takeaways={[
            "Warehouse air-cooled: best for large permanent sites (50+ MW), lowest CAPEX, leverages free cooling",
            "Container hydro: rapid 4-6 week deployment, 1-2 MW per container, good for phased growth",
            "Container immersion: highest efficiency (PUE 1.02), enables overclocking, but highest complexity",
            "Choose based on: site permanence, capital availability, timeline, and power density needs"
          ]}
          proTip="Container deployments can be relocated if your power contract ends. Warehouse facilities are permanent but achieve lower $/MW at scale."
          nextSteps={[
            { title: "AESO Energy Market", href: "/aeso-101" },
            { title: "Electrical Infrastructure", href: "/electrical-infrastructure" }
          ]}
        />
      </div>
    </section>
  );
};

export default InteractiveFacilityTour;
