import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Eye, 
  EyeOff, 
  Shield, 
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Link,
  Unlink,
  Users,
  Search,
  Shuffle,
  Lock,
  Fingerprint,
  Globe,
  Server,
  Zap
} from 'lucide-react';

export default function BitcoinPrivacySection() {
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});

  const toggleCheck = (id: string) => {
    setCheckedItems(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const privacyModel = [
    {
      aspect: 'Addresses',
      status: 'pseudonymous',
      description: 'Addresses are random strings, not names. But they can be linked to identities through various means.',
      implication: 'Anyone can see all transactions to/from an address once they know it belongs to you.'
    },
    {
      aspect: 'Transactions',
      status: 'public',
      description: 'All transactions are permanently recorded on the public blockchain.',
      implication: 'Your entire financial history is visible to anyone with blockchain analysis tools.'
    },
    {
      aspect: 'Amounts',
      status: 'public',
      description: 'Transaction amounts are visible in plaintext (unlike Monero or Zcash).',
      implication: 'Attackers can identify high-value targets by analyzing transaction patterns.'
    },
    {
      aspect: 'IP Address',
      status: 'exposed',
      description: 'When you broadcast a transaction, your IP is visible to connected nodes.',
      implication: 'Without Tor/VPN, your physical location can be correlated with transactions.'
    }
  ];

  const chainAnalysisTechniques = [
    {
      name: 'Common Input Ownership',
      description: 'Assumes all inputs to a transaction belong to the same entity',
      effectiveness: 'Very effective for non-privacy-conscious users',
      countermeasure: 'CoinJoin, PayJoin, coin control'
    },
    {
      name: 'Change Detection',
      description: 'Identifies which output is change based on round numbers, address reuse',
      effectiveness: 'Effective against naive users',
      countermeasure: 'Avoid round numbers, never reuse addresses'
    },
    {
      name: 'Temporal Analysis',
      description: 'Correlates transaction timing with known activities',
      effectiveness: 'Moderate - requires additional data',
      countermeasure: 'Delay broadcasts, use scheduled sends'
    },
    {
      name: 'Address Clustering',
      description: 'Groups addresses belonging to the same wallet/entity',
      effectiveness: 'Very effective with exchange data',
      countermeasure: 'Use separate wallets for different purposes'
    },
    {
      name: 'Dust Attacks',
      description: 'Send tiny amounts to addresses, track when consolidated',
      effectiveness: 'Reveals address clustering',
      countermeasure: 'Never spend dust, use coin control'
    }
  ];

  const privacyTechniques = [
    {
      name: 'CoinJoin',
      description: 'Multiple users combine their transactions into one large transaction, making it difficult to determine which inputs correspond to which outputs.',
      implementations: ['Wasabi Wallet', 'JoinMarket', 'Whirlpool (Samourai)'],
      tradeoffs: 'Higher fees, coordination required, some implementations have minimum amounts',
      effectiveness: 'high'
    },
    {
      name: 'PayJoin (P2EP)',
      description: 'Sender and receiver both contribute inputs to a payment, breaking the common input ownership heuristic.',
      implementations: ['BTCPay Server', 'Sparrow Wallet'],
      tradeoffs: 'Requires receiver cooperation, limited wallet support',
      effectiveness: 'high'
    },
    {
      name: 'Coin Control',
      description: 'Manually select which UTXOs to spend, avoiding linking different coin sources.',
      implementations: ['Most desktop wallets', 'Sparrow', 'Electrum'],
      tradeoffs: 'Requires user knowledge, can lead to dust accumulation',
      effectiveness: 'medium'
    },
    {
      name: 'Running a Full Node',
      description: 'Verify transactions locally without querying third-party servers that log your addresses.',
      implementations: ['Bitcoin Core', 'Umbrel', 'RaspiBlitz'],
      tradeoffs: 'Requires storage (~500GB), bandwidth, technical setup',
      effectiveness: 'high'
    },
    {
      name: 'Tor/VPN for Broadcasting',
      description: 'Hide your IP address when broadcasting transactions to the network.',
      implementations: ['Tor integration in most privacy wallets'],
      tradeoffs: 'Slower, potential reliability issues',
      effectiveness: 'high'
    }
  ];

  const bestPractices = [
    {
      id: 'never-reuse',
      practice: 'Never reuse addresses',
      reason: 'Address reuse is the #1 privacy leak. It links all your transactions together.',
      difficulty: 'Easy'
    },
    {
      id: 'own-node',
      practice: 'Run your own full node',
      reason: 'SPV wallets leak your addresses to random nodes. Full nodes verify everything locally.',
      difficulty: 'Medium'
    },
    {
      id: 'use-tor',
      practice: 'Use Tor for all Bitcoin activity',
      reason: 'Prevents IP correlation with your transactions.',
      difficulty: 'Easy'
    },
    {
      id: 'label-utxos',
      practice: 'Label all UTXOs with their source',
      reason: 'Helps you avoid mixing coins from different contexts (work, personal, etc.)',
      difficulty: 'Easy'
    },
    {
      id: 'coin-control',
      practice: 'Use coin control for every transaction',
      reason: 'Prevents accidentally linking unrelated UTXOs.',
      difficulty: 'Medium'
    },
    {
      id: 'avoid-consolidation',
      practice: 'Avoid consolidating small UTXOs',
      reason: 'Consolidation links addresses and reveals total holdings.',
      difficulty: 'Easy'
    },
    {
      id: 'coinjoin-regularly',
      practice: 'CoinJoin before significant spending',
      reason: 'Breaks transaction history for privacy-critical payments.',
      difficulty: 'Medium'
    },
    {
      id: 'separate-wallets',
      practice: 'Use separate wallets for different purposes',
      reason: 'Compartmentalizes your financial activity.',
      difficulty: 'Easy'
    },
    {
      id: 'avoid-kyc',
      practice: 'Minimize KYC exchange usage',
      reason: 'KYC links your identity to specific UTXOs permanently.',
      difficulty: 'Hard'
    },
    {
      id: 'check-receivers',
      practice: 'Verify receiver addresses out-of-band',
      reason: 'Prevents address replacement attacks.',
      difficulty: 'Easy'
    }
  ];

  const futureImprovements = [
    {
      name: 'Taproot Privacy Benefits',
      status: 'Active (2021)',
      description: 'All Taproot outputs look identical (P2TR). Complex scripts are indistinguishable from simple payments when cooperation path is used.',
      impact: 'Reduces fingerprinting of multisig, timelocks, and Lightning closes.'
    },
    {
      name: 'Silent Payments',
      status: 'Proposed (BIP-352)',
      description: 'Allows receiving to a static address without address reuse. Sender generates unique address from receiver\'s public key.',
      impact: 'Donations and payments without revealing transaction links.'
    },
    {
      name: 'Cross-Input Signature Aggregation',
      status: 'Research',
      description: 'Aggregate all signatures in a transaction (and potentially across transactions in a block) into one.',
      impact: 'Makes CoinJoins cheaper and more indistinguishable from regular transactions.'
    },
    {
      name: 'Confidential Transactions',
      status: 'Research (Liquid sidechain)',
      description: 'Cryptographically hide transaction amounts while proving no inflation.',
      impact: 'Would hide amounts from chain analysis (major privacy improvement).'
    }
  ];

  const completedCount = Object.values(checkedItems).filter(Boolean).length;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <Badge variant="outline" className="bg-purple-500/10 text-purple-400 border-purple-500/30">
          <EyeOff className="w-3 h-3 mr-1" />
          Privacy & Security
        </Badge>
        <h2 className="text-3xl sm:text-4xl font-bold text-foreground">
          Bitcoin Privacy Deep Dive
        </h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Bitcoin is pseudonymous, not anonymous. Understanding chain analysis techniques 
          and privacy best practices is essential for protecting your financial sovereignty.
        </p>
      </div>

      {/* Privacy Model */}
      <Card className="bg-gradient-to-br from-red-500/5 to-orange-500/5 border-red-500/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-400" />
            Bitcoin's Privacy Model: The Reality
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Bitcoin provides <strong>pseudonymity</strong>, not anonymity. Every transaction is 
            permanently recorded on a public ledger. Once your identity is linked to an address, 
            your entire transaction history becomes visible.
          </p>

          <div className="grid md:grid-cols-2 gap-4">
            {privacyModel.map((item, i) => (
              <div 
                key={i} 
                className={`bg-background/50 rounded-lg p-4 border ${
                  item.status === 'public' || item.status === 'exposed'
                    ? 'border-red-500/30'
                    : 'border-yellow-500/30'
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  {item.status === 'public' || item.status === 'exposed' ? (
                    <Eye className="w-4 h-4 text-red-400" />
                  ) : (
                    <EyeOff className="w-4 h-4 text-yellow-400" />
                  )}
                  <h5 className="font-medium">{item.aspect}</h5>
                  <Badge variant="outline" className={`text-xs ${
                    item.status === 'public' || item.status === 'exposed'
                      ? 'bg-red-500/10 text-red-400'
                      : 'bg-yellow-500/10 text-yellow-400'
                  }`}>
                    {item.status}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-2">{item.description}</p>
                <p className="text-xs text-muted-foreground/80 italic">
                  ⚠️ {item.implication}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Chain Analysis Techniques */}
      <Card className="bg-gradient-to-br from-blue-500/5 to-cyan-500/5 border-blue-500/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="w-5 h-5 text-blue-400" />
            Chain Analysis Techniques
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Companies like Chainalysis, Elliptic, and CipherTrace use sophisticated heuristics 
            to trace transactions. Understanding these techniques helps you protect your privacy.
          </p>

          <div className="space-y-3">
            {chainAnalysisTechniques.map((technique, i) => (
              <div key={i} className="bg-background/50 rounded-lg p-4 border border-border/50">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h5 className="font-medium flex items-center gap-2 mb-1">
                      <Link className="w-4 h-4 text-blue-400" />
                      {technique.name}
                    </h5>
                    <p className="text-sm text-muted-foreground mb-2">{technique.description}</p>
                    <div className="flex flex-wrap gap-2 text-xs">
                      <Badge variant="outline" className="bg-blue-500/10">
                        Effectiveness: {technique.effectiveness}
                      </Badge>
                      <Badge variant="outline" className="bg-green-500/10 text-green-400">
                        <Shield className="w-3 h-3 mr-1" />
                        {technique.countermeasure}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Address Clustering Visualization */}
          <div className="bg-background/80 rounded-lg p-4 border border-border">
            <h5 className="font-medium mb-3 flex items-center gap-2">
              <Fingerprint className="w-4 h-4 text-blue-400" />
              Address Clustering Example
            </h5>
            <div className="flex items-center justify-center gap-8 py-4">
              <div className="text-center">
                <div className="flex gap-1 mb-2">
                  {['bc1q...a1', 'bc1q...b2', 'bc1q...c3'].map((addr, i) => (
                    <div 
                      key={i} 
                      className="w-16 h-8 rounded bg-blue-500/20 border border-blue-500/50 flex items-center justify-center text-xs font-mono"
                    >
                      {addr}
                    </div>
                  ))}
                </div>
                <span className="text-xs text-muted-foreground">Inputs (assumed same owner)</span>
              </div>
              <div className="text-2xl text-muted-foreground">→</div>
              <div className="text-center">
                <div className="w-24 h-16 rounded bg-red-500/20 border border-red-500/50 flex items-center justify-center mb-2">
                  <Users className="w-6 h-6 text-red-400" />
                </div>
                <span className="text-xs text-muted-foreground">Cluster: "Wallet X"</span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground text-center">
              Common Input Ownership Heuristic: If multiple inputs are spent together, they likely belong to the same wallet.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Privacy Enhancement Techniques */}
      <Card className="bg-gradient-to-br from-green-500/5 to-emerald-500/5 border-green-500/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-green-400" />
            Privacy Enhancement Techniques
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {privacyTechniques.map((technique, i) => (
            <div 
              key={i} 
              className={`bg-background/50 rounded-lg p-4 border ${
                technique.effectiveness === 'high' 
                  ? 'border-green-500/30' 
                  : 'border-yellow-500/30'
              }`}
            >
              <div className="flex items-start justify-between gap-4 mb-2">
                <h5 className="font-medium flex items-center gap-2">
                  {technique.name === 'CoinJoin' && <Shuffle className="w-4 h-4 text-green-400" />}
                  {technique.name === 'PayJoin (P2EP)' && <Unlink className="w-4 h-4 text-green-400" />}
                  {technique.name === 'Coin Control' && <Lock className="w-4 h-4 text-yellow-400" />}
                  {technique.name === 'Running a Full Node' && <Server className="w-4 h-4 text-green-400" />}
                  {technique.name === 'Tor/VPN for Broadcasting' && <Globe className="w-4 h-4 text-green-400" />}
                  {technique.name}
                </h5>
                <Badge variant="outline" className={`text-xs ${
                  technique.effectiveness === 'high'
                    ? 'bg-green-500/10 text-green-400'
                    : 'bg-yellow-500/10 text-yellow-400'
                }`}>
                  {technique.effectiveness} effectiveness
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mb-2">{technique.description}</p>
              <div className="flex flex-wrap gap-1 mb-2">
                {technique.implementations.map((impl, j) => (
                  <Badge key={j} variant="outline" className="text-xs">
                    {impl}
                  </Badge>
                ))}
              </div>
              <p className="text-xs text-muted-foreground/80">
                ⚠️ Tradeoffs: {technique.tradeoffs}
              </p>
            </div>
          ))}

          {/* CoinJoin Visualization */}
          <div className="bg-background/80 rounded-lg p-4 border border-border">
            <h5 className="font-medium mb-3 flex items-center gap-2">
              <Shuffle className="w-4 h-4 text-purple-400" />
              CoinJoin Visualization
            </h5>
            <div className="flex items-center justify-center gap-4 py-4 text-sm">
              <div className="space-y-1">
                <div className="h-8 w-20 rounded bg-blue-500/30 flex items-center justify-center text-xs">Alice: 0.1</div>
                <div className="h-8 w-20 rounded bg-green-500/30 flex items-center justify-center text-xs">Bob: 0.1</div>
                <div className="h-8 w-20 rounded bg-purple-500/30 flex items-center justify-center text-xs">Carol: 0.1</div>
              </div>
              <div className="text-2xl text-muted-foreground">→</div>
              <div className="w-24 h-24 rounded-lg bg-muted/50 border-2 border-dashed border-muted-foreground/50 flex items-center justify-center">
                <Shuffle className="w-8 h-8 text-muted-foreground" />
              </div>
              <div className="text-2xl text-muted-foreground">→</div>
              <div className="space-y-1">
                <div className="h-8 w-20 rounded bg-muted flex items-center justify-center text-xs">?: 0.1</div>
                <div className="h-8 w-20 rounded bg-muted flex items-center justify-center text-xs">?: 0.1</div>
                <div className="h-8 w-20 rounded bg-muted flex items-center justify-center text-xs">?: 0.1</div>
              </div>
            </div>
            <p className="text-xs text-muted-foreground text-center">
              Equal-sized outputs make it impossible to determine which input corresponds to which output.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Privacy Best Practices Checklist */}
      <Card className="bg-gradient-to-br from-purple-500/5 to-pink-500/5 border-purple-500/20">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-purple-400" />
              Privacy Best Practices Checklist
            </span>
            <Badge variant="outline" className="bg-purple-500/10 text-purple-400">
              {completedCount}/{bestPractices.length} complete
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {bestPractices.map((item) => (
            <div 
              key={item.id}
              className={`bg-background/50 rounded-lg p-3 border transition-colors cursor-pointer ${
                checkedItems[item.id] 
                  ? 'border-green-500/50 bg-green-500/5' 
                  : 'border-border/50 hover:border-purple-500/30'
              }`}
              onClick={() => toggleCheck(item.id)}
            >
              <div className="flex items-start gap-3">
                <Checkbox 
                  checked={checkedItems[item.id] || false}
                  onCheckedChange={() => toggleCheck(item.id)}
                  className="mt-0.5"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`font-medium ${checkedItems[item.id] ? 'line-through text-muted-foreground' : ''}`}>
                      {item.practice}
                    </span>
                    <Badge variant="outline" className={`text-xs ${
                      item.difficulty === 'Easy' ? 'bg-green-500/10 text-green-400' :
                      item.difficulty === 'Medium' ? 'bg-yellow-500/10 text-yellow-400' :
                      'bg-red-500/10 text-red-400'
                    }`}>
                      {item.difficulty}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{item.reason}</p>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Future Privacy Improvements */}
      <Card className="bg-gradient-to-br from-cyan-500/5 to-blue-500/5 border-cyan-500/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-cyan-400" />
            Future Privacy Improvements
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {futureImprovements.map((improvement, i) => (
            <div key={i} className="bg-background/50 rounded-lg p-4 border border-border/50">
              <div className="flex items-center gap-2 mb-2">
                <h5 className="font-medium">{improvement.name}</h5>
                <Badge variant="outline" className={`text-xs ${
                  improvement.status.includes('Active') 
                    ? 'bg-green-500/10 text-green-400'
                    : improvement.status.includes('Proposed')
                    ? 'bg-yellow-500/10 text-yellow-400'
                    : 'bg-blue-500/10 text-blue-400'
                }`}>
                  {improvement.status}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mb-2">{improvement.description}</p>
              <p className="text-xs text-cyan-400">
                Impact: {improvement.impact}
              </p>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Key Takeaways */}
      <Card className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-purple-500/30">
        <CardContent className="p-6">
          <h4 className="font-bold text-lg mb-4 flex items-center gap-2">
            <EyeOff className="w-5 h-5 text-purple-400" />
            Privacy Key Takeaways
          </h4>
          <div className="grid md:grid-cols-2 gap-4">
            {[
              { text: 'Bitcoin is pseudonymous, not anonymous', good: false },
              { text: 'All transactions are public and permanent', good: false },
              { text: 'Chain analysis can link addresses to identities', good: false },
              { text: 'Never reuse addresses - use HD wallets', good: true },
              { text: 'Run your own node to avoid leaking addresses', good: true },
              { text: 'Use Tor to hide your IP when broadcasting', good: true },
              { text: 'CoinJoin breaks transaction linkability', good: true },
              { text: 'Taproot improves privacy for complex scripts', good: true }
            ].map((point, i) => (
              <div key={i} className="flex items-start gap-2">
                {point.good ? (
                  <CheckCircle2 className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                ) : (
                  <XCircle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                )}
                <span className="text-sm">{point.text}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
