import React, { useState } from 'react';
import { Wind, Droplets, Waves, Thermometer, CheckCircle, XCircle, TrendingDown, Calculator, Info } from 'lucide-react';
import { ScrollReveal } from '@/components/landing/ScrollAnimations';
import airCooledImage from '@/assets/datacenter-air-cooled.jpg';
import hydroImage from '@/assets/datacenter-hydro.jpg';
import immersionImage from '@/assets/datacenter-immersion.jpg';

const CoolingSystemsVisualSection = () => {
  const [activeCooling, setActiveCooling] = useState('air');
  const [showCFMCalculator, setShowCFMCalculator] = useState(false);

  // Engineering-accurate cooling system specifications
  const coolingSystems = [
    {
      id: 'air',
      name: 'Air-Cooled',
      icon: Wind,
      image: airCooledImage,
      pue: '1.15 - 1.40',
      pueNote: '1.15 in cold climates like Alberta',
      description: 'Hot/cold aisle containment with exhaust fan walls. Leverages cold outside air for free cooling 8,000+ hours/year in northern climates.',
      howItWorks: [
        { step: 'Cold air enters through intake louvers or wall openings', detail: 'Intake sized for 400 fpm max velocity' },
        { step: 'Air flows through cold aisle, across miners (front-to-back)', detail: 'Each miner needs 200-350 CFM' },
        { step: 'Hot exhaust air (95-130°F) collected in hot aisle', detail: 'ΔT of 30-50°F across miners' },
        { step: 'Exhaust fans pull hot air out of building', detail: '48x 72" fans = 3.1M CFM typical' },
        { step: 'Evaporative cooling optional in dry climates', detail: 'Drops intake 15-20°F when RH <30%' },
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
      pue: '1.15 - 1.35',
      pueNote: 'Chiller adds load; towers help',
      description: 'Rear-Door Heat Exchangers (RDHX) attached to rack backs. Chilled water captures heat directly at source, allowing higher density.',
      howItWorks: [
        { step: 'Chilled water (45°F) pumped to RDHX units', detail: '8-12 GPM per 30kW rack' },
        { step: 'Hot exhaust air passes through RDHX coils', detail: 'Removes 80-100% of heat at rack' },
        { step: 'Warm water (55°F) returns to chiller plant', detail: '10°F ΔT design typical' },
        { step: 'Chillers or cooling towers reject heat outdoors', detail: 'Free cooling below 45°F ambient' },
        { step: 'Closed-loop system minimizes water losses', detail: 'Makeup water: <0.1% daily' },
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
      pue: '1.02 - 1.08',
      pueNote: 'Near-perfect efficiency',
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
      pros: ['Highest efficiency (PUE 1.02-1.08)', 'Enables +30% overclocking', 'Silent operation', 'Extends hardware life 2-3x', 'Extreme density (100+ kW/rack)'],
      cons: ['High upfront cost ($500-800/kW)', 'Specialized maintenance/training', 'Fluid cost ($15-25/L)', 'Harder to retrofit', 'Slower hardware swaps'],
      bestFor: 'New builds, maximum efficiency operations, premium hosting, hot climates',
    },
  ];

  // Engineering comparison data
  const comparisonData = [
    { metric: 'Power Usage Effectiveness (PUE)', air: '1.15-1.40', hydro: '1.15-1.35', immersion: '1.02-1.08', winner: 'immersion' },
    { metric: 'CapEx ($/kW IT)', air: '$50-150', hydro: '$300-500', immersion: '$500-800', winner: 'air' },
    { metric: 'Power Density (kW/rack)', air: '5-8', hydro: '20-40', immersion: '50-100+', winner: 'immersion' },
    { metric: 'Maintenance Complexity', air: 'Low', hydro: 'Medium', immersion: 'High', winner: 'air' },
    { metric: 'Noise Level (dB)', air: '85-95', hydro: '70-80', immersion: '<50', winner: 'immersion' },
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
    <section className="py-16 md:py-24 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <div className="text-center mb-10">
            <span className="inline-block px-4 py-1 rounded-full bg-watt-bitcoin/10 text-watt-bitcoin text-sm font-medium mb-4">
              Section 2 • Thermal Engineering
            </span>
            <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
              Cooling Systems Deep Dive
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Every watt of electricity becomes heat. Here's how professional mining operations manage thermal loads.
            </p>
          </div>
        </ScrollReveal>

        {/* Cooling Type Selector */}
        <ScrollReveal delay={0.1}>
          <div className="flex flex-wrap justify-center gap-3 mb-10">
            {coolingSystems.map((system) => (
              <button
                key={system.id}
                onClick={() => setActiveCooling(system.id)}
                className={`flex items-center gap-2 px-5 py-3 rounded-xl font-medium transition-all ${
                  activeCooling === system.id
                    ? 'bg-watt-bitcoin text-white shadow-lg shadow-watt-bitcoin/30'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                <system.icon className="w-5 h-5" />
                {system.name}
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  activeCooling === system.id ? 'bg-white/20' : 'bg-background'
                }`}>
                  PUE {system.pue.split(' ')[0]}
                </span>
              </button>
            ))}
          </div>
        </ScrollReveal>

        {/* Active System Detail with Real Image */}
        <ScrollReveal delay={0.2}>
          <div className="grid lg:grid-cols-2 gap-6 mb-12">
            {/* Real Facility Image */}
            <div className="relative h-72 md:h-96 rounded-2xl overflow-hidden">
              <img 
                src={activeSys.image} 
                alt={activeSys.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-5">
                <div className="flex items-center gap-2 mb-2">
                  <activeSys.icon className="w-6 h-6 text-watt-bitcoin" />
                  <span className="text-white font-bold text-lg">{activeSys.name}</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  <span className="px-2 py-1 bg-watt-bitcoin/90 text-white rounded text-xs font-medium">
                    PUE: {activeSys.pue}
                  </span>
                  <span className="px-2 py-1 bg-white/20 text-white rounded text-xs">
                    {activeSys.pueNote}
                  </span>
                </div>
              </div>
            </div>

            {/* Details */}
            <div>
              <p className="text-muted-foreground mb-5">{activeSys.description}</p>

              <div className="mb-5">
                <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                  <Info className="w-4 h-4 text-watt-bitcoin" />
                  How It Works
                </h4>
                <ol className="space-y-2">
                  {activeSys.howItWorks.map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <span className="w-5 h-5 rounded-full bg-watt-bitcoin/20 text-watt-bitcoin flex items-center justify-center flex-shrink-0 text-xs font-bold">
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

              <div className="mt-4 p-3 bg-watt-bitcoin/10 rounded-lg">
                <span className="text-sm font-medium text-foreground">Best For: </span>
                <span className="text-sm text-muted-foreground">{activeSys.bestFor}</span>
              </div>
            </div>
          </div>
        </ScrollReveal>

        {/* Engineering Specifications Panel */}
        <ScrollReveal delay={0.25}>
          <div className="mb-12 p-5 bg-muted/30 rounded-2xl border border-border">
            <h4 className="font-semibold text-foreground mb-4 flex items-center gap-2">
              <Calculator className="w-5 h-5 text-watt-bitcoin" />
              Engineering Specifications: {activeSys.name}
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
              {Object.entries(activeSys.engineering).map(([key, value]) => (
                <div key={key} className="p-3 bg-card rounded-lg border border-border">
                  <div className="text-xs text-muted-foreground capitalize mb-1">
                    {key.replace(/([A-Z])/g, ' $1')}
                  </div>
                  <div className="text-sm font-semibold text-foreground">{value}</div>
                </div>
              ))}
            </div>
          </div>
        </ScrollReveal>

        {/* CFM Calculator for Air-Cooled */}
        {activeCooling === 'air' && (
          <ScrollReveal delay={0.27}>
            <div className="mb-12">
              <button
                onClick={() => setShowCFMCalculator(!showCFMCalculator)}
                className="w-full p-4 bg-muted/50 rounded-xl border border-border hover:border-watt-bitcoin/50 transition-colors flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <Calculator className="w-6 h-6 text-watt-bitcoin" />
                  <div className="text-left">
                    <div className="font-semibold text-foreground">Airflow (CFM) Calculator</div>
                    <div className="text-sm text-muted-foreground">Calculate exhaust fan and intake requirements</div>
                  </div>
                </div>
                <span className="text-watt-bitcoin text-sm">{showCFMCalculator ? 'Hide' : 'Show'}</span>
              </button>
              
              {showCFMCalculator && (
                <div className="mt-4 p-5 bg-card rounded-xl border border-border">
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
                        className="w-full"
                      />
                      <div className="text-lg font-bold text-watt-bitcoin">{minerCount.toLocaleString()} miners</div>
                      
                      <label className="block text-sm font-medium text-foreground mb-2 mt-4">Power per Miner (W)</label>
                      <input
                        type="range"
                        min="2000"
                        max="5500"
                        step="100"
                        value={minerWatts}
                        onChange={(e) => setMinerWatts(Number(e.target.value))}
                        className="w-full"
                      />
                      <div className="text-lg font-bold text-watt-bitcoin">{minerWatts.toLocaleString()}W</div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="p-3 bg-muted/50 rounded-lg">
                        <div className="text-xs text-muted-foreground">Total IT Load</div>
                        <div className="text-xl font-bold text-foreground">{totalKW.toFixed(1)} MW</div>
                      </div>
                      <div className="p-3 bg-muted/50 rounded-lg">
                        <div className="text-xs text-muted-foreground">Total Airflow Required</div>
                        <div className="text-xl font-bold text-watt-bitcoin">{(totalCFM / 1000000).toFixed(2)}M CFM</div>
                      </div>
                      <div className="p-3 bg-muted/50 rounded-lg">
                        <div className="text-xs text-muted-foreground">Intake Opening (@ 400 fpm)</div>
                        <div className="text-lg font-bold text-foreground">{intakeArea.toFixed(0)} sq ft</div>
                      </div>
                      <div className="p-3 bg-muted/50 rounded-lg">
                        <div className="text-xs text-muted-foreground">72" Exhaust Fans Needed</div>
                        <div className="text-lg font-bold text-foreground">{fanCount72} fans</div>
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-4">
                    * Based on 280 CFM per miner average. Actual requirements vary by model. Consult ASHRAE guidelines for precise engineering.
                  </p>
                </div>
              )}
            </div>
          </ScrollReveal>
        )}

        {/* Comparison Table */}
        <ScrollReveal delay={0.3}>
          <h3 className="text-xl font-semibold text-foreground mb-4 text-center">
            Side-by-Side Comparison
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left p-3 text-muted-foreground font-medium text-sm">Metric</th>
                  <th className="p-3 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <Wind className="w-4 h-4 text-cyan-500" />
                      <span className="text-foreground font-medium text-sm">Air-Cooled</span>
                    </div>
                  </th>
                  <th className="p-3 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <Droplets className="w-4 h-4 text-blue-500" />
                      <span className="text-foreground font-medium text-sm">Hydro (RDHX)</span>
                    </div>
                  </th>
                  <th className="p-3 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <Waves className="w-4 h-4 text-purple-500" />
                      <span className="text-foreground font-medium text-sm">Immersion</span>
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {comparisonData.map((row, i) => (
                  <tr key={i} className="border-b border-border/50 hover:bg-muted/30">
                    <td className="p-3 text-muted-foreground text-sm">{row.metric}</td>
                    <td className={`p-3 text-center text-sm ${row.winner === 'air' || row.winnerAlt === 'air' ? 'text-watt-bitcoin font-semibold' : 'text-foreground'}`}>
                      {row.air}
                    </td>
                    <td className={`p-3 text-center text-sm ${row.winner === 'hydro' ? 'text-watt-bitcoin font-semibold' : 'text-foreground'}`}>
                      {row.hydro}
                    </td>
                    <td className={`p-3 text-center text-sm ${row.winner === 'immersion' ? 'text-watt-bitcoin font-semibold' : 'text-foreground'}`}>
                      {row.immersion}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </ScrollReveal>

        {/* PUE Explanation */}
        <ScrollReveal delay={0.4}>
          <div className="mt-10 p-5 bg-muted/30 rounded-2xl border border-border">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-watt-bitcoin/10 flex items-center justify-center flex-shrink-0">
                <TrendingDown className="w-6 h-6 text-watt-bitcoin" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-foreground mb-2">Understanding PUE (Power Usage Effectiveness)</h4>
                <p className="text-muted-foreground text-sm mb-4">
                  PUE = Total Facility Power ÷ IT Equipment Power. A PUE of 1.0 means 100% of power goes to computing. 
                  A PUE of 1.15 means 15% overhead goes to cooling, lighting, and losses.
                </p>
                <div className="grid grid-cols-4 gap-3 text-center">
                  <div className="p-2 bg-red-500/10 rounded-lg">
                    <div className="text-lg font-bold text-red-500">2.0+</div>
                    <div className="text-xs text-muted-foreground">Inefficient</div>
                  </div>
                  <div className="p-2 bg-yellow-500/10 rounded-lg">
                    <div className="text-lg font-bold text-yellow-500">1.4-1.6</div>
                    <div className="text-xs text-muted-foreground">Average</div>
                  </div>
                  <div className="p-2 bg-green-500/10 rounded-lg">
                    <div className="text-lg font-bold text-green-500">1.1-1.3</div>
                    <div className="text-xs text-muted-foreground">Good</div>
                  </div>
                  <div className="p-2 bg-watt-bitcoin/10 rounded-lg">
                    <div className="text-lg font-bold text-watt-bitcoin">&lt;1.1</div>
                    <div className="text-xs text-muted-foreground">Excellent</div>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-3">
                  WattByte Alberta targets PUE 1.15 using air cooling with 8,000+ hours of free cooling annually.
                </p>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
};

export default CoolingSystemsVisualSection;
