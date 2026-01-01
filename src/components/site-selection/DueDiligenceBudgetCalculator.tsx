import { useState } from 'react';
import { Calculator, FileText, DollarSign, Clock, AlertTriangle } from 'lucide-react';

const DueDiligenceBudgetCalculator = () => {
  const [siteComplexity, setSiteComplexity] = useState<'simple' | 'moderate' | 'complex'>('moderate');
  const [mwSize, setMwSize] = useState(50);

  const complexityMultipliers = {
    simple: 0.7,
    moderate: 1.0,
    complex: 1.5
  };

  const calculateBudget = () => {
    const baseMultiplier = complexityMultipliers[siteComplexity];
    const sizeMultiplier = Math.max(1, mwSize / 50);
    
    const phase1 = Math.round((10000 + mwSize * 100) * baseMultiplier);
    const phase2 = Math.round((50000 + mwSize * 500) * baseMultiplier * sizeMultiplier);
    const phase3 = Math.round((30000 + mwSize * 300) * baseMultiplier);
    const phase4 = Math.round((15000 + mwSize * 100) * baseMultiplier);
    
    const total = phase1 + phase2 + phase3 + phase4;
    
    const timelineWeeks = {
      simple: 6,
      moderate: 9,
      complex: 14
    };
    
    return {
      phase1: { cost: phase1, label: 'Initial Screening', duration: '1-2 weeks' },
      phase2: { cost: phase2, label: 'Technical Assessment', duration: '2-4 weeks' },
      phase3: { cost: phase3, label: 'Legal & Financial', duration: '2-4 weeks' },
      phase4: { cost: phase4, label: 'Final Approval', duration: '1-2 weeks' },
      total,
      timeline: timelineWeeks[siteComplexity]
    };
  };

  const budget = calculateBudget();

  const formatCurrency = (amount: number) => {
    if (amount >= 1000) {
      return `$${(amount / 1000).toFixed(0)}K`;
    }
    return `$${amount.toLocaleString()}`;
  };

  return (
    <div className="bg-card rounded-2xl shadow-lg border border-border p-6">
      <h3 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
        <Calculator className="w-5 h-5 text-primary" />
        Due Diligence Budget Calculator
      </h3>
      <p className="text-sm text-muted-foreground mb-6">
        Estimate the budget needed for comprehensive site due diligence based on complexity and size.
      </p>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Inputs */}
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-foreground mb-3">Site Complexity</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { key: 'simple', label: 'Simple', desc: 'Existing power, clear zoning' },
                { key: 'moderate', label: 'Moderate', desc: 'Standard development' },
                { key: 'complex', label: 'Complex', desc: 'Greenfield, multiple issues' }
              ].map((option) => (
                <button
                  key={option.key}
                  onClick={() => setSiteComplexity(option.key as typeof siteComplexity)}
                  className={`p-3 rounded-xl text-center transition-all border-2 ${
                    siteComplexity === option.key
                      ? 'border-primary bg-primary/10'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <div className={`font-medium text-sm ${
                    siteComplexity === option.key ? 'text-primary' : 'text-foreground'
                  }`}>
                    {option.label}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">{option.desc}</div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Target MW Size</label>
            <input
              type="range"
              min="10"
              max="200"
              step="10"
              value={mwSize}
              onChange={(e) => setMwSize(Number(e.target.value))}
              className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-sm text-muted-foreground mt-1">
              <span>10 MW</span>
              <span className="text-primary font-bold">{mwSize} MW</span>
              <span>200 MW</span>
            </div>
          </div>

          <div className="p-4 bg-market-positive/10 rounded-xl">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-market-positive" />
              <span className="font-medium text-foreground">Estimated Timeline</span>
            </div>
            <div className="text-2xl font-bold text-market-positive">
              {budget.timeline} weeks
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              From initial screening to final approval
            </p>
          </div>
        </div>

        {/* Budget Breakdown */}
        <div>
          <div className="space-y-3 mb-6">
            {[budget.phase1, budget.phase2, budget.phase3, budget.phase4].map((phase, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    idx === 0 ? 'bg-primary/20 text-primary' :
                    idx === 1 ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' :
                    idx === 2 ? 'bg-secondary/20 text-secondary' :
                    'bg-market-positive/20 text-market-positive'
                  }`}>
                    {idx + 1}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-foreground">{phase.label}</div>
                    <div className="text-xs text-muted-foreground">{phase.duration}</div>
                  </div>
                </div>
                <span className="font-bold text-foreground">{formatCurrency(phase.cost)}</span>
              </div>
            ))}
          </div>

          <div className="p-4 bg-card-dark rounded-xl text-center">
            <div className="text-sm text-muted-foreground mb-1">Total Due Diligence Budget</div>
            <div className="text-3xl font-bold text-secondary">{formatCurrency(budget.total)}</div>
            <div className="text-xs text-muted-foreground mt-2">
              For {mwSize} MW {siteComplexity} site
            </div>
          </div>

          <div className="mt-4 p-3 bg-secondary/10 rounded-lg flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-secondary flex-shrink-0 mt-0.5" />
            <p className="text-xs text-muted-foreground">
              <strong className="text-secondary">Budget Tip:</strong> Allocate 10-15% contingency 
              for unexpected findings. Phase II environmental assessments can add $20-50K if contamination is suspected.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DueDiligenceBudgetCalculator;
