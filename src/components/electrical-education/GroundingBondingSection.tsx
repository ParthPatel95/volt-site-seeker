import { ScrollReveal } from "@/components/landing/ScrollAnimations";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Zap, Shield, AlertTriangle, Cable } from "lucide-react";

const GroundingBondingSection = () => {
  return (
    <section id="grounding" className="py-16 md:py-24 bg-muted">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-watt-bitcoin/10 text-watt-bitcoin text-sm font-medium mb-4">
              <span>Section 10</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Grounding & Bonding
            </h2>
            <p className="text-muted-foreground max-w-3xl mx-auto">
              Proper grounding protects personnel from shock, equipment from damage, and 
              provides a path for fault current to trip protective devices.
            </p>
          </div>
        </ScrollReveal>

        {/* Ground Grid */}
        <ScrollReveal delay={100}>
          <Card className="mb-12 border-border shadow-institutional">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <Zap className="w-5 h-5 text-watt-bitcoin" />
                Ground Grid Design
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid lg:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <p className="text-muted-foreground">
                    A <strong className="text-foreground">ground grid</strong> is a network of buried conductors that provides 
                    a low-impedance path to earth. Essential for substations and large facilities.
                  </p>
                  
                  <div className="space-y-3">
                    <h4 className="font-semibold text-foreground">Ground Grid Components:</h4>
                    
                    <div className="p-3 bg-card rounded-lg border border-border">
                      <h5 className="font-medium text-foreground text-sm">Grid Conductors</h5>
                      <p className="text-xs text-muted-foreground">
                        Bare copper conductors (4/0 AWG or larger) buried 18-24" deep in a grid pattern. 
                        Spacing depends on soil resistivity and fault current.
                      </p>
                    </div>
                    
                    <div className="p-3 bg-card rounded-lg border border-border">
                      <h5 className="font-medium text-foreground text-sm">Ground Rods</h5>
                      <p className="text-xs text-muted-foreground">
                        Copper-clad steel rods (5/8" × 8-10') driven into earth. 
                        Multiple rods connected to grid. Spaced at least 6' apart for effectiveness.
                      </p>
                    </div>
                    
                    <div className="p-3 bg-card rounded-lg border border-border">
                      <h5 className="font-medium text-foreground text-sm">Exothermic Welds</h5>
                      <p className="text-xs text-muted-foreground">
                        Cadweld or thermite welds join conductors permanently. 
                        Superior to mechanical clamps for buried connections.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-semibold text-foreground">Ground Resistance Targets:</h4>
                  
                  <div className="space-y-2">
                    <div className="p-3 bg-muted rounded-lg flex justify-between items-center">
                      <span className="text-sm text-foreground">Substation grid</span>
                      <span className="font-bold text-watt-bitcoin">≤ 1Ω</span>
                    </div>
                    <div className="p-3 bg-muted rounded-lg flex justify-between items-center">
                      <span className="text-sm text-foreground">Commercial building</span>
                      <span className="font-bold text-watt-bitcoin">≤ 5Ω</span>
                    </div>
                    <div className="p-3 bg-muted rounded-lg flex justify-between items-center">
                      <span className="text-sm text-foreground">Telecom/datacenter</span>
                      <span className="font-bold text-watt-bitcoin">≤ 5Ω (often ≤1Ω)</span>
                    </div>
                    <div className="p-3 bg-muted rounded-lg flex justify-between items-center">
                      <span className="text-sm text-foreground">Lightning protection</span>
                      <span className="font-bold text-watt-bitcoin">≤ 10Ω</span>
                    </div>
                  </div>

                  <div className="p-3 bg-watt-bitcoin/10 rounded-lg border border-watt-bitcoin/20">
                    <h5 className="font-semibold text-foreground text-sm mb-1">Soil Resistivity Testing</h5>
                    <p className="text-xs text-muted-foreground">
                      Ground resistance depends heavily on soil. Rocky or sandy soil: 1,000-10,000 Ω·m. 
                      Clay or loam: 50-500 Ω·m. May need ground enhancement material (bentonite, GEM) 
                      in high-resistivity soils.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </ScrollReveal>

        {/* Step & Touch Potential */}
        <div className="grid lg:grid-cols-2 gap-8 mb-12">
          <ScrollReveal delay={200}>
            <Card className="h-full border-border shadow-institutional">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <AlertTriangle className="w-5 h-5 text-watt-bitcoin" />
                  Step & Touch Potential
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  During a ground fault, voltage gradients develop across the ground surface. 
                  These can be dangerous to personnel.
                </p>

                <div className="space-y-3">
                  <div className="p-3 bg-muted rounded-lg">
                    <h5 className="font-medium text-foreground">Step Potential</h5>
                    <p className="text-xs text-muted-foreground">
                      Voltage between a person's feet (assumed 1 meter apart) while walking near 
                      a grounded structure during a fault. Current flows through legs.
                    </p>
                  </div>
                  
                  <div className="p-3 bg-muted rounded-lg">
                    <h5 className="font-medium text-foreground">Touch Potential</h5>
                    <p className="text-xs text-muted-foreground">
                      Voltage between a person's hand (touching grounded equipment) and feet. 
                      Current flows through vital organs - more dangerous than step potential.
                    </p>
                  </div>
                  
                  <div className="p-3 bg-muted rounded-lg">
                    <h5 className="font-medium text-foreground">Transferred Potential</h5>
                    <p className="text-xs text-muted-foreground">
                      Voltage transferred via metallic paths (pipes, cables) from fault location 
                      to remote areas. Can be very dangerous.
                    </p>
                  </div>
                </div>

                <div className="p-3 bg-watt-success/10 rounded-lg border border-watt-success/20">
                  <h5 className="font-semibold text-foreground text-sm mb-1">IEEE 80 Design Standard</h5>
                  <p className="text-xs text-muted-foreground">
                    IEEE 80 provides formulas for calculating safe step and touch voltages 
                    based on fault current, clearing time, and body weight. Ground grid 
                    must be designed to keep potentials below these limits.
                  </p>
                </div>
              </CardContent>
            </Card>
          </ScrollReveal>

          <ScrollReveal delay={300}>
            <Card className="h-full border-border shadow-institutional">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <Cable className="w-5 h-5 text-watt-bitcoin" />
                  Equipment Grounding
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  All metallic equipment enclosures must be bonded to the grounding system 
                  to prevent shock hazards and ensure fault current can trip protective devices.
                </p>

                <div className="space-y-3">
                  <div className="p-3 bg-muted rounded-lg">
                    <h5 className="font-medium text-foreground">Equipment Grounding Conductor (EGC)</h5>
                    <p className="text-xs text-muted-foreground">
                      Green or bare conductor in power cables. Sized per NEC Table 250.122 
                      based on upstream breaker size. Carries fault current back to source.
                    </p>
                  </div>
                  
                  <div className="p-3 bg-muted rounded-lg">
                    <h5 className="font-medium text-foreground">Bonding Jumpers</h5>
                    <p className="text-xs text-muted-foreground">
                      Conductors connecting metal parts that might become energized. 
                      Ensures all parts are at same potential.
                    </p>
                  </div>
                  
                  <div className="p-3 bg-muted rounded-lg">
                    <h5 className="font-medium text-foreground">Ground Bus</h5>
                    <p className="text-xs text-muted-foreground">
                      Copper bus bar in panels where all grounding conductors terminate. 
                      Connected to building ground grid.
                    </p>
                  </div>
                </div>

                <div className="p-3 bg-watt-bitcoin/10 rounded-lg border border-watt-bitcoin/20">
                  <h5 className="font-semibold text-foreground text-sm mb-1">Mining Rack Grounding</h5>
                  <p className="text-xs text-muted-foreground">
                    Every miner rack/shelf must be bonded to ground. Use #6 AWG minimum 
                    to ground bus. Check bonding continuity annually. Poor grounding 
                    causes RFI issues and safety hazards.
                  </p>
                </div>
              </CardContent>
            </Card>
          </ScrollReveal>
        </div>

        {/* Lightning Protection */}
        <ScrollReveal delay={400}>
          <Card className="border-border shadow-institutional">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <Shield className="w-5 h-5 text-watt-bitcoin" />
                Lightning Protection Systems (LPS)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="space-y-4">
                  <h4 className="font-semibold text-foreground">Air Terminals</h4>
                  <p className="text-sm text-muted-foreground">
                    Lightning rods or catenary wires at roof level to intercept strikes.
                  </p>
                  <ul className="text-xs text-muted-foreground space-y-1">
                    <li>• Copper or aluminum rods</li>
                    <li>• Spaced per rolling sphere method</li>
                    <li>• Minimum 10" above protected area</li>
                    <li>• ESE terminals available (controversial)</li>
                  </ul>
                </div>

                <div className="space-y-4">
                  <h4 className="font-semibold text-foreground">Down Conductors</h4>
                  <p className="text-sm text-muted-foreground">
                    Conductors routing lightning current from air terminals to ground.
                  </p>
                  <ul className="text-xs text-muted-foreground space-y-1">
                    <li>• Minimum 2 down conductors per structure</li>
                    <li>• Routed to minimize bends and length</li>
                    <li>• Copper: 2 AWG minimum</li>
                    <li>• Bonded to building steel if applicable</li>
                  </ul>
                </div>

                <div className="space-y-4">
                  <h4 className="font-semibold text-foreground">Grounding Electrodes</h4>
                  <p className="text-sm text-muted-foreground">
                    Dedicated ground rods for lightning system, bonded to building ground.
                  </p>
                  <ul className="text-xs text-muted-foreground space-y-1">
                    <li>• Minimum 10' deep ground rods</li>
                    <li>• Ring ground around building perimeter</li>
                    <li>• Resistance ≤10Ω per NFPA 780</li>
                    <li>• Bond to all other grounding systems</li>
                  </ul>
                </div>
              </div>

              <div className="mt-6 p-4 bg-muted rounded-lg">
                <h5 className="font-semibold text-foreground mb-2">NFPA 780 & UL 96A</h5>
                <p className="text-sm text-muted-foreground">
                  NFPA 780 "Standard for Installation of Lightning Protection Systems" provides 
                  design requirements. UL 96A covers system components. Consider lightning 
                  protection if facility is in high-lightning area or has sensitive equipment.
                </p>
              </div>
            </CardContent>
          </Card>
        </ScrollReveal>
      </div>
    </section>
  );
};

export default GroundingBondingSection;
