import { useState, useMemo } from "react";
import { Shield, Building, Cpu, Users, FileText } from "lucide-react";
import { ScrollReveal } from "@/components/landing/ScrollAnimations";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const InsuranceCoverageEstimator = () => {
  const [facilityMw, setFacilityMw] = useState(10); // MW
  const [equipmentValue, setEquipmentValue] = useState(5000000); // USD
  const [jurisdiction, setJurisdiction] = useState("us-texas");
  const [operationType, setOperationType] = useState("owned");

  const calculations = useMemo(() => {
    // Property insurance: typically 1-2% of equipment value
    const propertyRate = jurisdiction.includes("us") ? 0.015 : 0.02;
    const propertyCoverage = equipmentValue * 1.25; // 125% of value for replacement
    const propertyPremium = propertyCoverage * propertyRate;

    // Cyber insurance: $1-3 per $1000 of coverage
    const cyberCoverage = Math.max(1000000, facilityMw * 200000);
    const cyberRate = 0.002;
    const cyberPremium = cyberCoverage * cyberRate;

    // D&O: typically $5k-$15k per $1M in coverage
    const doCoverage = Math.max(1000000, equipmentValue * 0.2);
    const doRate = 0.01;
    const doPremium = doCoverage * doRate;

    // General Liability: $500-$1500 per $1M
    const glCoverage = Math.max(1000000, facilityMw * 500000);
    const glRate = 0.001;
    const glPremium = glCoverage * glRate;

    // Business Interruption
    const monthlyRevenue = facilityMw * 30 * 24 * 0.05 * 42000 / 1000; // Rough estimate
    const biCoverage = monthlyRevenue * 6; // 6 months coverage
    const biRate = 0.03;
    const biPremium = biCoverage * biRate;

    // Adjust for operation type
    const operationMultiplier = operationType === "hosted" ? 0.5 : 1;

    return {
      property: {
        coverage: propertyCoverage,
        premium: propertyPremium * operationMultiplier,
        needed: operationType === "owned"
      },
      cyber: {
        coverage: cyberCoverage,
        premium: cyberPremium,
        needed: true
      },
      directorsOfficers: {
        coverage: doCoverage,
        premium: doPremium,
        needed: equipmentValue > 5000000
      },
      generalLiability: {
        coverage: glCoverage,
        premium: glPremium * operationMultiplier,
        needed: true
      },
      businessInterruption: {
        coverage: biCoverage,
        premium: biPremium,
        needed: operationType === "owned"
      },
      totalAnnualPremium: (
        (operationType === "owned" ? propertyPremium : 0) +
        cyberPremium +
        (equipmentValue > 5000000 ? doPremium : 0) +
        glPremium * operationMultiplier +
        (operationType === "owned" ? biPremium : 0)
      )
    };
  }, [facilityMw, equipmentValue, jurisdiction, operationType]);

  const formatCurrency = (value: number) => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`;
    }
    return `$${(value / 1000).toFixed(0)}K`;
  };

  const jurisdictionOptions = [
    { value: "us-texas", label: "Texas, USA" },
    { value: "us-other", label: "Other US State" },
    { value: "canada", label: "Canada" },
    { value: "europe", label: "Europe" },
    { value: "latam", label: "Latin America" },
    { value: "asia", label: "Asia Pacific" },
  ];

  const coverageTypes = [
    {
      id: "property",
      icon: Building,
      name: "Property Insurance",
      desc: "Equipment, facilities, physical assets",
      data: calculations.property
    },
    {
      id: "cyber",
      icon: Cpu,
      name: "Cyber Insurance",
      desc: "Ransomware, data breaches, mining theft",
      data: calculations.cyber
    },
    {
      id: "do",
      icon: Users,
      name: "Directors & Officers",
      desc: "Management liability, shareholder suits",
      data: calculations.directorsOfficers
    },
    {
      id: "gl",
      icon: Shield,
      name: "General Liability",
      desc: "Third-party bodily injury, property damage",
      data: calculations.generalLiability
    },
    {
      id: "bi",
      icon: FileText,
      name: "Business Interruption",
      desc: "Lost revenue during downtime events",
      data: calculations.businessInterruption
    }
  ];

  return (
    <ScrollReveal>
      <div className="bg-card border border-border rounded-2xl p-6 my-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-red-500/10 rounded-xl flex items-center justify-center">
            <Shield className="w-6 h-6 text-red-500" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-foreground">Insurance Coverage Estimator</h3>
            <p className="text-sm text-muted-foreground">Estimate coverage needs and annual premiums</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Inputs */}
          <div className="space-y-5">
            <div className="space-y-2">
              <Label className="text-foreground">Facility Size: {facilityMw} MW</Label>
              <Slider
                value={[facilityMw]}
                onValueChange={(v) => setFacilityMw(v[0])}
                min={1}
                max={100}
                step={1}
                className="py-2"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-foreground">Equipment Value ($)</Label>
              <Input
                type="number"
                value={equipmentValue}
                onChange={(e) => setEquipmentValue(parseFloat(e.target.value) || 0)}
                step={500000}
                min={0}
                className="bg-background"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-foreground">Jurisdiction</Label>
              <Select value={jurisdiction} onValueChange={setJurisdiction}>
                <SelectTrigger className="bg-background">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {jurisdictionOptions.map((j) => (
                    <SelectItem key={j.value} value={j.value}>{j.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-foreground">Operation Type</Label>
              <Select value={operationType} onValueChange={setOperationType}>
                <SelectTrigger className="bg-background">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="owned">Owned Facility</SelectItem>
                  <SelectItem value="hosted">Hosted/Colocation</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Total estimate */}
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mt-6">
              <div className="text-sm text-muted-foreground mb-1">Estimated Annual Premium</div>
              <div className="text-3xl font-bold text-red-500">
                {formatCurrency(calculations.totalAnnualPremium)}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                ~{(calculations.totalAnnualPremium / 12).toLocaleString(undefined, { maximumFractionDigits: 0 })}/month
              </div>
            </div>
          </div>

          {/* Coverage breakdown */}
          <div className="space-y-3">
            {coverageTypes.map((coverage) => {
              const Icon = coverage.icon;
              const isNeeded = coverage.data.needed;
              
              return (
                <div 
                  key={coverage.id}
                  className={`bg-background rounded-xl p-4 ${!isNeeded ? 'opacity-50' : ''}`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${isNeeded ? 'bg-red-500/10' : 'bg-muted'}`}>
                      <Icon className={`w-5 h-5 ${isNeeded ? 'text-red-500' : 'text-muted-foreground'}`} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div className="font-medium text-foreground">{coverage.name}</div>
                        {!isNeeded && (
                          <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                            Optional
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground mb-2">{coverage.desc}</div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Coverage:</span>
                        <span className="font-medium text-foreground">{formatCurrency(coverage.data.coverage)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Est. Premium:</span>
                        <span className="font-medium text-red-500">{formatCurrency(coverage.data.premium)}/yr</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-6 p-4 bg-muted/50 rounded-xl">
          <p className="text-xs text-muted-foreground">
            <strong>Disclaimer:</strong> These are rough estimates based on industry averages. Actual premiums vary significantly based on specific circumstances, claims history, and insurer. Consult with a licensed insurance broker for accurate quotes.
          </p>
        </div>
      </div>
    </ScrollReveal>
  );
};
