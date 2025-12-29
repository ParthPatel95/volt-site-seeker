import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Target, 
  Users, 
  Scale,
  Lightbulb
} from 'lucide-react';

interface GameScenario {
  id: string;
  title: string;
  description: string;
  players: string[];
  payoffMatrix?: {
    headers: string[];
    rows: {
      label: string;
      values: string[];
    }[];
  };
  equilibrium: string;
  strategicInsight: string;
}

const miningGameScenarios: GameScenario[] = [
  {
    id: 'difficulty-adjustment',
    title: 'Difficulty Adjustment Game',
    description: 'The Bitcoin protocol automatically adjusts difficulty every 2,016 blocks to maintain ~10 minute block times. This creates a zero-sum competitive dynamic.',
    players: ['All miners globally', 'New entrants', 'Existing operators'],
    equilibrium: 'Nash Equilibrium: All miners operate until marginal cost equals marginal revenue. Difficulty adjusts to eliminate excess returns.',
    strategicInsight: 'Sustainable competitive advantage comes only from cost advantages (power, efficiency), not from hashrate alone. Any hashrate advantage is temporary.',
  },
  {
    id: 'bear-market-exit',
    title: 'Bear Market Exit Decision',
    description: 'When BTC price crashes, high-cost miners face a decision: continue operating at a loss or shut down. The last miner standing captures more rewards.',
    players: ['High-cost miners', 'Low-cost miners'],
    payoffMatrix: {
      headers: ['', 'Low-Cost: Stay', 'Low-Cost: Exit'],
      rows: [
        { label: 'High-Cost: Stay', values: ['Both suffer losses', 'High-cost gains share'] },
        { label: 'High-Cost: Exit', values: ['Low-cost gains share', 'Both exit, difficulty drops'] },
      ],
    },
    equilibrium: 'Dominant Strategy: Low-cost miners always stay. High-cost miners exit when losses exceed shutdown costs.',
    strategicInsight: 'Building a low-cost operation is not just about maximizing profits—it\'s about survival during downturns when competitors exit.',
  },
  {
    id: 'hashrate-timing',
    title: 'Hashrate Addition Timing',
    description: 'When should you bring new hashrate online? Adding capacity increases network difficulty for everyone, but waiting means missing revenue.',
    players: ['You', 'Other miners', 'Equipment manufacturers'],
    equilibrium: 'Mixed Strategy: Optimal timing depends on expected competitor behavior and difficulty trajectory.',
    strategicInsight: 'Early movers capture revenue before difficulty adjusts, but late movers may get cheaper equipment. The sweet spot is deploying after price spikes but before difficulty fully adjusts.',
  },
  {
    id: 'demand-response',
    title: 'Demand Response Participation',
    description: 'Grid operators offer payments for load reduction during peak demand. If all miners participate, the grid stabilizes. If you defect and mine during peaks, you earn while others curtail.',
    players: ['Your operation', 'Other miners', 'Grid operator'],
    payoffMatrix: {
      headers: ['', 'Others: Participate', 'Others: Defect'],
      rows: [
        { label: 'You: Participate', values: ['All earn DR payments', 'You earn less, others mine'] },
        { label: 'You: Defect', values: ['You mine, others paid', 'Grid stress, programs end'] },
      ],
    },
    equilibrium: 'Cooperation Equilibrium: If enough miners participate, DR programs remain viable. Defection risks program termination.',
    strategicInsight: 'Demand response creates a positive-sum game. The industry benefits from coordination, and grid operators are important stakeholders to maintain.',
  },
];

interface GameTheorySectionProps {
  className?: string;
}

