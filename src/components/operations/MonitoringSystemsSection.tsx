import { ScrollReveal } from "@/components/landing/ScrollAnimations";
import { Monitor, Activity, Thermometer, Zap, Wifi, Bell } from "lucide-react";
import { LearningObjectives } from "@/components/electrical-education/LearningObjectives";
import { SectionSummary } from "@/components/electrical-education/SectionSummary";
import { AnimatedMonitoringFlow } from "./AnimatedMonitoringFlow";

const monitoringLayers = [
  {
    icon: Activity,
    layer: "ASIC Level",
    metrics: ["Hashrate", "Temperature", "Fan Speed", "Power Draw", "Error Rates"],
    tools: ["Foreman", "Awesome Miner", "Hive OS"],
    color: "watt-bitcoin"
  },
  {
    icon: Thermometer,
    layer: "Environment",
    metrics: ["Ambient Temp", "Humidity", "Airflow", "Differential Pressure"],
    tools: ["BMS Systems", "IoT Sensors", "SCADA"],
    color: "watt-blue"
  },
  {
    icon: Zap,
    layer: "Electrical",
    metrics: ["Voltage", "Current", "Power Factor", "Harmonics", "Load Balance"],
    tools: ["Smart PDUs", "Power Meters", "EPMS"],
    color: "watt-success"
  },
  {
    icon: Wifi,
    layer: "Network",
    metrics: ["Latency", "Packet Loss", "Bandwidth", "Pool Connectivity"],
    tools: ["PRTG", "Nagios", "Custom Dashboards"],
    color: "watt-purple"
  }
];

const alertPriorities = [
  { level: "Critical", response: "< 5 min", examples: "Power failure, Fire alarm, Total hashrate loss", color: "bg-red-500" },
  { level: "High", response: "< 15 min", examples: "ASIC offline, Cooling failure, Network outage", color: "bg-orange-500" },
  { level: "Medium", response: "< 1 hour", examples: "High temps, Hashrate drop >10%, Fan failures", color: "bg-yellow-500" },
  { level: "Low", response: "< 24 hours", examples: "Single ASIC issues, Minor efficiency drops", color: "bg-blue-500" }
];

const learningObjectives = [
  "Design a multi-layer monitoring architecture for mining facilities",
  "Configure alert priority frameworks with appropriate response times",
  "Select and implement monitoring tools for each operational layer",
  "Build effective dashboards for NOC and field operations"
];

const takeaways = [
  "Four monitoring layers: ASIC, Environment, Electrical, and Network",
  "Critical alerts require <5 minute response time",
  "Effective dashboards enable rapid troubleshooting without physical inspection",
  "Historical trend analysis identifies degradation before failures occur"
];

export const MonitoringSystemsSection = () => {
  return (
    <section id="monitoring" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <ScrollReveal>
          <div className="text-center mb-12">
            <span className="inline-block px-4 py-2 bg-watt-blue/10 text-watt-blue rounded-full text-sm font-medium mb-4">
              Lesson 2
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Monitoring Systems & Dashboards
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Build comprehensive visibility into every aspect of your mining operation
            </p>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={50}>
          <div className="mb-12">
            <LearningObjectives 
              objectives={learningObjectives}
              sectionTitle="Monitoring Systems"
              accentColor="watt-blue"
            />
          </div>
        </ScrollReveal>

        <ScrollReveal delay={100}>
          <div className="mb-12">
            <AnimatedMonitoringFlow />
          </div>
        </ScrollReveal>

        <ScrollReveal delay={150}>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {monitoringLayers.map((layer, index) => (
              <div key={layer.layer} className="bg-card border border-border rounded-xl p-6">
                <div className={`w-12 h-12 bg-${layer.color}/10 rounded-xl flex items-center justify-center mb-4`}>
                  <layer.icon className={`w-6 h-6 text-${layer.color}`} />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-3">{layer.layer}</h3>
                <div className="mb-4">
                  <div className="text-sm font-medium text-muted-foreground mb-2">Key Metrics:</div>
                  <div className="flex flex-wrap gap-1">
                    {layer.metrics.map(metric => (
                      <span key={metric} className="text-xs bg-muted px-2 py-1 rounded">{metric}</span>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground mb-2">Tools:</div>
                  <div className="flex flex-wrap gap-1">
                    {layer.tools.map(tool => (
                      <span key={tool} className={`text-xs bg-${layer.color}/10 text-${layer.color} px-2 py-1 rounded`}>{tool}</span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollReveal>

        <ScrollReveal delay={200}>
          <div className="bg-card border border-border rounded-2xl p-8 mb-12">
            <div className="flex items-center gap-3 mb-6">
              <Bell className="w-6 h-6 text-watt-bitcoin" />
              <h3 className="text-2xl font-bold text-foreground">Alert Priority Framework</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 text-muted-foreground font-medium">Priority</th>
                    <th className="text-left py-3 px-4 text-muted-foreground font-medium">Response Time</th>
                    <th className="text-left py-3 px-4 text-muted-foreground font-medium">Examples</th>
                  </tr>
                </thead>
                <tbody>
                  {alertPriorities.map(alert => (
                    <tr key={alert.level} className="border-b border-border/50">
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center gap-2">
                          <span className={`w-3 h-3 rounded-full ${alert.color}`}></span>
                          <span className="font-medium text-foreground">{alert.level}</span>
                        </span>
                      </td>
                      <td className="py-3 px-4 text-foreground font-mono">{alert.response}</td>
                      <td className="py-3 px-4 text-muted-foreground text-sm">{alert.examples}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={300}>
          <div className="bg-gradient-to-r from-watt-blue/10 to-watt-purple/10 border border-watt-blue/20 rounded-2xl p-8 mb-12">
            <div className="flex items-center gap-3 mb-4">
              <Monitor className="w-6 h-6 text-watt-blue" />
              <h3 className="text-xl font-bold text-foreground">Dashboard Best Practices</h3>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <h4 className="font-semibold text-foreground mb-2">NOC Overview</h4>
                <p className="text-sm text-muted-foreground">
                  High-level facility health visible at a glance. Total hashrate, uptime, 
                  power consumption, and active alerts on large displays.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-foreground mb-2">Drill-Down Views</h4>
                <p className="text-sm text-muted-foreground">
                  Click-through to individual rows, racks, and machines. Enable 
                  rapid troubleshooting without physical inspection.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-foreground mb-2">Historical Trends</h4>
                <p className="text-sm text-muted-foreground">
                  Track performance over time to identify degradation, seasonal 
                  patterns, and optimization opportunities.
                </p>
              </div>
            </div>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={350}>
          <SectionSummary
            title="Monitoring Summary"
            takeaways={takeaways}
            nextSectionId="preventive-maintenance"
            nextSectionLabel="Preventive Maintenance"
            accentColor="watt-blue"
          />
        </ScrollReveal>
      </div>
    </section>
  );
};
