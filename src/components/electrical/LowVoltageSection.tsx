import React from 'react';
import { Zap, Cable, Box, AlertCircle } from 'lucide-react';
import { ScrollReveal } from '@/components/landing/ScrollAnimations';

const LowVoltageSection = () => {
  const voltageStandards = [
    {
      region: "North America",
      industrial: "480V 3-phase",
      distribution: "208V/120V",
      code: "NEC (NFPA 70)",
      notes: "480V most common for industrial. Canada also uses 600V."
    },
    {
      region: "Canada",
      industrial: "600V 3-phase",
      distribution: "208V/120V",
      code: "CEC",
      notes: "600V preferred for mining operations due to efficiency."
    },
    {
      region: "Europe/International",
      industrial: "400V 3-phase",
      distribution: "230V",
      code: "IEC",
      notes: "50Hz systems, different connector standards."
    }
  ];

  const wireTypes = [
    {
      type: "THHN/THWN",
      temp: "90°C dry / 75°C wet",
      voltage: "600V",
      use: "General purpose, in conduit",
      jacket: "Nylon over PVC"
    },
    {
      type: "XHHW-2",
      temp: "90°C dry & wet",
      voltage: "600V",
      use: "Wet locations, underground",
      jacket: "Cross-linked polyethylene"
    },
    {
      type: "MC Cable",
      temp: "90°C",
      voltage: "600V",
      use: "Exposed runs, industrial",
      jacket: "Metal clad armor"
    },
    {
      type: "Tray Cable (TC)",
      temp: "90°C",
      voltage: "600V",
      use: "Cable trays, open runs",
      jacket: "Flame retardant"
    }
  ];

  const ampacityTable = [
    { awg: "14", cu75: 15, cu90: 20, al75: "-", al90: "-" },
    { awg: "12", cu75: 20, cu90: 25, al75: 15, al90: 20 },
    { awg: "10", cu75: 30, cu90: 35, al75: 25, al90: 30 },
    { awg: "8", cu75: 40, cu90: 50, al75: 35, al90: 40 },
    { awg: "6", cu75: 55, cu90: 65, al75: 45, al90: 50 },
    { awg: "4", cu75: 70, cu90: 85, al75: 55, al90: 65 },
    { awg: "2", cu75: 95, cu90: 115, al75: 75, al90: 90 },
    { awg: "1/0", cu75: 125, cu90: 150, al75: 100, al90: 120 },
    { awg: "2/0", cu75: 145, cu90: 175, al75: 115, al90: 135 },
    { awg: "4/0", cu75: 195, cu90: 230, al75: 150, al90: 180 },
    { awg: "250 kcmil", cu75: 215, cu90: 255, al75: 170, al90: 205 },
    { awg: "500 kcmil", cu75: 320, cu90: 380, al75: 250, al90: 310 }
  ];

  return (
    <section id="low-voltage" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <ScrollReveal>
          <div className="text-center mb-16">
            <span className="inline-block px-3 py-1 bg-watt-bitcoin/10 text-watt-bitcoin rounded-full text-sm font-medium mb-4">
              Facility Distribution
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Low Voltage Distribution
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              480V/600V distribution systems deliver power throughout the facility—proper design 
              ensures safety, efficiency, and code compliance.
            </p>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={100}>
          <div className="mb-16">
            <h3 className="text-2xl font-bold text-foreground mb-8">Voltage Standards by Region</h3>
            <div className="grid md:grid-cols-3 gap-6">
              {voltageStandards.map((std, index) => (
                <div key={index} className="bg-card border border-border rounded-xl p-6">
                  <h4 className="text-lg font-bold text-foreground mb-4">{std.region}</h4>
                  <div className="space-y-3 text-sm">
                    <div>
                      <span className="text-muted-foreground">Industrial:</span>
                      <div className="font-bold text-watt-bitcoin text-lg">{std.industrial}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Distribution:</span>
                      <div className="font-semibold text-foreground">{std.distribution}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Electrical Code:</span>
                      <div className="font-semibold text-foreground">{std.code}</div>
                    </div>
                    <p className="text-xs text-muted-foreground pt-2 border-t border-border">{std.notes}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={200}>
          <div className="grid lg:grid-cols-2 gap-8 mb-16">
            <div className="bg-card border border-border rounded-xl p-6">
              <div className="flex items-center gap-2 mb-6">
                <Cable className="w-5 h-5 text-watt-bitcoin" />
                <h3 className="text-xl font-bold text-foreground">Common Wire Types</h3>
              </div>
              <div className="space-y-4">
                {wireTypes.map((wire, index) => (
                  <div key={index} className="p-4 bg-muted/50 rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-bold text-foreground">{wire.type}</span>
                      <span className="text-xs bg-watt-bitcoin/10 text-watt-bitcoin px-2 py-0.5 rounded">{wire.voltage}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-muted-foreground">Temperature:</span>
                        <div className="text-foreground">{wire.temp}</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Application:</span>
                        <div className="text-foreground">{wire.use}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-card border border-border rounded-xl p-6">
              <div className="flex items-center gap-2 mb-6">
                <Zap className="w-5 h-5 text-watt-bitcoin" />
                <h3 className="text-xl font-bold text-foreground">Ampacity Table (NEC 310.16)</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-2 text-muted-foreground">Size</th>
                      <th className="text-center py-2 text-muted-foreground">Cu 75°C</th>
                      <th className="text-center py-2 text-muted-foreground">Cu 90°C</th>
                      <th className="text-center py-2 text-muted-foreground">Al 75°C</th>
                      <th className="text-center py-2 text-muted-foreground">Al 90°C</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ampacityTable.map((row, index) => (
                      <tr key={index} className="border-b border-border/50">
                        <td className="py-1.5 font-medium text-foreground">{row.awg}</td>
                        <td className="py-1.5 text-center text-muted-foreground">{row.cu75}A</td>
                        <td className="py-1.5 text-center text-watt-bitcoin font-medium">{row.cu90}A</td>
                        <td className="py-1.5 text-center text-muted-foreground">{row.al75}</td>
                        <td className="py-1.5 text-center text-muted-foreground">{row.al90}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-xs text-muted-foreground mt-4">
                * Ampacity for not more than 3 current-carrying conductors in raceway. 
                Apply derating factors for ambient temperature and conductor fill.
              </p>
            </div>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={300}>
          <div className="bg-card border border-border rounded-xl p-6">
            <div className="flex items-center gap-2 mb-6">
              <Box className="w-5 h-5 text-watt-bitcoin" />
              <h3 className="text-xl font-bold text-foreground">Panelboard & Breaker Sizing</h3>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="p-4 bg-muted/50 rounded-lg">
                <h4 className="font-semibold text-foreground mb-3">Main Distribution Panel (MDP)</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Typically 1600A - 4000A</li>
                  <li>• Fed from transformer secondary</li>
                  <li>• Distributes to sub-panels</li>
                  <li>• Contains main breaker/disconnect</li>
                </ul>
              </div>
              <div className="p-4 bg-muted/50 rounded-lg">
                <h4 className="font-semibold text-foreground mb-3">Distribution Panels (DP)</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• 400A - 1200A typical</li>
                  <li>• Zone-based distribution</li>
                  <li>• Feed PDUs or sub-panels</li>
                  <li>• May include metering</li>
                </ul>
              </div>
              <div className="p-4 bg-muted/50 rounded-lg">
                <h4 className="font-semibold text-foreground mb-3">Branch Panels</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• 100A - 400A typical</li>
                  <li>• Final distribution to loads</li>
                  <li>• Row-level or rack-level</li>
                  <li>• Branch circuit protection</li>
                </ul>
              </div>
            </div>
            <div className="mt-6 p-4 bg-destructive/10 rounded-xl border border-destructive/20">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
                <p className="text-sm text-muted-foreground">
                  <span className="font-semibold text-foreground">Available Fault Current:</span> All 
                  equipment must be rated for the available fault current at its location. Higher fault 
                  current requires higher-rated (and more expensive) equipment. Fault current decreases 
                  with distance from the transformer.
                </p>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
};

export default LowVoltageSection;
