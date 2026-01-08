import { ScrollReveal } from '@/components/landing/ScrollAnimations';
import { Network, Layers, Server, Box, Cable, Cpu } from 'lucide-react';
import { motion } from 'framer-motion';
import { NetSectionWrapper, NetSectionHeader, NetKeyInsight } from './shared';

const vlanDesign = [
  { 
    vlan: 10, 
    name: "Management", 
    subnet: "172.16.10.0/24", 
    purpose: "Switches, routers, firewalls, IPMI/BMC",
    devices: "~50 devices",
    color: "purple"
  },
  { 
    vlan: 20, 
    name: "Mining - Row A", 
    subnet: "10.20.0.0/20", 
    purpose: "Miners in Rows A1-A10",
    devices: "~3,000 miners",
    color: "bitcoin"
  },
  { 
    vlan: 21, 
    name: "Mining - Row B", 
    subnet: "10.21.0.0/20", 
    purpose: "Miners in Rows B1-B10",
    devices: "~3,000 miners",
    color: "bitcoin"
  },
  { 
    vlan: 22, 
    name: "Mining - Row C", 
    subnet: "10.22.0.0/20", 
    purpose: "Miners in Rows C1-C10",
    devices: "~3,000 miners",
    color: "bitcoin"
  },
  { 
    vlan: 23, 
    name: "Mining - Row D", 
    subnet: "10.23.0.0/20", 
    purpose: "Miners in Rows D1-D10",
    devices: "~4,000 miners",
    color: "bitcoin"
  },
  { 
    vlan: 100, 
    name: "Monitoring", 
    subnet: "192.168.100.0/24", 
    purpose: "Foreman servers, Grafana, SNMP collectors",
    devices: "~10 devices",
    color: "success"
  },
  { 
    vlan: 200, 
    name: "Guest/Visitor", 
    subnet: "192.168.200.0/24", 
    purpose: "Isolated guest WiFi, visitor access",
    devices: "Variable",
    color: "muted"
  },
];

const topologyLayers = [
  {
    name: "Core Layer",
    icon: Network,
    description: "Central routing and high-speed interconnection",
    equipment: "2x Core switches (stacked or MLAG)",
    ports: "10GbE uplinks to distribution",
    redundancy: "Dual switches, redundant paths",
    example: "Arista 7050SX, Cisco Nexus 9300"
  },
  {
    name: "Distribution Layer",
    icon: Layers,
    description: "Aggregates access layer switches by zone",
    equipment: "Per-zone aggregation switches",
    ports: "10GbE up, 1GbE down",
    redundancy: "Dual uplinks per switch",
    example: "Ubiquiti Pro Aggregation, Juniper EX4300"
  },
  {
    name: "Access Layer",
    icon: Server,
    description: "Direct connection to mining equipment",
    equipment: "48-port switches per row",
    ports: "1GbE to miners",
    redundancy: "Single switch (miners are redundancy)",
    example: "Ubiquiti Pro 48, Netgear M4300-52G"
  },
];

