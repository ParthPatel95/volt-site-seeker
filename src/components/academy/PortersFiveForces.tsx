import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  Factory, 
  ShoppingCart, 
  RefreshCcw, 
  Swords,
  ChevronRight,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Minus
} from 'lucide-react';

interface ForceDetail {
  factor: string;
  impact: 'high' | 'medium' | 'low';
  explanation: string;
}

interface Force {
  id: string;
  name: string;
  icon: React.ReactNode;
  summary: string;
  overallThreat: 'high' | 'medium' | 'low';
  details: ForceDetail[];
  strategicImplications: string[];
}

const threatColors = {
  high: 'text-red-500 bg-red-500/10 border-red-500/20',
  medium: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
  low: 'text-green-500 bg-green-500/10 border-green-500/20',
};

const threatLabels = {
  high: 'High Threat',
  medium: 'Medium Threat',
  low: 'Low Threat',
};

const threatIcons = {
  high: <TrendingUp className="w-4 h-4" />,
  medium: <Minus className="w-4 h-4" />,
  low: <TrendingDown className="w-4 h-4" />,
};

const miningIndustryForces: Force[] = [
  {
    id: 'new-entrants',
    name: 'Threat of New Entrants',
    icon: <Users className="w-6 h-6" />,
    summary: 'Moderate barriers exist but significant capital and expertise required',
    overallThreat: 'medium',
    details: [
      {
        factor: 'Capital Requirements',
        impact: 'high',
        explanation: 'Large-scale operations require $50M+ for 100MW facilities, creating significant barriers for small entrants.',
      },
      {
        factor: 'Access to Power',
        impact: 'high',
        explanation: 'Securing low-cost power contracts and grid interconnection takes 12-24 months, limiting rapid entry.',
      },
      {
        factor: 'Technical Expertise',
        impact: 'medium',
        explanation: 'Operating efficiently requires specialized knowledge in electrical systems, cooling, and firmware optimization.',
      },
      {
        factor: 'Regulatory Navigation',
        impact: 'medium',
        explanation: 'Permits, environmental compliance, and utility negotiations add time and complexity.',
      },
    ],
    strategicImplications: [
      'Lock in long-term power contracts to create cost advantages',
      'Build technical expertise as a competitive moat',
      'Establish relationships with regulators early',
    ],
  },
  {
    id: 'suppliers',
    name: 'Supplier Power',
    icon: <Factory className="w-6 h-6" />,
    summary: 'ASIC manufacturers hold significant power due to limited options',
    overallThreat: 'high',
    details: [
      {
        factor: 'ASIC Manufacturer Concentration',
        impact: 'high',
        explanation: 'Bitmain, MicroBT, and Canaan control 95%+ of market. Limited alternatives give them pricing power.',
      },
      {
        factor: 'Lead Times & Allocation',
        impact: 'high',
        explanation: 'During bull markets, 6-12 month lead times and allocation preferences for large buyers.',
      },
      {
        factor: 'Utility Dependence',
        impact: 'medium',
        explanation: 'Power is critical but miners can often choose between multiple utilities or develop own generation.',
      },
      {
        factor: 'Switching Costs',
        impact: 'low',
        explanation: 'Miners can switch between ASIC brands relatively easily if inventory is available.',
      },
    ],
    strategicImplications: [
      'Diversify ASIC suppliers where possible',
      'Build relationships through bulk purchases',
      'Consider vertical integration or behind-the-meter power',
    ],
  },
  {
    id: 'buyers',
    name: 'Buyer Power',
    icon: <ShoppingCart className="w-6 h-6" />,
    summary: 'Unique situation: Bitcoin network is the "buyer" - no negotiation possible',
    overallThreat: 'low',
    details: [
      {
        factor: 'Protocol-Determined Rewards',
        impact: 'low',
        explanation: 'Block rewards are fixed by protocol. No buyer can negotiate different terms.',
      },
      {
        factor: 'Market-Determined Prices',
        impact: 'high',
        explanation: 'Bitcoin price is set by global markets, creating revenue volatility but affecting all miners equally.',
      },
      {
        factor: 'No Customer Concentration',
        impact: 'low',
        explanation: 'Revenue comes from the network itself, not individual customers who could demand discounts.',
      },
      {
        factor: 'Hash Price Transparency',
        impact: 'medium',
        explanation: 'Public metrics mean all miners face the same economics at any given time.',
      },
    ],
    strategicImplications: [
      'Focus on cost reduction since revenue is market-determined',
      'Build treasury strategy to manage price volatility',
      'Develop ancillary revenue streams (grid services, hosting)',
    ],
  },
  {
    id: 'substitutes',
    name: 'Threat of Substitutes',
    icon: <RefreshCcw className="w-6 h-6" />,
    summary: 'Low threat for Bitcoin mining specifically, but watch industry evolution',
    overallThreat: 'low',
    details: [
      {
        factor: 'Alternative Consensus Mechanisms',
        impact: 'low',
        explanation: 'Bitcoin is committed to Proof-of-Work. Ethereum\'s move to PoS doesn\'t affect BTC mining.',
      },
      {
        factor: 'Cloud Mining Services',
        impact: 'low',
        explanation: 'Cloud mining is not a substitute but a different business model; physical mining still required.',
      },
      {
        factor: 'Other Cryptocurrencies',
        impact: 'medium',
        explanation: 'Miners can switch to other PoW coins, but BTC remains most valuable and liquid.',
      },
      {
        factor: 'Traditional Store of Value',
        impact: 'low',
        explanation: 'Gold and other assets compete with Bitcoin, but this affects price not mining as an activity.',
      },
    ],
    strategicImplications: [
      'Stay committed to Bitcoin as the dominant PoW asset',
      'Monitor developments in ASICs for algorithm flexibility',
      'Bitcoin-maximalist focus for long-term infrastructure investment',
    ],
  },
  {
    id: 'rivalry',
    name: 'Industry Rivalry',
    icon: <Swords className="w-6 h-6" />,
    summary: 'Intense competition driven by difficulty adjustments and commoditized output',
    overallThreat: 'high',
    details: [
      {
        factor: 'Difficulty Adjustment Mechanism',
        impact: 'high',
        explanation: 'More hashrate = higher difficulty = lower rewards per unit. Zero-sum competition.',
      },
      {
        factor: 'Commoditized Output',
        impact: 'high',
        explanation: 'All miners produce identical Bitcoin. No differentiation possible on product.',
      },
      {
        factor: 'High Fixed Costs',
        impact: 'high',
        explanation: 'Capital-intensive nature incentivizes miners to operate even at marginal profitability.',
      },
      {
        factor: 'Halving Pressure',
        impact: 'high',
        explanation: 'Every 4 years, revenue is cut in half, intensifying competition for survival.',
      },
    ],
    strategicImplications: [
      'Relentless focus on efficiency and cost reduction',
      'Prepare financially for halving cycles',
      'Diversify revenue through hosting and grid services',
      'Consider strategic M&A during downturns',
    ],
  },
];

