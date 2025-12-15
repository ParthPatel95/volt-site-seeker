import React, { useState } from 'react';
import { Server, Zap, Wind, Shield, Gauge, Users, MapPin, CheckCircle } from 'lucide-react';
import { ScrollReveal } from '@/components/landing/ScrollAnimations';
import { AnimatedCounter } from '@/components/ui/AnimatedCounter';

const InteractiveFacilityTour = () => {
  const [activeZone, setActiveZone] = useState<string | null>(null);
  const [exploredZones, setExploredZones] = useState<Set<string>>(new Set());

  const facilityZones = [
    {
      id: 'power-room',
      name: 'Power Room',
      icon: Zap,
      color: 'bg-yellow-500',
      position: { left: '5%', top: '40%', width: '18%', height: '50%' },
      description: 'Houses transformers, switchgear, and UPS systems that manage incoming power.',
      specs: ['Utility feed: 13.8kV', 'UPS: 30-min runtime', 'Automatic transfer', 'N+1 redundancy'],
    },
    {
      id: 'server-hall-a',
      name: 'Server Hall A',
      icon: Server,
      color: 'bg-watt-bitcoin',
      position: { left: '25%', top: '15%', width: '22%', height: '70%' },
      description: 'Primary mining floor with hot/cold aisle containment for optimal airflow.',
      specs: ['500+ ASIC units', 'Hot aisle: 95°F', 'Cold aisle: 68°F', '15 MW capacity'],
    },
    {
      id: 'server-hall-b',
      name: 'Server Hall B',
      icon: Server,
      color: 'bg-watt-bitcoin',
      position: { left: '49%', top: '15%', width: '22%', height: '70%' },
      description: 'Secondary mining floor with identical infrastructure for load balancing.',
      specs: ['500+ ASIC units', 'Mirrored layout', 'Load balanced', '15 MW capacity'],
    },
    {
      id: 'cooling-plant',
      name: 'Cooling Plant',
      icon: Wind,
      color: 'bg-cyan-500',
      position: { left: '73%', top: '15%', width: '22%', height: '40%' },
      description: 'Industrial cooling systems including chillers, cooling towers, and air handlers.',
      specs: ['Evaporative cooling', 'Chiller backup', 'PUE: 1.15', '30 MW heat capacity'],
    },
    {
      id: 'noc',
      name: 'Network Operations',
      icon: Gauge,
      color: 'bg-purple-500',
      position: { left: '73%', top: '57%', width: '22%', height: '28%' },
      description: '24/7 monitoring center overseeing all facility operations and network connectivity.',
      specs: ['24/7 staffed', 'Multi-redundant fiber', 'DCIM monitoring', '<10ms latency'],
    },
    {
      id: 'security',
      name: 'Security Center',
      icon: Shield,
      color: 'bg-red-500',
      position: { left: '5%', top: '10%', width: '18%', height: '28%' },
      description: 'Physical security hub with biometric access, CCTV, and visitor management.',
      specs: ['Biometric access', '100+ cameras', 'Armed response', 'Mantrap entry'],
    },
  ];

  const handleZoneClick = (zoneId: string) => {
    setActiveZone(activeZone === zoneId ? null : zoneId);
    setExploredZones(prev => new Set([...prev, zoneId]));
  };

  const activeZoneData = facilityZones.find(z => z.id === activeZone);
  const explorationProgress = (exploredZones.size / facilityZones.length) * 100;

  return (
    <section id="facility-tour" className="py-20 md:py-32 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <div className="text-center mb-12">
            <span className="inline-block px-4 py-1 rounded-full bg-watt-bitcoin/10 text-watt-bitcoin text-sm font-medium mb-4">
              Section 4
            </span>
            <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
              Interactive Facility Tour
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
              Explore the key zones of a professional Bitcoin mining datacenter
            </p>
          </div>
        </ScrollReveal>

        {/* Exploration Progress */}
        <ScrollReveal delay={0.1}>
          <div className="max-w-md mx-auto mb-8">
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
          <div className="grid lg:grid-cols-3 gap-8 mb-12">
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
                    className={`absolute rounded-lg border-2 transition-all duration-300 flex flex-col items-center justify-center p-2 ${
                      activeZone === zone.id
                        ? `${zone.color} border-white shadow-xl scale-105 z-20`
                        : exploredZones.has(zone.id)
                          ? `${zone.color}/70 border-transparent hover:border-white/50 hover:scale-102`
                          : `${zone.color}/40 border-dashed border-current hover:${zone.color}/60 hover:border-solid`
                    }`}
                    style={{
                      left: zone.position.left,
                      top: zone.position.top,
                      width: zone.position.width,
                      height: zone.position.height,
                    }}
                  >
                    <zone.icon className={`w-6 h-6 md:w-8 md:h-8 ${
                      activeZone === zone.id ? 'text-white' : 'text-white/80'
                    }`} />
                    <span className={`text-[10px] md:text-xs font-medium mt-1 text-center leading-tight ${
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
                <div className="absolute bottom-2 left-2 flex items-center gap-4 text-xs text-muted-foreground">
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
              <div className={`h-full p-6 rounded-2xl border transition-all ${
                activeZoneData 
                  ? 'bg-card border-watt-bitcoin shadow-lg' 
                  : 'bg-muted/30 border-border'
              }`}>
                {activeZoneData ? (
                  <>
                    <div className="flex items-center gap-3 mb-4">
                      <div className={`w-12 h-12 rounded-xl ${activeZoneData.color} flex items-center justify-center`}>
                        <activeZoneData.icon className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-foreground">{activeZoneData.name}</h3>
                        <span className="text-sm text-watt-bitcoin">Click to explore</span>
                      </div>
                    </div>
                    
                    <p className="text-muted-foreground mb-6">{activeZoneData.description}</p>
                    
                    <h4 className="font-semibold text-foreground mb-3">Specifications</h4>
                    <ul className="space-y-2">
                      {activeZoneData.specs.map((spec, i) => (
                        <li key={i} className="flex items-center gap-2 text-sm text-foreground">
                          <div className="w-1.5 h-1.5 rounded-full bg-watt-bitcoin" />
                          {spec}
                        </li>
                      ))}
                    </ul>
                  </>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center">
                    <Users className="w-12 h-12 text-muted-foreground/50 mb-4" />
                    <h3 className="text-lg font-semibold text-foreground mb-2">Select a Zone</h3>
                    <p className="text-sm text-muted-foreground">
                      Click on any zone in the floor plan to learn about its function and specifications
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </ScrollReveal>

        {/* Zone Quick Access */}
        <ScrollReveal delay={0.3}>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {facilityZones.map((zone) => (
              <button
                key={zone.id}
                onClick={() => handleZoneClick(zone.id)}
                className={`p-3 rounded-xl border transition-all text-left ${
                  activeZone === zone.id
                    ? 'bg-watt-bitcoin/10 border-watt-bitcoin'
                    : 'bg-card border-border hover:border-watt-bitcoin/50'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <div className={`w-6 h-6 rounded ${zone.color} flex items-center justify-center`}>
                    <zone.icon className="w-3 h-3 text-white" />
                  </div>
                  {exploredZones.has(zone.id) && (
                    <CheckCircle className="w-3 h-3 text-green-500 ml-auto" />
                  )}
                </div>
                <span className="text-xs font-medium text-foreground">{zone.name}</span>
              </button>
            ))}
          </div>
        </ScrollReveal>

        {/* Alberta Heartland Showcase */}
        <ScrollReveal delay={0.4}>
          <div className="mt-16 p-8 bg-gradient-to-r from-watt-navy to-watt-navy/90 rounded-2xl text-white">
            <div className="flex flex-col md:flex-row md:items-center gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <MapPin className="w-5 h-5 text-watt-bitcoin" />
                  <span className="text-watt-bitcoin font-medium">Featured Facility</span>
                </div>
                <h3 className="text-2xl md:text-3xl font-bold mb-2">Alberta Heartland 135</h3>
                <p className="text-white/70 mb-4">
                  Our flagship facility showcasing industry-leading infrastructure in Alberta's energy corridor
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
                    <AnimatedCounter end={99.99} decimals={2} suffix="%" />
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
