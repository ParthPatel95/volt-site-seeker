import { useState, useMemo } from "react";
import { Wallet, TrendingDown, Calendar, AlertTriangle } from "lucide-react";
import { ScrollReveal } from "@/components/landing/ScrollAnimations";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";

export const CashRunwayCalculator = () => {
  const [btcHoldings, setBtcHoldings] = useState(10); // BTC
  const [cashReserves, setCashReserves] = useState(500000); // USD
  const [monthlyOpex, setMonthlyOpex] = useState(100000); // USD
  const [monthlyBtcRevenue, setMonthlyBtcRevenue] = useState(1.5); // BTC mined per month
  const [currentBtcPrice, setCurrentBtcPrice] = useState(42000); // USD

  const scenarios = useMemo(() => {
    const calculateRunway = (priceMultiplier: number) => {
      const btcPrice = currentBtcPrice * priceMultiplier;
      const totalAssets = (btcHoldings * btcPrice) + cashReserves;
      const monthlyRevenue = monthlyBtcRevenue * btcPrice;
      const netMonthlyCashFlow = monthlyRevenue - monthlyOpex;
      
      if (netMonthlyCashFlow >= 0) {
        return { months: Infinity, status: "profitable" };
      }
      
      const runway = totalAssets / Math.abs(netMonthlyCashFlow);
      return { 
        months: Math.max(0, runway),
        status: runway > 24 ? "safe" : runway > 12 ? "caution" : runway > 6 ? "warning" : "critical"
      };
    };

    return [
      { label: "Current Price", multiplier: 1, ...calculateRunway(1) },
      { label: "-30% Drop", multiplier: 0.7, ...calculateRunway(0.7) },
      { label: "-50% Drop", multiplier: 0.5, ...calculateRunway(0.5) },
      { label: "-70% Drop", multiplier: 0.3, ...calculateRunway(0.3) },
    ];
  }, [btcHoldings, cashReserves, monthlyOpex, monthlyBtcRevenue, currentBtcPrice]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "profitable": return "text-watt-success bg-watt-success/10";
      case "safe": return "text-watt-blue bg-watt-blue/10";
      case "caution": return "text-yellow-500 bg-yellow-500/10";
      case "warning": return "text-orange-500 bg-orange-500/10";
      case "critical": return "text-red-500 bg-red-500/10";
      default: return "text-muted-foreground bg-muted";
    }
  };

  const totalAssetsAtCurrentPrice = (btcHoldings * currentBtcPrice) + cashReserves;

  return (
    <ScrollReveal>
      <div className="bg-card border border-border rounded-2xl p-6 my-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-red-500/10 rounded-xl flex items-center justify-center">
            <Wallet className="w-6 h-6 text-red-500" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-foreground">Cash Runway Calculator</h3>
            <p className="text-sm text-muted-foreground">Stress-test your survival at different BTC prices</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Inputs */}
          <div className="space-y-5">
            <div className="space-y-2">
              <Label className="text-foreground">BTC Holdings: {btcHoldings} BTC</Label>
              <Slider
                value={[btcHoldings]}
                onValueChange={(v) => setBtcHoldings(v[0])}
                min={0}
                max={100}
                step={1}
                className="py-2"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-foreground">Cash Reserves ($)</Label>
              <Input
                type="number"
                value={cashReserves}
                onChange={(e) => setCashReserves(parseFloat(e.target.value) || 0)}
                step={50000}
                min={0}
                className="bg-background"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-foreground">Monthly Operating Costs ($)</Label>
              <Input
                type="number"
                value={monthlyOpex}
                onChange={(e) => setMonthlyOpex(parseFloat(e.target.value) || 0)}
                step={10000}
                min={0}
                className="bg-background"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-foreground">Monthly BTC Mining: {monthlyBtcRevenue} BTC</Label>
              <Slider
                value={[monthlyBtcRevenue * 10]}
                onValueChange={(v) => setMonthlyBtcRevenue(v[0] / 10)}
                min={1}
                max={50}
                step={1}
                className="py-2"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-foreground">Current BTC Price ($)</Label>
              <Input
                type="number"
                value={currentBtcPrice}
                onChange={(e) => setCurrentBtcPrice(parseFloat(e.target.value) || 0)}
                step={1000}
                min={0}
                className="bg-background"
              />
            </div>
          </div>

          {/* Results */}
          <div className="space-y-4">
            {/* Total assets */}
            <div className="bg-background rounded-xl p-4">
              <div className="text-sm text-muted-foreground mb-1">Total Assets (Current Price)</div>
              <div className="text-2xl font-bold text-foreground">
                ${totalAssetsAtCurrentPrice.toLocaleString()}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {btcHoldings} BTC + ${cashReserves.toLocaleString()} cash
              </div>
            </div>

            {/* Scenario table */}
            <div className="bg-background rounded-xl p-4">
              <div className="flex items-center gap-2 mb-4">
                <TrendingDown className="w-4 h-4 text-red-500" />
                <span className="text-sm font-medium text-foreground">Survival Scenarios</span>
              </div>
              
              <div className="space-y-3">
                {scenarios.map((scenario, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium text-foreground">{scenario.label}</div>
                      <div className="text-xs text-muted-foreground">
                        ${(currentBtcPrice * scenario.multiplier).toLocaleString()}/BTC
                      </div>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(scenario.status)}`}>
                      {scenario.status === "profitable" ? (
                        "∞ Profitable"
                      ) : (
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {scenario.months.toFixed(1)} months
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Warning */}
            {scenarios.some(s => s.status === "critical" || s.status === "warning") && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0" />
                  <div className="text-sm text-muted-foreground">
                    <span className="font-medium text-red-500">Vulnerability Detected:</span> Your operation may not survive a significant market downturn. Consider building additional reserves or reducing costs.
                  </div>
                </div>
              </div>
            )}

            {/* Recommendation */}
            <div className="bg-watt-blue/10 border border-watt-blue/20 rounded-xl p-4">
              <div className="text-sm text-muted-foreground">
                <span className="font-medium text-watt-blue">Target:</span> Maintain at least 18 months of runway at a -50% BTC price scenario to survive bear markets.
              </div>
            </div>
          </div>
        </div>
      </div>
    </ScrollReveal>
  );
};