interface PortersFiveForcesProps {
  className?: string;
}

export default function PortersFiveForces({ className = '' }: PortersFiveForcesProps) {
  const [selectedForce, setSelectedForce] = useState<Force | null>(null);

  return (
    <div className={`bg-card border border-border rounded-2xl overflow-hidden ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-border bg-gradient-to-r from-primary/10 via-primary/5 to-transparent">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-xl font-bold text-foreground mb-2">
              Porter's Five Forces: Bitcoin Mining
            </h3>
            <p className="text-sm text-muted-foreground">
              Strategic analysis framework for understanding competitive dynamics in the mining industry
            </p>
          </div>
          <div className="text-xs text-muted-foreground bg-muted/50 px-3 py-1 rounded-full">
            Porter, M.E. (1980)
          </div>
        </div>
      </div>

      {/* Visual Diagram */}
      <div className="p-8">
        <div className="relative max-w-2xl mx-auto">
          {/* Center - Industry Rivalry */}
          <motion.button
            onClick={() => setSelectedForce(miningIndustryForces.find(f => f.id === 'rivalry')!)}
            className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 
              w-32 h-32 rounded-full border-2 bg-card flex flex-col items-center justify-center gap-2 
              transition-all hover:scale-105 hover:shadow-lg z-10
              ${selectedForce?.id === 'rivalry' ? 'border-primary shadow-lg' : 'border-border'}`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
          >
            <Swords className="w-8 h-8 text-primary" />
            <span className="text-xs font-medium text-center px-2">Industry Rivalry</span>
            <span className={`text-xs px-2 py-0.5 rounded-full ${threatColors.high}`}>High</span>
          </motion.button>

          {/* Surrounding Forces */}
          {[
            { id: 'new-entrants', angle: 270, label: 'New Entrants' },
            { id: 'suppliers', angle: 0, label: 'Suppliers' },
            { id: 'substitutes', angle: 90, label: 'Substitutes' },
            { id: 'buyers', angle: 180, label: 'Buyers' },
          ].map(({ id, angle, label }) => {
            const force = miningIndustryForces.find(f => f.id === id)!;
            const radians = (angle * Math.PI) / 180;
            const radius = 140;
            const x = Math.cos(radians) * radius;
            const y = Math.sin(radians) * radius;

            return (
              <motion.button
                key={id}
                onClick={() => setSelectedForce(force)}
                className={`absolute w-24 h-24 rounded-xl border bg-card flex flex-col items-center justify-center gap-1.5
                  transition-all hover:shadow-lg
                  ${selectedForce?.id === id ? 'border-primary shadow-lg' : 'border-border'}`}
                style={{
                  left: `calc(50% + ${x}px - 48px)`,
                  top: `calc(50% + ${y}px - 48px)`,
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
              >
                {force.icon}
                <span className="text-xs font-medium text-center">{label}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full ${threatColors[force.overallThreat]}`}>
                  {force.overallThreat.charAt(0).toUpperCase() + force.overallThreat.slice(1)}
                </span>
              </motion.button>
            );
          })}

          {/* Connecting Lines */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ height: 320 }}>
            {[270, 0, 90, 180].map((angle, i) => {
              const radians = (angle * Math.PI) / 180;
              const innerRadius = 65;
              const outerRadius = 95;
              const centerX = 256;
              const centerY = 160;
              return (
                <line
                  key={i}
                  x1={centerX + Math.cos(radians) * innerRadius}
                  y1={centerY + Math.sin(radians) * innerRadius}
                  x2={centerX + Math.cos(radians) * outerRadius}
                  y2={centerY + Math.sin(radians) * outerRadius}
                  stroke="currentColor"
                  className="text-border"
                  strokeWidth="2"
                  strokeDasharray="4 4"
                />
              );
            })}
          </svg>
        </div>
      </div>

      {/* Selected Force Details */}
      <AnimatePresence mode="wait">
        {selectedForce && (
          <motion.div
            key={selectedForce.id}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="border-t border-border"
          >
            <div className="p-6">
              <div className="flex items-start gap-4 mb-6">
                <div className="p-3 bg-primary/10 rounded-xl">
                  {selectedForce.icon}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="text-lg font-bold text-foreground">{selectedForce.name}</h4>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${threatColors[selectedForce.overallThreat]}`}>
                      {threatLabels[selectedForce.overallThreat]}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">{selectedForce.summary}</p>
                </div>
              </div>

              {/* Factors */}
              <div className="space-y-3 mb-6">
                <h5 className="text-sm font-semibold text-foreground">Key Factors</h5>
                {selectedForce.details.map((detail, i) => (
                  <div 
                    key={i}
                    className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg"
                  >
                    <span className={`mt-0.5 p-1 rounded ${threatColors[detail.impact]}`}>
                      {threatIcons[detail.impact]}
                    </span>
                    <div>
                      <div className="font-medium text-sm text-foreground">{detail.factor}</div>
                      <div className="text-sm text-muted-foreground">{detail.explanation}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Strategic Implications */}
              <div className="p-4 bg-primary/5 rounded-xl border border-primary/20">
                <h5 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-primary" />
                  Strategic Implications
                </h5>
                <ul className="space-y-2">
                  {selectedForce.strategicImplications.map((impl, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <ChevronRight className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                      {impl}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <div className="px-6 py-4 bg-muted/30 border-t border-border">
        <p className="text-xs text-muted-foreground text-center">
          Click on any force to explore detailed analysis. Framework adapted from Porter's Competitive Strategy (1980).
        </p>
      </div>
    </div>
  );
}