const NetTopologySection = () => {
  // Calculate switch requirements for 45MW
  const totalMiners = 13000;
  const portsPerSwitch = 48;
  const switchesNeeded = Math.ceil(totalMiners / (portsPerSwitch - 2)); // Reserve 2 ports for uplinks
  
  return (
    <NetSectionWrapper id="topology" theme="dark">
      <ScrollReveal>
        <NetSectionHeader
          badge="Section 4"
          badgeIcon={Network}
          title="Network Topology Design"
          description="Structured cabling and switching architecture for large-scale mining operations. At 45MW with ~13,000 miners, proper network design is critical."
          theme="dark"
          accentColor="purple"
        />
      </ScrollReveal>

      {/* Quick Stats */}
      <ScrollReveal delay={50}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {[
            { value: "~13,000", label: "Total Miners", sublabel: "At 3.5kW each" },
            { value: `${switchesNeeded}+`, label: "48-Port Switches", sublabel: "Access layer" },
            { value: "4", label: "Mining VLANs", sublabel: "By row/zone" },
            { value: "10GbE", label: "Core Links", sublabel: "Aggregation" },
          ].map((stat, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              viewport={{ once: true }}
              className="bg-white/5 border border-white/10 rounded-xl p-4 text-center"
            >
              <div className="text-2xl font-bold" style={{ color: 'hsl(var(--watt-bitcoin))' }}>{stat.value}</div>
              <div className="text-white font-medium text-sm">{stat.label}</div>
              <div className="text-white/50 text-xs">{stat.sublabel}</div>
            </motion.div>
          ))}
        </div>
      </ScrollReveal>

      {/* Three-Tier Architecture */}
      <ScrollReveal delay={100}>
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-12">
          <h3 className="text-xl font-bold text-white text-center mb-6">Three-Tier Network Architecture</h3>
          <div className="space-y-4">
            {topologyLayers.map((layer, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.15 }}
                viewport={{ once: true }}
                className="bg-white/5 rounded-xl p-5 border-l-4"
                style={{ borderColor: idx === 0 ? 'hsl(var(--watt-purple))' : idx === 1 ? 'hsl(var(--watt-bitcoin))' : 'hsl(var(--watt-success))' }}
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
                    <layer.icon className="w-6 h-6" style={{ color: idx === 0 ? 'hsl(var(--watt-purple))' : idx === 1 ? 'hsl(var(--watt-bitcoin))' : 'hsl(var(--watt-success))' }} />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-lg font-bold text-white">{layer.name}</h4>
                    <p className="text-white/60 text-sm mb-3">{layer.description}</p>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 text-sm">
                      <div>
                        <span className="text-white/40 text-xs uppercase">Equipment</span>
                        <p className="text-white/80">{layer.equipment}</p>
                      </div>
                      <div>
                        <span className="text-white/40 text-xs uppercase">Ports</span>
                        <p className="text-white/80">{layer.ports}</p>
                      </div>
                      <div>
                        <span className="text-white/40 text-xs uppercase">Redundancy</span>
                        <p className="text-white/80">{layer.redundancy}</p>
                      </div>
                      <div>
                        <span className="text-white/40 text-xs uppercase">Example</span>
                        <p className="text-white/80">{layer.example}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </ScrollReveal>

      {/* VLAN Design */}
      <ScrollReveal delay={150}>
        <h3 className="text-xl font-bold text-white mb-6">VLAN Segmentation Strategy</h3>
        <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden mb-12">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-white/5">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-white/60 uppercase">VLAN</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-white/60 uppercase">Name</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-white/60 uppercase">Subnet</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-white/60 uppercase">Purpose</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-white/60 uppercase">Devices</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {vlanDesign.map((vlan, idx) => (
                  <tr key={idx} className="hover:bg-white/5 transition-colors">
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-2">
                        <span 
                          className="w-2 h-2 rounded-full" 
                          style={{ backgroundColor: vlan.color === 'purple' ? 'hsl(var(--watt-purple))' : vlan.color === 'bitcoin' ? 'hsl(var(--watt-bitcoin))' : vlan.color === 'success' ? 'hsl(var(--watt-success))' : 'hsl(var(--muted-foreground))' }}
                        />
                        <span className="text-white font-mono">{vlan.vlan}</span>
                      </span>
                    </td>
                    <td className="px-4 py-3 text-white font-medium">{vlan.name}</td>
                    <td className="px-4 py-3 text-white/60 font-mono text-sm">{vlan.subnet}</td>
                    <td className="px-4 py-3 text-white/60 text-sm">{vlan.purpose}</td>
                    <td className="px-4 py-3 text-white/60 text-sm">{vlan.devices}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </ScrollReveal>

      {/* Why VLAN Segmentation */}
      <ScrollReveal delay={200}>
        <NetKeyInsight title="Why Segment by Row/Zone?" type="insight" theme="dark">
          <p className="mb-2">VLAN segmentation provides multiple benefits:</p>
          <ul className="space-y-1 text-sm">
            <li>• <strong>Broadcast containment:</strong> Limits broadcast traffic to ~3,000 devices instead of 13,000</li>
            <li>• <strong>Troubleshooting:</strong> Isolate problems to specific physical areas</li>
            <li>• <strong>Security:</strong> Limit lateral movement if a device is compromised</li>
            <li>• <strong>Performance:</strong> Reduce ARP table sizes and switch CPU load</li>
            <li>• <strong>Management:</strong> Apply policies per zone (rate limits, ACLs)</li>
          </ul>
        </NetKeyInsight>
      </ScrollReveal>

      {/* Cabling */}
      <ScrollReveal delay={250}>
        <div className="grid md:grid-cols-2 gap-6 mt-12">
          <div className="bg-white/5 border border-white/10 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <Cable className="w-6 h-6" style={{ color: 'hsl(var(--watt-purple))' }} />
              <h4 className="text-lg font-bold text-white">Structured Cabling</h4>
            </div>
            <ul className="space-y-2 text-sm text-white/70">
              <li>• <strong>Horizontal:</strong> Cat6 (max 100m) to miners</li>
              <li>• <strong>Backbone:</strong> Cat6a or fiber between switches</li>
              <li>• <strong>Labeling:</strong> ANSI/TIA-606 standard</li>
              <li>• <strong>Testing:</strong> Certify all runs before go-live</li>
              <li>• <strong>Spare capacity:</strong> 10-15% extra ports</li>
            </ul>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <Box className="w-6 h-6" style={{ color: 'hsl(var(--watt-bitcoin))' }} />
              <h4 className="text-lg font-bold text-white">Physical Layout</h4>
            </div>
            <ul className="space-y-2 text-sm text-white/70">
              <li>• <strong>IDF closets:</strong> One per container row</li>
              <li>• <strong>MDF:</strong> Central location for core equipment</li>
              <li>• <strong>Cable management:</strong> Overhead trays or raised floor</li>
              <li>• <strong>Cooling:</strong> Climate control for network closets</li>
              <li>• <strong>UPS:</strong> Network gear on battery backup</li>
            </ul>
          </div>
        </div>
      </ScrollReveal>

      {/* Flat vs Hierarchical */}
      <ScrollReveal delay={300}>
        <div className="bg-white/5 border border-white/10 rounded-xl p-6 mt-12">
          <h4 className="font-bold text-white mb-4">Flat vs. Hierarchical: When to Choose</h4>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h5 className="text-sm font-semibold text-white/80 mb-2">Flat Network (Single Layer)</h5>
              <p className="text-sm text-white/60 mb-2">All switches connected to central core. Simple but limited.</p>
              <p className="text-sm text-white/60"><strong>Best for:</strong> &lt;2,000 miners, single container facilities</p>
            </div>
            <div>
              <h5 className="text-sm font-semibold text-white/80 mb-2">Hierarchical (Three-Tier)</h5>
              <p className="text-sm text-white/60 mb-2">Core → Distribution → Access layers. Scalable and manageable.</p>
              <p className="text-sm text-white/60"><strong>Best for:</strong> &gt;2,000 miners, multi-building sites (like our 45MW)</p>
            </div>
          </div>
        </div>
      </ScrollReveal>
    </NetSectionWrapper>
  );
};

export default NetTopologySection;
