import React, { useState } from 'react';
import { Building2, Server, Zap, Wind, Shield, Users, MonitorDot } from 'lucide-react';
import { ScrollReveal } from '@/components/landing/ScrollAnimations';

const DatacenterLayoutSection = () => {
  const [activeZone, setActiveZone] = useState<string | null>(null);

  const facilityZones = [
    {
      id: 'mining-floor',
      name: 'Mining Floor',
      icon: Server,
      color: 'bg-[hsl(var(--watt-bitcoin))]',
      position: { top: '30%', left: '20%', width: '40%', height: '50%' },
      description: 'Main mining hall housing thousands of ASIC miners in organized racks',
      specs: ['5,000-50,000 miners', 'Hot/cold aisle containment', 'Cable management systems'],
    },
    {
      id: 'power-room',
      name: 'Electrical Room',
      icon: Zap,
      color: 'bg-yellow-500',
      position: { top: '30%', left: '65%', width: '15%', height: '30%' },
      description: 'Transformers, switchgear, and power distribution units',
      specs: ['Medium voltage switchgear', 'PDUs and bus bars', 'UPS systems'],
    },
    {
      id: 'cooling-plant',
      name: 'Cooling Plant',
      icon: Wind,
      color: 'bg-cyan-500',
      position: { top: '65%', left: '65%', width: '15%', height: '20%' },
      description: 'Cooling towers, chillers, or immersion cooling infrastructure',
      specs: ['Cooling towers', 'Chiller units', 'Pump stations'],
    },
    {
      id: 'security',
      name: 'Security & Entry',
      icon: Shield,
      color: 'bg-red-500',
      position: { top: '10%', left: '20%', width: '15%', height: '15%' },
      description: 'Access control, monitoring, and security personnel',
      specs: ['24/7 surveillance', 'Biometric access', 'Man traps'],
    },
    {
      id: 'noc',
      name: 'Network Operations',
      icon: MonitorDot,
      color: 'bg-green-500',
      position: { top: '10%', left: '40%', width: '20%', height: '15%' },
      description: 'Monitoring center for facility management and miner operations',
      specs: ['DCIM software', 'Network equipment', 'Real-time dashboards'],
    },
    {
      id: 'offices',
      name: 'Admin & Offices',
      icon: Users,
      color: 'bg-purple-500',
      position: { top: '85%', left: '20%', width: '25%', height: '10%' },
      description: 'Administrative offices and staff facilities',
      specs: ['Office space', 'Break rooms', 'Meeting areas'],
    },
  ];

  const activeZoneData = facilityZones.find(z => z.id === activeZone);

  return (
    <section className="py-16 md:py-24 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Datacenter Layout
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Interactive exploration of a typical Bitcoin mining facility layout
            </p>
          </div>
        </ScrollReveal>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Interactive Floor Plan */}
          <ScrollReveal delay={0.1} className="lg:col-span-2">
            <div className="relative aspect-[4/3] bg-muted/30 rounded-2xl border border-border overflow-hidden">
              {/* Grid background */}
              <div className="absolute inset-0" style={{
                backgroundImage: `
                  linear-gradient(to right, hsl(var(--border)) 1px, transparent 1px),
                  linear-gradient(to bottom, hsl(var(--border)) 1px, transparent 1px)
                `,
                backgroundSize: '40px 40px',
              }} />

              {/* Facility outline */}
              <div className="absolute inset-[5%] border-2 border-dashed border-muted-foreground/30 rounded-xl" />

              {/* Zone blocks */}
              {facilityZones.map((zone) => (
                <div
                  key={zone.id}
                  className={`absolute cursor-pointer transition-all duration-300 rounded-lg flex items-center justify-center ${zone.color} ${
                    activeZone === zone.id 
                      ? 'ring-4 ring-white shadow-lg scale-105 z-10' 
                      : 'opacity-70 hover:opacity-100'
                  }`}
                  style={zone.position}
                  onMouseEnter={() => setActiveZone(zone.id)}
                  onMouseLeave={() => setActiveZone(null)}
                  onClick={() => setActiveZone(activeZone === zone.id ? null : zone.id)}
                >
                  <div className="text-center text-white p-2">
                    <zone.icon className="w-6 h-6 md:w-8 md:h-8 mx-auto mb-1" />
                    <span className="text-xs md:text-sm font-medium hidden md:block">{zone.name}</span>
                  </div>
                </div>
              ))}

              {/* Compass */}
              <div className="absolute top-4 right-4 w-12 h-12 rounded-full bg-card border border-border flex items-center justify-center">
                <div className="relative w-8 h-8">
                  <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-[hsl(var(--watt-bitcoin))]">N</div>
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 text-[8px] text-muted-foreground">S</div>
                </div>
              </div>

              {/* Scale */}
              <div className="absolute bottom-4 right-4 flex items-center gap-2 bg-card/80 px-3 py-1.5 rounded-lg border border-border">
                <div className="w-12 h-1 bg-foreground rounded" />
                <span className="text-xs text-muted-foreground">100m</span>
              </div>
            </div>
          </ScrollReveal>

          {/* Zone Details */}
          <ScrollReveal delay={0.2}>
            <div className="space-y-4">
              <h3 className="font-semibold text-foreground">Facility Zones</h3>
              
              {activeZoneData ? (
                <div className="p-6 bg-card rounded-xl border border-[hsl(var(--watt-bitcoin))]">
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`w-10 h-10 rounded-lg ${activeZoneData.color} flex items-center justify-center`}>
                      <activeZoneData.icon className="w-5 h-5 text-white" />
                    </div>
                    <h4 className="text-lg font-semibold text-foreground">{activeZoneData.name}</h4>
                  </div>
                  <p className="text-muted-foreground text-sm mb-4">{activeZoneData.description}</p>
                  <ul className="space-y-2">
                    {activeZoneData.specs.map((spec, i) => (
                      <li key={i} className="text-sm text-foreground flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-[hsl(var(--watt-bitcoin))]" />
                        {spec}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <div className="p-6 bg-card rounded-xl border border-border text-center text-muted-foreground">
                  <Building2 className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Hover over a zone to see details</p>
                </div>
              )}

              {/* Quick zone list */}
              <div className="grid grid-cols-2 gap-2">
                {facilityZones.map((zone) => (
                  <button
                    key={zone.id}
                    className={`p-3 rounded-lg border text-left transition-colors ${
                      activeZone === zone.id
                        ? 'bg-muted border-[hsl(var(--watt-bitcoin))]'
                        : 'bg-card border-border hover:border-muted-foreground'
                    }`}
                    onMouseEnter={() => setActiveZone(zone.id)}
                    onMouseLeave={() => setActiveZone(null)}
                  >
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${zone.color}`} />
                      <span className="text-xs font-medium text-foreground">{zone.name}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </ScrollReveal>
        </div>

        {/* Alberta Heartland 135 Callout */}
        <ScrollReveal delay={0.3}>
          <div className="mt-12 p-6 md:p-8 bg-gradient-to-r from-[hsl(var(--watt-navy))] to-[hsl(var(--watt-navy)/0.9)] rounded-2xl text-white">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2 py-1 bg-[hsl(var(--watt-bitcoin)/0.2)] text-[hsl(var(--watt-bitcoin))] text-xs font-medium rounded">
                    Featured Facility
                  </span>
                </div>
                <h3 className="text-2xl font-bold mb-2">Alberta Heartland 135</h3>
                <p className="text-white/70 max-w-xl">
                  WattByte's flagship 135MW air-cooled facility in Alberta, Canada. 
                  26 acres with direct AESO grid connection and cold climate advantage.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="p-4 bg-white/10 rounded-xl">
                  <div className="text-2xl font-bold text-[hsl(var(--watt-bitcoin))]">135 MW</div>
                  <div className="text-xs text-white/60">Power Capacity</div>
                </div>
                <div className="p-4 bg-white/10 rounded-xl">
                  <div className="text-2xl font-bold text-[hsl(var(--watt-bitcoin))]">26 Acres</div>
                  <div className="text-xs text-white/60">Facility Size</div>
                </div>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
};

export default DatacenterLayoutSection;