import { ScrollReveal } from '@/components/landing/ScrollAnimations';
import { Shield, Lock, Key, Eye, AlertTriangle, CheckCircle, XCircle, Globe, Server } from 'lucide-react';
import { motion } from 'framer-motion';
import { NetSectionWrapper, NetSectionHeader, NetKeyInsight } from './shared';

const firewallRules = [
  { direction: "Outbound", port: "3333, 25, 443", protocol: "TCP", purpose: "Stratum mining pools", action: "ALLOW" },
  { direction: "Outbound", port: "123", protocol: "UDP", purpose: "NTP time sync", action: "ALLOW" },
  { direction: "Outbound", port: "53", protocol: "UDP/TCP", purpose: "DNS resolution", action: "ALLOW" },
  { direction: "Outbound", port: "443", protocol: "TCP", purpose: "HTTPS (firmware, APIs)", action: "ALLOW" },
  { direction: "Inbound", port: "ANY", protocol: "ANY", purpose: "All unsolicited inbound", action: "DENY" },
];

const securityLayers = [
  {
    layer: "Perimeter",
    icon: Globe,
    measures: ["Firewall (deny inbound)", "ISP-level DDoS protection", "No public IPs for miners"],
    priority: "Critical"
  },
  {
    layer: "Network",
    icon: Shield,
    measures: ["VLAN segmentation", "ACLs between VLANs", "Management VLAN isolation"],
    priority: "High"
  },
  {
    layer: "Device",
    icon: Server,
    measures: ["Strong admin passwords", "Disable unused services", "Firmware updates"],
    priority: "High"
  },
  {
    layer: "Physical",
    icon: Lock,
    measures: ["Locked network closets", "Camera monitoring", "Access control"],
    priority: "Medium"
  },
];

const vpnOptions = [
  { name: "WireGuard", type: "Modern VPN", pros: ["Fast", "Simple config", "Low overhead"], cons: ["Newer (less audited)"] },
  { name: "OpenVPN", type: "Traditional VPN", pros: ["Battle-tested", "Flexible", "Wide support"], cons: ["More complex", "Higher CPU"] },
  { name: "Tailscale", type: "Mesh VPN", pros: ["Easy setup", "NAT traversal", "Zero-config"], cons: ["Cloud dependency", "Per-device cost"] },
];

