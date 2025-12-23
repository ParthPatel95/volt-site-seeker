import React, { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Waves, Wind, CloudRain, Droplets, CheckCircle, AlertTriangle, ThermometerSun } from 'lucide-react';

type WaterAvailability = 'natural' | 'municipal' | 'limited' | 'none';
type NoiseSensitivity = 'low' | 'medium' | 'high';

const coolingMethods = [
  {
    id: 'plate-exchanger',
    name: 'Plate Heat Exchanger',
    icon: Waves,
    color: 'from-blue-500 to-cyan-500',
    requirements: { waterSource: 'natural', maxTemp: 45, noiseTolerance: 'any' },
    pue: '1.02-1.05',
    waterUse: 'Zero consumption',
    pros: ['Lowest PUE', 'Zero water loss', 'Low maintenance'],
    cons: ['Requires natural water source', 'Environmental permits needed']
  },
  {
    id: 'dry-wet-tower',
    name: 'Dry-Wet Cooling Tower',
    icon: CloudRain,
    color: 'from-orange-500 to-yellow-500',
    requirements: { waterSource: 'municipal', maxTemp: 50, noiseTolerance: 'any' },
    pue: '1.05-1.10',
    waterUse: 'High (evaporative)',
    pros: ['Works in hot climates', 'No natural water needed', 'Flexible operation'],
    cons: ['Higher water consumption', 'More maintenance']
  },
  {
    id: 'dry-tower',
    name: 'Dry Cooling Tower',
    icon: Wind,
    color: 'from-gray-500 to-slate-500',
    requirements: { waterSource: 'none', maxTemp: 25, noiseTolerance: 'low' },
    pue: '1.02-1.04',
    waterUse: 'Zero',
    pros: ['No water needed', 'Excellent for cold climates', 'Simple operation'],
    cons: ['Only works in cold climates', 'Higher noise levels']
  },
  {
    id: 'dry-curtain',
    name: 'Dry Tower + Water Curtain',
    icon: Droplets,
    color: 'from-teal-500 to-blue-500',
    requirements: { waterSource: 'limited', maxTemp: 40, noiseTolerance: 'any' },
    pue: '1.03-1.06',
    waterUse: 'Low (seasonal)',
    pros: ['Balanced approach', 'Works in variable climates', 'Water backup for peaks'],
    cons: ['More complex system', 'Seasonal water use']
  }
];

