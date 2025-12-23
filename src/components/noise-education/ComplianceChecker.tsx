import { useState } from 'react';
import { Shield, CheckCircle, AlertTriangle, XCircle, Sun, Moon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

interface Standard {
  name: string;
  dayLimit: number;
  nightLimit: number;
  description: string;
}

const standards: Standard[] = [
  { name: 'WHO Guidelines', dayLimit: 55, nightLimit: 45, description: 'World Health Organization residential' },
  { name: 'Alberta AUC Rule 012', dayLimit: 50, nightLimit: 40, description: 'Alberta Utilities Commission' },
  { name: 'EPA Residential', dayLimit: 55, nightLimit: 45, description: 'US EPA noise criteria' },
  { name: 'Industrial Zone', dayLimit: 70, nightLimit: 60, description: 'Typical industrial zoning' },
];

const ComplianceChecker = () => {
  const [sourceDb, setSourceDb] = useState(82);
  const [distance, setDistance] = useState(500);
  const [timeOfDay, setTimeOfDay] = useState<'day' | 'night'>('day');

  // Calculate noise at receptor using inverse square law
  const calculateNoise = () => {
    const distanceAttenuation = 20 * Math.log10(distance);
    return Math.max(0, sourceDb - distanceAttenuation);
  };

  const noiseAtReceptor = calculateNoise();

  const getComplianceStatus = (standard: Standard) => {
    const limit = timeOfDay === 'day' ? standard.dayLimit : standard.nightLimit;
    const margin = limit - noiseAtReceptor;
    
    if (margin >= 10) return { status: 'excellent', icon: CheckCircle, color: 'text-watt-success', bgColor: 'bg-watt-success/10' };
    if (margin >= 0) return { status: 'compliant', icon: CheckCircle, color: 'text-watt-coinbase', bgColor: 'bg-watt-coinbase/10' };
    if (margin >= -5) return { status: 'marginal', icon: AlertTriangle, color: 'text-amber-500', bgColor: 'bg-amber-500/10' };
    return { status: 'exceeded', icon: XCircle, color: 'text-red-500', bgColor: 'bg-red-500/10' };
  };

  return (
    <Card className="bg-white border-none shadow-institutional">
      <CardContent className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-watt-blue/10 rounded-lg flex items-center justify-center">
            <Shield className="h-5 w-5 text-watt-blue" />
          </div>
          <div>
            <h3 className="font-bold text-watt-navy">Compliance Checker</h3>
            <p className="text-sm text-watt-navy/60">Check if your facility meets noise standards</p>
          </div>
        </div>

        {/* Input Controls */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div>
            <Label className="text-sm font-medium text-watt-navy mb-2 block">
              Source Level (dB)
            </Label>
            <div className="flex items-center gap-3">
              <Slider
                value={[sourceDb]}
                onValueChange={(v) => setSourceDb(v[0])}
                min={60}
                max={110}
                step={1}
                className="flex-1"
              />
              <Input
                type="number"
                value={sourceDb}
                onChange={(e) => setSourceDb(Number(e.target.value))}
                className="w-20 text-center"
              />
            </div>
          </div>

          <div>
            <Label className="text-sm font-medium text-watt-navy mb-2 block">
              Distance to Receptor (m)
            </Label>
            <div className="flex items-center gap-3">
              <Slider
                value={[distance]}
                onValueChange={(v) => setDistance(v[0])}
                min={10}
                max={3000}
                step={10}
                className="flex-1"
              />
              <Input
                type="number"
                value={distance}
                onChange={(e) => setDistance(Number(e.target.value))}
                className="w-20 text-center"
              />
            </div>
          </div>

          <div>
            <Label className="text-sm font-medium text-watt-navy mb-2 block">
              Time Period
            </Label>
            <RadioGroup
              value={timeOfDay}
              onValueChange={(v) => setTimeOfDay(v as 'day' | 'night')}
              className="flex gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="day" id="day" />
                <Label htmlFor="day" className="flex items-center gap-1 cursor-pointer">
                  <Sun className="h-4 w-4 text-amber-500" />
                  Day
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="night" id="night" />
                <Label htmlFor="night" className="flex items-center gap-1 cursor-pointer">
                  <Moon className="h-4 w-4 text-indigo-500" />
                  Night
                </Label>
              </div>
            </RadioGroup>
          </div>
        </div>

        {/* Result Display */}
        <div className="bg-watt-navy rounded-xl p-6 mb-6">
          <div className="text-center">
            <p className="text-white/60 text-sm mb-1">Estimated Noise at Receptor</p>
            <p className="text-5xl font-bold text-watt-bitcoin font-mono">
              {noiseAtReceptor.toFixed(1)} <span className="text-2xl">dB</span>
            </p>
            <p className="text-white/50 text-xs mt-2">
              Distance attenuation: -{(20 * Math.log10(distance)).toFixed(1)} dB
            </p>
          </div>
        </div>

        {/* Compliance Results */}
        <div className="space-y-3">
          <p className="text-sm font-medium text-watt-navy">Compliance Status by Standard:</p>
          {standards.map((standard, idx) => {
            const compliance = getComplianceStatus(standard);
            const Icon = compliance.icon;
            const limit = timeOfDay === 'day' ? standard.dayLimit : standard.nightLimit;
            const margin = limit - noiseAtReceptor;

            return (
              <div
                key={idx}
                className={`flex items-center justify-between p-3 rounded-lg ${compliance.bgColor}`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`h-5 w-5 ${compliance.color}`} />
                  <div>
                    <p className="font-medium text-watt-navy text-sm">{standard.name}</p>
                    <p className="text-xs text-watt-navy/50">{standard.description}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-mono text-watt-navy">
                    Limit: {limit} dB
                  </p>
                  <p className={`text-xs font-mono ${compliance.color}`}>
                    {margin >= 0 ? `${margin.toFixed(1)} dB margin` : `${Math.abs(margin).toFixed(1)} dB over`}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-6 p-4 bg-watt-light rounded-lg">
          <p className="text-xs text-watt-navy/60">
            <strong>Note:</strong> This calculator uses simplified inverse-square law attenuation. 
            Actual noise levels may vary due to atmospheric conditions, barriers, ground absorption, 
            and directivity factors. Always conduct professional measurements for compliance verification.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default ComplianceChecker;
