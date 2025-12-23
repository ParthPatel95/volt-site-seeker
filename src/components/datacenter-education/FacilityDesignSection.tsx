import React, { useState } from 'react';
import { Building2, Box, Grid, Ruler, CheckCircle, ArrowRight, Zap, Wind, Shield, DollarSign } from 'lucide-react';
import { ScrollReveal } from '@/components/landing/ScrollAnimations';
import { AnimatedCounter } from '@/components/ui/AnimatedCounter';
import LearningObjectives from '@/components/academy/LearningObjectives';
import SectionSummary from '@/components/academy/SectionSummary';
import datacenter3dExterior from '@/assets/datacenter-3d-exterior.jpg';
import containerDeployment from '@/assets/datacenter-container-deployment.jpg';

const FacilityDesignSection = () => {
  const [activeFacilityType, setActiveFacilityType] = useState<'warehouse' | 'container' | 'modular'>('warehouse');

  const facilityTypes = {
    warehouse: {
      name: 'Warehouse Steel Building',
      subtitle: 'WattByte Alberta Style (135MW)',
      image: datacenter3dExterior,
      description: 'Purpose-built steel structure with high ceilings for optimal airflow. Most cost-effective for 50+ MW deployments.',
      buildTime: '12-18 months',
      scalability: 'Difficult post-construction',
      capex: '$150-250/kW',
      bestFor: 'Large-scale permanent deployments',
      specs: {
        structure: 'Pre-engineered steel',
        clearHeight: '24-30 ft eave height',
        foundation: '6" reinforced concrete',
        insulation: 'R-19 walls, R-30 roof',
        doors: '12x14 ft roll-up doors',
        electrical: 'Overhead busway or cable tray',
      },
      layout: [
        { name: 'Mining Floor', percentage: 65, description: 'ASIC racks with hot/cold aisles' },
        { name: 'Electrical Rooms', percentage: 15, description: 'Transformers, switchgear, PDUs' },
        { name: 'Substation Area', percentage: 10, description: 'Outdoor HV equipment yard' },
        { name: 'Support/NOC', percentage: 10, description: 'Control room, storage, staging' },
      ],
    },
    container: {
      name: 'Modular Container',
      subtitle: '40ft ISO Containers (1-2 MW each)',
      image: containerDeployment,
      description: 'Factory-built mining containers deployed to remote sites. Fastest path to production for distributed deployments.',
      buildTime: '4-8 weeks',
      scalability: 'Highly scalable',
      capex: '$300-500/kW',
      bestFor: 'Remote sites, stranded energy, fast deployment',
      specs: {
        structure: '40ft ISO shipping container',
        dimensions: '40 x 8 x 9.5 ft (2,720 cu ft)',
        weight: '~30,000 lbs loaded',
        cooling: 'Integrated RDHX or exhaust',
        electrical: 'Pre-wired PDUs, 480V input',
        miners: '200-300 per container',
      },
      layout: [
        { name: 'Mining Racks', percentage: 80, description: '4-6 rows of ASICs' },
        { name: 'Cooling Equipment', percentage: 10, description: 'RDHX, fans, piping' },
        { name: 'Electrical', percentage: 10, description: 'PDUs, breaker panel' },
      ],
    },
    modular: {
      name: 'Prefab Data Center',
      subtitle: 'Factory-Built Modules (5-10 MW each)',
      image: datacenter3dExterior,
      description: 'Large prefabricated modules shipped and assembled on-site. Balance of speed and scale.',
      buildTime: '6-10 months',
      scalability: 'Modular expansion',
      capex: '$200-350/kW',
      bestFor: 'Medium-scale with expansion plans',
      specs: {
        structure: 'Steel-framed prefab modules',
        moduleSize: '50 x 20 x 12 ft typical',
        foundation: 'Concrete piers or slab',
        cooling: 'Integrated air handling',
        electrical: 'Containerized substation',
        capacity: '5-10 MW per module',
      },
      layout: [
        { name: 'IT Hall Module', percentage: 70, description: 'Mining hardware rows' },
        { name: 'Power Module', percentage: 15, description: 'Transformers, switchgear' },
        { name: 'Cooling Module', percentage: 15, description: 'Dry coolers, pumps' },
      ],
    },
  };

  const currentFacility = facilityTypes[activeFacilityType];

  const civilRequirements = [
    { name: 'Site Grading', description: '2% slope for drainage', icon: Ruler },
    { name: 'Foundation', description: '6" reinforced concrete slab', icon: Grid },
    { name: 'Stormwater', description: 'Retention pond or drainage', icon: Wind },
    { name: 'Access Roads', description: '24 ft wide, 8" gravel min', icon: ArrowRight },
    { name: 'Security Fencing', description: '8 ft chain-link with barbed wire', icon: Shield },
    { name: 'Fire Access', description: '26 ft fire lane clearance', icon: Building2 },
  ];

  const comparisonMetrics = [
    { metric: 'Build Time', warehouse: '12-18 mo', container: '4-8 wks', modular: '6-10 mo', best: 'container' },
    { metric: 'CapEx ($/kW)', warehouse: '$150-250', container: '$300-500', modular: '$200-350', best: 'warehouse' },
    { metric: 'Scalability', warehouse: 'Fixed', container: 'Excellent', modular: 'Good', best: 'container' },
    { metric: 'Efficiency (PUE)', warehouse: '1.15-1.25', container: '1.20-1.40', modular: '1.15-1.30', best: 'warehouse' },
    { metric: 'Relocation', warehouse: 'None', container: 'Easy', modular: 'Possible', best: 'container' },
    { metric: 'Max Capacity', warehouse: '100+ MW', container: '50 MW', modular: '50 MW', best: 'warehouse' },
  ];

  return (
    <section id="facility-design" className="py-16 md:py-24 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <div className="text-center mb-12">
            <span className="inline-block px-4 py-1 rounded-full bg-watt-bitcoin/10 text-watt-bitcoin text-sm font-medium mb-4">
              Section 3 • Building Types
            </span>
            <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
              Facility Design & Layout
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
              Compare warehouse, container, and modular datacenter architectures for Bitcoin mining
            </p>
            {/* Industry Estimate Disclaimer */}
            <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-50 border border-amber-200">
              <span className="text-amber-600 text-sm">📊</span>
              <span className="text-xs text-amber-700">Build costs and timelines are industry estimates</span>
            </div>
          </div>
        </ScrollReveal>

        {/* Facility Type Selector */}
        <ScrollReveal delay={0.05}>
          <div className="flex flex-wrap justify-center gap-3 mb-10">
            {[
              { id: 'warehouse' as const, name: 'Warehouse', icon: Building2, capacity: '50-200 MW' },
              { id: 'container' as const, name: 'Container', icon: Box, capacity: '1-2 MW/unit' },
              { id: 'modular' as const, name: 'Prefab Modular', icon: Grid, capacity: '5-10 MW/unit' },
            ].map((type) => (
              <button
                key={type.id}
                onClick={() => setActiveFacilityType(type.id)}
                className={`flex items-center gap-3 px-5 py-3 rounded-xl transition-all ${
                  activeFacilityType === type.id
                    ? 'bg-watt-bitcoin text-white shadow-lg shadow-watt-bitcoin/30'
                    : 'bg-card border border-border hover:border-watt-bitcoin/50'
                }`}
              >
                <type.icon className="w-5 h-5" />
                <div className="text-left">
                  <div className="font-semibold text-sm">{type.name}</div>
                  <div className={`text-xs ${activeFacilityType === type.id ? 'text-white/70' : 'text-muted-foreground'}`}>
                    {type.capacity}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </ScrollReveal>

        {/* Active Facility Details */}
        <ScrollReveal delay={0.1}>
          <div className="grid lg:grid-cols-2 gap-6 mb-12">
            {/* Image */}
            <div className="relative h-64 md:h-80 rounded-2xl overflow-hidden">
              <img 
                src={currentFacility.image} 
                alt={currentFacility.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-5">
                <h3 className="text-xl md:text-2xl font-bold text-white mb-1">{currentFacility.name}</h3>
                <p className="text-white/70 text-sm">{currentFacility.subtitle}</p>
                <div className="flex flex-wrap gap-2 mt-3">
                  <span className="px-2 py-1 bg-watt-bitcoin/90 text-white rounded text-xs font-medium">
                    Build: {currentFacility.buildTime}
                  </span>
                  <span className="px-2 py-1 bg-white/20 text-white rounded text-xs">
                    {currentFacility.capex}
                  </span>
                </div>
              </div>
            </div>

            {/* Details */}
            <div className="bg-card rounded-2xl border border-border p-6">
              <p className="text-muted-foreground mb-6">{currentFacility.description}</p>
              
              {/* Key Metrics */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="p-3 bg-muted/50 rounded-xl text-center">
                  <Zap className="w-5 h-5 text-watt-bitcoin mx-auto mb-1" />
                  <div className="text-xs text-muted-foreground">Build Time</div>
                  <div className="font-semibold text-foreground">{currentFacility.buildTime}</div>
                </div>
                <div className="p-3 bg-muted/50 rounded-xl text-center">
                  <DollarSign className="w-5 h-5 text-green-500 mx-auto mb-1" />
                  <div className="text-xs text-muted-foreground">CapEx</div>
                  <div className="font-semibold text-foreground">{currentFacility.capex}</div>
                </div>
              </div>

              {/* Specifications */}
              <h4 className="font-semibold text-foreground mb-3">Specifications</h4>
              <div className="grid grid-cols-2 gap-2 mb-6">
                {Object.entries(currentFacility.specs).map(([key, value]) => (
                  <div key={key} className="text-sm">
                    <span className="text-muted-foreground capitalize">{key.replace(/([A-Z])/g, ' $1')}: </span>
                    <span className="text-foreground font-medium">{value}</span>
                  </div>
                ))}
              </div>

              {/* Best For */}
              <div className="p-3 bg-watt-bitcoin/10 rounded-lg">
                <span className="text-sm font-medium text-foreground">Best For: </span>
                <span className="text-sm text-muted-foreground">{currentFacility.bestFor}</span>
              </div>
            </div>
          </div>
        </ScrollReveal>

        {/* Space Allocation Layout */}
        <ScrollReveal delay={0.15}>
          <div className="bg-card rounded-2xl border border-border p-6 mb-12">
            <h3 className="text-xl font-bold text-foreground mb-6">Space Allocation</h3>
            <div className="space-y-4">
              {currentFacility.layout.map((area, i) => (
                <div key={area.name} className="flex items-center gap-4">
                  <div className="w-24 text-sm font-medium text-foreground">{area.name}</div>
                  <div className="flex-1">
                    <div className="relative h-8 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="absolute inset-y-0 left-0 bg-gradient-to-r from-watt-bitcoin to-watt-bitcoin/70 rounded-full transition-all duration-700 flex items-center justify-end pr-3"
                        style={{ width: `${area.percentage}%` }}
                      >
                        <span className="text-xs font-bold text-white">{area.percentage}%</span>
                      </div>
                    </div>
                  </div>
                  <div className="w-40 text-xs text-muted-foreground hidden sm:block">{area.description}</div>
                </div>
              ))}
            </div>
          </div>
        </ScrollReveal>

        {/* Comparison Table */}
        <ScrollReveal delay={0.2}>
          <div className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-foreground">Facility Type Comparison</h3>
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-amber-100 text-amber-700 text-xs font-medium rounded">
                Industry Estimates
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm bg-card rounded-xl border border-border">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-4 px-4 font-medium text-foreground">Metric</th>
                    <th className="text-center py-4 px-4 font-medium text-foreground">Warehouse</th>
                    <th className="text-center py-4 px-4 font-medium text-foreground">Container</th>
                    <th className="text-center py-4 px-4 font-medium text-foreground">Modular</th>
                  </tr>
                </thead>
                <tbody>
                  {comparisonMetrics.map((row) => (
                    <tr key={row.metric} className="border-b border-border/50 hover:bg-muted/30">
                      <td className="py-3 px-4 font-medium text-foreground">{row.metric}</td>
                      <td className={`py-3 px-4 text-center ${row.best === 'warehouse' ? 'text-watt-bitcoin font-semibold' : 'text-muted-foreground'}`}>
                        {row.best === 'warehouse' && <CheckCircle className="w-4 h-4 inline mr-1" />}
                        {row.warehouse}
                      </td>
                      <td className={`py-3 px-4 text-center ${row.best === 'container' ? 'text-watt-bitcoin font-semibold' : 'text-muted-foreground'}`}>
                        {row.best === 'container' && <CheckCircle className="w-4 h-4 inline mr-1" />}
                        {row.container}
                      </td>
                      <td className={`py-3 px-4 text-center ${row.best === 'modular' ? 'text-watt-bitcoin font-semibold' : 'text-muted-foreground'}`}>
                        {row.best === 'modular' && <CheckCircle className="w-4 h-4 inline mr-1" />}
                        {row.modular}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </ScrollReveal>

        {/* Civil Requirements */}
        <ScrollReveal delay={0.25}>
          <div>
            <h3 className="text-xl font-bold text-foreground mb-6">Site Civil Requirements</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {civilRequirements.map((req) => (
                <div key={req.name} className="bg-card rounded-xl border border-border p-4 text-center hover:border-watt-bitcoin/50 transition-colors">
                  <req.icon className="w-8 h-8 text-watt-bitcoin mx-auto mb-2" />
                  <div className="font-semibold text-foreground text-sm mb-1">{req.name}</div>
                  <div className="text-xs text-muted-foreground">{req.description}</div>
                </div>
              ))}
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
};

export default FacilityDesignSection;
