import React from 'react';
import { Activity, Waves, Gauge, Shield } from 'lucide-react';
import { ScrollReveal } from '@/components/landing/ScrollAnimations';
import CitedStatistic from '@/components/academy/CitedStatistic';
import { ELECTRICAL_STANDARDS, DATA_SOURCES } from '@/constants/industry-standards';

const PowerQualitySection = () => {
  const harmonicOrders = [
    { order: "3rd (180Hz)", source: "Single-phase loads, switching PSUs", effect: "Neutral overload, transformer heating" },
    { order: "5th (300Hz)", source: "VFDs, rectifiers", effect: "Motor heating, conductor losses" },
    { order: "7th (420Hz)", source: "VFDs, rectifiers", effect: "Additional motor losses" },
    { order: "11th/13th", source: "Large VFDs, UPS systems", effect: "Skin effect losses, interference" }
  ];

  const powerFactorData = [
    { pf: "1.00", description: "Unity - all power is real power", typical: "Resistive loads only" },
    { pf: `${ELECTRICAL_STANDARDS.POWER_FACTOR_TARGET}+`, description: "Excellent - minimal reactive power", typical: "Target for industrial" },
    { pf: "0.90-0.95", description: "Good - acceptable for most utilities", typical: "Mixed loads" },
    { pf: `${ELECTRICAL_STANDARDS.POWER_FACTOR_PENALTY_THRESHOLD}-0.90`, description: "Fair - may incur penalties", typical: "Many inductive loads" },
    { pf: `<${ELECTRICAL_STANDARDS.POWER_FACTOR_PENALTY_THRESHOLD}`, description: "Poor - utility penalties likely", typical: "Uncorrected motors" }
  ];

  const surgeProtection = [
    { type: "Type 1 (Primary)", location: "Service entrance", rating: "100-200 kA", protection: "Direct lightning strikes" },
    { type: "Type 2 (Secondary)", location: "Distribution panels", rating: "40-80 kA", protection: "Indirect surges, switching" },
    { type: "Type 3 (Point of Use)", location: "Equipment level", rating: "10-20 kA", protection: "Residual surges" }
  ];

  return (
    <section id="power-quality" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <ScrollReveal>
          <div className="text-center mb-16">
            <span className="inline-block px-3 py-1 bg-watt-bitcoin/10 text-watt-bitcoin rounded-full text-sm font-medium mb-4">
              Power Integrity
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Power Quality Management
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Harmonics, power factor, and surge protection affect equipment life, efficiency, 
              and utility costs—understanding these issues enables optimization.
            </p>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={100}>
          <div className="grid lg:grid-cols-2 gap-8 mb-16">
            <div className="bg-card border border-border rounded-xl p-6">
              <div className="flex items-center gap-2 mb-6">
                <Waves className="w-5 h-5 text-watt-bitcoin" />
                <h3 className="text-xl font-bold text-foreground">Harmonic Distortion</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-6">
                Non-linear loads like switching power supplies create harmonics—additional frequency 
                components that distort the voltage waveform and cause heating.
              </p>
              <div className="space-y-3">
                {harmonicOrders.map((harm, index) => (
                  <div key={index} className="p-3 bg-muted/50 rounded-lg">
                    <div className="font-medium text-foreground mb-1">{harm.order}</div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-muted-foreground">Source:</span>
                        <p className="text-foreground">{harm.source}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Effect:</span>
                        <p className="text-foreground">{harm.effect}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  <span className="font-semibold text-foreground">Mining Impact:</span> ASIC miners 
                  are significant harmonic generators. IEEE 519 limits THD to{' '}
                  <CitedStatistic
                    value={ELECTRICAL_STANDARDS.IEEE_519_THD_LIMIT}
                    unit="%"
                    label="IEEE 519 Total Harmonic Distortion limit at Point of Common Coupling"
                    source={DATA_SOURCES.IEEE_519.name}
                    sourceUrl={DATA_SOURCES.IEEE_519.url}
                    variant="bitcoin"
                    size="sm"
                  />{' '}
                  at PCC. Large facilities may require harmonic filters or K-rated transformers.
                </p>
              </div>
            </div>

            <div className="bg-card border border-border rounded-xl p-6">
              <div className="flex items-center gap-2 mb-6">
                <Gauge className="w-5 h-5 text-watt-bitcoin" />
                <h3 className="text-xl font-bold text-foreground">Power Factor Correction</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-6">
                Power factor measures how effectively electrical power is converted to useful work. 
                Low PF means more current for the same real power—higher losses and utility penalties.
              </p>
              <div className="space-y-2">
                {powerFactorData.map((item, index) => (
                  <div key={index} className="flex items-center gap-4 p-3 bg-muted/50 rounded-lg">
                    <div className={`text-lg font-bold ${
                      parseFloat(item.pf) >= 0.95 || item.pf.includes('1.00') || item.pf.includes('0.95+') ? 'text-watt-success' :
                      parseFloat(item.pf) >= 0.90 || item.pf.includes('0.90') ? 'text-amber-500' :
                      item.pf.includes('0.85') ? 'text-orange-500' :
                      'text-destructive'
                    }`}>
                      {item.pf}
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-foreground">{item.description}</div>
                      <div className="text-xs text-muted-foreground">{item.typical}</div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 p-4 bg-watt-success/10 border border-watt-success/20 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  <span className="font-semibold text-foreground">Good News:</span> Modern ASIC 
                  miners typically have active PFC built into their PSUs, achieving{' '}
                  <CitedStatistic
                    value={ELECTRICAL_STANDARDS.POWER_FACTOR_TARGET}
                    unit="+"
                    label="Target power factor for industrial facilities"
                    source="Industry Standard"
                    variant="success"
                    size="sm"
                  />{' '}
                  power factor without external correction.
                </p>
              </div>
            </div>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={200}>
          <div className="bg-card border border-border rounded-xl p-6 mb-16">
            <div className="flex items-center gap-2 mb-6">
              <Shield className="w-5 h-5 text-watt-bitcoin" />
              <h3 className="text-xl font-bold text-foreground">Surge Protection Hierarchy</h3>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {surgeProtection.map((spd, index) => (
                <div key={index} className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-watt-bitcoin to-watt-bitcoin/60 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-white font-bold">{index + 1}</span>
                  </div>
                  <h4 className="font-bold text-foreground mb-2">{spd.type}</h4>
                  <p className="text-sm text-muted-foreground mb-3">{spd.location}</p>
                  <div className="space-y-2 text-xs">
                    <div className="bg-muted/50 rounded px-3 py-1">
                      <span className="text-muted-foreground">Rating:</span>
                      <span className="text-foreground ml-1 font-medium">{spd.rating}</span>
                    </div>
                    <div className="bg-muted/50 rounded px-3 py-1">
                      <span className="text-muted-foreground">Protects:</span>
                      <span className="text-foreground ml-1">{spd.protection}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 p-4 bg-muted/50 rounded-lg">
              <p className="text-sm text-muted-foreground text-center">
                <span className="font-semibold text-foreground">Cascade Protection:</span> Each 
                level absorbs energy from the previous, protecting downstream equipment. All three 
                levels should be installed for comprehensive protection. SPDs require proper 
                grounding to function effectively.
              </p>
            </div>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={300}>
          <div className="bg-card border border-border rounded-xl p-6">
            <div className="flex items-center gap-2 mb-6">
              <Activity className="w-5 h-5 text-watt-bitcoin" />
              <h3 className="text-xl font-bold text-foreground">Voltage Regulation</h3>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 bg-muted/50 rounded-lg">
                <h4 className="font-semibold text-foreground mb-2">Nominal Range</h4>
                <CitedStatistic
                  value={`±${ELECTRICAL_STANDARDS.VOLTAGE_NOMINAL_RANGE}`}
                  unit="%"
                  label="Normal operating voltage band per ANSI C84.1"
                  source="ANSI C84.1"
                  variant="success"
                  size="lg"
                />
                <p className="text-xs text-muted-foreground mt-2">
                  Normal operating voltage band for most equipment
                </p>
              </div>
              <div className="p-4 bg-muted/50 rounded-lg">
                <h4 className="font-semibold text-foreground mb-2">Utilization Range</h4>
                <CitedStatistic
                  value={`±${ELECTRICAL_STANDARDS.VOLTAGE_UTILIZATION_RANGE}`}
                  unit="%"
                  label="Extended voltage range where equipment should still function"
                  source="ANSI C84.1"
                  variant="warning"
                  size="lg"
                />
                <p className="text-xs text-muted-foreground mt-2">
                  Extended range where equipment should still function
                </p>
              </div>
              <div className="p-4 bg-muted/50 rounded-lg">
                <h4 className="font-semibold text-foreground mb-2">Sag/Swell</h4>
                <div className="text-2xl font-bold text-foreground mb-1">0.5-30 cycles</div>
                <p className="text-xs text-muted-foreground mt-2">
                  Short duration events from faults or load switching
                </p>
              </div>
              <div className="p-4 bg-muted/50 rounded-lg">
                <h4 className="font-semibold text-foreground mb-2">Interruption</h4>
                <div className="text-2xl font-bold text-destructive mb-1">&lt;10% nominal</div>
                <p className="text-xs text-muted-foreground mt-2">
                  Near-complete loss of voltage, triggers reboot
                </p>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
};

export default PowerQualitySection;