const NetSecuritySection = () => {
  return (
    <NetSectionWrapper id="security" theme="dark">
      <ScrollReveal>
        <NetSectionHeader
          badge="Section 7"
          badgeIcon={Shield}
          title="Network Security"
          description="Securing a Bitcoin mining network. Good news: mining networks are inherently simple to secure—no inbound connections required."
          theme="dark"
          accentColor="purple"
        />
      </ScrollReveal>

      {/* Key Security Insight */}
      <ScrollReveal delay={50}>
        <NetKeyInsight title="Mining Networks Are Easy to Secure" type="success" theme="dark">
          <p className="mb-2">Unlike web servers or APIs, Bitcoin miners only need outbound connections:</p>
          <ul className="space-y-1 text-sm">
            <li>• <strong>No inbound required:</strong> Miners initiate all connections to pools</li>
            <li>• <strong>Simple firewall rules:</strong> Block all inbound, allow specific outbound</li>
            <li>• <strong>No public IPs:</strong> Miners can all use private (NAT) addresses</li>
            <li>• <strong>Minimal attack surface:</strong> Nothing to exploit from the internet</li>
          </ul>
        </NetKeyInsight>
      </ScrollReveal>

      {/* Firewall Rules */}
      <ScrollReveal delay={100}>
        <h3 className="text-xl font-bold text-white mb-6">Essential Firewall Rules</h3>
        <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden mb-12">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-white/5">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-white/60 uppercase">Direction</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-white/60 uppercase">Port(s)</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-white/60 uppercase">Protocol</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-white/60 uppercase">Purpose</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-white/60 uppercase">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {firewallRules.map((rule, idx) => (
                  <tr key={idx} className="hover:bg-white/5 transition-colors">
                    <td className="px-4 py-3 text-sm text-white">{rule.direction}</td>
                    <td className="px-4 py-3 text-sm font-mono text-white/80">{rule.port}</td>
                    <td className="px-4 py-3 text-sm text-white/60">{rule.protocol}</td>
                    <td className="px-4 py-3 text-sm text-white/60">{rule.purpose}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                        rule.action === 'ALLOW' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                      }`}>
                        {rule.action === 'ALLOW' ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                        {rule.action}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </ScrollReveal>

      {/* Defense in Depth */}
      <ScrollReveal delay={150}>
        <h3 className="text-xl font-bold text-white mb-6">Defense in Depth</h3>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          {securityLayers.map((layer, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              viewport={{ once: true }}
              className="bg-white/5 border border-white/10 rounded-xl p-5"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
                  <layer.icon className="w-5 h-5" style={{ color: 'hsl(var(--watt-purple))' }} />
                </div>
                <div>
                  <h4 className="font-bold text-white">{layer.layer}</h4>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    layer.priority === 'Critical' ? 'bg-red-500/20 text-red-400' :
                    layer.priority === 'High' ? 'bg-amber-500/20 text-amber-400' :
                    'bg-blue-500/20 text-blue-400'
                  }`}>{layer.priority}</span>
                </div>
              </div>
              <ul className="space-y-2">
                {layer.measures.map((measure, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-white/70">
                    <CheckCircle className="w-3 h-3 mt-1 text-green-400 flex-shrink-0" />
                    {measure}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </ScrollReveal>

      {/* VPN for Remote Management */}
      <ScrollReveal delay={200}>
        <h3 className="text-xl font-bold text-white mb-6">VPN for Remote Management</h3>
        <p className="text-white/60 mb-6">
          For remote monitoring and management, use a VPN rather than exposing services to the internet:
        </p>
        <div className="grid md:grid-cols-3 gap-4 mb-12">
          {vpnOptions.map((vpn, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              viewport={{ once: true }}
              className="bg-white/5 border border-white/10 rounded-xl p-5"
            >
              <h4 className="font-bold text-white">{vpn.name}</h4>
              <p className="text-xs text-white/40 mb-3">{vpn.type}</p>
              <div className="space-y-2">
                <div>
                  <span className="text-xs text-green-400 uppercase">Pros</span>
                  <ul className="mt-1 space-y-1">
                    {vpn.pros.map((pro, i) => (
                      <li key={i} className="text-sm text-white/70">{pro}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <span className="text-xs text-amber-400 uppercase">Cons</span>
                  <ul className="mt-1 space-y-1">
                    {vpn.cons.map((con, i) => (
                      <li key={i} className="text-sm text-white/50">{con}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </ScrollReveal>

      {/* Password Best Practices */}
      <ScrollReveal delay={250}>
        <div className="bg-white/5 border border-white/10 rounded-xl p-6 mb-12">
          <div className="flex items-center gap-3 mb-4">
            <Key className="w-6 h-6" style={{ color: 'hsl(var(--watt-bitcoin))' }} />
            <h4 className="font-bold text-white">Credential Management</h4>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h5 className="text-sm font-semibold text-white/80 mb-3">Miner Credentials</h5>
              <ul className="space-y-2 text-sm text-white/70">
                <li>• Change default passwords immediately (root/root is common)</li>
                <li>• Use strong, unique passwords per device or zone</li>
                <li>• Document credentials in a secure password manager</li>
                <li>• Disable SSH if not needed; use web interface only</li>
              </ul>
            </div>
            <div>
              <h5 className="text-sm font-semibold text-white/80 mb-3">Infrastructure Credentials</h5>
              <ul className="space-y-2 text-sm text-white/70">
                <li>• Unique passwords for each switch/router</li>
                <li>• Use SSH keys instead of passwords where possible</li>
                <li>• Enable RADIUS/TACACS+ for centralized auth</li>
                <li>• Regular credential rotation (quarterly minimum)</li>
              </ul>
            </div>
          </div>
        </div>
      </ScrollReveal>

      {/* Firmware Updates */}
      <ScrollReveal delay={300}>
        <NetKeyInsight title="Firmware Security" type="warning" theme="dark" icon={AlertTriangle}>
          <p className="mb-2">Keep firmware updated but be cautious:</p>
          <ul className="space-y-1 text-sm">
            <li>• <strong>Test first:</strong> Update a small batch (10-20 units) before fleet-wide rollout</li>
            <li>• <strong>Official sources only:</strong> Download firmware only from manufacturer sites</li>
            <li>• <strong>Verify hashes:</strong> Check SHA256 checksums before applying</li>
            <li>• <strong>Schedule downtime:</strong> Updates can cause reboots and temporary hashrate loss</li>
          </ul>
        </NetKeyInsight>
      </ScrollReveal>

      {/* Monitoring for Anomalies */}
      <ScrollReveal delay={350}>
        <div className="bg-white/5 border border-white/10 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <Eye className="w-6 h-6" style={{ color: 'hsl(var(--watt-purple))' }} />
            <h4 className="font-bold text-white">Security Monitoring</h4>
          </div>
          <ul className="space-y-2 text-sm text-white/70">
            <li>• <strong>Unknown MACs:</strong> Alert on new devices appearing on the network</li>
            <li>• <strong>Traffic anomalies:</strong> Monitor for unusual outbound connections</li>
            <li>• <strong>Failed logins:</strong> Track authentication failures on network gear</li>
            <li>• <strong>Pool changes:</strong> Alert if miners start pointing to unknown pools</li>
            <li>• <strong>Hashrate drops:</strong> Could indicate firmware tampering or theft</li>
          </ul>
        </div>
      </ScrollReveal>
    </NetSectionWrapper>
  );
};

export default NetSecuritySection;
