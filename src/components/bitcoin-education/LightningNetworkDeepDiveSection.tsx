import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Zap, 
  ArrowRight, 
  Lock, 
  Unlock, 
  Clock, 
  DollarSign,
  Network,
  Shield,
  Eye,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  Users,
  Route,
  Layers
} from 'lucide-react';

export default function LightningNetworkDeepDiveSection() {
  const [activeChannel, setActiveChannel] = useState<'funding' | 'update' | 'close'>('funding');
  const [htlcStep, setHtlcStep] = useState(0);

  const channelLifecycle = {
    funding: {
      title: 'Channel Opening',
      description: 'Alice and Bob create a 2-of-2 multisig address and broadcast a funding transaction to the Bitcoin blockchain.',
      steps: [
        'Alice proposes channel with 0.1 BTC capacity',
        'Bob accepts and provides his public key',
        'They create 2-of-2 multisig: requires BOTH signatures',
        'Funding tx broadcasts to Bitcoin mainchain',
        'Wait for confirmations (typically 3-6)',
        'Channel is now open and ready for payments'
      ]
    },
    update: {
      title: 'State Updates (Off-Chain)',
      description: 'Payments happen instantly by exchanging signed commitment transactions. No blockchain interaction needed.',
      steps: [
        'Alice wants to pay Bob 0.01 BTC',
        'They create new commitment tx: Alice 0.09, Bob 0.01',
        'Both sign and exchange commitment transactions',
        'Old state is revoked (breach remedy keys exchanged)',
        'New balance: instant, free, private',
        'Can update thousands of times per second'
      ]
    },
    close: {
      title: 'Channel Closing',
      description: 'Cooperative close is instant and cheap. Force close requires timelock but ensures funds are never lost.',
      steps: [
        'Cooperative: Both agree on final balance',
        'Single closing tx broadcasts to chain',
        'Force close: One party broadcasts commitment',
        'Timelock (typically 144-2016 blocks) for dispute',
        'Funds return to respective parties',
        'Channel capacity returns to on-chain UTXOs'
      ]
    }
  };

  const htlcSteps = [
    {
      title: 'Hash Creation',
      description: 'Carol (recipient) generates a random preimage R and computes H = SHA256(R). She sends H to Alice.',
      visual: 'Carol: R = random → H = SHA256(R)'
    },
    {
      title: 'HTLC Lock (Alice → Bob)',
      description: 'Alice creates an HTLC with Bob: "Pay 1000 sats if you reveal preimage of H within 100 blocks, else refund to me."',
      visual: 'Alice locks 1000 sats → Bob (expires T₁)'
    },
    {
      title: 'HTLC Forward (Bob → Carol)',
      description: 'Bob creates HTLC with Carol using same hash H but shorter timelock: "Reveal preimage within 90 blocks."',
      visual: 'Bob locks 1000 sats → Carol (expires T₂ < T₁)'
    },
    {
      title: 'Preimage Reveal',
      description: 'Carol reveals R to Bob to claim her 1000 sats. Bob now knows R.',
      visual: 'Carol reveals R → Claims payment from Bob'
    },
    {
      title: 'Backward Resolution',
      description: 'Bob uses R to claim payment from Alice. The payment is now complete across the entire route.',
      visual: 'Bob reveals R to Alice → Claims payment'
    },
    {
      title: 'Atomic Completion',
      description: 'Either ALL hops succeed (everyone gets paid) or NONE do (everyone refunded). No trust required.',
      visual: '✓ Alice paid Carol through Bob atomically'
    }
  ];

  const routingMetrics = [
    { label: 'Base Fee', value: '1 sat', description: 'Fixed fee per forwarded payment' },
    { label: 'Fee Rate', value: '0.0001%', description: 'Proportional fee (1 sat per 1M sats)' },
    { label: 'CLTV Delta', value: '40 blocks', description: 'Timelock difference per hop' },
    { label: 'Min HTLC', value: '1000 msat', description: 'Minimum payment size accepted' }
  ];

  const liquidityStrategies = [
    {
      name: 'Loop Out',
      description: 'Send Lightning payment to receive on-chain. Increases inbound liquidity.',
      useCase: 'Merchants receiving more than sending'
    },
    {
      name: 'Loop In',
      description: 'Send on-chain to receive Lightning. Increases outbound liquidity.',
      useCase: 'Users who spend more than receive'
    },
    {
      name: 'Circular Rebalance',
      description: 'Pay yourself through other nodes to shift liquidity between your channels.',
      useCase: 'Routing nodes optimizing for fees'
    },
    {
      name: 'Dual-Funded Channels',
      description: 'Both parties contribute to channel capacity from the start.',
      useCase: 'New channels with immediate bi-directional capacity'
    }
  ];

  const securityConsiderations = [
    {
      threat: 'Channel Breach',
      description: 'Counterparty broadcasts old commitment transaction to steal funds',
      mitigation: 'Watchtowers monitor chain 24/7 and broadcast penalty tx if breach detected',
      severity: 'high'
    },
    {
      threat: 'Force Close Griefing',
      description: 'Malicious party forces close during high fee environment',
      mitigation: 'Anchor outputs allow fee bumping; choose partners carefully',
      severity: 'medium'
    },
    {
      threat: 'Routing Attacks',
      description: 'Probing to discover channel balances or jamming to block capacity',
      mitigation: 'Payment splitting, trampoline routing, reputation systems',
      severity: 'medium'
    },
    {
      threat: 'Eclipse Attack',
      description: 'Isolating node from network to manipulate blockchain view',
      mitigation: 'Multiple diverse peer connections, connect to trusted nodes',
      severity: 'high'
    }
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <Badge variant="outline" className="bg-yellow-500/10 text-yellow-400 border-yellow-500/30">
          <Zap className="w-3 h-3 mr-1" />
          Layer 2 Scaling
        </Badge>
        <h2 className="text-3xl sm:text-4xl font-bold text-foreground">
          Lightning Network Deep Dive
        </h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Bitcoin's Layer 2 payment protocol enabling instant, low-cost transactions 
          through a network of bidirectional payment channels.
        </p>
      </div>

      {/* Key Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Network Capacity', value: '~5,000 BTC', icon: Layers },
          { label: 'Active Channels', value: '~75,000', icon: Network },
          { label: 'Payment Speed', value: '<1 second', icon: Zap },
          { label: 'Typical Fee', value: '<1 sat', icon: DollarSign }
        ].map((stat, i) => (
          <Card key={i} className="bg-card/50 border-border/50">
            <CardContent className="p-4 text-center">
              <stat.icon className="w-6 h-6 mx-auto mb-2 text-yellow-400" />
              <div className="text-xl font-bold text-foreground">{stat.value}</div>
              <div className="text-xs text-muted-foreground">{stat.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Payment Channels Explained */}
      <Card className="bg-gradient-to-br from-yellow-500/5 to-orange-500/5 border-yellow-500/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="w-5 h-5 text-yellow-400" />
            Payment Channels: The Foundation
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-muted-foreground">
            A payment channel is a 2-of-2 multisig contract between two parties that allows 
            unlimited off-chain transactions. Only the opening and closing transactions are 
            recorded on the Bitcoin blockchain.
          </p>

          {/* Channel Lifecycle Tabs */}
          <div className="flex gap-2 flex-wrap">
            {(['funding', 'update', 'close'] as const).map((phase) => (
              <Button
                key={phase}
                variant={activeChannel === phase ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveChannel(phase)}
                className={activeChannel === phase ? 'bg-yellow-500 text-black' : ''}
              >
                {phase === 'funding' && <Lock className="w-4 h-4 mr-1" />}
                {phase === 'update' && <RefreshCw className="w-4 h-4 mr-1" />}
                {phase === 'close' && <Unlock className="w-4 h-4 mr-1" />}
                {channelLifecycle[phase].title}
              </Button>
            ))}
          </div>

          <div className="bg-background/50 rounded-lg p-6 border border-border/50">
            <h4 className="font-semibold text-lg mb-2">{channelLifecycle[activeChannel].title}</h4>
            <p className="text-muted-foreground mb-4">{channelLifecycle[activeChannel].description}</p>
            <div className="space-y-2">
              {channelLifecycle[activeChannel].steps.map((step, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-yellow-500/20 text-yellow-400 flex items-center justify-center text-sm font-mono flex-shrink-0">
                    {i + 1}
                  </div>
                  <span className="text-sm text-foreground">{step}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Commitment Transaction Visual */}
          <div className="bg-background/80 rounded-lg p-4 border border-border">
            <h5 className="font-medium mb-3 text-sm text-muted-foreground">Commitment Transaction Structure</h5>
            <div className="flex items-center justify-between gap-4 text-sm">
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-blue-500/20 flex items-center justify-center mb-2 mx-auto">
                  <Users className="w-8 h-8 text-blue-400" />
                </div>
                <div className="font-medium">Alice</div>
                <div className="text-xs text-muted-foreground">0.07 BTC</div>
              </div>
              <div className="flex-1 flex items-center">
                <div className="h-0.5 flex-1 bg-gradient-to-r from-blue-500 to-green-500" />
                <ArrowRight className="w-4 h-4 text-muted-foreground mx-1" />
                <div className="h-0.5 flex-1 bg-gradient-to-r from-green-500 to-green-500" />
              </div>
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mb-2 mx-auto">
                  <Users className="w-8 h-8 text-green-400" />
                </div>
                <div className="font-medium">Bob</div>
                <div className="text-xs text-muted-foreground">0.03 BTC</div>
              </div>
            </div>
            <div className="text-center mt-3 text-xs text-muted-foreground">
              Channel Capacity: 0.1 BTC | State #47 | Both signatures required to broadcast
            </div>
          </div>
        </CardContent>
      </Card>

      {/* HTLC Multi-Hop Payments */}
      <Card className="bg-gradient-to-br from-purple-500/5 to-pink-500/5 border-purple-500/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Route className="w-5 h-5 text-purple-400" />
            Hash Time-Locked Contracts (HTLCs)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-muted-foreground">
            HTLCs enable trustless multi-hop payments across nodes that don't have direct channels. 
            The cryptographic construction ensures atomicity: either the entire payment succeeds, or 
            it fails completely with no funds at risk.
          </p>

          {/* HTLC Animation */}
          <div className="bg-background/50 rounded-lg p-6 border border-border/50">
            <div className="flex justify-between items-center mb-4">
              <h4 className="font-semibold">Multi-Hop Payment: Alice → Bob → Carol</h4>
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => setHtlcStep(Math.max(0, htlcStep - 1))}
                  disabled={htlcStep === 0}
                >
                  Previous
                </Button>
                <Button 
                  size="sm"
                  onClick={() => setHtlcStep(Math.min(htlcSteps.length - 1, htlcStep + 1))}
                  disabled={htlcStep === htlcSteps.length - 1}
                  className="bg-purple-500 hover:bg-purple-600"
                >
                  Next
                </Button>
              </div>
            </div>

            {/* Progress */}
            <Progress value={(htlcStep + 1) / htlcSteps.length * 100} className="mb-4 h-2" />

            {/* Current Step */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-purple-500/10 text-purple-400">
                  Step {htlcStep + 1} of {htlcSteps.length}
                </Badge>
                <span className="font-medium">{htlcSteps[htlcStep].title}</span>
              </div>
              <p className="text-muted-foreground">{htlcSteps[htlcStep].description}</p>
              <div className="bg-background/80 rounded p-3 font-mono text-sm text-center border border-border">
                {htlcSteps[htlcStep].visual}
              </div>
            </div>

            {/* Node Visualization */}
            <div className="flex items-center justify-between mt-6 px-4">
              {['Alice', 'Bob', 'Carol'].map((name, i) => (
                <React.Fragment key={name}>
                  <div className="text-center">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-1 transition-colors ${
                      (htlcStep >= 1 && i <= htlcStep - 1) || (htlcStep >= 4 && i <= 5 - htlcStep)
                        ? 'bg-green-500/30 border-2 border-green-500'
                        : 'bg-muted border-2 border-border'
                    }`}>
                      <span className="font-bold">{name[0]}</span>
                    </div>
                    <span className="text-xs">{name}</span>
                  </div>
                  {i < 2 && (
                    <div className={`flex-1 h-1 mx-2 rounded transition-colors ${
                      htlcStep >= i + 2 ? 'bg-green-500' : 'bg-muted'
                    }`} />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* HTLC Properties */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-background/50 rounded-lg p-4 border border-border/50">
              <h5 className="font-medium mb-2 flex items-center gap-2">
                <Lock className="w-4 h-4 text-purple-400" />
                Hash Lock
              </h5>
              <p className="text-sm text-muted-foreground">
                Payment is locked by a hash H. Only someone who knows the preimage R 
                (where H = SHA256(R)) can claim the funds. This is the "Hash" in HTLC.
              </p>
            </div>
            <div className="bg-background/50 rounded-lg p-4 border border-border/50">
              <h5 className="font-medium mb-2 flex items-center gap-2">
                <Clock className="w-4 h-4 text-purple-400" />
                Time Lock
              </h5>
              <p className="text-sm text-muted-foreground">
                If the payment isn't claimed within the timelock, funds return to sender. 
                Each hop has a shorter timelock, ensuring backward resolution works.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Network Economics */}
      <Card className="bg-gradient-to-br from-green-500/5 to-emerald-500/5 border-green-500/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-green-400" />
            Network Economics & Liquidity
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Routing Fees */}
          <div>
            <h4 className="font-medium mb-3">Routing Fee Structure</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {routingMetrics.map((metric, i) => (
                <div key={i} className="bg-background/50 rounded-lg p-3 border border-border/50 text-center">
                  <div className="text-lg font-bold text-green-400">{metric.value}</div>
                  <div className="text-sm font-medium">{metric.label}</div>
                  <div className="text-xs text-muted-foreground mt-1">{metric.description}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Liquidity Management */}
          <div>
            <h4 className="font-medium mb-3">Liquidity Management Strategies</h4>
            <div className="grid md:grid-cols-2 gap-4">
              {liquidityStrategies.map((strategy, i) => (
                <div key={i} className="bg-background/50 rounded-lg p-4 border border-border/50">
                  <h5 className="font-medium text-green-400 mb-1">{strategy.name}</h5>
                  <p className="text-sm text-muted-foreground mb-2">{strategy.description}</p>
                  <Badge variant="outline" className="text-xs">
                    {strategy.useCase}
                  </Badge>
                </div>
              ))}
            </div>
          </div>

          {/* Inbound vs Outbound */}
          <div className="bg-background/80 rounded-lg p-4 border border-border">
            <h5 className="font-medium mb-3">Understanding Channel Liquidity</h5>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <div className="flex justify-between text-sm mb-1">
                  <span>Outbound (can send)</span>
                  <span>Inbound (can receive)</span>
                </div>
                <div className="h-4 rounded-full overflow-hidden flex">
                  <div className="bg-blue-500 w-[60%]" />
                  <div className="bg-green-500 w-[40%]" />
                </div>
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>0.06 BTC</span>
                  <span>0.04 BTC</span>
                </div>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-3">
              Total channel capacity is fixed. As you send, outbound decreases and inbound increases. 
              Merchants need inbound liquidity; spenders need outbound.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Security & Watchtowers */}
      <Card className="bg-gradient-to-br from-red-500/5 to-orange-500/5 border-red-500/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-red-400" />
            Security Model & Watchtowers
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-muted-foreground">
            Lightning's security relies on monitoring the blockchain for fraud. If you can't be 
            online 24/7, watchtowers provide this service, watching for breach attempts and 
            broadcasting penalty transactions on your behalf.
          </p>

          {/* Security Threats */}
          <div className="space-y-3">
            {securityConsiderations.map((item, i) => (
              <div 
                key={i} 
                className={`bg-background/50 rounded-lg p-4 border ${
                  item.severity === 'high' 
                    ? 'border-red-500/30' 
                    : 'border-yellow-500/30'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <AlertTriangle className={`w-4 h-4 ${
                        item.severity === 'high' ? 'text-red-400' : 'text-yellow-400'
                      }`} />
                      <h5 className="font-medium">{item.threat}</h5>
                      <Badge variant="outline" className={`text-xs ${
                        item.severity === 'high' 
                          ? 'bg-red-500/10 text-red-400 border-red-500/30' 
                          : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30'
                      }`}>
                        {item.severity}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{item.description}</p>
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle2 className="w-4 h-4 text-green-400" />
                      <span className="text-green-400">Mitigation:</span>
                      <span className="text-muted-foreground">{item.mitigation}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Watchtower Diagram */}
          <div className="bg-background/80 rounded-lg p-4 border border-border">
            <h5 className="font-medium mb-3 flex items-center gap-2">
              <Eye className="w-4 h-4 text-blue-400" />
              How Watchtowers Work
            </h5>
            <div className="grid md:grid-cols-3 gap-4 text-sm">
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center mx-auto mb-2">
                  <Users className="w-6 h-6 text-blue-400" />
                </div>
                <div className="font-medium">You</div>
                <p className="text-xs text-muted-foreground">
                  Send encrypted breach data to watchtower after each state update
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center mx-auto mb-2">
                  <Eye className="w-6 h-6 text-purple-400" />
                </div>
                <div className="font-medium">Watchtower</div>
                <p className="text-xs text-muted-foreground">
                  Monitors blockchain 24/7. Cannot read your data until breach occurs.
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-2">
                  <Shield className="w-6 h-6 text-green-400" />
                </div>
                <div className="font-medium">Protection</div>
                <p className="text-xs text-muted-foreground">
                  On breach detection, decrypts and broadcasts penalty transaction
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Takeaways */}
      <Card className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border-yellow-500/30">
        <CardContent className="p-6">
          <h4 className="font-bold text-lg mb-4 flex items-center gap-2">
            <Zap className="w-5 h-5 text-yellow-400" />
            Lightning Network Key Takeaways
          </h4>
          <div className="grid md:grid-cols-2 gap-4">
            {[
              'Payment channels use 2-of-2 multisig for trustless updates',
              'HTLCs enable atomic multi-hop payments without trust',
              'Timelocks ensure funds can always be recovered',
              'Watchtowers provide 24/7 breach monitoring',
              'Routing fees are typically sub-satoshi',
              'Liquidity management is key for routing nodes',
              'Force close is always possible but expensive',
              'Privacy is better than on-chain but not perfect'
            ].map((point, i) => (
              <div key={i} className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                <span className="text-sm">{point}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
