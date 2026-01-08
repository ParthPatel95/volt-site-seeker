import { ScrollReveal } from '@/components/landing/ScrollAnimations';
import { Activity, Bell, BarChart3, Terminal, Wifi, Server, Database, Eye } from 'lucide-react';
import { motion } from 'framer-motion';
import { NetSectionWrapper, NetSectionHeader, NetKeyInsight } from './shared';

const monitoringTools = [
  {
    name: "Foreman",
    category: "Fleet Management",
    description: "Professional Bitcoin mining fleet management platform",
    features: ["Real-time hashrate", "Automatic alerts", "Firmware updates", "Pool management"],
    pricing: "From $0.10/miner/month",
    recommended: true
  },
  {
    name: "Grafana + Prometheus",
    category: "Metrics & Visualization",
    description: "Open-source monitoring stack for custom dashboards",
    features: ["Custom dashboards", "Flexible alerting", "Historical data", "SNMP support"],
    pricing: "Free (self-hosted)",
    recommended: true
  },
  {
    name: "LibreNMS",
    category: "Network Monitoring",
    description: "Open-source network monitoring with autodiscovery",
    features: ["Switch/router monitoring", "SNMP polling", "Bandwidth graphs", "Alerts"],
    pricing: "Free (open source)",
    recommended: false
  },
  {
    name: "PRTG",
    category: "Network Monitoring",
    description: "Enterprise network monitoring with broad sensor support",
    features: ["Easy setup", "Pre-built sensors", "Maps/dashboards", "Mobile app"],
    pricing: "From $1,750 (100 sensors)",
    recommended: false
  },
  {
    name: "Awesome Miner",
    category: "Fleet Management",
    description: "Mining management for various ASIC and GPU miners",
    features: ["Multi-vendor support", "Profit switching", "Notifications", "Web interface"],
    pricing: "From $4/month",
    recommended: false
  },
];

const keyMetrics = [
  { category: "Mining", metrics: ["Hashrate (TH/s)", "Temperature", "Fan speed", "Pool status", "Stale/rejected shares"] },
  { category: "Network", metrics: ["Link status", "Port errors", "Bandwidth utilization", "Latency to pools", "DHCP leases"] },
  { category: "Infrastructure", metrics: ["Switch CPU/memory", "Power consumption", "ISP status", "VPN connectivity", "DNS resolution time"] },
];

const alertThresholds = [
  { metric: "Miner offline", threshold: ">5 min", severity: "Critical", action: "Page on-call" },
  { metric: "Hashrate drop", threshold: ">10%", severity: "Warning", action: "Email/Slack" },
  { metric: "Temperature", threshold: ">90°C", severity: "Critical", action: "Auto-shutdown + alert" },
  { metric: "Pool stale rate", threshold: ">2%", severity: "Warning", action: "Email/Slack" },
  { metric: "ISP failover", threshold: "Triggered", severity: "Critical", action: "Page on-call" },
  { metric: "Switch link down", threshold: "Detected", severity: "Warning", action: "Email/Slack" },
];

