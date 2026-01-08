import { ScrollReveal } from '@/components/landing/ScrollAnimations';
import { MapPin, CheckCircle, DollarSign, Clock, AlertTriangle, Server, Network, Shield, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import { NetSectionWrapper, NetSectionHeader, NetKeyInsight } from './shared';

const siteOverview = {
  location: "Lamont County, Alberta",
  capacity: "45MW",
  miners: "~13,000 units",
  hashrate: "~1.8 EH/s (estimated)",
  distance: "80km east of Edmonton"
};

const equipmentList = [
  { category: "Access Layer", item: "Ubiquiti USW-Pro-48", qty: 283, unitCost: 700, notes: "48-port switches for miner rows" },
  { category: "Distribution Layer", item: "Cisco Catalyst 9300-48P", qty: 8, unitCost: 4500, notes: "Aggregation per building/zone" },
  { category: "Core Layer", item: "Arista 7050SX-64", qty: 2, unitCost: 8000, notes: "Redundant core pair" },
  { category: "Firewall", item: "Fortinet FortiGate 100F", qty: 2, unitCost: 2500, notes: "HA pair, dual-WAN" },
  { category: "ISP Equipment", item: "Primary CPE + Backup", qty: 1, unitCost: 1500, notes: "Fixed wireless + Starlink" },
  { category: "Cabling", item: "Cat6 + fiber backbone", qty: 1, unitCost: 50000, notes: "Estimated for facility" },
  { category: "UPS", item: "Network closet UPS units", qty: 10, unitCost: 2000, notes: "For core/distribution/firewall" },
];

const monthlyOperating = [
  { item: "Primary ISP (MCSnet DIA 100Mbps)", cost: 600 },
  { item: "Backup ISP (Starlink Business)", cost: 250 },
  { item: "Foreman Fleet Management", cost: 1300 },
  { item: "PagerDuty Alerting", cost: 50 },
  { item: "DNS/Domain Services", cost: 20 },
];

const timeline = [
  { phase: "Planning & Design", weeks: "4-6", tasks: ["Network architecture design", "Equipment selection", "ISP engagement"] },
  { phase: "ISP Installation", weeks: "8-12", tasks: ["Fiber/wireless construction", "Router delivery", "Circuit activation"] },
  { phase: "Equipment Procurement", weeks: "4-8", tasks: ["Switch ordering", "Firewall setup", "Cabling delivery"] },
  { phase: "Physical Installation", weeks: "4-6", tasks: ["Rack mounting", "Cabling runs", "Power connections"] },
  { phase: "Configuration", weeks: "2-4", tasks: ["VLAN setup", "DHCP/DNS", "Monitoring deployment"] },
  { phase: "Testing & Go-Live", weeks: "1-2", tasks: ["Connectivity tests", "Failover testing", "Miner onboarding"] },
];

const lessonsLearned = [
  { lesson: "Start ISP discussions early", detail: "Rural fixed wireless can take 3-4 months. Begin ISP engagement as soon as site is confirmed." },
  { lesson: "Over-spec the core", detail: "Access switches can be budget-tier, but invest in reliable core and distribution layers." },
  { lesson: "Test failover before go-live", detail: "Simulate ISP failures during commissioning—don't wait for a real outage." },
  { lesson: "Document everything", detail: "IP schemes, cable labels, credential storage. Future you will thank present you." },
  { lesson: "Plan for growth", detail: "Even if deploying 50%, wire and configure for 100% capacity upfront." },
];

const NetCaseStudySection = () => {
  const totalCapex = equipmentList.reduce((sum, item) => sum + (item.qty * item.unitCost), 0);
  const totalMonthly = monthlyOperating.reduce((sum, item) => sum + item.cost, 0);

  return (
    <NetSectionWrapper id="case-study" theme="dark">
      <ScrollReveal>
        <NetSectionHeader
          badge="Section 10 • Case Study"
          badgeIcon={MapPin}
          title="45MW Alberta Site: Complete Network Design"
          description="Bringing it all together—the complete network architecture for our Lamont County, Alberta Bitcoin mining facility."
          theme="dark"
          accentColor="bitcoin"
        />
      </ScrollReveal>

      {/* Site Overview */}
      <ScrollReveal delay={50}>
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-12">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <MapPin className="w-5 h-5" style={{ color: 'hsl(var(--watt-bitcoin))' }} />
            Site Overview
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {Object.entries(siteOverview).map(([key, value], idx) => (
              <div key={idx} className="text-center">
                <div className="text-xl font-bold" style={{ color: 'hsl(var(--watt-bitcoin))' }}>{value}</div>
                <div className="text-sm text-white/60 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</div>
              </div>
            ))}
          </div>
        </div>
      </ScrollReveal>

      {/* Equipment Bill of Materials */}
      <ScrollReveal delay={100}>
        <h3 className="text-xl font-bold text-white mb-6">Network Equipment BOM</h3>
        <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden mb-8">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-white/5">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-white/60 uppercase">Category</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-white/60 uppercase">Equipment</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-white/60 uppercase">Qty</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-white/60 uppercase">Unit Cost</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-white/60 uppercase">Total</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-white/60 uppercase">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {equipmentList.map((item, idx) => (
                  <tr key={idx} className="hover:bg-white/5 transition-colors">
                    <td className="px-4 py-3 text-sm text-white/80">{item.category}</td>
                    <td className="px-4 py-3 text-sm font-medium text-white">{item.item}</td>
                    <td className="px-4 py-3 text-sm text-white/80">{item.qty}</td>
                    <td className="px-4 py-3 text-sm text-white/60">${item.unitCost.toLocaleString()}</td>
                    <td className="px-4 py-3 text-sm font-medium" style={{ color: 'hsl(var(--watt-bitcoin))' }}>
                      ${(item.qty * item.unitCost).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-sm text-white/50">{item.notes}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-white/10">
                <tr>
                  <td colSpan={4} className="px-4 py-3 text-sm font-bold text-white text-right">Total CapEx:</td>
                  <td className="px-4 py-3 text-lg font-bold" style={{ color: 'hsl(var(--watt-bitcoin))' }}>
                    ${totalCapex.toLocaleString()}
                  </td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </ScrollReveal>

      {/* Monthly Operating Costs */}
      <ScrollReveal delay={150}>
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          <div className="bg-white/5 border border-white/10 rounded-xl p-6">
            <h4 className="font-bold text-white mb-4 flex items-center gap-2">
              <DollarSign className="w-5 h-5" style={{ color: 'hsl(var(--watt-bitcoin))' }} />
              Monthly Operating Costs
            </h4>
            <ul className="space-y-3">
              {monthlyOperating.map((item, idx) => (
                <li key={idx} className="flex items-center justify-between text-sm">
                  <span className="text-white/70">{item.item}</span>
                  <span className="font-medium" style={{ color: 'hsl(var(--watt-bitcoin))' }}>${item.cost}/mo</span>
                </li>
              ))}
            </ul>
            <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between">
              <span className="font-bold text-white">Total Monthly:</span>
              <span className="text-xl font-bold" style={{ color: 'hsl(var(--watt-bitcoin))' }}>${totalMonthly.toLocaleString()}/mo</span>
            </div>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-xl p-6">
            <h4 className="font-bold text-white mb-4 flex items-center gap-2">
              <Network className="w-5 h-5" style={{ color: 'hsl(var(--watt-purple))' }} />
              ISP Configuration
            </h4>
            <div className="space-y-4 text-sm">
              <div className="bg-white/5 rounded-lg p-3">
                <div className="font-medium text-white">Primary: MCSnet Fixed Wireless</div>
                <div className="text-white/60">100Mbps DIA, 99.5% SLA</div>
                <div className="text-white/40 text-xs mt-1">Priority 1, Health check: 8.8.8.8</div>
              </div>
              <div className="bg-white/5 rounded-lg p-3">
                <div className="font-medium text-white">Backup: Starlink Business</div>
                <div className="text-white/60">50-200Mbps, Best effort</div>
                <div className="text-white/40 text-xs mt-1">Priority 2, Failover only</div>
              </div>
            </div>
          </div>
        </div>
      </ScrollReveal>

      {/* Timeline */}
      <ScrollReveal delay={200}>
        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <Clock className="w-5 h-5" style={{ color: 'hsl(var(--watt-purple))' }} />
          Implementation Timeline
        </h3>
        <div className="bg-white/5 border border-white/10 rounded-xl p-6 mb-12">
          <div className="space-y-4">
            {timeline.map((phase, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                viewport={{ once: true }}
                className="flex items-start gap-4"
              >
                <div className="w-24 text-right flex-shrink-0">
                  <span className="text-sm font-mono" style={{ color: 'hsl(var(--watt-bitcoin))' }}>{phase.weeks} wks</span>
                </div>
                <div className="w-3 h-3 rounded-full mt-1.5 flex-shrink-0" style={{ backgroundColor: 'hsl(var(--watt-purple))' }} />
                <div className="flex-1">
                  <h5 className="font-medium text-white">{phase.phase}</h5>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {phase.tasks.map((task, i) => (
                      <span key={i} className="px-2 py-0.5 rounded-full text-xs bg-white/10 text-white/60">{task}</span>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
          <div className="mt-6 pt-4 border-t border-white/10 text-center">
            <span className="text-white/60">Total estimated timeline: </span>
            <span className="font-bold" style={{ color: 'hsl(var(--watt-bitcoin))' }}>23-38 weeks</span>
            <span className="text-white/60"> (ISP is typically the longest lead time)</span>
          </div>
        </div>
      </ScrollReveal>

      {/* Lessons Learned */}
      <ScrollReveal delay={250}>
        <h3 className="text-xl font-bold text-white mb-6">Lessons Learned</h3>
        <div className="grid md:grid-cols-2 gap-4 mb-12">
          {lessonsLearned.map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              viewport={{ once: true }}
              className="bg-white/5 border border-white/10 rounded-xl p-5"
            >
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 mt-0.5 flex-shrink-0" style={{ color: 'hsl(var(--watt-success))' }} />
                <div>
                  <h5 className="font-bold text-white">{item.lesson}</h5>
                  <p className="text-sm text-white/60 mt-1">{item.detail}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </ScrollReveal>

      {/* Final Summary */}
      <ScrollReveal delay={300}>
        <NetKeyInsight title="Key Takeaways" type="success" theme="dark">
          <p className="mb-2">For a 45MW Bitcoin mining facility in rural Alberta:</p>
          <ul className="space-y-1 text-sm">
            <li>• <strong>Network budget:</strong> ~$300K CapEx + ~$2,200/mo OpEx</li>
            <li>• <strong>Per MW cost:</strong> ~$6,700 CapEx for network infrastructure</li>
            <li>• <strong>Timeline:</strong> 6-9 months from planning to miners online</li>
            <li>• <strong>Critical path:</strong> ISP connectivity—start early</li>
            <li>• <strong>Philosophy:</strong> Low bandwidth, high reliability</li>
          </ul>
        </NetKeyInsight>
      </ScrollReveal>

      {/* CTA */}
      <ScrollReveal delay={350}>
        <div className="text-center mt-12">
          <p className="text-white/60 mb-4">
            Congratulations on completing the Networking Masterclass! 🎉
          </p>
          <p className="text-white/40 text-sm">
            Return to the <a href="/academy" className="text-primary hover:underline">Academy</a> to continue your learning journey.
          </p>
        </div>
      </ScrollReveal>
    </NetSectionWrapper>
  );
};

export default NetCaseStudySection;