const CoolingMethodRecommender = () => {
  const [avgTemperature, setAvgTemperature] = useState(25);
  const [waterAvailability, setWaterAvailability] = useState<WaterAvailability>('municipal');
  const [noiseSensitivity, setNoiseSensitivity] = useState<NoiseSensitivity>('medium');

  const recommendations = useMemo(() => {
    return coolingMethods.map(method => {
      let score = 0;
      let reasons: string[] = [];
      let warnings: string[] = [];

      // Temperature scoring
      if (avgTemperature <= method.requirements.maxTemp) {
        score += 30;
        reasons.push(`Suitable for ${avgTemperature}°C climate`);
      } else {
        score -= 20;
        warnings.push(`Temperature exceeds optimal range (${method.requirements.maxTemp}°C max)`);
      }

      // Water availability scoring
      const waterMap: Record<WaterAvailability, string[]> = {
        natural: ['plate-exchanger', 'dry-wet-tower', 'dry-curtain', 'dry-tower'],
        municipal: ['dry-wet-tower', 'dry-curtain', 'dry-tower'],
        limited: ['dry-curtain', 'dry-tower'],
        none: ['dry-tower']
      };

      if (waterMap[waterAvailability].includes(method.id)) {
        score += 40;
        reasons.push('Compatible with available water source');
      } else {
        score -= 30;
        warnings.push('Requires different water source');
      }

      // Special bonuses
      if (method.id === 'plate-exchanger' && waterAvailability === 'natural') {
        score += 20;
        reasons.push('Optimal choice for natural water sources');
      }

      if (method.id === 'dry-tower' && avgTemperature < 20) {
        score += 20;
        reasons.push('Excellent for cold climate operation');
      }

      if (avgTemperature > 35 && method.id === 'dry-wet-tower') {
        score += 15;
        reasons.push('Best for hot climate performance');
      }

      // Noise considerations
      if (noiseSensitivity === 'high' && method.id === 'dry-tower') {
        score -= 15;
        warnings.push('Higher noise levels may be a concern');
      }

      return {
        ...method,
        score: Math.max(0, Math.min(100, score)),
        reasons,
        warnings
      };
    }).sort((a, b) => b.score - a.score);
  }, [avgTemperature, waterAvailability, noiseSensitivity]);

  const topRecommendation = recommendations[0];

  return (
    <Card className="border-border overflow-hidden">
      <CardContent className="p-0">
        <div className="bg-gradient-to-r from-cyan-600 to-blue-600 p-6 text-white">
          <div className="flex items-center gap-3 mb-2">
            <ThermometerSun className="w-6 h-6" />
            <h3 className="text-xl font-bold">Cooling Method Recommender</h3>
          </div>
          <p className="text-white/80 text-sm">
            Answer a few questions to find the best cooling method for your site
          </p>
        </div>

        <div className="p-6 space-y-6">
          {/* Temperature Input */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Average Ambient Temperature: {avgTemperature}°C
            </label>
            <Slider
              value={[avgTemperature]}
              onValueChange={([value]) => setAvgTemperature(value)}
              min={-10}
              max={50}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>-10°C (Cold)</span>
              <span>50°C (Hot)</span>
            </div>
          </div>

          {/* Water Availability */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-3">
              Water Source Availability
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {[
                { value: 'natural', label: 'Natural (River/Lake)', icon: Waves },
                { value: 'municipal', label: 'Municipal/Well', icon: Droplets },
                { value: 'limited', label: 'Limited Supply', icon: CloudRain },
                { value: 'none', label: 'No Water', icon: Wind }
              ].map(option => (
                <Button
                  key={option.value}
                  variant={waterAvailability === option.value ? 'default' : 'outline'}
                  onClick={() => setWaterAvailability(option.value as WaterAvailability)}
                  className={`h-auto py-3 flex flex-col items-center gap-2 ${
                    waterAvailability === option.value ? 'bg-cyan-600 hover:bg-cyan-700' : ''
                  }`}
                >
                  <option.icon className="w-5 h-5" />
                  <span className="text-xs text-center">{option.label}</span>
                </Button>
              ))}
            </div>
          </div>

          {/* Noise Sensitivity */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-3">
              Site Noise Sensitivity
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { value: 'low', label: 'Low (Industrial)' },
                { value: 'medium', label: 'Medium (Rural)' },
                { value: 'high', label: 'High (Residential nearby)' }
              ].map(option => (
                <Button
                  key={option.value}
                  variant={noiseSensitivity === option.value ? 'default' : 'outline'}
                  onClick={() => setNoiseSensitivity(option.value as NoiseSensitivity)}
                  className={noiseSensitivity === option.value ? 'bg-cyan-600 hover:bg-cyan-700' : ''}
                >
                  {option.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Recommendations */}
          <div className="pt-4 border-t border-border">
            <h4 className="font-semibold text-foreground mb-4">Recommended Cooling Methods</h4>
            
            {/* Top Recommendation */}
            <div className={`p-4 rounded-xl bg-gradient-to-r ${topRecommendation.color} text-white mb-4`}>
              <div className="flex items-center gap-3 mb-3">
                <topRecommendation.icon className="w-8 h-8" />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-lg">{topRecommendation.name}</span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-white/20">
                      Best Match
                    </span>
                  </div>
                  <span className="text-sm opacity-80">PUE: {topRecommendation.pue}</span>
                </div>
                <div className="ml-auto text-right">
                  <div className="text-3xl font-bold">{topRecommendation.score}%</div>
                  <div className="text-xs opacity-80">Match Score</div>
                </div>
              </div>
              
              <div className="grid md:grid-cols-2 gap-3">
                <div className="space-y-1">
                  {topRecommendation.reasons.map((reason, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 flex-shrink-0" />
                      {reason}
                    </div>
                  ))}
                </div>
                {topRecommendation.warnings.length > 0 && (
                  <div className="space-y-1">
                    {topRecommendation.warnings.map((warning, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm text-white/80">
                        <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                        {warning}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Other Options */}
            <div className="space-y-2">
              {recommendations.slice(1).map(method => {
                const Icon = method.icon;
                return (
                  <div 
                    key={method.id}
                    className="p-3 rounded-lg bg-muted/50 flex items-center gap-3"
                  >
                    <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${method.color} flex items-center justify-center`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <span className="font-medium text-foreground">{method.name}</span>
                      <span className="text-sm text-muted-foreground ml-2">PUE: {method.pue}</span>
                    </div>
                    <div className={`text-lg font-bold ${
                      method.score >= 50 ? 'text-green-600' : 
                      method.score >= 25 ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {method.score}%
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CoolingMethodRecommender;
