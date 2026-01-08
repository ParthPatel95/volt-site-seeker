import { ScrollReveal } from '@/components/landing/ScrollAnimations';
import { Hash, Server, Settings, Database, Search, RefreshCw, CheckCircle, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';
import { NetSectionWrapper, NetSectionHeader, NetKeyInsight } from './shared';

const dhcpVsStatic = {
  dhcp: {
    pros: [
      "Automatic IP assignment",
      "Easy to add/remove devices",
      "Centralized management",
      "Reduced manual errors",
      "Automatic lease renewal"
    ],
    cons: [
      "Single point of failure (DHCP server)",
      "Lease expiry can cause issues",
      "Harder to track specific devices",
      "IP changes can confuse monitoring"
    ]
  },
  static: {
    pros: [
      "Predictable IP addresses",
      "No dependency on DHCP server",
      "Easier firmware management",
      "Direct miner-to-IP mapping"
    ],
    cons: [
      "Manual configuration required",
      "IP conflicts possible",
      "Difficult to scale",
      "More initial setup time"
    ]
  }
};

const ipTools = [
  { 
    name: "APMinerTool", 
    vendor: "Bitmain",
    description: "Official ASIC configuration tool for Antminer devices",
    features: ["Bulk IP scanning", "Firmware updates", "Pool configuration", "MAC address tracking"]
  },
  { 
    name: "Foreman", 
    vendor: "Third-party",
    description: "Professional fleet management platform",
    features: ["Real-time monitoring", "Automatic discovery", "Performance alerts", "API access"]
  },
  { 
    name: "Awesome Miner", 
    vendor: "Third-party",
    description: "Multi-vendor mining management software",
    features: ["Profit switching", "Remote management", "Notifications", "Multi-pool support"]
  },
  { 
    name: "IPReporter", 
    vendor: "BitCap",
    description: "Simple IP discovery tool for mining hardware",
    features: ["Quick scanning", "CSV export", "MAC tracking", "Lightweight"]
  }
];

const subnetPlan = [
  { vlan: 20, network: "10.20.0.0/20", range: "10.20.0.1 - 10.20.15.254", hosts: 4094, purpose: "Mining Row A" },
  { vlan: 21, network: "10.21.0.0/20", range: "10.21.0.1 - 10.21.15.254", hosts: 4094, purpose: "Mining Row B" },
  { vlan: 22, network: "10.22.0.0/20", range: "10.22.0.1 - 10.22.15.254", hosts: 4094, purpose: "Mining Row C" },
  { vlan: 23, network: "10.23.0.0/20", range: "10.23.0.1 - 10.23.15.254", hosts: 4094, purpose: "Mining Row D" },
];

const NetIPManagementSection = () => {
  return (
    <NetSectionWrapper id="ip-management" theme="light">
      <ScrollReveal>
        <NetSectionHeader
          badge="Section 5"
          badgeIcon={Hash}
          title="IP Address Management"
          description="Managing 13,000+ IP addresses requires planning. DHCP vs static, subnet design, and tracking tools for a 45MW mining fleet."
          theme="light"
          accentColor="purple"
        />
      </ScrollReveal>

      {/* DHCP vs Static */}
      <ScrollReveal delay={50}>
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {/* DHCP */}
          <div className="bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <RefreshCw className="w-6 h-6 text-primary" />
              <h3 className="text-lg font-bold text-foreground">DHCP (Recommended)</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Dynamic Host Configuration Protocol—automatic IP assignment from a central server.
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="text-xs font-semibold text-green-600 uppercase mb-2">Advantages</h4>
                <ul className="space-y-1">
                  {dhcpVsStatic.dhcp.pros.map((pro, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <CheckCircle className="w-3 h-3 mt-1 text-green-500 flex-shrink-0" />
                      {pro}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="text-xs font-semibold text-amber-600 uppercase mb-2">Considerations</h4>
                <ul className="space-y-1">
                  {dhcpVsStatic.dhcp.cons.map((con, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <AlertTriangle className="w-3 h-3 mt-1 text-amber-500 flex-shrink-0" />
                      {con}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Static */}
          <div className="bg-muted/50 border border-border rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <Hash className="w-6 h-6 text-muted-foreground" />
              <h3 className="text-lg font-bold text-foreground">Static IP</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Manually assigned IP addresses—each device configured individually.
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="text-xs font-semibold text-green-600 uppercase mb-2">Advantages</h4>
                <ul className="space-y-1">
                  {dhcpVsStatic.static.pros.map((pro, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <CheckCircle className="w-3 h-3 mt-1 text-green-500 flex-shrink-0" />
                      {pro}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="text-xs font-semibold text-amber-600 uppercase mb-2">Considerations</h4>
                <ul className="space-y-1">
                  {dhcpVsStatic.static.cons.map((con, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <AlertTriangle className="w-3 h-3 mt-1 text-amber-500 flex-shrink-0" />
                      {con}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </ScrollReveal>

      {/* Recommendation */}
      <ScrollReveal delay={100}>
        <NetKeyInsight title="Our Recommendation: DHCP with Reservations" type="success" theme="light">
          <p className="mb-2">For large mining operations, we recommend a hybrid approach:</p>
          <ul className="space-y-1 text-sm">
            <li>• <strong>DHCP for miners:</strong> Easy deployment and replacement</li>
            <li>• <strong>DHCP reservations:</strong> Optional—bind MAC to IP for critical equipment</li>
            <li>• <strong>Static for infrastructure:</strong> Switches, routers, servers always static</li>
            <li>• <strong>Long lease times:</strong> 7+ days to reduce DHCP traffic and renewal churn</li>
          </ul>
        </NetKeyInsight>
      </ScrollReveal>

      {/* Subnet Planning */}
      <ScrollReveal delay={150}>
        <h3 className="text-xl font-bold text-foreground mb-6">Subnet Planning for 45MW Site</h3>
        <div className="bg-card border border-border rounded-xl overflow-hidden mb-12">
          <div className="p-4 border-b border-border bg-muted/50">
            <p className="text-sm text-muted-foreground">
              Using 10.0.0.0/8 private range for maximum address space. Each row gets a /20 subnet (~4,000 addresses).
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/30">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">VLAN</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Network</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Usable Range</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Hosts</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Purpose</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {subnetPlan.map((subnet, idx) => (
                  <tr key={idx} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 text-sm font-mono text-foreground">{subnet.vlan}</td>
                    <td className="px-4 py-3 text-sm font-mono text-muted-foreground">{subnet.network}</td>
                    <td className="px-4 py-3 text-sm font-mono text-muted-foreground">{subnet.range}</td>
                    <td className="px-4 py-3 text-sm font-medium" style={{ color: 'hsl(var(--watt-bitcoin))' }}>{subnet.hosts.toLocaleString()}</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{subnet.purpose}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </ScrollReveal>

      {/* DHCP Server Options */}
      <ScrollReveal delay={200}>
        <div className="grid md:grid-cols-3 gap-4 mb-12">
          {[
            { name: "ISC DHCP", type: "Linux", desc: "Industry standard, highly configurable", cost: "Free (open source)" },
            { name: "Windows DHCP", type: "Windows Server", desc: "Easy integration with AD, GUI management", cost: "Included with license" },
            { name: "Router-based", type: "Router/Firewall", desc: "Built into pfSense, Ubiquiti, etc.", cost: "Included" },
          ].map((option, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              viewport={{ once: true }}
              className="bg-card border border-border rounded-xl p-5"
            >
              <h4 className="font-bold text-foreground">{option.name}</h4>
              <p className="text-xs text-primary font-medium mb-2">{option.type}</p>
              <p className="text-sm text-muted-foreground mb-2">{option.desc}</p>
              <p className="text-sm font-medium" style={{ color: 'hsl(var(--watt-bitcoin))' }}>{option.cost}</p>
            </motion.div>
          ))}
        </div>
      </ScrollReveal>

      {/* IP Management Tools */}
      <ScrollReveal delay={250}>
        <h3 className="text-xl font-bold text-foreground mb-6">Fleet Management & IP Tools</h3>
        <div className="grid md:grid-cols-2 gap-4 mb-12">
          {ipTools.map((tool, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              viewport={{ once: true }}
              className="bg-card border border-border rounded-xl p-5"
            >
              <div className="flex items-start justify-between mb-2">
                <h4 className="font-bold text-foreground">{tool.name}</h4>
                <span className="px-2 py-0.5 rounded-full text-xs bg-muted text-muted-foreground">{tool.vendor}</span>
              </div>
              <p className="text-sm text-muted-foreground mb-3">{tool.description}</p>
              <div className="flex flex-wrap gap-1">
                {tool.features.map((feature, i) => (
                  <span key={i} className="px-2 py-0.5 rounded-full text-xs bg-primary/10 text-primary">{feature}</span>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </ScrollReveal>

      {/* MAC Address Tracking */}
      <ScrollReveal delay={300}>
        <NetKeyInsight title="MAC Address Best Practices" type="insight" theme="light">
          <p className="mb-2">Tracking MAC addresses is essential for asset management:</p>
          <ul className="space-y-1 text-sm">
            <li>• <strong>Document on arrival:</strong> Record MAC during receiving inspection</li>
            <li>• <strong>Physical labels:</strong> QR code or barcode with MAC on each miner</li>
            <li>• <strong>Spreadsheet/database:</strong> MAC → Physical location → Purchase date → Warranty</li>
            <li>• <strong>DHCP logs:</strong> Use lease history to track device movement</li>
            <li>• <strong>Alerts:</strong> Monitor for unknown MAC addresses (unauthorized devices)</li>
          </ul>
        </NetKeyInsight>
      </ScrollReveal>

      {/* Organization by Physical Location */}
      <ScrollReveal delay={350}>
        <div className="bg-muted/50 border border-border rounded-xl p-6">
          <h4 className="font-bold text-foreground mb-4">IP Addressing by Physical Location</h4>
          <p className="text-sm text-muted-foreground mb-4">
            Organize IP addresses to match physical layout for easier troubleshooting:
          </p>
          <div className="font-mono text-sm bg-card rounded-lg p-4 border border-border">
            <p className="text-muted-foreground"># Example: VLAN 20 (Row A) - 10.20.x.x</p>
            <p className="text-foreground">10.20.1.x   = Container A1 (positions 1-254)</p>
            <p className="text-foreground">10.20.2.x   = Container A2 (positions 1-254)</p>
            <p className="text-foreground">10.20.3.x   = Container A3 (positions 1-254)</p>
            <p className="text-muted-foreground">...</p>
            <p className="text-muted-foreground"># Gateway: 10.20.0.1 (Layer 3 switch interface)</p>
          </div>
        </div>
      </ScrollReveal>
    </NetSectionWrapper>
  );
};

export default NetIPManagementSection;
