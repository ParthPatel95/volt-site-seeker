import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Building2, Box, Grid, Ruler, CheckCircle, ArrowRight, Zap, Wind, Shield, DollarSign } from 'lucide-react';
import { AnimatedCounter } from '@/components/ui/AnimatedCounter';
import LearningObjectives from '@/components/academy/LearningObjectives';
import SectionSummary from '@/components/academy/SectionSummary';
import {
  DCESectionWrapper,
  DCESectionHeader,
  DCEContentCard,
  DCEKeyInsight,
  DCEDeepDive
} from './shared';
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

  const facilityButtons = [
    { id: 'warehouse' as const, name: 'Warehouse', icon: Building2, capacity: '50-200 MW' },
    { id: 'container' as const, name: 'Container', icon: Box, capacity: '1-2 MW/unit' },
    { id: 'modular' as const, name: 'Prefab Modular', icon: Grid, capacity: '5-10 MW/unit' },
  ];

  return (
    <DCESectionWrapper theme="accent" id="facility-design">
      <DCESectionHeader
        badge="Section 3 • Building Types"
        badgeIcon={Building2}
        title="Facility Design & Layout"
        description="Compare warehouse, container, and modular datacenter architectures for Bitcoin mining"
      />

      {/* Industry Estimate Disclaimer */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="flex justify-center mb-8"
      >
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-50 border border-amber-200">
          <span className="text-amber-600 text-sm">📊</span>
          <span className="text-xs text-amber-700">Build costs and timelines are industry estimates</span>
        </div>
      </motion.div>

      {/* Facility Type Selector */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="flex flex-wrap justify-center gap-3 mb-10"
      >
        {facilityButtons.map((type) => (
          <button
            key={type.id}
            onClick={() => setActiveFacilityType(type.id)}
            className={`flex items-center gap-3 px-5 py-3 rounded-xl transition-all ${
              activeFacilityType === type.id
                ? 'bg-[hsl(var(--watt-bitcoin))] text-white shadow-lg shadow-[hsl(var(--watt-bitcoin)/0.3)]'
                : 'bg-card border border-border hover:border-[hsl(var(--watt-bitcoin)/0.5)]'
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
                <span className="px-2 py-1 bg-[hsl(var(--watt-bitcoin)/0.9)] text-white rounded text-xs font-medium">
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
                <Zap className="w-5 h-5 text-[hsl(var(--watt-bitcoin))] mx-auto mb-1" />
                <div className="text-xs text-muted-foreground">Build Time</div>
                <div className="font-semibold text-foreground">{currentFacility.buildTime}</div>
              </div>
              <div className="p-3 bg-muted/50 rounded-xl text-center">
                <DollarSign className="w-5 h-5 text-emerald-500 mx-auto mb-1" />
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
            <div className="p-3 bg-[hsl(var(--watt-bitcoin)/0.1)] rounded-lg">
              <span className="text-sm font-medium text-foreground">Best For: </span>
              <span className="text-sm text-muted-foreground">{currentFacility.bestFor}</span>
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
        <h3 className="text-xl font-bold text-foreground mb-6">Space Allocation</h3>
        <div className="space-y-4">
          {currentFacility.layout.map((area, i) => (
            <div key={area.name} className="flex items-center gap-4">
              <div className="w-24 text-sm font-medium text-foreground">{area.name}</div>
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
              <div className="w-40 text-xs text-muted-foreground hidden sm:block">{area.description}</div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Key Insight */}
      <DCEKeyInsight variant="insight" className="mb-8">
        Warehouse-style buildings offer the lowest cost per kW ($150-250) and best PUE (1.15-1.25), but require 
        12-18 months to build. Containers deploy in 4-8 weeks but cost 2x more per kW.
      </DCEKeyInsight>

      {/* Comparison Table */}
      <DCEDeepDive title="Facility Type Comparison" icon={Building2} className="mb-12">
        <div className="flex items-center justify-end mb-4">
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-amber-100 text-amber-700 text-xs font-medium rounded">
            Industry Estimates
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm bg-card rounded-xl">
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
                  <td className={`py-3 px-4 text-center ${row.best === 'warehouse' ? 'text-[hsl(var(--watt-bitcoin))] font-semibold' : 'text-muted-foreground'}`}>
                    {row.best === 'warehouse' && <CheckCircle className="w-4 h-4 inline mr-1" />}
                    {row.warehouse}
                  </td>
                  <td className={`py-3 px-4 text-center ${row.best === 'container' ? 'text-[hsl(var(--watt-bitcoin))] font-semibold' : 'text-muted-foreground'}`}>
                    {row.best === 'container' && <CheckCircle className="w-4 h-4 inline mr-1" />}
                    {row.container}
                  </td>
                  <td className={`py-3 px-4 text-center ${row.best === 'modular' ? 'text-[hsl(var(--watt-bitcoin))] font-semibold' : 'text-muted-foreground'}`}>
                    {row.best === 'modular' && <CheckCircle className="w-4 h-4 inline mr-1" />}
                    {row.modular}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </DCEDeepDive>

      {/* Civil Requirements */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
      >
        <h3 className="text-xl font-bold text-foreground mb-6">Site Civil Requirements</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {civilRequirements.map((req, index) => (
            <motion.div
              key={req.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
              className="bg-card rounded-xl border border-border p-4 text-center hover:border-[hsl(var(--watt-bitcoin)/0.5)] hover:shadow-lg transition-all duration-300"
            >
              <req.icon className="w-8 h-8 text-[hsl(var(--watt-bitcoin))] mx-auto mb-2" />
              <div className="font-semibold text-foreground text-sm mb-1">{req.name}</div>
              <div className="text-xs text-muted-foreground">{req.description}</div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      <SectionSummary
        takeaways={[
          "Warehouse buildings: lowest cost ($150-250/kW), best PUE, but 12-18 month build time",
          "Containers: fastest deployment (4-8 weeks), highly scalable, but higher cost ($300-500/kW)",
          "Modular prefab: balance of speed and cost, good for phased expansion",
          "65% of facility space typically dedicated to mining floor in warehouse designs"
        ]}
        nextSteps={[
          { title: "Airflow & Containment", href: "#airflow", description: "Learn hot/cold aisle strategies for thermal management" }
        ]}
        proTip="For stranded energy sites with uncertain timelines, start with containers and transition to permanent structures once power agreements are finalized."
      />
    </DCESectionWrapper>
  );
};

export default FacilityDesignSection;
