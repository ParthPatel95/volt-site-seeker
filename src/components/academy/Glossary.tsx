import { useState, useMemo } from 'react';
import { Search, BookOpen, ChevronDown, ChevronUp, Hash, Zap, TrendingUp, Shield, Building2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { motion, AnimatePresence } from 'framer-motion';

export interface GlossaryTerm {
  term: string;
  definition: string;
  category: 'mining' | 'energy' | 'financial' | 'risk' | 'regulatory';
  relatedTerms?: string[];
  formula?: string;
}

const categoryIcons = {
  mining: <Hash className="w-4 h-4" />,
  energy: <Zap className="w-4 h-4" />,
  financial: <TrendingUp className="w-4 h-4" />,
  risk: <Shield className="w-4 h-4" />,
  regulatory: <Building2 className="w-4 h-4" />,
};

const categoryColors = {
  mining: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
  energy: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
  financial: 'bg-green-500/10 text-green-500 border-green-500/20',
  risk: 'bg-red-500/10 text-red-500 border-red-500/20',
  regulatory: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
};

const categoryLabels = {
  mining: 'Mining',
  energy: 'Energy',
  financial: 'Financial',
  risk: 'Risk',
  regulatory: 'Regulatory',
};

// Comprehensive glossary of Bitcoin mining terms
export const miningGlossary: GlossaryTerm[] = [
  // Mining Terms
  {
    term: 'Hashrate',
    definition: 'The computational power used to mine and process transactions on the Bitcoin network, measured in hashes per second (H/s). Higher hashrate means more chances of finding a block.',
    category: 'mining',
    relatedTerms: ['Difficulty', 'Block Reward', 'ASIC'],
  },
  {
    term: 'Difficulty',
    definition: 'A measure of how hard it is to find a hash below the target. The Bitcoin network adjusts difficulty every 2,016 blocks (~2 weeks) to maintain ~10 minute block times.',
    category: 'mining',
    relatedTerms: ['Hashrate', 'Block Time', 'Difficulty Adjustment'],
  },
  {
    term: 'Block Reward',
    definition: 'The amount of new Bitcoin created and awarded to miners for successfully mining a block. Currently 3.125 BTC per block (post-April 2024 halving).',
    category: 'mining',
    relatedTerms: ['Halving', 'Block Subsidy', 'Transaction Fees'],
  },
  {
    term: 'Halving',
    definition: 'An event occurring every 210,000 blocks (~4 years) where the block reward is cut in half. Reduces new Bitcoin supply and historically impacts miner economics significantly.',
    category: 'mining',
    relatedTerms: ['Block Reward', 'Bitcoin Supply', 'Mining Economics'],
  },
  {
    term: 'ASIC',
    definition: 'Application-Specific Integrated Circuit. Specialized hardware designed exclusively for Bitcoin mining, offering significantly higher efficiency than general-purpose hardware.',
    category: 'mining',
    relatedTerms: ['Hashrate', 'Efficiency', 'J/TH'],
  },
  {
    term: 'J/TH (Joules per Terahash)',
    definition: 'A measure of mining efficiency indicating energy consumption per unit of hashrate. Lower J/TH means more efficient mining. Modern ASICs achieve 15-25 J/TH.',
    category: 'mining',
    formula: 'J/TH = Power (Watts) / Hashrate (TH/s)',
    relatedTerms: ['ASIC', 'Efficiency', 'Power Consumption'],
  },
  {
    term: 'Mining Pool',
    definition: 'A group of miners who combine their computational resources to increase chances of finding blocks, sharing rewards proportionally based on contributed hashrate.',
    category: 'mining',
    relatedTerms: ['Hashrate', 'Block Reward', 'Pool Fees'],
  },
  
  // Energy Terms
  {
    term: 'Curtailment',
    definition: 'Voluntarily reducing power consumption during grid stress or high-price periods. Miners can earn revenue or avoid costs by participating in curtailment programs.',
    category: 'energy',
    relatedTerms: ['Demand Response', 'Load Factor', 'Ancillary Services'],
  },
  {
    term: 'Demand Response',
    definition: 'Programs that pay large power consumers to reduce electricity usage during peak demand periods. Bitcoin miners are ideal participants due to flexible, interruptible loads.',
    category: 'energy',
    relatedTerms: ['Curtailment', 'Ancillary Services', 'Grid Stability'],
  },
  {
    term: 'Load Factor',
    definition: 'The ratio of actual energy consumed to maximum possible consumption over a period. A 90% load factor means operating at 90% of capacity on average.',
    category: 'energy',
    formula: 'Load Factor = Actual Usage / (Max Capacity × Time)',
    relatedTerms: ['Uptime', 'Capacity Factor', 'Operating Hours'],
  },
  {
    term: 'Power Purchase Agreement (PPA)',
    definition: 'A long-term contract between a power generator and consumer (miner) specifying price, volume, and terms for electricity supply. Can provide price stability and lower costs.',
    category: 'energy',
    relatedTerms: ['Behind-the-Meter', 'Wholesale Power', 'Fixed-Price Contract'],
  },
  {
    term: 'Behind-the-Meter',
    definition: 'Power generation located at the mining site, avoiding transmission and distribution charges. Often involves direct connection to renewable energy sources.',
    category: 'energy',
    relatedTerms: ['PPA', 'Wheeling', 'Transmission Costs'],
  },
  {
    term: 'Ancillary Services',
    definition: 'Services that help grid operators maintain system reliability, including frequency regulation, spinning reserves, and voltage support. Miners can provide these for revenue.',
    category: 'energy',
    relatedTerms: ['Demand Response', 'Grid Services', 'Frequency Regulation'],
  },
  
  // Financial Terms
  {
    term: 'Hash Price',
    definition: 'Revenue earned per unit of hashrate per day, typically expressed as $/TH/day. A key metric for assessing mining profitability across different operations.',
    category: 'financial',
    formula: 'Hash Price = Daily Revenue / Hashrate (TH)',
    relatedTerms: ['Mining Revenue', 'Hashrate', 'Profitability'],
  },
  {
    term: 'Break-Even Price',
    definition: 'The Bitcoin price at which mining revenue equals operating costs. Below this price, mining becomes unprofitable on a cash basis.',
    category: 'financial',
    formula: 'Break-Even = (Power Cost × kWh/BTC) + Operating Costs',
    relatedTerms: ['All-in Cost', 'Profitability', 'Cash Flow'],
  },
  {
    term: 'All-in Sustaining Cost (AISC)',
    definition: 'Total cost to produce one Bitcoin including electricity, labor, maintenance, overhead, and sustaining capital expenditures. Key metric for comparing miner efficiency.',
    category: 'financial',
    relatedTerms: ['Break-Even Price', 'Operating Costs', 'CapEx'],
  },
  {
    term: 'Treasury Strategy',
    definition: 'How a mining company manages its Bitcoin holdings—whether to hold (HODL), sell immediately, or use financial derivatives for price hedging.',
    category: 'financial',
    relatedTerms: ['HODL', 'Hedging', 'Cash Flow Management'],
  },
  
  // Risk Terms
  {
    term: 'Difficulty Risk',
    definition: 'The risk that network difficulty will increase faster than expected, reducing mining rewards per unit of hashrate and potentially impacting profitability.',
    category: 'risk',
    relatedTerms: ['Difficulty', 'Hashrate Growth', 'Competition'],
  },
  {
    term: 'Technology Obsolescence',
    definition: 'The risk that newer, more efficient mining hardware will make existing equipment uncompetitive, requiring accelerated replacement or reduced profitability.',
    category: 'risk',
    relatedTerms: ['ASIC', 'Efficiency', 'Equipment Lifecycle'],
  },
  {
    term: 'Counterparty Risk',
    definition: 'The risk that a business partner (hosting provider, power supplier, equipment manufacturer) will fail to meet their contractual obligations.',
    category: 'risk',
    relatedTerms: ['Credit Risk', 'Vendor Risk', 'Contract Risk'],
  },
  
  // Regulatory Terms
  {
    term: 'Interconnection Agreement',
    definition: 'A contract with a utility that governs the connection of a mining facility to the electrical grid, including capacity, voltage, and technical requirements.',
    category: 'regulatory',
    relatedTerms: ['Grid Connection', 'Utility Agreement', 'Transmission'],
  },
  {
    term: 'Environmental Permitting',
    definition: 'The process of obtaining government approvals for environmental impact, including noise, emissions, water usage, and land use requirements.',
    category: 'regulatory',
    relatedTerms: ['Zoning', 'Compliance', 'Environmental Impact'],
  },
  {
    term: 'Noise Ordinance',
    definition: 'Local regulations limiting sound levels at property boundaries. ASIC cooling systems can generate 70-80 dB, requiring mitigation for compliance.',
    category: 'regulatory',
    relatedTerms: ['Zoning', 'Community Relations', 'Noise Mitigation'],
  },
];

interface GlossaryProps {
  terms?: GlossaryTerm[];
  className?: string;
  variant?: 'full' | 'compact';
}

export default function Glossary({ 
  terms = miningGlossary, 
  className = '',
  variant = 'full'
}: GlossaryProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [expandedTerm, setExpandedTerm] = useState<string | null>(null);

  const filteredTerms = useMemo(() => {
    return terms.filter(term => {
      const matchesSearch = term.term.toLowerCase().includes(searchQuery.toLowerCase()) ||
        term.definition.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = !selectedCategory || term.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [terms, searchQuery, selectedCategory]);

  const groupedTerms = useMemo(() => {
    const groups: Record<string, GlossaryTerm[]> = {};
    filteredTerms.forEach(term => {
      const firstLetter = term.term[0].toUpperCase();
      if (!groups[firstLetter]) groups[firstLetter] = [];
      groups[firstLetter].push(term);
    });
    return Object.entries(groups).sort(([a], [b]) => a.localeCompare(b));
  }, [filteredTerms]);

  const categories = ['mining', 'energy', 'financial', 'risk', 'regulatory'] as const;

  if (variant === 'compact') {
    return (
      <div className={`bg-card border border-border rounded-xl p-4 ${className}`}>
        <div className="flex items-center gap-2 mb-4">
          <BookOpen className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-foreground">Key Terms</h3>
        </div>
        <div className="space-y-2">
          {terms.slice(0, 5).map(term => (
            <div key={term.term} className="text-sm">
              <span className="font-medium text-foreground">{term.term}:</span>
              <span className="text-muted-foreground ml-1">
                {term.definition.substring(0, 100)}...
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-card border border-border rounded-2xl overflow-hidden ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-border bg-gradient-to-r from-primary/5 to-transparent">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-primary/10 rounded-lg">
            <BookOpen className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">Mining Glossary</h2>
            <p className="text-sm text-muted-foreground">{terms.length} terms defined</p>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search terms..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2 mt-4">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-colors ${
              !selectedCategory 
                ? 'bg-primary text-primary-foreground border-primary' 
                : 'bg-muted text-muted-foreground border-border hover:border-primary/50'
            }`}
          >
            All
          </button>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat === selectedCategory ? null : cat)}
              className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-colors flex items-center gap-1.5 ${
                selectedCategory === cat
                  ? 'bg-primary text-primary-foreground border-primary'
                  : `${categoryColors[cat]} border hover:opacity-80`
              }`}
            >
              {categoryIcons[cat]}
              {categoryLabels[cat]}
            </button>
          ))}
        </div>
      </div>

      {/* Terms List */}
      <div className="max-h-[500px] overflow-y-auto">
        {groupedTerms.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            No terms found matching your search.
          </div>
        ) : (
          groupedTerms.map(([letter, letterTerms]) => (
            <div key={letter}>
              <div className="sticky top-0 px-6 py-2 bg-muted/50 backdrop-blur-sm border-b border-border">
                <span className="text-sm font-bold text-primary">{letter}</span>
              </div>
              {letterTerms.map(term => (
                <div 
                  key={term.term}
                  className="border-b border-border last:border-0"
                >
                  <button
                    onClick={() => setExpandedTerm(expandedTerm === term.term ? null : term.term)}
                    className="w-full px-6 py-4 text-left hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className={`p-1.5 rounded ${categoryColors[term.category]}`}>
                          {categoryIcons[term.category]}
                        </span>
                        <span className="font-semibold text-foreground">{term.term}</span>
                      </div>
                      {expandedTerm === term.term ? (
                        <ChevronUp className="w-4 h-4 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-muted-foreground" />
                      )}
                    </div>
                  </button>
                  
                  <AnimatePresence>
                    {expandedTerm === term.term && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="px-6 pb-4 space-y-3">
                          <p className="text-sm text-muted-foreground leading-relaxed">
                            {term.definition}
                          </p>
                          {term.formula && (
                            <div className="p-3 bg-muted/50 rounded-lg font-mono text-sm">
                              <span className="text-xs text-muted-foreground block mb-1">Formula:</span>
                              {term.formula}
                            </div>
                          )}
                          {term.relatedTerms && (
                            <div className="flex flex-wrap gap-2">
                              <span className="text-xs text-muted-foreground">Related:</span>
                              {term.relatedTerms.map(related => (
                                <button
                                  key={related}
                                  onClick={() => {
                                    setSearchQuery(related);
                                    setExpandedTerm(null);
                                  }}
                                  className="text-xs px-2 py-1 bg-primary/10 text-primary rounded hover:bg-primary/20 transition-colors"
                                >
                                  {related}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// Inline term component for use within content
interface InlineTermProps {
  term: string;
  children?: React.ReactNode;
}

export function InlineTerm({ term, children }: InlineTermProps) {
  const glossaryTerm = miningGlossary.find(t => t.term.toLowerCase() === term.toLowerCase());
  
  if (!glossaryTerm) {
    return <span className="font-medium">{children || term}</span>;
  }

  return (
    <span className="relative group">
      <span className="font-medium text-primary border-b border-dashed border-primary/50 cursor-help">
        {children || term}
      </span>
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 bg-card border border-border rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
        <div className="text-xs font-medium text-foreground mb-1">{glossaryTerm.term}</div>
        <div className="text-xs text-muted-foreground">{glossaryTerm.definition}</div>
      </div>
    </span>
  );
}
