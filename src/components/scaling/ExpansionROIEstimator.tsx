import { useState } from "react";
import { Calculator, TrendingUp, Clock, DollarSign } from "lucide-react";
import { Slider } from "@/components/ui/slider";

interface ApproachResult {
  name: string;
  capitalCost: number;
  timeline: number;
  roi: number;
  breakEvenMonths: number;
  recommended: boolean;
  pros: string[];
  cons: string[];
}

export const ExpansionROIEstimator = () => {
  const [targetMW, setTargetMW] = useState(30);
  const [availableBudget, setAvailableBudget] = useState(20);
  const [timelineConstraint, setTimelineConstraint] = useState(18);
  const [hasExistingInfra, setHasExistingInfra] = useState(true);

  const calculateApproaches = (): ApproachResult[] => {
    const costPerMWBrownfield = 400000; // $400K/MW
    const costPerMWGreenfield = 600000; // $600K/MW
    const costPerMWConversion = 350000; // $350K/MW (industrial conversion)
    
    const revenuePerMWPerMonth = 45000; // ~$45K revenue per MW/month at good efficiency
    const opexPerMWPerMonth = 25000; // ~$25K operating cost per MW/month

    const netProfitPerMWPerMonth = revenuePerMWPerMonth - opexPerMWPerMonth;

    const approaches: ApproachResult[] = [
      {
        name: "Brownfield Expansion",
        capitalCost: targetMW * costPerMWBrownfield,
        timeline: 8, // months
        roi: ((netProfitPerMWPerMonth * targetMW * 12) / (targetMW * costPerMWBrownfield)) * 100,
        breakEvenMonths: Math.ceil((targetMW * costPerMWBrownfield) / (netProfitPerMWPerMonth * targetMW)),
        recommended: hasExistingInfra && timelineConstraint <= 12,
        pros: [
          "Fastest deployment (6-10 months)",
          "Leverage existing infrastructure",
          "Lower permitting complexity"
        ],
        cons: [
          "Limited by existing site capacity",
          "May require infrastructure upgrades"
        ]
      },
      {
        name: "Greenfield Development",
        capitalCost: targetMW * costPerMWGreenfield,
        timeline: 18, // months
        roi: ((netProfitPerMWPerMonth * targetMW * 12) / (targetMW * costPerMWGreenfield)) * 100,
        breakEvenMonths: Math.ceil((targetMW * costPerMWGreenfield) / (netProfitPerMWPerMonth * targetMW)),
        recommended: !hasExistingInfra && targetMW >= 50,
        pros: [
          "Purpose-built for mining",
          "Optimal layout and efficiency",
          "Scalable design from start"
        ],
        cons: [
          "Longest timeline (14-24 months)",
          "Highest capital requirement",
          "Full permitting process"
        ]
      },
      {
        name: "Industrial Conversion",
        capitalCost: targetMW * costPerMWConversion,
        timeline: 12, // months
        roi: ((netProfitPerMWPerMonth * targetMW * 12) / (targetMW * costPerMWConversion)) * 100,
        breakEvenMonths: Math.ceil((targetMW * costPerMWConversion) / (netProfitPerMWPerMonth * targetMW)),
        recommended: availableBudget * 1000000 < targetMW * costPerMWBrownfield,
        pros: [
          "Lowest capital cost per MW",
          "Existing power infrastructure",
          "Moderate timeline (10-14 months)"
        ],
        cons: [
          "Dependent on suitable properties",
          "May need retrofitting",
          "Cooling modifications often needed"
        ]
      }
    ];

    // Mark the best approach
    const withinBudget = approaches.filter(a => a.capitalCost <= availableBudget * 1000000);
    const withinTimeline = withinBudget.filter(a => a.timeline <= timelineConstraint);
    
    if (withinTimeline.length > 0) {
      const best = withinTimeline.reduce((a, b) => a.roi > b.roi ? a : b);
      approaches.forEach(a => a.recommended = a.name === best.name);
    }

    return approaches;
  };

  const approaches = calculateApproaches();
  const recommendedApproach = approaches.find(a => a.recommended) || approaches[0];

  const formatCurrency = (value: number) => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`;
    }
    return `$${(value / 1000).toFixed(0)}K`;
  };

  return (
    <div className="bg-card rounded-xl p-6 shadow-lg border border-border">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-watt-success/10 rounded-lg flex items-center justify-center">
          <Calculator className="w-6 h-6 text-watt-success" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-foreground">Expansion ROI Estimator</h3>
          <p className="text-sm text-muted-foreground">Compare expansion approaches</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-8">
        {/* Inputs */}
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-foreground mb-3">
              Target Additional Capacity: {targetMW} MW
            </label>
            <Slider
              value={[targetMW]}
              onValueChange={([value]) => setTargetMW(value)}
              min={10}
              max={100}
              step={5}
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-3">
              Available Capital Budget: ${availableBudget}M
            </label>
            <Slider
              value={[availableBudget]}
              onValueChange={([value]) => setAvailableBudget(value)}
              min={5}
              max={100}
              step={5}
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-3">
              Timeline Constraint: {timelineConstraint} months
            </label>
            <Slider
              value={[timelineConstraint]}
              onValueChange={([value]) => setTimelineConstraint(value)}
              min={6}
              max={24}
              step={3}
              className="w-full"
            />
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="existing-infra"
              checked={hasExistingInfra}
              onChange={(e) => setHasExistingInfra(e.target.checked)}
              className="w-4 h-4 rounded border-border"
            />
            <label htmlFor="existing-infra" className="text-sm text-foreground">
              Have existing infrastructure to expand
            </label>
          </div>
        </div>

        {/* Recommended Approach */}
        <div className="bg-watt-success/5 border border-watt-success/20 rounded-xl p-4">
          <div className="text-sm font-medium text-watt-success mb-2">Recommended Approach</div>
          <div className="text-xl font-bold text-foreground mb-4">{recommendedApproach.name}</div>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="text-center p-3 bg-background rounded-lg">
              <DollarSign className="w-5 h-5 text-watt-success mx-auto mb-1" />
              <div className="text-lg font-bold text-foreground">
                {formatCurrency(recommendedApproach.capitalCost)}
              </div>
              <div className="text-xs text-muted-foreground">Capital Required</div>
            </div>
            <div className="text-center p-3 bg-background rounded-lg">
              <Clock className="w-5 h-5 text-watt-bitcoin mx-auto mb-1" />
              <div className="text-lg font-bold text-foreground">
                {recommendedApproach.timeline} mo
              </div>
              <div className="text-xs text-muted-foreground">Timeline</div>
            </div>
            <div className="text-center p-3 bg-background rounded-lg">
              <TrendingUp className="w-5 h-5 text-watt-success mx-auto mb-1" />
              <div className="text-lg font-bold text-foreground">
                {recommendedApproach.roi.toFixed(0)}%
              </div>
              <div className="text-xs text-muted-foreground">Annual ROI</div>
            </div>
            <div className="text-center p-3 bg-background rounded-lg">
              <Calculator className="w-5 h-5 text-watt-coinbase mx-auto mb-1" />
              <div className="text-lg font-bold text-foreground">
                {recommendedApproach.breakEvenMonths} mo
              </div>
              <div className="text-xs text-muted-foreground">Break-even</div>
            </div>
          </div>

          <div className="text-sm">
            <div className="text-watt-success font-medium mb-1">Pros:</div>
            <ul className="text-muted-foreground space-y-1 mb-3">
              {recommendedApproach.pros.map((pro, i) => (
                <li key={i}>• {pro}</li>
              ))}
            </ul>
            <div className="text-destructive font-medium mb-1">Cons:</div>
            <ul className="text-muted-foreground space-y-1">
              {recommendedApproach.cons.map((con, i) => (
                <li key={i}>• {con}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* All Approaches Comparison */}
      <div className="border-t border-border pt-6">
        <h4 className="font-semibold text-foreground mb-4">All Approaches Comparison</h4>
        <div className="grid md:grid-cols-3 gap-4">
          {approaches.map((approach, index) => (
            <div 
              key={index}
              className={`rounded-lg p-4 border ${
                approach.recommended 
                  ? 'border-watt-success bg-watt-success/5' 
                  : 'border-border bg-muted/20'
              }`}
            >
              <div className="font-medium text-foreground mb-2">{approach.name}</div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-muted-foreground">Cost:</span>{' '}
                  <span className="font-medium text-foreground">{formatCurrency(approach.capitalCost)}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Time:</span>{' '}
                  <span className="font-medium text-foreground">{approach.timeline} mo</span>
                </div>
                <div>
                  <span className="text-muted-foreground">ROI:</span>{' '}
                  <span className="font-medium text-watt-success">{approach.roi.toFixed(0)}%</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Break-even:</span>{' '}
                  <span className="font-medium text-foreground">{approach.breakEvenMonths} mo</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
