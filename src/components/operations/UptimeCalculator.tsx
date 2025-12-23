import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Activity, DollarSign, Clock, TrendingDown } from "lucide-react";

export const UptimeCalculator = () => {
  const [totalHours, setTotalHours] = useState(8760); // Hours in a year
  const [downtimeHours, setDowntimeHours] = useState(175); // ~98% uptime
  const [hourlyRevenue, setHourlyRevenue] = useState(500); // $ per hour
  
  const calculations = useMemo(() => {
    const uptimeHours = totalHours - downtimeHours;
    const uptimePercent = (uptimeHours / totalHours) * 100;
    const lostRevenue = downtimeHours * hourlyRevenue;
    const earnedRevenue = uptimeHours * hourlyRevenue;
    
    // Calculate improvement scenarios
    const targetUptime = 99;
    const targetDowntime = totalHours * (1 - targetUptime / 100);
    const revenueGain = (downtimeHours - targetDowntime) * hourlyRevenue;
    
    return {
      uptimeHours,
      uptimePercent,
      lostRevenue,
      earnedRevenue,
      targetDowntime,
      revenueGain,
      status: uptimePercent >= 98 ? "excellent" : uptimePercent >= 95 ? "good" : "needs-improvement"
    };
  }, [totalHours, downtimeHours, hourlyRevenue]);

  const getStatusColor = () => {
    switch (calculations.status) {
      case "excellent": return "text-watt-success";
      case "good": return "text-yellow-500";
      default: return "text-red-500";
    }
  };

  const getStatusLabel = () => {
    switch (calculations.status) {
      case "excellent": return "Excellent";
      case "good": return "Good";
      default: return "Needs Improvement";
    }
  };

  return (
    <Card className="border-watt-blue/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-foreground">
          <Activity className="w-5 h-5 text-watt-blue" />
          Uptime & Revenue Calculator
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid md:grid-cols-2 gap-8">
          {/* Inputs */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="totalHours" className="text-muted-foreground">
                Total Operating Period (hours)
              </Label>
              <Input
                id="totalHours"
                type="number"
                value={totalHours}
                onChange={(e) => setTotalHours(Number(e.target.value) || 0)}
                className="mt-1"
              />
              <p className="text-xs text-muted-foreground mt-1">8760 = 1 year, 720 = 1 month</p>
            </div>
            
            <div>
              <Label htmlFor="downtimeHours" className="text-muted-foreground">
                Total Downtime (hours)
              </Label>
              <Input
                id="downtimeHours"
                type="number"
                value={downtimeHours}
                onChange={(e) => setDowntimeHours(Number(e.target.value) || 0)}
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="hourlyRevenue" className="text-muted-foreground">
                Revenue per Hour ($)
              </Label>
              <Input
                id="hourlyRevenue"
                type="number"
                value={hourlyRevenue}
                onChange={(e) => setHourlyRevenue(Number(e.target.value) || 0)}
                className="mt-1"
              />
              <p className="text-xs text-muted-foreground mt-1">Mining revenue at current BTC price</p>
            </div>
          </div>

          {/* Results */}
          <div className="space-y-4">
            {/* Uptime Percentage */}
            <div className="bg-muted/50 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Uptime Percentage</span>
                <span className={`text-xs px-2 py-1 rounded ${
                  calculations.status === "excellent" ? "bg-watt-success/10 text-watt-success" :
                  calculations.status === "good" ? "bg-yellow-500/10 text-yellow-500" :
                  "bg-red-500/10 text-red-500"
                }`}>
                  {getStatusLabel()}
                </span>
              </div>
              <div className={`text-3xl font-bold ${getStatusColor()}`}>
                {calculations.uptimePercent.toFixed(2)}%
              </div>
              <div className="w-full bg-muted rounded-full h-2 mt-2">
                <div 
                  className={`h-2 rounded-full transition-all ${
                    calculations.status === "excellent" ? "bg-watt-success" :
                    calculations.status === "good" ? "bg-yellow-500" : "bg-red-500"
                  }`}
                  style={{ width: `${Math.min(100, calculations.uptimePercent)}%` }}
                />
              </div>
            </div>

            {/* Revenue Impact */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-watt-success/10 border border-watt-success/20 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-1">
                  <DollarSign className="w-4 h-4 text-watt-success" />
                  <span className="text-xs text-muted-foreground">Earned Revenue</span>
                </div>
                <div className="text-xl font-bold text-watt-success">
                  ${calculations.earnedRevenue.toLocaleString()}
                </div>
              </div>
              
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-1">
                  <TrendingDown className="w-4 h-4 text-red-500" />
                  <span className="text-xs text-muted-foreground">Lost Revenue</span>
                </div>
                <div className="text-xl font-bold text-red-500">
                  ${calculations.lostRevenue.toLocaleString()}
                </div>
              </div>
            </div>

            {/* Improvement Opportunity */}
            {calculations.uptimePercent < 99 && (
              <div className="bg-watt-blue/10 border border-watt-blue/20 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-4 h-4 text-watt-blue" />
                  <span className="text-sm font-medium text-foreground">Improvement Opportunity</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Reaching 99% uptime would save{" "}
                  <span className="font-bold text-watt-blue">
                    ${calculations.revenueGain.toLocaleString()}
                  </span>{" "}
                  by reducing downtime to {calculations.targetDowntime.toFixed(0)} hours.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Benchmarks */}
        <div className="mt-6 pt-4 border-t border-border">
          <h4 className="text-sm font-medium text-foreground mb-3">Industry Benchmarks</h4>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="bg-muted/50 rounded-lg p-3">
              <div className="text-lg font-bold text-watt-success">98%+</div>
              <div className="text-xs text-muted-foreground">Top Tier Operations</div>
            </div>
            <div className="bg-muted/50 rounded-lg p-3">
              <div className="text-lg font-bold text-yellow-500">95-98%</div>
              <div className="text-xs text-muted-foreground">Industry Average</div>
            </div>
            <div className="bg-muted/50 rounded-lg p-3">
              <div className="text-lg font-bold text-red-500">&lt;95%</div>
              <div className="text-xs text-muted-foreground">Needs Improvement</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
