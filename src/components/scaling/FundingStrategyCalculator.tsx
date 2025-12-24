import { useState } from "react";
import { Wallet, TrendingUp, AlertTriangle, PieChart } from "lucide-react";
import { Slider } from "@/components/ui/slider";

export const FundingStrategyCalculator = () => {
  const [projectSizeMW, setProjectSizeMW] = useState(50);
  const [capitalRequired, setCapitalRequired] = useState(30);
  const [existingEquity, setExistingEquity] = useState(5);
  const [riskTolerance, setRiskTolerance] = useState(50);

  // Calculate recommended capital stack based on inputs
  const calculateCapitalStack = () => {
    const totalCapital = capitalRequired * 1000000;
    const equityAvailable = existingEquity * 1000000;
    const capitalGap = totalCapital - equityAvailable;
    
    // Risk tolerance affects debt/equity mix
    const riskMultiplier = riskTolerance / 100;
    
    // Base allocation
    let seniorDebt = 0;
    let mezzanine = 0;
    let equipmentFinancing = 0;
    let equity = equityAvailable;
    let newEquity = 0;

    // Equipment financing typically 30-40% of capital for mining
    equipmentFinancing = Math.min(totalCapital * 0.35, capitalGap * 0.5);
    
    // Senior debt based on risk tolerance
    seniorDebt = Math.min(
      capitalGap * 0.4 * riskMultiplier,
      totalCapital * 0.3
    );
    
    // Mezzanine fills gap for higher risk tolerance
    mezzanine = riskMultiplier > 0.5 
      ? Math.min((capitalGap - seniorDebt - equipmentFinancing) * 0.3, totalCapital * 0.15)
      : 0;
    
    // Remaining needs to be equity
    const debtTotal = seniorDebt + mezzanine + equipmentFinancing;
    newEquity = Math.max(0, totalCapital - debtTotal - equity);
    
    // Ensure we hit total
    const allocated = equity + newEquity + seniorDebt + mezzanine + equipmentFinancing;
    if (allocated < totalCapital) {
      newEquity += totalCapital - allocated;
    }

    return {
      seniorDebt,
      mezzanine,
      equipmentFinancing,
      existingEquity: equity,
      newEquity,
      total: totalCapital
    };
  };

  const stack = calculateCapitalStack();

  const calculateWACC = () => {
    const total = stack.total;
    if (total === 0) return 0;

    const costOfEquity = 0.20; // 20% expected return
    const costOfSeniorDebt = 0.08; // 8%
    const costOfMezzanine = 0.14; // 14%
    const costOfEquipmentFinancing = 0.10; // 10%

    const wacc = (
      ((stack.existingEquity + stack.newEquity) / total) * costOfEquity +
      (stack.seniorDebt / total) * costOfSeniorDebt +
      (stack.mezzanine / total) * costOfMezzanine +
      (stack.equipmentFinancing / total) * costOfEquipmentFinancing
    ) * 100;

    return wacc;
  };

  const calculateAnnualDebtService = () => {
    // Simplified: 5-year amortization for equipment, 7-year for senior debt
    const seniorDebtService = (stack.seniorDebt * 0.08) + (stack.seniorDebt / 7);
    const mezzanineService = (stack.mezzanine * 0.14) + (stack.mezzanine / 5);
    const equipmentService = (stack.equipmentFinancing * 0.10) + (stack.equipmentFinancing / 5);
    
    return seniorDebtService + mezzanineService + equipmentService;
  };

  const formatCurrency = (value: number) => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`;
    }
    return `$${(value / 1000).toFixed(0)}K`;
  };

  const formatPercent = (value: number, total: number) => {
    if (total === 0) return '0%';
    return `${((value / total) * 100).toFixed(0)}%`;
  };

  const stackItems = [
    { name: 'Senior Debt', value: stack.seniorDebt, color: 'bg-blue-500', rate: '7-9%' },
    { name: 'Equipment Financing', value: stack.equipmentFinancing, color: 'bg-cyan-500', rate: '9-12%' },
    { name: 'Mezzanine', value: stack.mezzanine, color: 'bg-amber-500', rate: '12-16%' },
    { name: 'Existing Equity', value: stack.existingEquity, color: 'bg-watt-success', rate: '18-25%' },
    { name: 'New Equity Required', value: stack.newEquity, color: 'bg-purple-500', rate: '18-25%' },
  ].filter(item => item.value > 0);

  const debtToEquity = stack.total > 0 
    ? ((stack.seniorDebt + stack.mezzanine + stack.equipmentFinancing) / (stack.existingEquity + stack.newEquity))
    : 0;

  return (
    <div className="bg-card rounded-xl p-6 shadow-lg border border-border">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-watt-success/10 rounded-lg flex items-center justify-center">
          <Wallet className="w-6 h-6 text-watt-success" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-foreground">Funding Strategy Calculator</h3>
          <p className="text-sm text-muted-foreground">Structure your capital stack</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Inputs */}
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-foreground mb-3">
              Project Size: {projectSizeMW} MW
            </label>
            <Slider
              value={[projectSizeMW]}
              onValueChange={([value]) => setProjectSizeMW(value)}
              min={10}
              max={200}
              step={10}
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-3">
              Capital Required: ${capitalRequired}M
            </label>
            <Slider
              value={[capitalRequired]}
              onValueChange={([value]) => setCapitalRequired(value)}
              min={5}
              max={150}
              step={5}
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-3">
              Existing Equity Available: ${existingEquity}M
            </label>
            <Slider
              value={[existingEquity]}
              onValueChange={([value]) => setExistingEquity(value)}
              min={0}
              max={50}
              step={1}
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-3">
              Risk Tolerance: {riskTolerance}% (Higher = More Leverage)
            </label>
            <Slider
              value={[riskTolerance]}
              onValueChange={([value]) => setRiskTolerance(value)}
              min={20}
              max={80}
              step={5}
              className="w-full"
            />
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
            <div className="bg-muted/30 rounded-lg p-4 text-center">
              <TrendingUp className="w-5 h-5 text-watt-success mx-auto mb-2" />
              <div className="text-2xl font-bold text-foreground">{calculateWACC().toFixed(1)}%</div>
              <div className="text-xs text-muted-foreground">Blended WACC</div>
            </div>
            <div className="bg-muted/30 rounded-lg p-4 text-center">
              <PieChart className="w-5 h-5 text-watt-bitcoin mx-auto mb-2" />
              <div className="text-2xl font-bold text-foreground">{debtToEquity.toFixed(1)}x</div>
              <div className="text-xs text-muted-foreground">Debt/Equity</div>
            </div>
          </div>

          {/* Annual Debt Service */}
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              <span className="text-sm font-medium text-foreground">Annual Debt Service</span>
            </div>
            <div className="text-2xl font-bold text-foreground">
              {formatCurrency(calculateAnnualDebtService())}
            </div>
            <div className="text-xs text-muted-foreground">
              Principal + Interest payments per year
            </div>
          </div>
        </div>

        {/* Capital Stack Visualization */}
        <div>
          <h4 className="font-semibold text-foreground mb-4">Recommended Capital Stack</h4>
          
          {/* Stacked Bar */}
          <div className="h-12 rounded-lg overflow-hidden flex mb-6">
            {stackItems.map((item, index) => (
              <div
                key={index}
                className={`${item.color} transition-all duration-300`}
                style={{ width: formatPercent(item.value, stack.total) }}
                title={`${item.name}: ${formatCurrency(item.value)}`}
              />
            ))}
          </div>

          {/* Legend */}
          <div className="space-y-3">
            {stackItems.map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded ${item.color}`} />
                  <span className="text-sm text-foreground">{item.name}</span>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <span className="text-muted-foreground">{item.rate}</span>
                  <span className="font-medium text-foreground w-16 text-right">
                    {formatCurrency(item.value)}
                  </span>
                  <span className="text-muted-foreground w-12 text-right">
                    {formatPercent(item.value, stack.total)}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Total */}
          <div className="mt-4 pt-4 border-t border-border flex justify-between items-center">
            <span className="font-semibold text-foreground">Total Capital</span>
            <span className="text-xl font-bold text-foreground">{formatCurrency(stack.total)}</span>
          </div>

          {/* Dilution Warning */}
          {stack.newEquity > stack.existingEquity && (
            <div className="mt-4 bg-destructive/10 border border-destructive/20 rounded-lg p-3">
              <div className="flex items-center gap-2 text-sm">
                <AlertTriangle className="w-4 h-4 text-destructive" />
                <span className="text-destructive font-medium">High Dilution Risk</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                New equity required exceeds your existing stake. Consider phased approach or more debt.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
