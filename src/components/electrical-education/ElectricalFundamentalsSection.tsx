import { useState } from "react";
import { ScrollReveal } from "@/components/landing/ScrollAnimations";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Zap, Calculator, Activity, Gauge, Info } from "lucide-react";

const ElectricalFundamentalsSection = () => {
  // Ohm's Law Calculator
  const [voltage, setVoltage] = useState<string>("240");
  const [current, setCurrent] = useState<string>("20");
  const [resistance, setResistance] = useState<string>("12");
  const [calcMode, setCalcMode] = useState<"voltage" | "current" | "resistance">("resistance");

  const calculateOhm = () => {
    const v = parseFloat(voltage) || 0;
    const i = parseFloat(current) || 0;
    const r = parseFloat(resistance) || 0;
    
    if (calcMode === "voltage") return (i * r).toFixed(2);
    if (calcMode === "current") return r > 0 ? (v / r).toFixed(2) : "0";
    if (calcMode === "resistance") return i > 0 ? (v / i).toFixed(2) : "0";
    return "0";
  };

  const calculatePower = () => {
    const v = parseFloat(voltage) || 0;
    const i = parseFloat(current) || 0;
    return (v * i).toFixed(2);
  };

  return (
    <section id="fundamentals" className="py-16 md:py-24 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-watt-bitcoin/10 text-watt-bitcoin text-sm font-medium mb-4">
              <span>Section 1</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Electrical Fundamentals
            </h2>
            <p className="text-muted-foreground max-w-3xl mx-auto">
              Understanding the core principles of electricity is essential before diving into datacenter power systems. 
              These fundamentals form the foundation for all electrical engineering decisions.
            </p>
          </div>
        </ScrollReveal>

        <div className="grid lg:grid-cols-2 gap-8 mb-12">
          {/* Ohm's Law Section */}
          <ScrollReveal delay={100}>
            <Card className="h-full border-border shadow-institutional">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <Zap className="w-5 h-5 text-watt-bitcoin" />
                  Ohm's Law: V = I × R
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground text-sm">
                  <strong className="text-foreground">Ohm's Law</strong> is the fundamental relationship between voltage (V), current (I), and resistance (R). 
                  Named after German physicist Georg Ohm, this law states that the current through a conductor is directly 
                  proportional to the voltage across it and inversely proportional to the resistance.
                </p>
                
                <div className="bg-muted rounded-lg p-4">
                  <h4 className="font-semibold text-foreground mb-3">Key Formulas:</h4>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="p-3 bg-card rounded-lg border border-border">
                      <div className="text-lg font-mono font-bold text-watt-bitcoin">V = I × R</div>
                      <div className="text-xs text-muted-foreground mt-1">Voltage</div>
                    </div>
                    <div className="p-3 bg-card rounded-lg border border-border">
                      <div className="text-lg font-mono font-bold text-watt-success">I = V / R</div>
                      <div className="text-xs text-muted-foreground mt-1">Current</div>
                    </div>
                    <div className="p-3 bg-card rounded-lg border border-border">
                      <div className="text-lg font-mono font-bold text-watt-coinbase">R = V / I</div>
                      <div className="text-xs text-muted-foreground mt-1">Resistance</div>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-semibold text-foreground">In Datacenters:</h4>
                  <ul className="text-sm text-muted-foreground space-y-2">
                    <li className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-watt-bitcoin mt-2 flex-shrink-0" />
                      <span><strong className="text-foreground">Voltage (V)</strong>: The electrical pressure pushing electrons. Datacenters use 240V, 480V, 600V for efficiency.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-watt-bitcoin mt-2 flex-shrink-0" />
                      <span><strong className="text-foreground">Current (I)</strong>: The flow of electrons measured in Amperes. A typical S21 miner draws ~15A at 240V.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-watt-bitcoin mt-2 flex-shrink-0" />
                      <span><strong className="text-foreground">Resistance (R)</strong>: Opposition to current flow measured in Ohms. Cables must be sized to minimize resistance losses.</span>
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </ScrollReveal>

          {/* Interactive Calculator */}
          <ScrollReveal delay={200}>
            <Card className="h-full border-watt-bitcoin/20 shadow-institutional bg-gradient-to-br from-card to-watt-bitcoin/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <Calculator className="w-5 h-5 text-watt-bitcoin" />
                  Interactive Ohm's Law Calculator
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Enter any two values to calculate the third. This tool helps you understand how voltage, 
                  current, and resistance relate in real-world mining scenarios.
                </p>

                <div className="grid grid-cols-3 gap-2">
                  {(["voltage", "current", "resistance"] as const).map((mode) => (
                    <button
                      key={mode}
                      onClick={() => setCalcMode(mode)}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        calcMode === mode
                          ? "bg-watt-bitcoin text-white"
                          : "bg-muted text-foreground hover:bg-muted/80"
                      }`}
                    >
                      Solve for {mode.charAt(0).toUpperCase() + mode.slice(1)}
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label className="text-xs text-muted-foreground">Voltage (V)</Label>
                    <Input
                      type="number"
                      value={calcMode === "voltage" ? calculateOhm() : voltage}
                      onChange={(e) => setVoltage(e.target.value)}
                      disabled={calcMode === "voltage"}
                      className={calcMode === "voltage" ? "bg-watt-bitcoin/10 font-bold" : ""}
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Current (A)</Label>
                    <Input
                      type="number"
                      value={calcMode === "current" ? calculateOhm() : current}
                      onChange={(e) => setCurrent(e.target.value)}
                      disabled={calcMode === "current"}
                      className={calcMode === "current" ? "bg-watt-success/10 font-bold" : ""}
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Resistance (Ω)</Label>
                    <Input
                      type="number"
                      value={calcMode === "resistance" ? calculateOhm() : resistance}
                      onChange={(e) => setResistance(e.target.value)}
                      disabled={calcMode === "resistance"}
                      className={calcMode === "resistance" ? "bg-watt-coinbase/10 font-bold" : ""}
                    />
                  </div>
                </div>

                <div className="p-4 bg-muted rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Power (P = V × I)</span>
                    <span className="text-2xl font-bold text-watt-bitcoin">{calculatePower()} W</span>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    This is the actual power consumed at these values
                  </div>
                </div>

                <div className="p-3 bg-watt-success/10 rounded-lg border border-watt-success/20">
                  <div className="flex items-start gap-2">
                    <Info className="w-4 h-4 text-watt-success mt-0.5" />
                    <div className="text-xs text-muted-foreground">
                      <strong className="text-foreground">Example:</strong> An Antminer S21 Hyd at 240V drawing 22.9A consumes 5,496W (5.5 kW). 
                      Understanding these relationships helps in cable sizing and circuit planning.
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </ScrollReveal>
        </div>

        {/* Power Formulas */}
        <ScrollReveal delay={300}>
          <Card className="mb-12 border-watt-navy/10 shadow-institutional">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-watt-navy">
                <Activity className="w-5 h-5 text-watt-bitcoin" />
                Power Formulas: Understanding Electrical Power
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <p className="text-watt-navy/70">
                    <strong>Electrical power</strong> is the rate at which electrical energy is transferred. 
                    In datacenters, understanding power calculations is critical for sizing infrastructure and estimating costs.
                  </p>
                  
                  <div className="space-y-3">
                    <h4 className="font-semibold text-watt-navy">The Three Power Equations:</h4>
                    <div className="space-y-2">
                      <div className="p-3 bg-watt-light rounded-lg flex items-center justify-between">
                        <span className="font-mono text-lg font-bold text-watt-bitcoin">P = V × I</span>
                        <span className="text-sm text-watt-navy/60">Power = Voltage × Current</span>
                      </div>
                      <div className="p-3 bg-watt-light rounded-lg flex items-center justify-between">
                        <span className="font-mono text-lg font-bold text-watt-success">P = I² × R</span>
                        <span className="text-sm text-watt-navy/60">Power = Current² × Resistance</span>
                      </div>
                      <div className="p-3 bg-watt-light rounded-lg flex items-center justify-between">
                        <span className="font-mono text-lg font-bold text-watt-coinbase">P = V² / R</span>
                        <span className="text-sm text-watt-navy/60">Power = Voltage² / Resistance</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-semibold text-watt-navy">Why P = I²R Matters in Datacenters:</h4>
                  <p className="text-sm text-watt-navy/70">
                    The I²R formula explains <strong>power losses in cables</strong>. Since power loss is proportional to 
                    the <strong>square of current</strong>, doubling current quadruples losses. This is why datacenters use 
                    higher voltages (240V, 480V, 600V) — higher voltage means lower current for the same power, dramatically 
                    reducing cable losses.
                  </p>
                  
                  <div className="p-4 bg-watt-bitcoin/5 rounded-lg border border-watt-bitcoin/20">
                    <h5 className="font-semibold text-watt-navy mb-2">Real Example: 10kW Miner</h5>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="text-watt-navy/60">At 120V:</div>
                        <div className="font-mono">I = 10,000W / 120V = <strong>83.3A</strong></div>
                        <div className="text-red-600 text-xs">Requires 2 AWG cable!</div>
                      </div>
                      <div>
                        <div className="text-watt-navy/60">At 240V:</div>
                        <div className="font-mono">I = 10,000W / 240V = <strong>41.7A</strong></div>
                        <div className="text-watt-success text-xs">Only needs 8 AWG cable</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </ScrollReveal>

        {/* AC vs DC */}
        <ScrollReveal delay={400}>
          <Card className="mb-12 border-watt-navy/10 shadow-institutional">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-watt-navy">
                <Gauge className="w-5 h-5 text-watt-bitcoin" />
                AC vs DC Power: Why Datacenters Use Both
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div className="p-4 bg-watt-coinbase/5 rounded-lg border border-watt-coinbase/20">
                    <h4 className="font-semibold text-watt-navy mb-2">AC (Alternating Current)</h4>
                    <p className="text-sm text-watt-navy/70 mb-3">
                      Current that periodically reverses direction. The grid delivers AC because it can be easily 
                      transformed to different voltages using transformers.
                    </p>
                    <ul className="text-sm text-watt-navy/70 space-y-1">
                      <li>• <strong>Frequency:</strong> 60 Hz (North America), 50 Hz (Europe/Asia)</li>
                      <li>• <strong>Transmission:</strong> Efficient over long distances</li>
                      <li>• <strong>In datacenter:</strong> Grid → Transformers → PDUs → Miners</li>
                    </ul>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="p-4 bg-watt-bitcoin/5 rounded-lg border border-watt-bitcoin/20">
                    <h4 className="font-semibold text-watt-navy mb-2">DC (Direct Current)</h4>
                    <p className="text-sm text-watt-navy/70 mb-3">
                      Current that flows in one direction. All electronics internally run on DC. 
                      ASIC chips require stable DC voltage (typically 12V) to operate.
                    </p>
                    <ul className="text-sm text-watt-navy/70 space-y-1">
                      <li>• <strong>Miners:</strong> Internal PSU converts AC → 12V DC</li>
                      <li>• <strong>Hash boards:</strong> Operate on 12-15V DC</li>
                      <li>• <strong>Control systems:</strong> Often use 24V DC for safety</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="mt-6 p-4 bg-watt-light rounded-lg">
                <h4 className="font-semibold text-watt-navy mb-2">The Power Conversion Chain:</h4>
                <div className="flex flex-wrap items-center justify-center gap-2 text-sm">
                  <span className="px-3 py-1 bg-white rounded border border-watt-navy/20">Grid AC (138kV)</span>
                  <span className="text-watt-navy/40">→</span>
                  <span className="px-3 py-1 bg-white rounded border border-watt-navy/20">Substation (25kV)</span>
                  <span className="text-watt-navy/40">→</span>
                  <span className="px-3 py-1 bg-white rounded border border-watt-navy/20">Facility (600V/480V)</span>
                  <span className="text-watt-navy/40">→</span>
                  <span className="px-3 py-1 bg-white rounded border border-watt-navy/20">PDU (240V AC)</span>
                  <span className="text-watt-navy/40">→</span>
                  <span className="px-3 py-1 bg-watt-bitcoin/10 rounded border border-watt-bitcoin/30 font-medium">Miner PSU (12V DC)</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </ScrollReveal>

        {/* Three-Phase Power */}
        <ScrollReveal delay={500}>
          <Card className="border-watt-navy/10 shadow-institutional">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-watt-navy">
                <Activity className="w-5 h-5 text-watt-bitcoin" />
                Three-Phase Power: The Industrial Standard
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid lg:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <p className="text-watt-navy/70">
                    <strong>Three-phase power</strong> is the backbone of industrial electrical systems. 
                    Instead of a single AC waveform, three separate waveforms are 120° apart, providing 
                    constant power flow and higher efficiency.
                  </p>

                  <div className="space-y-3">
                    <h4 className="font-semibold text-watt-navy">Why Three-Phase for Mining?</h4>
                    <ul className="text-sm text-watt-navy/70 space-y-2">
                      <li className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-watt-bitcoin mt-2 flex-shrink-0" />
                        <span><strong>73% more power</strong> using same wire size vs single-phase</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-watt-bitcoin mt-2 flex-shrink-0" />
                        <span><strong>Constant power delivery</strong> — no pulsating load on generators</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-watt-bitcoin mt-2 flex-shrink-0" />
                        <span><strong>Balanced loads</strong> — reduces neutral current and losses</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-watt-bitcoin mt-2 flex-shrink-0" />
                        <span><strong>Motor efficiency</strong> — for cooling fans and pumps</span>
                      </li>
                    </ul>
                  </div>

                  <div className="p-4 bg-watt-light rounded-lg">
                    <h5 className="font-semibold text-watt-navy mb-2">Three-Phase Power Formula:</h5>
                    <div className="font-mono text-lg text-center p-2 bg-white rounded border border-watt-navy/10">
                      P = √3 × V<sub>L</sub> × I<sub>L</sub> × cos(φ)
                    </div>
                    <p className="text-xs text-watt-navy/60 mt-2 text-center">
                      Where V<sub>L</sub> is line voltage, I<sub>L</sub> is line current, and cos(φ) is power factor
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  {/* Animated Phasor Diagram */}
                  <div className="p-4 bg-watt-navy rounded-lg">
                    <h5 className="font-semibold text-white mb-4 text-center">Three-Phase Waveforms</h5>
                    <div className="relative h-48 overflow-hidden">
                      <svg viewBox="0 0 400 180" className="w-full h-full">
                        {/* Grid lines */}
                        <line x1="0" y1="90" x2="400" y2="90" stroke="#ffffff20" strokeWidth="1" />
                        
                        {/* Phase A - Red */}
                        <path
                          d="M0,90 Q50,10 100,90 T200,90 T300,90 T400,90"
                          stroke="#F7931A"
                          strokeWidth="2"
                          fill="none"
                          className="animate-pulse"
                        />
                        
                        {/* Phase B - Green */}
                        <path
                          d="M0,150 Q50,70 100,150 T200,150 T300,150 T400,150"
                          stroke="#00D395"
                          strokeWidth="2"
                          fill="none"
                          className="animate-pulse"
                          style={{ animationDelay: '0.33s' }}
                          transform="translate(0, -60)"
                        />
                        
                        {/* Phase C - Blue */}
                        <path
                          d="M0,30 Q50,-50 100,30 T200,30 T300,30 T400,30"
                          stroke="#0052FF"
                          strokeWidth="2"
                          fill="none"
                          className="animate-pulse"
                          style={{ animationDelay: '0.66s' }}
                          transform="translate(0, 60)"
                        />
                        
                        {/* Labels */}
                        <text x="10" y="30" fill="#F7931A" fontSize="12">Phase A</text>
                        <text x="10" y="90" fill="#00D395" fontSize="12">Phase B</text>
                        <text x="10" y="150" fill="#0052FF" fontSize="12">Phase C</text>
                      </svg>
                    </div>
                    <p className="text-xs text-white/60 text-center mt-2">
                      Three sine waves offset by 120° provide constant power
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-watt-light rounded-lg text-center">
                      <div className="text-2xl font-bold text-watt-bitcoin">208V</div>
                      <div className="text-xs text-watt-navy/60">Line-to-Line (US)</div>
                    </div>
                    <div className="p-3 bg-watt-light rounded-lg text-center">
                      <div className="text-2xl font-bold text-watt-success">600V</div>
                      <div className="text-xs text-watt-navy/60">Line-to-Line (Canada)</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Power Factor */}
              <div className="mt-8 p-6 bg-watt-light rounded-lg">
                <h4 className="font-semibold text-watt-navy mb-4">Power Factor: Why It Matters</h4>
                <div className="grid md:grid-cols-3 gap-6">
                  <div>
                    <h5 className="font-medium text-watt-navy mb-2">What is Power Factor?</h5>
                    <p className="text-sm text-watt-navy/70">
                      Power factor (PF) measures how efficiently current is converted to useful work. 
                      A PF of 1.0 (unity) means all power is doing useful work. Mining PSUs typically achieve 0.95+ PF.
                    </p>
                  </div>
                  <div>
                    <h5 className="font-medium text-watt-navy mb-2">Real vs Reactive Power</h5>
                    <p className="text-sm text-watt-navy/70">
                      <strong>Real Power (kW):</strong> Does actual work (mining)<br />
                      <strong>Reactive Power (kVAR):</strong> Stored/released by inductors/capacitors<br />
                      <strong>Apparent Power (kVA):</strong> Total power from utility
                    </p>
                  </div>
                  <div>
                    <h5 className="font-medium text-watt-navy mb-2">Utility Penalties</h5>
                    <p className="text-sm text-watt-navy/70">
                      Utilities charge penalties for low PF (typically &lt;0.9). At 100MW, a PF of 0.85 vs 0.95 
                      could mean $50,000+/year in penalties. Modern miners have built-in PFC circuits.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </ScrollReveal>
      </div>
    </section>
  );
};

export default ElectricalFundamentalsSection;
