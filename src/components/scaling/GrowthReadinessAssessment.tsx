import { useState } from "react";
import { TrendingUp, CheckCircle, AlertTriangle, XCircle, Rocket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

interface AssessmentResult {
  score: number;
  level: 'not-ready' | 'preparing' | 'ready' | 'scaling';
  title: string;
  description: string;
  recommendations: string[];
}

export const GrowthReadinessAssessment = () => {
  const [currentMW, setCurrentMW] = useState(20);
  const [targetMW, setTargetMW] = useState(50);
  const [powerContract, setPowerContract] = useState<string>("");
  const [breakEvenBTC, setBreakEvenBTC] = useState<string>("");
  const [expansionPlan, setExpansionPlan] = useState<string>("");
  const [capitalAccess, setCapitalAccess] = useState<string>("");
  const [showResult, setShowResult] = useState(false);

  const calculateResult = (): AssessmentResult => {
    let score = 0;
    
    // Growth ambition (0-15 points)
    const growthMultiple = targetMW / currentMW;
    if (growthMultiple >= 2 && growthMultiple <= 5) score += 15;
    else if (growthMultiple > 5) score += 10;
    else score += 5;

    // Power contract (0-25 points)
    if (powerContract === "secured") score += 25;
    else if (powerContract === "negotiating") score += 15;
    else if (powerContract === "identified") score += 8;

    // Break-even BTC (0-20 points)
    if (breakEvenBTC === "under-30k") score += 20;
    else if (breakEvenBTC === "30k-50k") score += 15;
    else if (breakEvenBTC === "50k-70k") score += 8;

    // Expansion plan (0-20 points)
    if (expansionPlan === "detailed") score += 20;
    else if (expansionPlan === "outline") score += 12;
    else if (expansionPlan === "concept") score += 5;

    // Capital access (0-20 points)
    if (capitalAccess === "committed") score += 20;
    else if (capitalAccess === "discussions") score += 12;
    else if (capitalAccess === "exploring") score += 5;

    let level: AssessmentResult['level'];
    let title: string;
    let description: string;
    let recommendations: string[];

    if (score >= 80) {
      level = 'scaling';
      title = 'Ready to Scale';
      description = 'Your operation is well-positioned for aggressive growth. Execute your expansion plan with confidence.';
      recommendations = [
        'Finalize capital structure and close funding',
        'Begin site preparation and equipment orders',
        'Build out operational team for expanded capacity',
        'Consider multi-site strategy for risk diversification'
      ];
    } else if (score >= 60) {
      level = 'ready';
      title = 'Growth Ready';
      description = 'You have strong fundamentals in place. Address remaining gaps to accelerate your growth timeline.';
      recommendations = [
        'Secure power contracts or advance negotiations',
        'Formalize expansion plans with detailed timelines',
        'Strengthen capital relationships',
        'Review Site Expansion section for approach selection'
      ];
    } else if (score >= 40) {
      level = 'preparing';
      title = 'Preparing for Growth';
      description = 'Good progress on growth foundations. Focus on strengthening key areas before scaling.';
      recommendations = [
        'Improve operational efficiency to lower break-even',
        'Develop detailed expansion roadmap',
        'Build relationships with potential capital sources',
        'Study Capacity Planning section thoroughly'
      ];
    } else {
      level = 'not-ready';
      title = 'Foundation Building';
      description = 'Focus on optimizing current operations before pursuing expansion.';
      recommendations = [
        'Reduce break-even BTC price through efficiency gains',
        'Establish track record with current capacity',
        'Research power opportunities in target markets',
        'Complete all sections of this Scaling course'
      ];
    }

    return { score, level, title, description, recommendations };
  };

  const result = calculateResult();

  const getResultIcon = (level: AssessmentResult['level']) => {
    switch (level) {
      case 'scaling': return <Rocket className="w-8 h-8 text-watt-success" />;
      case 'ready': return <CheckCircle className="w-8 h-8 text-watt-success" />;
      case 'preparing': return <AlertTriangle className="w-8 h-8 text-watt-bitcoin" />;
      default: return <XCircle className="w-8 h-8 text-destructive" />;
    }
  };

  const getResultColor = (level: AssessmentResult['level']) => {
    switch (level) {
      case 'scaling': return 'bg-watt-success/10 border-watt-success/30';
      case 'ready': return 'bg-watt-success/10 border-watt-success/30';
      case 'preparing': return 'bg-watt-bitcoin/10 border-watt-bitcoin/30';
      default: return 'bg-destructive/10 border-destructive/30';
    }
  };

  return (
    <div className="bg-card rounded-xl p-6 shadow-lg border border-border">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-watt-success/10 rounded-lg flex items-center justify-center">
          <TrendingUp className="w-6 h-6 text-watt-success" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-foreground">Growth Readiness Assessment</h3>
          <p className="text-sm text-muted-foreground">Evaluate your scaling readiness</p>
        </div>
      </div>

      {!showResult ? (
        <div className="space-y-6">
          {/* Current Capacity */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-3">
              Current Operational Capacity: {currentMW} MW
            </label>
            <Slider
              value={[currentMW]}
              onValueChange={([value]) => setCurrentMW(value)}
              min={5}
              max={100}
              step={5}
              className="w-full"
            />
          </div>

          {/* Target Capacity */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-3">
              Target Capacity (24 months): {targetMW} MW
            </label>
            <Slider
              value={[targetMW]}
              onValueChange={([value]) => setTargetMW(value)}
              min={10}
              max={200}
              step={10}
              className="w-full"
            />
          </div>

          {/* Power Contract */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-3">
              Power for Expansion
            </label>
            <RadioGroup value={powerContract} onValueChange={setPowerContract}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="secured" id="power-secured" />
                <Label htmlFor="power-secured">Secured under contract</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="negotiating" id="power-negotiating" />
                <Label htmlFor="power-negotiating">Actively negotiating</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="identified" id="power-identified" />
                <Label htmlFor="power-identified">Sites identified only</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="none" id="power-none" />
                <Label htmlFor="power-none">Not yet identified</Label>
              </div>
            </RadioGroup>
          </div>

          {/* Break-even BTC */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-3">
              Current Break-even BTC Price
            </label>
            <RadioGroup value={breakEvenBTC} onValueChange={setBreakEvenBTC}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="under-30k" id="btc-under-30k" />
                <Label htmlFor="btc-under-30k">Under $30,000</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="30k-50k" id="btc-30k-50k" />
                <Label htmlFor="btc-30k-50k">$30,000 - $50,000</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="50k-70k" id="btc-50k-70k" />
                <Label htmlFor="btc-50k-70k">$50,000 - $70,000</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="over-70k" id="btc-over-70k" />
                <Label htmlFor="btc-over-70k">Over $70,000</Label>
              </div>
            </RadioGroup>
          </div>

          {/* Expansion Plan */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-3">
              Expansion Planning Status
            </label>
            <RadioGroup value={expansionPlan} onValueChange={setExpansionPlan}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="detailed" id="plan-detailed" />
                <Label htmlFor="plan-detailed">Detailed plan with timelines</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="outline" id="plan-outline" />
                <Label htmlFor="plan-outline">High-level outline exists</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="concept" id="plan-concept" />
                <Label htmlFor="plan-concept">Conceptual stage only</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="none" id="plan-none" />
                <Label htmlFor="plan-none">No formal plan</Label>
              </div>
            </RadioGroup>
          </div>

          {/* Capital Access */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-3">
              Access to Growth Capital
            </label>
            <RadioGroup value={capitalAccess} onValueChange={setCapitalAccess}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="committed" id="capital-committed" />
                <Label htmlFor="capital-committed">Committed/available capital</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="discussions" id="capital-discussions" />
                <Label htmlFor="capital-discussions">Active discussions with investors</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="exploring" id="capital-exploring" />
                <Label htmlFor="capital-exploring">Exploring options</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="none" id="capital-none" />
                <Label htmlFor="capital-none">No capital sources identified</Label>
              </div>
            </RadioGroup>
          </div>

          <Button 
            onClick={() => setShowResult(true)}
            className="w-full bg-watt-success hover:bg-watt-success/90 text-white"
            disabled={!powerContract || !breakEvenBTC || !expansionPlan || !capitalAccess}
          >
            Calculate Readiness Score
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          <div className={`rounded-xl p-6 border ${getResultColor(result.level)}`}>
            <div className="flex items-center gap-4 mb-4">
              {getResultIcon(result.level)}
              <div>
                <div className="text-3xl font-bold text-foreground">{result.score}/100</div>
                <div className="text-lg font-semibold text-foreground">{result.title}</div>
              </div>
            </div>
            <p className="text-muted-foreground">{result.description}</p>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-3">Recommendations</h4>
            <ul className="space-y-2">
              {result.recommendations.map((rec, index) => (
                <li key={index} className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-watt-success flex-shrink-0 mt-1" />
                  <span className="text-muted-foreground">{rec}</span>
                </li>
              ))}
            </ul>
          </div>

          <Button 
            onClick={() => setShowResult(false)}
            variant="outline"
            className="w-full"
          >
            Retake Assessment
          </Button>
        </div>
      )}
    </div>
  );
};
