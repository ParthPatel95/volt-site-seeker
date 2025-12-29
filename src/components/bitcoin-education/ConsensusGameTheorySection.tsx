import { useState } from 'react';
import { Users, Scale, Shield, Target, AlertTriangle, TrendingUp, Zap, CheckCircle2, XCircle, Brain, Coins, Clock } from 'lucide-react';
import { ScrollReveal } from '@/components/landing/ScrollAnimations';
import LearningObjectives from '@/components/academy/LearningObjectives';
import SectionSummary from '@/components/academy/SectionSummary';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';

const ConsensusGameTheorySection = () => {
  const [attackerHashrate, setAttackerHashrate] = useState([30]);
  const [confirmations, setConfirmations] = useState([6]);
  const [transactionValue, setTransactionValue] = useState([10]);

  const learningObjectives = [
    "Understand Nakamoto Consensus and probabilistic finality",
    "Analyze the game theory behind honest mining incentives",
    "Calculate 51% attack costs and success probabilities",
    "Explore Byzantine Fault Tolerance in decentralized systems",
    "Evaluate double-spend attack economics and defenses",
    "Understand why rational actors choose honest behavior"
  ];

  // Calculate attack success probability (simplified Nakamoto formula)
  const calculateAttackProbability = (q: number, z: number) => {
    if (q >= 50) return 100;
    const p = 1 - q / 100;
    const qRatio = (q / 100) / p;
    let probability = 1;
    let lambda = z * qRatio;
    let sum = 1;
    for (let k = 0; k <= z; k++) {
      const poisson = Math.exp(-lambda) * Math.pow(lambda, k) / factorial(k);
      sum -= poisson * (1 - Math.pow(qRatio, z - k));
    }
    probability = Math.max(0, Math.min(1, sum)) * 100;
    return probability;
  };

  const factorial = (n: number): number => {
    if (n <= 1) return 1;
    return n * factorial(n - 1);
  };

  const attackProbability = calculateAttackProbability(attackerHashrate[0], confirmations[0]);

  // Current network stats for attack cost calculation
  const networkHashrate = 750; // EH/s
  const btcPrice = 97000;
  const blockReward = 3.125;
  const electricityCost = 0.05; // $/kWh
  const efficiencyJTH = 20; // J/TH (modern ASICs)

  // Calculate attack economics
  const attackerHashrateTH = (attackerHashrate[0] / 100) * networkHashrate * 1e6; // TH/s
  const powerWatts = attackerHashrateTH * efficiencyJTH;
  const hourlyElectricityCost = (powerWatts / 1000) * electricityCost;
  const hourlyMiningRevenue = (attackerHashrate[0] / 100) * 6 * blockReward * btcPrice;
  const opportunityCostPerHour = hourlyMiningRevenue;
  const totalHourlyCost = hourlyElectricityCost + opportunityCostPerHour;
  const btcAtRisk = transactionValue[0];
  const attackValue = btcAtRisk * btcPrice;

  // Byzantine Generals Problem scenarios
  const byzantineScenarios = [
    {
      name: "Traditional BFT",
      nodes: 4,
      faulty: 1,
      threshold: "n > 3f",
      description: "Requires 2/3+ honest nodes, deterministic finality",
      weakness: "Doesn't scale beyond ~100 nodes, requires known participants"
    },
    {
      name: "Nakamoto Consensus",
      nodes: "Unlimited",
      faulty: "<50% hashpower",
      threshold: "Longest chain",
      description: "Probabilistic finality, scales to millions of nodes",
      weakness: "Slower finality, energy intensive"
    },
    {
      name: "Proof of Stake",
      nodes: "Validator set",
      faulty: "<33% stake",
      threshold: "2/3+ signatures",
      description: "Energy efficient, faster finality",
      weakness: "Nothing-at-stake, long-range attacks, centralization risk"
    }
  ];

  // Game theory payoff matrix for mining
  const miningPayoffs = [
    { strategy: "Honest Mining", selfHonest: "Block rewards + fees", selfAttack: "Risk losing investment", networkEffect: "Network security maintained" },
    { strategy: "Selfish Mining", selfHonest: "Slight edge at >33%", selfAttack: "Wastes resources", networkEffect: "Reduces network security" },
    { strategy: "51% Attack", selfHonest: "Massive investment needed", selfAttack: "Double-spend possible", networkEffect: "Destroys network value" }
  ];

  // Attack vectors with defenses
  const attackVectors = [
    {
      name: "51% Attack (Majority Attack)",
      description: "Attacker controls majority hashpower to rewrite blockchain history",
      cost: `$${((networkHashrate * 1e6 * 0.51 * efficiencyJTH / 1000) * electricityCost).toLocaleString()}/hour + hardware`,
      probability: "Requires sustained 51%+ hashpower",
      defense: "High network hashrate, confirmations, checkpoints",
      severity: "Critical"
    },
    {
      name: "Double-Spend Attack",
      description: "Spend same coins twice by reversing transaction after receiving goods",
      cost: "Proportional to transaction value and confirmations needed",
      probability: "Decreases exponentially with confirmations",
      defense: "Wait for 6+ confirmations for large amounts",
      severity: "High"
    },
    {
      name: "Selfish Mining",
      description: "Withhold found blocks to gain unfair advantage in next block race",
      cost: "Profitable only with >33% hashpower",
      probability: "Marginal gains, high variance",
      defense: "Improved block propagation, timestamp rules",
      severity: "Medium"
    },
    {
      name: "Eclipse Attack",
      description: "Isolate a node by controlling all its peer connections",
      cost: "Requires controlling node's network connections",
      probability: "Difficult on well-connected nodes",
      defense: "Multiple connections, diverse peers, Tor",
      severity: "Medium"
    },
    {
      name: "Sybil Attack",
      description: "Create many fake identities to gain disproportionate influence",
      cost: "Free to create identities",
      probability: "Bitcoin immune due to PoW (identities don't give power)",
      defense: "Proof-of-Work consensus",
      severity: "Low (mitigated)"
    },
    {
      name: "Time-Warp Attack",
      description: "Manipulate timestamps to artificially reduce difficulty",
      cost: "Requires >50% hashpower sustained",
      probability: "Theoretically possible, never executed",
      defense: "Median time past rule, difficulty adjustment limits",
      severity: "Low"
    }
  ];

  return (
    <section id="consensus" className="py-16 md:py-24 bg-gradient-to-b from-muted/30 to-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 text-sm font-medium mb-4">
              <Brain className="w-4 h-4" />
              Advanced Module
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Consensus & Game Theory
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Explore the mathematical game theory that makes Bitcoin's consensus mechanism 
              self-reinforcing — and why attacking the network is economically irrational.
            </p>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={50}>
          <LearningObjectives 
            objectives={learningObjectives}
            estimatedTime="40-50 minutes"
            prerequisites={[
              { title: "Cryptography Deep Dive", href: "#cryptography" },
              { title: "How Bitcoin Works", href: "#how-it-works" }
            ]}
          />
        </ScrollReveal>

        {/* Nakamoto Consensus Explained */}
        <ScrollReveal delay={100}>
          <Card className="mb-8 border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Scale className="w-5 h-5 text-primary" />
                Nakamoto Consensus: Probabilistic Finality
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-muted/50 rounded-lg p-4 border border-border">
                <p className="text-sm text-muted-foreground">
                  Unlike traditional consensus mechanisms that require all participants to agree (deterministic finality), 
                  <strong className="text-foreground"> Nakamoto Consensus</strong> achieves agreement through proof-of-work 
                  and the longest chain rule. Finality is <em>probabilistic</em> — the deeper a transaction is buried, 
                  the exponentially more difficult it becomes to reverse.
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div className="bg-card rounded-lg p-4 border border-border text-center">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                    <Target className="w-6 h-6 text-primary" />
                  </div>
                  <h4 className="font-medium text-foreground mb-2">Proof of Work</h4>
                  <p className="text-sm text-muted-foreground">
                    Miners expend real energy to find valid blocks, creating unforgeable costliness
                  </p>
                </div>
                <div className="bg-card rounded-lg p-4 border border-border text-center">
                  <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-3">
                    <TrendingUp className="w-6 h-6 text-green-500" />
                  </div>
                  <h4 className="font-medium text-foreground mb-2">Longest Chain Rule</h4>
                  <p className="text-sm text-muted-foreground">
                    Nodes always follow the chain with the most accumulated proof-of-work
                  </p>
                </div>
                <div className="bg-card rounded-lg p-4 border border-border text-center">
                  <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center mx-auto mb-3">
                    <Clock className="w-6 h-6 text-blue-500" />
                  </div>
                  <h4 className="font-medium text-foreground mb-2">Probabilistic Finality</h4>
                  <p className="text-sm text-muted-foreground">
                    Each confirmation exponentially decreases reversal probability
                  </p>
                </div>
              </div>

              {/* Confirmation Depth Visualization */}
              <div className="bg-gradient-to-r from-primary/5 to-primary/10 rounded-xl p-6 border border-primary/20">
                <h4 className="font-semibold text-foreground mb-4">Confirmation Security</h4>
                <div className="grid grid-cols-6 gap-2 mb-4">
                  {[1, 2, 3, 4, 5, 6].map((conf) => (
                    <div key={conf} className="text-center">
                      <div className={`aspect-square rounded-lg flex items-center justify-center font-bold text-lg transition-all ${
                        conf <= 2 ? 'bg-red-500/20 text-red-600 dark:text-red-400' :
                        conf <= 4 ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400' :
                        'bg-green-500/20 text-green-600 dark:text-green-400'
                      }`}>
                        {conf}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {conf === 1 ? '~10min' : `~${conf * 10}min`}
                      </p>
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-red-600 dark:text-red-400">⚠️ High risk</span>
                  <span className="text-amber-600 dark:text-amber-400">📊 Medium security</span>
                  <span className="text-green-600 dark:text-green-400">✓ Industry standard</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </ScrollReveal>

        {/* Interactive Attack Calculator */}
        <ScrollReveal delay={150}>
          <Card className="mb-8 border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-500" />
                Attack Economics Calculator
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-amber-500/10 rounded-lg p-4 border border-amber-500/20 mb-4">
                <p className="text-sm text-muted-foreground">
                  This interactive calculator demonstrates why attacking Bitcoin is economically irrational. 
                  Adjust the parameters to see how attack costs and success probabilities change.
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                {/* Attacker Hashrate Slider */}
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    Attacker Hashrate: {attackerHashrate[0]}%
                  </label>
                  <Slider
                    value={attackerHashrate}
                    onValueChange={setAttackerHashrate}
                    min={1}
                    max={60}
                    step={1}
                    className="my-4"
                  />
                  <p className="text-xs text-muted-foreground">
                    Current network: ~{networkHashrate} EH/s
                  </p>
                </div>

                {/* Confirmations Slider */}
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    Confirmations to Reverse: {confirmations[0]}
                  </label>
                  <Slider
                    value={confirmations}
                    onValueChange={setConfirmations}
                    min={1}
                    max={12}
                    step={1}
                    className="my-4"
                  />
                  <p className="text-xs text-muted-foreground">
                    More confirmations = exponentially harder
                  </p>
                </div>

                {/* Transaction Value */}
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    Transaction Value: {transactionValue[0]} BTC
                  </label>
                  <Slider
                    value={transactionValue}
                    onValueChange={setTransactionValue}
                    min={1}
                    max={1000}
                    step={1}
                    className="my-4"
                  />
                  <p className="text-xs text-muted-foreground">
                    ≈ ${(transactionValue[0] * btcPrice).toLocaleString()} USD
                  </p>
                </div>
              </div>

              {/* Results */}
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
                <div className="bg-card rounded-lg p-4 border border-border">
                  <p className="text-xs text-muted-foreground mb-1">Attack Success Rate</p>
                  <p className={`text-2xl font-bold ${
                    attackProbability > 50 ? 'text-red-500' :
                    attackProbability > 10 ? 'text-amber-500' :
                    'text-green-500'
                  }`}>
                    {attackProbability.toFixed(2)}%
                  </p>
                </div>
                <div className="bg-card rounded-lg p-4 border border-border">
                  <p className="text-xs text-muted-foreground mb-1">Hourly Attack Cost</p>
                  <p className="text-2xl font-bold text-primary">
                    ${totalHourlyCost.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </p>
                </div>
                <div className="bg-card rounded-lg p-4 border border-border">
                  <p className="text-xs text-muted-foreground mb-1">Potential Gain</p>
                  <p className="text-2xl font-bold text-foreground">
                    ${attackValue.toLocaleString()}
                  </p>
                </div>
                <div className="bg-card rounded-lg p-4 border border-border">
                  <p className="text-xs text-muted-foreground mb-1">Cost/Benefit Ratio</p>
                  <p className={`text-2xl font-bold ${
                    totalHourlyCost > attackValue ? 'text-green-500' : 'text-red-500'
                  }`}>
                    {(totalHourlyCost / (attackValue * (attackProbability / 100) || 1)).toFixed(1)}:1
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {totalHourlyCost > attackValue * (attackProbability / 100) ? '✓ Attack unprofitable' : '⚠️ Consider more confirmations'}
                  </p>
                </div>
              </div>

              <div className="bg-muted/50 rounded-lg p-4 border border-border">
                <p className="text-sm text-muted-foreground">
                  <strong className="text-foreground">Key insight:</strong> Even with significant hashpower, 
                  the expected value of an attack is almost always negative. The attacker loses their 
                  opportunity cost (honest mining rewards) plus electricity, while only having a small 
                  chance of success that decreases exponentially with each confirmation.
                </p>
              </div>
            </CardContent>
          </Card>
        </ScrollReveal>

        {/* Byzantine Generals Problem */}
        <ScrollReveal delay={200}>
          <Card className="mb-8 border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" />
                The Byzantine Generals Problem
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-muted/50 rounded-lg p-4 border border-border">
                <p className="text-sm text-muted-foreground">
                  The <strong className="text-foreground">Byzantine Generals Problem</strong> (Lamport, 1982) describes the challenge 
                  of achieving consensus among distributed actors when some may be malicious or faulty. 
                  Before Bitcoin, no solution existed for open, permissionless networks. Satoshi's innovation 
                  was using proof-of-work to make lying expensive.
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                {byzantineScenarios.map((scenario, index) => (
                  <div key={index} className={`bg-card rounded-lg p-5 border ${
                    index === 1 ? 'border-primary ring-1 ring-primary/20' : 'border-border'
                  }`}>
                    {index === 1 && (
                      <span className="inline-block px-2 py-0.5 bg-primary text-primary-foreground text-xs rounded mb-2">
                        Bitcoin's Solution
                      </span>
                    )}
                    <h4 className="font-medium text-foreground mb-2">{scenario.name}</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Nodes:</span>
                        <span className="text-foreground">{scenario.nodes}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Fault Tolerance:</span>
                        <span className="text-foreground">{scenario.faulty}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Consensus:</span>
                        <span className="text-foreground font-mono text-xs">{scenario.threshold}</span>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-3 pt-3 border-t border-border">
                      {scenario.description}
                    </p>
                    <p className="text-xs text-amber-600 dark:text-amber-400 mt-2">
                      ⚠️ {scenario.weakness}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </ScrollReveal>

        {/* Game Theory: Mining Incentives */}
        <ScrollReveal delay={250}>
          <Card className="mb-8 border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Coins className="w-5 h-5 text-amber-500" />
                Game Theory: Why Honest Mining Wins
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-gradient-to-r from-green-500/5 to-primary/5 rounded-xl p-6 border border-green-500/20">
                <h4 className="font-semibold text-foreground mb-4">Nash Equilibrium in Bitcoin Mining</h4>
                <p className="text-sm text-muted-foreground mb-4">
                  In game theory, a <strong className="text-foreground">Nash Equilibrium</strong> is a state where no player 
                  can improve their outcome by unilaterally changing strategy. Bitcoin's design creates a Nash Equilibrium 
                  at honest mining — any deviation results in lower expected returns.
                </p>
                
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-2 px-3 text-muted-foreground font-medium">Strategy</th>
                        <th className="text-left py-2 px-3 text-muted-foreground font-medium">Miner's Payoff</th>
                        <th className="text-left py-2 px-3 text-muted-foreground font-medium">Risk</th>
                        <th className="text-left py-2 px-3 text-muted-foreground font-medium">Network Effect</th>
                      </tr>
                    </thead>
                    <tbody>
                      {miningPayoffs.map((row, index) => (
                        <tr key={index} className="border-b border-border/50">
                          <td className="py-3 px-3 font-medium">{row.strategy}</td>
                          <td className="py-3 px-3 text-green-600 dark:text-green-400">{row.selfHonest}</td>
                          <td className="py-3 px-3 text-red-600 dark:text-red-400">{row.selfAttack}</td>
                          <td className="py-3 px-3 text-muted-foreground">{row.networkEffect}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-green-500/10 rounded-lg p-5 border border-green-500/20">
                  <div className="flex items-center gap-2 mb-3">
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                    <h5 className="font-medium text-foreground">Incentive Alignment</h5>
                  </div>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• Miners profit from network health</li>
                    <li>• Block rewards paid in BTC</li>
                    <li>• Attack destroys value of rewards</li>
                    <li>• Hardware investment requires long-term view</li>
                  </ul>
                </div>
                <div className="bg-red-500/10 rounded-lg p-5 border border-red-500/20">
                  <div className="flex items-center gap-2 mb-3">
                    <XCircle className="w-5 h-5 text-red-500" />
                    <h5 className="font-medium text-foreground">Attack Disincentives</h5>
                  </div>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• Massive upfront hardware cost</li>
                    <li>• Ongoing electricity expenses</li>
                    <li>• Success destroys coin value</li>
                    <li>• Honest mining is more profitable</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </ScrollReveal>

        {/* Attack Vectors Analysis */}
        <ScrollReveal delay={300}>
          <Card className="mb-8 border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-red-500" />
                Attack Vectors & Defenses
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {attackVectors.map((attack, index) => (
                  <div key={index} className="bg-card rounded-lg p-5 border border-border hover:border-primary/30 transition-colors">
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <h4 className="font-medium text-foreground">{attack.name}</h4>
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                        attack.severity === 'Critical' ? 'bg-red-500/20 text-red-600 dark:text-red-400' :
                        attack.severity === 'High' ? 'bg-orange-500/20 text-orange-600 dark:text-orange-400' :
                        attack.severity === 'Medium' ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400' :
                        'bg-green-500/20 text-green-600 dark:text-green-400'
                      }`}>
                        {attack.severity} Risk
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">{attack.description}</p>
                    <div className="grid md:grid-cols-3 gap-3 text-xs">
                      <div className="bg-muted/50 rounded p-2">
                        <span className="text-muted-foreground block mb-1">Cost:</span>
                        <span className="text-foreground">{attack.cost}</span>
                      </div>
                      <div className="bg-muted/50 rounded p-2">
                        <span className="text-muted-foreground block mb-1">Probability:</span>
                        <span className="text-foreground">{attack.probability}</span>
                      </div>
                      <div className="bg-green-500/10 rounded p-2 border border-green-500/20">
                        <span className="text-green-600 dark:text-green-400 block mb-1">Defense:</span>
                        <span className="text-foreground">{attack.defense}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </ScrollReveal>

        {/* Key Formula Card */}
        <ScrollReveal delay={350}>
          <div className="bg-gradient-to-br from-primary/10 via-background to-blue-500/10 rounded-2xl p-8 border border-primary/20 mb-8">
            <h3 className="text-xl font-bold text-foreground mb-4">Satoshi's Attack Probability Formula</h3>
            <div className="bg-background/50 rounded-lg p-4 border border-border mb-4 font-mono text-sm overflow-x-auto">
              <code className="text-primary">
                P(catch up) = 1 - Σ(k=0 to z) [λ^k * e^(-λ) / k!] * (1 - (q/p)^(z-k))
              </code>
              <p className="text-muted-foreground mt-2 font-sans text-xs">
                Where: q = attacker's hashrate fraction, p = honest hashrate fraction, z = confirmations, λ = z * (q/p)
              </p>
            </div>
            <p className="text-sm text-muted-foreground">
              This Poisson distribution formula from Satoshi's whitepaper shows that an attacker with less than 
              50% hashpower has a probability of success that decreases exponentially with confirmations. 
              At 6 confirmations and 10% hashpower, success probability is less than 0.1%.
            </p>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={400}>
          <SectionSummary
            takeaways={[
              "Nakamoto Consensus achieves agreement through proof-of-work and longest chain rule with probabilistic finality",
              "Each confirmation exponentially decreases the probability of transaction reversal",
              "Bitcoin solves the Byzantine Generals Problem for open, permissionless networks",
              "Honest mining is a Nash Equilibrium — no rational actor benefits from deviation",
              "51% attacks are economically irrational: costs exceed potential gains, and success destroys the reward's value",
              "The network's security comes from aligned incentives, not just technical measures"
            ]}
            proTip="For high-value transactions, wait for 6+ confirmations. For very large amounts (>$1M), consider waiting for 30+ confirmations — the exponential security increase is worth the wait."
            nextSteps={[
              { title: "Network Architecture", href: "#network" },
              { title: "Bitcoin Scripting", href: "#scripting" }
            ]}
          />
        </ScrollReveal>
      </div>
    </section>
  );
};

export default ConsensusGameTheorySection;