const NetMonitoringSection = () => {
  return (
    <NetSectionWrapper id="monitoring" theme="light">
      <ScrollReveal>
        <NetSectionHeader
          badge="Section 8"
          badgeIcon={Activity}
          title="Monitoring & Management"
          description="Visibility into 13,000 miners and network infrastructure. Effective monitoring turns problems into tickets before they become outages."
          theme="light"
          accentColor="purple"
        />
      </ScrollReveal>

      {/* Why Monitoring Matters */}
      <ScrollReveal delay={50}>
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {[
            { icon: Eye, title: "Visibility", desc: "Know the state of every miner and switch" },
            { icon: Bell, title: "Alerting", desc: "Get notified before problems escalate" },
            { icon: BarChart3, title: "Optimization", desc: "Identify underperforming equipment" },
          ].map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              viewport={{ once: true }}
              className="bg-card border border-border rounded-xl p-5 text-center"
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
                <item.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-bold text-foreground mb-1">{item.title}</h3>
              <p className="text-sm text-muted-foreground">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </ScrollReveal>

      {/* Monitoring Tools */}
      <ScrollReveal delay={100}>
        <h3 className="text-xl font-bold text-foreground mb-6">Monitoring Tools</h3>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
          {monitoringTools.map((tool, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.05 }}
              viewport={{ once: true }}
              className={`bg-card border rounded-xl p-5 ${tool.recommended ? 'border-primary/50 ring-2 ring-primary/20' : 'border-border'}`}
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h4 className="font-bold text-foreground">{tool.name}</h4>
                  <p className="text-xs text-primary">{tool.category}</p>
                </div>
                {tool.recommended && (
                  <span className="px-2 py-0.5 rounded-full text-xs bg-primary/10 text-primary">Recommended</span>
                )}
              </div>
              <p className="text-sm text-muted-foreground mb-3">{tool.description}</p>
              <div className="flex flex-wrap gap-1 mb-3">
                {tool.features.map((feature, i) => (
                  <span key={i} className="px-2 py-0.5 rounded-full text-xs bg-muted text-muted-foreground">{feature}</span>
                ))}
              </div>
              <p className="text-sm font-medium" style={{ color: 'hsl(var(--watt-bitcoin))' }}>{tool.pricing}</p>
            </motion.div>
          ))}
        </div>
      </ScrollReveal>

      {/* Key Metrics */}
      <ScrollReveal delay={150}>
        <div className="bg-card border border-border rounded-xl p-6 mb-12">
          <h3 className="text-lg font-bold text-foreground mb-6">What to Monitor</h3>
          <div className="grid md:grid-cols-3 gap-6">
            {keyMetrics.map((category, idx) => (
              <div key={idx}>
                <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                  {idx === 0 && <Server className="w-4 h-4 text-primary" />}
                  {idx === 1 && <Wifi className="w-4 h-4" style={{ color: 'hsl(var(--watt-bitcoin))' }} />}
                  {idx === 2 && <Database className="w-4 h-4 text-green-500" />}
                  {category.category}
                </h4>
                <ul className="space-y-2">
                  {category.metrics.map((metric, i) => (
                    <li key={i} className="text-sm text-muted-foreground flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground" />
                      {metric}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </ScrollReveal>

      {/* Alert Thresholds */}
      <ScrollReveal delay={200}>
        <h3 className="text-xl font-bold text-foreground mb-6">Alert Thresholds</h3>
        <div className="bg-card border border-border rounded-xl overflow-hidden mb-12">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/30">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Metric</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Threshold</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Severity</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {alertThresholds.map((alert, idx) => (
                  <tr key={idx} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 text-sm font-medium text-foreground">{alert.metric}</td>
                    <td className="px-4 py-3 text-sm font-mono text-muted-foreground">{alert.threshold}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        alert.severity === 'Critical' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                      }`}>{alert.severity}</span>
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{alert.action}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </ScrollReveal>

      {/* SNMP Monitoring */}
      <ScrollReveal delay={250}>
        <NetKeyInsight title="SNMP for Network Gear" type="insight" theme="light">
          <p className="mb-2">Enable SNMP on all switches and routers for centralized monitoring:</p>
          <ul className="space-y-1 text-sm">
            <li>• <strong>SNMPv3:</strong> Use version 3 with authentication and encryption</li>
            <li>• <strong>Read-only:</strong> Configure read-only community strings only</li>
            <li>• <strong>Key metrics:</strong> Interface status, errors, bandwidth, CPU, memory</li>
            <li>• <strong>Polling interval:</strong> 5 minutes for switches, 1 minute for core/uplinks</li>
          </ul>
        </NetKeyInsight>
      </ScrollReveal>

      {/* Remote Access */}
      <ScrollReveal delay={300}>
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          <div className="bg-card border border-border rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <Terminal className="w-6 h-6 text-primary" />
              <h4 className="font-bold text-foreground">Remote Access Methods</h4>
            </div>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• <strong>VPN:</strong> WireGuard or OpenVPN for secure tunnel</li>
              <li>• <strong>SSH:</strong> Key-based auth to management server</li>
              <li>• <strong>Web interfaces:</strong> Foreman, router dashboards via VPN</li>
              <li>• <strong>Out-of-band:</strong> LTE/cellular backup for emergencies</li>
            </ul>
          </div>
          <div className="bg-card border border-border rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <Database className="w-6 h-6" style={{ color: 'hsl(var(--watt-bitcoin))' }} />
              <h4 className="font-bold text-foreground">Log Aggregation</h4>
            </div>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• <strong>Syslog server:</strong> Centralize logs from all network gear</li>
              <li>• <strong>Retention:</strong> Keep 30-90 days for troubleshooting</li>
              <li>• <strong>Search:</strong> Graylog or ELK for log analysis</li>
              <li>• <strong>Alerts:</strong> Trigger on error patterns (link flaps, auth failures)</li>
            </ul>
          </div>
        </div>
      </ScrollReveal>

      {/* Recommended Stack */}
      <ScrollReveal delay={350}>
        <div className="bg-gradient-to-r from-primary/5 to-[hsl(var(--watt-bitcoin)/0.05)] border border-primary/20 rounded-xl p-6">
          <h4 className="font-bold text-foreground mb-4">Recommended Monitoring Stack for 45MW Site</h4>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div>
              <h5 className="font-semibold text-foreground mb-2">Mining Fleet</h5>
              <p className="text-muted-foreground">Foreman (~$1,300/mo for 13K miners) or Hiveon OS (if compatible hardware)</p>
            </div>
            <div>
              <h5 className="font-semibold text-foreground mb-2">Network Infrastructure</h5>
              <p className="text-muted-foreground">LibreNMS (free) + Grafana dashboards</p>
            </div>
            <div>
              <h5 className="font-semibold text-foreground mb-2">Alerting</h5>
              <p className="text-muted-foreground">PagerDuty or Opsgenie for critical alerts</p>
            </div>
            <div>
              <h5 className="font-semibold text-foreground mb-2">Logs</h5>
              <p className="text-muted-foreground">Rsyslog + Graylog on local server</p>
            </div>
          </div>
        </div>
      </ScrollReveal>
    </NetSectionWrapper>
  );
};

export default NetMonitoringSection;
