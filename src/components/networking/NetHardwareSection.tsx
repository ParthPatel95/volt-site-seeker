import { ScrollReveal } from '@/components/landing/ScrollAnimations';
import { Server, Cpu, Cable, Shield, DollarSign, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import { NetSectionWrapper, NetSectionHeader, NetKeyInsight } from './shared';

const switchRecommendations = [
  {
    category: "Budget-Friendly",
    products: [
      { name: "Netgear M4300-52G", ports: "48x 1GbE + 4x 10G SFP+", price: "~$1,200", notes: "Reliable, web-managed" },
      { name: "Ubiquiti USW-Pro-48-PoE", ports: "48x 1GbE PoE + 4x 10G SFP+", price: "~$700", notes: "Great for UniFi ecosystems" },
      { name: "MikroTik CRS354-48G-4S+2Q+", ports: "48x 1GbE + 4x 10G + 2x 40G", price: "~$500", notes: "Affordable, RouterOS" },
    ]
  },
  {
    category: "Enterprise",
    products: [
      { name: "Cisco Catalyst 9300-48T", ports: "48x 1GbE + modular uplinks", price: "~$4,500", notes: "Industry standard, IOS-XE" },
      { name: "Arista 7050SX-64", ports: "48x 10GbE SFP+ + 4x 40GbE", price: "~$8,000", notes: "High performance core" },
      { name: "Juniper EX4300-48T", ports: "48x 1GbE + 4x 10G SFP+", price: "~$3,500", notes: "Virtual Chassis capable" },
    ]
  },
];

const firewallOptions = [
  { name: "pfSense", type: "Open Source", price: "Free (hardware cost only)", pros: ["Flexible", "Dual-WAN", "VPN built-in"], hardware: "Netgate appliance or DIY" },
  { name: "Fortinet FortiGate", type: "Commercial", price: "From $500 + license", pros: ["Enterprise features", "SD-WAN", "Threat protection"], hardware: "FortiGate 60F or higher" },
  { name: "Sophos XG", type: "Commercial", price: "From $400 + license", pros: ["Easy management", "Good reporting"], hardware: "Sophos appliance" },
  { name: "Ubiquiti UDM Pro", type: "Prosumer", price: "~$400", pros: ["All-in-one", "UniFi ecosystem", "Easy setup"], hardware: "Integrated appliance" },
];

const cableTypes = [
  { type: "Cat5e", speed: "1 Gbps", distance: "100m", use: "Legacy, avoid for new installs", price: "$0.10-0.20/ft" },
  { type: "Cat6", speed: "1/10 Gbps", distance: "100m (55m for 10G)", use: "Standard for miners", price: "$0.15-0.30/ft" },
  { type: "Cat6a", speed: "10 Gbps", distance: "100m", use: "Backbone, future-proof", price: "$0.30-0.50/ft" },
  { type: "OM3 Fiber", speed: "10-40 Gbps", distance: "300m (10G)", use: "Core interconnects", price: "$0.50-1.00/ft" },
];

const NetHardwareSection = () => {
  // Calculate costs for 45MW
  const totalMiners = 13000;
  const minersPerSwitch = 46; // 48 ports - 2 uplinks
  const accessSwitchesNeeded = Math.ceil(totalMiners / minersPerSwitch);
  const budgetSwitchCost = accessSwitchesNeeded * 800;
  const enterpriseSwitchCost = accessSwitchesNeeded * 3500;

  return (
    <NetSectionWrapper id="hardware" theme="gradient">
      <ScrollReveal>
        <NetSectionHeader
          badge="Section 9"
          badgeIcon={Server}
          title="Hardware Selection"
          description="Switches, routers, firewalls, and cabling for a 45MW mining facility. Balancing reliability, manageability, and cost."
          theme="light"
          accentColor="bitcoin"
        />
      </ScrollReveal>

      {/* Quick Estimate */}
      <ScrollReveal delay={50}>
        <div className="grid md:grid-cols-4 gap-4 mb-12">
          {[
            { value: `${accessSwitchesNeeded}`, label: "Access Switches", sublabel: "48-port @ 46 miners each" },
            { value: "4-8", label: "Distribution Switches", sublabel: "Aggregation layer" },
            { value: "2", label: "Core Switches", sublabel: "Redundant pair" },
            { value: "$100-300K", label: "Network Budget", sublabel: "Depending on tier" },
          ].map((stat, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              viewport={{ once: true }}
              className="bg-card border border-border rounded-xl p-4 text-center"
            >
              <div className="text-2xl font-bold" style={{ color: 'hsl(var(--watt-bitcoin))' }}>{stat.value}</div>
              <div className="font-medium text-foreground text-sm">{stat.label}</div>
              <div className="text-xs text-muted-foreground">{stat.sublabel}</div>
            </motion.div>
          ))}
        </div>
      </ScrollReveal>

      {/* Switch Recommendations */}
      <ScrollReveal delay={100}>
        <h3 className="text-xl font-bold text-foreground mb-6">Switch Recommendations</h3>
        {switchRecommendations.map((category, catIdx) => (
          <div key={catIdx} className="mb-8">
            <h4 className="text-lg font-semibold text-foreground mb-4">{category.category}</h4>
            <div className="grid md:grid-cols-3 gap-4">
              {category.products.map((product, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.1 }}
                  viewport={{ once: true }}
                  className="bg-card border border-border rounded-xl p-5"
                >
                  <h5 className="font-bold text-foreground">{product.name}</h5>
                  <p className="text-sm text-muted-foreground mt-1">{product.ports}</p>
                  <div className="flex items-center gap-2 mt-3">
                    <DollarSign className="w-4 h-4" style={{ color: 'hsl(var(--watt-bitcoin))' }} />
                    <span className="font-semibold" style={{ color: 'hsl(var(--watt-bitcoin))' }}>{product.price}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">{product.notes}</p>
                </motion.div>
              ))}
            </div>
          </div>
        ))}
      </ScrollReveal>

      {/* Budget Comparison */}
      <ScrollReveal delay={150}>
        <div className="bg-card border border-border rounded-xl p-6 mb-12">
          <h4 className="font-bold text-foreground mb-4">Access Layer Cost Comparison (45MW / {accessSwitchesNeeded} switches)</h4>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h5 className="font-semibold text-green-800">Budget Tier</h5>
              <p className="text-2xl font-bold text-green-700">${budgetSwitchCost.toLocaleString()}</p>
              <p className="text-sm text-green-600">Netgear/Ubiquiti/MikroTik @ ~$800/switch</p>
            </div>
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <h5 className="font-semibold text-purple-800">Enterprise Tier</h5>
              <p className="text-2xl font-bold text-purple-700">${enterpriseSwitchCost.toLocaleString()}</p>
              <p className="text-sm text-purple-600">Cisco/Juniper @ ~$3,500/switch</p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground mt-4">
            <strong>Recommendation:</strong> For mining operations, budget-tier switches are typically sufficient. 
            Save enterprise budget for core/distribution layers where reliability matters most.
          </p>
        </div>
      </ScrollReveal>

      {/* Firewall Options */}
      <ScrollReveal delay={200}>
        <h3 className="text-xl font-bold text-foreground mb-6">Firewall / Router Options</h3>
        <div className="grid md:grid-cols-2 gap-4 mb-12">
          {firewallOptions.map((fw, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              viewport={{ once: true }}
              className="bg-card border border-border rounded-xl p-5"
            >
              <div className="flex items-start justify-between mb-2">
                <h5 className="font-bold text-foreground">{fw.name}</h5>
                <span className="px-2 py-0.5 rounded-full text-xs bg-muted text-muted-foreground">{fw.type}</span>
              </div>
              <p className="text-sm font-medium mb-2" style={{ color: 'hsl(var(--watt-bitcoin))' }}>{fw.price}</p>
              <div className="flex flex-wrap gap-1 mb-2">
                {fw.pros.map((pro, i) => (
                  <span key={i} className="px-2 py-0.5 rounded-full text-xs bg-primary/10 text-primary">{pro}</span>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">Hardware: {fw.hardware}</p>
            </motion.div>
          ))}
        </div>
      </ScrollReveal>

      {/* Cabling */}
      <ScrollReveal delay={250}>
        <h3 className="text-xl font-bold text-foreground mb-6">Cabling Standards</h3>
        <div className="bg-card border border-border rounded-xl overflow-hidden mb-12">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/30">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Type</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Speed</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Max Distance</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Use Case</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Price</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {cableTypes.map((cable, idx) => (
                  <tr key={idx} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 text-sm font-medium text-foreground">{cable.type}</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{cable.speed}</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{cable.distance}</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{cable.use}</td>
                    <td className="px-4 py-3 text-sm" style={{ color: 'hsl(var(--watt-bitcoin))' }}>{cable.price}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </ScrollReveal>

      {/* Installation Tips */}
      <ScrollReveal delay={300}>
        <NetKeyInsight title="Cabling Best Practices" type="insight" theme="light">
          <ul className="space-y-1 text-sm">
            <li>• <strong>Pre-made vs field-terminated:</strong> Pre-made cables save time but custom lengths reduce clutter</li>
            <li>• <strong>Color coding:</strong> Use different colors per VLAN or function (e.g., blue=mining, yellow=management)</li>
            <li>• <strong>Cable management:</strong> Velcro ties, not zip ties—easier to modify later</li>
            <li>• <strong>Testing:</strong> Certify all runs with a cable tester before go-live</li>
            <li>• <strong>Documentation:</strong> Label both ends of every cable with a consistent scheme</li>
          </ul>
        </NetKeyInsight>
      </ScrollReveal>

      {/* UPS for Network Gear */}
      <ScrollReveal delay={350}>
        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <Zap className="w-6 h-6" style={{ color: 'hsl(var(--watt-bitcoin))' }} />
            <h4 className="font-bold text-foreground">Power Protection for Network Equipment</h4>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Unlike miners (which tolerate power interruptions), network gear should be on UPS:
          </p>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>• <strong>Core switches:</strong> 15-30 minute runtime for graceful shutdown or generator start</li>
            <li>• <strong>Firewalls/routers:</strong> Critical path—always on UPS</li>
            <li>• <strong>Access switches:</strong> Less critical—can be on raw power if budget limited</li>
            <li>• <strong>Monitoring server:</strong> On UPS to continue logging during outages</li>
          </ul>
        </div>
      </ScrollReveal>
    </NetSectionWrapper>
  );
};

export default NetHardwareSection;
