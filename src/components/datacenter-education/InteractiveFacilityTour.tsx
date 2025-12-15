import React, { useState } from 'react';
import { Server, Zap, Wind, Shield, Gauge, Users, MapPin, CheckCircle, Droplets, Waves, Thermometer } from 'lucide-react';
import { ScrollReveal } from '@/components/landing/ScrollAnimations';
import { AnimatedCounter } from '@/components/ui/AnimatedCounter';
import airCooledImage from '@/assets/datacenter-air-cooled.jpg';
import hydroImage from '@/assets/datacenter-hydro.jpg';
import immersionImage from '@/assets/datacenter-immersion.jpg';

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
      name: 'Air-Cooled Facility',
      subtitle: 'Like Alberta Heartland 135',
      image: airCooledImage,
      pue: '1.15-1.25',
      capacity: '135 MW',
      uptime: '95%',
      cooling: 'Exhaust Fan Walls + Free Cooling',
      zones: [
        {
          id: 'substation',
          name: 'Main Substation',
          icon: Zap,
          color: 'bg-yellow-500',
          position: { left: '2%', top: '35%', width: '15%', height: '55%' },
          description: 'Primary 138kV to 25kV step-down with protective relaying and metering.',
          specs: ['138kV/25kV, 100MVA', 'SF6 circuit breakers', 'SCADA monitored', 'N configuration'],
        },
        {
          id: 'unit-subs',
          name: 'Unit Substations',
          icon: Gauge,
          color: 'bg-orange-500',
          position: { left: '19%', top: '10%', width: '12%', height: '35%' },
          description: 'Dry-type transformers stepping 25kV to 600V for mining halls.',
          specs: ['2500kVA dry-type each', '25kV/600V step-down', 'One per 2MW load', 'Cast-resin insulated'],
        },
        {
          id: 'mining-hall-a',
          name: 'Mining Hall A',
          icon: Server,
          color: 'bg-watt-bitcoin',
          position: { left: '33%', top: '10%', width: '22%', height: '75%' },
          description: 'Primary mining floor with hot/cold aisle containment. 1,500+ ASICs generating 150 TH/s each.',
          specs: [
            'Capacity: 45 MW IT load',
            'Miners: ~12,800 units',
            'Hot aisle: 95-130°F',
            'Cold aisle: 65-80°F',
            'Airflow: 3.2M CFM total'
          ],
        },
        {
          id: 'mining-hall-b',
          name: 'Mining Hall B',
          icon: Server,
          color: 'bg-watt-bitcoin',
          position: { left: '57%', top: '10%', width: '22%', height: '75%' },
          description: 'Secondary mining floor. Mirror of Hall A with independent power feeds.',
          specs: [
            'Capacity: 45 MW IT load',
            'Miners: ~12,800 units',
            'Load balanced with Hall A',
            'Independent PDUs'
          ],
        },
        {
          id: 'exhaust-wall',
          name: 'Exhaust Fan Wall',
          icon: Wind,
          color: 'bg-cyan-500',
          position: { left: '81%', top: '10%', width: '17%', height: '50%' },
          description: 'Industrial exhaust fans removing hot air. Sized for 3.412 BTU/hr per watt of IT load.',
          specs: [
            'Fan count: 48x 72" fans',
            'CFM each: 65,000 CFM',
            'Total: 3.1M CFM capacity',
            'VFD controlled',
            'Evap cooling optional'
          ],
        },
        {
          id: 'noc',
          name: 'Network Operations',
          icon: Gauge,
          color: 'bg-purple-500',
          position: { left: '81%', top: '62%', width: '17%', height: '28%' },
          description: '24/7 NOC monitoring all systems. DCIM software tracks power, temps, and hashrate.',
          specs: ['24/7 staffed', 'Fiber redundancy', 'DCIM: Vertiv/Nlyte', 'Hashrate monitoring'],
        },
        {
          id: 'security',
          name: 'Security & Entry',
          icon: Shield,
          color: 'bg-red-500',
          position: { left: '2%', top: '10%', width: '15%', height: '23%' },
          description: 'Secured perimeter with biometric access. 24/7 guards and CCTV coverage.',
          specs: ['Biometric + card access', '100+ cameras', 'Mantrap entry', 'Perimeter fence'],
        },
      ] as FacilityZone[],
    },
    hydro: {
      name: 'Hydro-Cooled Facility',
      subtitle: 'Rear-Door Heat Exchanger Design',
      image: hydroImage,
      pue: '1.15-1.30',
      capacity: '50 MW',
      uptime: '99%',
      cooling: 'Chilled Water + RDHX',
      zones: [
        {
          id: 'chiller-plant',
          name: 'Chiller Plant',
          icon: Droplets,
          color: 'bg-blue-500',
          position: { left: '2%', top: '10%', width: '20%', height: '45%' },
          description: 'Central chilled water plant with redundant chillers and cooling towers.',
          specs: [
            'Chillers: 3x 2,000 ton',
            'Supply temp: 45°F (7°C)',
            'Return temp: 55°F (13°C)',
            'ΔT: 10°F design',
            'GPM: 4,800 per chiller'
          ],
        },
        {
          id: 'pump-room',
          name: 'Pump Room',
          icon: Gauge,
          color: 'bg-cyan-500',
          position: { left: '2%', top: '57%', width: '20%', height: '33%' },
          description: 'Chilled water distribution pumps. Variable speed for optimal efficiency.',
          specs: ['Primary: 3x 150HP', 'Secondary: 6x 75HP', 'VFD controlled', 'N+1 redundancy'],
        },
        {
          id: 'mining-row-1',
          name: 'Mining Row 1-8',
          icon: Server,
          color: 'bg-watt-bitcoin',
          position: { left: '24%', top: '10%', width: '35%', height: '80%' },
          description: 'High-density mining racks with rear-door heat exchangers. 30kW per rack.',
          specs: [
            'Racks: 200 total',
            'Density: 30kW/rack',
            'RDHX: 40kW capacity each',
            'GPM per rack: 8-12',
            'Miners: ~1,700 total'
          ],
        },
        {
          id: 'mining-row-2',
          name: 'Mining Row 9-16',
          icon: Server,
          color: 'bg-watt-bitcoin',
          position: { left: '61%', top: '10%', width: '20%', height: '80%' },
          description: 'Additional mining rows with same RDHX configuration.',
          specs: ['Racks: 200 total', '30kW/rack design', 'Independent piping loop'],
        },
        {
          id: 'cooling-tower',
          name: 'Cooling Towers',
          icon: Wind,
          color: 'bg-teal-500',
          position: { left: '83%', top: '10%', width: '15%', height: '50%' },
          description: 'Heat rejection to atmosphere. Wet cooling towers for maximum efficiency.',
          specs: ['Cells: 4x 1,500 ton', 'Approach: 7°F', 'Water treatment', 'Basin heaters'],
        },
        {
          id: 'electrical',
          name: 'Electrical Room',
          icon: Zap,
          color: 'bg-yellow-500',
          position: { left: '83%', top: '62%', width: '15%', height: '28%' },
          description: 'Switchgear and PDUs for the facility.',
          specs: ['15kV switchgear', 'N+1 PDUs', 'Generator ready'],
        },
      ] as FacilityZone[],
    },
    immersion: {
      name: 'Immersion Facility',
      subtitle: 'Single-Phase Dielectric Cooling',
      image: immersionImage,
      pue: '1.02-1.08',
      capacity: '20 MW',
      uptime: '99.5%',
      cooling: 'Dielectric Fluid Immersion',
      zones: [
        {
          id: 'tank-row-a',
          name: 'Immersion Tank Row A',
          icon: Waves,
          color: 'bg-purple-500',
          position: { left: '5%', top: '15%', width: '40%', height: '35%' },
          description: 'Single-phase immersion tanks with dielectric fluid. Enables 30% overclocking.',
          specs: [
            'Tanks: 40x 2,000L each',
            'Fluid: Engineered Fluids EC-110',
            'Miners/tank: 20 units',
            'Overclock: +30% hashrate',
            'Fluid temp: 40-50°C'
          ],
        },
        {
          id: 'tank-row-b',
          name: 'Immersion Tank Row B',
          icon: Waves,
          color: 'bg-purple-500',
          position: { left: '5%', top: '52%', width: '40%', height: '35%' },
          description: 'Secondary tank row. Same configuration as Row A.',
          specs: ['Tanks: 40x 2,000L', 'Total miners: 800', 'Independent cooling loop'],
        },
        {
          id: 'dry-coolers',
          name: 'Dry Cooler Array',
          icon: Wind,
          color: 'bg-cyan-500',
          position: { left: '47%', top: '15%', width: '25%', height: '72%' },
          description: 'Outdoor dry coolers rejecting heat from dielectric fluid loop. Zero water usage.',
          specs: [
            'Units: 8x 2.5MW each',
            'Fluid loop: Glycol 30%',
            'Approach: 15°F to ambient',
            'EC fans: VFD controlled',
            'WUE: 0.0 L/kWh'
          ],
        },
        {
          id: 'fluid-management',
          name: 'Fluid Management',
          icon: Droplets,
          color: 'bg-blue-500',
          position: { left: '74%', top: '15%', width: '23%', height: '35%' },
          description: 'Dielectric fluid filtration, top-up, and quality monitoring systems.',
          specs: ['Filtration: 1 micron', 'Fluid reserve: 10,000L', 'Breakdown monitoring', 'Auto top-up'],
        },
        {
          id: 'electrical-room',
          name: 'Electrical/Controls',
          icon: Zap,
          color: 'bg-yellow-500',
          position: { left: '74%', top: '52%', width: '23%', height: '35%' },
          description: 'Power distribution and BMS controls for the immersion facility.',
          specs: ['PDUs: 480V 3-phase', 'PLC controls', 'Leak detection', 'Fire suppression'],
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
        <ScrollReveal>
          <div className="text-center mb-8">
            <span className="inline-block px-4 py-1 rounded-full bg-watt-bitcoin/10 text-watt-bitcoin text-sm font-medium mb-4">
              Section 4 • Virtual Walkthrough
            </span>
            <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
              Interactive Facility Tour
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
              Explore three different datacenter cooling architectures used in professional Bitcoin mining
            </p>
          </div>
        </ScrollReveal>

        {/* Facility Type Selector */}
        <ScrollReveal delay={0.05}>
          <div className="flex flex-wrap justify-center gap-3 mb-8">
            {[
              { id: 'air' as FacilityType, name: 'Air-Cooled', icon: Wind, desc: 'Like Alberta Heartland' },
              { id: 'hydro' as FacilityType, name: 'Hydro-Cooled', icon: Droplets, desc: 'RDHX Design' },
              { id: 'immersion' as FacilityType, name: 'Immersion', icon: Waves, desc: 'Dielectric Fluid' },
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
          <div className="relative rounded-2xl overflow-hidden mb-6 h-40 md:h-56">
            <img 
              src={currentFacility.image} 
              alt={currentFacility.name} 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-watt-navy/90 via-watt-navy/60 to-transparent" />
            <div className="absolute inset-0 flex items-center p-6 md:p-8">
              <div className="text-white">
                <h3 className="text-xl md:text-3xl font-bold mb-1">{currentFacility.name}</h3>
                <p className="text-white/70 text-sm md:text-base mb-3">{currentFacility.subtitle}</p>
                <div className="flex flex-wrap gap-3 text-xs">
                  <span className="px-2 py-1 bg-white/20 rounded">PUE: {currentFacility.pue}</span>
                  <span className="px-2 py-1 bg-white/20 rounded">Capacity: {currentFacility.capacity}</span>
                  <span className="px-2 py-1 bg-white/20 rounded">Uptime: {currentFacility.uptime}</span>
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
                    <zone.icon className={`w-5 h-5 md:w-6 md:h-6 ${
                      activeZone === zone.id ? 'text-white' : 'text-white/80'
                    }`} />
                    <span className={`text-[8px] md:text-[10px] font-medium mt-1 text-center leading-tight ${
                      activeZone === zone.id ? 'text-white' : 'text-white/80'
                    }`}>
                      {zone.name}
                    </span>
                    {exploredZones.has(zone.id) && activeZone !== zone.id && (
                      <CheckCircle className="absolute top-1 right-1 w-3 h-3 text-white" />
                    )}
                  </button>
                ))}

                {/* Legend */}
                <div className="absolute bottom-2 left-2 flex items-center gap-3 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded border-2 border-dashed border-muted-foreground" />
                    <span>Unexplored</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded bg-watt-bitcoin/70" />
                    <span>Explored</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Zone Details Panel */}
            <div className="lg:col-span-1">
              <div className={`h-full p-5 rounded-2xl border transition-all ${
                activeZoneData 
                  ? 'bg-card border-watt-bitcoin shadow-lg' 
                  : 'bg-muted/30 border-border'
              }`}>
                {activeZoneData ? (
                  <>
                    <div className="flex items-center gap-3 mb-4">
                      <div className={`w-10 h-10 rounded-xl ${activeZoneData.color} flex items-center justify-center`}>
                        <activeZoneData.icon className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-foreground">{activeZoneData.name}</h3>
                        <span className="text-xs text-watt-bitcoin">Click zones to explore</span>
                      </div>
                    </div>
                    
                    <p className="text-sm text-muted-foreground mb-4">{activeZoneData.description}</p>
                    
                    <h4 className="font-semibold text-foreground mb-2 text-sm">Engineering Specifications</h4>
                    <ul className="space-y-1.5">
                      {activeZoneData.specs.map((spec, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs text-foreground">
                          <div className="w-1.5 h-1.5 rounded-full bg-watt-bitcoin mt-1 flex-shrink-0" />
                          {spec}
                        </li>
                      ))}
                    </ul>
                  </>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center">
                    <Users className="w-10 h-10 text-muted-foreground/50 mb-3" />
                    <h3 className="text-base font-semibold text-foreground mb-2">Select a Zone</h3>
                    <p className="text-xs text-muted-foreground">
                      Click on any zone in the floor plan to view detailed engineering specifications
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </ScrollReveal>

        {/* Zone Quick Access */}
        <ScrollReveal delay={0.3}>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
            {facilityZones.map((zone) => (
              <button
                key={zone.id}
                onClick={() => handleZoneClick(zone.id)}
                className={`p-2 rounded-xl border transition-all text-left ${
                  activeZone === zone.id
                    ? 'bg-watt-bitcoin/10 border-watt-bitcoin'
                    : 'bg-card border-border hover:border-watt-bitcoin/50'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <div className={`w-5 h-5 rounded ${zone.color} flex items-center justify-center`}>
                    <zone.icon className="w-3 h-3 text-white" />
                  </div>
                  {exploredZones.has(zone.id) && (
                    <CheckCircle className="w-3 h-3 text-green-500 ml-auto" />
                  )}
                </div>
                <span className="text-[10px] font-medium text-foreground line-clamp-1">{zone.name}</span>
              </button>
            ))}
          </div>
        </ScrollReveal>

        {/* Alberta Heartland Showcase */}
        <ScrollReveal delay={0.4}>
          <div className="mt-12 p-6 md:p-8 bg-gradient-to-r from-watt-navy to-watt-navy/90 rounded-2xl text-white">
            <div className="flex flex-col md:flex-row md:items-center gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <MapPin className="w-5 h-5 text-watt-bitcoin" />
                  <span className="text-watt-bitcoin font-medium">Featured Facility</span>
                </div>
                <h3 className="text-2xl md:text-3xl font-bold mb-2">Alberta Heartland 135</h3>
                <p className="text-white/70 mb-4 text-sm">
                  Our flagship air-cooled facility in Alberta's energy corridor. Optimized for mining economics with N configuration power and free cooling.
                </p>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-watt-bitcoin">
                    <AnimatedCounter end={135} suffix="MW" />
                  </div>
                  <div className="text-xs text-white/60">Power Capacity</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-watt-bitcoin">
                    <AnimatedCounter end={26} suffix=" Acres" />
                  </div>
                  <div className="text-xs text-white/60">Facility Size</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-watt-bitcoin">
                    <AnimatedCounter end={95} suffix="%" />
                  </div>
                  <div className="text-xs text-white/60">Target Uptime</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-watt-bitcoin">
                    <AnimatedCounter end={1.15} decimals={2} />
                  </div>
                  <div className="text-xs text-white/60">Target PUE</div>
                </div>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
};

export default InteractiveFacilityTour;
