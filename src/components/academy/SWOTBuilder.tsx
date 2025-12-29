import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  X, 
  Shield, 
  AlertTriangle, 
  TrendingUp, 
  TrendingDown,
  Lightbulb,
  Download,
  RotateCcw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

type SWOTCategory = 'strengths' | 'weaknesses' | 'opportunities' | 'threats';

interface SWOTItem {
  id: string;
  text: string;
}

interface SWOTData {
  strengths: SWOTItem[];
  weaknesses: SWOTItem[];
  opportunities: SWOTItem[];
  threats: SWOTItem[];
}

const categoryConfig: Record<SWOTCategory, {
  title: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  borderColor: string;
  description: string;
  suggestions: string[];
}> = {
  strengths: {
    title: 'Strengths',
    icon: <Shield className="w-5 h-5" />,
    color: 'text-green-500',
    bgColor: 'bg-green-500/10',
    borderColor: 'border-green-500/30',
    description: 'Internal advantages',
    suggestions: [
      'Low-cost power access',
      'Experienced management team',
      'Modern ASIC fleet',
      'Strong utility relationships',
      'Diversified site portfolio',
      'Conservative capital structure',
    ],
  },
  weaknesses: {
    title: 'Weaknesses',
    icon: <AlertTriangle className="w-5 h-5" />,
    color: 'text-red-500',
    bgColor: 'bg-red-500/10',
    borderColor: 'border-red-500/30',
    description: 'Internal limitations',
    suggestions: [
      'Single-site concentration',
      'High leverage ratio',
      'Aging equipment',
      'Limited demand response capability',
      'Small scale operations',
      'Inexperienced in market downturns',
    ],
  },
  opportunities: {
    title: 'Opportunities',
    icon: <TrendingUp className="w-5 h-5" />,
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/30',
    description: 'External potential',
    suggestions: [
      'Distressed asset acquisitions',
      'New renewable partnerships',
      'Grid services revenue',
      'Institutional capital inflow',
      'Stranded gas monetization',
      'International expansion',
    ],
  },
  threats: {
    title: 'Threats',
    icon: <TrendingDown className="w-5 h-5" />,
    color: 'text-amber-500',
    bgColor: 'bg-amber-500/10',
    borderColor: 'border-amber-500/30',
    description: 'External risks',
    suggestions: [
      'Regulatory crackdowns',
      'Rapid difficulty increases',
      'BTC price collapse',
      'Power cost increases',
      'Next-gen ASIC releases',
      'Halving impact',
    ],
  },
};

interface SWOTBuilderProps {
  className?: string;
  initialData?: SWOTData;
  onSave?: (data: SWOTData) => void;
}

const generateId = () => Math.random().toString(36).substr(2, 9);

