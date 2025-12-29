import { useState } from 'react';
import { Network, Server, Globe, Radio, Layers, Shield, Zap, Users, Clock, Database, ArrowRight, Check, AlertTriangle } from 'lucide-react';
import { ScrollReveal } from '@/components/landing/ScrollAnimations';
import LearningObjectives from '@/components/academy/LearningObjectives';
import SectionSummary from '@/components/academy/SectionSummary';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const NetworkArchitectureSection = () => {
  const [selectedNodeType, setSelectedNodeType] = useState('full');

  const learningObjectives = [
    "Understand the different types of Bitcoin nodes and their roles",
    "Learn how peer discovery and connection management works",
    "Explore block propagation mechanisms and optimizations",
    "Analyze network health metrics and decentralization",
    "Understand SPV (Simplified Payment Verification) for light clients",
    "Recognize the importance of running your own node"
  ];

  const nodeTypes = [
    {
      id: 'full',
      name: 'Full Node',
      icon: Server,
      description: 'Downloads and validates the entire blockchain, enforces all consensus rules',
      storage: '~600 GB',
      bandwidth: '~200 GB/month',
      features: [
        'Complete transaction validation',
        'Independent consensus verification',
        'Privacy (no need to trust third parties)',
        'Supports network decentralization',
        'Can run over Tor for anonymity'
      ],
      examples: ['Bitcoin Core', 'Bitcoin Knots', 'btcd', 'libbitcoin']
    },
    {
      id: 'archival',
      name: 'Archival Node',
      icon: Database,
      description: 'Full node that stores complete blockchain history without pruning',
      storage: '~600 GB+',
      bandwidth: '~300 GB/month',
      features: [
        'All full node capabilities',
        'Can serve historical blocks to peers',
        'Supports blockchain explorers',
        'Essential for initial sync of new nodes',
        'Higher resource requirements'
      ],
      examples: ['Bitcoin Core (default)', 'Electrum Server']
    },
    {
      id: 'pruned',
      name: 'Pruned Node',
      icon: Layers,
      description: 'Full node that discards old block data after validation',
      storage: '~10-50 GB',
      bandwidth: '~200 GB/month',
      features: [
        'Full validation of all blocks',
        'Reduced storage requirements',
        'Cannot serve historical blocks',
        'Good for resource-constrained devices',
        'Maintains full security model'
      ],
      examples: ['Bitcoin Core (with -prune flag)']
    },
    {
      id: 'mining',
      name: 'Mining Node',
      icon: Zap,
      description: 'Full node connected to mining hardware, constructs and submits blocks',
      storage: '~600 GB',
      bandwidth: 'Very high',
      features: [
        'Block template construction',
        'Transaction selection for blocks',
        'Direct block submission to network',
        'Pool coordination (stratum protocol)',
        'Mempool policy enforcement'
      ],
      examples: ['Bitcoin Core + Mining Software', 'Pool Software']
    },
    {
      id: 'spv',
      name: 'SPV/Light Client',
      icon: Radio,
      description: 'Downloads only block headers, relies on full nodes for transaction data',
      storage: '~100 MB',
      bandwidth: 'Minimal',
      features: [
        'Fast sync (minutes vs days)',
        'Minimal resource usage',
        'Merkle proof verification',
        'Privacy tradeoffs (bloom filters)',
        'Trust assumptions on full nodes'
      ],
      examples: ['Electrum', 'BlueWallet', 'Sparrow (in SPV mode)']
    }
  ];

  const peerDiscoveryMethods = [
    { method: 'DNS Seeds', description: 'Hardcoded domain names that return lists of known nodes', example: 'seed.bitcoin.sipa.be' },
    { method: 'Peer Exchange', description: 'Connected peers share addresses of other known nodes', example: 'addr / getaddr messages' },
    { method: 'Hardcoded Seeds', description: 'IP addresses compiled into client as fallback', example: 'Last resort if DNS fails' },
    { method: 'Manual Configuration', description: 'User-specified nodes via config file or CLI', example: '-addnode=1.2.3.4:8333' }
  ];

  const messageTypes = [
    { category: 'Connection', messages: ['version', 'verack', 'ping', 'pong'], description: 'Establish and maintain connections' },
    { category: 'Address', messages: ['addr', 'getaddr', 'addrv2'], description: 'Share known peer addresses' },
    { category: 'Inventory', messages: ['inv', 'getdata', 'notfound'], description: 'Announce and request data' },
    { category: 'Blocks', messages: ['block', 'getblocks', 'getheaders', 'headers'], description: 'Block synchronization' },
    { category: 'Transactions', messages: ['tx', 'mempool', 'feefilter'], description: 'Transaction relay' },
    { category: 'Compact Blocks', messages: ['cmpctblock', 'getblocktxn', 'blocktxn'], description: 'Efficient block relay (BIP 152)' }
  ];

  const propagationSteps = [
    { step: 1, title: 'Miner Finds Block', description: "Miner's node validates the new block locally", time: '0ms' },
    { step: 2, title: 'Compact Block Relay', description: 'Send block header + short transaction IDs (BIP 152)', time: '~50ms' },
    { step: 3, title: 'Peer Validation', description: 'Receiving nodes validate header and request missing txs', time: '~100ms' },
    { step: 4, title: 'Full Block Assembly', description: 'Node reconstructs full block from mempool + missing txs', time: '~200ms' },
    { step: 5, title: 'Block Validation', description: 'Complete validation of all transactions and consensus rules', time: '~500ms' },
    { step: 6, title: 'Relay to Peers', description: 'Node announces block to its peers via inv message', time: '~750ms' },
    { step: 7, title: 'Network Saturation', description: 'Block reaches >90% of network', time: '~2-5 seconds' }
  ];

  const networkStats = [
    { label: 'Reachable Nodes', value: '~17,000', description: 'Full nodes accepting connections' },
    { label: 'Estimated Total Nodes', value: '~50,000+', description: 'Including nodes behind NAT/firewalls' },
    { label: 'Countries', value: '100+', description: 'Global geographic distribution' },
    { label: 'Average Connections', value: '8-125', description: 'Outbound to max inbound' },
    { label: 'Block Propagation', value: '~2 seconds', description: '90% network coverage' },
    { label: 'Network Protocol', value: 'P70016', description: 'Current version (Taproot support)' }
  ];

  const selectedNode = nodeTypes.find(n => n.id === selectedNodeType) || nodeTypes[0];
  const NodeIcon = selectedNode.icon;

  return (
    <section id="network" className="py-16 md:py-24 bg-gradient-to-b from-background to-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 text-green-600 dark:text-green-400 text-sm font-medium mb-4">
              <Network className="w-4 h-4" />
              Advanced Module
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Network Architecture
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Explore Bitcoin's peer-to-peer network infrastructure — the decentralized web of nodes 
              that validates transactions, propagates blocks, and maintains consensus without central coordination.
            </p>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={50}>
          <LearningObjectives 
            objectives={learningObjectives}
            estimatedTime="35-45 minutes"
            prerequisites={[
              { title: "How Bitcoin Works", href: "#how-it-works" },
              { title: "Consensus & Game Theory", href: "#consensus" }
            ]}
          />
        </ScrollReveal>

        {/* Network Statistics Overview */}
        <ScrollReveal delay={100}>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
            {networkStats.map((stat, index) => (
              <div key={index} className="bg-card rounded-lg p-4 border border-border text-center">
                <p className="text-2xl font-bold text-primary">{stat.value}</p>
                <p className="text-sm font-medium text-foreground">{stat.label}</p>
                <p className="text-xs text-muted-foreground">{stat.description}</p>
              </div>
            ))}
          </div>
        </ScrollReveal>

        {/* Node Types Section */}
        <ScrollReveal delay={150}>
          <Card className="mb-8 border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Server className="w-5 h-5 text-primary" />
                Bitcoin Node Types
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2 mb-6">
                {nodeTypes.map((node) => {
                  const Icon = node.icon;
                  return (
                    <button
                      key={node.id}
                      onClick={() => setSelectedNodeType(node.id)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all ${
                        selectedNodeType === node.id
                          ? 'bg-primary text-primary-foreground border-primary'
                          : 'bg-card border-border hover:border-primary/50'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      {node.name}
                    </button>
                  );
                })}
              </div>

              <div className="bg-gradient-to-r from-primary/5 to-primary/10 rounded-xl p-6 border border-primary/20">
                <div className="flex items-start gap-4 mb-4">
                  <div className="p-3 rounded-lg bg-primary/20">
                    <NodeIcon className="w-8 h-8 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-foreground">{selectedNode.name}</h3>
                    <p className="text-muted-foreground">{selectedNode.description}</p>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-foreground mb-3">Requirements</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between bg-background/50 rounded p-2">
                        <span className="text-sm text-muted-foreground">Storage</span>
                        <span className="text-sm font-mono text-foreground">{selectedNode.storage}</span>
                      </div>
                      <div className="flex justify-between bg-background/50 rounded p-2">
                        <span className="text-sm text-muted-foreground">Bandwidth</span>
                        <span className="text-sm font-mono text-foreground">{selectedNode.bandwidth}</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium text-foreground mb-3">Features</h4>
                    <ul className="space-y-1">
                      {selectedNode.features.map((feature, i) => (
                        <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Check className="w-4 h-4 text-green-500" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-primary/20">
                  <p className="text-sm text-muted-foreground">
                    <strong className="text-foreground">Examples:</strong> {selectedNode.examples.join(', ')}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </ScrollReveal>

        {/* Peer Discovery */}
        <ScrollReveal delay={200}>
          <Card className="mb-8 border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-primary" />
                Peer Discovery & Connection
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-muted/50 rounded-lg p-4 border border-border">
                <p className="text-sm text-muted-foreground">
                  When a new node joins the network, it must discover peers to connect to. Bitcoin uses 
                  multiple methods to ensure nodes can always find the network, even if some methods fail.
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                {peerDiscoveryMethods.map((method, index) => (
                  <div key={index} className="bg-card rounded-lg p-4 border border-border">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">
                        {index + 1}
                      </div>
                      <h4 className="font-medium text-foreground">{method.method}</h4>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{method.description}</p>
                    <code className="text-xs bg-muted px-2 py-1 rounded text-primary">{method.example}</code>
                  </div>
                ))}
              </div>

              {/* Connection Flow */}
              <div className="bg-gradient-to-r from-blue-500/5 to-green-500/5 rounded-xl p-6 border border-blue-500/20">
                <h4 className="font-semibold text-foreground mb-4">Connection Handshake</h4>
                <div className="flex items-center justify-between overflow-x-auto pb-2">
                  <div className="text-center px-4 flex-shrink-0">
                    <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center mx-auto mb-2">
                      <Server className="w-6 h-6 text-blue-500" />
                    </div>
                    <p className="text-sm font-medium">Your Node</p>
                  </div>
                  <div className="flex-1 min-w-[100px]">
                    <ArrowRight className="w-full h-4 text-blue-500" />
                    <p className="text-xs text-center text-muted-foreground">version</p>
                  </div>
                  <div className="text-center px-4 flex-shrink-0">
                    <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-2">
                      <Server className="w-6 h-6 text-green-500" />
                    </div>
                    <p className="text-sm font-medium">Peer Node</p>
                  </div>
                </div>
                <div className="flex items-center justify-between overflow-x-auto pb-2 mt-2">
                  <div className="text-center px-4 flex-shrink-0 w-20"></div>
                  <div className="flex-1 min-w-[100px] transform rotate-180">
                    <ArrowRight className="w-full h-4 text-green-500" />
                    <p className="text-xs text-center text-muted-foreground transform rotate-180">version</p>
                  </div>
                  <div className="text-center px-4 flex-shrink-0 w-20"></div>
                </div>
                <div className="text-center text-sm text-muted-foreground mt-2">
                  <span className="text-blue-500">verack</span> ⟷ <span className="text-green-500">verack</span> → Connection established!
                </div>
              </div>
            </CardContent>
          </Card>
        </ScrollReveal>

        {/* Message Types */}
        <ScrollReveal delay={250}>
          <Card className="mb-8 border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Radio className="w-5 h-5 text-primary" />
                Network Protocol Messages
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {messageTypes.map((category, index) => (
                  <div key={index} className="bg-card rounded-lg p-4 border border-border">
                    <h4 className="font-medium text-foreground mb-2">{category.category}</h4>
                    <p className="text-xs text-muted-foreground mb-3">{category.description}</p>
                    <div className="flex flex-wrap gap-1">
                      {category.messages.map((msg, i) => (
                        <code key={i} className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">
                          {msg}
                        </code>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </ScrollReveal>

        {/* Block Propagation */}
        <ScrollReveal delay={300}>
          <Card className="mb-8 border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-amber-500" />
                Block Propagation
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-muted/50 rounded-lg p-4 border border-border">
                <p className="text-sm text-muted-foreground">
                  Fast block propagation is critical for network health. <strong className="text-foreground">Compact Blocks (BIP 152)</strong> 
                  reduced propagation time by 90% by sending short transaction IDs instead of full transactions, 
                  since most transactions are already in the receiving node's mempool.
                </p>
              </div>

              <div className="relative">
                {propagationSteps.map((step, index) => (
                  <div key={index} className="flex items-start gap-4 mb-4 last:mb-0">
                    <div className="flex flex-col items-center">
                      <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                        {step.step}
                      </div>
                      {index < propagationSteps.length - 1 && (
                        <div className="w-0.5 h-8 bg-primary/30 my-1"></div>
                      )}
                    </div>
                    <div className="flex-1 pb-2">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-foreground">{step.title}</h4>
                        <span className="text-xs font-mono text-primary bg-primary/10 px-2 py-0.5 rounded">
                          {step.time}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">{step.description}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Comparison: Legacy vs Compact Blocks */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-red-500/10 rounded-lg p-4 border border-red-500/20">
                  <h4 className="font-medium text-red-600 dark:text-red-400 mb-2">Legacy Block Relay</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Full block transmission (~1-2 MB)</li>
                    <li>• Propagation: 10-30 seconds</li>
                    <li>• High bandwidth usage</li>
                    <li>• Redundant data transfer</li>
                  </ul>
                </div>
                <div className="bg-green-500/10 rounded-lg p-4 border border-green-500/20">
                  <h4 className="font-medium text-green-600 dark:text-green-400 mb-2">Compact Blocks (BIP 152)</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Header + short IDs (~20 KB)</li>
                    <li>• Propagation: 2-5 seconds</li>
                    <li>• 99% bandwidth reduction</li>
                    <li>• Reconstruct from mempool</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </ScrollReveal>

        {/* Why Run a Node */}
        <ScrollReveal delay={350}>
          <div className="bg-gradient-to-br from-primary/10 via-background to-green-500/10 rounded-2xl p-8 border border-primary/20 mb-8">
            <h3 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-3">
              <Shield className="w-6 h-6 text-primary" />
              Why Run Your Own Node?
            </h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-card rounded-lg p-5 border border-border">
                <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center mb-3">
                  <Shield className="w-5 h-5 text-green-500" />
                </div>
                <h4 className="font-medium text-foreground mb-2">Full Verification</h4>
                <p className="text-sm text-muted-foreground">
                  Validate every transaction yourself — don't trust, verify. Your node enforces consensus rules independently.
                </p>
              </div>
              <div className="bg-card rounded-lg p-5 border border-border">
                <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center mb-3">
                  <Users className="w-5 h-5 text-blue-500" />
                </div>
                <h4 className="font-medium text-foreground mb-2">Privacy</h4>
                <p className="text-sm text-muted-foreground">
                  No third party knows which addresses are yours. SPV wallets leak address information to servers.
                </p>
              </div>
              <div className="bg-card rounded-lg p-5 border border-border">
                <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center mb-3">
                  <Network className="w-5 h-5 text-purple-500" />
                </div>
                <h4 className="font-medium text-foreground mb-2">Network Health</h4>
                <p className="text-sm text-muted-foreground">
                  More nodes = more decentralization. You contribute to Bitcoin's censorship resistance.
                </p>
              </div>
              <div className="bg-card rounded-lg p-5 border border-border">
                <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center mb-3">
                  <Zap className="w-5 h-5 text-amber-500" />
                </div>
                <h4 className="font-medium text-foreground mb-2">Instant Verification</h4>
                <p className="text-sm text-muted-foreground">
                  Verify payments immediately without waiting for third-party confirmations or API rate limits.
                </p>
              </div>
              <div className="bg-card rounded-lg p-5 border border-border">
                <div className="w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center mb-3">
                  <AlertTriangle className="w-5 h-5 text-red-500" />
                </div>
                <h4 className="font-medium text-foreground mb-2">Resist Rule Changes</h4>
                <p className="text-sm text-muted-foreground">
                  Your node rejects invalid blocks. Miners can't force unwanted changes if nodes don't accept them.
                </p>
              </div>
              <div className="bg-card rounded-lg p-5 border border-border">
                <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center mb-3">
                  <Clock className="w-5 h-5 text-primary" />
                </div>
                <h4 className="font-medium text-foreground mb-2">Always Available</h4>
                <p className="text-sm text-muted-foreground">
                  No dependence on external services. Access Bitcoin even if popular providers go down.
                </p>
              </div>
            </div>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={400}>
          <SectionSummary
            takeaways={[
              "Full nodes download and validate the entire blockchain, enforcing all consensus rules independently",
              "Pruned nodes offer full security with reduced storage by discarding old block data after validation",
              "SPV/light clients trade security for convenience — they trust full nodes for transaction data",
              "Peer discovery uses DNS seeds, peer exchange, and hardcoded addresses for resilience",
              "Compact Blocks (BIP 152) reduced block propagation time by 90% through efficient encoding",
              "Running your own node ensures privacy, contributes to decentralization, and gives you sovereignty"
            ]}
            proTip="Consider running a pruned full node on a Raspberry Pi 4 — it provides full security with minimal resources (~10GB storage). Your wallet connected to your own node is the gold standard for Bitcoin self-sovereignty."
            nextSteps={[
              { title: "Bitcoin Scripting", href: "#scripting" },
              { title: "Lightning Network", href: "#lightning" }
            ]}
          />
        </ScrollReveal>
      </div>
    </section>
  );
};

export default NetworkArchitectureSection;
