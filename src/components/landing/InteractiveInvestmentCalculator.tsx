import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Calculator, DollarSign } from 'lucide-react';

export const InteractiveInvestmentCalculator = () => {
  const [investmentAmount, setInvestmentAmount] = useState([100000]);
  const [timeHorizon, setTimeHorizon] = useState([5]);
  const [animatedReturns, setAnimatedReturns] = useState(0);
  const [animatedMOIC, setAnimatedMOIC] = useState(0);

  const targetMOIC = 2.25;
  const projectedReturns = investmentAmount[0] * targetMOIC;
  const totalProfit = projectedReturns - investmentAmount[0];
  const annualizedReturn = Math.pow(targetMOIC, 1/timeHorizon[0]) - 1;

  useEffect(() => {
    const duration = 1000;
    const steps = 50;
    const stepDuration = duration / steps;
    
    let currentStep = 0;
    const interval = setInterval(() => {
      const progress = currentStep / steps;
      const easeOut = 1 - Math.pow(1 - progress, 3);
      
      setAnimatedReturns(projectedReturns * easeOut);
      setAnimatedMOIC(targetMOIC * easeOut);
      
      currentStep++;
      if (currentStep > steps) {
        clearInterval(interval);
      }
    }, stepDuration);

    return () => clearInterval(interval);
  }, [investmentAmount, timeHorizon, projectedReturns]);

  return (
    <Card className="bg-white backdrop-blur-sm border border-gray-200 hover:border-watt-trust/30 transition-all duration-300 group shadow-institutional">
      <CardHeader className="pb-4">
        <div className="flex items-center space-x-2 mb-2">
          <Calculator className="w-6 h-6 text-watt-trust group-hover:scale-110 transition-transform duration-300" />
          <CardTitle className="text-watt-navy text-xl">Investment Calculator</CardTitle>
          <Badge className="bg-watt-trust/20 text-watt-trust text-xs border-watt-trust/30">Interactive</Badge>
        </div>
        <p className="text-watt-navy/70 text-sm">Calculate your potential returns with WattByte Fund I</p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-watt-navy font-medium">Investment Amount</span>
            <span className="text-watt-trust font-bold">${investmentAmount[0].toLocaleString()}</span>
          </div>
          <Slider
            value={investmentAmount}
            onValueChange={setInvestmentAmount}
            max={5000000}
            min={50000}
            step={25000}
            className="w-full [&_[role=slider]]:border-watt-trust [&_[role=slider]]:bg-white [&_.bg-primary]:bg-watt-trust"
          />
          <div className="flex justify-between text-xs text-watt-navy/60">
            <span>$50K</span>
            <span>$5M</span>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-watt-navy font-medium">Investment Period</span>
            <span className="text-watt-bitcoin font-bold">{timeHorizon[0]} years</span>
          </div>
          <Slider
            value={timeHorizon}
            onValueChange={setTimeHorizon}
            max={10}
            min={3}
            step={1}
            className="w-full [&_[role=slider]]:border-watt-bitcoin [&_[role=slider]]:bg-white [&_.bg-primary]:bg-watt-bitcoin"
          />
          <div className="flex justify-between text-xs text-watt-navy/60">
            <span>3 years</span>
            <span>10 years</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-gray-200">
          <div className="bg-watt-light rounded-lg p-4 hover:bg-watt-light/70 transition-colors duration-200 border border-gray-200 hover:border-watt-success/30">
            <div className="flex items-center space-x-2 mb-2">
              <TrendingUp className="w-4 h-4 text-watt-success" />
              <span className="text-watt-navy/70 text-sm">Projected Returns</span>
            </div>
            <div className="text-2xl font-bold text-watt-success">
              ${Math.round(animatedReturns).toLocaleString()}
            </div>
            <div className="text-xs text-watt-navy/60 mt-1">
              +${Math.round(animatedReturns - investmentAmount[0]).toLocaleString()} profit
            </div>
          </div>
          
          <div className="bg-watt-light rounded-lg p-4 hover:bg-watt-light/70 transition-colors duration-200 border border-gray-200 hover:border-watt-bitcoin/30">
            <div className="flex items-center space-x-2 mb-2">
              <DollarSign className="w-4 h-4 text-watt-bitcoin" />
              <span className="text-watt-navy/70 text-sm">MOIC Multiple</span>
            </div>
            <div className="text-2xl font-bold text-watt-bitcoin">
              {animatedMOIC.toFixed(2)}x
            </div>
            <div className="text-xs text-watt-navy/60 mt-1">
              {(annualizedReturn * 100).toFixed(1)}% annual return
            </div>
          </div>
        </div>

        <div className="text-xs text-watt-navy/60 pt-3 border-t border-gray-200">
          * Projections based on 2.0-2.5x target MOIC. Past performance does not guarantee future results.
        </div>
      </CardContent>
    </Card>
  );
};
