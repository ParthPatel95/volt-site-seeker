import React, { useState } from 'react';
import { 
  Shield, 
  Wifi, 
  Server,
  Globe,
  Camera,
  Lock,
  Zap,
  AlertTriangle,
  CheckCircle,
  Network,
  Monitor
} from 'lucide-react';
import { ScrollReveal } from '@/components/landing/ScrollAnimations';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const networkLayers = [
  {
    name: 'Core Layer',
    description: 'High-capacity backbone routers',
    equipment: ['Enterprise routers (dual redundant)', 'Firewall clusters', 'Load balancers'],
    bandwidth: '10 Gbps+',
    color: 'from-red-500 to-orange-500'
  },
  {
    name: 'Aggregation Layer',
    description: 'Distribution switches connecting container rows',
    equipment: ['L3 switches (48-port)', 'Redundant uplinks', 'VLAN segmentation'],
    bandwidth: '10 Gbps',
    color: 'from-orange-500 to-yellow-500'
  },
  {
    name: 'Access Layer',
    description: 'Container-level switches for miners',
    equipment: ['Managed switches per container', 'PoE for sensors', 'Cable management'],
    bandwidth: '1 Gbps per container',
    color: 'from-green-500 to-emerald-500'
  }
];

const bandwidthRequirements = [
  { miners: 1000, bandwidth: '10 Mbps', latency: '< 50ms' },
  { miners: 5000, bandwidth: '50 Mbps', latency: '< 50ms' },
  { miners: 10000, bandwidth: '100 Mbps', latency: '< 30ms' },
  { miners: 20000, bandwidth: '200 Mbps', latency: '< 30ms' },
  { miners: 50000, bandwidth: '500 Mbps', latency: '< 20ms' }
];

const securitySystems = [
  {
    category: 'Perimeter Security',
    icon: Shield,
    items: [
      { name: 'Electronic Fence', description: '4-wire pulse fence, 100m zones, alarm integration', priority: 'Critical' },
      { name: 'Security Fence', description: '2.4m height, anti-climb design, concrete base', priority: 'Critical' },
      { name: 'Vehicle Barriers', description: 'Automatic gates, bollards, speed bumps', priority: 'High' },
      { name: 'Lighting', description: 'LED flood lights, motion-activated, solar backup', priority: 'High' }
    ]
  },
  {
    category: 'Surveillance',
    icon: Camera,
    items: [
      { name: 'CCTV System', description: '4K cameras, 30-day storage, night vision', priority: 'Critical' },
      { name: 'Motion Detection', description: 'AI-powered analytics, intrusion alerts', priority: 'High' },
      { name: 'Thermal Imaging', description: 'Perimeter coverage, equipment monitoring', priority: 'Medium' },
      { name: 'Drone Detection', description: 'RF scanning, counter-UAS capability', priority: 'Medium' }
    ]
  },
  {
    category: 'Access Control',
    icon: Lock,
    items: [
      { name: 'Biometric Access', description: 'Fingerprint + card for critical areas', priority: 'Critical' },
      { name: 'Visitor Management', description: 'Pre-registration, escort requirements', priority: 'High' },
      { name: 'Vehicle Tracking', description: 'RFID tags, license plate recognition', priority: 'Medium' },
      { name: 'Key Management', description: 'Electronic key cabinet, audit trail', priority: 'High' }
    ]
  },
  {
    category: 'Cybersecurity',
    icon: Monitor,
    items: [
      { name: 'Network Segmentation', description: 'Separate VLANs: mining, management, guest', priority: 'Critical' },
      { name: 'Firewall', description: 'Next-gen firewall, IDS/IPS, DDoS protection', priority: 'Critical' },
      { name: 'VPN Access', description: 'Site-to-site VPN, remote management', priority: 'High' },
      { name: 'Monitoring', description: '24/7 NOC, SIEM integration, alert escalation', priority: 'Critical' }
    ]
  }
];

const managementPlatform = {
  name: 'AntSentry / Farm Management',
  features: [
    { name: 'Real-time Monitoring', description: 'Hashrate, temperature, power for all miners' },
    { name: 'Automated Alerts', description: 'Threshold-based notifications via SMS/email' },
    { name: 'Firmware Management', description: 'Batch updates, rollback capability' },
    { name: 'Power Management', description: 'Load balancing, curtailment scheduling' },
    { name: 'Reporting', description: 'Performance analytics, uptime reports' },
    { name: 'API Integration', description: 'REST API for custom dashboards' }
  ]
};

