import { ScrollReveal } from '@/components/landing/ScrollAnimations';
import { Globe, Wifi, Radio, Satellite, Cable, Check, X, AlertCircle, DollarSign, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import { NetSectionWrapper, NetSectionHeader, NetKeyInsight, NetContentCard } from './shared';

const connectivityOptions = [
  {
    name: "Fiber Optic",
    icon: Cable,
    description: "Dedicated fiber connection from local provider",
    pros: ["Lowest latency (1-5ms)", "Highest reliability (99.99%)", "Symmetric speeds", "Scalable bandwidth"],
    cons: ["High installation cost ($10-50K)", "Long lead time (3-6 months)", "Limited rural availability"],
    typicalCost: "$500-2,000/mo for 100Mbps DIA",
    bestFor: "Primary connection when available",
    availability: "Limited in rural Lamont County"
  },
  {
    name: "Fixed Wireless",
    icon: Radio,
    description: "Point-to-point microwave or radio link",
    pros: ["Faster deployment (2-4 weeks)", "Good latency (5-20ms)", "Rural availability", "Lower install cost"],
    cons: ["Weather-sensitive", "Line-of-sight required", "Shared bandwidth possible"],
    typicalCost: "$200-800/mo for 50-100Mbps",
    bestFor: "Primary or backup in rural areas",
    availability: "MCSnet, Telus Business in Lamont County"
  },
  {
    name: "LTE/5G Cellular",
    icon: Wifi,
    description: "Business cellular data connection",
    pros: ["Quick deployment (days)", "Mobile/portable", "No infrastructure needed", "Wide coverage"],
    cons: ["Higher latency (20-50ms)", "Data caps common", "Variable speeds", "Higher per-GB cost"],
    typicalCost: "$100-300/mo for 50-100GB",
    bestFor: "Backup/failover connection",
    availability: "Telus, Rogers, Bell coverage in area"
  },
  {
    name: "Starlink",
    icon: Satellite,
    description: "SpaceX low-earth orbit satellite internet",
    pros: ["Available anywhere", "Good speeds (50-200Mbps)", "Quick setup (hours)", "No line-of-sight to tower"],
    cons: ["Higher latency (25-60ms)", "Weather-sensitive", "Shared capacity", "Equipment cost ($600+)"],
    typicalCost: "$140-500/mo (Business tier)",
    bestFor: "Backup/failover for remote sites",
    availability: "Full coverage in Alberta"
  },
];

const ispComparisonTable = [
  { provider: "Telus Business", type: "Fiber/Fixed", speed: "Up to 1Gbps", latency: "1-10ms", sla: "99.9%", typical: "$500-2,000/mo" },
  { provider: "MCSnet", type: "Fixed Wireless", speed: "25-100Mbps", latency: "5-20ms", sla: "99.5%", typical: "$150-400/mo" },
  { provider: "Xplornet", type: "Fixed Wireless", speed: "25-50Mbps", latency: "20-40ms", sla: "99%", typical: "$100-200/mo" },
  { provider: "Starlink Business", type: "LEO Satellite", speed: "50-220Mbps", latency: "25-60ms", sla: "None", typical: "$140-500/mo" },
  { provider: "Rogers Business", type: "LTE/5G", speed: "25-100Mbps", latency: "20-50ms", sla: "Varies", typical: "$100-300/mo" },
];

const NetConnectivitySection = () => {
  return (
    <NetSectionWrapper id="connectivity" theme="light">
      <ScrollReveal>
        <NetSectionHeader
          badge="Section 2"
          badgeIcon={Globe}
          title="Internet Connectivity Options"
          description="Understanding the ISP landscape in rural Alberta. For our 45MW Lamont County site, connectivity options are more limited than urban areas—but still achievable."
          theme="light"
          accentColor="purple"
        />
      </ScrollReveal>

      {/* Alberta Rural ISP Context */}
      <ScrollReveal delay={50}>
        <NetKeyInsight title="Rural Alberta Reality" type="insight" theme="light">
          <p className="mb-2">
            Lamont County is approximately 80km east of Edmonton. While not as remote as northern Alberta, 
            enterprise-grade connectivity requires planning:
          </p>
          <ul className="space-y-1 text-sm">
            <li>• <strong>Fiber:</strong> Limited—may require construction to bring to site</li>
            <li>• <strong>Fixed Wireless:</strong> Best option—MCSnet and Telus have coverage</li>
            <li>• <strong>Cellular:</strong> Good LTE coverage, 5G expanding</li>
            <li>• <strong>Lead Time:</strong> Plan 2-4 months for enterprise-grade connections</li>
          </ul>
        </NetKeyInsight>
      </ScrollReveal>

      {/* Connectivity Options Grid */}
      <ScrollReveal delay={100}>
        <div className="grid md:grid-cols-2 gap-6 my-12">
          {connectivityOptions.map((option, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1, duration: 0.5 }}
              viewport={{ once: true }}
              className="bg-card border border-border rounded-xl p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <option.icon className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-foreground">{option.name}</h3>
                  <p className="text-sm text-muted-foreground">{option.description}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <h4 className="text-xs font-semibold text-green-600 uppercase tracking-wide mb-2">Advantages</h4>
                  <ul className="space-y-1">
                    {option.pros.map((pro, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <Check className="w-3 h-3 mt-1 text-green-500 flex-shrink-0" />
                        {pro}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-red-600 uppercase tracking-wide mb-2">Considerations</h4>
                  <ul className="space-y-1">
                    {option.cons.map((con, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <X className="w-3 h-3 mt-1 text-red-400 flex-shrink-0" />
                        {con}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="pt-4 border-t border-border space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <DollarSign className="w-4 h-4 text-muted-foreground" />
                  <span className="text-foreground font-medium">{option.typicalCost}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <AlertCircle className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">{option.availability}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </ScrollReveal>

      {/* ISP Comparison Table */}
      <ScrollReveal delay={200}>
        <div className="bg-card border border-border rounded-xl overflow-hidden my-12">
          <div className="p-4 border-b border-border bg-muted/50">
            <h3 className="font-bold text-foreground">Alberta Rural ISP Comparison</h3>
            <p className="text-sm text-muted-foreground">Based on Lamont County availability (2025)</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/30">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Provider</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Type</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Speed</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Latency</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">SLA</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Typical Cost</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {ispComparisonTable.map((isp, idx) => (
                  <tr key={idx} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 text-sm font-medium text-foreground">{isp.provider}</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{isp.type}</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{isp.speed}</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{isp.latency}</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{isp.sla}</td>
                    <td className="px-4 py-3 text-sm font-medium" style={{ color: 'hsl(var(--watt-bitcoin))' }}>{isp.typical}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </ScrollReveal>

      {/* DIA vs Business Broadband */}
      <ScrollReveal delay={300}>
        <div className="grid md:grid-cols-2 gap-6 my-12">
          <div className="bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20 rounded-xl p-6">
            <h3 className="text-lg font-bold text-foreground mb-2">Dedicated Internet Access (DIA)</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Enterprise-grade connection with guaranteed bandwidth, SLA, and support.
            </p>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2"><Check className="w-4 h-4 text-green-500" /> Symmetric upload/download</li>
              <li className="flex items-center gap-2"><Check className="w-4 h-4 text-green-500" /> 99.9%+ SLA guarantee</li>
              <li className="flex items-center gap-2"><Check className="w-4 h-4 text-green-500" /> 4-hour response time</li>
              <li className="flex items-center gap-2"><Check className="w-4 h-4 text-green-500" /> Static IP addresses</li>
              <li className="flex items-center gap-2"><Check className="w-4 h-4 text-green-500" /> No throttling or caps</li>
            </ul>
            <div className="mt-4 pt-4 border-t border-primary/20">
              <span className="text-lg font-bold" style={{ color: 'hsl(var(--watt-bitcoin))' }}>$500-2,000/mo</span>
              <span className="text-sm text-muted-foreground ml-2">for 100Mbps</span>
            </div>
          </div>

          <div className="bg-muted/50 border border-border rounded-xl p-6">
            <h3 className="text-lg font-bold text-foreground mb-2">Business Broadband</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Standard business internet with best-effort service and basic support.
            </p>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2"><Check className="w-4 h-4 text-green-500" /> Lower cost</li>
              <li className="flex items-center gap-2"><Check className="w-4 h-4 text-green-500" /> Faster installation</li>
              <li className="flex items-center gap-2"><X className="w-4 h-4 text-red-400" /> Asymmetric speeds typical</li>
              <li className="flex items-center gap-2"><X className="w-4 h-4 text-red-400" /> No SLA guarantee</li>
              <li className="flex items-center gap-2"><X className="w-4 h-4 text-red-400" /> Possible throttling</li>
            </ul>
            <div className="mt-4 pt-4 border-t border-border">
              <span className="text-lg font-bold" style={{ color: 'hsl(var(--watt-bitcoin))' }}>$100-400/mo</span>
              <span className="text-sm text-muted-foreground ml-2">for 50-100Mbps</span>
            </div>
          </div>
        </div>
      </ScrollReveal>

      {/* Recommendation */}
      <ScrollReveal delay={350}>
        <NetKeyInsight title="45MW Site Recommendation" type="success" theme="light">
          <p className="mb-2">For our Lamont County facility, we recommend:</p>
          <ul className="space-y-1 text-sm">
            <li>• <strong>Primary:</strong> MCSnet or Telus Fixed Wireless DIA (100Mbps, ~$600/mo)</li>
            <li>• <strong>Secondary:</strong> Starlink Business ($250/mo) or LTE failover</li>
            <li>• <strong>Total monthly:</strong> ~$850-1,200 for full redundancy</li>
            <li>• <strong>Lead time:</strong> Contact ISPs 3+ months before energization</li>
          </ul>
        </NetKeyInsight>
      </ScrollReveal>
    </NetSectionWrapper>
  );
};

export default NetConnectivitySection;
