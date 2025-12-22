import { useState } from "react";
import { ScrollReveal } from "@/components/landing/ScrollAnimations";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Zap, Thermometer, Calculator, Shield, Wrench } from "lucide-react";

const PowerTransformersSection = () => {
  // Transformer sizing calculator
  const [loadMW, setLoadMW] = useState<string>("100");
  const [powerFactor, setPowerFactor] = useState<string>("0.95");
  const [redundancy, setRedundancy] = useState<string>("1.25");

  const calculateTransformerSize = () => {
    const mw = parseFloat(loadMW) || 0;
    const pf = parseFloat(powerFactor) || 0.95;
    const red = parseFloat(redundancy) || 1.25;
    
    const mva = (mw / pf) * red;
    return mva.toFixed(1);
  };

  const coolingMethods = [
    {
      code: "ONAN",
      name: "Oil Natural Air Natural",
      description: "Natural oil circulation with natural air cooling. No pumps or fans.",
      capacity: "100%",
      noise: "Low",
      use: "Small transformers, quiet areas"
    },
    {
      code: "ONAF",
      name: "Oil Natural Air Forced",
      description: "Natural oil circulation with forced air cooling (fans). Most common for medium/large units.",
      capacity: "133%",
      noise: "Medium",
      use: "Most power transformers"
    },
    {
      code: "OFAF",
      name: "Oil Forced Air Forced",
      description: "Pumped oil circulation with forced air cooling. Highest capacity.",
      capacity: "167%",
      noise: "High",
      use: "Large transformers, high loads"
    },
    {
      code: "ODAF",
      name: "Oil Directed Air Forced",
      description: "Oil directed through windings via pumps, forced air cooling. Maximum efficiency.",
      capacity: "167%",
      noise: "High",
      use: "Critical applications, tight footprints"
    }
  ];

  return (
    <section id="transformers" className="py-16 md:py-24 bg-muted">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-watt-bitcoin/10 text-watt-bitcoin text-sm font-medium mb-4">
              <span>Section 4</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Power Transformers Deep Dive
            </h2>
            <p className="text-muted-foreground max-w-3xl mx-auto">
              Transformers are the workhorses of electrical systems, stepping voltage up or down 
              as power flows from generation to consumption. Understanding transformer specifications 
              is critical for datacenter electrical design.
            </p>
          </div>
        </ScrollReveal>

        {/* How Transformers Work */}
        <ScrollReveal delay={100}>
          <Card className="mb-12 border-border shadow-institutional">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <Zap className="w-5 h-5 text-watt-bitcoin" />
                Transformer Theory: Electromagnetic Induction
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid lg:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <p className="text-muted-foreground">
                    Transformers work on <strong className="text-foreground">Faraday's Law of Electromagnetic Induction</strong>. 
                    An alternating current in the primary winding creates a changing magnetic field in the iron core, 
                    which induces a voltage in the secondary winding.
                  </p>
                  
                  <div className="p-4 bg-card rounded-lg border border-border">
                    <h4 className="font-semibold text-foreground mb-3">The Transformer Equation:</h4>
                    <div className="text-center p-3 bg-muted rounded font-mono text-lg">
                      V₁/V₂ = N₁/N₂ = I₂/I₁
                    </div>
                    <div className="grid grid-cols-3 gap-2 mt-3 text-xs text-center">
                      <div className="p-2 bg-watt-bitcoin/5 rounded">
                        <strong className="text-foreground">V₁/V₂</strong><br/><span className="text-muted-foreground">Voltage ratio</span>
                      </div>
                      <div className="p-2 bg-watt-success/5 rounded">
                        <strong className="text-foreground">N₁/N₂</strong><br/><span className="text-muted-foreground">Turns ratio</span>
                      </div>
                      <div className="p-2 bg-watt-coinbase/5 rounded">
                        <strong className="text-foreground">I₂/I₁</strong><br/><span className="text-muted-foreground">Current ratio (inverse)</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-watt-bitcoin/5 rounded-lg border border-watt-bitcoin/20">
                    <h5 className="font-semibold text-foreground text-sm mb-2">Example: 138kV to 25kV Step-Down</h5>
                    <p className="text-sm text-muted-foreground">
                      A transformer with 5520:1000 turns ratio (5.52:1) steps 138kV down to 25kV.<br/>
                      If primary current is 100A, secondary current is 100A × 5.52 = <strong className="text-foreground">552A</strong>
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-semibold text-foreground">Key Transformer Components:</h4>
                  <div className="space-y-2">
                    <div className="p-3 bg-card rounded-lg border border-border">
                      <h5 className="font-medium text-foreground text-sm">Core</h5>
                      <p className="text-xs text-muted-foreground">
                        Laminated silicon steel to minimize eddy current losses. 
                        Grain-oriented steel for highest efficiency.
                      </p>
                    </div>
                    <div className="p-3 bg-card rounded-lg border border-border">
                      <h5 className="font-medium text-foreground text-sm">Windings</h5>
                      <p className="text-xs text-muted-foreground">
                        Copper or aluminum conductors wrapped around the core. 
                        Insulated with paper and oil or solid insulation.
                      </p>
                    </div>
                    <div className="p-3 bg-card rounded-lg border border-border">
                      <h5 className="font-medium text-foreground text-sm">Tank</h5>
                      <p className="text-xs text-muted-foreground">
                        Steel enclosure containing oil for insulation and cooling. 
                        Designed for internal pressure and vacuum conditions.
                      </p>
                    </div>
                    <div className="p-3 bg-card rounded-lg border border-border">
                      <h5 className="font-medium text-foreground text-sm">Bushings</h5>
                      <p className="text-xs text-muted-foreground">
                        Porcelain or polymer insulators for conductor entry/exit. 
                        Capacitor-graded bushings for high voltages.
                      </p>
                    </div>
                    <div className="p-3 bg-card rounded-lg border border-border">
                      <h5 className="font-medium text-foreground text-sm">Conservator</h5>
                      <p className="text-xs text-muted-foreground">
                        Oil expansion tank with bladder or breather. 
                        Maintains oil level as temperature changes.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </ScrollReveal>

        {/* Oil vs Dry Type */}
        <div className="grid lg:grid-cols-2 gap-8 mb-12">
          <ScrollReveal delay={200}>
            <Card className="h-full border-border shadow-institutional">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <Thermometer className="w-5 h-5 text-watt-bitcoin" />
                  Oil-Filled Transformers
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Most power transformers use mineral oil for insulation and cooling. 
                  Oil provides excellent heat transfer and dielectric strength.
                </p>

                <div className="space-y-3">
                  <div className="p-3 bg-watt-success/10 rounded-lg">
                    <h5 className="font-medium text-watt-success text-sm mb-1">Advantages:</h5>
                    <ul className="text-xs text-muted-foreground space-y-1">
                      <li>• Higher MVA ratings available (up to 1000+ MVA)</li>
                      <li>• Better heat dissipation for heavy loads</li>
                      <li>• Lower cost per MVA for large units</li>
                      <li>• Longer service life (30-40 years)</li>
                      <li>• Self-healing insulation (oil fills voids)</li>
                    </ul>
                  </div>
                  
                  <div className="p-3 bg-red-50 rounded-lg">
                    <h5 className="font-medium text-red-600 text-sm mb-1">Considerations:</h5>
                    <ul className="text-xs text-muted-foreground space-y-1">
                      <li>• Fire hazard - requires containment</li>
                      <li>• Oil spill/environmental risk</li>
                      <li>• Must be outdoors or in vault</li>
                      <li>• Requires oil testing and maintenance</li>
                    </ul>
                  </div>
                </div>

                <div className="p-3 bg-muted rounded-lg">
                  <h5 className="font-medium text-foreground text-sm mb-2">Typical Datacenter Use:</h5>
                  <p className="text-xs text-muted-foreground">
                    Main power transformer (138kV/25kV → 600V) located outdoors in oil containment. 
                    Typical sizes: 20-100 MVA for mining facilities.
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
                  Dry-Type Transformers
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Dry-type transformers use solid insulation (epoxy, resin) instead of oil. 
                  Safer for indoor installation where fire risk must be minimized.
                </p>

                <div className="space-y-3">
                  <div className="p-3 bg-watt-success/10 rounded-lg">
                    <h5 className="font-medium text-watt-success text-sm mb-1">Advantages:</h5>
                    <ul className="text-xs text-muted-foreground space-y-1">
                      <li>• No fire/explosion risk - safe indoors</li>
                      <li>• No oil maintenance or containment</li>
                      <li>• Environmentally friendly</li>
                      <li>• Can be placed near loads (reduces cables)</li>
                      <li>• Lower installation cost for small units</li>
                    </ul>
                  </div>
                  
                  <div className="p-3 bg-red-50 rounded-lg">
                    <h5 className="font-medium text-red-600 text-sm mb-1">Considerations:</h5>
                    <ul className="text-xs text-muted-foreground space-y-1">
                      <li>• Limited to ~35 MVA typically</li>
                      <li>• Less overload capability</li>
                      <li>• Higher losses at same rating</li>
                      <li>• More sensitive to humidity/contamination</li>
                      <li>• Higher cost per MVA</li>
                    </ul>
                  </div>
                </div>

                <div className="p-3 bg-muted rounded-lg">
                  <h5 className="font-medium text-foreground text-sm mb-2">Typical Datacenter Use:</h5>
                  <p className="text-xs text-muted-foreground">
                    Indoor distribution transformers (600V → 240V for PDUs). 
                    Typical sizes: 500 kVA - 3 MVA per transformer.
                  </p>
                </div>
              </CardContent>
            </Card>
          </ScrollReveal>
        </div>

        {/* Cooling Methods */}
        <ScrollReveal delay={400}>
          <Card className="mb-12 border-border shadow-institutional">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <Thermometer className="w-5 h-5 text-watt-bitcoin" />
                Transformer Cooling Methods
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-6">
                Transformer cooling determines nameplate capacity. Adding fans or pumps increases 
                capacity without increasing core size. Cooling method is indicated by a 4-letter code.
              </p>

              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                {coolingMethods.map((method) => (
                  <div key={method.code} className="p-4 bg-card rounded-lg border border-border">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-2 py-1 bg-watt-bitcoin text-white text-xs font-bold rounded">
                        {method.code}
                      </span>
                    </div>
                    <h5 className="font-medium text-foreground text-sm mb-2">{method.name}</h5>
                    <p className="text-xs text-muted-foreground mb-3">{method.description}</p>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="p-1.5 bg-muted rounded">
                        <span className="text-muted-foreground/50">Capacity:</span>
                        <span className="font-medium text-foreground ml-1">{method.capacity}</span>
                      </div>
                      <div className="p-1.5 bg-muted rounded">
                        <span className="text-muted-foreground/50">Noise:</span>
                        <span className="font-medium text-foreground ml-1">{method.noise}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </ScrollReveal>

        {/* Transformer Sizing Calculator */}
        <div className="grid lg:grid-cols-2 gap-8 mb-12">
          <ScrollReveal delay={500}>
            <Card className="h-full border-watt-bitcoin/20 shadow-institutional bg-gradient-to-br from-card to-watt-bitcoin/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <Calculator className="w-5 h-5 text-watt-bitcoin" />
                  Transformer Sizing Calculator
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Calculate required transformer MVA based on load, power factor, and redundancy requirements.
                </p>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label className="text-xs text-muted-foreground">Load (MW)</Label>
                    <Input
                      type="number"
                      value={loadMW}
                      onChange={(e) => setLoadMW(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Power Factor</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={powerFactor}
                      onChange={(e) => setPowerFactor(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Redundancy Factor</Label>
                    <Input
                      type="number"
                      step="0.05"
                      value={redundancy}
                      onChange={(e) => setRedundancy(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                </div>

                <div className="p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Required Transformer Capacity</span>
                    <span className="text-3xl font-bold text-watt-bitcoin">{calculateTransformerSize()} MVA</span>
                  </div>
                  <div className="text-xs text-muted-foreground/50 mt-2">
                    Formula: MVA = (MW / PF) × Redundancy Factor
                  </div>
                </div>

                <div className="p-3 bg-watt-success/10 rounded-lg border border-watt-success/20">
                  <p className="text-xs text-muted-foreground">
                    <strong className="text-foreground">Tip:</strong> Use 1.25x redundancy for N+1 configuration (one transformer can fail). 
                    Use 2.0x for 2N configuration (full redundancy).
                  </p>
                </div>
              </CardContent>
            </Card>
          </ScrollReveal>

          <ScrollReveal delay={600}>
            <Card className="h-full border-border shadow-institutional">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <Wrench className="w-5 h-5 text-watt-bitcoin" />
                  Transformer Maintenance
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Proper maintenance extends transformer life and prevents costly failures. 
                  Oil-filled units require more attention than dry-type.
                </p>

                <div className="space-y-3">
                  <div className="p-3 bg-muted rounded-lg">
                    <h5 className="font-medium text-foreground text-sm">Oil Testing (Annual)</h5>
                    <p className="text-xs text-muted-foreground">
                      Dissolved Gas Analysis (DGA) detects internal faults. 
                      Dielectric strength, moisture, and acidity tests assess oil condition.
                    </p>
                  </div>
                  
                  <div className="p-3 bg-muted rounded-lg">
                    <h5 className="font-medium text-foreground text-sm">Infrared Thermography</h5>
                    <p className="text-xs text-muted-foreground">
                      Annual IR scans detect hot spots in bushings and connections. 
                      Catch problems before they cause failures.
                    </p>
                  </div>
                  
                  <div className="p-3 bg-muted rounded-lg">
                    <h5 className="font-medium text-foreground text-sm">Load Tap Changer (LTC)</h5>
                    <p className="text-xs text-muted-foreground">
                      LTCs require regular maintenance. Oil changes, contact inspection, 
                      and timing tests per manufacturer schedule.
                    </p>
                  </div>
                  
                  <div className="p-3 bg-muted rounded-lg">
                    <h5 className="font-medium text-foreground text-sm">Winding Resistance</h5>
                    <p className="text-xs text-muted-foreground">
                      Periodic winding resistance tests detect loose connections and 
                      shorted turns. Compare to baseline measurements.
                    </p>
                  </div>
                </div>

                <div className="p-3 bg-watt-bitcoin/10 rounded-lg border border-watt-bitcoin/20">
                  <p className="text-xs text-muted-foreground">
                    <strong className="text-foreground">Budget:</strong> Plan for 1-2% of transformer cost annually for maintenance. 
                    Major overhaul every 15-20 years. Replacement typically after 30-40 years.
                  </p>
                </div>
              </CardContent>
            </Card>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
};

export default PowerTransformersSection;
