import { ScrollReveal } from "@/components/landing/ScrollAnimations";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Zap, Shield, AlertTriangle } from "lucide-react";

const PowerQualitySection = () => {
  const powerDisturbances = [
    { name: "Sag (Dip)", description: "Voltage drops 10-90% for 0.5 cycles to 1 minute", cause: "Large motor starting, grid faults", impact: "Miner resets, lost hashrate" },
    { name: "Swell", description: "Voltage rises 10-80% above normal for 0.5 cycles to 1 minute", cause: "Load shedding, capacitor switching", impact: "Component stress, PSU damage" },
    { name: "Interruption", description: "Complete loss of voltage", cause: "Breaker trips, utility outage", impact: "Full shutdown, data loss" },
    { name: "Transient", description: "Very brief (μs-ms) voltage spike or oscillation", cause: "Lightning, switching", impact: "Component failure, memory errors" },
    { name: "Harmonic Distortion", description: "Voltage/current waveform distortion", cause: "Non-linear loads (PSUs)", impact: "Overheating, neutral conductor loading" },
    { name: "Flicker", description: "Rapid, small voltage variations", cause: "Arc furnaces, variable loads", impact: "Usually minor for mining" }
  ];

  return (
    <section id="power-quality" className="py-16 md:py-24 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-watt-bitcoin/10 text-watt-bitcoin text-sm font-medium mb-4">
              <span>Section 9</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Power Quality
            </h2>
            <p className="text-muted-foreground max-w-3xl mx-auto">
              Power quality affects miner reliability and lifespan. Understanding disturbances, 
              harmonics, and mitigation strategies is essential for stable operations.
            </p>
          </div>
        </ScrollReveal>

        {/* Power Disturbances */}
        <ScrollReveal delay={100}>
          <Card className="mb-12 border-border shadow-institutional">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <Activity className="w-5 h-5 text-watt-bitcoin" />
                Power Disturbances
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {powerDisturbances.map((disturbance) => (
                  <div key={disturbance.name} className="p-4 bg-muted rounded-lg">
                    <h4 className="font-semibold text-foreground mb-2">{disturbance.name}</h4>
                    <p className="text-xs text-muted-foreground mb-2">{disturbance.description}</p>
                    <div className="space-y-1 text-xs">
                      <div><span className="text-muted-foreground/50">Cause:</span> <span className="text-muted-foreground">{disturbance.cause}</span></div>
                      <div><span className="text-muted-foreground/50">Impact:</span> <span className="text-red-600">{disturbance.impact}</span></div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </ScrollReveal>

        {/* Harmonics */}
        <div className="grid lg:grid-cols-2 gap-8 mb-12">
          <ScrollReveal delay={200}>
            <Card className="h-full border-border shadow-institutional">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <Zap className="w-5 h-5 text-watt-bitcoin" />
                  Harmonic Distortion from Mining PSUs
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Switch-mode power supplies draw non-sinusoidal current, creating harmonics 
                  that can cause problems in the electrical system.
                </p>

                <div className="space-y-3">
                  <div className="p-3 bg-muted rounded-lg">
                    <h5 className="font-medium text-foreground">THDi (Total Harmonic Distortion - Current)</h5>
                    <p className="text-xs text-muted-foreground">
                      Mining PSUs with active PFC typically have 5-15% THDi. 
                      Older or low-quality PSUs may exceed 30%.
                    </p>
                  </div>
                  
                  <div className="p-3 bg-muted rounded-lg">
                    <h5 className="font-medium text-foreground">Dominant Harmonics</h5>
                    <p className="text-xs text-muted-foreground">
                      3rd harmonic (180 Hz) is most problematic - adds in neutral conductor. 
                      5th and 7th also significant. Even harmonics minimal with good PFC.
                    </p>
                  </div>
                  
                  <div className="p-3 bg-muted rounded-lg">
                    <h5 className="font-medium text-foreground">IEEE 519 Limits</h5>
                    <p className="text-xs text-muted-foreground">
                      Voltage THD at PCC: ≤5%. Current THD depends on system impedance. 
                      Large mining facilities may require harmonic mitigation.
                    </p>
                  </div>
                </div>

                <div className="p-3 bg-watt-bitcoin/10 rounded-lg border border-watt-bitcoin/20">
                  <h5 className="font-semibold text-foreground text-sm mb-1">Neutral Conductor Sizing</h5>
                  <p className="text-xs text-muted-foreground">
                    3rd harmonic currents add in the neutral (don't cancel like fundamentals). 
                    Size neutral at 150-200% of phase conductors for mining loads.
                  </p>
                </div>
              </CardContent>
            </Card>
          </ScrollReveal>

          <ScrollReveal delay={300}>
            <Card className="h-full border-border shadow-institutional">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <Shield className="w-5 h-5 text-watt-bitcoin" />
                  Power Factor Correction
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Modern mining PSUs include Active Power Factor Correction (APFC) to minimize 
                  reactive power and improve efficiency.
                </p>

                <div className="space-y-3">
                  <div className="p-3 bg-muted rounded-lg">
                    <h5 className="font-medium text-foreground">Passive PFC</h5>
                    <p className="text-xs text-muted-foreground">
                      Uses inductors to filter harmonics. Simple but bulky. 
                      Achieves PF of 0.7-0.85. Rarely used in modern miners.
                    </p>
                  </div>
                  
                  <div className="p-3 bg-watt-success/10 rounded-lg border border-watt-success/20">
                    <h5 className="font-medium text-watt-success">Active PFC</h5>
                    <p className="text-xs text-muted-foreground">
                      Uses switching converter to shape input current. 
                      Achieves PF of 0.95-0.99. Standard in quality mining PSUs. 
                      Also reduces THDi to 5-15%.
                    </p>
                  </div>
                </div>

                <div className="p-4 bg-muted/50 rounded-lg">
                  <h5 className="font-semibold text-foreground text-sm mb-2">Facility-Level PFC</h5>
                  <p className="text-xs text-muted-foreground">
                    If average facility PF drops below 0.90, consider capacitor banks at the 
                    service entrance. Automatic power factor correction (APFC) systems 
                    switch capacitors based on real-time PF measurement.
                  </p>
                </div>
              </CardContent>
            </Card>
          </ScrollReveal>
        </div>

        {/* Surge Protection */}
        <ScrollReveal delay={400}>
          <Card className="border-border shadow-institutional">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <AlertTriangle className="w-5 h-5 text-watt-bitcoin" />
                Surge Protection Devices (SPDs)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="space-y-4">
                  <div className="p-4 bg-watt-bitcoin/5 rounded-lg border border-watt-bitcoin/20">
                    <h4 className="font-semibold text-foreground mb-2">Type 1 SPD</h4>
                    <p className="text-sm text-muted-foreground mb-2">
                      Installed at service entrance. Handles direct lightning strikes. 
                      Highest surge current rating (100-200 kA).
                    </p>
                    <p className="text-xs text-muted-foreground">
                      <strong className="text-foreground">Location:</strong> Main switchboard, before main breaker
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="p-4 bg-watt-success/5 rounded-lg border border-watt-success/20">
                    <h4 className="font-semibold text-foreground mb-2">Type 2 SPD</h4>
                    <p className="text-sm text-muted-foreground mb-2">
                      Installed at distribution panels. Handles indirect surges. 
                      Medium surge current rating (20-80 kA).
                    </p>
                    <p className="text-xs text-muted-foreground">
                      <strong className="text-foreground">Location:</strong> Sub-panels, PDUs
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="p-4 bg-watt-coinbase/5 rounded-lg border border-watt-coinbase/20">
                    <h4 className="font-semibold text-foreground mb-2">Type 3 SPD</h4>
                    <p className="text-sm text-muted-foreground mb-2">
                      Point-of-use protection. Fine surge filtering. 
                      Lower surge current rating (3-10 kA).
                    </p>
                    <p className="text-xs text-muted-foreground">
                      <strong className="text-foreground">Location:</strong> Individual outlets, equipment inputs
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-6 p-4 bg-muted rounded-lg">
                <h5 className="font-semibold text-foreground mb-2">Coordinated Protection</h5>
                <p className="text-sm text-muted-foreground">
                  Best protection uses all three types in a <strong className="text-foreground">cascade</strong>. Type 1 at service 
                  entrance absorbs bulk of surge energy. Type 2 at panels catches remaining surges. 
                  Type 3 provides final filtering for sensitive equipment.
                </p>
              </div>
            </CardContent>
          </Card>
        </ScrollReveal>
      </div>
    </section>
  );
};

export default PowerQualitySection;
