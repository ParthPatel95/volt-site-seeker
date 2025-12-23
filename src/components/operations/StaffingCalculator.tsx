import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Users, DollarSign, Calculator, Info } from "lucide-react";

interface StaffRole {
  title: string;
  ratioMin: number;
  ratioMax: number;
  salaryMin: number;
  salaryMax: number;
}

const staffRoles: StaffRole[] = [
  { title: "NOC Operator", ratioMin: 5, ratioMax: 10, salaryMin: 45000, salaryMax: 65000 },
  { title: "Field Technician", ratioMin: 10, ratioMax: 20, salaryMin: 50000, salaryMax: 75000 },
  { title: "Electrical Technician", ratioMin: 20, ratioMax: 50, salaryMin: 60000, salaryMax: 90000 },
  { title: "Site Manager", ratioMin: 100, ratioMax: 100, salaryMin: 80000, salaryMax: 120000 }
];

export const StaffingCalculator = () => {
  const [facilityMW, setFacilityMW] = useState(50);
  const [staffingLevel, setStaffingLevel] = useState<"lean" | "standard" | "premium">("standard");
  
  const calculations = useMemo(() => {
    const staffing = staffRoles.map(role => {
      let ratio: number;
      let salary: number;
      
      switch (staffingLevel) {
        case "lean":
          ratio = role.ratioMax;
          salary = role.salaryMin;
          break;
        case "premium":
          ratio = role.ratioMin;
          salary = role.salaryMax;
          break;
        default:
          ratio = (role.ratioMin + role.ratioMax) / 2;
          salary = (role.salaryMin + role.salaryMax) / 2;
      }
      
      // Special case for site manager - always 1 per site
      const count = role.title === "Site Manager" ? 1 : Math.ceil(facilityMW / ratio);
      
      return {
        ...role,
        count,
        salary,
        totalCost: count * salary
      };
    });

    const totalHeadcount = staffing.reduce((sum, s) => sum + s.count, 0);
    const totalAnnualCost = staffing.reduce((sum, s) => sum + s.totalCost, 0);
    const costPerMW = totalAnnualCost / facilityMW;
    
    // 24/7 coverage requires ~4.2 FTEs per position (accounting for shifts, PTO, etc.)
    const shiftsRequired = Math.ceil(staffing[0].count * 4.2);
    
    return {
      staffing,
      totalHeadcount,
      totalAnnualCost,
      costPerMW,
      shiftsRequired
    };
  }, [facilityMW, staffingLevel]);

  return (
    <Card className="border-watt-purple/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-foreground">
          <Users className="w-5 h-5 text-watt-purple" />
          Staffing Requirements Calculator
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid md:grid-cols-2 gap-8">
          {/* Inputs */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="facilityMW" className="text-muted-foreground">
                Facility Size (MW)
              </Label>
              <Input
                id="facilityMW"
                type="number"
                value={facilityMW}
                onChange={(e) => setFacilityMW(Number(e.target.value) || 1)}
                className="mt-1"
                min={1}
              />
            </div>
            
            <div>
              <Label className="text-muted-foreground">Staffing Model</Label>
              <div className="grid grid-cols-3 gap-2 mt-2">
                {(["lean", "standard", "premium"] as const).map(level => (
                  <button
                    key={level}
                    onClick={() => setStaffingLevel(level)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      staffingLevel === level
                        ? level === "lean" 
                          ? "bg-yellow-500/20 text-yellow-600 border-2 border-yellow-500"
                          : level === "standard"
                          ? "bg-watt-blue/20 text-watt-blue border-2 border-watt-blue"
                          : "bg-watt-success/20 text-watt-success border-2 border-watt-success"
                        : "bg-muted border-2 border-transparent hover:border-muted-foreground/30"
                    }`}
                  >
                    {level.charAt(0).toUpperCase() + level.slice(1)}
                  </button>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                {staffingLevel === "lean" && "Minimum coverage, higher per-person workload"}
                {staffingLevel === "standard" && "Balanced coverage and workload"}
                {staffingLevel === "premium" && "Maximum coverage, lower response times"}
              </p>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-2 gap-4 pt-4">
              <div className="bg-watt-purple/10 border border-watt-purple/20 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-1">
                  <Users className="w-4 h-4 text-watt-purple" />
                  <span className="text-xs text-muted-foreground">Total Headcount</span>
                </div>
                <div className="text-2xl font-bold text-watt-purple">
                  {calculations.totalHeadcount}
                </div>
              </div>
              
              <div className="bg-watt-bitcoin/10 border border-watt-bitcoin/20 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-1">
                  <DollarSign className="w-4 h-4 text-watt-bitcoin" />
                  <span className="text-xs text-muted-foreground">Annual Cost</span>
                </div>
                <div className="text-2xl font-bold text-watt-bitcoin">
                  ${(calculations.totalAnnualCost / 1000000).toFixed(2)}M
                </div>
              </div>
            </div>
          </div>

          {/* Staffing Breakdown */}
          <div>
            <h4 className="text-sm font-medium text-muted-foreground mb-3">Staffing Breakdown</h4>
            <div className="space-y-3">
              {calculations.staffing.map(role => (
                <div key={role.title} className="bg-muted/50 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-foreground">{role.title}</span>
                    <span className="text-lg font-bold text-watt-purple">{role.count}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>1 per {role.title === "Site Manager" ? "site" : `${role.ratioMin}-${role.ratioMax} MW`}</span>
                    <span>${role.totalCost.toLocaleString()}/yr</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Cost per MW */}
            <div className="mt-4 bg-watt-blue/10 border border-watt-blue/20 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-1">
                <Calculator className="w-4 h-4 text-watt-blue" />
                <span className="text-sm font-medium text-foreground">Cost per MW</span>
              </div>
              <div className="text-xl font-bold text-watt-blue">
                ${calculations.costPerMW.toLocaleString()}/MW/year
              </div>
            </div>
          </div>
        </div>

        {/* Note */}
        <div className="mt-6 flex items-start gap-2 text-sm text-muted-foreground bg-muted/50 rounded-lg p-4">
          <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <p>
            This calculator provides estimates based on industry averages. Actual staffing needs 
            vary based on equipment type, automation level, location, and operational complexity. 
            24/7 coverage typically requires 4-5 FTEs per position to account for shifts, 
            vacations, and sick time.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
