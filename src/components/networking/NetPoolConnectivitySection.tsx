import { ScrollReveal } from '@/components/landing/ScrollAnimations';
import { Server, Zap, Clock, AlertTriangle, Globe, RefreshCw, CheckCircle, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
import { NetSectionWrapper, NetSectionHeader, NetKeyInsight } from './shared';

const majorPools = [
  { name: "Foundry USA", share: "~30%", location: "North America", latency: "Excellent for Alberta", stratum: "stratum+tcp://foundryusapool.com:3333" },
  { name: "Antpool", share: "~15%", location: "Asia (Global CDN)", latency: "Good", stratum: "stratum+tcp://ss.antpool.com:3333" },
  { name: "F2Pool", share: "~12%", location: "Asia (Global CDN)", latency: "Good", stratum: "stratum+tcp://btc.f2pool.com:3333" },
  { name: "ViaBTC", share: "~10%", location: "Asia (Global CDN)", latency: "Good", stratum: "stratum+tcp://btc.viabtc.com:3333" },
  { name: "Braiins Pool", share: "~5%", location: "Europe", latency: "Moderate", stratum: "stratum+tcp://stratum.braiins.com:3333" },
  { name: "OCEAN", share: "~3%", location: "Global", latency: "Good", stratum: "stratum+tcp://mine.ocean.xyz:3334" },
];

const stratumComparison = [
  {
    version: "Stratum V1",
    released: "2012",
    status: "Widely adopted",
    pros: ["Universal support", "Simple implementation", "Proven reliability"],
    cons: ["No encryption", "Bandwidth overhead", "Limited job negotiation"],
    bandwidth: "~10-20 MB/day per miner"
  },
  {
    version: "Stratum V2",
    released: "2019+",
    status: "Growing adoption",
    pros: ["End-to-end encryption", "Reduced bandwidth", "Job negotiation", "Decentralization benefits"],
    cons: ["Limited pool support", "Firmware updates needed", "Migration complexity"],
    bandwidth: "~3-5 MB/day per miner"
  },
];

const NetPoolConnectivitySection = () => {
  return (
    <NetSectionWrapper id="pool-connectivity" theme="gradient">
      <ScrollReveal>
        <NetSectionHeader
          badge="Section 6"
          badgeIcon={Server}
          title="Mining Pool Connectivity"
          description="Stratum protocol, pool selection, and failover configuration. Understanding the protocol that keeps your miners earning Bitcoin."
          theme="light"
          accentColor="bitcoin"
        />
      </ScrollReveal>

      {/* Bandwidth Reality */}
      <ScrollReveal delay={50}>
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {[
            { value: "10-20 MB", label: "Per miner per day", sublabel: "Stratum V1 bandwidth" },
            { value: "~260 GB", label: "45MW site per month", sublabel: "13,000 miners total" },
            { value: "<1 Mbps", label: "Actual throughput", sublabel: "Even with 13K miners" },
          ].map((stat, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.1 }}
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

      {/* Key Insight */}
      <ScrollReveal delay={100}>
        <NetKeyInsight title="Bitcoin Mining is NOT Bandwidth Intensive" type="insight" theme="light">
          <p className="mb-2">Unlike streaming or cloud services, Bitcoin mining uses minimal bandwidth:</p>
          <ul className="space-y-1 text-sm">
            <li>• <strong>Stratum protocol:</strong> Only sends block headers (~80 bytes) and share submissions</li>
            <li>• <strong>No blockchain sync:</strong> Miners don't download the blockchain—pools provide work</li>
            <li>• <strong>Bidirectional but small:</strong> Mostly text-based JSON messages</li>
            <li>• <strong>Real constraint:</strong> Latency, not bandwidth</li>
          </ul>
        </NetKeyInsight>
      </ScrollReveal>

      {/* Latency Impact */}
      <ScrollReveal delay={150}>
        <div className="bg-card border border-border rounded-2xl p-6 mb-12">
          <h3 className="text-xl font-bold text-foreground text-center mb-6">Latency Impact on Revenue</h3>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h4 className="font-semibold text-foreground mb-4">How Latency Affects Mining</h4>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li className="flex items-start gap-3">
                  <Clock className="w-5 h-5 mt-0.5 text-primary flex-shrink-0" />
                  <div>
                    <strong className="text-foreground">Block Propagation:</strong> When a new block is found, 
                    your miner needs to receive the new job template quickly
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <Zap className="w-5 h-5 mt-0.5" style={{ color: 'hsl(var(--watt-bitcoin))' }} />
                  <div>
                    <strong className="text-foreground">Stale Shares:</strong> Work submitted on old blocks 
                    is rejected—wasted hashpower
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <TrendingUp className="w-5 h-5 mt-0.5 text-green-500 flex-shrink-0" />
                  <div>
                    <strong className="text-foreground">Rule of Thumb:</strong> Every 100ms of latency adds 
                    ~0.1% stale share rate
                  </div>
                </li>
              </ul>
            </div>
            <div className="bg-muted/50 rounded-xl p-4">
              <h4 className="font-semibold text-foreground mb-3">Stale Rate by Latency</h4>
              <div className="space-y-2">
                {[
                  { latency: "<50ms", stale: "0.3-0.5%", quality: "Excellent" },
                  { latency: "50-100ms", stale: "0.5-1.0%", quality: "Good" },
                  { latency: "100-200ms", stale: "1.0-2.0%", quality: "Acceptable" },
                  { latency: ">200ms", stale: "2.0%+", quality: "Poor" },
                ].map((row, idx) => (
                  <div key={idx} className="flex items-center justify-between text-sm p-2 bg-card rounded-lg">
                    <span className="font-mono text-muted-foreground">{row.latency}</span>
                    <span className="font-medium" style={{ color: 'hsl(var(--watt-bitcoin))' }}>{row.stale}</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs ${
                      row.quality === 'Excellent' ? 'bg-green-100 text-green-700' :
                      row.quality === 'Good' ? 'bg-blue-100 text-blue-700' :
                      row.quality === 'Acceptable' ? 'bg-amber-100 text-amber-700' :
                      'bg-red-100 text-red-700'
                    }`}>{row.quality}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </ScrollReveal>

      {/* Stratum V1 vs V2 */}
      <ScrollReveal delay={200}>
        <h3 className="text-xl font-bold text-foreground mb-6">Stratum Protocol Comparison</h3>
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {stratumComparison.map((protocol, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: idx === 0 ? -20 : 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              viewport={{ once: true }}
              className={`border rounded-xl p-6 ${idx === 0 ? 'bg-card border-border' : 'bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20'}`}
            >
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-bold text-foreground">{protocol.version}</h4>
                <span className="px-2 py-0.5 rounded-full text-xs bg-muted text-muted-foreground">{protocol.status}</span>
              </div>
              <p className="text-sm text-muted-foreground mb-4">Released: {protocol.released}</p>
              
              <div className="mb-4">
                <span className="text-sm font-medium text-foreground">Bandwidth: </span>
                <span className="text-sm font-mono" style={{ color: 'hsl(var(--watt-bitcoin))' }}>{protocol.bandwidth}</span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h5 className="text-xs font-semibold text-green-600 uppercase mb-2">Advantages</h5>
                  <ul className="space-y-1">
                    {protocol.pros.map((pro, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <CheckCircle className="w-3 h-3 mt-1 text-green-500 flex-shrink-0" />
                        {pro}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h5 className="text-xs font-semibold text-amber-600 uppercase mb-2">Considerations</h5>
                  <ul className="space-y-1">
                    {protocol.cons.map((con, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <AlertTriangle className="w-3 h-3 mt-1 text-amber-500 flex-shrink-0" />
                        {con}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </ScrollReveal>

      {/* Major Pools */}
      <ScrollReveal delay={250}>
        <h3 className="text-xl font-bold text-foreground mb-6">Major Mining Pools</h3>
        <div className="bg-card border border-border rounded-xl overflow-hidden mb-12">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/30">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Pool</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Hash Share</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Servers</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Alberta Latency</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Stratum URL</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {majorPools.map((pool, idx) => (
                  <tr key={idx} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 text-sm font-medium text-foreground">{pool.name}</td>
                    <td className="px-4 py-3 text-sm" style={{ color: 'hsl(var(--watt-bitcoin))' }}>{pool.share}</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{pool.location}</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{pool.latency}</td>
                    <td className="px-4 py-3 text-sm font-mono text-muted-foreground text-xs">{pool.stratum}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </ScrollReveal>

      {/* Pool Failover Configuration */}
      <ScrollReveal delay={300}>
        <div className="bg-card border border-border rounded-xl p-6 mb-12">
          <h4 className="font-bold text-foreground mb-4">Pool Failover Configuration</h4>
          <p className="text-sm text-muted-foreground mb-4">
            Always configure multiple pools. If primary is unreachable, miners automatically switch:
          </p>
          <div className="font-mono text-sm bg-muted/50 rounded-lg p-4 border border-border">
            <p className="text-muted-foreground"># Example Antminer configuration</p>
            <p className="text-foreground"><strong>Pool 1:</strong> stratum+tcp://foundryusapool.com:3333</p>
            <p className="text-foreground"><strong>Pool 2:</strong> stratum+tcp://ss.antpool.com:3333</p>
            <p className="text-foreground"><strong>Pool 3:</strong> stratum+tcp://btc.f2pool.com:3333</p>
            <p className="text-muted-foreground mt-2"># Worker naming convention: company.site.rack.position</p>
            <p className="text-foreground">Worker: wattbyte.lamont.a1.001</p>
          </div>
        </div>
      </ScrollReveal>

      {/* DNS Configuration */}
      <ScrollReveal delay={350}>
        <NetKeyInsight title="DNS Configuration for Pools" type="insight" theme="light">
          <p className="mb-2">Reliable DNS is critical for pool connectivity:</p>
          <ul className="space-y-1 text-sm">
            <li>• <strong>Use multiple DNS servers:</strong> Google (8.8.8.8, 8.8.4.4) + Cloudflare (1.1.1.1)</li>
            <li>• <strong>Local caching:</strong> Run a local DNS cache to reduce lookup times</li>
            <li>• <strong>IP fallback:</strong> Some pools provide static IPs as backup</li>
            <li>• <strong>Test regularly:</strong> Monitor DNS resolution times in your monitoring stack</li>
          </ul>
        </NetKeyInsight>
      </ScrollReveal>
    </NetSectionWrapper>
  );
};

export default NetPoolConnectivitySection;