const HydroNetworkSecuritySection = () => {
  const [activeTab, setActiveTab] = useState('network');

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <ScrollReveal>
          <div className="text-center mb-16">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-100 text-indigo-700 text-sm font-medium mb-4">
              <Shield className="w-4 h-4" />
              Network & Security
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-watt-navy mb-4">
              Network Infrastructure & Security
            </h2>
            <p className="text-lg text-watt-navy/70 max-w-2xl mx-auto">
              Enterprise-grade network architecture and multi-layer security systems 
              for reliable and protected mining operations.
            </p>
          </div>
        </ScrollReveal>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <ScrollReveal>
            <TabsList className="grid grid-cols-3 gap-4 h-auto bg-transparent mb-8">
              <TabsTrigger
                value="network"
                className="flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all data-[state=active]:border-indigo-500 data-[state=active]:bg-indigo-50 border-watt-navy/10 bg-white hover:border-indigo-300"
              >
                <Network className="w-6 h-6 text-indigo-600" />
                <span className="text-sm font-medium text-watt-navy">Network Architecture</span>
              </TabsTrigger>
              <TabsTrigger
                value="security"
                className="flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all data-[state=active]:border-indigo-500 data-[state=active]:bg-indigo-50 border-watt-navy/10 bg-white hover:border-indigo-300"
              >
                <Shield className="w-6 h-6 text-indigo-600" />
                <span className="text-sm font-medium text-watt-navy">Physical Security</span>
              </TabsTrigger>
              <TabsTrigger
                value="management"
                className="flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all data-[state=active]:border-indigo-500 data-[state=active]:bg-indigo-50 border-watt-navy/10 bg-white hover:border-indigo-300"
              >
                <Monitor className="w-6 h-6 text-indigo-600" />
                <span className="text-sm font-medium text-watt-navy">Management Platform</span>
              </TabsTrigger>
            </TabsList>
          </ScrollReveal>

          {/* Network Architecture Tab */}
          <TabsContent value="network" className="mt-0">
            <ScrollReveal>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                {/* Network Topology Diagram */}
                <Card className="border-watt-navy/10">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold text-watt-navy mb-6">Network Topology</h3>
                    <div className="relative bg-slate-50 rounded-xl p-6">
                      {/* Internet */}
                      <div className="flex justify-center mb-4">
                        <div className="flex items-center gap-4">
                          <div className="px-4 py-2 rounded-lg bg-blue-500 text-white text-sm font-medium flex items-center gap-2">
                            <Globe className="w-4 h-4" />
                            ISP A
                          </div>
                          <div className="px-4 py-2 rounded-lg bg-blue-500 text-white text-sm font-medium flex items-center gap-2">
                            <Globe className="w-4 h-4" />
                            ISP B
                          </div>
                        </div>
                      </div>

                      {/* Core Layer */}
                      <div className="flex justify-center mb-4">
                        <div className="w-1 h-6 bg-gray-400" />
                      </div>
                      <div className="flex justify-center mb-4">
                        <div className="px-6 py-3 rounded-lg bg-gradient-to-r from-red-500 to-orange-500 text-white font-medium">
                          Core Routers (HA Pair)
                        </div>
                      </div>

                      {/* Aggregation Layer */}
                      <div className="flex justify-center mb-4">
                        <div className="w-1 h-6 bg-gray-400" />
                      </div>
                      <div className="flex justify-center gap-4 mb-4">
                        {['Switch A', 'Switch B', 'Switch C', 'Switch D'].map((sw, i) => (
                          <div key={i} className="px-3 py-2 rounded bg-gradient-to-r from-orange-500 to-yellow-500 text-white text-sm">
                            {sw}
                          </div>
                        ))}
                      </div>

                      {/* Access Layer */}
                      <div className="flex justify-center mb-4">
                        <div className="flex gap-8">
                          {[...Array(4)].map((_, i) => (
                            <div key={i} className="w-1 h-4 bg-gray-300" />
                          ))}
                        </div>
                      </div>
                      <div className="flex justify-center gap-2 flex-wrap">
                        {[...Array(16)].map((_, i) => (
                          <div key={i} className="w-10 h-8 rounded bg-gradient-to-b from-green-500 to-emerald-500 flex items-center justify-center">
                            <Server className="w-4 h-4 text-white" />
                          </div>
                        ))}
                      </div>

                      <div className="mt-4 text-center text-xs text-watt-navy/60">
                        Each container = 1 subnet (e.g., 10.1.x.0/24)
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Network Layers */}
                <div className="space-y-4">
                  {networkLayers.map((layer, index) => (
                    <Card key={index} className="border-watt-navy/10">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-4">
                          <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${layer.color} flex items-center justify-center flex-shrink-0`}>
                            <Wifi className="w-6 h-6 text-white" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <h4 className="font-semibold text-watt-navy">{layer.name}</h4>
                              <span className="text-sm font-mono text-blue-600">{layer.bandwidth}</span>
                            </div>
                            <p className="text-sm text-watt-navy/60 mb-2">{layer.description}</p>
                            <div className="flex flex-wrap gap-1">
                              {layer.equipment.map((eq, i) => (
                                <span key={i} className="text-xs px-2 py-0.5 rounded bg-watt-navy/5 text-watt-navy/70">
                                  {eq}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Bandwidth Calculator */}
              <Card className="border-watt-navy/10">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-watt-navy mb-4">Bandwidth Requirements</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-watt-navy/10">
                          <th className="text-left py-3 px-4 font-semibold text-watt-navy">Miner Count</th>
                          <th className="text-center py-3 px-4 font-semibold text-watt-navy">Minimum Bandwidth</th>
                          <th className="text-center py-3 px-4 font-semibold text-watt-navy">Max Latency to Pool</th>
                        </tr>
                      </thead>
                      <tbody>
                        {bandwidthRequirements.map((req, i) => (
                          <tr key={i} className="border-b border-watt-navy/5 last:border-0">
                            <td className="py-3 px-4 font-medium text-watt-navy">{req.miners.toLocaleString()} miners</td>
                            <td className="py-3 px-4 text-center text-blue-600 font-mono">{req.bandwidth}</td>
                            <td className="py-3 px-4 text-center text-green-600 font-mono">{req.latency}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <p className="text-xs text-watt-navy/60 mt-4">
                    * Bandwidth calculated at ~10 Kbps per miner for Stratum protocol. Dual ISP recommended for redundancy.
                  </p>
                </CardContent>
              </Card>
            </ScrollReveal>
          </TabsContent>

          {/* Physical Security Tab */}
          <TabsContent value="security" className="mt-0">
            <ScrollReveal>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {securitySystems.map((system, index) => (
                  <Card key={index} className="border-watt-navy/10">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
                          <system.icon className="w-5 h-5 text-white" />
                        </div>
                        <h3 className="text-lg font-semibold text-watt-navy">{system.category}</h3>
                      </div>
                      <div className="space-y-3">
                        {system.items.map((item, i) => (
                          <div key={i} className="p-3 rounded-lg bg-watt-navy/5">
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-medium text-watt-navy text-sm">{item.name}</span>
                              <span className={`text-xs px-2 py-0.5 rounded-full ${
                                item.priority === 'Critical' ? 'bg-red-100 text-red-700' :
                                item.priority === 'High' ? 'bg-orange-100 text-orange-700' :
                                'bg-blue-100 text-blue-700'
                              }`}>
                                {item.priority}
                              </span>
                            </div>
                            <p className="text-xs text-watt-navy/60">{item.description}</p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Security Zone Diagram */}
              <Card className="border-watt-navy/10 mt-8">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-watt-navy mb-6 text-center">Security Zones</h3>
                  <div className="relative max-w-2xl mx-auto">
                    {/* Outer zone */}
                    <div className="border-4 border-dashed border-red-300 rounded-3xl p-6 bg-red-50/50">
                      <div className="text-xs text-red-600 font-semibold mb-2">ZONE 1: Perimeter</div>
                      {/* Middle zone */}
                      <div className="border-4 border-dashed border-orange-300 rounded-2xl p-6 bg-orange-50/50">
                        <div className="text-xs text-orange-600 font-semibold mb-2">ZONE 2: Facility Grounds</div>
                        {/* Inner zone */}
                        <div className="border-4 border-dashed border-green-300 rounded-xl p-6 bg-green-50/50">
                          <div className="text-xs text-green-600 font-semibold mb-2">ZONE 3: Operations Area</div>
                          <div className="grid grid-cols-3 gap-2">
                            {[...Array(6)].map((_, i) => (
                              <div key={i} className="h-8 bg-gradient-to-b from-blue-500 to-blue-600 rounded flex items-center justify-center">
                                <Server className="w-4 h-4 text-white" />
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Legend */}
                    <div className="flex justify-center gap-6 mt-4 text-xs">
                      <span className="flex items-center gap-1">
                        <div className="w-4 h-4 border-2 border-dashed border-red-300 rounded" />
                        Electronic Fence
                      </span>
                      <span className="flex items-center gap-1">
                        <div className="w-4 h-4 border-2 border-dashed border-orange-300 rounded" />
                        CCTV Coverage
                      </span>
                      <span className="flex items-center gap-1">
                        <div className="w-4 h-4 border-2 border-dashed border-green-300 rounded" />
                        Biometric Access
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </ScrollReveal>
          </TabsContent>

          {/* Management Platform Tab */}
          <TabsContent value="management" className="mt-0">
            <ScrollReveal>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card className="border-watt-navy/10">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center">
                        <Monitor className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-watt-navy">{managementPlatform.name}</h3>
                        <p className="text-sm text-watt-navy/60">Centralized farm management system</p>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      {managementPlatform.features.map((feature, i) => (
                        <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-watt-navy/5">
                          <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                          <div>
                            <span className="font-medium text-watt-navy text-sm">{feature.name}</span>
                            <p className="text-xs text-watt-navy/60">{feature.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Dashboard Preview */}
                <Card className="border-watt-navy/10 overflow-hidden">
                  <CardContent className="p-0">
                    <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-6 text-white">
                      <h4 className="font-semibold mb-4 flex items-center gap-2">
                        <Monitor className="w-4 h-4" />
                        Dashboard Preview
                      </h4>
                      
                      {/* Mock Dashboard */}
                      <div className="space-y-4">
                        <div className="grid grid-cols-4 gap-2">
                          {[
                            { label: 'Total Hashrate', value: '2.5 EH/s', color: 'text-green-400' },
                            { label: 'Active Miners', value: '16,420', color: 'text-blue-400' },
                            { label: 'Avg Temp', value: '62°C', color: 'text-yellow-400' },
                            { label: 'Power Draw', value: '98.2 MW', color: 'text-purple-400' }
                          ].map((stat, i) => (
                            <div key={i} className="p-2 rounded bg-white/10 text-center">
                              <span className="text-xs text-white/60 block">{stat.label}</span>
                              <span className={`text-sm font-bold ${stat.color}`}>{stat.value}</span>
                            </div>
                          ))}
                        </div>

                        <div className="p-3 rounded bg-white/10">
                          <div className="text-xs text-white/60 mb-2">Miner Status</div>
                          <div className="flex gap-1 h-4">
                            <div className="flex-[95] bg-green-500 rounded-l" title="Online" />
                            <div className="flex-[3] bg-yellow-500" title="Warning" />
                            <div className="flex-[2] bg-red-500 rounded-r" title="Offline" />
                          </div>
                          <div className="flex justify-between text-xs mt-1 text-white/60">
                            <span>95% Online</span>
                            <span>3% Warning</span>
                            <span>2% Offline</span>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div className="p-2 rounded bg-green-500/20 border border-green-500/30">
                            <span className="text-xs text-green-300">Pool Connection</span>
                            <span className="text-sm font-semibold block text-green-400">Active ✓</span>
                          </div>
                          <div className="p-2 rounded bg-blue-500/20 border border-blue-500/30">
                            <span className="text-xs text-blue-300">Network Latency</span>
                            <span className="text-sm font-semibold block text-blue-400">24ms</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Alert Configuration */}
              <Card className="border-watt-navy/10 mt-8 bg-gradient-to-br from-amber-50 to-orange-50">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center flex-shrink-0">
                      <AlertTriangle className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-watt-navy mb-2">Recommended Alert Thresholds</h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                        {[
                          { metric: 'Chip Temp', warning: '> 85°C', critical: '> 95°C' },
                          { metric: 'Hashrate Drop', warning: '> 5%', critical: '> 15%' },
                          { metric: 'Power Deviation', warning: '> 10%', critical: '> 20%' },
                          { metric: 'Network Latency', warning: '> 100ms', critical: '> 500ms' }
                        ].map((alert, i) => (
                          <div key={i} className="p-3 rounded-lg bg-white">
                            <span className="text-xs text-watt-navy/60 block mb-1">{alert.metric}</span>
                            <div className="flex gap-2">
                              <span className="text-xs px-1.5 py-0.5 rounded bg-yellow-100 text-yellow-700">{alert.warning}</span>
                              <span className="text-xs px-1.5 py-0.5 rounded bg-red-100 text-red-700">{alert.critical}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </ScrollReveal>
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
};

export default HydroNetworkSecuritySection;
