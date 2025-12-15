import React, { useState } from 'react';
import { Wind, Droplets, Waves, Thermometer, CheckCircle, XCircle, TrendingDown } from 'lucide-react';
import { ScrollReveal } from '@/components/landing/ScrollAnimations';

const CoolingSystemsVisualSection = () => {
  const [activeCooling, setActiveCooling] = useState('air');

  const coolingSystems = [
    {
      id: 'air',
      name: 'Air-Cooled',
      icon: Wind,
      pue: '1.3 - 1.5',
      description: 'Traditional HVAC systems using fans and cold outside air to remove heat from mining equipment.',
      howItWorks: [
        'Cold air drawn from outside or through CRAC units',
        'Air flows through hot aisle/cold aisle containment',
        'Hot exhaust air expelled outside or recirculated',
        'Evaporative cooling enhances efficiency in dry climates',
      ],
      pros: ['Lower upfront cost', 'Easier maintenance', 'Proven technology', 'Simple retrofits'],
      cons: ['Weather dependent', 'Limited power density', 'Higher PUE', 'Noise concerns'],
      bestFor: 'Cold climate locations like Alberta, facilities with ample space',
      animation: 'air-flow',
    },
    {
      id: 'hydro',
      name: 'Hydro Cooling',
      icon: Droplets,
      pue: '1.2 - 1.4',
      description: 'Liquid-to-air heat exchangers using water or glycol to transfer heat more efficiently than air alone.',
      howItWorks: [
        'Chilled water circulates through rear-door heat exchangers',
        'In-row cooling units capture heat at the source',
        'Warm water sent to cooling towers or dry coolers',
        'Closed-loop system prevents water loss',
      ],
      pros: ['Higher power density', 'Consistent cooling', 'Scalable', 'Quieter operation'],
      cons: ['Water infrastructure required', 'Leak risk', 'Higher complexity', 'Maintenance intensive'],
      bestFor: 'Medium to large facilities, locations with water access',
      animation: 'water-flow',
    },
    {
      id: 'immersion',
      name: 'Immersion',
      icon: Waves,
      pue: '1.02 - 1.10',
      description: 'Hardware submerged in dielectric fluid that directly absorbs and transfers heat with near-perfect efficiency.',
      howItWorks: [
        'Mining hardware fully submerged in non-conductive fluid',
        'Heat transfers directly to fluid (no air gap)',
        'Single-phase: fluid circulates to heat exchanger',
        'Two-phase: fluid boils and condenses (highest efficiency)',
      ],
      pros: ['Maximum efficiency', 'Enables overclocking', 'Silent operation', 'Extends hardware life', 'Highest density'],
      cons: ['High upfront cost', 'Specialized maintenance', 'Fluid cost', 'Retrofit challenges'],
      bestFor: 'New builds, maximum density requirements, premium operations',
      animation: 'immersion-bubbles',
    },
  ];

  const comparisonData = [
    { metric: 'Power Usage Effectiveness', air: '1.3-1.5', hydro: '1.2-1.4', immersion: '1.02-1.10', winner: 'immersion' },
    { metric: 'Upfront Cost', air: '$', hydro: '$$', immersion: '$$$', winner: 'air' },
    { metric: 'Operating Cost', air: '$$$', hydro: '$$', immersion: '$', winner: 'immersion' },
    { metric: 'Power Density (kW/rack)', air: '5-15', hydro: '15-30', immersion: '50-100+', winner: 'immersion' },
    { metric: 'Maintenance Complexity', air: 'Low', hydro: 'Medium', immersion: 'High', winner: 'air' },
    { metric: 'Noise Level', air: 'High', hydro: 'Medium', immersion: 'Silent', winner: 'immersion' },
    { metric: 'Hardware Lifespan', air: 'Standard', hydro: 'Standard', immersion: 'Extended', winner: 'immersion' },
  ];

  const activeSys = coolingSystems.find(s => s.id === activeCooling)!;

  return (
    <section className="py-16 md:py-24 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Cooling Systems Deep Dive
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Explore the three main cooling technologies used in Bitcoin mining datacenters
            </p>
          </div>
        </ScrollReveal>

        {/* Cooling Type Selector */}
        <ScrollReveal delay={0.1}>
          <div className="flex flex-wrap justify-center gap-3 mb-12">
            {coolingSystems.map((system) => (
              <button
                key={system.id}
                onClick={() => setActiveCooling(system.id)}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${
                  activeCooling === system.id
                    ? 'bg-watt-bitcoin text-white shadow-lg shadow-watt-bitcoin/30'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                <system.icon className="w-5 h-5" />
                {system.name}
              </button>
            ))}
          </div>
        </ScrollReveal>

        {/* Active System Detail */}
        <ScrollReveal delay={0.2}>
          <div className="grid lg:grid-cols-2 gap-8 mb-16">
            {/* Animated Visualization */}
            <div className="relative h-80 md:h-96 bg-gradient-to-b from-muted/50 to-muted rounded-2xl border border-border overflow-hidden">
              {activeCooling === 'air' && (
                <div className="absolute inset-0 flex items-center justify-center">
                  {/* Air cooling visualization */}
                  <div className="relative w-64 h-48">
                    {/* Server rack */}
                    <div className="absolute inset-x-8 top-8 bottom-8 bg-watt-navy rounded-lg flex flex-col justify-center items-center gap-1 p-2">
                      {[1, 2, 3, 4].map(i => (
                        <div key={i} className="w-full h-6 bg-watt-bitcoin/20 rounded flex items-center justify-center">
                          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                        </div>
                      ))}
                    </div>
                    {/* Air flow arrows */}
                    {[...Array(6)].map((_, i) => (
                      <div
                        key={i}
                        className="absolute w-4 h-4"
                        style={{
                          left: i < 3 ? '0' : 'auto',
                          right: i >= 3 ? '0' : 'auto',
                          top: `${20 + (i % 3) * 30}%`,
                          animation: `airflow 2s ease-in-out infinite`,
                          animationDelay: `${i * 0.2}s`,
                        }}
                      >
                        <Wind className={`w-4 h-4 ${i < 3 ? 'text-cyan-500' : 'text-red-500'}`} />
                      </div>
                    ))}
                    <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs text-muted-foreground">
                      Cold Aisle → Hot Aisle
                    </div>
                  </div>
                </div>
              )}

              {activeCooling === 'hydro' && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="relative w-72 h-56">
                    {/* Pipes with animated water */}
                    <svg className="absolute inset-0 w-full h-full" viewBox="0 0 288 224">
                      {/* Cold water pipe */}
                      <path
                        d="M 20 180 Q 20 112 80 112 L 144 112"
                        fill="none"
                        stroke="hsl(var(--primary) / 0.3)"
                        strokeWidth="12"
                        strokeLinecap="round"
                      />
                      <path
                        d="M 20 180 Q 20 112 80 112 L 144 112"
                        fill="none"
                        stroke="hsl(200, 100%, 50%)"
                        strokeWidth="4"
                        strokeDasharray="10 15"
                        strokeLinecap="round"
                        className="animate-dash-flow"
                      />
                      {/* Hot water pipe */}
                      <path
                        d="M 144 112 L 208 112 Q 268 112 268 44"
                        fill="none"
                        stroke="hsl(var(--primary) / 0.3)"
                        strokeWidth="12"
                        strokeLinecap="round"
                      />
                      <path
                        d="M 144 112 L 208 112 Q 268 112 268 44"
                        fill="none"
                        stroke="hsl(0, 80%, 50%)"
                        strokeWidth="4"
                        strokeDasharray="10 15"
                        strokeLinecap="round"
                        className="animate-dash-flow-reverse"
                      />
                    </svg>
                    {/* Heat exchanger */}
                    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-watt-navy rounded-xl flex items-center justify-center">
                      <Thermometer className="w-10 h-10 text-watt-bitcoin" />
                    </div>
                    <div className="absolute bottom-2 left-4 text-xs text-cyan-500 font-medium">Cold In</div>
                    <div className="absolute top-2 right-4 text-xs text-red-500 font-medium">Hot Out</div>
                  </div>
                </div>
              )}

              {activeCooling === 'immersion' && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="relative w-48 h-56">
                    {/* Tank */}
                    <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/20 to-cyan-500/40 rounded-xl border-4 border-cyan-500/50 overflow-hidden">
                      {/* Bubbles */}
                      {[...Array(12)].map((_, i) => (
                        <div
                          key={i}
                          className="absolute w-2 h-2 bg-white/40 rounded-full"
                          style={{
                            left: `${10 + Math.random() * 80}%`,
                            bottom: '-10%',
                            animation: `bubble 3s ease-in-out infinite`,
                            animationDelay: `${i * 0.25}s`,
                          }}
                        />
                      ))}
                      {/* Submerged hardware */}
                      <div className="absolute inset-x-4 top-8 bottom-8 flex flex-col gap-2 justify-center">
                        {[1, 2, 3].map(i => (
                          <div key={i} className="h-10 bg-watt-navy/80 rounded flex items-center justify-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                            <div className="w-12 h-1 bg-watt-bitcoin/50 rounded" />
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-xs text-muted-foreground text-center">
                      Dielectric Fluid Bath
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Details */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-watt-bitcoin/10 flex items-center justify-center">
                  <activeSys.icon className="w-6 h-6 text-watt-bitcoin" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-foreground">{activeSys.name}</h3>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-muted-foreground">PUE:</span>
                    <span className="font-semibold text-watt-bitcoin">{activeSys.pue}</span>
                  </div>
                </div>
              </div>

              <p className="text-muted-foreground mb-6">{activeSys.description}</p>

              <div className="mb-6">
                <h4 className="font-semibold text-foreground mb-2">How It Works</h4>
                <ol className="space-y-2">
                  {activeSys.howItWorks.map((step, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <span className="w-5 h-5 rounded-full bg-watt-bitcoin/20 text-watt-bitcoin flex items-center justify-center flex-shrink-0 text-xs font-bold">
                        {i + 1}
                      </span>
                      {step}
                    </li>
                  ))}
                </ol>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold text-foreground mb-2 flex items-center gap-1">
                    <CheckCircle className="w-4 h-4 text-green-500" /> Pros
                  </h4>
                  <ul className="space-y-1">
                    {activeSys.pros.map((pro, i) => (
                      <li key={i} className="text-sm text-muted-foreground">• {pro}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-foreground mb-2 flex items-center gap-1">
                    <XCircle className="w-4 h-4 text-red-500" /> Cons
                  </h4>
                  <ul className="space-y-1">
                    {activeSys.cons.map((con, i) => (
                      <li key={i} className="text-sm text-muted-foreground">• {con}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                <span className="text-sm font-medium text-foreground">Best For: </span>
                <span className="text-sm text-muted-foreground">{activeSys.bestFor}</span>
              </div>
            </div>
          </div>
        </ScrollReveal>

        {/* Comparison Table */}
        <ScrollReveal delay={0.3}>
          <h3 className="text-xl font-semibold text-foreground mb-6 text-center">
            Side-by-Side Comparison
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left p-4 text-muted-foreground font-medium">Metric</th>
                  <th className="p-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <Wind className="w-4 h-4 text-cyan-500" />
                      <span className="text-foreground font-medium">Air-Cooled</span>
                    </div>
                  </th>
                  <th className="p-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <Droplets className="w-4 h-4 text-blue-500" />
                      <span className="text-foreground font-medium">Hydro</span>
                    </div>
                  </th>
                  <th className="p-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <Waves className="w-4 h-4 text-purple-500" />
                      <span className="text-foreground font-medium">Immersion</span>
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {comparisonData.map((row, i) => (
                  <tr key={i} className="border-b border-border/50 hover:bg-muted/30">
                    <td className="p-4 text-muted-foreground">{row.metric}</td>
                    <td className={`p-4 text-center ${row.winner === 'air' ? 'text-watt-bitcoin font-semibold' : 'text-foreground'}`}>
                      {row.air}
                    </td>
                    <td className={`p-4 text-center ${row.winner === 'hydro' ? 'text-watt-bitcoin font-semibold' : 'text-foreground'}`}>
                      {row.hydro}
                    </td>
                    <td className={`p-4 text-center ${row.winner === 'immersion' ? 'text-watt-bitcoin font-semibold' : 'text-foreground'}`}>
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
          <div className="mt-12 p-6 bg-muted/30 rounded-2xl border border-border">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-watt-bitcoin/10 flex items-center justify-center flex-shrink-0">
                <TrendingDown className="w-6 h-6 text-watt-bitcoin" />
              </div>
              <div>
                <h4 className="font-semibold text-foreground mb-2">Understanding PUE (Power Usage Effectiveness)</h4>
                <p className="text-muted-foreground text-sm mb-4">
                  PUE measures datacenter efficiency. A PUE of 1.0 means all power goes to computing. 
                  A PUE of 1.5 means 50% overhead goes to cooling and infrastructure.
                </p>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="p-3 bg-red-500/10 rounded-lg">
                    <div className="text-lg font-bold text-red-500">2.0+</div>
                    <div className="text-xs text-muted-foreground">Inefficient</div>
                  </div>
                  <div className="p-3 bg-yellow-500/10 rounded-lg">
                    <div className="text-lg font-bold text-yellow-500">1.4-1.6</div>
                    <div className="text-xs text-muted-foreground">Average</div>
                  </div>
                  <div className="p-3 bg-green-500/10 rounded-lg">
                    <div className="text-lg font-bold text-green-500">&lt;1.2</div>
                    <div className="text-xs text-muted-foreground">Excellent</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </div>

      <style>{`
        @keyframes airflow {
          0%, 100% { transform: translateX(0); opacity: 0.5; }
          50% { transform: translateX(10px); opacity: 1; }
        }
        @keyframes bubble {
          0% { transform: translateY(0) scale(1); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateY(-200px) scale(0.5); opacity: 0; }
        }
        @keyframes dash-flow {
          0% { stroke-dashoffset: 0; }
          100% { stroke-dashoffset: -50; }
        }
        @keyframes dash-flow-reverse {
          0% { stroke-dashoffset: 0; }
          100% { stroke-dashoffset: 50; }
        }
        .animate-dash-flow {
          animation: dash-flow 1s linear infinite;
        }
        .animate-dash-flow-reverse {
          animation: dash-flow-reverse 1s linear infinite;
        }
      `}</style>
    </section>
  );
};

export default CoolingSystemsVisualSection;
