import React from 'react';
import { Shield, AlertTriangle, Settings, Zap } from 'lucide-react';
import ScrollReveal from '@/components/animations/ScrollReveal';

const SwitchgearSection = () => {
  const switchgearClasses = [
    {
      class: "15kV Class",
      voltage: "Up to 15 kV",
      bil: "95-110 kV",
      applications: "Distribution substations, industrial facilities",
      interrupting: "20-40 kA"
    },
    {
      class: "25kV Class",
      voltage: "Up to 25 kV",
      bil: "125-150 kV",
      applications: "Primary distribution, mining operations",
      interrupting: "25-40 kA"
    },
    {
      class: "35kV Class",
      voltage: "Up to 38 kV",
      bil: "150-200 kV",
      applications: "Sub-transmission, large industrial",
      interrupting: "25-50 kA"
    }
  ];

  const breakerTypes = [
    {
      type: "Vacuum Circuit Breaker",
      medium: "Vacuum",
      maintenance: "Low",
      lifespan: "10,000+ operations",
      advantages: ["Compact size", "Low maintenance", "Fast operation", "Environmentally friendly"],
      typical: "Most common for 5-38kV applications"
    },
    {
      type: "SF6 Circuit Breaker",
      medium: "Sulfur Hexafluoride",
      maintenance: "Moderate",
      lifespan: "5,000+ operations",
      advantages: ["High interrupting capacity", "Compact", "Reliable"],
      typical: "High fault current applications, confined spaces"
    },
    {
      type: "Air Circuit Breaker",
      medium: "Air",
      maintenance: "Higher",
      lifespan: "2,000+ operations",
      advantages: ["No gas handling", "Visual arc inspection", "Field serviceable"],
      typical: "Low voltage (600V), older MV installations"
    }
  ];

  const protectionFunctions = [
    { code: "50", name: "Instantaneous Overcurrent", description: "Trips immediately for high fault currents" },
    { code: "51", name: "Time Overcurrent", description: "Inverse time trip for overloads" },
    { code: "50N/51N", name: "Ground Fault", description: "Detects ground/earth faults" },
    { code: "27", name: "Undervoltage", description: "Trips on low voltage condition" },
    { code: "59", name: "Overvoltage", description: "Trips on high voltage condition" },
    { code: "81", name: "Frequency", description: "Under/over frequency protection" },
    { code: "87", name: "Differential", description: "Compares current in/out for internal faults" },
    { code: "32", name: "Directional Power", description: "Detects reverse power flow" }
  ];

  return (
    <section id="switchgear" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <ScrollReveal>
          <div className="text-center mb-16">
            <span className="inline-block px-3 py-1 bg-watt-bitcoin/10 text-watt-bitcoin rounded-full text-sm font-medium mb-4">
              Protection & Control
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Medium Voltage Switchgear
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Switchgear provides circuit protection, isolation, and control—the critical safety 
              layer between utility power and your facility.
            </p>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={100}>
          <div className="mb-16">
            <h3 className="text-2xl font-bold text-foreground mb-8">Voltage Classes</h3>
            <div className="grid md:grid-cols-3 gap-6">
              {switchgearClasses.map((sg, index) => (
                <div key={index} className="bg-card border border-border rounded-xl p-6 hover:border-watt-bitcoin/50 transition-colors">
                  <div className="flex items-center gap-2 mb-4">
                    <Zap className="w-5 h-5 text-watt-bitcoin" />
                    <h4 className="text-lg font-bold text-foreground">{sg.class}</h4>
                  </div>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Max Voltage:</span>
                      <span className="font-medium text-foreground">{sg.voltage}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">BIL Rating:</span>
                      <span className="font-medium text-foreground">{sg.bil}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Interrupting:</span>
                      <span className="font-medium text-foreground">{sg.interrupting}</span>
                    </div>
                    <div className="pt-2 border-t border-border">
                      <span className="text-muted-foreground">Applications:</span>
                      <p className="font-medium text-foreground mt-1">{sg.applications}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={200}>
          <div className="mb-16">
            <h3 className="text-2xl font-bold text-foreground mb-8">Circuit Breaker Types</h3>
            <div className="grid lg:grid-cols-3 gap-6">
              {breakerTypes.map((breaker, index) => (
                <div key={index} className="bg-card border border-border rounded-xl overflow-hidden">
                  <div className="bg-watt-navy p-4">
                    <h4 className="font-bold text-white">{breaker.type}</h4>
                    <p className="text-white/70 text-sm">{breaker.typical}</p>
                  </div>
                  <div className="p-5">
                    <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Arc Medium:</span>
                        <div className="font-semibold text-foreground">{breaker.medium}</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Maintenance:</span>
                        <div className="font-semibold text-foreground">{breaker.maintenance}</div>
                      </div>
                      <div className="col-span-2">
                        <span className="text-muted-foreground">Mechanical Life:</span>
                        <div className="font-semibold text-foreground">{breaker.lifespan}</div>
                      </div>
                    </div>
                    <div>
                      <span className="text-xs font-semibold text-muted-foreground">Key Advantages:</span>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {breaker.advantages.map((adv, i) => (
                          <span key={i} className="text-xs bg-watt-success/10 text-watt-success px-2 py-0.5 rounded">
                            {adv}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={300}>
          <div className="bg-card border border-border rounded-2xl p-8">
            <div className="flex items-center gap-2 mb-6">
              <Shield className="w-6 h-6 text-watt-bitcoin" />
              <h3 className="text-xl font-bold text-foreground">Protective Relay Functions (ANSI/IEEE)</h3>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {protectionFunctions.map((func, index) => (
                <div key={index} className="p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg font-bold text-watt-bitcoin">{func.code}</span>
                    <span className="text-sm font-medium text-foreground">{func.name}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{func.description}</p>
                </div>
              ))}
            </div>
            <div className="mt-6 p-4 bg-watt-bitcoin/10 rounded-xl">
              <div className="flex items-start gap-2">
                <Settings className="w-5 h-5 text-watt-bitcoin shrink-0 mt-0.5" />
                <p className="text-sm text-muted-foreground">
                  <span className="font-semibold text-foreground">Coordination Study Required:</span> Protection 
                  settings must be coordinated so upstream devices trip only if downstream protection fails. 
                  This "selective coordination" prevents unnecessary outages and requires professional 
                  engineering analysis.
                </p>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
};

export default SwitchgearSection;
