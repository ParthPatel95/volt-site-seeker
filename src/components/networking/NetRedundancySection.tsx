import { ScrollReveal } from '@/components/landing/ScrollAnimations';
import { Shield, RefreshCw, Route, Zap, AlertTriangle, CheckCircle, Network, Globe } from 'lucide-react';
import { motion } from 'framer-motion';
import { NetSectionWrapper, NetSectionHeader, NetKeyInsight } from './shared';

const failoverStrategies = [
  {
    name: "Active-Passive (Hot Standby)",
    description: "Primary link handles all traffic. Secondary activates only on primary failure.",
    pros: ["Simple configuration", "Clear traffic path", "Lower secondary costs (can use metered)"],
    cons: ["Failover delay (30-60 seconds)", "Secondary link untested until failure"],
    implementation: "Default gateway priority + health checks",
    recommended: true,
    complexity: "Low"
  },
  {
    name: "Active-Active (Load Balancing)",
    description: "Traffic distributed across both links simultaneously for redundancy and capacity.",
    pros: ["Full bandwidth utilization", "Instant failover", "Both links constantly tested"],
    cons: ["Complex routing", "Session persistence challenges", "Higher cost"],
    implementation: "SD-WAN or dual-WAN router with load balancing",
    recommended: false,
    complexity: "Medium"
  },
  {
    name: "BGP Multi-homing",
    description: "Enterprise-grade routing protocol for automatic path selection.",
    pros: ["Industry standard", "Automatic reconvergence", "No single point of failure"],
    cons: ["Requires AS number", "ISP cooperation needed", "Complex setup"],
    implementation: "BGP-capable router + provider coordination",
    recommended: false,
    complexity: "High"
  },
];

const failoverTimeline = [
  { event: "Primary link failure", time: "0s", icon: AlertTriangle, color: "red" },
  { event: "Health check detects failure", time: "5-15s", icon: RefreshCw, color: "yellow" },
  { event: "Routing table updated", time: "15-30s", icon: Route, color: "yellow" },
  { event: "Secondary link active", time: "30-60s", icon: CheckCircle, color: "green" },
  { event: "Mining pools reconnected", time: "60-90s", icon: Network, color: "green" },
];