export default function GameTheorySection({ className = '' }: GameTheorySectionProps) {
  const [selectedScenario, setSelectedScenario] = useState<GameScenario>(miningGameScenarios[0]);

  return (
    <div className={`bg-card border border-border rounded-2xl overflow-hidden ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-border bg-gradient-to-r from-primary/10 via-primary/5 to-transparent">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Scale className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-foreground">Game Theory in Bitcoin Mining</h3>
            <p className="text-sm text-muted-foreground">
              Strategic decision-making in competitive mining environments
            </p>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 divide-y lg:divide-y-0 lg:divide-x divide-border">
        {/* Scenario List */}
        <div className="p-4 space-y-2">
          <h4 className="text-sm font-medium text-muted-foreground mb-3">Select Scenario</h4>
          {miningGameScenarios.map((scenario) => (
            <button
              key={scenario.id}
              onClick={() => setSelectedScenario(scenario)}
              className={`w-full text-left p-3 rounded-lg transition-all ${
                selectedScenario.id === scenario.id
                  ? 'bg-primary/10 border border-primary/30'
                  : 'hover:bg-muted/50 border border-transparent'
              }`}
            >
              <div className="font-medium text-sm text-foreground">{scenario.title}</div>
              <div className="text-xs text-muted-foreground mt-1 line-clamp-2">
                {scenario.description}
              </div>
            </button>
          ))}
        </div>

        {/* Scenario Details */}
        <div className="lg:col-span-2 p-6">
          <motion.div
            key={selectedScenario.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            <div>
              <h4 className="text-lg font-bold text-foreground mb-2">
                {selectedScenario.title}
              </h4>
              <p className="text-muted-foreground">
                {selectedScenario.description}
              </p>
            </div>

            {/* Players */}
            <div>
              <h5 className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                <Users className="w-4 h-4 text-primary" />
                Players
              </h5>
              <div className="flex flex-wrap gap-2">
                {selectedScenario.players.map((player, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 bg-muted rounded-full text-sm text-muted-foreground"
                  >
                    {player}
                  </span>
                ))}
              </div>
            </div>

            {/* Payoff Matrix */}
            {selectedScenario.payoffMatrix && (
              <div>
                <h5 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
                  <Target className="w-4 h-4 text-primary" />
                  Payoff Matrix
                </h5>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm border border-border rounded-lg overflow-hidden">
                    <thead>
                      <tr className="bg-muted/50">
                        {selectedScenario.payoffMatrix.headers.map((header, idx) => (
                          <th
                            key={idx}
                            className="p-3 text-left font-medium text-foreground border-b border-r border-border last:border-r-0"
                          >
                            {header}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {selectedScenario.payoffMatrix.rows.map((row, rowIdx) => (
                        <tr key={rowIdx} className="hover:bg-muted/30">
                          <td className="p-3 font-medium text-foreground bg-muted/30 border-r border-b border-border">
                            {row.label}
                          </td>
                          {row.values.map((value, valIdx) => (
                            <td
                              key={valIdx}
                              className="p-3 text-muted-foreground border-r border-b border-border last:border-r-0"
                            >
                              {value}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Equilibrium */}
            <div className="p-4 bg-primary/5 border border-primary/20 rounded-xl">
              <h5 className="text-sm font-medium text-primary mb-2 flex items-center gap-2">
                <Scale className="w-4 h-4" />
                Equilibrium Analysis
              </h5>
              <p className="text-sm text-muted-foreground">
                {selectedScenario.equilibrium}
              </p>
            </div>

            {/* Strategic Insight */}
            <div className="p-4 bg-amber-500/5 border border-amber-500/20 rounded-xl">
              <h5 className="text-sm font-medium text-amber-600 dark:text-amber-400 mb-2 flex items-center gap-2">
                <Lightbulb className="w-4 h-4" />
                Strategic Insight
              </h5>
              <p className="text-sm text-muted-foreground">
                {selectedScenario.strategicInsight}
              </p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-6 py-4 bg-muted/30 border-t border-border">
        <p className="text-xs text-muted-foreground">
          Game theory provides a framework for understanding competitive dynamics. 
          Real-world decisions involve additional factors including uncertainty, 
          incomplete information, and multi-period considerations.
        </p>
      </div>
    </div>
  );
}
