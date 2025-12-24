import { useState, useMemo } from "react";
import { Calculator, TrendingUp, TrendingDown, AlertTriangle } from "lucide-react";
import { ScrollReveal } from "@/components/landing/ScrollAnimations";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";

export const BreakEvenCalculator = () => {
  const [hashrate, setHashrate] = useState(100); // TH/s
  const [efficiency, setEfficiency] = useState(25); // J/TH
  const [powerCost, setPowerCost] = useState(0.05); // $/kWh
  const [opex, setOpex] = useState(5000); // $/month
  const [btcPrice, setBtcPrice] = useState(42000); // Current BTC price
  const [networkDifficulty, setNetworkDifficulty] = useState(72); // T

  const calculations = useMemo(() => {
    // Power consumption in kW
    const powerKw = (hashrate * efficiency) / 1000;
    // Monthly power cost
    const monthlyPowerCost = powerKw * 24 * 30 * powerCost;
    // Total monthly costs
    const totalMonthlyCost = monthlyPowerCost + opex;
    
    // BTC mining estimate (simplified)
    // Block reward: 3.125 BTC, blocks per day: 144
    const dailyBtcNetwork = 3.125 * 144;
    const networkHashrate = networkDifficulty * 1e12 / 600 * Math.pow(2, 32) / 1e12; // Approximate EH/s
    const myShareOfNetwork = hashrate / (networkHashrate * 1e6);
    const dailyBtc = dailyBtcNetwork * myShareOfNetwork;
    const monthlyBtc = dailyBtc * 30;
    
    // Revenue at current price
    const monthlyRevenue = monthlyBtc * btcPrice;
    const dailyRevenue = dailyBtc * btcPrice;
    
    // Profit
    const monthlyProfit = monthlyRevenue - totalMonthlyCost;
    const profitMargin = monthlyRevenue > 0 ? (monthlyProfit / monthlyRevenue) * 100 : 0;
    
    // Break-even BTC price
    const breakEvenPrice = monthlyBtc > 0 ? totalMonthlyCost / monthlyBtc : 0;
    
    // Comparison thresholds
    const efficientOperator = 20000; // $20k break-even
    const averageOperator = 35000; // $35k break-even
    const highCostOperator = 50000; // $50k break-even

    return {
      powerKw,
      monthlyPowerCost,
      totalMonthlyCost,
      dailyBtc,
      monthlyBtc,
      monthlyRevenue,
      dailyRevenue,
      monthlyProfit,
      profitMargin,
      breakEvenPrice,
      efficientOperator,
      averageOperator,
      highCostOperator
    };
  }, [hashrate, efficiency, powerCost, opex, btcPrice, networkDifficulty]);

  const getBreakEvenStatus = () => {
    if (calculations.breakEvenPrice < calculations.efficientOperator) {
      return { label: "Highly Efficient", color: "text-watt-success", bg: "bg-watt-success/10" };
    } else if (calculations.breakEvenPrice < calculations.averageOperator) {
      return { label: "Average", color: "text-yellow-500", bg: "bg-yellow-500/10" };
    } else if (calculations.breakEvenPrice < calculations.highCostOperator) {
      return { label: "High Cost", color: "text-orange-500", bg: "bg-orange-500/10" };
    }
    return { label: "At Risk", color: "text-red-500", bg: "bg-red-500/10" };
  };

  const status = getBreakEvenStatus();

  return (
    <ScrollReveal>
      <div className="bg-card border border-border rounded-2xl p-6 my-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-red-500/10 rounded-xl flex items-center justify-center">
            <Calculator className="w-6 h-6 text-red-500" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-foreground">Break-Even Calculator</h3>
            <p className="text-sm text-muted-foreground">Calculate your operation's break-even BTC price</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Inputs */}
          <div className="space-y-6">
            <div className="space-y-2">
              <Label className="text-foreground">Hashrate (TH/s): {hashrate}</Label>
              <Slider
                value={[hashrate]}
                onValueChange={(v) => setHashrate(v[0])}
                min={10}
                max={1000}
                step={10}
                className="py-2"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-foreground">Efficiency (J/TH): {efficiency}</Label>
              <Slider
                value={[efficiency]}
                onValueChange={(v) => setEfficiency(v[0])}
                min={15}
                max={50}
                step={1}
                className="py-2"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-foreground">Power Cost ($/kWh)</Label>
              <Input
                type="number"
                value={powerCost}
                onChange={(e) => setPowerCost(parseFloat(e.target.value) || 0)}
                step={0.01}
                min={0}
                className="bg-background"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-foreground">Monthly OPEX ($)</Label>
              <Input
                type="number"
                value={opex}
                onChange={(e) => setOpex(parseFloat(e.target.value) || 0)}
                step={100}
                min={0}
                className="bg-background"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-foreground">Current BTC Price ($)</Label>
              <Input
                type="number"
                value={btcPrice}
                onChange={(e) => setBtcPrice(parseFloat(e.target.value) || 0)}
                step={1000}
                min={0}
                className="bg-background"
              />
            </div>
          </div>

          {/* Results */}
          <div className="space-y-4">
            {/* Break-even highlight */}
            <div className={`${status.bg} border border-current/20 rounded-xl p-6 text-center`}>
              <div className="text-sm text-muted-foreground mb-1">Your Break-Even BTC Price</div>
              <div className={`text-4xl font-bold ${status.color}`}>
                ${calculations.breakEvenPrice.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </div>
              <div className={`text-sm font-medium ${status.color} mt-2`}>{status.label}</div>
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-background rounded-xl p-4">
                <div className="text-xs text-muted-foreground">Monthly Revenue</div>
                <div className="text-lg font-bold text-foreground">
                  ${calculations.monthlyRevenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </div>
              </div>
              <div className="bg-background rounded-xl p-4">
                <div className="text-xs text-muted-foreground">Monthly Costs</div>
                <div className="text-lg font-bold text-foreground">
                  ${calculations.totalMonthlyCost.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </div>
              </div>
              <div className="bg-background rounded-xl p-4">
                <div className="text-xs text-muted-foreground">Monthly Profit</div>
                <div className={`text-lg font-bold ${calculations.monthlyProfit >= 0 ? 'text-watt-success' : 'text-red-500'}`}>
                  {calculations.monthlyProfit >= 0 ? '+' : ''}${calculations.monthlyProfit.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </div>
              </div>
              <div className="bg-background rounded-xl p-4">
                <div className="text-xs text-muted-foreground">Profit Margin</div>
                <div className={`text-lg font-bold ${calculations.profitMargin >= 0 ? 'text-watt-success' : 'text-red-500'}`}>
                  {calculations.profitMargin.toFixed(1)}%
                </div>
              </div>
            </div>

            {/* Comparison */}
            <div className="bg-background rounded-xl p-4">
              <div className="text-sm font-medium text-foreground mb-3">Operator Comparison</div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-watt-success">Efficient (&lt;$20k)</span>
                  <span className="text-muted-foreground">Top 10%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-yellow-500">Average ($20k-$35k)</span>
                  <span className="text-muted-foreground">Middle 50%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-orange-500">High Cost ($35k-$50k)</span>
                  <span className="text-muted-foreground">Bottom 30%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-red-500">At Risk (&gt;$50k)</span>
                  <span className="text-muted-foreground">Bear Market Vulnerable</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ScrollReveal>
  );
};