const NetRedundancySection = () => {
  return (
    <NetSectionWrapper id="redundancy" theme="gradient">
      <ScrollReveal>
        <NetSectionHeader
          badge="Section 3"
          badgeIcon={Shield}
          title="Redundancy Architecture"
          description="Design fault-tolerant network connectivity. For Bitcoin mining, even 10 minutes of downtime on a 45MW site means $300-500 in lost revenue."
          theme="light"
          accentColor="purple"
        />
      </ScrollReveal>

      {/* Why Redundancy Matters */}
      <ScrollReveal delay={50}>
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {[
            { value: "$2,000-5,000", label: "Lost per hour", sublabel: "45MW site offline" },
            { value: "99.9%", label: "Target uptime", sublabel: "= 8.76 hours/year max" },
            { value: "30-60s", label: "Failover time", sublabel: "Typical with auto-switch" },
          ].map((stat, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.1, duration: 0.5 }}
              viewport={{ once: true }}
              className="bg-card border border-border rounded-xl p-6 text-center"
            >
              <div className="text-3xl font-bold mb-1" style={{ color: 'hsl(var(--watt-bitcoin))' }}>{stat.value}</div>
              <div className="font-medium text-foreground">{stat.label}</div>
              <div className="text-sm text-muted-foreground">{stat.sublabel}</div>
            </motion.div>
          ))}
        </div>
      </ScrollReveal>

      {/* Dual ISP Architecture Diagram */}
      <ScrollReveal delay={100}>
        <div className="bg-card border border-border rounded-2xl p-8 mb-12">
          <h3 className="text-xl font-bold text-foreground text-center mb-6">Dual-ISP Architecture</h3>
          
          <div className="flex flex-col items-center gap-4">
            {/* ISP Level */}
            <div className="flex items-center gap-8">
              <div className="text-center">
                <div className="w-24 h-16 rounded-lg bg-primary/10 border border-primary/30 flex items-center justify-center mb-2">
                  <Globe className="w-8 h-8 text-primary" />
                </div>
                <div className="text-sm font-medium">Primary ISP</div>
                <div className="text-xs text-muted-foreground">Fixed Wireless</div>
              </div>
              <div className="text-center">
                <div className="w-24 h-16 rounded-lg bg-muted border border-border flex items-center justify-center mb-2">
                  <Globe className="w-8 h-8 text-muted-foreground" />
                </div>
                <div className="text-sm font-medium">Backup ISP</div>
                <div className="text-xs text-muted-foreground">Starlink/LTE</div>
              </div>
            </div>
            
            {/* Arrows down */}
            <div className="flex items-center gap-16 text-muted-foreground">
              <span>↓</span>
              <span>↓</span>
            </div>
            
            {/* Router/Firewall */}
            <div className="w-full max-w-md">
              <div className="w-full h-20 rounded-lg bg-gradient-to-r from-primary/20 to-[hsl(var(--watt-bitcoin)/0.2)] border border-primary/30 flex items-center justify-center">
                <div className="text-center">
                  <Shield className="w-8 h-8 mx-auto mb-1" style={{ color: 'hsl(var(--watt-purple))' }} />
                  <div className="text-sm font-medium">Dual-WAN Router/Firewall</div>
                  <div className="text-xs text-muted-foreground">Auto-failover + Health Checks</div>
                </div>
              </div>
            </div>
            
            {/* Arrow down */}
            <div className="text-muted-foreground">↓</div>
            
            {/* Internal Network */}
            <div className="w-full max-w-lg">
              <div className="w-full h-16 rounded-lg bg-muted border border-border flex items-center justify-center">
                <div className="text-center">
                  <div className="text-sm font-medium">Internal Network</div>
                  <div className="text-xs text-muted-foreground">Mining Fleet (~13,000 units)</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </ScrollReveal>

      {/* Failover Strategies */}
      <ScrollReveal delay={150}>
        <h3 className="text-xl font-bold text-foreground mb-6">Failover Strategies</h3>
        <div className="space-y-4 mb-12">
          {failoverStrategies.map((strategy, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1, duration: 0.5 }}
              viewport={{ once: true }}
              className={`bg-card border rounded-xl p-6 ${strategy.recommended ? 'border-primary/50 ring-2 ring-primary/20' : 'border-border'}`}
            >
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-lg font-bold text-foreground">{strategy.name}</h4>
                    {strategy.recommended && (
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">Recommended</span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{strategy.description}</p>
                </div>
                <div className="px-3 py-1 rounded-full bg-muted text-xs font-medium text-muted-foreground">
                  {strategy.complexity} Complexity
                </div>
              </div>
              
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <h5 className="text-xs font-semibold text-green-600 uppercase mb-2">Advantages</h5>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    {strategy.pros.map((pro, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <CheckCircle className="w-3 h-3 mt-1 text-green-500" />
                        {pro}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h5 className="text-xs font-semibold text-red-600 uppercase mb-2">Considerations</h5>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    {strategy.cons.map((con, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <AlertTriangle className="w-3 h-3 mt-1 text-amber-500" />
                        {con}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h5 className="text-xs font-semibold text-muted-foreground uppercase mb-2">Implementation</h5>
                  <p className="text-sm text-muted-foreground">{strategy.implementation}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </ScrollReveal>

      {/* Failover Timeline */}
      <ScrollReveal delay={200}>
        <div className="bg-card border border-border rounded-xl p-6 mb-12">
          <h3 className="text-lg font-bold text-foreground mb-6 text-center">Failover Timeline (Active-Passive)</h3>
          <div className="flex flex-wrap items-center justify-center gap-2">
            {failoverTimeline.map((step, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${
                  step.color === 'red' ? 'bg-red-50 border-red-200' :
                  step.color === 'yellow' ? 'bg-amber-50 border-amber-200' :
                  'bg-green-50 border-green-200'
                }`}>
                  <step.icon className={`w-4 h-4 ${
                    step.color === 'red' ? 'text-red-500' :
                    step.color === 'yellow' ? 'text-amber-500' :
                    'text-green-500'
                  }`} />
                  <div>
                    <div className="text-xs font-medium text-foreground">{step.event}</div>
                    <div className="text-xs text-muted-foreground">{step.time}</div>
                  </div>
                </div>
                {idx < failoverTimeline.length - 1 && (
                  <span className="text-muted-foreground hidden sm:block">→</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </ScrollReveal>

      {/* Health Check Configuration */}
      <ScrollReveal delay={250}>
        <NetKeyInsight title="Health Check Best Practices" type="insight" theme="light">
          <p className="mb-2">Configure your router/firewall to monitor ISP health:</p>
          <ul className="space-y-1 text-sm">
            <li>• <strong>Ping Targets:</strong> Use reliable external hosts (8.8.8.8, 1.1.1.1) not ISP gateway</li>
            <li>• <strong>Check Interval:</strong> Every 5-10 seconds for fast detection</li>
            <li>• <strong>Failure Threshold:</strong> 3 consecutive failures before switching</li>
            <li>• <strong>Recovery:</strong> Require 5+ successful pings before switching back</li>
            <li>• <strong>Alerts:</strong> Send notification on any failover event</li>
          </ul>
        </NetKeyInsight>
      </ScrollReveal>

      {/* SD-WAN Option */}
      <ScrollReveal delay={300}>
        <div className="bg-muted/50 border border-border rounded-xl p-6">
          <h4 className="font-bold text-foreground mb-2">SD-WAN: Enterprise Option</h4>
          <p className="text-sm text-muted-foreground mb-4">
            Software-Defined WAN solutions (Cisco Meraki, Fortinet, VMware) provide intelligent 
            path selection and easier management, but add $200-500/mo in licensing costs.
          </p>
          <p className="text-sm text-muted-foreground">
            <strong>Recommendation:</strong> For a single-site 45MW operation, a quality dual-WAN 
            router (pfSense, Ubiquiti, Fortinet) is sufficient and more cost-effective.
          </p>
        </div>
      </ScrollReveal>
    </NetSectionWrapper>
  );
};

export default NetRedundancySection;
