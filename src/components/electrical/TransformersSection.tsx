import React, { useState } from 'react';
import { Zap, Thermometer, Droplets, Wind, Calculator } from 'lucide-react';
import { ScrollReveal } from '@/components/landing/ScrollAnimations';
import CitedStatistic from '@/components/academy/CitedStatistic';
import { TRANSFORMER_SPECS, TRANSFORMER_SIZING } from '@/constants/industry-standards';

const TransformersSection = () => {
  const [loadMW, setLoadMW] = useState(10);
  const [powerFactor, setPowerFactor] = useState(0.95);

  const transformerTypes = [
    TRANSFORMER_SPECS.OIL_FILLED,
    TRANSFORMER_SPECS.DRY_TYPE,
    TRANSFORMER_SPECS.CAST_RESIN,
  ];

  const sizingFactors = [
    { factor: "Load Growth", multiplier: `${TRANSFORMER_SIZING.LOAD_GROWTH_FACTOR.min}-${TRANSFORMER_SIZING.LOAD_GROWTH_FACTOR.max}x`, description: "Future expansion allowance" },
    { factor: "Diversity Factor", multiplier: `${TRANSFORMER_SIZING.DIVERSITY_FACTOR.min}-${TRANSFORMER_SIZING.DIVERSITY_FACTOR.max}x`, description: "Not all loads peak simultaneously" },
    { factor: "Efficiency Derating", multiplier: `${TRANSFORMER_SIZING.EFFICIENCY_DERATING}x`, description: "Transformer losses" },
    { factor: "Altitude Derating", multiplier: `${TRANSFORMER_SIZING.ALTITUDE_DERATING_PER_330FT}% per 330ft >3300ft`, description: "Reduced cooling at altitude" },
    { factor: "Ambient Temperature", multiplier: `${TRANSFORMER_SIZING.AMBIENT_TEMP_DERATING_PER_C}% per °C >30°C`, description: "Hot climate derating" }
  ];

  // Calculate transformer size
  const calculateTransformerSize = () => {
    const apparentPower = loadMW / powerFactor; // MVA
    const withGrowth = apparentPower * 1.2; // 20% growth factor
    const withDiversity = withGrowth * 0.9; // 90% diversity
    return Math.ceil(withDiversity * 10) / 10;
  };

  return (
    <section id="transformers" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <ScrollReveal>
          <div className="text-center mb-16">
            <span className="inline-block px-3 py-1 bg-watt-bitcoin/10 text-watt-bitcoin rounded-full text-sm font-medium mb-4">
              Voltage Conversion
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Transformer Systems
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Step-down transformers convert high voltage to usable levels—understanding types, 
              sizing, and cooling is critical for reliable operations.
            </p>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={100}>
          <div className="grid lg:grid-cols-3 gap-6 mb-16">
            {transformerTypes.map((xfmr, index) => (
              <div key={index} className="bg-card border border-border rounded-xl overflow-hidden hover:border-watt-bitcoin/50 transition-colors">
                <div className="bg-gradient-to-r from-watt-navy to-watt-navy/80 p-4">
                  <h3 className="text-lg font-bold text-white">{xfmr.type}</h3>
                  <p className="text-white/70 text-sm">{xfmr.cooling}</p>
                </div>
                <div className="p-5">
                  <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Capacity:</span>
                      <div className="font-semibold text-foreground">{xfmr.capacity}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Efficiency:</span>
                      <div className="font-semibold text-foreground">
                        <CitedStatistic
                          value={xfmr.efficiency}
                          label={`${xfmr.type} typical efficiency range`}
                          source="Industry Standard"
                          size="sm"
                          variant="success"
                        />
                      </div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Lifespan:</span>
                      <div className="font-semibold text-foreground">
                        <CitedStatistic
                          value={xfmr.lifespan}
                          label={`${xfmr.type} expected operational lifespan`}
                          source="IEEE C57.91"
                          size="sm"
                          variant="default"
                        />
                      </div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Maintenance:</span>
                      <div className="font-semibold text-foreground text-xs">{xfmr.maintenance}</div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <h4 className="text-xs font-semibold text-watt-success mb-1">Advantages</h4>
                      <div className="flex flex-wrap gap-1">
                        {xfmr.pros.map((pro, i) => (
                          <span key={i} className="text-xs bg-watt-success/10 text-watt-success px-2 py-0.5 rounded">
                            {pro}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold text-destructive mb-1">Considerations</h4>
                      <div className="flex flex-wrap gap-1">
                        {xfmr.cons.map((con, i) => (
                          <span key={i} className="text-xs bg-destructive/10 text-destructive px-2 py-0.5 rounded">
                            {con}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollReveal>

        <ScrollReveal delay={200}>
          <div className="grid lg:grid-cols-2 gap-8">
            <div className="bg-card border border-border rounded-xl p-6">
              <div className="flex items-center gap-2 mb-6">
                <Calculator className="w-5 h-5 text-watt-bitcoin" />
                <h3 className="text-xl font-bold text-foreground">Transformer Sizing Calculator</h3>
              </div>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Connected Load (MW): {loadMW} MW
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="100"
                    value={loadMW}
                    onChange={(e) => setLoadMW(Number(e.target.value))}
                    className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-watt-bitcoin"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Power Factor: {powerFactor}
                  </label>
                  <input
                    type="range"
                    min="0.8"
                    max="1"
                    step="0.01"
                    value={powerFactor}
                    onChange={(e) => setPowerFactor(Number(e.target.value))}
                    className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-watt-bitcoin"
                  />
                </div>
                <div className="p-4 bg-watt-bitcoin/10 rounded-xl">
                  <div className="text-sm text-muted-foreground mb-1">Recommended Transformer Size</div>
                  <div className="text-3xl font-bold text-watt-bitcoin">
                    {calculateTransformerSize()} MVA
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Includes 20% growth factor and 90% diversity factor
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-card border border-border rounded-xl p-6">
              <h3 className="text-xl font-bold text-foreground mb-6">Sizing Factors</h3>
              <div className="space-y-4">
                {sizingFactors.map((item, index) => (
                  <div key={index} className="flex items-start gap-4 p-3 bg-muted/50 rounded-lg">
                    <div className="shrink-0">
                      <div className="text-sm font-bold text-watt-bitcoin">{item.multiplier}</div>
                    </div>
                    <div>
                      <div className="font-medium text-foreground text-sm">{item.factor}</div>
                      <div className="text-xs text-muted-foreground">{item.description}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={300}>
          <div className="mt-12 bg-card border border-border rounded-xl p-6">
            <h3 className="text-xl font-bold text-foreground mb-6">Cooling Methods</h3>
            <div className="grid md:grid-cols-4 gap-4">
              <div className="p-4 bg-muted/50 rounded-lg text-center">
                <Droplets className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                <div className="font-semibold text-foreground mb-1">ONAN</div>
                <p className="text-xs text-muted-foreground">Oil Natural, Air Natural</p>
                <p className="text-xs text-muted-foreground mt-2">Base rating, passive cooling</p>
              </div>
              <div className="p-4 bg-muted/50 rounded-lg text-center">
                <Wind className="w-8 h-8 text-cyan-500 mx-auto mb-2" />
                <div className="font-semibold text-foreground mb-1">ONAF</div>
                <p className="text-xs text-muted-foreground">Oil Natural, Air Forced</p>
                <p className="text-xs text-muted-foreground mt-2">
                  +<CitedStatistic
                    value={TRANSFORMER_SPECS.ONAF_CAPACITY_BOOST}
                    unit="%"
                    label="Capacity increase with ONAF cooling"
                    source="IEEE C57.91"
                    size="sm"
                    variant="bitcoin"
                  /> capacity with fans
                </p>
              </div>
              <div className="p-4 bg-muted/50 rounded-lg text-center">
                <div className="w-8 h-8 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Droplets className="w-5 h-5 text-purple-500" />
                </div>
                <div className="font-semibold text-foreground mb-1">OFAF</div>
                <p className="text-xs text-muted-foreground">Oil Forced, Air Forced</p>
                <p className="text-xs text-muted-foreground mt-2">
                  +<CitedStatistic
                    value={TRANSFORMER_SPECS.OFAF_CAPACITY_BOOST}
                    unit="%"
                    label="Capacity increase with OFAF cooling"
                    source="IEEE C57.91"
                    size="sm"
                    variant="bitcoin"
                  /> capacity, pumps + fans
                </p>
              </div>
              <div className="p-4 bg-muted/50 rounded-lg text-center">
                <Thermometer className="w-8 h-8 text-orange-500 mx-auto mb-2" />
                <div className="font-semibold text-foreground mb-1">ODAF</div>
                <p className="text-xs text-muted-foreground">Oil Directed, Air Forced</p>
                <p className="text-xs text-muted-foreground mt-2">Maximum capacity, directed flow</p>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
};

export default TransformersSection;
