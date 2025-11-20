import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAESOPhase4Features } from "@/hooks/useAESOPhase4Features";
import { Loader2, Zap, TrendingUp, GitBranch, Layers } from "lucide-react";
import { Progress } from "@/components/ui/progress";

export function Phase4FeaturesPanel() {
  const { calculatePhase4Features, loading, results } = useAESOPhase4Features();

  const handleCalculate = async () => {
    await calculatePhase4Features();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-primary" />
          Phase 4: Advanced Feature Engineering
        </CardTitle>
        <CardDescription>
          Generate polynomial, ratio, cross, and binning features for enhanced model performance
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button 
          onClick={handleCalculate} 
          disabled={loading}
          className="w-full"
        >
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {loading ? "Calculating Features..." : "Calculate Phase 4 Features"}
        </Button>

        {results && (
          <div className="space-y-4 pt-4 border-t">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  Polynomial Features
                </div>
                <div className="text-2xl font-bold">{results.stats.polynomial_features}</div>
                <Progress value={(results.stats.polynomial_features / 50) * 100} className="h-2" />
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <GitBranch className="h-4 w-4 text-primary" />
                  Ratio Features
                </div>
                <div className="text-2xl font-bold">{results.stats.ratio_features}</div>
                <Progress value={(results.stats.ratio_features / 30) * 100} className="h-2" />
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Layers className="h-4 w-4 text-primary" />
                  Cross Features
                </div>
                <div className="text-2xl font-bold">{results.stats.cross_features}</div>
                <Progress value={(results.stats.cross_features / 40) * 100} className="h-2" />
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Zap className="h-4 w-4 text-primary" />
                  Binning Features
                </div>
                <div className="text-2xl font-bold">{results.stats.binning_features}</div>
                <Progress value={(results.stats.binning_features / 20) * 100} className="h-2" />
              </div>
            </div>

            <div className="space-y-2 pt-4 border-t">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total Records</span>
                <span className="font-medium">{results.stats.total_records.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Updated Records</span>
                <span className="font-medium">{results.stats.updated_records.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total Features Added</span>
                <span className="font-bold text-primary">
                  {(results.stats.polynomial_features + 
                    results.stats.ratio_features + 
                    results.stats.cross_features + 
                    results.stats.binning_features).toLocaleString()}
                </span>
              </div>
            </div>

            {results.improvements && results.improvements.length > 0 && (
              <div className="space-y-2 pt-4 border-t">
                <div className="text-sm font-medium">Key Improvements:</div>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  {results.improvements.map((improvement, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-primary mt-0.5">•</span>
                      <span>{improvement}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