export default function SWOTBuilder({ className = '', initialData, onSave }: SWOTBuilderProps) {
  const [data, setData] = useState<SWOTData>(initialData || {
    strengths: [],
    weaknesses: [],
    opportunities: [],
    threats: [],
  });
  const [newItemText, setNewItemText] = useState<Record<SWOTCategory, string>>({
    strengths: '',
    weaknesses: '',
    opportunities: '',
    threats: '',
  });
  const [showSuggestions, setShowSuggestions] = useState<SWOTCategory | null>(null);

  const addItem = (category: SWOTCategory, text?: string) => {
    const itemText = text || newItemText[category].trim();
    if (!itemText) return;

    setData(prev => ({
      ...prev,
      [category]: [...prev[category], { id: generateId(), text: itemText }],
    }));
    setNewItemText(prev => ({ ...prev, [category]: '' }));
  };

  const removeItem = (category: SWOTCategory, id: string) => {
    setData(prev => ({
      ...prev,
      [category]: prev[category].filter(item => item.id !== id),
    }));
  };

  const resetAll = () => {
    setData({
      strengths: [],
      weaknesses: [],
      opportunities: [],
      threats: [],
    });
  };

  const totalItems = Object.values(data).flat().length;

  return (
    <div className={`bg-card border border-border rounded-2xl overflow-hidden ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-border bg-gradient-to-r from-primary/10 via-primary/5 to-transparent">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-xl font-bold text-foreground mb-2">SWOT Analysis Builder</h3>
            <p className="text-sm text-muted-foreground">
              Build a strategic analysis for your mining operation
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={resetAll}>
              <RotateCcw className="w-4 h-4 mr-1" />
              Reset
            </Button>
          </div>
        </div>
      </div>

      {/* SWOT Grid */}
      <div className="grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-border">
        {(Object.keys(categoryConfig) as SWOTCategory[]).map((category) => {
          const config = categoryConfig[category];
          const items = data[category];

          return (
            <div key={category} className="p-4">
              {/* Category Header */}
              <div className={`flex items-center gap-2 mb-3 p-2 rounded-lg ${config.bgColor}`}>
                <span className={config.color}>{config.icon}</span>
                <div>
                  <h4 className={`font-semibold ${config.color}`}>{config.title}</h4>
                  <p className="text-xs text-muted-foreground">{config.description}</p>
                </div>
              </div>

              {/* Items List */}
              <div className="space-y-2 mb-3 min-h-[120px]">
                <AnimatePresence>
                  {items.map((item) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className={`flex items-center gap-2 p-2 rounded-lg border ${config.borderColor} ${config.bgColor}`}
                    >
                      <span className="text-sm text-foreground flex-1">{item.text}</span>
                      <button
                        onClick={() => removeItem(category, item.id)}
                        className="p-1 hover:bg-muted rounded transition-colors"
                      >
                        <X className="w-3 h-3 text-muted-foreground" />
                      </button>
                    </motion.div>
                  ))}
                </AnimatePresence>

                {items.length === 0 && (
                  <div className="text-sm text-muted-foreground text-center py-4">
                    No items added yet
                  </div>
                )}
              </div>

              {/* Add Item Input */}
              <div className="space-y-2">
                <div className="flex gap-2">
                  <Input
                    placeholder={`Add ${config.title.toLowerCase().slice(0, -1)}...`}
                    value={newItemText[category]}
                    onChange={(e) => setNewItemText(prev => ({ ...prev, [category]: e.target.value }))}
                    onKeyDown={(e) => e.key === 'Enter' && addItem(category)}
                    className="text-sm"
                  />
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => addItem(category)}
                    disabled={!newItemText[category].trim()}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>

                {/* Suggestions Toggle */}
                <button
                  onClick={() => setShowSuggestions(showSuggestions === category ? null : category)}
                  className="flex items-center gap-1 text-xs text-primary hover:underline"
                >
                  <Lightbulb className="w-3 h-3" />
                  {showSuggestions === category ? 'Hide suggestions' : 'Show suggestions'}
                </button>

                {/* Suggestions List */}
                <AnimatePresence>
                  {showSuggestions === category && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="flex flex-wrap gap-1"
                    >
                      {config.suggestions.map((suggestion, idx) => (
                        <button
                          key={idx}
                          onClick={() => addItem(category, suggestion)}
                          disabled={items.some(item => item.text === suggestion)}
                          className={`text-xs px-2 py-1 rounded border transition-colors
                            ${items.some(item => item.text === suggestion)
                              ? 'bg-muted text-muted-foreground cursor-not-allowed'
                              : `${config.borderColor} hover:${config.bgColor}`
                            }`}
                        >
                          + {suggestion}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer Summary */}
      <div className="px-6 py-4 bg-muted/30 border-t border-border">
        <div className="flex items-center justify-between">
          <div className="flex gap-4 text-sm text-muted-foreground">
            {(Object.keys(categoryConfig) as SWOTCategory[]).map((category) => (
              <span key={category}>
                <span className={categoryConfig[category].color}>{data[category].length}</span>
                {' '}{categoryConfig[category].title}
              </span>
            ))}
          </div>
          <div className="text-sm text-muted-foreground">
            {totalItems} total items
          </div>
        </div>
      </div>
    </div>
  );
}

// Pre-populated SWOT for example/reference
export const exampleMiningSWOT: SWOTData = {
  strengths: [
    { id: '1', text: 'Sub-$0.04/kWh power through long-term PPA' },
    { id: '2', text: 'Latest-generation Antminer S21 fleet' },
    { id: '3', text: 'Experienced operations team from energy sector' },
    { id: '4', text: 'Strong banking relationships for equipment financing' },
  ],
  weaknesses: [
    { id: '5', text: 'Single-site concentration in Texas' },
    { id: '6', text: 'No demand response enrollment yet' },
    { id: '7', text: '60% debt financing creates leverage risk' },
  ],
  opportunities: [
    { id: '8', text: 'Expand into ERCOT demand response programs' },
    { id: '9', text: 'Acquire distressed competitor assets at discount' },
    { id: '10', text: 'Partner with stranded natural gas producers' },
    { id: '11', text: 'Develop AI/HPC hosting as secondary revenue' },
  ],
  threats: [
    { id: '12', text: 'April 2024 halving reduces block rewards 50%' },
    { id: '13', text: 'Potential Texas grid regulations targeting miners' },
    { id: '14', text: 'BTC price volatility during bear markets' },
    { id: '15', text: 'New Hydro-cooled ASICs may obsolete fleet faster' },
  ],
};
