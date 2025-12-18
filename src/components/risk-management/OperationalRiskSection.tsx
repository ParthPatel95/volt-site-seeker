import { ScrollReveal } from "@/components/landing/ScrollAnimations";
import { Zap, Server, Thermometer, Wrench, AlertTriangle } from "lucide-react";

export const OperationalRiskSection = () => {
  const operationalRisks = [
    {
      icon: Zap,
      risk: "Power Interruption",
      impact: "100% revenue loss during outage",
      probability: "Medium",
      causes: ["Grid failures", "Transformer issues", "Weather events", "Utility maintenance"],
      mitigations: ["Backup generators", "Redundant feeds", "UPS systems", "Utility SLA agreements"]
    },
    {
      icon: Server,
      risk: "Equipment Failure",
      impact: "Partial hashrate loss, repair costs",
      probability: "High",
      causes: ["Component aging", "Dust accumulation", "Power surges", "Manufacturing defects"],
      mitigations: ["Preventive maintenance", "Spare parts inventory", "Warranty coverage", "Vendor relationships"]
    },
    {
      icon: Thermometer,
      risk: "Cooling Failure",
      impact: "Mass shutdown, potential equipment damage",
      probability: "Low-Medium",
      causes: ["HVAC breakdown", "Refrigerant leaks", "Fan failures", "Extreme weather"],
      mitigations: ["Redundant cooling", "Temperature monitoring", "Automatic shutdowns", "Regular HVAC maintenance"]
    },
    {
      icon: AlertTriangle,
      risk: "Security Incident",
      impact: "Theft, vandalism, data breach",
      probability: "Low",
      causes: ["Physical intrusion", "Cyber attacks", "Insider threats", "Social engineering"],
      mitigations: ["Physical security", "Cybersecurity protocols", "Background checks", "Access controls"]
    }
  ];

  const downtimeCosts = [
    { size: "10 MW", hourly: "$2,000-5,000", daily: "$48,000-120,000" },
    { size: "50 MW", hourly: "$10,000-25,000", daily: "$240,000-600,000" },
    { size: "100 MW", hourly: "$20,000-50,000", daily: "$480,000-1,200,000" }
  ];

  return (
    <section id="operational-risk" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <ScrollReveal>
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-2 bg-watt-blue/10 text-watt-blue rounded-full text-sm font-medium mb-4">
              Lesson 3
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Operational Risk Management
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Minimize downtime and protect your hashrate through robust operational controls
            </p>
          </div>
        </ScrollReveal>

        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {operationalRisks.map((item, index) => (
            <ScrollReveal key={item.risk} delay={100 + index * 50}>
              <div className="bg-card border border-border rounded-xl p-6 h-full">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 bg-watt-blue/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <item.icon className="w-6 h-6 text-watt-blue" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">{item.risk}</h3>
                    <p className="text-sm text-red-500">{item.impact}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-xs font-medium text-muted-foreground mb-2">Common Causes:</h4>
                    <ul className="space-y-1">
                      {item.causes.map(cause => (
                        <li key={cause} className="text-xs text-foreground flex items-center gap-1">
                          <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                          {cause}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-xs font-medium text-muted-foreground mb-2">Mitigations:</h4>
                    <ul className="space-y-1">
                      {item.mitigations.map(mit => (
                        <li key={mit} className="text-xs text-foreground flex items-center gap-1">
                          <span className="w-1 h-1 bg-watt-success rounded-full"></span>
                          {mit}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>

        <ScrollReveal delay={300}>
          <div className="bg-card border border-border rounded-2xl p-8">
            <div className="flex items-center gap-3 mb-6">
              <Wrench className="w-6 h-6 text-watt-bitcoin" />
              <h3 className="text-2xl font-bold text-foreground">Cost of Downtime</h3>
            </div>
            <p className="text-muted-foreground mb-6">
              Unplanned downtime directly impacts revenue. Understanding the financial impact drives 
              appropriate investment in redundancy and maintenance.
            </p>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 text-muted-foreground font-medium">Facility Size</th>
                    <th className="text-left py-3 px-4 text-muted-foreground font-medium">Hourly Loss</th>
                    <th className="text-left py-3 px-4 text-muted-foreground font-medium">Daily Loss</th>
                  </tr>
                </thead>
                <tbody>
                  {downtimeCosts.map(cost => (
                    <tr key={cost.size} className="border-b border-border/50">
                      <td className="py-3 px-4 font-medium text-foreground">{cost.size}</td>
                      <td className="py-3 px-4">
                        <span className="bg-orange-500/10 text-orange-500 px-2 py-1 rounded text-sm">
                          {cost.hourly}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="bg-red-500/10 text-red-500 px-2 py-1 rounded text-sm">
                          {cost.daily}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-muted-foreground mt-4">
              * Estimates based on $40-60k BTC price, typical efficiency, and average network conditions
            </p>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
};
