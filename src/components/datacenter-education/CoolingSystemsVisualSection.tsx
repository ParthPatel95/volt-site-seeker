import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Wind, Droplets, Waves, Thermometer, CheckCircle, XCircle, TrendingDown, Calculator, Info, Lightbulb, Zap } from 'lucide-react';
import { PUE_RANGES, DATA_DISCLAIMER } from '@/constants/mining-data';
import LearningObjectives from '@/components/academy/LearningObjectives';
import SectionSummary from '@/components/academy/SectionSummary';
import DecisionCard from '@/components/academy/DecisionCard';
import CaseStudy from '@/components/academy/CaseStudy';
import { DCESectionWrapper, DCESectionHeader, DCEContentCard, DCEKeyInsight, DCEDeepDive, DCEStepByStep } from './shared';
import airCooledImage from '@/assets/datacenter-air-cooled.jpg';
import hydroImage from '@/assets/datacenter-hydro.jpg';
import immersionImage from '@/assets/datacenter-immersion.jpg';

const CoolingSystemsVisualSection = () => {
  const [activeCooling, setActiveCooling] = useState('air');
  const [showCFMCalculator, setShowCFMCalculator] = useState(false);

  // Engineering-accurate cooling system specifications using centralized PUE constants
  const coolingSystems = [
    {
      id: 'air',
      name: 'Air-Cooled',
      icon: Wind,
      image: airCooledImage,
      pue: `${PUE_RANGES.AIR_COOLED.min.toFixed(2)} - ${PUE_RANGES.AIR_COOLED.max.toFixed(2)}`,
      pueNote: PUE_RANGES.AIR_COOLED.notes,
      description: 'Hot/cold aisle containment with exhaust fan walls. Leverages cold outside air for free cooling 8,000+ hours/year in northern climates.',
      howItWorks: [
        { step: 'Cold air enters through intake louvers or wall openings', detail: 'Intake sized for 400 fpm max velocity' },
        { step: 'Air flows through cold aisle, across miners (front-to-back)', detail: 'Each miner needs 200-350 CFM' },
        { step: 'Hot exhaust air (95-130°F) collected in hot aisle', detail: 'ΔT of 30-50°F across miners' },
        { step: 'Exhaust fans pull hot air out of building', detail: '48x 72" fans = 3.1M CFM typical' },
        { step: 'Evaporative cooling optional in dry climates', detail: 'Drops intake 15-20°F when RH less than 30%' },
      ],
      engineering: {
        cfmPerKw: '100-120 CFM per kW IT load',
        intakeArea: '1 sq ft per 400 CFM intake',
        exhaustArea: '1 sq ft per 600 CFM exhaust',
        maxAmbient: '95°F (35°C) without evap cooling',
        deltaT: '30-50°F temperature rise',
      },
      temperatures: {
        coldAisle: '65-80°F (18-27°C)',
        hotAisle: '95-130°F (35-55°C)',
        chipJunction: '80-90°C max',
        ambient: '-40 to 95°F operating range',
      },
      pros: ['Lowest CapEx cost', 'Simple maintenance', 'Proven at scale (GW+ deployed)', 'Zero water usage possible', 'Alberta free cooling 8,000+ hrs/yr'],
      cons: ['Weather dependent efficiency', 'Lower power density (5-8 kW/rack)', 'Noise concerns (85+ dB at fans)', 'Dust/debris filtration needed'],
      bestFor: 'Cold climate locations like Alberta, large-scale mining, cost-optimized operations',
    },
    {
      id: 'hydro',
      name: 'Hydro Cooling (RDHX)',
      icon: Droplets,
      image: hydroImage,
      pue: `${PUE_RANGES.HYDRO_COOLED.min.toFixed(2)} - ${PUE_RANGES.HYDRO_COOLED.max.toFixed(2)}`,
      pueNote: PUE_RANGES.HYDRO_COOLED.notes,
      description: 'Rear-Door Heat Exchangers (RDHX) attached to rack backs. Chilled water captures heat directly at source, allowing higher density.',
      howItWorks: [
        { step: 'Chilled water (45°F) pumped to RDHX units', detail: '8-12 GPM per 30kW rack' },
        { step: 'Hot exhaust air passes through RDHX coils', detail: 'Removes 80-100% of heat at rack' },
        { step: 'Warm water (55°F) returns to chiller plant', detail: '10°F ΔT design typical' },
        { step: 'Chillers or cooling towers reject heat outdoors', detail: 'Free cooling below 45°F ambient' },
        { step: 'Closed-loop system minimizes water losses', detail: 'Makeup water: less than 0.1% daily' },
      ],
      engineering: {
        gpmPerKw: '0.25-0.4 GPM per kW at 10°F ΔT',
        supplyTemp: '42-50°F (6-10°C)',
        returnTemp: '52-60°F (11-16°C)',
        rdhxCapacity: '30-50 kW per door unit',
        pipeSize: '1.5" per rack, 6" mains',
      },
      temperatures: {
        coldAisle: '70-80°F (21-27°C)',
        hotAisle: '75-85°F (24-29°C) post-RDHX',
        chipJunction: '75-85°C',
        waterSupply: '42-50°F (6-10°C)',
      },
      pros: ['Higher density (30 kW/rack)', 'Consistent cooling regardless of ambient', 'Quieter than air (fans reduced)', 'Scalable to 100+ MW'],
      cons: ['Water infrastructure required', 'Leak risk (needs detection)', 'Higher CapEx ($300-500/kW)', 'Maintenance complexity'],
      bestFor: 'Medium to large facilities, locations with water access, hosting operations requiring higher uptime',
    },
    {
      id: 'immersion',
      name: 'Immersion Cooling',
      icon: Waves,
      image: immersionImage,
      pue: `${PUE_RANGES.IMMERSION_SINGLE_PHASE.min.toFixed(2)} - ${PUE_RANGES.IMMERSION_SINGLE_PHASE.max.toFixed(2)}`,
      pueNote: PUE_RANGES.IMMERSION_SINGLE_PHASE.notes,
      description: 'Mining hardware fully submerged in engineered dielectric fluid. Direct contact cooling enables maximum density and overclocking.',
      howItWorks: [
        { step: 'ASICs submerged in dielectric fluid (non-conductive)', detail: 'Fluids: BitCool, EC-110, Novec' },
        { step: 'Heat transfers directly to fluid (no air gap)', detail: '1000x better heat transfer than air' },
        { step: 'Single-phase: warm fluid pumped to heat exchangers', detail: 'Fluid stays liquid, 40-60°C' },
        { step: 'Two-phase: fluid boils at chip, condenses on coils', detail: 'Even higher efficiency, more complex' },
        { step: 'Dry coolers reject heat outdoors (no water tower)', detail: 'WUE = 0.0 L/kWh' },
      ],
      engineering: {
        fluidVolume: '50-100L per miner (tank shared)',
        fluidCost: '$15-25 per liter',
        fluidLife: '5-10 years if maintained',
        overclock: '+20-30% hashrate possible',
        hwLifeExtension: '2-3x longer ASIC lifespan',
      },
      temperatures: {
        fluidTemp: '40-55°C (104-131°F)',
        chipJunction: '65-75°C (vs 80-90°C air)',
        dryCoilerApproach: '10-15°F above ambient',
        maxFluidTemp: '60°C before viscosity issues',
      },
      pros: [`Highest efficiency (PUE ${PUE_RANGES.IMMERSION_SINGLE_PHASE.min.toFixed(2)}-${PUE_RANGES.IMMERSION_SINGLE_PHASE.max.toFixed(2)})`, 'Enables +30% overclocking', 'Silent operation', 'Extends hardware life 2-3x', 'Extreme density (100+ kW/rack)'],
      cons: ['High upfront cost ($500-800/kW)', 'Specialized maintenance/training', 'Fluid cost ($15-25/L)', 'Harder to retrofit', 'Slower hardware swaps'],
      bestFor: 'New builds, maximum efficiency operations, premium hosting, hot climates',
    },
  ];

  // Engineering comparison data using centralized PUE constants
  const comparisonData = [
    { metric: 'Power Usage Effectiveness (PUE)', air: `${PUE_RANGES.AIR_COOLED.min.toFixed(2)}-${PUE_RANGES.AIR_COOLED.max.toFixed(2)}`, hydro: `${PUE_RANGES.HYDRO_COOLED.min.toFixed(2)}-${PUE_RANGES.HYDRO_COOLED.max.toFixed(2)}`, immersion: `${PUE_RANGES.IMMERSION_SINGLE_PHASE.min.toFixed(2)}-${PUE_RANGES.IMMERSION_SINGLE_PHASE.max.toFixed(2)}`, winner: 'immersion' },
    { metric: 'CapEx ($/kW IT)', air: '$50-150', hydro: '$300-500', immersion: '$500-800', winner: 'air' },
    { metric: 'Power Density (kW/rack)', air: '5-8', hydro: '20-40', immersion: '50-100+', winner: 'immersion' },
    { metric: 'Maintenance Complexity', air: 'Low', hydro: 'Medium', immersion: 'High', winner: 'air' },
    { metric: 'Noise Level (dB)', air: '85-95', hydro: '70-80', immersion: 'Less than 50', winner: 'immersion' },
    { metric: 'Water Usage (WUE)', air: '0.0-2.0', hydro: '0.5-1.5', immersion: '0.0', winner: 'immersion', winnerAlt: 'air' },
    { metric: 'Hardware Lifespan', air: '3-4 years', hydro: '3-4 years', immersion: '5-7 years', winner: 'immersion' },
    { metric: 'Overclock Potential', air: 'Limited', hydro: 'Limited', immersion: '+20-30%', winner: 'immersion' },
  ];

  const activeSys = coolingSystems.find(s => s.id === activeCooling)!;

  // CFM Calculator logic
  const [minerCount, setMinerCount] = useState(100);
  const [minerWatts, setMinerWatts] = useState(3500);
  const cfmPerMiner = 280; // Average
  const totalCFM = minerCount * cfmPerMiner;
  const totalKW = (minerCount * minerWatts) / 1000;
  const intakeArea = totalCFM / 400;
  const exhaustArea = totalCFM / 600;
  const fanCount72 = Math.ceil(totalCFM / 65000);

  return (
    <DCESectionWrapper theme="light" id="cooling-systems">
      <LearningObjectives
        objectives={[
          "Compare air, hydro (RDHX), and immersion cooling systems",
          "Understand PUE ratings and what they mean for operating costs",
          "Learn engineering specs: CFM requirements, temperature ranges, water flow rates",
          "Know when to choose each cooling method based on your facility requirements"
        ]}
        estimatedTime="12 min"
        prerequisites={[
          { title: "Power Journey", href: "/datacenter-education#power-journey" }
        ]}
      />
      
      <DCESectionHeader
        badge="Section 5 • Thermal Engineering"
        badgeIcon={Thermometer}
        title="Cooling Systems Deep Dive"
        description="Every watt of electricity becomes heat. Here's how professional mining operations manage thermal loads."
        theme="light"
      />

      {/* Cooling Type Selector */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="mb-10"
      >
        <div className="flex overflow-x-auto pb-2 gap-2 sm:gap-3 scrollbar-hide snap-x snap-mandatory md:flex-wrap md:justify-center md:overflow-visible md:pb-0">
          {coolingSystems.map((system) => (
            <button
              key={system.id}
              onClick={() => setActiveCooling(system.id)}
              className={`flex-shrink-0 snap-start flex items-center gap-2 px-3 sm:px-5 py-3 rounded-xl font-medium transition-all ${
                activeCooling === system.id
                  ? 'bg-[hsl(var(--watt-bitcoin))] text-white shadow-lg shadow-[hsl(var(--watt-bitcoin)/0.3)]'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              <system.icon className="w-5 h-5 flex-shrink-0" />
              <span className="whitespace-nowrap">{system.name}</span>
              <span className={`text-xs px-2 py-0.5 rounded-full whitespace-nowrap ${
                activeCooling === system.id ? 'bg-white/20' : 'bg-background'
              }`}>
                PUE {system.pue.split(' ')[0]}
              </span>
            </button>
          ))}
        </div>
      </motion.div>

      {/* Active System Detail with Real Image */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="grid lg:grid-cols-2 gap-6 mb-12"
      >
        {/* Real Facility Image */}
        <div className="relative aspect-video md:h-96 md:aspect-auto rounded-2xl overflow-hidden border border-border">
          <img 
            src={activeSys.image} 
            alt={activeSys.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-5">
            <div className="flex items-center gap-2 mb-2">
              <activeSys.icon className="w-6 h-6 text-[hsl(var(--watt-bitcoin))]" />
              <span className="text-white font-bold text-lg">{activeSys.name}</span>
            </div>
            <div className="flex flex-wrap gap-2">
              <span className="px-2 py-1 bg-[hsl(var(--watt-bitcoin)/0.9)] text-white rounded text-xs font-medium">
                PUE: {activeSys.pue}
              </span>
              <span className="px-2 py-1 bg-white/20 text-white rounded text-xs">
                {activeSys.pueNote}
              </span>
            </div>
          </div>
        </div>

        {/* Details */}
        <DCEContentCard variant="default">
          <p className="text-muted-foreground mb-5">{activeSys.description}</p>

          <div className="mb-5">
            <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
              <Info className="w-4 h-4 text-[hsl(var(--watt-bitcoin))]" />
              How It Works
            </h4>
            <ol className="space-y-2">
              {activeSys.howItWorks.map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <span className="w-5 h-5 rounded-full bg-[hsl(var(--watt-bitcoin)/0.2)] text-[hsl(var(--watt-bitcoin))] flex items-center justify-center flex-shrink-0 text-xs font-bold">
                    {i + 1}
                  </span>
                  <div>
                    <span className="text-foreground">{item.step}</span>
                    <span className="text-muted-foreground text-xs block">{item.detail}</span>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          {/* Temperature Specs */}
          <div className="grid grid-cols-2 gap-2 mb-5">
            {Object.entries(activeSys.temperatures).map(([key, value]) => (
              <div key={key} className="p-2 bg-muted/50 rounded-lg">
                <div className="text-xs text-muted-foreground capitalize">{key.replace(/([A-Z])/g, ' $1')}</div>
                <div className="text-sm font-semibold text-foreground">{value}</div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold text-foreground mb-2 flex items-center gap-1 text-sm">
                <CheckCircle className="w-4 h-4 text-green-500" /> Pros
              </h4>
              <ul className="space-y-1">
                {activeSys.pros.map((pro, i) => (
                  <li key={i} className="text-xs text-muted-foreground">• {pro}</li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-2 flex items-center gap-1 text-sm">
                <XCircle className="w-4 h-4 text-red-500" /> Cons
              </h4>
              <ul className="space-y-1">
                {activeSys.cons.map((con, i) => (
                  <li key={i} className="text-xs text-muted-foreground">• {con}</li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-4 p-3 bg-[hsl(var(--watt-bitcoin)/0.1)] rounded-lg border border-[hsl(var(--watt-bitcoin)/0.2)]">
            <span className="text-sm font-medium text-foreground">Best For: </span>
            <span className="text-sm text-muted-foreground">{activeSys.bestFor}</span>
          </div>
        </DCEContentCard>
      </motion.div>

      {/* Engineering Specifications Panel */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.25 }}
        className="mb-12"
      >
        <DCEContentCard variant="bordered">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 rounded-lg bg-[hsl(var(--watt-bitcoin)/0.15)]">
              <Calculator className="w-5 h-5 text-[hsl(var(--watt-bitcoin))]" />
            </div>
            <h4 className="font-semibold text-foreground">
              Engineering Specifications: {activeSys.name}
            </h4>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {Object.entries(activeSys.engineering).map(([key, value]) => (
              <div key={key} className="p-3 bg-muted/50 rounded-lg border border-border">
                <div className="text-xs text-muted-foreground capitalize mb-1">
                  {key.replace(/([A-Z])/g, ' $1')}
                </div>
                <div className="text-sm font-semibold text-foreground">{value}</div>
              </div>
            ))}
          </div>
        </DCEContentCard>
      </motion.div>

      {/* Key Insight */}
      <DCEKeyInsight variant="insight" title="PUE Optimization" delay={0.3}>
        <p>
          Power Usage Effectiveness (PUE) directly impacts profitability. A facility with PUE 1.10 uses 10% more power 
          than just the IT load, while PUE 1.30 wastes 30% on cooling and overhead. At $0.05/kWh, this difference 
          on a 50MW site equals <strong>$2.2M/year</strong> in additional operating costs.
        </p>
      </DCEKeyInsight>

      {/* CFM Calculator for Air-Cooled */}
      {activeCooling === 'air' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.35 }}
          className="mt-8"
        >
          <DCEDeepDive title="Airflow (CFM) Calculator" icon={Calculator} defaultOpen={showCFMCalculator}>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Number of Miners</label>
                <input
                  type="range"
                  min="50"
                  max="5000"
                  step="50"
                  value={minerCount}
                  onChange={(e) => setMinerCount(Number(e.target.value))}
                  className="w-full accent-[hsl(var(--watt-bitcoin))]"
                />
                <div className="text-lg font-bold text-[hsl(var(--watt-bitcoin))]">{minerCount.toLocaleString()} miners</div>
                
                <label className="block text-sm font-medium text-foreground mb-2 mt-4">Power per Miner (W)</label>
                <input
                  type="range"
                  min="2000"
                  max="5000"
                  step="100"
                  value={minerWatts}
                  onChange={(e) => setMinerWatts(Number(e.target.value))}
                  className="w-full accent-[hsl(var(--watt-bitcoin))]"
                />
                <div className="text-lg font-bold text-[hsl(var(--watt-bitcoin))]">{minerWatts.toLocaleString()}W per miner</div>
              </div>
              
              <div className="space-y-3">
                <div className="p-3 bg-muted/50 rounded-lg border border-border">
                  <div className="text-xs text-muted-foreground">Total IT Load</div>
                  <div className="text-xl font-bold text-foreground">{totalKW.toFixed(1)} kW ({(totalKW / 1000).toFixed(2)} MW)</div>
                </div>
                <div className="p-3 bg-muted/50 rounded-lg border border-border">
                  <div className="text-xs text-muted-foreground">Required Airflow</div>
                  <div className="text-xl font-bold text-[hsl(var(--watt-bitcoin))]">{totalCFM.toLocaleString()} CFM</div>
                </div>
                <div className="p-3 bg-muted/50 rounded-lg border border-border">
                  <div className="text-xs text-muted-foreground">Intake Area Needed</div>
                  <div className="text-xl font-bold text-foreground">{intakeArea.toFixed(0)} sq ft</div>
                </div>
                <div className="p-3 bg-[hsl(var(--watt-bitcoin)/0.1)] rounded-lg border border-[hsl(var(--watt-bitcoin)/0.2)]">
                  <div className="text-xs text-muted-foreground">72" Exhaust Fans Required</div>
                  <div className="text-xl font-bold text-[hsl(var(--watt-bitcoin))]">{fanCount72} fans</div>
                </div>
              </div>
            </div>
          </DCEDeepDive>
        </motion.div>
      )}

      {/* Comparison Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="mt-10"
      >
        <DCEContentCard variant="elevated">
          <h3 className="text-xl font-bold text-foreground mb-6">Cooling Method Comparison</h3>
          <div className="relative">
            <div className="overflow-x-auto pb-2 scrollbar-hide">
              <table className="w-full text-sm min-w-[500px]">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 font-medium text-foreground">Metric</th>
                  <th className="text-center py-3 px-4 font-medium text-foreground">
                    <div className="flex items-center justify-center gap-2">
                      <Wind className="w-4 h-4" /> Air
                    </div>
                  </th>
                  <th className="text-center py-3 px-4 font-medium text-foreground">
                    <div className="flex items-center justify-center gap-2">
                      <Droplets className="w-4 h-4" /> Hydro
                    </div>
                  </th>
                  <th className="text-center py-3 px-4 font-medium text-foreground">
                    <div className="flex items-center justify-center gap-2">
                      <Waves className="w-4 h-4" /> Immersion
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {comparisonData.map((row) => (
                  <tr key={row.metric} className="border-b border-border/50 hover:bg-muted/30">
                    <td className="py-3 px-4 text-foreground">{row.metric}</td>
                    <td className={`py-3 px-4 text-center ${row.winner === 'air' ? 'text-[hsl(var(--watt-bitcoin))] font-semibold' : 'text-muted-foreground'}`}>
                      {row.air}
                    </td>
                    <td className={`py-3 px-4 text-center ${row.winner === 'hydro' ? 'text-[hsl(var(--watt-bitcoin))] font-semibold' : 'text-muted-foreground'}`}>
                      {row.hydro}
                    </td>
                    <td className={`py-3 px-4 text-center ${row.winner === 'immersion' ? 'text-[hsl(var(--watt-bitcoin))] font-semibold' : 'text-muted-foreground'}`}>
                      {row.immersion}
                    </td>
                  </tr>
                ))}
              </tbody>
              </table>
            </div>
            <div className="absolute right-0 top-0 bottom-2 w-8 bg-gradient-to-l from-card to-transparent pointer-events-none md:hidden" />
          </div>
        </DCEContentCard>
      </motion.div>

      <SectionSummary
        takeaways={[
          `Air cooling: Lowest cost (PUE ${PUE_RANGES.AIR_COOLED.min.toFixed(2)}-${PUE_RANGES.AIR_COOLED.max.toFixed(2)}), best for cold climates like Alberta with 8,000+ free cooling hours`,
          `Hydro cooling (RDHX): Balanced approach (PUE ${PUE_RANGES.HYDRO_COOLED.min.toFixed(2)}-${PUE_RANGES.HYDRO_COOLED.max.toFixed(2)}), enables 30+ kW per rack density`,
          `Immersion cooling: Highest efficiency (PUE ${PUE_RANGES.IMMERSION_SINGLE_PHASE.min.toFixed(2)}-${PUE_RANGES.IMMERSION_SINGLE_PHASE.max.toFixed(2)}) with +30% overclock potential and 2-3x hardware lifespan`,
          "Choose based on climate, budget, density requirements, and operational expertise"
        ]}
      />
    </DCESectionWrapper>
  );
};

export default CoolingSystemsVisualSection;
