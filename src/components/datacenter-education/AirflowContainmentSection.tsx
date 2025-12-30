import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wind, Thermometer, ArrowRight, ArrowUp, ArrowDown, Info, AlertTriangle, CheckCircle, Gauge } from 'lucide-react';
import LearningObjectives from '@/components/academy/LearningObjectives';
import SectionSummary from '@/components/academy/SectionSummary';
import {
  DCESectionWrapper,
  DCESectionHeader,
  DCEContentCard,
  DCEKeyInsight,
  DCEDeepDive
} from './shared';
import miningFloorInterior from '@/assets/datacenter-mining-floor-interior.jpg';

const AirflowContainmentSection = () => {
  const [activeContainment, setActiveContainment] = useState<'hot' | 'cold'>('hot');

  const containmentTypes = {
    hot: {
      name: 'Hot Aisle Containment (HAC)',
      description: 'Hot exhaust air is contained and directed to return/exhaust. Room ambient stays cool. Most common for mining.',
      advantages: [
        'Room stays comfortable for workers',
        'Electronics in room run cooler',
        'Fire suppression unaffected',
        'Most common implementation',
      ],
      disadvantages: [
        'Hot aisle can exceed 120°F (49°C)',
        'Requires sealed ceiling/plenum',
        'More complex structure',
      ],
      temperatures: {
        coldAisle: '65-80°F (18-27°C)',
        hotAisle: '95-130°F (35-55°C)',
        room: '68-75°F (20-24°C)',
      },
    },
    cold: {
      name: 'Cold Aisle Containment (CAC)',
      description: 'Cold supply air is contained and delivered to equipment intakes. Hot exhaust mixes in room.',
      advantages: [
        'Simpler to implement',
        'Works with raised floor',
        'Lower construction cost',
        'Easier expansion',
      ],
      disadvantages: [
        'Room runs hot (not comfortable)',
        'Electronics in room run warmer',
        'Fire suppression challenges',
      ],
      temperatures: {
        coldAisle: '65-75°F (18-24°C)',
        hotAisle: '95-120°F (35-49°C)',
        room: '85-100°F (29-38°C)',
      },
    },
  };

  const currentContainment = containmentTypes[activeContainment];

  const airflowProblems = [
    {
      name: 'Bypass Air',
      description: 'Cold air that bypasses equipment and goes directly to return. Wastes cooling capacity.',
      causes: ['Gaps in containment', 'Missing blanking panels', 'Cable openings'],
      impact: 'Up to 40% cooling capacity loss',
      solution: 'Seal gaps, install blanking panels',
    },
    {
      name: 'Recirculation',
      description: 'Hot exhaust air that recirculates to equipment intakes. Causes overheating.',
      causes: ['Inadequate exhaust', 'Poor containment', 'Unbalanced airflow'],
      impact: 'Inlet temps 10-20°F higher than supply',
      solution: 'Improve containment, balance CFM',
    },
    {
      name: 'Short-Cycling',
      description: 'Hot air from one row immediately enters adjacent cold aisle.',
      causes: ['Missing aisle doors', 'Incorrect rack placement', 'Open ends'],
      impact: 'Hot spots, premature equipment failure',
      solution: 'Install end caps, maintain row integrity',
    },
  ];

  const sensorPlacement = [
    { location: 'Cold Aisle Inlet', purpose: 'Monitor supply air delivery', target: '65-80°F' },
    { location: 'Hot Aisle Exhaust', purpose: 'Verify heat removal', target: 'Under 130°F' },
    { location: 'Rack Inlet (Front)', purpose: 'Equipment intake temp', target: 'Under 95°F' },
    { location: 'Rack Exhaust (Rear)', purpose: 'Equipment exhaust', target: 'Under 120°F' },
    { location: 'Room Ambient', purpose: 'General room conditions', target: '68-80°F' },
    { location: 'Outside Air', purpose: 'Economizer control', target: 'Variable' },
  ];

  return (
    <DCESectionWrapper theme="light" id="airflow">
      <LearningObjectives
        objectives={[
          "Compare Hot Aisle vs Cold Aisle containment strategies and when to use each",
          "Understand Computational Fluid Dynamics (CFD) basics for facility design",
          "Identify and solve common airflow problems: bypass, recirculation, short-cycling",
          "Learn temperature sensor placement for effective thermal monitoring"
        ]}
        estimatedTime="8 min"
        prerequisites={[
          { title: "Facility Design", href: "#facility-design" }
        ]}
      />
      
      <DCESectionHeader
        badge="Section 4 • Thermal Management"
        badgeIcon={Wind}
        title="Airflow & Containment"
        description="Hot/cold aisle strategies and CFD principles for optimal thermal performance"
      />

      {/* Mining Floor Image */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="relative rounded-2xl overflow-hidden mb-10 h-48 md:h-64"
      >
        <img 
          src={miningFloorInterior} 
          alt="Mining floor with hot/cold aisle containment" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/80 via-transparent to-red-900/80" />
        <div className="absolute inset-0 flex items-center justify-between p-6 md:p-10">
          <div className="text-white">
            <div className="flex items-center gap-2 text-blue-300 mb-1">
              <ArrowDown className="w-5 h-5" />
              <span className="font-medium">Cold Aisle</span>
            </div>
            <div className="text-2xl font-bold">65-80°F</div>
            <div className="text-xs text-white/70">(18-27°C)</div>
          </div>
          <div className="text-white text-right">
            <div className="flex items-center gap-2 text-red-300 mb-1 justify-end">
              <span className="font-medium">Hot Aisle</span>
              <ArrowUp className="w-5 h-5" />
            </div>
            <div className="text-2xl font-bold">95-130°F</div>
            <div className="text-xs text-white/70">(35-55°C)</div>
          </div>
        </div>
      </motion.div>

      {/* Containment Type Toggle */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="flex justify-center gap-3 mb-10"
      >
        {[
          { id: 'hot' as const, name: 'Hot Aisle Containment', icon: '🔴' },
          { id: 'cold' as const, name: 'Cold Aisle Containment', icon: '🔵' },
        ].map((type) => (
          <button
            key={type.id}
            onClick={() => setActiveContainment(type.id)}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl font-medium transition-all ${
              activeContainment === type.id
                ? 'bg-[hsl(var(--watt-bitcoin))] text-white shadow-lg shadow-[hsl(var(--watt-bitcoin)/0.3)]'
                : 'bg-card border border-border text-muted-foreground hover:border-[hsl(var(--watt-bitcoin)/0.5)]'
            }`}
          >
            <span>{type.icon}</span>
            {type.name}
          </button>
        ))}
      </motion.div>

      {/* Active Containment Details */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeContainment}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="grid lg:grid-cols-2 gap-6 mb-12"
        >
          {/* Animated Cross-Section Diagram */}
          <div className="bg-card rounded-2xl border border-border p-6">
            <h3 className="text-lg font-bold text-foreground mb-4">Airflow Cross-Section</h3>
            
            <div className="relative h-64 bg-muted/30 rounded-xl overflow-hidden">
              {/* Floor */}
              <div className="absolute bottom-0 left-0 right-0 h-4 bg-muted-foreground/20" />
              
              {/* Racks */}
              <div className="absolute bottom-4 left-[15%] w-[20%] h-[70%] bg-muted border border-border rounded-t flex flex-col justify-between p-2">
                <div className="text-[10px] text-center text-muted-foreground">Rack A</div>
                <div className="flex flex-col gap-1">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-2 bg-[hsl(var(--watt-bitcoin)/0.4)] rounded" />
                  ))}
                </div>
              </div>
              
              <div className="absolute bottom-4 right-[15%] w-[20%] h-[70%] bg-muted border border-border rounded-t flex flex-col justify-between p-2">
                <div className="text-[10px] text-center text-muted-foreground">Rack B</div>
                <div className="flex flex-col gap-1">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-2 bg-[hsl(var(--watt-bitcoin)/0.4)] rounded" />
                  ))}
                </div>
              </div>

              {/* Aisle between racks */}
              <div className={`absolute bottom-4 left-[35%] w-[30%] h-[70%] flex items-center justify-center ${
                activeContainment === 'hot' ? 'bg-red-500/20' : 'bg-blue-500/20'
              }`}>
                <div className="text-center">
                  <div className={`text-sm font-bold ${activeContainment === 'hot' ? 'text-red-500' : 'text-blue-500'}`}>
                    {activeContainment === 'hot' ? 'Hot Aisle' : 'Cold Aisle'}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {activeContainment === 'hot' ? '95-130°F' : '65-75°F'}
                  </div>
                </div>
              </div>

              {/* Containment ceiling */}
              {activeContainment === 'hot' && (
                <div className="absolute top-[26%] left-[35%] w-[30%] h-2 bg-muted-foreground/50 rounded" />
              )}
              {activeContainment === 'cold' && (
                <div className="absolute top-[26%] left-[15%] w-[20%] h-2 bg-muted-foreground/50 rounded" />
              )}

              {/* Airflow arrows */}
              <motion.div 
                className="absolute bottom-[30%] left-[5%] flex items-center text-blue-500"
                animate={{ x: [0, 5, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <ArrowRight className="w-6 h-6" />
                <span className="text-[10px]">Supply</span>
              </motion.div>
              <motion.div 
                className="absolute top-[10%] right-[5%] flex items-center text-red-500"
                animate={{ x: [0, 5, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <span className="text-[10px]">Exhaust</span>
                <ArrowRight className="w-6 h-6" />
              </motion.div>
            </div>

            <div className="mt-4 p-3 bg-muted/30 rounded-lg">
              <p className="text-xs text-muted-foreground">{currentContainment.description}</p>
            </div>
          </div>

          {/* Details Panel */}
          <div className="bg-card rounded-2xl border border-border p-6">
            <h3 className="text-lg font-bold text-foreground mb-4">{currentContainment.name}</h3>
            
            {/* Temperature Display */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              {Object.entries(currentContainment.temperatures).map(([zone, temp]) => (
                <div key={zone} className={`p-3 rounded-xl text-center ${
                  zone === 'coldAisle' ? 'bg-blue-500/10' : zone === 'hotAisle' ? 'bg-red-500/10' : 'bg-muted/50'
                }`}>
                  <div className="text-xs text-muted-foreground capitalize mb-1">
                    {zone.replace(/([A-Z])/g, ' $1')}
                  </div>
                  <div className={`font-bold text-sm ${
                    zone === 'coldAisle' ? 'text-blue-500' : zone === 'hotAisle' ? 'text-red-500' : 'text-foreground'
                  }`}>
                    {temp}
                  </div>
                </div>
              ))}
            </div>

            {/* Pros & Cons */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-medium text-emerald-600 mb-2 flex items-center gap-1">
                  <CheckCircle className="w-4 h-4" /> Advantages
                </h4>
                <ul className="space-y-1">
                  {currentContainment.advantages.map((adv, i) => (
                    <li key={i} className="text-xs text-muted-foreground flex items-start gap-1">
                      <span className="text-emerald-500 mt-0.5">•</span>
                      {adv}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="text-sm font-medium text-amber-600 mb-2 flex items-center gap-1">
                  <AlertTriangle className="w-4 h-4" /> Disadvantages
                </h4>
                <ul className="space-y-1">
                  {currentContainment.disadvantages.map((dis, i) => (
                    <li key={i} className="text-xs text-muted-foreground flex items-start gap-1">
                      <span className="text-amber-500 mt-0.5">•</span>
                      {dis}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Key Insight */}
      <DCEKeyInsight variant="insight" className="mb-8">
        Hot aisle containment is preferred for Bitcoin mining because it keeps the ambient room comfortable for 
        workers and allows fire suppression systems to operate normally in the cool environment.
      </DCEKeyInsight>

      {/* Common Airflow Problems */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="mb-12"
      >
        <h3 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
          <AlertTriangle className="w-6 h-6 text-amber-500" />
          Common Airflow Problems
        </h3>
        <div className="grid md:grid-cols-3 gap-4">
          {airflowProblems.map((problem, index) => (
            <motion.div
              key={problem.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="bg-card rounded-2xl border border-border p-5 hover:border-amber-500/50 hover:shadow-lg transition-all duration-300"
            >
              <h4 className="font-bold text-foreground mb-2">{problem.name}</h4>
              <p className="text-sm text-muted-foreground mb-3">{problem.description}</p>
              
              <div className="space-y-2 text-xs">
                <div>
                  <span className="font-medium text-foreground">Causes: </span>
                  <span className="text-muted-foreground">{problem.causes.join(', ')}</span>
                </div>
                <div className="p-2 bg-red-500/10 rounded">
                  <span className="font-medium text-red-600">Impact: </span>
                  <span className="text-red-500">{problem.impact}</span>
                </div>
                <div className="p-2 bg-emerald-500/10 rounded">
                  <span className="font-medium text-emerald-600">Solution: </span>
                  <span className="text-emerald-500">{problem.solution}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Temperature Sensor Placement */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="bg-muted/30 rounded-2xl border border-border p-6"
      >
        <h3 className="text-xl font-bold text-foreground mb-2 flex items-center gap-2">
          <Gauge className="w-6 h-6 text-[hsl(var(--watt-bitcoin))]" />
          Temperature Sensor Placement
        </h3>
        <p className="text-sm text-muted-foreground mb-6">
          Critical monitoring points for thermal management and control
        </p>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {sensorPlacement.map((sensor, index) => (
            <motion.div
              key={sensor.location}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className="bg-card rounded-xl border border-border p-3 text-center hover:border-[hsl(var(--watt-bitcoin)/0.5)] transition-colors"
            >
              <Thermometer className="w-6 h-6 text-[hsl(var(--watt-bitcoin))] mx-auto mb-2" />
              <div className="font-medium text-foreground text-xs mb-1">{sensor.location}</div>
              <div className="text-[10px] text-muted-foreground mb-2">{sensor.purpose}</div>
              <span className="px-2 py-0.5 bg-[hsl(var(--watt-bitcoin)/0.1)] text-[hsl(var(--watt-bitcoin))] rounded text-[10px] font-mono">
                {sensor.target}
              </span>
            </motion.div>
          ))}
        </div>
      </motion.div>

      <SectionSummary
        takeaways={[
          "Hot aisle containment (HAC) is preferred for mining — keeps room cool for workers",
          "Bypass air can waste up to 40% of cooling capacity — seal all gaps",
          "Monitor 6 key temperature points: cold aisle, hot aisle, rack inlet/exhaust, room, and outside air",
          "Target cold aisle temps of 65-80°F (18-27°C) for optimal ASIC performance"
        ]}
        nextSteps={[
          { title: "Cooling Systems", href: "#cooling-systems", description: "Explore air, hydro, and immersion cooling technologies" }
        ]}
        proTip="Install blanking panels in all unused rack positions — they cost under $50 each but can improve cooling efficiency by 10-20%."
      />
    </DCESectionWrapper>
  );
};

export default AirflowContainmentSection;
