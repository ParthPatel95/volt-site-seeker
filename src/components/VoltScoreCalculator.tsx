
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { Calculator, Zap, TrendingUp } from 'lucide-react';
import type { Property } from '@/hooks/useProperties';

interface VoltScoreCalculatorProps {
  property: Property;
  onScoreCalculated?: () => void;
}

export function VoltScoreCalculator({ property, onScoreCalculated }: VoltScoreCalculatorProps) {
  const [calculating, setCalculating] = useState(false);
  const { toast } = useToast();

  const calculateVoltScore = async () => {
    setCalculating(true);
    try {
      // VoltScore calculation algorithm
      let locationScore = 50;
      let powerScore = 50;
      let infrastructureScore = 50;
      let financialScore = 50;
      let riskScore = 50;

      // Location scoring (based on city/state data centers presence)
      const majorDataCenterCities = ['dallas', 'austin', 'houston', 'atlanta', 'phoenix', 'denver'];
      if (majorDataCenterCities.includes(property.city.toLowerCase())) {
        locationScore += 20;
      }

      // Power scoring
      if (property.power_capacity_mw) {
        if (property.power_capacity_mw >= 50) powerScore += 30;
        else if (property.power_capacity_mw >= 25) powerScore += 20;
        else if (property.power_capacity_mw >= 10) powerScore += 10;
      }

      if (property.transmission_access) {
        powerScore += 15;
      }

      // Infrastructure scoring
      if (property.substation_distance_miles) {
        if (property.substation_distance_miles <= 1) infrastructureScore += 25;
        else if (property.substation_distance_miles <= 3) infrastructureScore += 15;
        else if (property.substation_distance_miles <= 5) infrastructureScore += 5;
      }

      if (property.square_footage && property.square_footage >= 100000) {
        infrastructureScore += 15;
      }

      // Financial scoring
      if (property.asking_price && property.square_footage) {
        const pricePerSqft = property.asking_price / property.square_footage;
        if (pricePerSqft <= 50) financialScore += 20;
        else if (pricePerSqft <= 100) financialScore += 10;
      }

      // Risk scoring
      if (property.year_built && property.year_built >= 2000) {
        riskScore += 15;
      }

      if (property.zoning && property.zoning.toLowerCase().includes('industrial')) {
        riskScore += 10;
      }

      // Ensure scores are within bounds
      locationScore = Math.min(100, Math.max(0, locationScore));
      powerScore = Math.min(100, Math.max(0, powerScore));
      infrastructureScore = Math.min(100, Math.max(0, infrastructureScore));
      financialScore = Math.min(100, Math.max(0, financialScore));
      riskScore = Math.min(100, Math.max(0, riskScore));

      // Overall score (weighted average)
      const overallScore = Math.round(
        (powerScore * 0.3 + infrastructureScore * 0.25 + locationScore * 0.2 + financialScore * 0.15 + riskScore * 0.1)
      );

      const calculationDetails = {
        algorithm_version: '1.0',
        factors: {
          location: { score: locationScore, weight: 0.2 },
          power: { score: powerScore, weight: 0.3 },
          infrastructure: { score: infrastructureScore, weight: 0.25 },
          financial: { score: financialScore, weight: 0.15 },
          risk: { score: riskScore, weight: 0.1 }
        }
      };

      const { error } = await supabase
        .from('volt_scores')
        .insert([{
          property_id: property.id,
          overall_score: overallScore,
          location_score: locationScore,
          power_score: powerScore,
          infrastructure_score: infrastructureScore,
          financial_score: financialScore,
          risk_score: riskScore,
          calculation_details: calculationDetails
        }]);

      if (error) throw error;

      toast({
        title: "VoltScore Calculated!",
        description: `Overall score: ${overallScore}/100`,
      });

      if (onScoreCalculated) onScoreCalculated();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setCalculating(false);
    }
  };

  const latestScore = property.volt_scores?.[0];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            <Calculator className="w-5 h-5 mr-2" />
            VoltScore Analysis
          </div>
          {latestScore && (
            <Badge variant={latestScore.overall_score >= 80 ? "default" : latestScore.overall_score >= 60 ? "secondary" : "outline"}>
              {latestScore.overall_score}/100
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {latestScore ? (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="flex justify-between text-sm">
                  <span>Power</span>
                  <span>{latestScore.power_score}/100</span>
                </div>
                <Progress value={latestScore.power_score} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between text-sm">
                  <span>Infrastructure</span>
                  <span>{latestScore.infrastructure_score}/100</span>
                </div>
                <Progress value={latestScore.infrastructure_score} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between text-sm">
                  <span>Location</span>
                  <span>{latestScore.location_score}/100</span>
                </div>
                <Progress value={latestScore.location_score} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between text-sm">
                  <span>Financial</span>
                  <span>{latestScore.financial_score}/100</span>
                </div>
                <Progress value={latestScore.financial_score} className="h-2" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Last calculated: {new Date(latestScore.calculated_at).toLocaleDateString()}
            </p>
          </div>
        ) : (
          <div className="text-center py-4">
            <Zap className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
            <p className="text-muted-foreground mb-4">No VoltScore calculated yet</p>
          </div>
        )}
        
        <Button 
          onClick={calculateVoltScore} 
          disabled={calculating}
          className="w-full"
          variant={latestScore ? "outline" : "default"}
        >
          <TrendingUp className="w-4 h-4 mr-2" />
          {calculating ? 'Calculating...' : latestScore ? 'Recalculate VoltScore' : 'Calculate VoltScore'}
        </Button>
      </CardContent>
    </Card>
  );
}
