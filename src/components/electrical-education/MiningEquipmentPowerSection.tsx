import { ScrollReveal } from "@/components/landing/ScrollAnimations";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Zap, Cpu, Cable, Gauge } from "lucide-react";

const MiningEquipmentPowerSection = () => {
  const efficiencyRatings = [
    { rating: "80+ Bronze", efficiency: "82-85%", typical: "Budget PSUs", color: "bg-amber-600" },
    { rating: "80+ Silver", efficiency: "85-88%", typical: "Standard PSUs", color: "bg-gray-400" },
    { rating: "80+ Gold", efficiency: "88-92%", typical: "Quality PSUs", color: "bg-yellow-500" },
    { rating: "80+ Platinum", efficiency: "92-94%", typical: "Premium PSUs", color: "bg-blue-300" },
    { rating: "80+ Titanium", efficiency: "94-96%", typical: "Enterprise PSUs", color: "bg-slate-600" }
  ];

  return (
    <section id="mining-power" className="py-16 md:py-24 bg-muted">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-watt-bitcoin/10 text-watt-bitcoin text-sm font-medium mb-4">
              <span>Section 8</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Mining Equipment Power
            </h2>
            <p className="text-muted-foreground max-w-3xl mx-auto">
              Understanding how ASIC miners consume and convert power is essential for efficient 
              datacenter design. From switch-mode power supplies to hash board requirements.
            </p>
          </div>
        </ScrollReveal>

        {/* SMPS Technology */}
        <ScrollReveal delay={100}>
          <Card className="mb-12 border-border shadow-institutional">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <Zap className="w-5 h-5 text-watt-bitcoin" />
                Switch-Mode Power Supply (SMPS) Technology
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid lg:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <p className="text-muted-foreground">
                    Modern ASIC miners use <strong className="text-foreground">switch-mode power supplies</strong> to convert 
                    AC mains voltage to the low-voltage DC required by hash boards. SMPS are 
                    far more efficient than linear power supplies.
                  </p>
                  
                  <div className="p-4 bg-card rounded-lg border border-border">
                    <h4 className="font-semibold text-foreground mb-3">SMPS Conversion Stages:</h4>
                    <div className="space-y-2">
                      <div className="p-2 bg-muted rounded flex items-center gap-3">
                        <span className="w-6 h-6 rounded-full bg-watt-bitcoin text-white text-xs flex items-center justify-center">1</span>
                        <div className="text-sm">
                          <strong className="text-foreground">Rectifier:</strong> <span className="text-muted-foreground">AC → Unregulated DC (bridge rectifier)</span>
                        </div>
                      </div>
                      <div className="p-2 bg-muted rounded flex items-center gap-3">
                        <span className="w-6 h-6 rounded-full bg-watt-bitcoin text-white text-xs flex items-center justify-center">2</span>
                        <div className="text-sm">
                          <strong className="text-foreground">PFC Stage:</strong> <span className="text-muted-foreground">Power factor correction (active PFC to 0.95+)</span>
                        </div>
                      </div>
                      <div className="p-2 bg-muted rounded flex items-center gap-3">
                        <span className="w-6 h-6 rounded-full bg-watt-bitcoin text-white text-xs flex items-center justify-center">3</span>
                        <div className="text-sm">
                          <strong className="text-foreground">Switching:</strong> <span className="text-muted-foreground">High-frequency switching (50-200 kHz)</span>
                        </div>
                      </div>
                      <div className="p-2 bg-muted rounded flex items-center gap-3">
                        <span className="w-6 h-6 rounded-full bg-watt-bitcoin text-white text-xs flex items-center justify-center">4</span>
                        <div className="text-sm">
                          <strong className="text-foreground">Transformer:</strong> <span className="text-muted-foreground">Isolation and voltage step-down</span>
                        </div>
                      </div>
                      <div className="p-2 bg-muted rounded flex items-center gap-3">
                        <span className="w-6 h-6 rounded-full bg-watt-bitcoin text-white text-xs flex items-center justify-center">5</span>
                        <div className="text-sm">
                          <strong className="text-foreground">Output Rectifier:</strong> <span className="text-muted-foreground">Secondary rectification → 12V DC</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-semibold text-foreground">80+ Efficiency Ratings:</h4>
                  <div className="space-y-2">
                    {efficiencyRatings.map((rating) => (
                      <div key={rating.rating} className="p-3 bg-card rounded-lg border border-border flex items-center gap-3">
                        <div className={`w-4 h-4 rounded ${rating.color}`} />
                        <div className="flex-1">
                          <span className="font-medium text-foreground">{rating.rating}</span>
                          <span className="text-xs text-muted-foreground ml-2">{rating.typical}</span>
                        </div>
                        <span className="text-sm font-bold text-watt-bitcoin">{rating.efficiency}</span>
                      </div>
                    ))}
                  </div>
                  
                  <div className="p-3 bg-watt-success/10 rounded-lg border border-watt-success/20">
                    <p className="text-xs text-muted-foreground">
                      <strong className="text-foreground">Mining Tip:</strong> Efficiency varies with load. PSUs are most efficient 
                      at 50-80% load. Running at 100% or below 20% reduces efficiency significantly.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </ScrollReveal>

        {/* Hash Board Power */}
        <div className="grid lg:grid-cols-2 gap-8 mb-12">
          <ScrollReveal delay={200}>
            <Card className="h-full border-border shadow-institutional">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <Cpu className="w-5 h-5 text-watt-bitcoin" />
                  Hash Board DC Requirements
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Hash boards contain the ASIC chips that perform SHA-256 calculations. 
                  They require stable, clean DC power at specific voltages.
                </p>

                <div className="space-y-3">
                  <div className="p-3 bg-muted rounded-lg">
                    <h5 className="font-medium text-foreground">Voltage Requirements</h5>
                    <p className="text-xs text-muted-foreground">
                      Most miners use 12-15V DC for hash boards. Some newer models use higher 
                      voltages (48V) for better efficiency. Voltage must be stable within ±5%.
                    </p>
                  </div>
                  
                  <div className="p-3 bg-muted rounded-lg">
                    <h5 className="font-medium text-foreground">Current per Hash Board</h5>
                    <p className="text-xs text-muted-foreground">
                      Each hash board draws 40-150A depending on model. S19 XP: ~90A per board. 
                      S21: ~120A per board. High current requires heavy copper traces and connectors.
                    </p>
                  </div>
                  
                  <div className="p-3 bg-muted rounded-lg">
                    <h5 className="font-medium text-foreground">Power Distribution</h5>
                    <p className="text-xs text-muted-foreground">
                      PSU distributes power via thick cables (6-8 AWG) to each hash board. 
                      Poor connections cause voltage drop, reducing performance and causing chip damage.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </ScrollReveal>

          <ScrollReveal delay={300}>
            <Card className="h-full border-border shadow-institutional">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <Cable className="w-5 h-5 text-watt-bitcoin" />
                  Power Cable Sizing
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Proper cable sizing prevents voltage drop and fire hazards. 
                  Consider both ampacity and voltage drop.
                </p>

                <div className="space-y-2">
                  <h4 className="font-semibold text-foreground text-sm">Cable Gauge Selection (240V, 3% max drop):</h4>
                  
                  <div className="p-2 bg-muted rounded flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">10-15A (single miner)</span>
                    <span className="font-bold text-foreground">12 AWG up to 50ft</span>
                  </div>
                  <div className="p-2 bg-muted rounded flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">15-20A (single miner)</span>
                    <span className="font-bold text-foreground">10 AWG up to 50ft</span>
                  </div>
                  <div className="p-2 bg-muted rounded flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">20-30A (1-2 miners)</span>
                    <span className="font-bold text-foreground">8 AWG up to 50ft</span>
                  </div>
                  <div className="p-2 bg-muted rounded flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">30-40A (2 miners)</span>
                    <span className="font-bold text-foreground">6 AWG up to 50ft</span>
                  </div>
                </div>

                <div className="p-3 bg-watt-bitcoin/10 rounded-lg border border-watt-bitcoin/20">
                  <h5 className="font-semibold text-foreground text-sm mb-1">Connector Types:</h5>
                  <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                    <div><strong className="text-foreground">C13/C14:</strong> Up to 15A (common IT)</div>
                    <div><strong className="text-foreground">C19/C20:</strong> Up to 20A (high-power)</div>
                    <div><strong className="text-foreground">NEMA 6-20:</strong> 20A @ 240V</div>
                    <div><strong className="text-foreground">NEMA 6-30:</strong> 30A @ 240V</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </ScrollReveal>
        </div>

        {/* Startup Inrush */}
        <ScrollReveal delay={400}>
          <Card className="border-border shadow-institutional">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <Gauge className="w-5 h-5 text-watt-bitcoin" />
                Startup Inrush & Power Profiles
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <h4 className="font-semibold text-foreground">Inrush Current</h4>
                  <p className="text-sm text-muted-foreground">
                    When miners power on, they draw significantly more current than steady-state 
                    due to capacitor charging and motor starting in fans.
                  </p>
                  
                  <div className="p-4 bg-muted rounded-lg">
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Steady-state current:</span>
                        <span className="font-bold text-foreground">15-25A @ 240V</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Inrush peak:</span>
                        <span className="font-bold text-red-600">50-100A for 10-100ms</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Inrush ratio:</span>
                        <span className="font-bold text-foreground">3-5× steady-state</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-3 bg-watt-bitcoin/10 rounded-lg border border-watt-bitcoin/20">
                    <p className="text-xs text-muted-foreground">
                      <strong className="text-foreground">Design Impact:</strong> Don't start all miners simultaneously. 
                      Stagger startup (soft-start) to avoid tripping breakers. Budget 2-3 seconds 
                      between each miner or use breakers with high magnetic trip settings.
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-semibold text-foreground">Power Consumption Profile</h4>
                  <p className="text-sm text-muted-foreground">
                    Miner power consumption varies with operating mode and temperature.
                  </p>

                  <div className="space-y-2">
                    <div className="p-3 bg-muted rounded-lg">
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-foreground">Idle/Standby</span>
                        <span className="text-sm text-muted-foreground">50-100W (control board only)</span>
                      </div>
                    </div>
                    <div className="p-3 bg-muted rounded-lg">
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-foreground">Normal Mode</span>
                        <span className="text-sm text-muted-foreground">Rated power (e.g., 3500W)</span>
                      </div>
                    </div>
                    <div className="p-3 bg-muted rounded-lg">
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-foreground">Low Power Mode</span>
                        <span className="text-sm text-muted-foreground">70-80% of rated</span>
                      </div>
                    </div>
                    <div className="p-3 bg-watt-success/10 rounded-lg border border-watt-success/20">
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-foreground">High Performance</span>
                        <span className="text-sm text-watt-success">110-120% (overclocked)</span>
                      </div>
                    </div>
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

export default MiningEquipmentPowerSection;
